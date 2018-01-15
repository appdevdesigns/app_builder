
var path = require('path');
var fs = require('fs');

var AD = require('ad-utils');
var async = require('async');


var sailsOBJ;	// the running sails instance


var CONST_SETUP_FILE = '.app_builder_setup_install';

var QUESTION_ADMIN = "enter the name of the admin userid:";
var QUESTION_ADMIN_DEFAULT = "admin";

var QUESTION_ADMIN_PW = "enter the password for the admin:";
var QUESTION_ADMIN_PW_DEFAULT = "admin";

var QUESTION_ROLE = "enter the name of the System Admin Role:";
var QUESTION_ROLE_DEFAULT = "System Admin";

var QUESTION_SCOPE = "enter the name for the scope of all users:";
var QUESTION_SCOPE_DEFAULT = "All Users";

var QUESTION_ENVIRONMENT = "is this a production environment or local development [prod, dev]:";
var QUESTION_ENVIRONMENT_DEFAULT = "prod";


var Data = {};	// contains all our configuration info

var AdminUser  = null;	// the Admin User account;
var AdminRole  = null;	// the Admin Role account;
var AdminScope = null;	// the Admin Scope account;
var ActionKeys = null;  // the Action keys we are interested in.



var Main = function() {

	async.series([
		properStartDir,
		noRepeats,
	    loadSails,
		verifyActions,
		findRole,
		associateRoleToActions,
		createDefaultAdminArea,   	// create an admin area in the OpsPortal
	    markComplete
//// TODO: insert system version in system DB table

	], function(err, results) {

		function finishUp() {

			if (err) {
//// TODO: clean up any newly created Entries: User, Role, Scope, Permissions!
				process.exit(1);
			} else {
				AD.log();
				AD.log();
				process.exit(0);
			}
		}

		if (sailsOBJ) {

			sailsOBJ.lower(function(e2){
				finishUp();
			});
		} else {

			finishUp();
		}

	});
}




/**
 * @function loadSails
 *
 * an async fn to load the sails environment so our sails models are available.
 */
var loadSails = function(done) {

	var origDir = process.cwd();

	AD.log('... loading sails <yellow>(please wait)</yellow>');
	AD.test.sails.load()
    .fail(function(err){
        AD.log.error('error loading sails: ', err);
        done(err);
    })
    .then(function(obj) {
        sailsOBJ = obj;
        process.chdir(origDir);
        done();
    });
}



/**
 * @function noRepeats
 *
 * an async fn to make sure we have not run this before.
 */
var noRepeats = function(done) {


	fs.readFile(CONST_SETUP_FILE, function(err, data){

		if (err) {
// AD.log('... no repeats ok');
			// this is good, that means no file is here:
			done();
		} else {
			// not good.  We only want to do this 1x
			AD.log();
			AD.log('<yellow>WARN:</yellow> This install routine is only intended to be run once.');
			AD.log('      If you need to make change to the roles and permissions, do that within ');
			AD.log('      the framework.');
			AD.log();

			var err = new Error('No Repeats.');
			done(err);
		}
	})
}



/**
 * @function properStartDir
 *
 * an async fn to move us to the expected start directory.
 */
var properStartDir = function(done) {

	var currDir = process.cwd();

	// move us up to Sails/  so the sails-disk adapter can properly save
	// the data to the correct .tmp/appdev_default.js file

	var gotThere = AD.util.fs.moveToDirUP({ assets: 1, api:1, setup:0 });
	if (gotThere) {
// AD.log('... proper start dir:'+ process.cwd() );
		done();
	} else {
		var err = new Error('not able to move to proper start directory.');
		done(err);
	}

}



/**
 * @function findRole
 *
 * an async fn to get the System Admin Role entry.
 */
