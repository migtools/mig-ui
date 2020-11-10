const express = require('express');
const fs = require('fs');
const dayjs = require('dayjs');
const compression = require('compression');
const { sanitizeMigMeta, getClusterAuth } = require('./oAuthHelpers');

const migMetaFile = process.env['MIGMETA_FILE'] || '/srv/migmeta.json';
const viewsDir = process.env['VIEWS_DIR'] || '/srv/views';
const staticDir = process.env['STATIC_DIR'] || '/srv/static';
const port = process.env['EXPRESS_PORT'] || 9000;

const migMetaStr = fs.readFileSync(migMetaFile, 'utf8');
const migMeta = JSON.parse(migMetaStr);
const sanitizedMigMeta = sanitizeMigMeta(migMeta);
const encodedMigMeta = Buffer.from(JSON.stringify(sanitizedMigMeta)).toString('base64');

console.log('migMetaFile: ', migMetaFile);
console.log('viewsDir: ', viewsDir);
console.log('staticDir: ', staticDir);
console.log('migMeta: ', migMeta);

const app = express();
app.use(compression());
app.engine('ejs', require('ejs').renderFile);
app.set('views', viewsDir);
app.use(express.static(staticDir));

// NOTE: Any future backend-only routes here need to also be proxied by webpack-dev-server.
//       Add them to config/webpack.dev.js in the array under devServer.proxy.context.

app.get('/login', async (req, res, next) => {
  try {
    const clusterAuth = await getClusterAuth(migMeta);
    const authorizationUri = clusterAuth.authorizeURL({
      redirect_uri: migMeta.oauth.redirectUri,
      scope: migMeta.oauth.userScope,
    });

    res.redirect(authorizationUri);
  } catch (error) {
    console.error(error);
    const params = new URLSearchParams({ error: JSON.stringify(error) });
    const uri = `/handle-login?${params.toString()}`;
    res.redirect(uri);
    next(error);
  }
});
app.get('/login/callback', async (req, res, next) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: migMeta.oauth.redirectUri,
  };
  try {
    const clusterAuth = await getClusterAuth(migMeta);
    const accessToken = await clusterAuth.getToken(options);
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
  res.render('index.ejs', { migMeta: encodedMigMeta });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
