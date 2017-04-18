/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__multilingual__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__model__ = __webpack_require__(3);

/**
 * @class AD_Client
 * @parent index 4
 *
 * ###Client side global OpsPortal (OP) namespace.
 *
 * This file defines standard functions and calls for OpsPortal
 * objects on the client side.
 */

// Create our OP  Namespace only if it hasn't been created already

//// TODO: how to disable 'use strict'?  or perform this check without an error
//// in 'use strict' ?

// if (!window.OP) {




    window.OP = {};


    // OP.xxxx      These properties hold the defined Class/Controller/Model definitions
    //              for our loaded projects.
    // OP.UI = {};    		// webix UI definitions
    // OP.Logic = {}; 		// logic references for webix application
    OP.Component = {};  // our defined components




	// OP.UI.extend = function(key, definition) {
	// 	OP.UI[key] = definition;
	// }

	OP.Component.extend = function(key, fn) {
		OP.Component[key] = function(App){

//// TODO: verify App has proper structure:
			if (!App) {

				App = {

					uuid: webix.uid(),

					/*
					 * actions:
					 * a hash of exposed application methods that are shared among our 
					 * components, so one component can invoke an action that updates 
					 * another component.
					 */
					actions:{
						
					},

					/*
					 * unique()
					 * A function that returns a globally unique Key.
					 * @param {string} key   The key to modify and return.
					 * @return {string} 
					 */
					unique: function(key) { return key+this.uuid; },

					/*
					 * labels
					 * a collection of labels that are common for the Application.
					 */
					labels:{
				
					}

				}
			}

			// make an instance of the component.
			var component = fn(App);

			// transfer to App, any actions in the component:
			if (component.actions){
				for(var a in component.actions) {
					App.actions[a] = component.actions[a];
				}
			}

			return component;
		};
	}


	
	OP.Dialog = AD.op.Dialog;


	OP.Multilingual = __WEBPACK_IMPORTED_MODULE_0__multilingual__["a" /* default */];
	OP.Model = __WEBPACK_IMPORTED_MODULE_1__model__["a" /* default */];
	

	/* harmony default export */ __webpack_exports__["a"] = OP;
// }


// import "./model.js"

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_ABApplication__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_ABApplication___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__data_ABApplication__);





var _AllApplications = [];

class ABApplication {

    constructor(attributes) {
    	this.id    = attributes.id;

    	this.json = attributes.json;

    	this.name  = attributes.name || this.json.name || "";

    	// multilingual fields: label, description
    	__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.translate(this, this.json, ABApplication.fieldsMultilingual());

	  	this.role  = attributes.role;

	  	// instance keeps a link to our Model for .save() and .destroy();
	  	this.Model = __WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Model.get('opstools.BuildApp.ABApplication');
	  	this.Model.Models(ABApplication);
  	}

  	///
  	/// Static Methods
  	///
	static allApplications() {
		return new Promise( 
			(resolve, reject) => {

				var ModelApplication = __WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll()
					.then(function(data){
						
						_AllApplications = data;

						resolve(data);
					})
					.catch(reject);

			}
		)

	}


	static create(values) {
		return new Promise(
			function(resolve, reject) {

				var newApp = {}
				__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.unTranslate(values, newApp, ABApplication.fieldsMultilingual());
				values.json = newApp;
				newApp.name = values.name;

				var ModelApplication = __WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.create(values)
				.then(function(app){

					// return an instance of ABApplication
					var App = new ABApplication(app);

					_AllApplications.add(App,0);
					resolve(App);
				})
				.catch(reject)
			}
		)
	}


	/**
	 * @method fieldsMultilingual()
	 *
	 * return an array of fields that are considered Multilingual labels
	 * 
	 * @return {array} 
	 */
	static fieldsMultilingual() {
		return ['label', 'description'];
	} 


//// TODO: 
//// Refactor isValid() to ignore op and not error if duplicateName is own .id

	static isValid(op, values) {

			var errors = [];

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:
				var matchingApps = _AllApplications._toArray().filter(function (app) { 
					return app.name.trim().toLowerCase() == values.label.trim().replace(/ /g, '_').toLowerCase(); 
				})
				if (matchingApps && matchingApps.length > 0) {
					
					errors.push({
						name:'label',
						mlKey:'duplicateName',
						defaultText: '**Name must be Unique.'
					})
				}

			}


			// Check the common validations:
// TODO:
// if (!inputValidator.validate(values.label)) {
// 	_logic.buttonSaveEnable();
// 	return false;
// }


