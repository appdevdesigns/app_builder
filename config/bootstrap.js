/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var path = require('path');
var AD = require('ad-utils');
module.exports = function (cb) {

    AD.module.bootstrap(__dirname, cb);
    AppBuilder.buildDirectory.init();		// start the build directory re creation

    // create a listner for when our entries are approved
    AppBuilder.approval.init();

};