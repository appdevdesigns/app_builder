
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


    	// build out our npm devdependencies so we have access to WebPack
    	AD.spawn.command({
           command:'npm',
           options:['install'],
           shouldEcho:true
       })
       .fail(function(err){
           AD.log.error('<red> appbuilder: webpack init: NPM init exited with an error</red>');
           AD.log(err);
       })
       .then(function(code){
           AD.module.setup(localOptions);
       });

    } else {

	    AD.module.setup(localOptions);
    }





})();