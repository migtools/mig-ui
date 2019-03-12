const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
// const paths = require("./paths");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "9000";

const config = {
  entry: {
    app: "./src/index.tsx"
  },
  output: {
    path: __dirname + "../dist",
    filename: "[name].bundle.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader"
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[name].[ext]",
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
    open: true
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "src/assets/index.html",
      title: "MIG UI",
      inject: "body"
    }),
    new ExtractTextPlugin({
      filename: "[name].[contenthash].css"
    })
  ]
};

module.exports = config;
