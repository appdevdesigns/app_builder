const webpack = require('webpack'); //to access built-in plugins
var path = require('path');

module.exports = {
  entry: {
    OP_Bundle: path.resolve(__dirname, 'assets', 'opstools', 'AppBuilder', 'OP', 'OP.js'),
    BuildApp: path.resolve(__dirname, 'assets', 'opstools', 'AppBuilder', 'AppBuilder.js')
  },
  output: {
    path: path.resolve(__dirname, 'assets', 'opstools', 'BuildApp'),
    filename: '[name].js'
  },

  // entry: path.resolve(__dirname, 'assets', 'opstools', 'AppBuilder', 'AppBuilder.js'),
  // output: {
  //   path: path.resolve(__dirname, 'assets', 'opstools', 'BuildApp'),
  //   filename: 'BuildApp.js'
  // },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin()
  ]
};