var findRole = function(done) {

	// AD.log();

	PermissionRoleTrans.find({ role_label:'System Admin' })
	.then(function(roleTrans){

// AD.log('... roleTrans:', roleTrans);

		if (roleTrans.length == 0) {

			var lang = Multilingual.languages.default();

			AD.log('<green>create :</green> admin role: ', Data.role);
			Multilingual.model.create({
				model: PermissionRole,
				data: { role_label: Data.role, language_code: lang, role_description:"System Wide Administrator Role" }
			})
			.fail(function(err){
				done(err);
			})
			.then(function(newRole) {

				// now get this newRole populated
				AdminRole = newRole;
				done();
			});

		} else {

			AD.log('<yellow>found  :</yellow> existing role: <yellow>'+ roleTrans[0].role_label+' ('+roleTrans[0].role_description+')</yellow>');

    		PermissionRole.find({id: roleTrans[0].role})
    		.populate('actions')
    		.then(function( pRole ){
    			AdminRole = pRole[0];
    			done();
    			return null;
    		})
    		.catch(function(err){
    			done(err);
    			return null;
    		})


		}
		return null;
	})
}



/**
 * @function verifyActions
 *
 * an async fn to make sure our expected permission actions are installed.
 */
var verifyActions = function(done) {

	// these are the default
	var actionKeys = [ ];

	// make sure all our default OpsPortal action permissions are assigned to our Admin user:
	var defaultOpsActions = require(path.join(__dirname, '..', 'permissions', 'actions.js'))
	if (defaultOpsActions) {
		defaultOpsActions.actions.forEach(function(action){
			actionKeys.push(action.action_key);
		})
	}


	PermissionAction.find({ action_key: actionKeys })
	.then(function(actions) {
		if (actions.length < actionKeys.length) {

			for (var i = actions.length - 1; i >= 0; i--) {
				var a = actions[i];
				var indx = actionKeys.indexOf(a.action_key);
				actionKeys.splice(indx,1);
			};

			actionKeys.forEach(function(key){
				AD.log('<red>missing:</red> verifyActions(): could not find action key: <yellow>'+key+' </yellow>')
			})

			AD.log();
			AD.log('<yellow>Before you run this script, make sure you run:</yellow>');
			AD.log('    <green>npm install appdevdesigns/app_builder</green>');
			AD.log()

			var err = new Error('missing action keys.');
			done(err);
		} else {
			AD.log('<green>confirm:</green> expected action keys are in place.');
			ActionKeys = actions;
			done();
		}
		return null;
	})
}



/**
 * @function associateRoleToActions
 *
 * an async fn to associate each permission actions to our admin role.
 */
var associateRoleToActions = function(done) {

	if (ActionKeys.length == 0) {
		AD.log('<yellow>warn:</yellow> no action keys to link to role.  that doesn\'t sound right.');
		done();
	} else {
// AD.log('... associate Role To Actions')
		ActionKeys.forEach(function(action){
			AdminRole.actions.add(action);
		})

		AdminRole.save()
		.then(function(newRole){
			AD.log('<green>linked :</green> action keys to role');
			done();
			return null;
		})
		.catch(function(err){

			AD.log('<yellow>linked :</yellow> action keys already linked to role');
			done();	// <--- not actually a reason to stop the process.
			return null;
		})

	}

}



/**
 * @function createPermission
 *
 * an async fn to create the permission entry for our Admin User
 */
