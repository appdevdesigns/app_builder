const webpack = require('webpack'); //to access built-in plugins
var path = require('path');
var APP = path.resolve(__dirname);

module.exports = {
  context: APP,
  entry: {
    OP_Bundle: APP + '/assets/opstools/AppBuilder/OP/OP.js',
    BuildApp: APP + '/assets/opstools/AppBuilder/AppBuilder.js'
  },
  output: {
    path: APP + '/assets/opstools/BuildApp',
    filename: '[name].js'
  },

  resolve: {
    alias: {
      'OP': APP + '/assets/opstools/AppBuilder/OP/OP.js'
      // it's important what kind of paths you're using (relative vs. absolute)
    }
  },
  module: {
    rules: [{
        test: /\.(js|jsx)$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),

    // *************************************************************************** //
    // This builds the OP into same bundle but automatically handles the import    //
    // *************************************************************************** //
    new webpack.ProvidePlugin({
        OP: "OP"
    })

    // ***************************************** //
    // This builds the OP into a seperate bundle //
    // ***************************************** //
    /*
    new webpack.optimize.CommonsChunkPlugin({
      name: "OP_Bundle",

      filename: "OP_Bundle.js",
      // (Give the chunk a different name)

      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    })
    */
  ]
};