			return errors;
	} 



	///
	/// Instance Methods
	///


	destroy () {
		if (this.id) {
			return this.Model.destroy(this.id)
				.then(()=>{
					_AllApplications.remove(this.id);
				});
		}
	}

	save () {

		var values = this.toObj();

		// we already have an .id, so this must be an UPDATE
		if (values.id) {

			return this.Model.update(values.id, values)
					.then(() => {
						_AllApplications.updateItem(values.id, this);
					});
				
		} else {

			// must be a CREATE:
			return this.Model.create(values)
					.then((data) => {
						this.id = data.id;
						_AllApplications.add(this, 0);
					});
		}
	
	}



	assignPermissions (permItems) {
		return new Promise(
			(resolve, reject) => {
				AD.comm.service.put({
					url: '/app_builder/' + this.id + '/role/assign',
					data: {
						roles: permItems
					}
				})
				.fail(reject)
				.done(resolve);
			}
		)
	}

	// Permissions
	getPermissions () {

		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.get({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}

	createPermission () {
		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.post({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}

	deletePermission () {
		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.delete({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}


	toObj () {

		__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());
		this.json.name = this.name;

		// for each Object: compile to json

		return {
			id:this.id,
			name:this.name,
			json:this.json,
			role:this.role
		}



	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ABApplication;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose__ = __webpack_require__(5);

/*
 * AB 
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */




// import './ab_work'

OP.Component.extend('ab', function(App) {


	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	
	// setup the common labels for our AppBuilder Application.
	App.labels.common = {
		"import": L('ab.common.import', "*Import"),
		edit: 	  L('ab.common.edit', "*Edit"),
		save: 	  L('ab.common.save', "*Save"),
		"delete": L('ab.common.delete', "*Delete"),
		"export": L('ab.common.export', "*Export"),
		ok: 	  L('ab.common.ok', "*Ok"),
		cancel:   L('ab.common.cancel', "*Cancel"),
		yes: 	  L('ab.common.yes', "*Yes"),
		no: 	  L('ab.common.no', "*No"),

		createErrorMessage:   L('ab.common.create.error', "*System could not create <b>{0}</b>."),
		createSuccessMessage: L('ab.common.create.success', "*<b>{0}</b> is created."),

		updateErrorMessage:  L('ab.common.update.error', "*System could not update <b>{0}</b>."),
		updateSucessMessage: L('ab.common.update.success', "*<b>{0}</b> is updated."),

		deleteErrorMessage:   L('ab.common.delete.error', "*System could not delete <b>{0}</b>."),
		deleteSuccessMessage: L('ab.common.delete.success', "*<b>{0}</b> is deleted."),
	}
		


	var ids = {
		appbuilder:App.unique('buld_app_loading_screen')
	}


//// LEFT OFF HERE:
//// OP.Error.isValidation() to handle validation errors returned from Sails
//// Debug AppList -> AppForm transitions
//// reduce App.labels.common ->  App.labels
//// Implement AppWorkspace


	// Define the external components used in this Component:
	var AppChooser = OP.Component['ab_choose'](App);
	// var AppWorkspace = OP.Component['ab_work'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		id: ids.appbuilder,
		container:'ab-main-container',
		autoheight:true,
		autowidth:true,
		rows:[
			AppChooser.ui,
			// AppWorkspace.ui
		]
	};



	// This component's Logic definition:
	var _logic = {

		init: function() {

			AppChooser.init();
			// AppWorkspace.init();

			$$(ids.appbuilder).adjust();
		}
		
	}


	// Expose any globally accessible Actions:
	var _actions = {

		// transition to the Appbuilder workspace with given App
		transitionWorkspace:function(App){
console.error('TODO: transitionWorkspace()');			
			
		},

		transitionApplicationChooser:function() {
console.error('TODO: transitionApplicationChooser()');		
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_logic.init,		// {fn} 	init() to setup this component  
		actions:_actions		// {ob}		hash of fn() to expose so other components can access.
	}

});

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


var _restURLs = {
	findAll: 'GET #url#',
	findOne: 'GET #url#/{id}',
	create:  'POST #url#',
	update:  'PUT #url#/{id}',
	destroy: 'DELETE #url#/{id}',
}


var _Models = {};


class OPModel {

	constructor(key, staticData, instanceData) {

		this.key = key;
		this.staticData = staticData;
		this.instanceData = instanceData;
		this.Model = staticData.Model;

		this.url = {};
		for(var r in _restURLs) {
			this.url[r] = staticData[r]
		}

	}

	Models(Model) {
		this.Model = Model;
	}

	findAll(cond ) {
		return new Promise( 
			(resolve, reject) => {

// NOTE: currently reusing AD.Model

				// var Model = AD.Model.get(this.key);
				// Model.findAll(cond)

				var service = this.service('findAll');

				AD.comm.service[service.verb]({ url:service.url, params: cond })
				.fail(reject)
				.done((data) => {

					data = data.data || data;

					// our findAll() should return an array of items.
					if (!Array.isArray(data)) {
						data = [data];
					}


					// return instances of this.Model if provided:
					if (this.Model) {
						var newList = []; // Model.List();
						data.forEach((l) => {
							if (l) {
								newList.push( new this.Model(l) );
							}
						})

						data = newList;
					}


					// convert to a WebixDataCollection:
					var dc = new webix.DataCollection({
						data: data,

						on: {
							onAfterDelete: function(id) {

							}
						}
					});


					dc._toArray = function() {
						var data = [];
						var id = this.getFirstId();
						while(id) {
							data.push(this.getItem(id));
							id = this.getNextId(id);
						}
						return data;
					}



					resolve(dc);

				});
			}
		);
	}

	findOne(cond) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('findOne');

				var nURI = service.url;
                for (var k in cond) {
                    var oURI = nURI;
                    nURI = AD.util.string.replaceAll(nURI, "{" + k + "}", cond[k]);

                    // if there was a change, remove k from cond:
                    if (oURI != nURI) {
                        delete cond[k];
                    }
                }
                service.url = nURI;

				AD.comm.service[service.verb]({ url:service.url, params: cond })
				.fail(reject)
				.done(function(item){
					if (item.translate) item.translate();

					resolve(item.attr?item.attr():item);
				});
			}
		);
	}

	create(attr) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('create');

				AD.comm.service[service.verb]({ url:service.url, params: attr })
				.fail(reject)
				.done(function(item){
					if (item.translate) item.translate();

					resolve(item.attr?item.attr():item);
				});
			}
		);
	}

	update(id, attr) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('update', id);

				AD.comm.service[service.verb]({ url:service.url, params: attr })
				.fail(reject)
				.done(resolve);
			}
		);
	}

	destroy(id) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('destroy', id);

				AD.comm.service[service.verb]({ url:service.url, params: {} })
				.fail(reject)
				.done(resolve);
			}
		);
	}


	service(key, id) {
		var parts = this.url[key].split(' ');
		var verb = parts[0].toLowerCase();
		var uri = parts.pop(); 

		if (id) {
			var key = '{id}';
	        uri = AD.util.string.replaceAll(uri, key, id);
	    }

        return {
        	verb:verb,
        	url:uri
        }
	}
}


