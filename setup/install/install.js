
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

	    // findSystemAdminRole,
	    // findOurAction,
	    // connectActionToRole,

		verifyActions,
		findRole,

function() {
console.log('... stopping here!');
process.exit(0);
},

	    associateRoleToActions,
	    createDefaultAdminArea,   	// create an admin area in the OpsPortal




	    // questions,
	    // verifyLanguages,
	    // createUser,
	    
	    // createScope,
	    // verifyActions,
	    // associateRoleToActions,
	    // createPermission,
	    // createDefaultAdminArea,   	// create an admin area in the OpsPortal
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
 * @function questions
 *
 * an async fn ask the user for our setup information.
 */
// var questions = function(done) {

// 	AD.log();
// 	AD.log('We will attempt to setup an initial admin user and permissions that');
// 	AD.log('will be allowed to administrate system wide Roles and Permissions.');
// 	AD.log();
// 	AD.log('Keep in mind:');
// 	AD.log('   <green>userid:</green>   needs to match what is returned via your');
// 	AD.log('             chosen authentication system.  So if you choose "admin" ');
// 	AD.log('             as your userid, and you are using CAS authentication, ');
// 	AD.log('             you will need to be able to login as "admin" under CAS.');
// 	AD.log()

// 	var qset =  {
//         question: QUESTION_ADMIN,
//         data: 'adminUserID',
//         def : QUESTION_ADMIN_DEFAULT,
//         then: [
//             {
//                 // cond: function(data) { return data.enableSSL; },
//                 question: QUESTION_ADMIN_PW,
//                 data: 'adminPassword',
//                 def: QUESTION_ADMIN_PW_DEFAULT,

//             },
//             {
//                 // cond: function(data) { return data.enableSSL; },
//                 question: QUESTION_ROLE,
//                 data: 'roleSystemAdmin',
//                 def: QUESTION_ROLE_DEFAULT,

//             },
//             {
//                 question: QUESTION_SCOPE,
//                 data: 'scopeName',
//                 def: QUESTION_SCOPE_DEFAULT,
//                 post: function(data) {}
//             },
//             {
//             	question: QUESTION_ENVIRONMENT,
//             	data: 'environment',
//             	def: QUESTION_ENVIRONMENT_DEFAULT,
//             	post: function(data) {
//             		data.environment = data.environment.toLowerCase();
//             		if (( data.environment == 'p') || data.environment == 'prod' || (data.environment == 'production')) {
//             			data.environment = 'prod';
//             		} else {
//             			data.environment = 'dev';
//             		}
//             	}
//             }
//         ]
//     };
//     AD.cli.questions(qset, function(err, data) {

//         if (err) {
//              done(err);
//         } else {

//         	Data.admin = data.adminUserID;
//         	Data.adminPassword = data.adminPassword;
//         	Data.role  = data.roleSystemAdmin;
//         	Data.scope = data.scopeName;
//         	Data.isProduction = (data.environment == 'prod');

//     		AD.log();

//          	done();
//          }

//     });

// }



/**
 * @function verifyLanguages
 *
 * an async fn to make sure our expected site languages are installed.
 */
// var verifyLanguages = function(done) {



// 	SiteMultilingualLanguage.find({ })
// 	.then(function(list) {
// 		if ( (!list) || (list.length < 1)) {

// 			AD.log();
// 			AD.log('There needs to be some languages defined in the system.');
// 			AD.log();
// 			AD.log('Type in a comma separated list of language definitions to create.');
// 			AD.log('Each definition should be in the format: <yellow>i18n code</yellow>:<green>utf8 label</green>');
// 			AD.log('');
// 			AD.log('    For example, if you wanted to create English, Korean, and Simplified Chinese, ');
// 			AD.log('    type: <yellow>en</yellow>:<green>English</green>,<yellow>ko</yellow>:<green>Korean</green>,<yellow>zh-hans</yellow>:<green>中文</green>');
// 			AD.log()

