const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const buildMode = !!process.env['PRODUCTION'] ? 'production' : 'development';
const outputFileName = `mig-ui.${buildMode}.bundle.js`;
const projectRootDir = path.resolve(__dirname, '..')

const _export = {
  entry: './src/index.tsx',
  mode: buildMode,
  output: {
    path: path.resolve(projectRootDir, 'dist'),
    filename: `js/${outputFileName}`,
    publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(projectRootDir, 'public', 'index.html'),
      filename: path.resolve(projectRootDir, 'dist', 'index.html'),
    })
  ],
  devServer: {
    contentBase: path.resolve(projectRootDir, 'dist'),
    publicPath: '/',
  },
};

if(buildMode === 'development') {
  _export.devtool = 'inline-source-map';
}

module.exports = _export;
