const express = require('express');
const fs = require('fs');
const moment = require('moment');
const { sanitizeMigMeta, getClusterAuth } = require('./oAuthHelpers');
const cors = require('cors');

const migMetaFile = process.env['MIGMETA_FILE'] || '/srv/migmeta.json';
const viewsDir = process.env['VIEWS_DIR'] || '/srv/views';
const staticDir = process.env['STATIC_DIR'] || '/srv/static';
const port = process.env['EXPRESS_PORT'] || 9000;

var corsOptions = {
  origin: `http://localhost:${port}`,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const migMetaStr = fs.readFileSync(migMetaFile, 'utf8');
const migMeta = JSON.parse(migMetaStr);
const sanitizedMigMeta = sanitizeMigMeta(migMeta);
const encodedMigMeta = Buffer.from(JSON.stringify(sanitizedMigMeta)).toString('base64');

console.log('migMetaFile: ', migMetaFile);
console.log('viewsDir: ', viewsDir);
console.log('staticDir: ', staticDir);
console.log('migMeta: ', migMeta);

const app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('views', viewsDir);
app.use(express.static(staticDir));
app.use(cors());
1;
// NOTE: Any future backend-only routes here need to also be proxied by webpack-dev-server.
//       Add them to config/webpack.dev.js in the array under devServer.proxy.context.

// TODO do we need to handle action=refresh ? does token expiration and logout work correctly?
app.get('/login', cors(corsOptions), async (req, res, next) => {
  try {
    const clusterAuth = await getClusterAuth(migMeta);
    console.log('clusterAuth', clusterAuth);
    const uri = clusterAuth.code.getUri();
    console.log('uri', uri);
    res.redirect(uri);
  } catch (error) {
    console.error(error);
    next(error);
    // TODO redirect to /handle-login?error=... instead (move to helper function)
  }
});

app.get('/login/callback', async (req, res, next) => {
  try {
    const clusterAuth = await getClusterAuth(migMeta);
    console.log('clusterAuth in callback', clusterAuth);
    console.log(' req.originalUrl', req.originalUrl, req);
    const token = await clusterAuth.code.getToken(req.originalUrl);
    console.log('token', token);
    const currentUnixTime = moment().unix();
    const user = {
      ...token,
      login_time: currentUnixTime,
      expiry_time: currentUnixTime + token.expires_in,
    };
    console.log('Login callback: ', user);
    const params = new URLSearchParams({ user: JSON.stringify(user) });
    const uri = `/handle-login?${params.toString()}`;
    res.redirect(uri);
  } catch (error) {
    next(error);
  }
});

app.get('*', (req, res) => {
  res.render('index.ejs', { migMeta: encodedMigMeta });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
