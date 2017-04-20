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
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_ABApplication__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_ABApplication___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__data_ABApplication__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ABObject__ = __webpack_require__(5);







var _AllApplications = [];

function toDC( data ) {
	return new webix.DataCollection({
		data: data,

		// on: {
		// 	onAfterDelete: function(id) {

		// 	}
		// }
	});
}

class ABApplication {

    constructor(attributes) {

    	// ABApplication Attributes
    	this.id    = attributes.id;
    	this.json  = attributes.json;
    	this.name  = attributes.name || this.json.name || "";
    	this.role  = attributes.role;

    	// multilingual fields: label, description
    	__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.translate(this, this.json, ABApplication.fieldsMultilingual());

	  	
	  	// import all our ABObjects
	  	var newObjects = [];
	  	(attributes.json.objects || []).forEach((obj) => {
	  		newObjects.push( new __WEBPACK_IMPORTED_MODULE_2__ABObject__["a" /* default */](obj, this) );
	  	})
	  	this._objects = newObjects;


	  	// import all our ABViews



	  	// instance keeps a link to our Model for .save() and .destroy();
	  	this.Model = __WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Model.get('opstools.BuildApp.ABApplication');
	  	this.Model.Models(ABApplication);
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///


  	/**
  	 * @function allApplications
  	 *
  	 * return a DataCollection that contains all the ABApplications this user
  	 * can see (based upon server side permissions);
  	 * 
  	 * NOTE: this manages the results in the _AllApplications dataCollection
  	 * store.  Any future .create(), .destroy(), .updates() modify values in 
  	 * that collection.
  	 *
  	 * Any webix ui components synced to that collection will be automatically 
  	 * updated.
  	 *
  	 * @return {Promise} 
  	 */
	static allApplications() {
		return new Promise( 
			(resolve, reject) => {

				var ModelApplication = __WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll()
					.then(function(data){
						
						// NOTE: data is already a DataCollection from .findAll()
						_AllApplications = data;

						resolve(data);
					})
					.catch(reject);

			}
		)
	}


  	/**
  	 * @function create
  	 *
  	 * take the initial values and create an instance of ABApplication.
  	 * 
  	 * @return {Promise} 
  	 */
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
	 * return an array of fields that are considered Multilingual labels for
	 * an ABApplication
	 * 
	 * @return {array} 
	 */
	static fieldsMultilingual() {
		return ['label', 'description'];
	} 



//// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

	static isValid(op, values) {

			var errors = [];

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:
				var matchingApps = _AllApplications.data.filter(function (app) { 
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


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 * 
	 * @return {Promise} 
	 */
	destroy () {
		if (this.id) {
			return this.Model.destroy(this.id)
				.then(()=>{
					_AllApplications.remove(this.id);
				});
		}
	}


	/**
	 * @method save()
	 *
	 * persist the current instance of ABApplication to the DB
	 *
	 * Also, keep the values in _AllApplications up to date.
	 * 
	 * @return {Promise} 
	 */
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


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to 
	 * update that from all the current values of our child fields.
	 *
	 * @return {json} 
	 */
	toObj () {

		__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());
		this.json.name = this.name;

		// for each Object: compile to json
		var currObjects = [];
		this._objects.forEach((obj) => {
			currObjects.push(obj.toObj())
		})
		this.json.objects = currObjects;

		return {
			id:this.id,
			name:this.name,
			json:this.json,
			role:this.role
		}
	}



	/// ABApplication Permission methods


	/**
	 * @method assignPermissions()
	 *
	 * Make sure the current ABApplication permissions match the given 
	 * array of permissions.
	 *
	 * @param {array} permItems	an array of role assignments that this 
	 * 							ABApplication should match.
	 * @return {Promise} 
	 */
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


	/**
	 * @method getPermissions()
	 *
	 * Return an array of role assignments that are currently assigned to this
	 * ABApplication.
	 *
	 * @return {Promise} 	resolve(list) : list {array} Role assignments
	 */
	getPermissions () {

		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.get({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)
			}
		);
	}


	/**
	 * @method createPermission()
	 *
	 * Create a Role in the system after the name of the current ABApplication.
	 *
	 * @return {Promise} 	
	 */
	createPermission () {
		return new Promise( 
			(resolve, reject) => {

// TODO: need to take created role and store as : .json.applicationRole = role.id

				AD.comm.service.post({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}


	/**
	 * @method deletePermission()
	 *
	 * Remove the Role in the system of the current ABApplication.
	 * (the one created by  .createPermission() )
	 *
	 * @return {Promise} 	
	 */
	deletePermission () {
		return new Promise( 
			(resolve, reject) => {

// TODO: need to remove created role from : .json.applicationRole 
				AD.comm.service.delete({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}




	///
	/// Objects
	///




	/**
	 * @method objects()
	 *
	 * return a DataCollection of all the ABObjects for this ABApplication.
	 *
	 * @return {Promise} 	
	 */
	objects (filter) {
		filter = filter || function() {return true; };

		return new Promise( 
			(resolve, reject) => {


				resolve(toDC(this._objects.filter(filter)));

			}
		);
	}


}
/* harmony export (immutable) */ __webpack_exports__["a"] = ABApplication;



/***/ }),
/* 1 */
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

    OP.CustomComponent = {};  // separate holder for Webix Custom Components



	// OP.UI.extend = function(key, definition) {
	// 	OP.UI[key] = definition;
	// }

	OP.Component.extend = function(key, fn) {
		OP.Component[key] = function(App){

//// TODO: verify App has proper structure:
			if (!App) {
				App = OP.Component._newApp();
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

	OP.Component._newApp = function () {
		return {

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
			 * custom
			 * a collection of custom components for this App Instance.
			 */
			custom:{
		
			},

			/*
			 * labels
			 * a collection of labels that are common for the Application.
			 */
			labels:{
		
			},

			/*
			 * unique()
			 * A function that returns a globally unique Key.
			 * @param {string} key   The key to modify and return.
			 * @return {string} 
			 */
			unique: function(key) { return key+this.uuid; },

		}
	}


	OP.CustomComponent.extend = function(key, fn) {
		OP.CustomComponent[key] = function(App, key){

			if (!App) {
				App = OP.Component._newApp();
			}

			// make an instance of the component.
			return fn(App, key);
		};
	}

	
	OP.Dialog = AD.op.Dialog;


	OP.Multilingual = __WEBPACK_IMPORTED_MODULE_0__multilingual__["a" /* default */];
	OP.Model = __WEBPACK_IMPORTED_MODULE_1__model__["a" /* default */];
	

	/* harmony default export */ __webpack_exports__["a"] = OP;
// }


// import "./model.js"

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ab_work__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__webix_custom_components_edittree__ = __webpack_require__(18);

/*
 * AB 
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */






// Import our Custom Components here:


OP.Component.extend('ab', function(App) {


	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	
	// setup the common labels for our AppBuilder Application.
	App.labels = {
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


	// make instances of our Custom Components:
	OP.CustomComponent[__WEBPACK_IMPORTED_MODULE_3__webix_custom_components_edittree__["a" /* default */].key](App, 'edittree'); // ->  App.custom.edittree  now exists

	


	var ids = {
		component:App.unique('app_builder_root')
	}



	// Define the external components used in this Component:
	var AppChooser = OP.Component['ab_choose'](App);
	var AppWorkspace = OP.Component['ab_work'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		id: ids.component,
		view:"multiview",
		autoheight:true,
		autowidth:true,
		rows:[
			AppChooser.ui,
			AppWorkspace.ui
		]
	};



	// This component's init() definition:
	var _init = function() {

		AppChooser.init();
		AppWorkspace.init();

		// start off only showing the App Chooser:
		App.actions.transitionApplicationChooser();

		// perform an initial resize adjustment
		$$(ids.component).adjust();
	}


	// Expose any globally accessible Actions:
	var _actions = {



	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions		// {ob}		hash of fn() to expose so other components can access.
	}

});






//// REFACTORING TODOs:
// TODO: OP.Error.isValidation() to handle validation errors returned from Sails
// TODO: AppForm-> Permissions : refresh permission list, remove AppRole permission on Application.delete().







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


					// dc._toArray = function() {
					// 	var data = [];
					// 	var id = this.getFirstId();
					// 	while(id) {
					// 		data.push(this.getItem(id));
					// 		id = this.getNextId(id);
					// 	}
					// 	return data;
					// }



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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(1);



function toDC( data ) {
	return new webix.DataCollection({
		data: data,

		// on: {
		// 	onAfterDelete: function(id) {

		// 	}
		// }
	});
}

class ABObject {

    constructor(attributes, application) {
/*
{
	id: uuid(), 
	name: 'name',
	labelFormat: 'xxxxx',
	isImported: 1/0,
	urlPath:'string',
	importFromObject: 'string', // JSON Schema style reference:  '#[ABApplication.id]/objects/[ABObject.id]'
								// to get other object:  ABApplication.objectFromRef(obj.importFromObject);
	translations:[
		{}
	],
	fields:[
		{ABDataField}
	]
}
*/



    	// ABApplication Attributes
    	this.id    = attributes.id;
    	this.name  = attributes.name || "";
    	this.labelFormat = attributes.labelFormat || "";
    	this.isImported  = attributes.isImported  || 0;
    	this.urlPath	 = attributes.urlPath     || "";
    	this.importFromObject = attributes.importFromObject || "";
    	this.translations = attributes.translations;


    	// multilingual fields: label, description
    	__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.translate(this, this, ['label']);

	  	
	  	// import all our ABObjects
	  	// var newFields = [];
	  	// (attributes.json.objects || []).forEach((obj) => {
	  	// 	newObjects.push( new ABObject(obj) );
	  	// })
	  	// this.fields = newFields;


	  	// link me to my parent ABApplication
	  	this.application = application;
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///



//// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

	static isValid(op, values) {

			var errors = [];

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:
				var matchingApps = _AllApplications.data.filter(function (app) { 
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


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 * 
	 * @return {Promise} 
	 */
	destroy () {
		if (this.id) {
console.error('TODO: ABObject.destroy()');
			// return this.Model.destroy(this.id)
			// 	.then(()=>{
			// 		_AllApplications.remove(this.id);
			// 	});
		}
	}


	/**
	 * @method save()
	 *
	 * persist the current instance of ABApplication to the DB
	 *
	 * Also, keep the values in _AllApplications up to date.
	 * 
	 * @return {Promise} 
	 */
	save () {
console.error('TODO: ABObject.save()')
		// var values = this.toObj();

		// // we already have an .id, so this must be an UPDATE
		// if (values.id) {

		// 	return this.Model.update(values.id, values)
		// 			.then(() => {
		// 				_AllApplications.updateItem(values.id, this);
		// 			});
				
		// } else {

		// 	// must be a CREATE:
		// 	return this.Model.create(values)
		// 			.then((data) => {
		// 				this.id = data.id;
		// 				_AllApplications.add(this, 0);
		// 			});
		// }
	
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to 
	 * update that from all the current values of our child fields.
	 *
	 * @return {json} 
	 */
	toObj () {

		__WEBPACK_IMPORTED_MODULE_0__OP_OP__["a" /* default */].Multilingual.unTranslate(this, this, ["label"]);

		// // for each Object: compile to json
		// var currObjects = [];
		// this.objects.forEach((obj) => {
		// 	currObjects.push(obj.toObj())
		// })
		// this.json.objects = currObjects;

		return {
			id: 			this.id,
			name: 			this.name,
    		labelFormat: 	this.labelFormat,
    		isImported:  	this.isImported,
    		urlPath: 		this.urlPath,
    		importFromObject: this.importFromObject,
    		translations: 	this.translations,
    		fields: 	 	[] 
		}
	}






	///
	/// Fields
	///




	/**
	 * @method fields()
	 *
	 * return a DataCollection of all the ABFields for this ABObject.
	 *
	 * @return {Promise} 	
	 */
	fields () {
		return new Promise( 
			(resolve, reject) => {


				resolve(toDC(this.feilds));

			}
		);
	}


}
/* harmony export (immutable) */ __webpack_exports__["a"] = ABObject;



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ab_choose_list__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose_form__ = __webpack_require__(7);

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
		component:App.unique('ab_choose')
	}



	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view:"multiview",
		id: ids.component,
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


		/**
		 * @function transitionApplicationChooser
		 *
		 * Switch the AppBuilder UI to show the Application Chooser component.
		 */
		transitionApplicationChooser:function() {
			$$(ids.component).show();	
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
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);

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

	labels.common = App.labels;

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



	var _init = function() {
		webix.extend($$(ids.form), webix.ProgressBar);
		webix.extend($$(ids.appFormPermissionList), webix.ProgressBar);
	}



	var _logic = {


		/**
		 * @function applicationCreate
		 *
		 * Step through the process of creating an ABApplication with the 
		 * current state of the Form.
		 *
		 * @param {obj} values 	current value hash of the form values.
		 */
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


		/**
		 * @function applicationUpdate
		 *
		 * Step through the process of updating an ABApplication with the 
		 * current state of the Form.
		 *
		 * @param {ABApplication} application 
		 */
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


		/**
		 * @function buttonSaveDisable
		 *
		 * Disable the save button.
		 */
		buttonSaveDisable:function() {
			$$(ids.saveButton).disable();
		},


		/**
		 * @function buttonSaveEnable
		 *
		 * Re-enable the save button.
		 */
		buttonSaveEnable:function() {
			$$(ids.saveButton).enable();
		},


		/**
		 * @function cancel
		 *
		 * Cancel the current Form Operation and return us to the AppList.
		 */
		cancel: function() {
									
			_logic.formReset();
			App.actions.transitionApplicationList();
		},


		/**
		 * @function formBusy
		 *
		 * Show the progress indicator to indicate a Form operation is in 
		 * progress.
		 */
		formBusy: function() {

			$$(ids.form).showProgress({ type: 'icon' });
		},


		/**
		 * @function formPopulate()
		 *
		 * populate the form values from the given ABApplication
		 *
		 * @param {ABApplication} application  instance of the ABApplication
		 */
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


		/**
		 * @function formReady()
		 *
		 * remove the busy indicator from the form.
		 */
		formReady: function() {
			$$(ids.form).hideProgress();
		},


		/**
		 * @function formReset()
		 *
		 * return the form to an empty state.
		 */
		formReset: function() {

			$$(ids.form).clear();
			$$(ids.form).clearValidation();
			// $$(self.webixUiids.appFormPermissionList).clearValidation();
			// $$(self.webixUiids.appFormPermissionList).clearAll();
			// $$(self.webixUiids.appFormCreateRoleButton).setValue(0);
		},


		/**
		 * @function formValidate()
		 *
		 * validate the form values.
		 *
		 * @return {bool}  true if all values pass validation.  false otherwise.
		 */
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


		/**
		 * @function populateApplicationForm()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		// populateApplicationForm:function(Application){
			

		// },


		// initiate a request to create a new Application
		transitionApplicationForm:function(Application){
			
			// if no Application is given, then this should be a [create] operation,
			// so clear our AppList
			if ('undefined' == typeof Application) {
				App.actions.unselectApplication();
			}

			// now prepare our form:
			_logic.formReset();
			if (Application) {
				// populate Form here:
				_logic.formPopulate(Application);
			}
			_logic.permissionPopulate(Application);
			_logic.show();
		},

	}


	return {
		ui: _ui,
		init: _init,
		actions:_actions,

		_logic: _logic
	}
})

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_choose_list_menu__ = __webpack_require__(9);
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

	labels.common = App.labels;

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
									App.actions.transitionWorkspace( selectedApp );
									
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


		/**
		 * @function transitionApplicationList
		 *
		 * Trigger our List component to show
		 */
		transitionApplicationList:function() {
			$$(ids.component).show();
		}
	}			



	return {
		ui: _ui,
		init: _init,
		actions:_actions,


		_logic:_logic	// exposed for Unit Testing
	}
})


/***/ }),
/* 9 */
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

	labels.common = App.labels;



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

					// hide our popup before we trigger any other possible UI animation: (like .edit)
					// NOTE: if the UI is animating another component, and we do .hide()
					// while it is in progress, the UI will glitch and give the user whiplash.
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



	var _init = function() {
			
		
	}

							

	return {
		ui: _ui,
		init: _init
	}
})


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_work_object__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ab_work_interface__ = __webpack_require__(11);

/*
 * ab_work
 *
 * Display the component for working with an ABApplication.
 *
 */






function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		backToApplication: L('ab.application.backToApplication', "*Back to Applications page"),
		synchronize: L('ab.application.synchronize', "*Synchronize"),
		objectTitle: L('ab.object.title', "*Objects"),
		interfaceTitle: L('ab.interface.title', "*Interface")
	}
}



OP.Component.extend('ab_work', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_component'),
		toolBar: App.unique('ab_work_toolbar'),
		buttonSync: App.unique('ab_work_button_sync'),
		labelAppName: App.unique('ab_work_label_appname'),
		tabbar: App.unique('ab_work_tabbar'),
		tab_object: App.unique('ab_work_tab_object'),
		tab_interface: App.unique('ab_work_tab_interface'),
		workspace: App.unique('ab_work_workspace'),
	}


	var AppObjectWorkspace = OP.Component['ab_work_object'](App);
	var AppInterfaceWorkspace = OP.Component['ab_work_interface'](App);

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		autoheight: true,
		autowidth: true,
		rows: [
			{
				view: "toolbar",
				id: ids.toolBar,
				autowidth: true,
				cols: [
					{
						view: "button", value: labels.application.backToApplication, width: 250, align: "right", click: function () {
							App.actions.transitionApplicationChooser();
						}
					},
					{
						id: ids.buttonSync,
						view: "button",
						type: "iconButton",
						icon: "refresh",
						label: labels.application.synchronize,
						width: 250,
						//autowidth: true,
						align: "right",
						click: function () {
							_logic.synchronize();
						}
					},
					{ fillspace: true },
					{ view: "label", id: ids.labelAppName, width: 400, align: "right" }
				]
			},
			{ height: 10 },
			{
				view: "tabbar", 
				id: ids.tabbar, 
				value: ids.tab_object, 
				multiview: true,
				options: [
					{ 
						id: ids.tab_object, 
						value: labels.application.objectTitle, 
						width: 120 
					},
					{ 
						id: ids.tab_interface, 
						value: labels.application.interfaceTitle, 
						width: 120 
					}
				],
				on: {
					onChange: function (idNew, idOld) {
						if (idNew != idOld) {
							_logic.tabSwitch(idNew, idOld);
						}
					}
				}
			},
			{
				id: ids.workspace,
				cells: [
					AppObjectWorkspace.ui,
					AppInterfaceWorkspace.ui
				]
			}
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		
		AppObjectWorkspace.init();
		AppInterfaceWorkspace.init();

		// initialize the Object Workspace to show first.
		_logic.tabSwitch(ids.tab_object);
	}



	// our internal business logic 
	var _logic = {

		
		applicationInit:function(application) {

			// setup Application Label:
			$$(ids.labelAppName).define('label', application.label);
			$$(ids.labelAppName).refresh();

		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},


		/**
		 * @function synchronize
		 *
		 * Kick off the Synchronization process.
		 */
		synchronize:function() {

// self.element.trigger(self.options.synchronizeEvent, {
// 	appID: AD.classes.AppBuilder.currApp.id
// });
//// Question: where should this logic go?  Here or in ab.js ?

console.error('TODO: ab_work.logic.synchronize()!');
		},


		/**
		 * @function tabSwitch
		 *
		 * Every time a tab switch happens, decide which workspace to show.
		 *
		 * @param {string} idTab	the id of the tab that was changed to.
		 * @param {string} idOld	the previous tab id  
		 */
		tabSwitch:function(idTab, idOld) {

			switch( idTab ) {

				// Object Workspace Tab
				case ids.tab_object:
					$$(ids.buttonSync).show();
					App.actions.transitionObjectTab();
					break;

				// Interface Workspace Tab
				case ids.tab_interface:
					$$(ids.buttonSync).hide();
					App.actions.transitionInterfaceWorkspace();
					break;
			}

		}
	}



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function transitionWorkspace
		 *
		 * Switch the UI to view the App Workspace screen.
		 *
		 * @param {ABApplication} application 
		 */
		transitionWorkspace:function(application){

			_logic.applicationInit(application);
			App.actions.initObjectTab(application);
			App.actions.initInterfaceTab(application);

			_logic.show();			
			
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);

/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}



OP.Component.extend('ab_work_interface', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_interface_component'),

	}



	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		scroll: true,
		rows: [
{ view: "label", label:"interface workspace", width: 400, align: "right" },				
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		
		// /**
		//  * @function formBusy
		//  *
		//  * Show the progress indicator to indicate a Form operation is in 
		//  * progress.
		//  */
		// formBusy: function() {

		// 	$$(ids.form).showProgress({ type: 'icon' });
		// },


		// /**
		//  * @function formReady()
		//  *
		//  * remove the busy indicator from the form.
		//  */
		// formReady: function() {
		// 	$$(ids.form).hideProgress();
		// },


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {

		
		/**
		 * @function initInterfaceTab
		 *
		 * Initialize the Object Workspace with the given ABApplication.
		 *
		 * @param {ABApplication} application 
		 */
		initInterfaceTab:function(application) {
console.error('TODO: ab_work_interface.actions.initInterfaceTab()');
		},


		/**
		 * @function transitionInterfaceWorkspace
		 *
		 * Display the Interface Workspace UI
		 */
		transitionInterfaceWorkspace:function(){
			_logic.show();
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_work_object_list__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ab_work_object_workspace__ = __webpack_require__(16);

/*
 * ab_work_object
 *
 * Display the Object Tab UI:
 *
 */






function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}



OP.Component.extend('ab_work_object', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_component'),

	}

	var ObjectList = OP.Component['ab_work_object_list'](App);
	var ObjectWorkspace = OP.Component['ab_work_object_workspace'](App);


	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		cols: [
			ObjectList.ui,
			{ view: "resizer", autoheight: true },
			ObjectWorkspace.ui
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		
		ObjectWorkspace.init();
		ObjectList.init();

	}



	// our internal business logic 
	var _logic = {


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {

		
		/**
		 * @function initObjectTab
		 *
		 * Initialize the Object Workspace with the given ABApplication.
		 *
		 * @param {ABApplication} application 
		 */
		initObjectTab:function(application) {
			App.actions.populateObjectList(application);
			App.actions.clearObjectWorkspace();
		},


		/**
		 * @function transitionObjectTab
		 *
		 * Display the Object Tab UI
		 */
		transitionObjectTab:function(){
			_logic.show();
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ab_work_object_list_newObject__ = __webpack_require__(14);

/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */





function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),

	}
}



OP.Component.extend('ab_work_object_list', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_component'),

		list: App.unique('ab_work_object_list_editlist'),
		buttonNew: App.unique('ab_work_object_list_buttonNew'),

	}


	var PopupNewObjectComponent = OP.Component['ab_work_object_list_newObject'](App);
	var PopupNewObject = webix.ui(PopupNewObjectComponent.ui);
	// PopupNewObject.hide();

	// Our webix UI definition:
	var _ui = {
		id:ids.component,
		rows: [
			{
				view: App.custom.edittree.view,  // "editlist",
				id: ids.list,
				width: 250,
				select: true,
				editaction: 'custom',
				editable: true,
				editor: "text",
				editValue: "label",
				template: function(obj, common) { 
					return _logic.templateListItem(obj, common); 
				},
				type: {
					unsyncNumber: "<span class='ab-object-unsync'><span class='ab-object-unsync-number'></span> unsync</span>",
					iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
				},
				on: {
					onAfterRender: function () {
// webix.once(function () {
// 	$$(self.webixUiId.objectList).data.each(function (d) {
// 		$($$(self.webixUiId.objectList).getItemNode(d.id)).find('.ab-object-unsync-number').html(99);
// 	});
// });

// // Show gear icon
// if (this.getSelectedId(true).length > 0) {
// 	$(this.getItemNode(this.getSelectedId(false))).find('.ab-object-list-edit').show();
// 	self.refreshUnsyncNumber();
// }
					},
					onAfterSelect: function (id) {
// // Fire select object event
// self.element.trigger(self.options.selectedObjectEvent, id);

// // Refresh unsync number
// self.refreshUnsyncNumber();

// // Show gear icon
// $(this.getItemNode(id)).find('.ab-object-list-edit').show();
					},
					onAfterDelete: function (id) {
// // Fire unselect event 
// self.element.trigger(self.options.selectedObjectEvent, null);
					},
					onBeforeEditStop: function (state, editor) {
// if (!inputValidator.validateFormat(state.value)) {
// 	return false;
// }

// // Validation - check duplicate
// if (!inputValidator.rules.preventDuplicateObjectName(state.value, editor.id) && state.value != state.old) {
// 	webix.alert({
// 		title: self.labels.object.invalidName,
// 		ok: self.labels.common.ok,
// 		text: self.labels.object.duplicateName.replace("{0}", state.value)
// 	});

// 	return false;
// }
					},
					onAfterEditStop: function (state, editor, ignoreUpdate) {
// if (state.value != state.old) {
// 	var _this = this;

// 	this.showProgress({ type: 'icon' });

// 	var selectedObject = AD.classes.AppBuilder.currApp.objects.filter(function (item, index, list) { return item.id == editor.id; })[0];
// 	selectedObject.attr('label', state.value);

// 	// Call server to rename
// 	selectedObject.save()
// 		.fail(function () {
// 			_this.hideProgress();

// 			webix.message({
// 				type: "error",
// 				text: self.labels.common.renameErrorMessage.replace("{0}", state.old)
// 			});

// 			AD.error.log('Object List : Error rename object data', { error: err });
// 		})
// 		.then(function () {
// 			_this.hideProgress();

// 			if (selectedObject.translate) selectedObject.translate();

// 			// Show success message
// 			webix.message({
// 				type: "success",
// 				text: self.labels.common.renameSuccessMessage.replace('{0}', state.value)
// 			});

// 			// Show gear icon
// 			$(_this.getItemNode(editor.id)).find('.ab-object-list-edit').show();
// 		});
// }
					}
				},
				onClick: {
					"ab-object-list-edit": function (e, id, trg) {
// // Show menu
// $$(self.webixUiId.objectListMenuPopup).show(trg);

// return false;
					}
				}
			},
			{
				view: 'button',
				id: ids.buttonNew,
				value: labels.application.addNew,
				click: function () {

					App.actions.transitionNewObjectWindow();
// $$(self.webixUiId.addNewPopup).define('selectNewObject', true);
// $$(self.webixUiId.addNewPopup).show();
				}
			}
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {

		webix.extend($$(ids.list), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		listBusy:function() {
			$$(ids.list).showProgress({ type: "icon" });
		},

		listReady:function() {
			$$(ids.list).hideProgress();
		},

		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},


		syncNumberRefresh:function() {
console.error('TODO: syncNumRefresh()');
// var self = this,
// 	objects = [];

// objects = $$(self.webixUiId.objectList).data.find(function (d) {
// 	return objectName ? d.name == objectName : true;
// }, false, true);

// objects.forEach(function (obj) {
// 	var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, obj.name),
// 		unsyncNumber = (objectModel && objectModel.Cached ? objectModel.Cached.count() : 0),
// 		htmlItem = $($$(self.webixUiId.objectList).getItemNode(obj.id));

// 	if (unsyncNumber > 0) {
// 		htmlItem.find('.ab-object-unsync-number').html(unsyncNumber);
// 		htmlItem.find('.ab-object-unsync').show();
// 	}
// 	else {
// 		htmlItem.find('.ab-object-unsync').hide();
// 	}
// });
		},


		/**
		 * @function templateListItem
		 *
		 * Defines the template for each row of our ObjectList.
		 *
		 * @param {obj} obj the current instance of ABObject for the row.
		 * @param {?} common the webix.common icon data structure
		 * @return {string}
		 */
		templateListItem: function(obj, common) {
			return _templateListItem
				.replace('#label#', obj.label || '??label??')
				.replace('{common.iconGear}', common.iconGear);
		}
	}

	/*
	 * _templateListItem
	 * 
	 * The Object Row template definition.
	 */
	var _templateListItem = [
		"<div class='ab-object-list-item'>",
			"#label#",
			"{common.unsyncNumber}",
			"{common.iconGear}",
		"</div>",
	].join('');



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function populateObjectList()
		 *
		 * Initialize the Object List from the provided ABApplication
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		populateObjectList : function(application){
			_logic.listBusy();

			var objectList = application.objects();

			var List = $$(ids.list);
			List.clearAll();
			List.data.unsync();
			List.data.sync(objectList);
			List.refresh();
			List.unselectAll();

			_logic.syncNumberRefresh();
			_logic.listReady();

		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ab_work_object_list_newObject_blank__ = __webpack_require__(15);

/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Application.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),
							
	}
}



OP.Component.extend('ab_work_object_list_newObject', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_newObject_component'),

	}


	var BlankTab = OP.Component['ab_work_object_list_newObject_blank'](App);


	// Our webix UI definition:
	var _ui = {
		view: "window",
		id: ids.component,
		width: 400,
		position: "center",
		modal: true,
		head: labels.component.addNew,
		selectNewObject: true,
		on: {
			"onBeforeShow": function () {
				// blankObjectCreator.onInit();
				// importObjectCreator.onInit();
				// importCsvCreator.onInit();
			}
		},
		body: {
			view: "tabview",
			cells: [
				BlankTab.ui,
				// importObjectCreator.getCreateView(),
				// importCsvCreator.getCreateView()
			]
		}
	};



	// Our init() function for setting up our UI
	var _init = function() {
		
		BlankTab.init();
		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		
		// /**
		//  * @function formBusy
		//  *
		//  * Show the progress indicator to indicate a Form operation is in 
		//  * progress.
		//  */
		// formBusy: function() {

		// 	$$(ids.form).showProgress({ type: 'icon' });
		// },


		// /**
		//  * @function formReady()
		//  *
		//  * remove the busy indicator from the form.
		//  */
		// formReady: function() {
		// 	$$(ids.form).hideProgress();
		// },


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function transitionNewObjectWindow()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		transitionNewObjectWindow:function(){
			
			_logic.show();
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);

/*
 * ab_work_object_list_newObject_blank
 *
 * Display the form for creating a new Application.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}



OP.Component.extend('ab_work_object_list_newObject_blank', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_newObject_blank_component'),

	}



	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		scroll: true,
		rows: [
{ view: "label", label:"ab_work_object_list_newObject_blank row", width: 800, align: "right" },	
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		
		// /**
		//  * @function formBusy
		//  *
		//  * Show the progress indicator to indicate a Form operation is in 
		//  * progress.
		//  */
		// formBusy: function() {

		// 	$$(ids.form).showProgress({ type: 'icon' });
		// },


		// /**
		//  * @function formReady()
		//  *
		//  * remove the busy indicator from the form.
		//  */
		// formReady: function() {
		// 	$$(ids.form).hideProgress();
		// },


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function populateApplicationForm()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		// populateApplicationForm:function(Application){
			
		// 	_logic.formReset();
		// 	if (Application) {
		// 		// populate Form here:
		// 		_logic.formPopulate(Application);
		// 	}
		// 	_logic.permissionPopulate(Application);
		// 	_logic.show();
		// }

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_ABApplication__ = __webpack_require__(0);

/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}



OP.Component.extend('ab_work_object_workspace', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_workspace_component'),

	}



	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		scroll: true,
		rows: [
{ view: "label", label:"ab_work_object_workspace row", width: 800, align: "right" },	
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		
		// /**
		//  * @function formBusy
		//  *
		//  * Show the progress indicator to indicate a Form operation is in 
		//  * progress.
		//  */
		// formBusy: function() {

		// 	$$(ids.form).showProgress({ type: 'icon' });
		// },


		// /**
		//  * @function formReady()
		//  *
		//  * remove the busy indicator from the form.
		//  */
		// formReady: function() {
		// 	$$(ids.form).hideProgress();
		// },


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function populateApplicationForm()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		clearObjectWorkspace:function(){
			
console.error('TODO: clearObjectWorkspace()');
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})

/***/ }),
/* 17 */
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
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

/*
 * custom_edittree
 *
 * Create a custom webix component.
 *
 */


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {
		// formHeader: L('ab.application.form.header', "*Application Info"),
	}
}


var ComponentKey = 'ab_custom_edittree';
OP.CustomComponent.extend(ComponentKey, function(App, componentKey ) {
	// App 	{obj}	our application instance object.
	// componentKey {string}	the destination key in App.custom[componentKey] for the instance of this component:


	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('custom_edittree_component'),

	}



	// Our webix Prototype definition:
	var _ui = {
        name: App.unique("custom_edittree")	// keep this unique for this App instance.
    };



	// our internal business logic 
	var _logic = {

	}



	// Tell Webix to create an INSTANCE of our custom component:
    webix.protoUI(_ui, webix.EditAbility, webix.ui.tree);


    // current definition of our Component 
    var Component = {
		view: _ui.name,			// {string} the webix.view value for this custom component

		_logic: _logic			// {obj} 	Unit Testing
	}


	// Save our definition into App.custom.[key]
    App.custom = App.custom || {};
    App.custom[componentKey] = Component;


	// return the current definition of this component:
	return Component;

})


// After importing this custom component, you get back the .key to use to 
// lookup the OP.Component[] to create an application instance of 
/* harmony default export */ __webpack_exports__["a"] = { key: ComponentKey };

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__OP_OP__ = __webpack_require__(1);
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