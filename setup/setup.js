
var path = require('path');
var fs = require('fs');

var AD = require('ad-utils');



(function() {

    var localOptions = {};

    // if there is a local options.js file, use that instead
    var pathOptions = path.join(__dirname,  'options.js');
    if (fs.existsSync(pathOptions)) {
        localOptions = require(pathOptions);
    }

    if (process.env.NODE_ENV != 'production') {


    	var commands = [];

//// LEFT OFF HERE
////
// testing out our problem with loading the AppBuilder on a new install
// attempting to install these specific packages to see if they will work
// as expected.
//
// problem: .setup_install is alredy there by the time this is run the first time
// - look for a local .setup_install, not the global one.

    	// only the 1st time do we install our webpack dependencies
    	var pathInstall = path.join(__dirname, '.setup_install')
    	if ( !fs.existsSync(pathInstall)) {

// attempt to limit install so we speed things up:

    		commands.push({
	            command:'npm',
	            options:['install', 
	            	"moment",
					"babel-core@6.24.1",
					"babel-loader@6.4.1",
					"babel-polyfill@6.23.0",
					"babel-preset-es2015@6.24.1", 
					"css-loader@0.28.1", 
					"es6-promise@4.1.0",
					"extract-text-webpack-plugin@2.1.0", 
					"style-loader@0.16.1", 
					"uglifyjs-webpack-plugin@0.4.3", 
					"webpack@2.5.1"
	           ],
	           log:'<green><bold>installing:</bold> webpack dependencies </green>',
	           shouldEcho:true
	       	})

    		// commands.push({
	     //        command:'npm',
	     //        options:['install'],
	     //        log:'<green><bold>installing:</bold> webpack dependencies </green>',
	     //        shouldEcho:true
	     //   	})

	       	fs.renameSync(path.join(__dirname, '.notsetup'), path.join(__dirname, '.setup_install'));
    	}

    	// but everytime run our webpack build:
    	commands.push({ command:'npm', options:['run', 'build' ], log:'<green><bold>Building</bold> App Builder  </green>', shouldEcho:true });

		AD.spawn.series(commands)
		.fail(function(err){
		    AD.log.error('<red> appbuilder: webpack testbuild: NPM exited with an error</red>');
		    AD.log(err);
		})
		.then(function(code){

		    AD.module.setup(localOptions);
		});


    } else {

	    AD.module.setup(localOptions);
    }





})();