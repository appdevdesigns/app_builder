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
var fs = require('fs');
var async = require('async');


module.exports = function (cb) {

    AD.module.bootstrap(__dirname, (err) => {

    	if (err) {
    		cb(err);
    		return;
    	}

    	// let's verify some setup items are in place:
       	async.series([

    		// verify .well-known directory exists:
    		verifyWellKnownDir,
    		verifyWellKnownConfigs,

// NOTE: remove this when we no longer manually add the SDC app info:
addSDCAppInfo

    	], (err,data) => {
    		cb(err);
    	})
    	
    });
    // AppBuilder.buildDirectory.init();		// start the build directory re creation

};


function verifyWellKnownDir(next) {

	var pathDir = path.join(process.cwd(), 'assets', '.well-known');  // path is from sails root
    fs.lstat(pathDir, function(err, stat) {

    	if (err) {
    		fs.mkdirSync(pathDir);
    	}
    	next();
    });

}



function verifyWellKnownConfigs(next) {

	var CWD = process.cwd();

	// The deeplink config files:
	var defaultConfigContents = [
		{ file: 'assetlinks.json', content:'[]' },
		{ file:'apple-app-site-association', content:'{"applinks":{"apps":[],"details":[]}}' }
	]
	function processConfig(list, done) {
		if (list.length == 0) {
			done();
		} else {

			var config = list.shift();
			var filePath = path.join(CWD, 'assets', '.well-known', config.file );  // path is from sails root
			fs.lstat(filePath, function(err, stat) {

				function makeIt() {
					sails.log.warn('AppBuilder: ' + filePath.replace(CWD, '')+' not found: creating');
					fs.writeFileSync(filePath, config.content, 'utf8');
					processConfig(list, done);
				}

				if (err) {
					makeIt();
				} else {
					if (stat.isFile()) {
						processConfig(list, done);
					} else {
						makeIt();
					}
				}
			})
		}
	}
	processConfig(defaultConfigContents, next);
    
}


function addSDCAppInfo(next) {

	var CWD = process.cwd();

	// get all MobileApps
	AppBuilder.mobileApps()
	.then((list)=>{

		// Find the SDC app
		var SDC = list.filter((f)=>{ return f.id == 'SDC.id'; })[0];
		if (!SDC) next();


		// update Android data
		var filePath = path.join(CWD, 'assets', '.well-known', 'assetlinks.json' );
		var contents = fs.readFileSync(filePath, 'utf8');
		var jsonContents = JSON.parse(contents);
		var deepLinkInfo = SDC.deepLinkConfig('android');
		var isThere = jsonContents.filter((c)=>{ return c.target.namespace == deepLinkInfo.target.namespace;})[0]
		if (!isThere) {
			jsonContents.push(deepLinkInfo);
			var newContents = JSON.stringify(jsonContents,null, 4);
			fs.writeFileSync(filePath, newContents, 'utf8');
		}



		// update ios data
		filePath = path.join(CWD, 'assets', '.well-known', 'apple-app-site-association' );
		contents = fs.readFileSync(filePath, 'utf8');
		jsonContents = JSON.parse(contents);
		var deepLinkInfo = SDC.deepLinkConfig('ios');
		var isThere = jsonContents.applinks.details.filter((c)=>{ return c.appID == deepLinkInfo.appID;})[0]
		if (!isThere) {
			jsonContents.applinks.details.push(deepLinkInfo);
			var newContents = JSON.stringify(jsonContents,null, 4);
			fs.writeFileSync(filePath, newContents, 'utf8');
		}
		next();
	})
	.catch(next);

}