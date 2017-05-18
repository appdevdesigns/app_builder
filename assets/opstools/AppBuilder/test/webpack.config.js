const webpack = require('webpack'); //to access built-in plugins
var path = require('path');
var APP = path.resolve(__dirname);

module.exports = {
  context: APP,
  entry: {
    testAppBuilder: APP + '/test_app_builder.js'
  },
  output: {
    path: APP + '/bin',
    filename: 'test_app_builder.js'
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
    // new webpack.optimize.UglifyJsPlugin({
    //     compress: {
    //         warnings: true
    //     },
    //     sourceMap: true,
    // }),
    // new webpack.LoaderOptionsPlugin({
    //     minimize: false  // true
    // })
  ]
};