/* harmony default export */ __webpack_exports__["a"] = {

	extend:function(key, staticData, instance) {


		//
		// Create the AD.Model from this definition
		//

		if (staticData.restURL) {
			for (var u in _restURLs) {
				staticData[u] = _restURLs[u].replace('#url#', staticData.restURL);
			}
			
		}

		// var alreadyThere = AD.Model.get(key);
		// if (!alreadyThere) {

		// 	AD.Model.Base.extend(key, staticData, instance);
		// 	AD.Model.extend(key, staticData, instance);
		// }
		
		//
		// Now create our OP.Model:
		//
		var curr = nameSpace(_Models, key);
		var modelName = objectName(key);

		curr[modelName] = new OPModel(key, staticData, instance);

	},

	get: function(key) {
		return findObject(_Models, key);
	}
};








            /*
             * @function findObject
             *
             * Return the object specified by the given name space:
             *
             * @param {object} baseObj  The base object to search on
             *                          usually AD.models or AD.models_base
             *
             * @param {string} name   The provided namespace to parse and search for
             *                        The name can be spaced using '.' 
             *                        eg.  'coolTool.Resource1' => AD.models.coolTool.Resource1
             *                             'coolerApp.tool1.Resource1' => AD.models.coolerApp.tool1.Resource1
             *
             * @returns {object}  the object resolved by the namespaced base 
             *                    eg:  findObject(AD.models, 'Resource') => return AD.models.Resource
             *                         findObject(AD.models, 'coolTool.Resource1') => AD.models.coolTool.Resource1
             *
             *                    if an object is not found, null is returned.
             */
            var findObject = function (baseObj, name) {

                // first lets figure out our namespacing:
                var nameList = name.split('.');

                // for each remaining name segments, make sure we have a 
                // namespace container for it:
                var curr = baseObj;
                nameList.forEach(function (name) {

                    if (curr == null) {
                        var whoops = true;
                        console.error('! current name segment is null.  Check your given name to make sure it is properly given: ', name);
                    }
                    if (curr) {
                        if (typeof curr[name] == 'undefined') {
                            curr = null;
                        }
                        if (curr) curr = curr[name];
                    }
                })

                return curr;
            }



            /*
             * @function objectName
             *
             * parse the name and return the name of the object we will create.
             *
             * @param {string} name   The provided namespace to parse 
             *                        The name can be spaced using '.' 
             *
             * @returns {string}  the name of the model object 
             *                    eg:  objectName('Resource') => return 'Resource'
             *                         objectName('coolTool.Resource1') => 'Resource1'
             */
            var objectName = function (name) {

                // first lets figure out our namespacing:
                var nameList = name.split('.');
                var objName = nameList.pop(); // remove the last one.

                return objName;
            }



            /*
             * @function nameSpace
             *
             * Make sure the proper name space is created on the given base.
             *
             * @param {object} baseObj  The base object to create the namespace on
             *                          usually AD.models or AD.models_base
             *
             * @param {string} name   The provided namespace to parse and create
             *                        The name can be spaced using '.' 
             *                        eg.  'coolTool.Resource1' => AD.models.coolTool.Resource1
             *                             'coolerApp.tool1.Resource1' => AD.models.coolerApp.tool1.Resource1
             *
             * @returns {object}  the object that represents the namespaced base 
             *                    that the Model is to be created on.
             *                    eg:  nameSpace(AD.models, 'Resource') => return AD.models
             *                         nameSpace(AD.models, 'coolTool.Resource1') => AD.models.coolTool
             */
            var nameSpace = function (baseObj, name) {

                // first lets figure out our namespacing:
                var nameList = name.split('.');
                var controlName = nameList.pop(); // remove the last one.

                // for each remaining name segments, make sure we have a 
                // namespace container for it:
                var curr = baseObj;
                nameList.forEach(function (name) {

                    if (typeof curr[name] == 'undefined') {
                        curr[name] = {};
                    }
                    curr = curr[name];
                })

                return curr;
            }

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
 * OP.Multilingual
 *
 * A set of helpers for Multilingual Data.
 *
 */

/* harmony default export */ __webpack_exports__["a"] = {

	/**
	 * @function OP.Multilingual.translate
	 *
	 * Given a set of json data, pull out any multilingual translations
	 * and flatten those values to the base object.
	 *
	 * @param {obj} obj  The instance of the object being translated
	 * @param {json} json The json data being used for translation.
	 *						There should be json.translations = [ {transEntry}, ...]
	 *						where transEntry = {
	 *							language_code:'en',
	 *							field1:'value',
	 *							...
	 *						}
	 * @param {array} fields an Array of multilingual fields to pull to 
	 *						 the obj[field] value.
	 *
	 */
	translate:function(obj, json, fields) {

		if (!json.translations) {
			json.translations = [];
		}

		var currLanguage = AD.lang.currentLanguage || 'en';

		if (fields && fields.length > 0) {

			json.translations.forEach(function(t){
				// find the translation for the current language code
				if (t.language_code == currLanguage) {

					// copy each field to the root object
					fields.forEach(function(f){
						obj[f] = t[f] || '';  // default to '' if not found. 
					})
				}
			})


		}
	},


	/**
	 * @function OP.Multilingual.unTranslate
	 *
	 * Take the multilingual information in the base obj, and push that 
	 * down into the json.translations data.
	 *
	 * @param {obj} obj  The instance of the object with the translation
	 * @param {json} json The json data being used for translation.
	 *						There should be json.translations = [ {transEntry}, ...]
	 *						where transEntry = {
	 *							language_code:'en',
	 *							field1:'value',
	 *							...
	 *						}
	 * @param {array} fields an Array of multilingual fields to pull from 
	 *						 the obj[field] value.
	 *
	 */
	unTranslate: function( obj, json, fields) {

		json = json || {};
		fields = fields || [];

		if (!json.translations) {
			json.translations = [];
		}

		var currLanguage = AD.lang.currentLanguage || 'en';


		if (fields && fields.length > 0) {

			var foundOne = false;

			json.translations.forEach(function(t){
				// find the translation for the current language code
				if (t.language_code == currLanguage) {

					// copy each field to the root object
					fields.forEach(function(f){
						t[f] = obj[f];
					})

					foundOne = true;
				}
			})

			// if we didn't update an existing translation
			if (!foundOne) {

				// create a translation entry:
	            var trans = {};

	            // assume current languageCode:
	            trans.language_code = currLanguage;

	            fields.forEach(function (field) {
	                if (obj[field] != null) {
	                    trans[field] = obj[field];
	                }
	            })

	            json.translations.push(trans);
			}

		}
	}
};

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ab_choose_list__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose_form__ = __webpack_require__(6);

/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */





OP.Component.extend('ab_choose', function(App) {


	var ids = {
		chooseComponent:App.unique('ab_choose')
	}



	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view:"multiview",
		id: ids.chooseComponent,
		autoheight: true,
		cells: [
			AppList.ui,
			AppForm.ui
		]
	};



	// This component's Init definition:
	var _init = function() {

		AppList.init();
		AppForm.init();
		
	}



	// Expose any globally accessible Actions:
	var _actions = {

		// initiate a request to create a new Application
		transitionApplicationForm:function(Application){
			
			// if no Application is given, then this should be a [create] operation,
			// so clear our AppList
			if ('undefined' == typeof Application) {
				App.actions.unselectApplication();
			}


			App.actions.populateApplicationForm(Application);
		},

		transitionApplicationList:function() {

			$$(ids.chooseComponent).back();
			// AppList.logic.show();
		}

	}



	var _logic = {

	}



	// return the current instance of this component:
	return {
		ui:_ui,
		init:_init,
		actions:_actions,

		_logic:_logic		// Unit Testing
	}

});

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(1);

