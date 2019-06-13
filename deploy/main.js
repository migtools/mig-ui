const express = require('express');
const fs = require('fs');

const migMetaFile = process.env['MIGMETA_FILE'] || '/srv/migmeta.json';
const viewsDir = process.env['VIEWS_DIR'] || '/srv/views';
const staticDir = process.env['STATIC_DIR'] || '/srv/static';
const migMetaStr = fs.readFileSync(migMetaFile, 'utf8')

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
const port = 9000;

app.get('*', (req, res) => {
  res.render('index.ejs', { migMeta: encodedMigMeta });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