// 			recursiveLanguageInstall(done);

// 		} else {
// 			AD.log('<green>confirm:</green> there are languages installed in the site.');
// 			done();
// 		}
// 		return null;
// 	})
// 	.catch(function(err){

// 		if (err.code == 'ER_NO_SUCH_TABLE') {
// 			AD.log('<red>bad:</red> it appears the site tables have not been created in our default DB.');

// 			if (Data.isProduction){
// 				AD.log('<yellow>do :</yellow> be sure to properly reference the correct DB, or create the tables in this one.');
// 			} else {
// 				AD.log('<yellow>do :</yellow> you can have sails create them for you:');
// 				AD.log('<yellow>  1:</yellow> cd up/to/your/sails/directory');
// 				AD.log('<yellow>  2:</yellow> vi config/models.js');
// 				AD.log('<yellow>  3:</yellow> change migrate:<yellow>\'safe\'</yellow> to migrate:<yellow>\'alter\'</yellow>');
// 				AD.log('<yellow>  4:</yellow> exit vi');
// 				AD.log('<yellow>  5:</yellow> sails lift');
// 				AD.log('<yellow>  6:</yellow> quit sails');
// 				AD.log('<yellow>  7:</yellow> run this command again');
// 			}
// 		}
// 		return null;
// 	})
// }


// var recursiveLanguageInstall = function(done) {

// 	var qset =  {
//         question: 'what languages do you want to install :',
//         data: 'lang',
//         def : 'en:English'
//     };
//     AD.cli.questions(qset, function(err, data) {

//         if (err) {
//              done(err);
//         } else {

//         	var langs = data.lang.split(',');
//         	var numToDo = 0;
//         	var numDone = 0;
//         	langs.forEach(function(def) {


//         		var parts = def.split(':');
//         		if (parts.length == 2) {

//         			numToDo ++;

//         			var code = parts[0].trim();
//         			var label = parts[1].trim();

// // TODO: verify code doesn't already exist!

//         			SiteMultilingualLanguage.create({ language_code: code, language_label:label })
//         			.then(function() {
//         				AD.log('<green>created:</green> language reference <yellow>'+code+'</yellow> : <green>'+label+'</green>');
//         				numDone ++;
//         				if (numDone >= numToDo) {

//         					// if we did all the ones entered then we are done
//         					if (numToDo == langs.length) {
//         						done();
//         					} else {

//         						// give them a chance to re-enter a language
//         						recursiveLanguageInstall(done);
//         					}

//         				}

//         				return null;

//         			})
//         			.catch(function(err){
//         				done(err);
//         				return null;
//         			})

//         		} else {

//         			AD.log('<red>unknown:</red> I didn\'t understand entry: '+ def);
//         		}


//         	})


//         	// if none of what they entered was valid
//         	if ((langs.length > 0) && (numToDo == 0)) {
//         		AD.log('<yellow>try that again...</yellow>');
//         		recursiveLanguageInstall(done);
//         	}

//          }

//     });
// }




// /**
//  * @function createUser
//  *
//  * an async fn to create or get the desired user account.
//  */
// var createUser = function(done) {



// 	SiteUser.find({ username:Data.admin })
// 	.then(function(user){

// // AD.log('... user:', user);
// 		if (user.length == 0) {

// 			AD.log('<green>create :</green> user account: ', Data.admin);
// 			SiteUser.create({ username: Data.admin, password:Data.adminPassword })
// 			.then(function(newUser) {
// 				AdminUser = newUser;
// 				done();
// 				return null;
// 			})
// 			.catch(function(err){
// 				done(err);
// 				return null;
// 			})

// 		} else {

// 			AD.log('<yellow>found  :</yellow> existing user account: <yellow>'+ user[0].username+ ' ('+user[0].guid+')</yellow>');
// 			// AD.log();

