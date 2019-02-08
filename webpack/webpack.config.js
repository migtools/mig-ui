const path = require('path');
const buildMode = !!process.env['PRODUCTION'] ? 'production' : 'development';
const outputFileName = `mig-ui.${buildMode}.bundle.js`

module.exports = {
  entry: './src/index.tsx',
  mode: buildMode,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFileName,
  },
  devServer: {
    contentBase: './dist',
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  }
};