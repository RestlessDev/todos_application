// webpack.config.js

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ErstwhileCompiler = require('./framework/static/ErstwhileCompiler')

module.exports = {
  entry: './build/App.js',
  module: {
    rules: [
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] }
    ]
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    devMiddleware: {
      writeToDisk: true,
      publicPath: '/',
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
  },
  plugins: [
    // new HtmlWebpackPlugin(),
    /*
    {
      apply: (compiler) => {
          compiler.hooks.compile.tap("erstwhile_compile", () => {
            ErstwhileCompiler.buildWorkingDirectory();
          });
      },
    },
    */
  ],
  mode: 'development'
}