/*
 * AB Choose Form
 *
 * Display the form for creating a new Application.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		formHeader: L('ab.application.form.header', "*Application Info"),
		placeholderName: L('ab.application.form.placeholderName', "*Application name"),
		placeholderDescription: L('ab.application.form.placeholderDescription', "*Application description"),

		sectionPermission: L('ab.application.form.sectionPermission', "*Permission"),
		permissionHeader: L('ab.application.form.headerPermission',  "*Assign one or more roles to set permissions for user to view this app"),
		createNewRole: L('ab.application.form.createNewRoleButton', "*Create a new role to view this app"),

		invalidName: L('ab.application.invalidName', "*This application name is invalid"),
		duplicateName: L('ab.application.duplicateName', "*Name must be unique."),

	}
}



OP.Component.extend('ab_choose_form', function(App) {

	labels.common = App.labels.common;

	var ids = {
		formComponent: App.unique('ab_choose_form_component'),
		form: App.unique('ab-app-list-form'),
		appFormPermissionList: App.unique('ab-app-form-permission'),
		appFormCreateRoleButton: App.unique('ab-app-form-create-role'),

		saveButton: App.unique('ab-app-form-button-save')
	}


	var _ui = {
		id: ids.formComponent,
		scroll: true,
		rows: [
			{
				view: "toolbar",
				cols: [{ view: "label", label: labels.application.formHeader, fillspace: true }]
			},
			{
				view: "form",
				id: ids.form,
				autoheight: true,
				margin: 0,
				elements: [
					{ type: "section", template: '<span class="webix_icon fa-edit" style="max-width:32px;"></span>Information', margin: 0 },
					{
						name: "label",
						view: "text",
						label: labels.common.formName,
						required: true,
						placeholder: labels.application.placeholderName,
						labelWidth: 100,
						on: {
							onChange: function (newValue, oldValue) {
								_logic.permissionRenameRole(newValue, oldValue);
							}
						}
					},
					{ name: "description", view: "textarea", label: labels.common.formDescription, placeholder: labels.application.placeholderDescription, labelWidth: 100, height: 100 },
					{ type: "section", template: '<span class="webix_icon fa-lock" style="max-width:32px;"></span>'+labels.application.sectionPermission },
					{
						view: "toolbar",
						cols: [
							{
								template: labels.application.permissionHeader, 
								type: 'header',
								borderless: true
							},
							{
								view: "toggle",
								id: ids.appFormCreateRoleButton,
								type: "iconButton",
								width: 300,
								align: "right",
								offIcon: "square-o",
								onIcon: "check-square-o",
								label: labels.application.createNewRole, 
								on: {
									onItemClick: function (id, e) {
										if (this.getValue()) {

// TODO: if not called from anywhere else, then move the name gathering into .permissionAddNew()
											// Add new app role
											var appName = $$(ids.form).elements["label"].getValue();
											_logic.permissionAddNew(appName);

										}
										else { 

											// Remove app role
											_logic.permissionRemoveNew();
											
										}
									}
								}
							}
						]
					},
					{
						name: "permissions",
						id: ids.appFormPermissionList,
						view: "list",
						height: 130,
						autowidth: true,
						borderless: true,
						margin: 0,
						css: "ab-app-form-permission",
						scroll: "y",
						template: "#name#",
						on: {
							onItemClick: function (id, e, node) {
								if (this.getItem(id).isApplicationRole) {
									return;
								}

								if (this.isSelected(id)) {
									this.unselect(id);
								}
								else {
									var selectedIds = this.getSelectedId();

									if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
										if (selectedIds)
											selectedIds = [selectedIds];
										else
											selectedIds = [];
									}

									selectedIds.push(id);

									this.select(selectedIds);
								}
							}
						}
					},
					{ height: 5 },
					{
						margin: 5, cols: [
							{ fillspace: true },
							{
								id: ids.saveButton,
								view: "button", label: labels.common.save, type: "form", width: 100, 
								click: function () {
									
									_logic.buttonSaveDisable();
									_logic.formBusy();

									// if there is a selected Application, then this is an UPDATE
									var updateApp = App.actions.getSelectedApplication();
									if (updateApp) { 

										if (_logic.formValidate('update')) {

											_logic.applicationUpdate(updateApp);

										}
										
									} else { 

										// else this is a Create
										if (_logic.formValidate('add')) {

											_logic.applicationCreate(_logic.formValues());

										}

									}
									
	
								} // end click()
							},
							{
								view: "button", value: labels.common.cancel, width: 100, 
								click: function () {
									_logic.cancel();
								}
							}
						]
					}
				]
			}
		]
	};

	const FormFields = ['label', 'description'];


	var _logic = {

		init: function() {
			webix.extend($$(ids.form), webix.ProgressBar);
			webix.extend($$(ids.appFormPermissionList), webix.ProgressBar);
		},


		applicationCreate: function(values) {

			var newApp = {
				name: values.label,
				label: values.label,
				description: values.description
			};

			async.waterfall([
				function (cb) {
					// Create application data
					__WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__["a" /* default */].create(newApp)
						.then(function (result) {
							cb(null, result);
						})
						.catch(cb);
				},
				function (createdApp, cb) {
					_logic.permissionSave(createdApp)
						.then(function () { cb(); })
						.catch(cb)
				}
			], function (err) {
				_logic.formReady();

				if (err) {
					webix.message({
						type: "error",
						text: labels.common.createErrorMessage.replace('{0}', values.label)
					});

					AD.error.log('App Builder : Error create application data', { error: err });

					_logic.buttonSaveEnable();

					return;
				}

				App.actions.transitionApplicationList();

				webix.message({
					type: "success",
					text: labels.common.createSuccessMessage.replace('{0}', values.label)
				});

				_logic.buttonSaveEnable();

			});
		},

		applicationUpdate: function(Application) {
			var values = _logic.formValues();

			async.waterfall([
				function (next) {
					_logic.permissionSave(Application)
						.then(function (result) { next(null, result); })
						.catch(next);
				},
				function (app_role, next) {
					// Update application data
					Application.label = values.label;
					Application.description = values.description;

					if (app_role && app_role.id)
						Application.role = app_role.id;
					else
						Application.role = null;

					Application.save()
						.then(function () {
							next();
						})
						.catch(next)
						
				}
			], function (err) {

				_logic.formReady();
				_logic.buttonSaveEnable();
				if (err) {
					webix.message({
						type: "error",
						text: labels.common.updateErrorMessage.replace('{0}', Application.label)
					});
					AD.error.log('App Builder : Error update application data', { error: err });
					return false;
				}

				App.actions.transitionApplicationList();

				webix.message({
					type: "success",
					text: labels.common.updateSucessMessage.replace('{0}', Application.label)
				});

			});
		},


		buttonSaveDisable:function() {
			$$(ids.saveButton).disable();
		},


		buttonSaveEnable:function() {
			$$(ids.saveButton).enable();
		},


		cancel: function() {
									
			_logic.formReset();
			App.actions.transitionApplicationList();
		},

		formBusy: function() {

			$$(ids.form).showProgress({ type: 'icon' });
		},

		formPopulate: function(application) {

			var Form = $$(ids.form);

			// Populate data to form
			if (application) {
				FormFields.forEach(function(f){
					if (Form.elements[f]) {
						Form.elements[f].setValue(application[f]);
					}
				})
			}
			
			// _logic.permissionPopulate(application);

		},

		formReady: function() {
			$$(ids.form).hideProgress();
		},


		formReset: function() {

			$$(ids.form).clear();
			$$(ids.form).clearValidation();
			// $$(self.webixUiids.appFormPermissionList).clearValidation();
			// $$(self.webixUiids.appFormPermissionList).clearAll();
			// $$(self.webixUiids.appFormCreateRoleButton).setValue(0);
		},



		formValidate:function(op) {
			// op : ['add', 'update', 'destroy']

			var Form = $$(ids.form);
			if (!Form.validate()) {
				// TODO : Error message

				_logic.buttonSaveEnable();
				return false;
			}


			var errors = __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__["a" /* default */].isValid(op, Form.getValues());
			if (errors.length > 0) {
				var hasFocused = false;
				errors.forEach(function(err){
					Form.markInvalid(err.name, labels.application[err.mlKey] || err.defaultText );
					if (!hasFocused && Form.elements[err.name]) {
						Form.elements[err.name].focus();
						hasFocused = true;
					}
				})
				_logic.buttonSaveEnable();
				return false;
			}

			// var appName = $$(ids.form).elements['label'].getValue(),
			// 	appDescription = $$(ids.form).elements['description'].getValue();

			// if (!inputValidator.validate(appName)) {
			// 	_logic.buttonSaveEnable();
			// 	return false;
			// }

			// // Prevent duplicate application name
			// if (self.data.filter(function (app) { return app.name.trim().toLowerCase() == appName.trim().replace(/ /g, '_').toLowerCase(); }).length > 0) {
			// 	OP.Dialog.Alert({
			// 		title: labels.application.invalidName,
			// 		text: labels.application.duplicateName.replace("#appName#", appName),
			// 		ok: labels.common.ok
			// 	});

			// 	$$(ids.form).elements['label'].focus();
			// 	_logic.buttonSaveEnable();
			// 	return false;
			// }

			return true;
		},


		/**
		 * @function formValues()
		 *
		 * return an object hash of name:value pairs of the current Form.
		 *
		 * @return {obj} 
		 */
		formValues: function() {
			// return the current values of the Form elements.
			return $$(ids.form).getValues();

		},


		/**
		 * @function permissionAddNew
		 *
		 * create a new permission entry based upon the current Application.label
		 *
		 * This not only adds it to our Permission List, but also selects it.
		 *
		 * @param {string} appName	The Application.label of the current Application
		 */
		permissionAddNew: function(appName) {

			// add new role entry
			$$(ids.appFormPermissionList).add({
				id: 'newRole',
				name: _logic.permissionName(appName),
				isApplicationRole: true
			}, 0);


			// Select new role
			var selectedIds = $$(ids.appFormPermissionList).getSelectedId(true);
			selectedIds.push('newRole');
			$$(ids.appFormPermissionList).select(selectedIds);

		},


		/**
		 * @function permissionName
		 *
		 * returns a formatted name for a Permission Role based upon the provided Application.label
		 *
		 * @param {string} appName	the current value of the Application.label
		 * @return {string} 	Permission Role Name.
		 */
		permissionName: function(appName) {
			return appName  + " Application Role"; 
		},


		/**
		 * @function permissionPopulate
		 *
		 * fill out the Permission list
		 *
		 * @param {ABApplication} application	the current ABApplication we are editing
		 */
		permissionPopulate: function(application) {

			var PermForm = $$(ids.appFormPermissionList);
			// Get user's roles
			PermForm.showProgress({ type: 'icon' });
			async.waterfall([
				function (next) {
					AD.comm.service.get({ url: '/app_builder/user/roles' })
						.fail(function (err) { next(err); })
						.done(function (roles) {

							// scan the roles and determine if any of them have been created
							// after the current Application.name:
							var parsedRoles = roles.map((r) => { 
								if (application) {
									if (r.name == _logic.permissionName(application.name.split('_').join(' '))) {
										r.isApplicationRole = true;
									}
								}
								return r;
							})
							next(null, parsedRoles);
						});
				},

				function (available_roles, next) {
					if (application && application.id) {
						application.getPermissions()
							.then(function (selected_role_ids) {
								next(null, available_roles, selected_role_ids);
							})
							.catch(function (err) { next(err); });
					}
					else {
						next(null, available_roles, []);
					}

				},
				function (available_roles, selected_role_ids, next) {
					
					// mark the role(s) in available_roles that is tied 
					// this application:
					if (application && application.role) {
						available_roles.forEach(function (r) {
		
							if (r.id == (application.role.id || application.role))
								r.isApplicationRole = true;
						});
					}

					// Sort permission list
					available_roles.sort(function (a, b) {
						return (a.isApplicationRole === b.isApplicationRole) ? 0 : a.isApplicationRole ? -1 : 1;
					});

					// reload list from our available_roles
					PermForm.clearAll();
					PermForm.parse(available_roles);

					// mark which roles have already been selected
					if (selected_role_ids && selected_role_ids.length > 0) {
						// Select permissions
						PermForm.select(selected_role_ids);

						// Select create role application button
						var markCreateButton = available_roles.filter(function (r) { return r.isApplicationRole; }).length > 0 ? 1 : 0;
						$$(ids.appFormCreateRoleButton).setValue(markCreateButton);
					}

					next();
				}
			], function (err) {
				if (err) {
					webix.message(err.message);
				}

				PermForm.hideProgress();

			});

			// return appName  + " Application Role"; 
		},


		/**
		 * @function permissionRemoveNew()
		 *
		 * Intended to be called when the USER unselects the option to create a Permission
		 * for this Application.
		 *
		 * We remove any Permission Role created for this Application.
		 */
		permissionRemoveNew: function() {

			// find any roles that are put here from our application form:
			var appRoles = $$(ids.appFormPermissionList).find(function (perm) { return perm.isApplicationRole; });
			
			// remove them:
			appRoles.forEach(function (r) {
				$$(ids.appFormPermissionList).remove(r.id);
			});
		},


		/*
		 * permissionRenameRole
		 *
		 * When the name of the Appliction changes, change the Name of the Permission as well.
		 *
		 * @param {string} newValue  the current name of the application
		 * @param {string} oldValue  the previous name of the application
		 */
		permissionRenameRole:function( newValue, oldValue) {

			var editRole = $$(ids.appFormPermissionList).find(function (d) { return d.name === _logic.permissionName(oldValue); });

			editRole.forEach(function (r) {
				var editItem = $$(ids.appFormPermissionList).getItem(r.id);
				editItem.name = _logic.permissionName(newValue);

				$$(ids.appFormPermissionList).updateItem(editItem.id, editItem);
			});
		},


		/**
		 * @function permissionSave()
		 *
		 * step through saving the current Permission Settings and associating
		 * them with the current Application.
		 *
		 * @param {ABApplication} App  	The current Application we are working with.
		 * @return {Promise}			.resolve( {Permission} ) if one is created for this App
		 */
		permissionSave: function (app) {
//// REFACTOR:
// this step implies that ab_choose_form understands the intracies of how
// ABApplication and Permissions work.  
			return new Promise(
				(resolve, reject) => {

					var saveRoleTasks = [],
						appRole = null;

					//// Process the option to create a newRole For this Application:

					// if the button is set
					if ($$(ids.appFormCreateRoleButton).getValue()) {

						// check to see if we already have a permission that isApplicationRole
						var selectedPerms = $$(ids.appFormPermissionList).getSelectedItem(true);
						selectedPerms = selectedPerms.filter((perm) => { return perm.isApplicationRole; })
						
						// if not, then create one:
						if (selectedPerms.length == 0) {

							// Create new role for application
							saveRoleTasks.push(function (cb) {
								app.createPermission()
									.then(function (result) {

										// remember the Role we just created
										appRole = result;	
										cb();
									})
									.catch(cb)
							});
						}
					}
					else {
						// Delete any existing application roles
						saveRoleTasks.push(function (cb) {
							app.deletePermission()
								.then(function () { cb(); })
								.catch(cb)
								
						});
					}

					//// Now process any additional roles:

					// get array of selected permissions that are not our newRole
					var permItems = $$(ids.appFormPermissionList).getSelectedItem(true);
					permItems = permItems.filter( function (item) { return item.id !== 'newRole'; }); // Remove new role item


					// Make sure Application is linked to selected permission items:
					saveRoleTasks.push(function (cb) {

						// ok, so we removed the 'newRole' entry, but we might 
						// have created an entry for it earlier, if so, add in  
						// the created one here:
						if ($$(ids.appFormCreateRoleButton).getValue() && appRole) {

							// make sure it isn't already in there:
							var appRoleItem = permItems.filter( function (item) { return item.id == appRole.id; });
							if (!appRoleItem || appRoleItem.length < 1) {

								// if not, add it :
								permItems.push({
									id: appRole.id,
									isApplicationRole: true
								});
							}
						}


						// Assign Role Permissions
						app.assignPermissions(permItems)
							.then(function () { cb(); })
							.catch(cb)
					});



					async.series(saveRoleTasks, function(err, results) {
						if (err) {
							reject(err);
						} else {
							// we return the instance of the newly created Permission.
							resolve(appRole);  
						}
					});
				}
			);


//// REFACTOR QUESTION:
// why are we updating the app.permissions with this data structure?
// where is this data structure being used?
// Earlier we are using another structure (permissionAddNew()) ... how is that related to this?

							// // Final task
							// saveRoleTasks.push(function (cb) {
							// 	// Update store app data
							// 	var applicationData = self.data.filter(function (d) { return d.id == app.id; });
							// 	applicationData.forEach(function (app) {
							// 		app.attr('permissions', $.map(permItems, function (item) {
							// 			return {
							// 				application: app.id,
							// 				permission: item.id,
							// 				isApplicationRole: item.isApplicationRole
							// 			}
							// 		}));
							// 	});

							// 	q.resolve(appRole);
							// 	cb();
							// })

		},


		/**
		 * @function show()
		 *
		 * Show the Form Component.
		 */
		show:function() {

			$$(ids.formComponent).show();
		}
	}







	// Expose any globally accessible Actions:
	var _actions = {

		// initiate a request to create a new Application
		populateApplicationForm:function(Application){
			
			_logic.formReset();
			if (Application) {
				// populate Form here:
				_logic.formPopulate(Application);
			}
			_logic.permissionPopulate(Application);
			_logic.show();
		}

	}


	return {
		ui: _ui,
		init: _logic.init,
		actions:_actions
	}
})

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose_list_menu__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose_list_menu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__ab_choose_list_menu__);

