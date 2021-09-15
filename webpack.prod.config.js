const webpack = require("webpack");
let webpackConfig = require("app_builder/webpack.config");

webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: true,
    sourceMap: false
}));

webpackConfig.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true
}));

module.exports = webpackConfig;
