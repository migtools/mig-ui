const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
  const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ];

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'app.bundle.js',
      publicPath: '/',
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
                sourceMap: false,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
              },
            },
          ],
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
                sourceMap: false,
              },
            },
          ],
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
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css'
            ),
          ],
          use: ['style-loader', 'css-loader'],
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
    plugins: plugins,
  };
};
