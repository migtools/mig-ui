const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const buildMode = !!process.env['PRODUCTION'] ? 'production' : 'development';
const outputFileName = `mig-ui.${buildMode}.bundle.js`;
const projectRootDir = path.resolve(__dirname, '..')

module.exports = {
  entry: './src/index.tsx',
  mode: buildMode,
  output: {
    path: path.resolve(projectRootDir, 'dist'),
    filename: outputFileName,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'MIG UI'
    })
  ],
  devServer: {
    contentBase: './dist',
  },
};