// webpack.config.js

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: './App.js',
  module: {
    rules: [
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    {
      apply: (compiler) => {
          compiler.hooks.compile.tap("erstwhile_compile", () => {
              console.log("This code is executed before the compilation begins.");
          });
      },
    }
  ],
  mode: 'development'
}