var createPermission = function(done) {

// AD.log('... create Permission')
	Permission.create({

		user: AdminUser.id,
		role: AdminRole.id,
		enabled:true
	})
	.then(function(perm){

		perm.scope.add(AdminScope);
		perm.save()
		.then(function(newPerm){
			AD.log('<green>created:</green> permission assignment for admin user + role + scope');
			done();
			return null;
		})
		.catch(function(err){
			done(err);
			return null;
		})
		return null;

	})
	.catch(function(err){
		done(err);
		return null;
	})

}


	////
	//// Extra Utility Fn() for the createDefaultAdminArea() step.
	////

	function linkToAdminSpace (def, toolInstance, done) {

		var defaultArea = def.__defaultArea;
// console.log('... '+def.key+': defaultArea to Link to:', defaultArea);

		var isFound = false;
		toolInstance.areas.forEach(function(area){
			if (area.id == defaultArea.id) {
				isFound = true;
			}
		});

		// if instance is already found to be connected to the defaultArea:
		if (isFound) {
// console.log('... '+def.key+': looks like toolInstance already linked to defaultArea');
			// we're done.
			done();

		} else {

			toolInstance.areas.add(defaultArea);
			toolInstance.save(function(err, nti){
				if (err) {
					done(err);
				} else {
// console.log('... '+def.key+': linked toolInstance to defaultArea');
					done();
				}
			})
		}
	}



	function verifyInstanceActions(def, toolInstance, done) {

		var actionsToAdd = [];

		// figure out which actions are currently in the toolInstance
		var currentActionHash = {};
		toolInstance.permissions.forEach(function(action){
			currentActionHash[action.action_key] = action;
		});
// console.log('... '+def.key+': currentActionHash:', currentActionHash);
		// figure out which actions in our definition we are missing
		var desiredActions = def.permissions.split(',');
		desiredActions.forEach(function(dA){
			dA = dA.trim();
			if (!currentActionHash[dA]) {
				actionsToAdd.push(dA);
			}
		})

// console.log('... '+def.key+': actions to add:', actionsToAdd);
		if (actionsToAdd.length == 0) {
// console.log('... '+def.key+': nothing to add,  --> linkToAdminSpace');
			// nothing to add, so continue on
			linkToAdminSpace(def, toolInstance, done);
		} else {

			// Gather all those action instnaces
			PermissionAction.find({action_key:actionsToAdd})
			.exec(function(err, foundActions){
				if (err) {
					done(err);
				} else {

					if (foundActions.length == 0) {

// console.log('... '+def.key+': wanted to add these permission actions:', actionsToAdd);
// console.log('... '+def.key+':    -> but did not find them in the PermissionAction model!');

						// nothing to add, so continue on
						linkToAdminSpace(def, toolInstance, done);

					} else {


						// now add each of those actions to our toolInstance
						foundActions.forEach(function(fA){
							toolInstance.permissions.add(fA);
						})

						// and save it.
						toolInstance.save(function(err, newToolInstance){
							if (err) {
								done(err);
							} else {
// console.log('... '+def.key+': foundActions added:', foundActions);
								// move on to linking the toolInstance to the AdminSpace
								linkToAdminSpace(def, toolInstance, done);
							}
						})
					}
				}
			})
		}
	}


	function createToolInstance( def, defInstance, done) {

		var condition = { controller:defInstance.controller }; // OPConfigTool is now multilingual.
		// var condition = { label: defInstance.label, context:defInstance.context,  controller:defInstance.controller};

// console.log('... '+def.key+': condition to search for toolInstances:', condition);
// console.log();

		OPConfigTool.find(condition)
		.populateAll()
		.exec(function(err, tools) {

			if (err) {
// console.log('... '+def.key+': ERROR: finding existing toolInstances :', err);
				done(err);
			} else {

// console.log('... '+def.key+': tools found matching our example:', tools);

				if ((tools) && (tools.length > 0)) {
// console.log('... '+def.key+': toolInstance already matches our def:', tools);
// console.log('... '+def.key+': moving to verifyInstanceActions');
					// instance exists
					verifyInstanceActions(def, tools[0], done);
				} else {

					var fields = ['key', 'icon', 'isDefault', 'label', 'controller', 'isController', 'options'];
					var data = {};
					fields.forEach(function(field) {
						data[field] = defInstance[field];
					});
// console.log('... '+def.key+': data to create new toolInstance :', data);
					OPConfigTool.createMultilingual(data)
					.fail(function(err){
						done(err);
					})
					.then(function(tool){
						verifyInstanceActions(def, tool, done);
					})
// 					.exec(function(err, tool){
// 						if (err) {
// // console.log('... '+def.key+': ERROR: creating toolInstance :', err);
// 							done(err);
// 						} else {
// // console.log('... '+def.key+': toolInstance created:', tool);
// 							verifyInstanceActions(def, tool, done);
// 						}
// 					});
				}
			}
		})
	}


	var createToolDef = function(def, done) {

		OPConfigToolDefinition.create(def)
		.exec(function(err, tool) {

			if (err) {
// console.log('... '+def.key+': ERROR: creating new toolDef :', err);
				done(err);
			} else {
// console.log('... '+def.key+': created new toolDef :', tool);

				createToolInstance(def, tool, done);

			}
		});

	}


