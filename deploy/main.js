const express = require('express');
const fs = require('fs');

const migMetaFile = process.env['MIGMETA_FILE'] || '/srv/migmeta.json';
const viewsDir = process.env['VIEWS_DIR'] || '/srv/views';
const staticDir = process.env['STATIC_DIR'] || '/srv/static';
const port = process.env['EXPRESS_PORT'] || 9000;

const migMetaStr = fs.readFileSync(migMetaFile, 'utf8');

console.log('migMetaFile: ', migMetaFile);
console.log('viewsDir: ', viewsDir);
console.log('staticDir: ', staticDir);
console.log('migMeta:');
console.log(migMetaStr);

const encodedMigMeta = Buffer.from(migMetaStr).toString('base64');

const app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('views', viewsDir);
app.use(express.static(staticDir));

// NOTE: Any future backend-only routes here need to also be proxied by webpack-dev-server.
//       Add them to config/webpack.dev.js in the array under devServer.proxy.context.
app.get('/hello', (req, res) => {
  // NATODO remove this /hello example once we have some real routes here
  res.send('Hello from Express!');
});

app.get('*', (req, res) => {
  res.render('index.ejs', { migMeta: encodedMigMeta });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
