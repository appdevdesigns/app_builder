const webpack = require('webpack'); //to access built-in plugins
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'assets', 'opstools', 'AppBuilder', 'AppBuilder.js'),
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
    rules: [{
        test: /\.(js|jsx)$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [{
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin()
  ]
};
