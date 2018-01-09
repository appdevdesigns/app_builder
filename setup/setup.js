
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

    	//
    	// AppBuilder needs to compile it's javascript before it can load.
    	//

    	// only the 1st time (on an install) do we install our webpack dependencies
    	var pathInstall = path.join(__dirname, '.setup_install')
    	if ( !fs.existsSync(pathInstall)) {

			// attempt to limit install so we speed things up:
    		commands.push({
	            command:'npm',
	            options:['install', 
	            	"moment",
					"babel-core",
					"babel-loader",
					"babel-polyfill",
					"babel-preset-es2015", 
					"css-loader", 
					"es6-promise",
					"extract-text-webpack-plugin", 
					"style-loader", 
					"uglifyjs-webpack-plugin", 
					"webpack"
	           ],
	           log:'<green><bold>installing:</bold> webpack dependencies </green>',
	           shouldEcho:true
	       	})


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

			// then continue on with our .setup() run.
		    AD.module.setup(localOptions);
		});


    } else {

	    AD.module.setup(localOptions);
    }





})();