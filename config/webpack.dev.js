const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Dotenv = require('dotenv-webpack');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const HOST = process.env.HOST || 'localhost';

const localConfigFileName = 'config.dev.json';

// Two dev modes: local | remote
// local - auto authenticates as a fake user and uses a local
// json mock server as its host cluster. Intended for pure
// UI development without the need for e2e functionality
// remote - expects the user to provide a remote.config.json
// that contains an object with coordinates to a remote cluster
const devMode = process.env.DEVMODE || 'local';
if (devMode !== 'local' && devMode !== 'remote') {
  console.error(`Illegal DEVMODE: ${devMode}, must be 'local' or 'remote'`);
  process.exit(1);
}

const htmlWebpackPluginOpt = {
  template: `src/assets/index.${devMode}.html`,
  title: 'MIG UI',
  inject: 'body'
};

const configPath = path.join(__dirname, localConfigFileName);
if(!fs.existsSync(configPath)) {
  console.error('ERROR: config/config.dev.json is missing')
  console.error(
    'Copy config/config.dev.json.example to config/config.dev.json' +
    ' and optionally configure your dev settings. A valid clusterUrl is ' +
    ' required for start:remote.')
  process.exit(1)
}

const localConfig = require(configPath);
const migMeta = require('./mig_meta')(localConfig.clusterUrl);
migMeta.oauth.clientId = localConfig.oauthClientId;
migMeta.oauth.clientSecret = localConfig.oauthClientSecret;
htmlWebpackPluginOpt.migMeta = migMeta

const PORT = process.env.PORT || localConfig.devServerPort

const webpackConfig = {
  entry: {
    app: './src/index.tsx'
  },
  node: {
    fs: 'empty'
  },
  output: {
    path: __dirname + '../dist',
    filename: '[name].bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'eval-cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]',
            // Limit at 50k. larger files emited into separate files
            limit: 5000
          }
        }
      }
    ]
  },
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: false
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin(htmlWebpackPluginOpt),
    new ForkTsCheckerWebpackPlugin()
    new ExtractTextPlugin({
      filename: "[name].[contenthash].css"
    })
  ]
};

module.exports = webpackConfig;
