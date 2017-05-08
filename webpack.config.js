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
  module: {
    rules: [{
        test: /\.(js|jsx)$/, loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  devtool: "source-map",
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: true
        },
        sourceMap: true
    }),
    new webpack.LoaderOptionsPlugin({
        minimize: true
    })
  ]
};
