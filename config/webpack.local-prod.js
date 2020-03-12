const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const localConfigFileName = 'config.dev.json';

const htmlWebpackPluginOpt = {
  template: `public/index.dev.html`,
  title: 'MIG UI',
  inject: 'body',
  favicon: 'public/favicon.ico',
};

const configPath = path.join(__dirname, localConfigFileName);
if (!fs.existsSync(configPath)) {
  console.error('ERROR: config/config.dev.json is missing');
  console.error(
    'Copy config/config.dev.json.example to config/config.dev.json' +
    ' and optionally configure your dev settings. A valid clusterUrl is ' +
    ' required for start:remote.'
  );
  process.exit(1);
}

const localConfig = require(configPath);
const startRemoteClientSecret = 'bWlncmF0aW9ucy5vcGVuc2hpZnQuaW8K';
const migMeta = require('./mig_meta')(localConfig.clusterApi);
migMeta.oauth = {
  clientId: localConfig.oauthClientId,
  redirectUri: localConfig.redirectUri,
  userScope: localConfig.userScope,
  clientSecret: startRemoteClientSecret,
};
migMeta.namespace = localConfig.namespace;
migMeta.configNamespace = localConfig.configNamespace;
migMeta.discoveryApi = localConfig.discoveryApi;

htmlWebpackPluginOpt.migMeta = Buffer.from(JSON.stringify(migMeta)).toString('base64');

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'app.bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        include: [
          // path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../node_modules/'),
          path.resolve(__dirname, '../node_modules/patternfly'),
          path.resolve(__dirname, '../node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css')
        ],
        use: ["style-loader", "css-loader"]
      },

      {
        test: /\.(svg|ttf|eot|woff|woff2|png|jpg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(htmlWebpackPluginOpt),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
};

module.exports = config;
