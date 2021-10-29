const express = require('express');
const fs = require('fs');
const dayjs = require('dayjs');
const compression = require('compression');
const HttpsProxyAgent = require('https-proxy-agent');
const { AuthorizationCode } = require('simple-oauth2');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const { URL } = require('url');

let cachedOAuthMeta = null;

const migMetaFile = process.env['MIGMETA_FILE'] || '/srv/migmeta.json';
const viewsDir = process.env['VIEWS_DIR'] || '/srv/views';
const staticDir = process.env['STATIC_DIR'] || '/srv/static';
const port = process.env['EXPRESS_PORT'] || 9000;

const brandType = process.env['BRAND_TYPE'];

const migMetaStr = fs.readFileSync(migMetaFile, 'utf8');
const migMeta = JSON.parse(migMetaStr);

const sanitizeMigMeta = (migMeta) => {
  const oauthCopy = { ...migMeta.oauth };
  delete oauthCopy.clientSecret;
  return { ...migMeta, oauth: oauthCopy };
};

const sanitizedMigMeta = sanitizeMigMeta(migMeta);

const encodedMigMeta = Buffer.from(JSON.stringify(sanitizedMigMeta)).toString('base64');
const isDevelopmentMode = process.env['NODE_ENV'] === 'dev';

const discoverySvcUrl = isDevelopmentMode ? migMeta.discoveryApi : process.env['DISCOVERY_SVC_URL'];
const clusterSvcUrl = isDevelopmentMode ? migMeta.clusterApi : process.env['CLUSTER_API_URL'];

/** reverse proxy middleware configuration
 *
 */

let clusterApiProxyOptions = {
  target: clusterSvcUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/cluster-api/': '/',
  },
  logLevel: process.env.DEBUG ? 'debug' : 'info',
  secure: false,
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Content-Security-Policy'] = 'sandbox';
    proxyRes.headers['X-Content-Security-Policy'] = 'sandbox';
  },
};

let discoveryApiProxyOptions = {
  target: discoverySvcUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/discovery-api/': '/',
  },
  logLevel: process.env.DEBUG ? 'debug' : 'info',
  secure: false,
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Content-Security-Policy'] = 'sandbox';
    proxyRes.headers['X-Content-Security-Policy'] = 'sandbox';
  },
};

if (process.env['NODE_ENV'] === 'development') {
  clusterApiProxyOptions = {
    ...clusterApiProxyOptions,
  };

  discoveryApiProxyOptions = {
    ...discoveryApiProxyOptions,
  };
}

const clusterApiProxy = createProxyMiddleware(clusterApiProxyOptions);
const discoveryApiProxy = createProxyMiddleware(discoveryApiProxyOptions);

console.log('migMetaFile: ', migMetaFile);
console.log('viewsDir: ', viewsDir);
console.log('staticDir: ', staticDir);
console.log('migMeta: ', migMeta);

const app = express();
app.use(compression());
app.engine('ejs', require('ejs').renderFile);
app.set('views', viewsDir);
app.use(express.static(staticDir));
app.use('/cluster-api/', clusterApiProxy);
app.use('/discovery-api/', discoveryApiProxy);

// NOTE: Any future backend-only routes here need to also be proxied by webpack dev server (Now `webpack serve` as of webpack version 5).
//       Add them to config/webpack.dev.js in the array under devServer.proxy.context.

app.get('/login', async (req, res, next) => {
  try {
    const clusterAuth = await getClusterAuth();
    const authorizationUri = clusterAuth.authorizeURL({
      redirect_uri: migMeta.oauth.redirectUri,
      scope: migMeta.oauth.userScope,
    });

    res.redirect(authorizationUri);
  } catch (error) {
    console.error(error);
    if (error.response.statusText === 'Service Unavailable' || error.response.status === 503) {
      res.status(503).send(error.response.data);
    } else {
      const params = new URLSearchParams({ error: JSON.stringify(error) });
      const uri = `/handle-login?${params.toString()}`;
      res.redirect(uri);
      next(error);
    }
  }
});
app.get('/login/callback', async (req, res, next) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: migMeta.oauth.redirectUri,
  };
  try {
    const clusterAuth = await getClusterAuth();
    const proxyString = process.env['HTTPS_PROXY'] || process.env['HTTP_PROXY'];
    let httpOptions = {};
    if (proxyString && !tokenEndpointMatchesNoProxy(cachedOAuthMeta?.token_endpoint)) {
      httpOptions = {
        agent: new HttpsProxyAgent(proxyString),
      };
    }

    // If your authorization_endpoint or token_endpoint values retrieved from oauthMeta are listed in the NO_PROXY variable & a proxy is present,
    // you may experience issues.
    // Example endpoint values:
    // "authorization_endpoint": "https://oauth-openshift.apps.cam-tgt-25871.qe.devcluster.openshift.com/oauth/authorize",
    // "token_endpoint": "https://oauth-openshift.apps.cam-tgt-25871.qe.devcluster.openshift.com/oauth/token",
    const accessToken = await clusterAuth.getToken(options, httpOptions);
    const currentUnixTime = dayjs().unix();
    const user = {
      ...accessToken.token,
      login_time: currentUnixTime,
      expiry_time: currentUnixTime + accessToken.token.expires_in,
    };
    const params = new URLSearchParams({ user: JSON.stringify(user) });
    const uri = `/handle-login?${params.toString()}`;
    res.redirect(uri);
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

app.get('*', (req, res) => {
  res.render('index.ejs', { migMeta: encodedMigMeta, brandType });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

//Helpers
const getOAuthMeta = async () => {
  if (cachedOAuthMeta) {
    return cachedOAuthMeta;
  }
  const oAuthMetaUrl = `${clusterSvcUrl}/.well-known/oauth-authorization-server`;

  const res = await axios.get(oAuthMetaUrl);
  cachedOAuthMeta = res.data;
  return cachedOAuthMeta;
};

const getClusterAuth = async () => {
  const oAuthMeta = await getOAuthMeta();
  return new AuthorizationCode({
    client: {
      id: migMeta.oauth.clientId,
      secret: migMeta.oauth.clientSecret,
    },
    auth: {
      tokenHost: oAuthMeta.token_endpoint,
      authorizePath: oAuthMeta.authorization_endpoint,
    },
  });
};

const noProxyDomains = (process.env.no_proxy || process.env.NO_PROXY || '')
  .split(',')
  .map((domain) => domain.trim())
  .filter((domain) => !!domain);

function tokenEndpointMatchesNoProxy(url) {
  const { hostname, host } = parseUrl(url);
  // If invalid url, just return true
  if (!host || !hostname) {
    return true;
  }
  return noProxyDomains.some((domain) => host.endsWith(domain) || hostname.endsWith(domain));
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (err) {
    return new URL('');
  }
}
