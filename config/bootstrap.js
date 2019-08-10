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

var ABGraphObject = require(path.join('..', 'api', 'graphModels', 'ABObject'));


module.exports = function (cb) {

    AD.module.bootstrap(__dirname, (err) => {

    	if (err) {
    		cb(err);
    		return;
    	}


    	// verify that sails.config.appbuilder.deeplink is set:
    	if (!sails.config.appbuilder.deeplink) {
    		sails.config.appbuilder.deeplink = sails.config.appbuilder.baseURL;
    	}


    	// let's verify some setup items are in place:
       	async.series([

    		// verify .well-known directory exists:
    		verifyWellKnownDir,
    		verifyWellKnownConfigs,
			verifyDataDir,

			initialGraphDB,
			cacheABClassObjects,

			setupPollingMCC,

// NOTE: remove this when we no longer manually add the SDC app info:
addSDCAppInfo,
defaultEmailNotificationInvite,
addSDCAppDataDirectory


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


function verifyDataDir(next) {

	var pathDir = path.join(sails.config.appPath, sails.config.appbuilder.pathFiles)
    fs.lstat(pathDir, function(err, stat) {

    	if (err) {
sails.log.warn('... making default AppBuilder data directory:', pathDir);
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

function cacheABClassObjects(next) {

	ABGraphObject.find()
		.catch(next)
		.then(objects => {

			objects.forEach(obj => {

				// it will be cached here
				obj.toABClass();

			});

			next();

		});


	ABGraphQuery.find()
		.catch(next)
		.then(queries => {

			(queries || []).forEach(q => {

				// it will be cached here
				q.toABClass();

			});

			next();

		});

}

function setupPollingMCC(next) {

	// skip this step
	if (sails.config.appbuilder && 
		sails.config.appbuilder.mcc &&
		sails.config.appbuilder.mcc.enabled === false)
		return next();

	var delay = sails.config.appbuilder.mcc.pollFrequency || (1000 * 5); // every 5 sec

	var timerId = setTimeout(function request() {

// sails.log.debug(':: ABRelay.pollMCC():', delay);
		ABRelay.pollMCC()
		.then(()=>{

			// do it again:
			timerId = setTimeout(request, delay);
		})
		.catch((err)=>{
			// if (err.code == 'E_SERVER_TIMEOUT') {
			// 	delay += sails.config.appbuilder.mcc.pollFrequency;
			// }

			var errString = err.toString();

			if (err.error && (err.error.code == 'ETIMEDOUT' || (err.message && err.message.indexOf('ESOCKETTIMEDOUT') > -1) )) {
				sails.log.debug('!!! ABRelay.pollMCC().catch() : Timeout detected!')
			} else {

				if (errString.indexOf('ECONNREFUSED') > -1) {

					// Problems communicating with MCC:
					// we only want to ADCore.error.log()  once.
					if (!sails.config.appbuilder._reportedConnRefused) {
						sails.config.appbuilder._reportedConnRefused = 1;
						ADCore.error.log('!!! ABRelay.pollMCC().catch(): MCC Communication: Connection Refused. ', { errStr: errString, error:err });
					} else {
						sails.log.debug('!!! ABRelay.pollMCC().catch(): MCC Communication: Connection Refused. ')
					}
					
				} else {

					// catch other errors
					ADCore.error.log('!!! ABRelay.pollMCC().catch(): unexpected error:', { errStr: err.toString(), error:err });
				}
				
			}

			// if still ok to continue then:
			timerId = setTimeout(request, delay);
		})

	}, delay);

	next();

}



function addSDCAppInfo(next) {

	var CWD = process.cwd();

	// get all MobileApps
	AppBuilder.mobileApps()
	.then((list)=>{

		// Find the SDC app
		var SDC = list.filter((f)=>{ return f.id == 'SDC.id'; })[0];
		if (!SDC) next();


		// update Android data:  .well-known/assetlinks.json
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



		// update ios data: .well-known/apple-app-site-association
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


function defaultEmailNotificationInvite(next) {

	// Unit test: skip this step
	if (sails.config.appbuilder && 
		sails.config.appbuilder.email &&
		sails.config.appbuilder.email.enabled === false)
		return next();

	var filePath = path.join(__dirname, '..', 'setup', 'install', 'mobile_qr_invite.ejs' );
	var contents = null;  // fs.readFileSync(filePath, 'utf8');

	AppBuilder.mobileApps()
	.then((list)=>{

		function checkApp(list, cb) {
			if (list.length == 0) {
				cb();
			} else {
				var app = list.shift();
sails.log('... checking default email for app:'+ app.label);

				var Trigger = app.emailInviteTrigger();
				EmailNotifications.emailForTrigger(Trigger)
				.then((listEmails)=>{
sails.log('    ... existing emails for app:', listEmails);

					if ((!listEmails) || (listEmails.length == 0)) {

						if (!contents) {
							contents = fs.readFileSync(filePath, 'utf8');
						}

						// Add default Email template here:
						ENTemplateDesign.create({
							templateTitle:app.label+' mobile invitation ',
							templateBody: contents,
							templateType: 'One Column'
						})
						.then((template)=>{
sails.log('     ... new template created:', template);

							ENNotification.create({
								notificationTitle: app.label+'install info', // can be anything
								emailSubject: app.label+ ' app',
								fromName: app.label,
								fromEmail: 'ric@zteam.biz',
								setupType: 'System',
								eventTrigger: app.emailInviteTrigger(),
								status: 'Active',
								templateDesignId: template.id
							})
							.then((enNotification)=>{
sails.log('     ... new enNotification:', enNotification);
								checkApp(list, cb);								
							})
							.catch(cb);
						})
						.catch(cb);


						return;
					}
					checkApp(list, cb);
				})
				.catch(cb)
			}
		}
		checkApp(list, (err)=>{
			if (err) {
				next(err);
				return;
			}

			next();
		});
	})
	
}




function addSDCAppDataDirectory (next) {

	// get all MobileApps
	AppBuilder.mobileApps()
	.then((list)=>{

		// Find the SDC app
		var SDC = list.filter((f)=>{ return f.id == 'SDC.id'; })[0];
		if (!SDC) next();

		var pathFile = SDC.pathAPK();
		var parts = pathFile.split(path.sep);
		parts.pop();
		var pathMobileDir = parts.join(path.sep);

	    fs.lstat(pathMobileDir, function(err, stat) {

	    	if (err) {
sails.log.warn('... making default SDC data directory:', pathMobileDir);
	    		fs.mkdirSync(pathMobileDir);
	    	}
	    	next();
	    });

	})
	.catch(next);

}

function initialGraphDB(next) {

	ABGraphDB.initial()
		.catch(next)
		.then(() => {
			next();
		});

}