const webpack = require('webpack'); //to access built-in plugins
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'assets', 'opstools', 'BuildApp', 'BuildApp_d.js'), 
  output: {
    path: path.resolve(__dirname, 'assets', 'opstools', 'BuildApp'),
    filename: 'BuildApp.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};