/**
 * @function createDefaultAdminArea
 *
 * Setup the default OpsPortal Areas for an Administrator.
 *
 */
var createDefaultAdminArea = function(done) {

// AD.log('... createDefaultAdminArea:');

	var hashPermissions = {};		// hash of action.key : {action obj}
	var hashDefinitions = {};		// hash of toolDefinition.key : {Tool Definition obj}
	var defaultArea 	= null;		// the Admin OpsPortal Area
	var tooldefs 		= null;		// all tools defined by the OpsPortal

	async.series([

		// load all the current Action Permissions:
		function(next){

			PermissionAction.find()
			.then(function(actions){
				actions.forEach(function(action){
					hashPermissions[action.action_key] = action;
				})
// AD.log('... hashPermissions:', hashPermissions);

				next();
				return null;
			})
			.catch(function(err){
				next(err);
				return null;
			})
		},


		// load all the current ToolDefinitions:
		function(next){

			OPConfigToolDefinition.find()
			.then(function(definitions){
				definitions.forEach(function(definition){
					hashDefinitions[definition.key] = definition;
				})
// AD.log('... hashDefinitions:', hashDefinitions);

				next();
			})
			.catch(function(err){
				next(err);
			})
		},


		// create the Admin Space:
		function(next) {
			var adminSpace = {
				key:'site-default-appbuilder',
				icon:'fa-edit',
				isDefault:0,
				label:'AppBuilder'
			}

			OPConfigArea.find({key: adminSpace.key})
			.populateAll()
			.exec(function(err, area){

				if (err){
					next(err);
				} else {

					if ((area) && (area.length > 0)) {
// AD.log('::::: area:', area);
						defaultArea = area[0];
// AD.log('... found defaultArea:', defaultArea);
						next();

					} else {

						OPConfigArea.createMultilingual(adminSpace)
						.fail(function(err){
							next(err);
						})
						.then(function(area){
							defaultArea = area;
							next();
						})
// 						OPConfigArea.create(adminSpace)
// 						.exec(function(err, area){
// 							if (err){
// 								next(err);
// 							} else {
// // AD.log('::::: area:', area);
// 								defaultArea = area;
// // AD.log('... created defaultArea:', defaultArea);
// 								next();
// 							}
// 						})

					}
				}
			})

		},


		// load in the opsportal tooldefs
		function(next) {
			var pathDefs = path.join(__dirname, '..', 'opstools','opstools.js');
			toolDefs = require(pathDefs);
// AD.log('... toolDefs: ', toolDefs);

			next();
		},


		// for each toolDef
		function(next){


			var numDone = 0;
			var onDone = function(err){
				if (err) {
					next(err);
				} else {
					numDone ++;
					if (numDone >= toolDefs.length) {
						next();
					}
				}
			}



			// Process:
			// for each tool definition:
			// 		createToolDef -> createToolInstance -> verifyInstanceActions -> linkToAdminSpace -> onDone
			toolDefs.forEach(function(def){

				//// NOTE:  because I created these external fn() to handle each step,
				////        I now have to send in the defaultArea
				////
				def.__defaultArea = defaultArea;

				// if already created
				if (hashDefinitions[def.key]) {
// console.log('... '+def.key+': already has definition -> jump to createToolInstance');
					// jump to createToolInstance
					createToolInstance(def, hashDefinitions[def.key], onDone);

				} else {

					// create tool
					createToolDef(def, onDone);
				}

			});
		}

	], function(err, results){
		done(err);
	});

}


/**
 * @function markComplete
 *
 * an async fn to mark that we have run this routine before.
 */
var markComplete = function(done) {
// AD.log('... mark complete')
// AD.log('... cwd:'+process.cwd() )

	fs.writeFile(CONST_SETUP_FILE, 'done', function (err) {
		if (err) {
			AD.log('<red>error  :</red> unable to write '+CONST_SETUP_FILE+' file.');
			done(err);
		} else {
			AD.log('<green>marked :</green> complete.');
			done();
		}
	});
}




// Now run our Main();
Main();
