/**
 * Generate models and controllers for AppBuilder apps.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');
var _ = require('lodash');
var async = require('async');
var rimraf = require('rimraf');


module.exports = function(cb) {

    var sailsBuildPath = AppBuilder.paths.sailsBuildDir();
    var sailsDir = null;

    async.series([

        //  verify we have a directory for our build 
        function(next) {

            var parts = sailsBuildPath.replace(sails.config.appPath+path.sep, '').split(path.sep);
            sailsDir = parts.pop();

            createPath(parts, sails.config.appPath, function(err){
                if (err) {
                    ADCore.error.log('AppBuilder:buildDirectory.init:build_directory.js Unable to create our sails build directory', err);
                    next(err);
                } else {

                    next();
                }
            })

        },


        // remove existing directory if it exists:
        // YES, rebuild this thing every time the server restarts.
        // we need to capture any changes in our config / connections.
        function(next){

            rimraf(sailsBuildPath, function(err){
                next(err);
            });
        },


        function(next) {

            setupSails(sailsDir, next);

        }


    ],function(err){
        cb(err);
    })

}







//////
////// Helpers
//////

function createPath (parts, base, cb) {
    if (parts.length == 0) {
        cb();
    } else {
        var part = parts.shift();
        base = path.join(base, part);
        fs.stat(base, function(err,stat) {

            if (err && err.code === 'ENOENT') {

        // create the directory!
                sails.log.info('--- making sails build path:'+base);

                fs.mkdir(base, function(err){

                    if (err) cb(err) 
                    else createPath(parts, base, cb);
                })

            } else {

                createPath(parts, base, cb);
            }

        })
    }
}




function setupSails(sailsDir, cb) {

    sails.log.info('... setting up sails buiild directory:');

    function liveSails(file) {
        return path.join(sails.config.appPath, file);
    }
    function destSails(file) {
        return path.join(AppBuilder.paths.sailsBuildDir(), file);
    }


    async.series([

        // sails new [directory]
        function(next){
            var cwd = process.cwd();
            var sailsBuildDir = AppBuilder.paths.sailsBuildDir();
            var basePath = sailsBuildDir.split(path.sep);
            basePath.pop();
            basePath = basePath.join(path.sep);

            sails.log.info('... basePath:', basePath);
            process.chdir(basePath);

            AD.spawn.command({
                command:'sails',
                options:[ 'new',  sailsDir],
                shouldEcho:false
            })
            .fail(function(err){
                AD.log.error('<red> sails new exited with an error</red>');
                AD.log(err);
                process.chdir(cwd);
                next(err);
            })
            .then(function(code){
                process.chdir(cwd);
                next();
            });
        },


        // make sure we have a hooks directory
        function(next) {


            var sailsBuildPath = path.join(AppBuilder.paths.sailsBuildDir(), 'api', 'hooks');
            var parts = sailsBuildPath.replace(sails.config.appPath+path.sep, '').split(path.sep);

            createPath(parts, sails.config.appPath, function(err){
                next(err);
            });


        },


        // make sure sails-mysql is installed:
        function(next) {

            var cwd = process.cwd();
            var sailsBuildDir = AppBuilder.paths.sailsBuildDir();
            process.chdir(sailsBuildDir);
            AD.log('... installing sails-mysql');
            AD.spawn.command({
                command:'npm',
                options:[ 'install', 'sails-mysql'],
                // shouldEcho:false
            })
            .fail(function(err){
                process.chdir(cwd);
                next(err);
            })
            .then(function(code){
                process.chdir(cwd);
                next();
            })

        },


        // link over config files
        // config/model.js
        // config/appbuiler.js
        // api/hooks/appbuilder.js  
        function(next){

            var filesToLink = ['config/models.js', 'config/connections.js', 'api/hooks/appbuilder.js'];
            


            function linkIt(files, cb) {

                if (files.length == 0) {
                    cb();
                } else {

                    var file = files.shift();

                    async.series([
                        // remove current file if it exists:
                        function(ok) {
                            fs.unlink(destSails(file), function(err){
                                if (err) {
                                    if (err.code != 'ENOENT') {
                                        ok(err);
                                        return;
                                    }
                                }
                                ok();
                            });
                        },
                        // link to our live copy:
                        function(ok){
                            fs.symlink(liveSails(file), destSails(file), ok);
                        }
                    ], function(err, results){

                        if (err) {
sails.log.error('::: setupSails() error:', err);
                            cb(err);
                        } else {
                            linkIt(files, cb);
                        }
                    });
                    
                }
            }

            linkIt(filesToLink, next);

        },


        // add .sailsrc  to limit to only orm
        function(next) {

            var options = {
              "generators": {
                "modules": {}
              },
              "hooks": {
                    "blueprints": false,
                    "controllers": false,
                    "cors": false,
                    "csrf": false,
                    "grunt": false,
                    "http": false,
                    "i18n": false,
                    "logger": false,
                    "policies": false,
                    "pubsub": false,
                    "request": false,
                    "responses": false,
                    "session": false,
                    "sockets": false,
                    "services": false,
                    "views": false
                }
            };

            fs.unlink(destSails('.sailsrc'), function(err){
                if (err) {
                    if (err.code != 'ENOENT') {
                        next(err);
                        return;
                    }
                } 

                fs.writeFile(destSails('.sailsrc'), JSON.stringify(options, null, 4), function(err){
                    next(err);
                })

            });

        },

        // copy over config/local.js
        function(next) {

            var liveConfig = require(liveSails('config/local.js'));
            var destConfig = {};
            destConfig.environment = 'development';
            destConfig.connections = liveConfig.connections;

            var pathDestConfig = destSails(path.join('config', 'local.js'));
            fs.unlink(pathDestConfig, function(err){
                if (err) {
                    if (err.code != 'ENOENT') {
                        next(err);
                        return;
                    }
                } 

                fs.writeFile(pathDestConfig, "module.exports = " + JSON.stringify(destConfig, null, 4), function(err){
                    next(err);
                })

            });
        },


        // copy over our exit early hook
        function(next) {
            var code = [
                'module.exports = function(sails) {',
                '    return {',
                '        configure: function() {',
                '            sails.config.environment = "development";',
                '            process.env.NODE_ENV = "developement";',
                '        },',
                '        initialize: function(cb) {',
                '            sails.on("hook:orm:loaded", function() {',
                '                console.log("!!!! exitAfterORM:  can exit here:");',
                '                sails.lower(cb)',
                '            });',
                '        }',
                '    }',
                '};'
            ].join('\n');
            var pathHook = destSails(path.join('api', 'hooks', 'exitAfterORM.js'));
            fs.writeFile(pathHook, code, next);
        }

    ],function(err, results){
        cb(err);
    })

}