/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */




function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var labels = {

	application: {
		title: L('ab.application.application', '*Application'),
		createNew: L('ab.application.createNew', '*Add new application'),
		noApplication: L('ab.application.noApplication', "*There is no application data")
							
	}
}



OP.Component.extend('ab_choose_list', function(App) {

	labels.common = App.labels.common;

	var ids = {
		component:App.unique('ab_choose_listcomponent'),
		list:App.unique('ab_choose_list'),
		toolBar:App.unique('ab_choose_list_toolbar'),
		buttonCreateNewApplication: App.unique('ab_choose_list_buttonNewApp')
	}

	var MenuComponent = OP.Component['ab_choose_list_menu'](App);
	var PopupMenu = webix.ui(MenuComponent.ui);
	PopupMenu.hide();

	var _ui = {

		id: ids.component,

		cols: [

			//
			// Left Column Spacer
			//
			{ width:100 },


			//
			// Center column Content:
			// 
			{
				
				autoheight: true,
				autowidth: true,
				rows: [

					// 
					// Top Spacer
					//
					{ height: 30 },

					//
					// ToolBar
					// 
					{
						view: "toolbar",
						id: ids.toolBar,
						cols: [
							{ view: "label", label:labels.application.title, fillspace: true },
							{
								id: ids.buttonCreateNewApplication,
								view: "button", 
								value: labels.application.createNew, 
								width: 200,
								click: function() { 

									// Inform our Chooser we have a request to create an Application:
									App.actions.transitionApplicationForm( /* leave empty for a create */ );
								}
							},
							{
								view: "uploader",
								value: labels.common.import,
								width: 200,
								upload: '/app_builder/appJSON',
								multiple: false,
								autosend: true,
								on: {
									onAfterFileAdd: function () {
										this.disable();
										_logic.busy();
									},
									onFileUpload: function (item, response) {
										_logic.loadData(); // refresh app list
										this.enable();
			                            _logic.ready();
									},
									onFileUploadError: function (details, response) {
										var errorMessage = 'Error: ' + (response && response.message);
										webix.message({
											type: 'error',
											text: errorMessage
										});
										_logic.loadData(); // refresh app list
										this.enable();
			                            _logic.ready();
									}
								}
							}
						]
					},


					//
					// The List of Applications
					// 
					{
						id: ids.list,
						view: "list",
						minHeight: 227,
						autowidth: true,
						css: 'ab-app-select-list',
						template: function (obj, common) {
							return _logic.templateListItem(obj, common);
						},
						type: {
							height: 100, // Defines item height
							iconGear: "<span class='webix_icon fa-cog'></span>"
						},
						select: false,
						onClick: {
							"ab-app-list-item": function (e, id, trg) {
								_logic.busy();

								this.select(id);

								var selectedApp = this.getItem(id);

								if (selectedApp) {
		

									_logic.ready();
									

									// We've selected an Application to work with
									App.actions.transitionWorkspace( selectedApp[0] );
									
								}

								return false; // block default behavior
							},
							"ab-app-list-edit": function (e, id, trg) {
								// Show menu
								PopupMenu.show(trg);
								this.select(id);

								return false; // block default behavior
							}
						}
					}
				]
			},

			// 
			// Right Column Spacer
			// 
			{ width:100 }
		]
	}



	var _data={};


	var _logic = {

		/**
		 * @function busy
		 *
		 * show a busy indicator on our App List
		 */
		busy: function() {
			if ($$(ids.list).showProgress)
				$$(ids.list).showProgress({ icon: 'cursor' });
		},


		/**
		 * @function loadData
		 *
		 * Load all the ABApplications and display them in our App List
		 */
		loadData:function(){

			// Get applications data from the server
			_logic.busy();
			__WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__["a" /* default */].allApplications()
				.then(function (data) {

					_logic.ready();

					// make sure our overlay is updated when items are added/removed 
					// from our data list.
					data.attachEvent("onAfterAdd", function(id, index){
					    _logic.refreshOverlay();
					});

					data.attachEvent("onAfterDelete", function(id){
						_logic.refreshOverlay();
					})

					_data.listApplications = data;

					_logic.refreshList();
				})
				.catch(function (err) {
					_logic.ready();
					webix.message({
						type: "error",
						text: err
					});
					AD.error.log('App Builder : Error loading application data', { error: err });
				})
		},


		/**
		 * @function refreshOverlay
		 *
		 * If we have no items in our list, display a Message.
		 */
		refreshOverlay: function() {
			var appList = $$(ids.list);

			if (!appList.count()) //if no data is available
				appList.showOverlay(labels.application.noApplication);
			else
				appList.hideOverlay();
		},


		/**
		 * @function ready
		 *
		 * remove the busy indicator on our App List
		 */
		ready: function() {
			if ($$(ids.list).hideProgress)
				$$(ids.list).hideProgress();
		},


		/**
		 * @function reset
		 *
		 * Return our App List to an unselected state.
		 */
		reset:function() {
			$$(ids.list).unselectAll();
		},


		/**
		 * @function refreshList
		 *
		 * Apply our list of ABApplication data to our AppList
		 */
		refreshList: function() {

			var appList = $$(ids.list);

			appList.clearAll();
			appList.data.unsync();
			appList.data.sync(_data.listApplications);

			_logic.refreshOverlay();

			appList.refresh();

			_logic.ready();
		},


		/**
		 * @function show
		 *
		 * Trigger our List component to show
		 */
		show:function() {
			$$(ids.component).show();
		},


		/**
		 * @function templateListItem
		 *
		 * Defines the template for each row of our AppList.
		 *
		 * @param {obj} obj the current instance of ABApplication for the row.
		 * @param {?} common the webix.common icon data structure
		 * @return {string}
		 */
		templateListItem: function(obj, common) {
			return _templateListItem
				.replace('#label#', obj.label || '')
				.replace('#description#', obj.description || '')
				.replace('{common.iconGear}', common.iconGear);
		}
	}



	/*
	 * _templateListItem
	 * 
	 * The AppList Row template definition.
	 */
	var _templateListItem = [
		"<div class='ab-app-list-item'>",
			"<div class='ab-app-list-info'>",
				"<div class='ab-app-list-name'>#label#</div>",
				"<div class='ab-app-list-description'>#description#</div>",
			"</div>",
			"<div class='ab-app-list-edit'>",
				"{common.iconGear}",
			"</div>",
		"</div>"
	].join('');

			

	/*
	 * @function _init
	 * 
	 * The init() that performs the necessary setup for our AppList chooser.
	 */
	var _init = function() {
		webix.extend($$(ids.list), webix.ProgressBar);
		webix.extend($$(ids.list), webix.OverlayBox);

		MenuComponent.init();

		// _data.Applications = AD.Model.get('opstools.BuildApp.ABApplication');
		// start things off by loading the current list of Applications
		_logic.loadData();
	}



	/*
	 * {json} _actions
	 *
	 * The exported methods available to other Components.
	 */
	var _actions = {


		/**
		 * @function unselectApplication
		 *
		 * resets the AppList to an unselected state.
		 */
		unselectApplication:function() {
			_logic.reset();
		},


		/**
		 * @function getSelectedApplication
		 *
		 * returns which ABApplication is currently selected.
		 * @return {ABApplication}  or {null} if nothing selected.
		 */
		getSelectedApplication:function() {
			return $$(ids.list).getSelectedItem();
		},


		/**
		 * @function deleteApplication
		 *
		 * deletes the given ABAppliction.
		 *
		 * NOTE: this assumes the component using this method has already
		 * provided the delete confirmation.
		 *
		 * @param {ABApplication} app  the ABAppliction to delete.
		 */
		deleteApplication: function(app) {

			if (!app) return;

			// Delete application data
			_logic.busy();

			
			app.destroy()
				.then(function (result) {
					_logic.reset();
					_logic.ready();

					webix.message({
						type: "success",
						text: labels.common.deleteSuccessMessage.replace('{0}', app.label)
					});
				})
				.catch(function (err) {
					_logic.reset();
					_logic.ready()

					webix.message({
						type: "error",
						text: labels.common.deleteErrorMessage.replace("{0}", app.label)
					});

					AD.error.log('App Builder : Error delete application data', { error: err });
				})

			
		},


		// transitionApplicationList:function() {
		// 	$$(ids.component).show();
		// }
	}			



	return {
		ui: _ui,
		init: _init,
		actions:_actions,


		_logic:_logic	// exposed for Unit Testing
	}
})


