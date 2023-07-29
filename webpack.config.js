// webpack.config.js

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const {ErstwhileCompiler} = require('erstwhile')

module.exports = {
  entry: './build/bootstrap.js',
  target: 'web',
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
    historyApiFallback: {
      index: 'index.html'
    }
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    extensions: [".js"],
    alias: {process: "process/browser"},
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
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