// 			var qset = {
// 		        question: 'do you want to use this account [yes, no]:',
// 		        data: 'reuse',
// 		        def : 'no',
// 		        post: reusePostProcess,
// 		        then:[
// 		            {
// 		                cond: function(data) { return !data.reuse; },
// 		                question: QUESTION_ADMIN,
// 				        data: 'adminUserID',
// 				        def : QUESTION_ADMIN_DEFAULT,
// 		            }
// 		        ]
// 		    };
// 		    AD.cli.questions(qset, function(err, data) {

// 		    	if (err) {
// 		    		done(err);
// 		    	} else {

// 			    	if (data.reuse) {
// 			    		AdminUser = user[0];
// 			    		done();
// 			    	} else {

// 			    		Data.admin = data.adminUserID;
// 			    		createUser(done);
// 			    	}
// 			    }

// 		    })

// 		}
// 		return null;
// 	})
// }



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
 * @function createScope
 *
 * an async fn to create or get the desired scope entry.
 */
var createScope = function(done) {

	// AD.log();

	PermissionScopeTrans.find({ label:Data.scope })
	.then(function(scope){

// AD.log('... roleTrans:', roleTrans);

		if (scope.length == 0) {

			var newScopeObject = null;
			async.series([

				// create the scope object
				function(next) {
					PermissionScopeObject.find({keyModel: 'siteuser'})
					.then(function(user){
						if (user.length == 0) {
							PermissionScopeObject.createMultilingual({keyModel:'siteuser', name:'Site User'})
							.done(function(scopeObject){
									newScopeObject= scopeObject;
									next();
							})
							.fail(function(err){
									next(err);
							})
						} else {
							newScopeObject= user[0];
							next();
						}
					})
					.fail(function(err){
							next(err);
					})
				},

				// now create the scope
				function(next) {

					AD.log('<green>create :</green> creating new scope: '+Data.scope);
					var filterUI = {
						    "condition": "AND",
						    "rules": [{
						        "id": "guid",
						        "field": "guid",
						        "type": "string",
						        "input": "text",
						        "operator": "is_not_empty",
						        "value": ""
						    }],
						    "valid": "true"
						};
					PermissionScope.createMultilingual({ label: Data.scope, object: newScopeObject.id, filterUI: filterUI })
					.then(function(newScope){
						AdminScope = newScope;
						next();
						return null;
					})
					.fail(function(err){
						next(err);
						return null;
					});
				}
			], function(err, results){

					done(err);
			})


//// TODO: once we convert Scope to Multilingual:
			// var lang = Multilingual.languages.default();

			// AD.log('... creating admin role: ', Data.role);
			// Multilingual.model.create({
			// 	model: PermissionRole,
			// 	data: { role_label: Data.role, language_code: lang, role_description:"System Wide Administrator Role" }
			// })
			// .fail(function(err){
			// 	done(err);
			// })
			// .then(function(newRole) {
			// 	AdminRole = newRole;
			// 	done();
			// });

		} else {

			AD.log('<yellow>found  :</yellow> existing scope: <yellow>'+ scope[0].label+'</yellow>');


			var qset =  {
		        question: 'do you want to use this scope [yes, no]:',
		        data: 'reuse',
		        def : 'no',
		        post: reusePostProcess,
		        then:[
		            {
		                cond: function(data) { return !data.reuse; },
		                question: QUESTION_SCOPE,
		                data: 'scopeName',
		                def: QUESTION_SCOPE_DEFAULT,
		            }
		        ]
		    };
		    AD.cli.questions(qset, function(err, data) {

		    	if (err) {
		    		done(err);
		    	} else {

			    	if (data.reuse) {
			    		AdminScope = scope[0];
			    		done();
			    	} else {

			    		Data.scope  = data.scopeName;
			    		createScope(done);
			    	}
			    }

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
				key:'site-default-admin',
				icon:'fa-cogs',
				isDefault:0,
				label:'Administration'
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