/***/ }),
/* 8 */
/***/ (function(module, exports) {


/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var labels = {

	application: {
		menu : L('ab.application.menu', "*Application Menu"),
		confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
		confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")		
	}
}



OP.Component.extend('ab_choose_list_menu', function(App) {

	labels.common = App.labels.common;

	var ids = {
		menu:App.unique('ab_choose_list_menu')
	}

	var _ui = {
		view: "popup",
		id: ids.menu,
		head: labels.application.menu,
		width: 100,
		body: {
			view: "list",
			data: [
				{ command: labels.common.edit, icon: "fa-pencil-square-o" },
				{ command: labels.common.delete, icon: "fa-trash" },
				{ command: labels.common.export, icon: "fa-download" }
			],
			datatype: "json",

			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			autoheight: true,
			select: false,
			on: {
				'onItemClick': function (timestamp, e, trg) {
					$$(ids.menu).hide();

					var selectedApp = App.actions.getSelectedApplication();

					switch (trg.textContent.trim()) {
						case labels.common.edit:
							App.actions.transitionApplicationForm(selectedApp);
							break;

						case labels.common.delete:
							OP.Dialog.ConfirmDelete({
								title: labels.application.confirmDeleteTitle,
								text: labels.application.confirmDeleteMessage.replace('{0}', selectedApp.label),
								callback: function (result) {

									if (!result) return;

									App.actions.deleteApplication(selectedApp);									
								}
							})
							break;

						case labels.common.export:
							// Download the JSON file to disk
							window.location.assign('/app_builder/appJSON/' + selectedApp.id + '?download=1');
							break;
					}

					
					return false;
				}
			}
		}
	}



	var _data={};


	var _logic = {

		init: function() {
			
		}
		
	}

							

	return {
		ui: _ui,
		init: _logic.init
	}
})


/***/ }),
/* 9 */
/***/ (function(module, exports) {

//
// REFACTORING:
//
// Our goal here is to create a Model object that will interact with Sails' blueprints and 
// return native Webix DataCollections.
//
// We also want to listen for updates on Sails Sockets and notify the DataCollections.
//
// Until we have the refactoring in place, we will reuse the AD.Model.extent() objects,
// and convert the results to DataCollections.
//



// Namespacing conventions:
// OP.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
OP.Model.extend('opstools.BuildApp.ABApplication',
	{
		useSockets: true,
		restURL: '/app_builder/abapplication'
	},
	{
		// instance Methods
	}
);
		
		

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_ab__ = __webpack_require__(2);


// import '../../../../../assets/js/webix/webix'






AD.Control.OpsTool.extend('BuildApp', {

	init: function (element, options) {
		var self = this;

		options = AD.defaults({
			templateDOM: '/opstools/BuildApp/views/BuildApp/BuildApp.ejs',
			resize_notification: 'BuildApp.resize',
			tool: null   // the parent opsPortal Tool() object
		}, options);
		self.options = options;

		// Call parent init
		self._super(element, options);

		self.data = {};

		self.webixUiId = {
			loadingScreen: 'ab-loading-screen',
			syncButton: 'ab-sync-button'
		};

		self.initDOM(function(){
			self.initWebixUI();
		});
		

	},


	initDOM: function (cb) {
		var _this = this;

		can.view(this.options.templateDOM, {}, function(fragment){
			_this.element.html(fragment);

			// _this.element.find(".ab-app-list").show();
			// _this.element.find(".ab-app-workspace").hide();

			cb();
		});
	},
	

	initWebixUI: function () {

		// get the AppBuilder (AB) Webix Component
		var AppBuilder = OP.Component['ab']();
		var ui = AppBuilder.ui;

		// tell the AppBuilder where to attach
		ui.container = 'ab-main-container'

		// instantiate the UI first
		this.AppBuilder = webix.ui(ui);

		// then perform the init()
		AppBuilder.init();

	},


	resize: function (height) {
		var self = this;

		height = height.height || height;

		var appListDom = $(self.element);

		if (appListDom) {
			var width = appListDom.parent().css('width');
			if (width) {
				width = parseInt(width.replace('px', ''));
			}
			appListDom.width(width);

			var computedHeight = height - 140;
			var mh = parseInt(appListDom.css('min-height').replace('px', ''));
			if (mh < computedHeight) {
				appListDom.height(computedHeight);
				$('#ab-main-container').height(computedHeight);
			} else {
				appListDom.height(mh);
				$('#ab-main-container').height(mh);
			}

			if (this.AppBuilder) {
				// this.AppBuilder.define('height', height - 140);
				this.AppBuilder.adjust();
			}
			
		}
	}

});

/***/ })
/******/ ]);