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
/******/ 	return __webpack_require__(__webpack_require__.s = 32);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _OPOP = __webpack_require__(1);

var _OPOP2 = _interopRequireDefault(_OPOP);

__webpack_require__(29);

var _ABObject = __webpack_require__(10);

var _ABObject2 = _interopRequireDefault(_ABObject);

var _AllApplications = [];

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function toDC(data) {
	return new webix.DataCollection({
		data: data

	});
}

// on: {
// 	onAfterDelete: function(id) {

// 	}
// }
function toArray(DC) {
	var ary = [];

	var id = DC.getFirstId();
	while (id) {
		var element = DC.getItem(id);
		ary.push(element);
		id = DC.getNextId(id);
	}

	return ary;
}

var ABApplication = (function () {
	function ABApplication(attributes) {
		var _this = this;

		_classCallCheck(this, ABApplication);

		// ABApplication Attributes
		this.id = attributes.id;
		this.json = attributes.json;
		this.name = attributes.name || this.json.name || "";
		this.role = attributes.role;

		// multilingual fields: label, description
		_OPOP2["default"].Multilingual.translate(this, this.json, ABApplication.fieldsMultilingual());

		// import all our ABObjects
		var newObjects = [];
		(attributes.json.objects || []).forEach(function (obj) {
			newObjects.push(new _ABObject2["default"](obj, _this));
		});
		this._objects = newObjects;

		// import all our ABViews

		// instance keeps a link to our Model for .save() and .destroy();
		this.Model = _OPOP2["default"].Model.get('opstools.BuildApp.ABApplication');
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

	_createClass(ABApplication, [{
		key: "destroy",

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
		value: function destroy() {
			var _this2 = this;

			if (this.id) {
				return this.Model.destroy(this.id).then(function () {
					_AllApplications.remove(_this2.id);
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
	}, {
		key: "save",
		value: function save() {
			var _this3 = this;

			var values = this.toObj();

			// we already have an .id, so this must be an UPDATE
			if (values.id) {

				return this.Model.update(values.id, values).then(function () {
					_AllApplications.updateItem(values.id, _this3);
				});
			} else {

				// must be a CREATE:
				return this.Model.create(values).then(function (data) {
					_this3.id = data.id;
					_AllApplications.add(_this3, 0);
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
	}, {
		key: "toObj",
		value: function toObj() {

			_OPOP2["default"].Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());
			this.json.name = this.name;

			// for each Object: compile to json
			var currObjects = [];
			this._objects.forEach(function (obj) {
				currObjects.push(obj.toObj());
			});
			this.json.objects = currObjects;

			return {
				id: this.id,
				name: this.name,
				json: this.json,
				role: this.role
			};
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
	}, {
		key: "assignPermissions",
		value: function assignPermissions(permItems) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				AD.comm.service.put({
					url: '/app_builder/' + _this4.id + '/role/assign',
					data: {
						roles: permItems
					}
				}).fail(reject).done(resolve);
			});
		}

		/**
   * @method getPermissions()
   *
   * Return an array of role assignments that are currently assigned to this
   * ABApplication.
   *
   * @return {Promise} 	resolve(list) : list {array} Role assignments
   */
	}, {
		key: "getPermissions",
		value: function getPermissions() {
			var _this5 = this;

			return new Promise(function (resolve, reject) {

				AD.comm.service.get({ url: '/app_builder/' + _this5.id + '/role' }).fail(reject).done(resolve);
			});
		}

		/**
   * @method createPermission()
   *
   * Create a Role in the system after the name of the current ABApplication.
   *
   * @return {Promise} 	
   */
	}, {
		key: "createPermission",
		value: function createPermission() {
			var _this6 = this;

			return new Promise(function (resolve, reject) {

				// TODO: need to take created role and store as : .json.applicationRole = role.id

				AD.comm.service.post({ url: '/app_builder/' + _this6.id + '/role' }).fail(reject).done(resolve);
			});
		}

		/**
   * @method deletePermission()
   *
   * Remove the Role in the system of the current ABApplication.
   * (the one created by  .createPermission() )
   *
   * @return {Promise} 	
   */
	}, {
		key: "deletePermission",
		value: function deletePermission() {
			var _this7 = this;

			return new Promise(function (resolve, reject) {

				// TODO: need to remove created role from : .json.applicationRole
				AD.comm.service["delete"]({ url: '/app_builder/' + _this7.id + '/role' }).fail(reject).done(resolve);
			});
		}

		///
		/// Objects
		///

		/**
   * @method objects()
   *
   * return an array of all the ABObjects for this ABApplication.
   *
   * @param {fn} filter  	a filter fn to return a set of ABObjects that this fn 
   *						returns true for.
   * @return {array} 	array of ABObject
   */
	}, {
		key: "objects",
		value: function objects(filter) {

			filter = filter || function () {
				return true;
			};

			return this._objects.filter(filter);
		}

		/**
   * @method objectNew()
   *
   * return an instance of a new (unsaved) ABObject that is tied to this 
   * ABApplication.
   *
   * NOTE: this new object is not included in our this.objects until a .save() 
   * is performed on the object.
   *
   * @return {ABObject} 	
   */
	}, {
		key: "objectNew",
		value: function objectNew(values) {
			return new _ABObject2["default"](values, this);
		}

		/**
   * @method objectSave()
   *
   * persist the current ABObject in our list of ._objects.
   *
   * @param {ABObject} object 
   * @return {Promise} 	
   */
	}, {
		key: "objectSave",
		value: function objectSave(object) {
			var isIncluded = this.objects(function (o) {
				return o.id == object.id;
			}).length > 0;
			if (!isIncluded) {
				this._objects.push(object);
			}

			return this.save();
		}
	}], [{
		key: "allApplications",
		value: function allApplications() {
			return new Promise(function (resolve, reject) {

				var ModelApplication = _OPOP2["default"].Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll().then(function (data) {

					// NOTE: data is already a DataCollection from .findAll()
					_AllApplications = data;

					resolve(data);
				})["catch"](reject);
			});
		}

		/**
   * @function create
   *
   * take the initial values and create an instance of ABApplication.
   * 
   * @return {Promise} 
   */
	}, {
		key: "create",
		value: function create(values) {
			return new Promise(function (resolve, reject) {

				var newApp = {};
				_OPOP2["default"].Multilingual.unTranslate(values, newApp, ABApplication.fieldsMultilingual());
				values.json = newApp;
				newApp.name = values.name;

				var ModelApplication = _OPOP2["default"].Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.create(values).then(function (app) {

					// return an instance of ABApplication
					var App = new ABApplication(app);

					_AllApplications.add(App, 0);
					resolve(App);
				})["catch"](reject);
			});
		}

		/**
   * @method fieldsMultilingual()
   *
   * return an array of fields that are considered Multilingual labels for
   * an ABApplication
   * 
   * @return {array} 
   */
	}, {
		key: "fieldsMultilingual",
		value: function fieldsMultilingual() {
			return ['label', 'description'];
		}

		//// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

	}, {
		key: "isValid",
		value: function isValid(op, values) {

			var errors = null;

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:
				var arrayApplications = toArray(_AllApplications);

				var nameMatch = values.label.trim().replace(/ /g, '_').toLowerCase();
				var matchingApps = arrayApplications.filter(function (app) {
					return app.name.trim().toLowerCase() == nameMatch;
				});
				if (matchingApps && matchingApps.length > 0) {

					errors = _OPOP2["default"].Form.validationError({
						name: 'label',
						message: L('ab_form_application_duplicate_name', "*Name (#name#) is already in use").replace('#name#', nameMatch)
					}, errors);
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
	}]);

	return ABApplication;
})();

exports["default"] = ABApplication;
module.exports = exports["default"];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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


Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _form = __webpack_require__(3);

var _form2 = _interopRequireDefault(_form);

var _multilingual = __webpack_require__(5);

var _multilingual2 = _interopRequireDefault(_multilingual);

var _model = __webpack_require__(4);

var _model2 = _interopRequireDefault(_model);

var _util = __webpack_require__(6);

var _util2 = _interopRequireDefault(_util);

var _configConfig = __webpack_require__(2);

var _configConfig2 = _interopRequireDefault(_configConfig);

window.OP = {};

// OP.xxxx      These properties hold the defined Class/Controller/Model definitions
//              for our loaded projects.
// OP.UI = {};    		// webix UI definitions
// OP.Logic = {}; 		// logic references for webix application
OP.Component = {}; // our defined components

OP.CustomComponent = {}; // separate holder for Webix Custom Components

// OP.UI.extend = function(key, definition) {
// 	OP.UI[key] = definition;
// }

OP.Component.extend = function (key, fn) {
	OP.Component[key] = function (App) {

		//// TODO: verify App has proper structure:
		if (!App) {
			App = OP.Component._newApp();
		}

		// make an instance of the component.
		var component = fn(App);

		// transfer to App, any actions in the component:
		if (component.actions) {
			for (var a in component.actions) {
				App.actions[a] = component.actions[a];
			}
		}

		return component;
	};
};

OP.Component._newApp = function () {
	return {

		uuid: webix.uid(),

		/*
   * actions:
   * a hash of exposed application methods that are shared among our 
   * components, so one component can invoke an action that updates 
   * another component.
   */
		actions: {},

		/*
   * config
   * webix configuration settings for our current browser
   */
		config: _configConfig2["default"].config(),

		/*
   * custom
   * a collection of custom components for this App Instance.
   */
		custom: {},

		/*
   * labels
   * a collection of labels that are common for the Application.
   */
		labels: {},

		/*
   * unique()
   * A function that returns a globally unique Key.
   * @param {string} key   The key to modify and return.
   * @return {string} 
   */
		unique: function unique(key) {
			return key + this.uuid;
		}

	};
};

OP.CustomComponent.extend = function (key, fn) {
	OP.CustomComponent[key] = function (App, key) {

		if (!App) {
			App = OP.Component._newApp();
		}

		// make an instance of the component.
		return fn(App, key);
	};
};

OP.Dialog = AD.op.Dialog;

OP.Error = AD.error;

OP.Form = _form2["default"];

OP.Multilingual = _multilingual2["default"];
OP.Model = _model2["default"];

OP.Util = _util2["default"];

exports["default"] = OP;

// }

// import "./model.js"
module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @class config
 *
 * Manage our configuration settings.
 */



Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _configBrowser = __webpack_require__(7);

var _configBrowser2 = _interopRequireDefault(_configBrowser);

var _configMobile = __webpack_require__(8);

var _configMobile2 = _interopRequireDefault(_configMobile);

exports["default"] = {
  config: function config() {

    // TODO: decide which config file to return here:
    return _configBrowser2["default"];
  }
};
module.exports = exports["default"];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = {

	/**
  * @function OP.Form.validationError
  *
  * creates an error object that can be used in OP.Form.isValidationError()
  * to update a webix form with error validation messages.
  *
  * @param {json} error 	an error object
  *				error.name	{string} the attribute name (Form.element[error.name])
  *				error.message {string} the message to display for the error
  *
  * @return {obj} an error object.
  */
	validationError: function validationError(error, errorObj) {

		errorObj = errorObj || {
			error: 'E_VALIDATION',
			invalidAttributes: {}
		};

		var attr = errorObj.invalidAttributes;
		attr[error.name] = attr[error.name] || [];

		attr[error.name].push(error);

		return errorObj;
	},

	/**
  * @function OP.Form.isValidationError
  *
  * scans the given error to see if it is a sails' respone about an invalid
  * value from one of the form elements.
  *
  * @codestart
  * var form = $$('formID');
  * var values = form.getValues();
  * model.attr(values);
  * model.save()
  * .fail(function(err){
  *     if (!OP.Form.isValidationError(err, form)) {
  *         OP.error.log('Error saving current model ()', {error:err, values:values});
  *     }
  * })
  * .then(function(newData){
  * 
  * });
  * @codeend
  *
  * @param {obj} error  the error response object
  * @param {obj} form   the webix form instance (or reference)
  * @return {bool}      true if error was about a form element.  false otherwise.
  */
	isValidationError: function isValidationError(error, form) {

		// {bool} have we set focus to form component?
		var hasFocused = false;

		// if we have an error object:
		if (error) {

			//// if the error obj is provided by Sails response,
			//// do some clean up on the error object:

			// dig down to sails provided error object:
			if (error.error && error.error == 'E_UNKNOWN' && error.raw && error.raw.length > 0) {

				error = error.raw[0];
			}

			// drill down to the embedded .err object if it exists
			if (error.err) {
				error = error.err;
			}

			//// Now process the error object
			////
			if (error.error && error.error == 'E_VALIDATION' || error.code && error.code == 'E_VALIDATION') {

				var attrs = error.invalidAttributes;
				if (attrs) {

					var wasForm = false;
					for (var attr in attrs) {

						// if this is a field in the form:
						if (form.elements[attr]) {

							var errors = attrs[attr];
							var msg = [];
							errors.forEach(function (err) {
								msg.push(err.message);
							});

							// set the invalid error message
							form.markInvalid(attr, msg.join(', '));

							// set focus to the 1st form element we mark:
							if (!hasFocused) {
								form.elements[attr].focus();
								hasFocused = true;
							}

							wasForm = true;
						}
					}

					if (wasForm) {
						return true;
					}
				}
			}
		}

		// if we missed updating our form with an error
		// this was not a validation error so return false
		return false;
	}

};
module.exports = exports['default'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _restURLs = {
	findAll: 'GET #url#',
	findOne: 'GET #url#/{id}',
	create: 'POST #url#',
	update: 'PUT #url#/{id}',
	destroy: 'DELETE #url#/{id}'
};

var _Models = {};

var OPModel = (function () {
	function OPModel(key, staticData, instanceData) {
		_classCallCheck(this, OPModel);

		this.key = key;
		this.staticData = staticData;
		this.instanceData = instanceData;
		this.Model = staticData.Model;

		this.url = {};
		for (var r in _restURLs) {
			this.url[r] = staticData[r];
		}
	}

	_createClass(OPModel, [{
		key: 'Models',
		value: function Models(Model) {
			this.Model = Model;
		}
	}, {
		key: 'findAll',
		value: function findAll(cond) {
			var _this = this;

			return new Promise(function (resolve, reject) {

				// NOTE: currently reusing AD.Model

				// var Model = AD.Model.get(this.key);
				// Model.findAll(cond)

				var service = _this.service('findAll');

				AD.comm.service[service.verb]({ url: service.url, params: cond }).fail(reject).done(function (data) {

					data = data.data || data;

					// our findAll() should return an array of items.
					if (!Array.isArray(data)) {
						data = [data];
					}

					// return instances of this.Model if provided:
					if (_this.Model) {
						var newList = []; // Model.List();
						data.forEach(function (l) {
							if (l) {
								newList.push(new _this.Model(l));
							}
						});

						data = newList;
					}

					// convert to a WebixDataCollection:
					var dc = new webix.DataCollection({
						data: data,

						on: {
							onAfterDelete: function onAfterDelete(id) {}
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
			});
		}
	}, {
		key: 'findOne',
		value: function findOne(cond) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				var service = _this2.service('findOne');

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

				AD.comm.service[service.verb]({ url: service.url, params: cond }).fail(reject).done(function (item) {
					if (item.translate) item.translate();

					resolve(item.attr ? item.attr() : item);
				});
			});
		}
	}, {
		key: 'create',
		value: function create(attr) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {

				var service = _this3.service('create');

				AD.comm.service[service.verb]({ url: service.url, params: attr }).fail(reject).done(function (item) {
					if (item.translate) item.translate();

					resolve(item.attr ? item.attr() : item);
				});
			});
		}
	}, {
		key: 'update',
		value: function update(id, attr) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {

				var service = _this4.service('update', id);

				AD.comm.service[service.verb]({ url: service.url, params: attr }).fail(reject).done(resolve);
			});
		}
	}, {
		key: 'destroy',
		value: function destroy(id) {
			var _this5 = this;

			return new Promise(function (resolve, reject) {

				var service = _this5.service('destroy', id);

				AD.comm.service[service.verb]({ url: service.url, params: {} }).fail(reject).done(resolve);
			});
		}
	}, {
		key: 'service',
		value: function service(key, id) {
			var parts = this.url[key].split(' ');
			var verb = parts[0].toLowerCase();
			var uri = parts.pop();

			if (id) {
				var key = '{id}';
				uri = AD.util.string.replaceAll(uri, key, id);
			}

			return {
				verb: verb,
				url: uri
			};
		}
	}]);

	return OPModel;
})();

exports['default'] = {

	extend: function extend(key, staticData, instance) {

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

	get: function get(key) {
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
var findObject = function findObject(baseObj, name) {

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
	});

	return curr;
};

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
var objectName = function objectName(name) {

	// first lets figure out our namespacing:
	var nameList = name.split('.');
	var objName = nameList.pop(); // remove the last one.

	return objName;
};

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
var nameSpace = function nameSpace(baseObj, name) {

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
	});

	return curr;
};
module.exports = exports['default'];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * OP.Multilingual
 *
 * A set of helpers for Multilingual Data.
 *
 */



Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = {

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
	translate: function translate(obj, json, fields) {

		if (!json.translations) {
			json.translations = [];
		}

		var currLanguage = AD.lang.currentLanguage || 'en';

		if (fields && fields.length > 0) {

			json.translations.forEach(function (t) {
				// find the translation for the current language code
				if (t.language_code == currLanguage) {

					// copy each field to the root object
					fields.forEach(function (f) {
						obj[f] = t[f] || ''; // default to '' if not found.
					});
				}
			});
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
	unTranslate: function unTranslate(obj, json, fields) {

		json = json || {};
		fields = fields || [];

		if (!json.translations) {
			json.translations = [];
		}

		var currLanguage = AD.lang.currentLanguage || 'en';

		if (fields && fields.length > 0) {

			var foundOne = false;

			json.translations.forEach(function (t) {
				// find the translation for the current language code
				if (t.language_code == currLanguage) {

					// copy each field to the root object
					fields.forEach(function (f) {
						t[f] = obj[f];
					});

					foundOne = true;
				}
			});

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
				});

				json.translations.push(trans);
			}
		}
	}
};
module.exports = exports['default'];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = {

	uuid: AD.util.uuid

};
module.exports = exports["default"];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @class configBrower
 *
 * Manage our configuration settings for Web Browser styles.

 */



Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = {

	// button types

	// column types

	// spacers

	labelWidthSmall: 50

};
module.exports = exports["default"];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @class configBrower
 *
 * Manage our configuration settings for Web Browser styles.

 */



Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = {

	// button types

	// column types

	// spacers

	labelWidthSmall: 10

};
module.exports = exports["default"];

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* 
 * ABFieldManager
 * 
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */



Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _dataFieldsABFieldString = __webpack_require__(13);

var _dataFieldsABFieldString2 = _interopRequireDefault(_dataFieldsABFieldString);

/* 
 * Fields
 * A type => ABField  hash of the different ABFields available.
 */
var Fields = {};
Fields[_dataFieldsABFieldString2["default"].type()] = _dataFieldsABFieldString2["default"];

exports["default"] = {

	/*
  * @function allFields
  * return all the currently defined ABFields in an array.
  * @return [{ABField},...]
  */
	allFields: function allFields() {
		var fields = [];
		for (var f in Fields) {
			fields.push(Fields[f]);
		}
		return fields;
	},

	/*
  * @function newField
  * return an instance of an ABField based upon the values.type value.
  * @return {ABField}
  */
	newField: function newField(values, object) {

		if (values.type) {
			return new Fields[values.type](values, object);
		} else {

			//// TODO: what to do here?
		}
	}

};
module.exports = exports["default"];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _OPOP = __webpack_require__(1);

var _OPOP2 = _interopRequireDefault(_OPOP);

var _ABFieldManager = __webpack_require__(9);

var _ABFieldManager2 = _interopRequireDefault(_ABFieldManager);

function toDC(data) {
	return new webix.DataCollection({
		data: data

	});
}

// on: {
// 	onAfterDelete: function(id) {

// 	}
// }
function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABObject = (function () {
	function ABObject(attributes, application) {
		var _this = this;

		_classCallCheck(this, ABObject);

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
		this.id = attributes.id;
		this.name = attributes.name || "";
		this.labelFormat = attributes.labelFormat || "";
		this.isImported = attributes.isImported || 0;
		this.urlPath = attributes.urlPath || "";
		this.importFromObject = attributes.importFromObject || "";
		this.translations = attributes.translations;

		this.objectWorkspace = attributes.objectWorkspace || {
			hiddenFields: [] };

		// multilingual fields: label, description
		// array of [ids] to add hidden:true to
		_OPOP2["default"].Multilingual.translate(this, this, ['label']);

		// import all our ABObjects
		var newFields = [];
		(attributes.fields || []).forEach(function (field) {
			newFields.push(_this.fieldNew(field));
		});
		this._fields = newFields;

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

	_createClass(ABObject, [{
		key: "isValid",
		value: function isValid() {
			var _this2 = this;

			var errors = null;

			// label/name must be unique:
			var isNameUnique = this.application.objects(function (o) {
				return o.name.toLowerCase() == _this2.name.toLowerCase();
			}).length == 0;
			if (!isNameUnique) {
				errors = _OPOP2["default"].Form.validationError({
					name: 'name',
					message: L('ab.validation.object.name.unique', 'Object name must be unique (#name# already used in this Application)').replace('#name#', this.name)
				}, errors);
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
	}, {
		key: "destroy",
		value: function destroy() {
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
   * persist this instance of ABObject with it's parent ABApplication
   *
   * 
   * @return {Promise} 	
   *						.resolve( {this} )
   */
	}, {
		key: "save",
		value: function save() {
			var _this3 = this;

			return new Promise(function (resolve, reject) {

				// if this is our initial save()
				if (!_this3.id) {

					_this3.id = _OPOP2["default"].Util.uuid(); // setup default .id
					_this3.label = _this3.label || _this3.name;
					_this3.urlPath = _this3.urlPath || _this3.application.name + '/' + _this3.name;
				}

				_this3.application.objectSave(_this3).then(function () {
					resolve(_this3);
				})["catch"](function (err) {
					reject(err);
				});
			});
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
	}, {
		key: "toObj",
		value: function toObj() {

			_OPOP2["default"].Multilingual.unTranslate(this, this, ["label"]);

			// // for each Object: compile to json
			var currFields = [];
			this._fields.forEach(function (obj) {
				currFields.push(obj.toObj());
			});

			return {
				id: this.id,
				name: this.name,
				labelFormat: this.labelFormat,
				isImported: this.isImported,
				urlPath: this.urlPath,
				importFromObject: this.importFromObject,
				objectWorkspace: this.objectWorkspace,
				translations: this.translations,
				fields: currFields
			};
		}

		///
		/// Fields
		///

		/**
   * @method fields()
   *
   * return an array of all the ABFields for this ABObject.
   *
   * @return {array} 	
   */
	}, {
		key: "fields",
		value: function fields(filter) {

			filter = filter || function () {
				return true;
			};

			return this._fields.filter(filter);
		}

		/**
   * @method fieldNew()
   *
   * return an instance of a new (unsaved) ABField that is tied to this 
   * ABObject.
   *
   * NOTE: this new field is not included in our this.fields until a .save() 
   * is performed on the field.
   *
   * @return {ABField} 	
   */
	}, {
		key: "fieldNew",
		value: function fieldNew(values) {
			// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
			return _ABFieldManager2["default"].newField(values, this);
		}

		/**
   * @method fieldSave()
   *
   * save the given ABField in our ._fields array and persist the current 
   * values.
   *
   * @param {ABField} field The instance of the field to save.
   * @return {Promise} 	
   */
	}, {
		key: "fieldSave",
		value: function fieldSave(field) {
			var isIncluded = this.fields(function (o) {
				return o.id == field.id;
			}).length > 0;
			if (!isIncluded) {
				this._fields.push(field);
			}

			return this.save();
		}

		///
		///	Object Workspace Settings
		///

	}, {
		key: "columnHeaders",

		///
		/// Working with Actual Object Values:
		///

		// return the column headers for this object
		// @param {bool} isObjectWorkspace  return the settings saved for the object workspace
		value: function columnHeaders(isObjectWorkspace) {

			var headers = [];
			var idLookup = {};

			// get the header for each of our fields:
			this._fields.forEach(function (f) {
				var header = f.columnHeader(isObjectWorkspace);
				headers.push(header);
				idLookup[header.id] = f.id; // name => id
			});

			// update our headers with any settings applied in the Object Workspace
			if (isObjectWorkspace) {

				// set column width to adjust:true by default;
				headers.forEach(function (h) {
					h.adjust = true;
				});

				// hide any hiddenfields
				this.workspaceHiddenFields.forEach(function (hfID) {
					headers.forEach(function (h) {
						if (idLookup[h.id] == hfID) {
							h.hidden = true;
						}
					});
				});
			}

			return headers;
		}
	}, {
		key: "workspaceHiddenFields",
		get: function get() {
			return this.objectWorkspace.hiddenFields;
		},
		set: function set(fields) {
			this.objectWorkspace.hiddenFields = fields;
		}
	}]);

	return ABObject;
})();

exports["default"] = ABObject;
module.exports = exports["default"];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * AB 
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

__webpack_require__(1);

__webpack_require__(14);

__webpack_require__(18);

// Import our Custom Components here:
var _webix_custom_componentsEdittree = __webpack_require__(31);

var _webix_custom_componentsEdittree2 = _interopRequireDefault(_webix_custom_componentsEdittree);

var _webix_custom_componentsEditlist = __webpack_require__(30);

var _webix_custom_componentsEditlist2 = _interopRequireDefault(_webix_custom_componentsEditlist);

OP.Component.extend('ab', function (App) {

	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	// setup the common labels for our AppBuilder Application.
	App.labels = {
		add: L('ab.common.add', "*Add"),
		create: L('ab.common.create', "*Create"),
		"delete": L('ab.common.delete', "*Delete"),
		edit: L('ab.common.edit', "*Edit"),
		"export": L('ab.common.export', "*Export"),
		formName: L('ab.common.form.name', "*Name"),
		"import": L('ab.common.import', "*Import"),
		ok: L('ab.common.ok', "*Ok"),

		cancel: L('ab.common.cancel', "*Cancel"),
		save: L('ab.common.save', "*Save"),

		yes: L('ab.common.yes', "*Yes"),
		no: L('ab.common.no', "*No"),

		createErrorMessage: L('ab.common.create.error', "*System could not create <b>{0}</b>."),
		createSuccessMessage: L('ab.common.create.success', "*<b>{0}</b> is created."),

		updateErrorMessage: L('ab.common.update.error', "*System could not update <b>{0}</b>."),
		updateSucessMessage: L('ab.common.update.success', "*<b>{0}</b> is updated."),

		deleteErrorMessage: L('ab.common.delete.error', "*System could not delete <b>{0}</b>."),
		deleteSuccessMessage: L('ab.common.delete.success', "*<b>{0}</b> is deleted."),

		// Data Field  common Property labels:
		dataFieldHeaderLabel: L('ab.dataField.common.headerLabel', '*Label'),
		dataFieldHeaderLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Header Name'),

		dataFieldColumnName: L('ab.dataField.common.columnName', '*Name'),
		dataFieldColumnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Column Name'),

		dataFieldShowIcon: L('ab.dataField.common.showIcon', '*show icon?')
	};

	// make instances of our Custom Components:
	OP.CustomComponent[_webix_custom_componentsEdittree2['default'].key](App, 'edittree'); // ->  App.custom.edittree  now exists
	OP.CustomComponent[_webix_custom_componentsEditlist2['default'].key](App, 'editlist'); // ->  App.custom.editlist  now exists

	var ids = {
		component: App.unique('app_builder_root')
	};

	// Define the external components used in this Component:
	var AppChooser = OP.Component['ab_choose'](App);
	var AppWorkspace = OP.Component['ab_work'](App);

	// This component's UI definition:
	// Application multi-views
	var _ui = {
		id: ids.component,
		view: "multiview",
		autoheight: true,
		autowidth: true,
		rows: [AppChooser.ui, AppWorkspace.ui]
	};

	// This component's init() definition:
	var _init = function _init() {

		AppChooser.init();
		AppWorkspace.init();

		// start off only showing the App Chooser:
		App.actions.transitionApplicationChooser();

		// perform an initial resize adjustment
		$$(ids.component).adjust();
	};

	// Expose any globally accessible Actions:
	var _actions = {};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions // {ob}		hash of fn() to expose so other components can access.
	};
});

//// REFACTORING TODOs:
// TODO: AppForm-> Permissions : refresh permission list, remove AppRole permission on Application.delete().

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* 
 * ABField
 * 
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */



Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _OPOP = __webpack_require__(1);

var _OPOP2 = _interopRequireDefault(_OPOP);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABField = (function () {
	function ABField(values, object) {
		_classCallCheck(this, ABField);

		this.label = values.label || '';
		this.columnName = values.columnName || '';
		this.showIcon = values.showIcon || "true";

		// convert from "true" => true
		this.showIcon = this.showIcon === "true" ? true : false;

		// label is a multilingual value:
		_OPOP2['default'].Multilingual.translate(this, values, ['label']);
	}

	///
	/// Static Methods
	///
	/// Available to the Class level object.  These methods are not dependent
	/// on the instance values of the Application.
	///

	_createClass(ABField, [{
		key: 'isValid',

		/* 
   * @method isValid
   * check the current values to make sure they are valid.
   * Here we check the default values provided by ABField.
   *
   * @return null or [{OP.Form.validationError()}] objects.
   */
		value: function isValid() {
			var _this = this;

			var errors = null;

			// .columnName must be unique among fileds on the same object
			var isNameUnique = this.object.fields(function (f) {
				return f.columnName.toLowerCase() == _this.columnName.toLowerCase();
			}).length == 0;
			if (!isNameUnique) {
				errors = _OPOP2['default'].Form.validationError({
					name: 'columnName',
					message: L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name)
				}, errors);
			}

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
	}, {
		key: 'destroy',
		value: function destroy() {
			if (this.id) {
				console.error('TODO: ABField.destroy()');
			}
		}

		/**
   * @method save()
   *
   * persist this instance of ABField with it's parent ABObject
   *
   * 
   * @return {Promise} 	
   *						.resolve( {this} )
   */
	}, {
		key: 'save',
		value: function save() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				// if this is our initial save()
				if (!_this2.id) {
					_this2.id = _OPOP2['default'].Util.uuid(); // setup default .id
				}

				_this2.object.fieldSave(_this2).then(function () {
					resolve(_this2);
				})['catch'](function (err) {
					reject(err);
				});
			});
		}

		/**
   * @method toObj()
   *
   * properly compile the current state of this ABField instance
   * into the values needed for saving to the DB.
   *
   * @return {json} 
   */
	}, {
		key: 'toObj',
		value: function toObj() {

			// store "label" in our translations
			_OPOP2['default'].Multilingual.unTranslate(this, this, ["label"]);

			return {
				columnName: this.columnName,
				showIcon: this.showIcon,
				translations: this.translations
			};
		}

		///
		/// Working with Actual Object Values:
		///

	}, {
		key: 'columnHeader',
		value: function columnHeader(isObjectWorkspace) {

			var config = {
				id: this.columnName,
				header: this.label
			};

			if (isObjectWorkspace) {
				if (this.showIcon) {
					config.header = '<span class="webix_icon fa-{icon}"></span>'.replace('{icon}', this.icon) + config.header;
				}
			}

			return config;
		}
	}], [{
		key: 'clearEditor',
		value: function clearEditor(App, ids) {

			var defaultValues = {
				label: '',
				columnName: '',
				showIcon: 1
			};

			for (var f in defaultValues) {
				var component = $$(ids[f]);
				component.setValue(defaultValues[f]);
			}
		}

		/**
   * @function definitionEditor
   *
   * Many DataFields share some base information for their usage 
   * in the AppBuilder.  The UI Editors have a common header 
   * and footer format, and this function allows child DataFields
   * to not have to define those over and over.
   *
   * The common layout header contains:
   *		[Menu Label]
   *		[textBox: labelName]
   *		[text:    description]
   *
   * The defined DataField UI will be added at the end of this.
   *
   * This routine actually updated the live DataField definition
   * with the common header info.
   *
   * @param {DataField} field  The DataField object to work with.
   */
	}, {
		key: 'definitionEditor',
		value: function definitionEditor(App, ids, _logic, Field) {

			/// TODO: maybe just pass in onChange instead of _logic
			/// if not onChange, then use our default:

			// setup our default labelOnChange functionality:
			var _onChange = function onChange(newVal, oldVal) {

				oldVal = oldVal || '';

				if (newVal != oldVal && oldVal == $$(ids.columnName).getValue()) {
					$$(ids.columnName).setValue(newVal);
				}
			};

			// if they provided a labelOnChange() override, use that:
			if (_logic.labelOnChange) {
				_onChange = _logic.labelOnChange;
			}

			var _ui = {
				// id: ids.component,
				rows: [{
					view: "label",
					label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', Field.icon()).replace('{1}', Field.menuName())
				}, {
					view: "text",
					id: ids.label,
					name: 'label',
					label: App.labels.dataFieldHeaderLabel,
					placeholder: App.labels.dataFieldHeaderLabelPlaceholder,
					labelWidth: 50,
					css: 'ab-new-label-name',
					on: {
						onChange: function onChange(newVal, oldVal) {
							_onChange(newVal, oldVal);
						}
					}
				}, {
					view: "text",
					id: ids.columnName,
					name: 'columnName',
					label: App.labels.dataFieldColumnName, // 'Name',
					placeholder: App.labels.dataFieldColumnNamePlaceholder, // 'Column name',
					labelWidth: App.config.labelWidthSmall
				}, {
					view: "label",
					id: ids.fieldDescription,
					label: Field.description()
				}, {
					view: 'checkbox',
					id: ids.showIcon,
					name: 'showIcon',
					labelRight: App.labels.dataFieldShowIcon, // 'Show icon',
					labelWidth: 0,
					value: true
				}]
			};

			return _ui;
		}
	}]);

	return ABField;
})();

exports['default'] = ABField;
module.exports = exports['default'];

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* 
 * ABFieldString
 * 
 * An ABFieldString defines a string field type.
 *
 */



Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ABField2 = __webpack_require__(12);

var _ABField3 = _interopRequireDefault(_ABField2);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		defaultText: L('ab.dataField.string.default', '*Default text'),
		supportMultilingual: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),

		// should be common?
		headerLabel: L('ab.dataField.common.headerLabel', '*Label'),
		headerLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Header Name'),

		columnName: L('ab.dataField.common.columnName', '*Name'),
		columnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Column Name'),

		showIcon: L('ab.dataField.common.showIcon', '*show icon?')
	}
};

/**
 * ABFieldStringComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving 
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldStringComponent = function ABFieldStringComponent(App) {

	labels.common = App.labels;

	var idBase = 'ab_datafield_string';
	var componentDefaults = {
		textDefault: '',
		supportMultilingual: 1
	};
	var ids = {

		component: App.unique(idBase + '_component'),

		textDefault: App.unique(idBase + '_textdefault'),
		supportMultilingual: App.unique(idBase + '_supportMultilingual'),

		// the common property fields
		label: App.unique(idBase + '_label'),
		columnName: App.unique(idBase + '_columnName'),
		fieldDescription: App.unique(idBase + '_fieldDescription'),
		showIcon: App.unique(idBase + '_showIcon')
	};

	//// NOTE: we merge in the common headers below.
	var _ui = {
		view: 'form',
		id: ids.component,
		autoheight: true,
		borderless: true,
		elements: [{
			view: "text",
			id: ids.textDefault,
			name: 'textDefault',
			placeholder: labels.component.defaultText
		}, {
			view: "checkbox",
			id: ids.supportMultilingual,
			name: 'multilingual',
			labelRight: labels.component.supportMultilingual,
			labelWidth: 0,
			value: true
		}],

		rules: {
			'label': webix.rules.isNotEmpty,
			'columnName': webix.rules.isNotEmpty
		}
	};

	var _init = function _init() {

		// perform any additional setup actions.
		// for example, don't want to show the description, then .hide() it here:
		// $$(ids.fieldDescription).hide();
	};

	var _logic = {

		/*
   * @function clear
   *
   * clear the form.
   */
		clear: function clear() {

			_ABField3['default'].clearEditor(App, ids);

			for (var f in componentDefaults) {
				var component = $$(ids[f]);
				component.setValue(componentDefaults[f]);
			}

			$$(ids.component).clearValidation();
		},

		/*
   * @function isValid
   *
   * checks the current values on the componet to see if they are Valid
   */
		isValid: function isValid() {

			return $$(ids.component).validate();
		},

		/*
   * @function labelOnChange
   *
   * The ABField.definitionEditor implements a default operation
   * to update the value of the .columnName with the current value of 
   * label.
   * 
   * if you want to override that functionality, implement this fn()
   *
   * @param {string} newVal	The new value of label
   * @param {string} oldVal	The previous value
   */
		// labelOnChange: function (newVal, oldVal) {

		// 	// When the Label value changes, update our Column Name value
		// 	// to match.

		// 	oldVal = oldVal || '';
		// 	if (newVal != oldVal &&
		// 		oldVal == $$(ids.columnName).getValue()) {
		// 		$$(ids.columnName).setValue(newVal);
		// 	}
		// },

		/*
   * @function populate
   *
   * populate the form with the given ABField instance provided.
   *
   * @param {ABFieldString} field
   */
		populate: function populate(field) {
			console.error('TODO: .populate()');
		},

		/*
   * @function show
   *
   * show this component.
   */
		show: function show() {
			$$(ids.component).clearValidation();
			$$(ids.component).show();
		},

		/*
   * @function values
   *
   * return the values for this form.
   * @return {obj}  
   */
		values: function values() {

			var values = $$(ids.component).getValues();
			values.type = ABFieldString.type();

			return values;
		}

	};

	// get the common UI headers entries, and insert them above ours here:
	// NOTE: put this here so that _logic is defined.
	var commonUI = _ABField3['default'].definitionEditor(App, ids, _logic, ABFieldString);
	_ui.elements = commonUI.rows.concat(_ui.elements);

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		// actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		// DataField exposed actions:
		clear: _logic.clear,
		isValid: _logic.isValid,
		populate: _logic.populate,
		show: _logic.show,
		values: _logic.values,

		_logic: _logic // {obj} 	Unit Testing
	};
};

var ABFieldString = (function (_ABField) {
	_inherits(ABFieldString, _ABField);

	function ABFieldString(values, object) {
		_classCallCheck(this, ABFieldString);

		_get(Object.getPrototypeOf(ABFieldString.prototype), 'constructor', this).call(this, values, object);

		this.id = values.id;
		this.type = values.type || ABFieldString.type();
		this.icon = values.icon || ABFieldString.icon();

		this.textDefault = values.textDefault || '';
		this.supportMultilingual = values.supportMultilingual || true;

		// add this if there are more multilingual labels than what our super() defines:
		// OP.Multilingual.translate(this, values, ['label']);

		this.object = object;
	}

	// ABFieldString.name = 'string'; // unique key to reference this specific DataField
	// ABFieldString.type = 'string'; // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	// ABFieldString.icon = 'font';   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	// ABFieldString.menuName = L('ab.dataField.string.menuName', '*Single line text'); 

	///
	/// Static Methods
	///
	/// Return the Definition related values for a String data field.
	///

	// unique key to reference this specific DataField

	_createClass(ABFieldString, [{
		key: 'isValid',

		////
		//// These refer to the Webix Component definitions for this data field:
		////

		// //
		// static editor () {
		// 	return 'text'
		// }

		// static filterType () {
		// 	return 'text'
		// }

		value: function isValid() {

			var errors = _get(Object.getPrototypeOf(ABFieldString.prototype), 'isValid', this).call(this);

			// errors = OP.Form.validationError({
			// 	name:'columnName',
			// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
			// }, errors);

			return errors;
		}

		///
		/// Instance Methods
		///

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
	}, {
		key: 'toObj',
		value: function toObj() {

			var obj = _get(Object.getPrototypeOf(ABFieldString.prototype), 'toObj', this).call(this);

			obj.id = this.id;
			obj.type = this.type;
			obj.icon = this.icon;
			obj.textDefault = this.textDefault;
			obj.supportMultilingual = this.supportMultilingual;

			return obj;
		}

		///
		/// Working with Actual Object Values:
		///

		// return the grid column header definition for this instance of ABFieldString
	}, {
		key: 'columnHeader',
		value: function columnHeader(isObjectWorkspace) {
			var config = _get(Object.getPrototypeOf(ABFieldString.prototype), 'columnHeader', this).call(this, isObjectWorkspace);

			config.editor = 'text';
			config.sort = 'string';

			return config;
		}
	}], [{
		key: 'name',
		value: function name() {
			return 'string';
		}

		// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	}, {
		key: 'type',
		value: function type() {
			return 'string';
		}

		// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	}, {
		key: 'icon',
		value: function icon() {
			return 'font';
		}

		// the multilingual text for the name of this data field.
	}, {
		key: 'menuName',
		value: function menuName() {
			return L('ab.dataField.string.menuName', '*Single line text');
		}

		// the multilingual text for the name of this data field.
	}, {
		key: 'description',
		value: function description() {
			return L('ab.dataField.string.description', '*short string value');
		}

		/*
   * @function propertiesComponent
   *
   * return a UI Component that contains the property definitions for this Field.
   *
   * @param {App} App the UI App instance passed around the Components.
   * @return {Component}
   */
	}, {
		key: 'propertiesComponent',
		value: function propertiesComponent(App) {
			return ABFieldStringComponent(App);
		}
	}]);

	return ABFieldString;
})(_ABField3['default']);

exports['default'] = ABFieldString;
module.exports = exports['default'];

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */



__webpack_require__(16);

__webpack_require__(15);

OP.Component.extend('ab_choose', function (App) {

	var ids = {
		component: App.unique('ab_choose')
	};

	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);

	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view: "multiview",
		id: ids.component,
		autoheight: true,
		cells: [AppList.ui, AppForm.ui]
	};

	// This component's Init definition:
	var _init = function _init() {

		AppList.init();
		AppForm.init();
	};

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function transitionApplicationChooser
   *
   * Switch the AppBuilder UI to show the Application Chooser component.
   */
		transitionApplicationChooser: function transitionApplicationChooser() {
			$$(ids.component).show();
		}

	};

	var _logic = {};

	// return the current instance of this component:
	return {
		ui: _ui,
		init: _init,
		actions: _actions,

		_logic: _logic // Unit Testing
	};
});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * AB Choose Form
 *
 * Display the form for creating a new Application.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	application: {

		formHeader: L('ab.application.form.header', "*Application Info"),
		placeholderName: L('ab.application.form.placeholderName', "*Application name"),
		placeholderDescription: L('ab.application.form.placeholderDescription', "*Application description"),

		sectionPermission: L('ab.application.form.sectionPermission', "*Permission"),
		permissionHeader: L('ab.application.form.headerPermission', "*Assign one or more roles to set permissions for user to view this app"),
		createNewRole: L('ab.application.form.createNewRoleButton', "*Create a new role to view this app"),

		invalidName: L('ab.application.invalidName', "*This application name is invalid"),
		duplicateName: L('ab.application.duplicateName', "*Name must be unique.")

	}
};

OP.Component.extend('ab_choose_form', function (App) {

	labels.common = App.labels;

	var ids = {
		formComponent: App.unique('ab_choose_form_component'),
		form: App.unique('ab-app-list-form'),
		appFormPermissionList: App.unique('ab-app-form-permission'),
		appFormCreateRoleButton: App.unique('ab-app-form-create-role'),

		saveButton: App.unique('ab-app-form-button-save')
	};

	var _ui = {
		id: ids.formComponent,
		scroll: true,
		rows: [{
			view: "toolbar",
			cols: [{ view: "label", label: labels.application.formHeader, fillspace: true }]
		}, {
			view: "form",
			id: ids.form,
			autoheight: true,
			margin: 0,
			elements: [{ type: "section", template: '<span class="webix_icon fa-edit" style="max-width:32px;"></span>Information', margin: 0 }, {
				name: "label",
				view: "text",
				label: labels.common.formName,
				required: true,
				placeholder: labels.application.placeholderName,
				labelWidth: 100,
				on: {
					onChange: function onChange(newValue, oldValue) {
						_logic.permissionRenameRole(newValue, oldValue);
					}
				}
			}, { name: "description", view: "textarea", label: labels.common.formDescription, placeholder: labels.application.placeholderDescription, labelWidth: 100, height: 100 }, { type: "section", template: '<span class="webix_icon fa-lock" style="max-width:32px;"></span>' + labels.application.sectionPermission }, {
				view: "toolbar",
				cols: [{
					template: labels.application.permissionHeader,
					type: 'header',
					borderless: true
				}, {
					view: "toggle",
					id: ids.appFormCreateRoleButton,
					type: "iconButton",
					width: 300,
					align: "right",
					offIcon: "square-o",
					onIcon: "check-square-o",
					label: labels.application.createNewRole,
					on: {
						onItemClick: function onItemClick(id, e) {
							if (this.getValue()) {

								// TODO: if not called from anywhere else, then move the name gathering into .permissionAddNew()
								// Add new app role
								var appName = $$(ids.form).elements["label"].getValue();
								_logic.permissionAddNew(appName);
							} else {

								// Remove app role
								_logic.permissionRemoveNew();
							}
						}
					}
				}]
			}, {
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
					onItemClick: function onItemClick(id, e, node) {
						if (this.getItem(id).isApplicationRole) {
							return;
						}

						if (this.isSelected(id)) {
							this.unselect(id);
						} else {
							var selectedIds = this.getSelectedId();

							if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
								if (selectedIds) selectedIds = [selectedIds];else selectedIds = [];
							}

							selectedIds.push(id);

							this.select(selectedIds);
						}
					}
				}
			}, { height: 5 }, {
				margin: 5, cols: [{ fillspace: true }, {
					id: ids.saveButton,
					view: "button", label: labels.common.save, type: "form", width: 100,
					click: function click() {

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
				}, {
					view: "button", value: labels.common.cancel, width: 100,
					click: function click() {
						_logic.cancel();
					}
				}]
			}]
		}]
	};

	var FormFields = ['label', 'description'];

	var _init = function _init() {
		webix.extend($$(ids.form), webix.ProgressBar);
		webix.extend($$(ids.appFormPermissionList), webix.ProgressBar);
	};

	var _logic = {

		/**
   * @function applicationCreate
   *
   * Step through the process of creating an ABApplication with the 
   * current state of the Form.
   *
   * @param {obj} values 	current value hash of the form values.
   */
		applicationCreate: function applicationCreate(values) {

			var newApp = {
				name: values.label,
				label: values.label,
				description: values.description
			};

			async.waterfall([function (cb) {
				// Create application data
				_classesABApplication2["default"].create(newApp).then(function (result) {
					cb(null, result);
				})["catch"](cb);
			}, function (createdApp, cb) {
				_logic.permissionSave(createdApp).then(function () {
					cb();
				})["catch"](cb);
			}], function (err) {
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
		applicationUpdate: function applicationUpdate(Application) {
			var values = _logic.formValues();

			async.waterfall([function (next) {
				_logic.permissionSave(Application).then(function (result) {
					next(null, result);
				})["catch"](next);
			}, function (app_role, next) {
				// Update application data
				Application.label = values.label;
				Application.description = values.description;

				if (app_role && app_role.id) Application.role = app_role.id;else Application.role = null;

				Application.save().then(function () {
					next();
				})["catch"](next);
			}], function (err) {

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
		buttonSaveDisable: function buttonSaveDisable() {
			$$(ids.saveButton).disable();
		},

		/**
   * @function buttonSaveEnable
   *
   * Re-enable the save button.
   */
		buttonSaveEnable: function buttonSaveEnable() {
			$$(ids.saveButton).enable();
		},

		/**
   * @function cancel
   *
   * Cancel the current Form Operation and return us to the AppList.
   */
		cancel: function cancel() {

			_logic.formReset();
			App.actions.transitionApplicationList();
		},

		/**
   * @function formBusy
   *
   * Show the progress indicator to indicate a Form operation is in 
   * progress.
   */
		formBusy: function formBusy() {

			$$(ids.form).showProgress({ type: 'icon' });
		},

		/**
   * @function formPopulate()
   *
   * populate the form values from the given ABApplication
   *
   * @param {ABApplication} application  instance of the ABApplication
   */
		formPopulate: function formPopulate(application) {

			var Form = $$(ids.form);

			// Populate data to form
			if (application) {
				FormFields.forEach(function (f) {
					if (Form.elements[f]) {
						Form.elements[f].setValue(application[f]);
					}
				});
			}

			// _logic.permissionPopulate(application);
		},

		/**
   * @function formReady()
   *
   * remove the busy indicator from the form.
   */
		formReady: function formReady() {
			$$(ids.form).hideProgress();
		},

		/**
   * @function formReset()
   *
   * return the form to an empty state.
   */
		formReset: function formReset() {

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
		formValidate: function formValidate(op) {
			// op : ['add', 'update', 'destroy']

			var Form = $$(ids.form);
			if (!Form.validate()) {
				// TODO : Error message

				_logic.buttonSaveEnable();
				return false;
			}

			var errors = _classesABApplication2["default"].isValid(op, Form.getValues());
			if (OP.Form.isValidationError(errors, Form)) {
				_logic.formReady();
				_logic.buttonSaveEnable();
				return false;
			}

			///// TODO:
			// Implement common Form Input Validations
			// convert this to: 
			// app = ABApplication.newApplication(Form.getValues())
			// errors = app.inValid()
			// if (OP.Form.isValidationError(errors, Form)) { }

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
		formValues: function formValues() {
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
		permissionAddNew: function permissionAddNew(appName) {

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
		permissionName: function permissionName(appName) {
			return appName + " Application Role";
		},

		/**
   * @function permissionPopulate
   *
   * fill out the Permission list
   *
   * @param {ABApplication} application	the current ABApplication we are editing
   */
		permissionPopulate: function permissionPopulate(application) {

			var PermForm = $$(ids.appFormPermissionList);
			// Get user's roles
			PermForm.showProgress({ type: 'icon' });
			async.waterfall([function (next) {
				AD.comm.service.get({ url: '/app_builder/user/roles' }).fail(function (err) {
					next(err);
				}).done(function (roles) {

					// scan the roles and determine if any of them have been created
					// after the current Application.name:
					var parsedRoles = roles.map(function (r) {
						if (application) {
							if (r.name == _logic.permissionName(application.name.split('_').join(' '))) {
								r.isApplicationRole = true;
							}
						}
						return r;
					});
					next(null, parsedRoles);
				});
			}, function (available_roles, next) {
				if (application && application.id) {
					application.getPermissions().then(function (selected_role_ids) {
						next(null, available_roles, selected_role_ids);
					})["catch"](function (err) {
						next(err);
					});
				} else {
					next(null, available_roles, []);
				}
			}, function (available_roles, selected_role_ids, next) {

				// mark the role(s) in available_roles that is tied
				// this application:
				if (application && application.role) {
					available_roles.forEach(function (r) {

						if (r.id == (application.role.id || application.role)) r.isApplicationRole = true;
					});
				}

				// Sort permission list
				available_roles.sort(function (a, b) {
					return a.isApplicationRole === b.isApplicationRole ? 0 : a.isApplicationRole ? -1 : 1;
				});

				// reload list from our available_roles
				PermForm.clearAll();
				PermForm.parse(available_roles);

				// mark which roles have already been selected
				if (selected_role_ids && selected_role_ids.length > 0) {
					// Select permissions
					PermForm.select(selected_role_ids);

					// Select create role application button
					var markCreateButton = available_roles.filter(function (r) {
						return r.isApplicationRole;
					}).length > 0 ? 1 : 0;
					$$(ids.appFormCreateRoleButton).setValue(markCreateButton);
				}

				next();
			}], function (err) {
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
		permissionRemoveNew: function permissionRemoveNew() {

			// find any roles that are put here from our application form:
			var appRoles = $$(ids.appFormPermissionList).find(function (perm) {
				return perm.isApplicationRole;
			});

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
		permissionRenameRole: function permissionRenameRole(newValue, oldValue) {

			var editRole = $$(ids.appFormPermissionList).find(function (d) {
				return d.name === _logic.permissionName(oldValue);
			});

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
		permissionSave: function permissionSave(app) {
			//// REFACTOR:
			// this step implies that ab_choose_form understands the intracies of how
			// ABApplication and Permissions work. 
			return new Promise(function (resolve, reject) {

				var saveRoleTasks = [],
				    appRole = null;

				//// Process the option to create a newRole For this Application:

				// if the button is set
				if ($$(ids.appFormCreateRoleButton).getValue()) {

					// check to see if we already have a permission that isApplicationRole
					var selectedPerms = $$(ids.appFormPermissionList).getSelectedItem(true);
					selectedPerms = selectedPerms.filter(function (perm) {
						return perm.isApplicationRole;
					});

					// if not, then create one:
					if (selectedPerms.length == 0) {

						// Create new role for application
						saveRoleTasks.push(function (cb) {
							app.createPermission().then(function (result) {

								// remember the Role we just created
								appRole = result;
								cb();
							})["catch"](cb);
						});
					}
				} else {
					// Delete any existing application roles
					saveRoleTasks.push(function (cb) {
						app.deletePermission().then(function () {
							cb();
						})["catch"](cb);
					});
				}

				//// Now process any additional roles:

				// get array of selected permissions that are not our newRole
				var permItems = $$(ids.appFormPermissionList).getSelectedItem(true);
				permItems = permItems.filter(function (item) {
					return item.id !== 'newRole';
				}); // Remove new role item

				// Make sure Application is linked to selected permission items:
				saveRoleTasks.push(function (cb) {

					// ok, so we removed the 'newRole' entry, but we might
					// have created an entry for it earlier, if so, add in 
					// the created one here:
					if ($$(ids.appFormCreateRoleButton).getValue() && appRole) {

						// make sure it isn't already in there:
						var appRoleItem = permItems.filter(function (item) {
							return item.id == appRole.id;
						});
						if (!appRoleItem || appRoleItem.length < 1) {

							// if not, add it :
							permItems.push({
								id: appRole.id,
								isApplicationRole: true
							});
						}
					}

					// Assign Role Permissions
					app.assignPermissions(permItems).then(function () {
						cb();
					})["catch"](cb);
				});

				async.series(saveRoleTasks, function (err, results) {
					if (err) {
						reject(err);
					} else {
						// we return the instance of the newly created Permission.
						resolve(appRole);
					}
				});
			});

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
		show: function show() {

			$$(ids.formComponent).show();
		}
	};

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
		transitionApplicationForm: function transitionApplicationForm(Application) {

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
		}

	};

	return {
		ui: _ui,
		init: _init,
		actions: _actions,

		_logic: _logic
	};
});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */


function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

__webpack_require__(17);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	application: {
		title: L('ab.application.application', '*Application'),
		createNew: L('ab.application.createNew', '*Add new application'),
		noApplication: L('ab.application.noApplication', "*There is no application data")

	}
};

OP.Component.extend('ab_choose_list', function (App) {

	labels.common = App.labels;

	var ids = {
		component: App.unique('ab_choose_listcomponent'),
		list: App.unique('ab_choose_list'),
		toolBar: App.unique('ab_choose_list_toolbar'),
		buttonCreateNewApplication: App.unique('ab_choose_list_buttonNewApp')
	};

	var MenuComponent = OP.Component['ab_choose_list_menu'](App);
	var PopupMenu = webix.ui(MenuComponent.ui);
	PopupMenu.hide();

	var _ui = {

		id: ids.component,

		cols: [

		//
		// Left Column Spacer
		//
		{ width: 100 },

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
				cols: [{ view: "label", label: labels.application.title, fillspace: true }, {
					id: ids.buttonCreateNewApplication,
					view: "button",
					value: labels.application.createNew,
					width: 200,
					click: function click() {

						// Inform our Chooser we have a request to create an Application:
						App.actions.transitionApplicationForm();
					}
				}, /* leave empty for a create */{
					view: "uploader",
					value: labels.common["import"],
					width: 200,
					upload: '/app_builder/appJSON',
					multiple: false,
					autosend: true,
					on: {
						onAfterFileAdd: function onAfterFileAdd() {
							this.disable();
							_logic.busy();
						},
						onFileUpload: function onFileUpload(item, response) {
							_logic.loadData(); // refresh app list
							this.enable();
							_logic.ready();
						},
						onFileUploadError: function onFileUploadError(details, response) {
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
				}]
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
				template: function template(obj, common) {
					return _logic.templateListItem(obj, common);
				},
				type: {
					height: 100, // Defines item height
					iconGear: "<span class='webix_icon fa-cog'></span>"
				},
				select: false,
				onClick: {
					"ab-app-list-item": function abAppListItem(e, id, trg) {
						_logic.busy();

						this.select(id);

						var selectedApp = this.getItem(id);

						if (selectedApp) {

							_logic.ready();

							// We've selected an Application to work with
							App.actions.transitionWorkspace(selectedApp);
						}

						return false; // block default behavior
					},
					"ab-app-list-edit": function abAppListEdit(e, id, trg) {
						// Show menu
						PopupMenu.show(trg);
						this.select(id);

						return false; // block default behavior
					}
				}
			}]
		},

		//
		// Right Column Spacer
		//
		{ width: 100 }]
	};

	var _data = {};

	var _logic = {

		/**
   * @function busy
   *
   * show a busy indicator on our App List
   */
		busy: function busy() {
			if ($$(ids.list).showProgress) $$(ids.list).showProgress({ icon: 'cursor' });
		},

		/**
   * @function loadData
   *
   * Load all the ABApplications and display them in our App List
   */
		loadData: function loadData() {

			// Get applications data from the server
			_logic.busy();
			_classesABApplication2["default"].allApplications().then(function (data) {

				_logic.ready();

				// make sure our overlay is updated when items are added/removed
				// from our data list.
				data.attachEvent("onAfterAdd", function (id, index) {
					_logic.refreshOverlay();
				});

				data.attachEvent("onAfterDelete", function (id) {
					_logic.refreshOverlay();
				});

				_data.listApplications = data;

				_logic.refreshList();
			})["catch"](function (err) {
				_logic.ready();
				webix.message({
					type: "error",
					text: err
				});
				AD.error.log('App Builder : Error loading application data', { error: err });
			});
		},

		/**
   * @function refreshOverlay
   *
   * If we have no items in our list, display a Message.
   */
		refreshOverlay: function refreshOverlay() {
			var appList = $$(ids.list);

			if (!appList.count()) //if no data is available
				appList.showOverlay(labels.application.noApplication);else appList.hideOverlay();
		},

		/**
   * @function ready
   *
   * remove the busy indicator on our App List
   */
		ready: function ready() {
			if ($$(ids.list).hideProgress) $$(ids.list).hideProgress();
		},

		/**
   * @function reset
   *
   * Return our App List to an unselected state.
   */
		reset: function reset() {
			$$(ids.list).unselectAll();
		},

		/**
   * @function refreshList
   *
   * Apply our list of ABApplication data to our AppList
   */
		refreshList: function refreshList() {

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
		show: function show() {
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
		templateListItem: function templateListItem(obj, common) {
			return _templateListItem.replace('#label#', obj.label || '').replace('#description#', obj.description || '').replace('{common.iconGear}', common.iconGear);
		}
	};

	/*
  * _templateListItem
  * 
  * The AppList Row template definition.
  */
	var _templateListItem = ["<div class='ab-app-list-item'>", "<div class='ab-app-list-info'>", "<div class='ab-app-list-name'>#label#</div>", "<div class='ab-app-list-description'>#description#</div>", "</div>", "<div class='ab-app-list-edit'>", "{common.iconGear}", "</div>", "</div>"].join('');

	/*
  * @function _init
  * 
  * The init() that performs the necessary setup for our AppList chooser.
  */
	var _init = function _init() {
		webix.extend($$(ids.list), webix.ProgressBar);
		webix.extend($$(ids.list), webix.OverlayBox);

		MenuComponent.init();

		// start things off by loading the current list of Applications
		_logic.loadData();
	};

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
		unselectApplication: function unselectApplication() {
			_logic.reset();
		},

		/**
   * @function getSelectedApplication
   *
   * returns which ABApplication is currently selected.
   * @return {ABApplication}  or {null} if nothing selected.
   */
		getSelectedApplication: function getSelectedApplication() {
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
		deleteApplication: function deleteApplication(app) {

			if (!app) return;

			// Delete application data
			_logic.busy();

			app.destroy().then(function (result) {
				_logic.reset();
				_logic.ready();

				webix.message({
					type: "success",
					text: labels.common.deleteSuccessMessage.replace('{0}', app.label)
				});
			})["catch"](function (err) {
				_logic.reset();
				_logic.ready();

				webix.message({
					type: "error",
					text: labels.common.deleteErrorMessage.replace("{0}", app.label)
				});

				AD.error.log('App Builder : Error delete application data', { error: err });
			});
		},

		/**
   * @function transitionApplicationList
   *
   * Trigger our List component to show
   */
		transitionApplicationList: function transitionApplicationList() {
			$$(ids.component).show();
		}
	};

	return {
		ui: _ui,
		init: _init,
		actions: _actions,

		_logic: _logic // exposed for Unit Testing
	};
});

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
		menu: L('ab.application.menu', "*Application Menu"),
		confirmDeleteTitle: L('ab.application.delete.title', "*Delete application"),
		confirmDeleteMessage: L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")
	}
};

OP.Component.extend('ab_choose_list_menu', function (App) {

	labels.common = App.labels;

	var ids = {
		menu: App.unique('ab_choose_list_menu')
	};

	var _ui = {
		view: "popup",
		id: ids.menu,
		head: labels.application.menu,
		width: 100,
		body: {
			view: "list",
			data: [{ command: labels.common.edit, icon: "fa-pencil-square-o" }, { command: labels.common['delete'], icon: "fa-trash" }, { command: labels.common['export'], icon: "fa-download" }],
			datatype: "json",

			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			autoheight: true,
			select: false,
			on: {
				'onItemClick': function onItemClick(timestamp, e, trg) {

					// hide our popup before we trigger any other possible UI animation: (like .edit)
					// NOTE: if the UI is animating another component, and we do .hide()
					// while it is in progress, the UI will glitch and give the user whiplash.
					$$(ids.menu).hide();

					var selectedApp = App.actions.getSelectedApplication();

					switch (trg.textContent.trim()) {
						case labels.common.edit:
							App.actions.transitionApplicationForm(selectedApp);
							break;

						case labels.common['delete']:
							OP.Dialog.ConfirmDelete({
								title: labels.application.confirmDeleteTitle,
								text: labels.application.confirmDeleteMessage.replace('{0}', selectedApp.label),
								callback: function callback(result) {

									if (!result) return;

									App.actions.deleteApplication(selectedApp);
								}
							});
							break;

						case labels.common['export']:
							// Download the JSON file to disk
							window.location.assign('/app_builder/appJSON/' + selectedApp.id + '?download=1');
							break;
					}

					return false;
				}
			}
		}
	};

	var _data = {};

	var _init = function _init() {};

	return {
		ui: _ui,
		init: _init
	};
});

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work
 *
 * Display the component for working with an ABApplication.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

__webpack_require__(20);

__webpack_require__(19);

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
};

OP.Component.extend('ab_work', function (App) {

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
		workspace: App.unique('ab_work_workspace')
	};

	var AppObjectWorkspace = OP.Component['ab_work_object'](App);
	var AppInterfaceWorkspace = OP.Component['ab_work_interface'](App);

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		autoheight: true,
		autowidth: true,
		rows: [{
			view: "toolbar",
			id: ids.toolBar,
			autowidth: true,
			cols: [{
				view: "button", value: labels.application.backToApplication, width: 250, align: "right", click: function click() {
					App.actions.transitionApplicationChooser();
				}
			}, {
				id: ids.buttonSync,
				view: "button",
				type: "iconButton",
				icon: "refresh",
				label: labels.application.synchronize,
				width: 250,
				//autowidth: true,
				align: "right",
				click: function click() {
					_logic.synchronize();
				}
			}, { fillspace: true }, { view: "label", id: ids.labelAppName, width: 400, align: "right" }]
		}, { height: 10 }, {
			view: "tabbar",
			id: ids.tabbar,
			value: ids.tab_object,
			multiview: true,
			options: [{
				id: ids.tab_object,
				value: labels.application.objectTitle,
				width: 120
			}, {
				id: ids.tab_interface,
				value: labels.application.interfaceTitle,
				width: 120
			}],
			on: {
				onChange: function onChange(idNew, idOld) {
					if (idNew != idOld) {
						_logic.tabSwitch(idNew, idOld);
					}
				}
			}
		}, {
			id: ids.workspace,
			cells: [AppObjectWorkspace.ui, AppInterfaceWorkspace.ui]
		}]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {

		AppObjectWorkspace.init();
		AppInterfaceWorkspace.init();

		// initialize the Object Workspace to show first.
		_logic.tabSwitch(ids.tab_object);
	};

	// our internal business logic
	var _logic = {

		applicationInit: function applicationInit(application) {

			// setup Application Label:
			$$(ids.labelAppName).define('label', application.label);
			$$(ids.labelAppName).refresh();
		},

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		},

		/**
   * @function synchronize
   *
   * Kick off the Synchronization process.
   */
		synchronize: function synchronize() {

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
		tabSwitch: function tabSwitch(idTab, idOld) {

			switch (idTab) {

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
	};

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function transitionWorkspace
   *
   * Switch the UI to view the App Workspace screen.
   *
   * @param {ABApplication} application 
   */
		transitionWorkspace: function transitionWorkspace(application) {

			_logic.applicationInit(application);
			App.actions.initObjectTab(application);
			App.actions.initInterfaceTab(application);

			_logic.show();
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
};

OP.Component.extend('ab_work_interface', function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_interface_component')

	};

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		scroll: true,
		rows: [{ view: "label", label: "interface workspace", width: 400, align: "right" }]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {}
	// webix.extend($$(ids.form), webix.ProgressBar);

	// our internal business logic
	;var _logic = {

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
		show: function show() {

			$$(ids.component).show();
		}
	};

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function initInterfaceTab
   *
   * Initialize the Object Workspace with the given ABApplication.
   *
   * @param {ABApplication} application 
   */
		initInterfaceTab: function initInterfaceTab(application) {
			console.error('TODO: ab_work_interface.actions.initInterfaceTab()');
		},

		/**
   * @function transitionInterfaceWorkspace
   *
   * Display the Interface Workspace UI
   */
		transitionInterfaceWorkspace: function transitionInterfaceWorkspace() {
			_logic.show();
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object
 *
 * Display the Object Tab UI:
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

__webpack_require__(21);

__webpack_require__(24);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
};

OP.Component.extend('ab_work_object', function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_component')

	};

	var ObjectList = OP.Component['ab_work_object_list'](App);
	var ObjectWorkspace = OP.Component['ab_work_object_workspace'](App);

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		cols: [ObjectList.ui, { view: "resizer", autoheight: true }, ObjectWorkspace.ui]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {

		ObjectWorkspace.init();
		ObjectList.init();
	};

	// our internal business logic
	var _logic = {

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		}
	};

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function initObjectTab
   *
   * Initialize the Object Workspace with the given ABApplication.
   *
   * @param {ABApplication} application 
   */
		initObjectTab: function initObjectTab(application) {
			App.actions.populateObjectList(application);
			App.actions.clearObjectWorkspace();
		},

		/**
   * @function transitionObjectTab
   *
   * Display the Object Tab UI
   */
		transitionObjectTab: function transitionObjectTab() {
			_logic.show();
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

__webpack_require__(22);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object')

	}
};

OP.Component.extend('ab_work_object_list', function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_component'),

		list: App.unique('ab_work_object_list_editlist'),
		buttonNew: App.unique('ab_work_object_list_buttonNew')

	};

	// There is a Popup for adding a new Object:
	var PopupNewObjectComponent = OP.Component['ab_work_object_list_newObject'](App);
	var PopupNewObject = webix.ui(PopupNewObjectComponent.ui);
	PopupNewObjectComponent.init();

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		rows: [{
			view: App.custom.editlist.view, // "editlist",
			id: ids.list,
			width: 250,

			// TODO: make this dynamically fill the screen:
			height: 800,

			select: true,
			editaction: 'custom',
			editable: true,
			editor: "text",
			editValue: "label",
			template: function template(obj, common) {
				return _logic.templateListItem(obj, common);
			},
			type: {
				height: "auto",
				unsyncNumber: "<span class='ab-object-unsync'><span class='ab-object-unsync-number'></span> unsync</span>",
				iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
			},
			on: {
				onAfterRender: function onAfterRender() {
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
				onAfterSelect: function onAfterSelect(id) {
					_logic.selectObject(id);
					// // Fire select object event
					// self.element.trigger(self.options.selectedObjectEvent, id);

					// // Refresh unsync number
					// self.refreshUnsyncNumber();

					// // Show gear icon
					// $(this.getItemNode(id)).find('.ab-object-list-edit').show();
				},
				onAfterDelete: function onAfterDelete(id) {
					// // Fire unselect event
					// self.element.trigger(self.options.selectedObjectEvent, null);
				},
				onBeforeEditStop: function onBeforeEditStop(state, editor) {
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
				onAfterEditStop: function onAfterEditStop(state, editor, ignoreUpdate) {
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
				"ab-object-list-edit": function abObjectListEdit(e, id, trg) {
					// // Show menu
					// $$(self.webixUiId.objectListMenuPopup).show(trg);

					// return false;
				}
			}
		}, {
			view: 'button',
			id: ids.buttonNew,
			value: labels.application.addNew,
			click: function click() {

				_logic.toNewObject();

				// $$(self.webixUiId.addNewPopup).define('selectNewObject', true);
				// $$(self.webixUiId.addNewPopup).show();
			}
		}]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {

		webix.extend($$(ids.list), webix.ProgressBar);
		$$(ids.component).adjust();
		$$(ids.list).adjust();
	};

	// our internal business logic
	var _logic = {

		listBusy: function listBusy() {
			$$(ids.list).showProgress({ type: "icon" });
		},

		listReady: function listReady() {
			$$(ids.list).hideProgress();
		},

		/**
   * @function selectObject()
   *
   * Perform these actions when an Object is selected in the List.
   */
		selectObject: function selectObject(id) {

			var object = $$(ids.list).getItem(id);
			App.actions.populateObjectWorkspace(object);
		},

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		},

		syncNumberRefresh: function syncNumberRefresh() {
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
		templateListItem: function templateListItem(obj, common) {
			return _templateListItem.replace('#label#', obj.label || '??label??').replace('{common.iconGear}', common.iconGear);
		},

		/**
   * @function toNewObject
   *
   * Manages initiating the transition to the new Object Popup window, 
   * as well as managing the new object that was created.
   *
   * @param {obj} obj the current instance of ABObject for the row.
   * @param {?} common the webix.common icon data structure
   * @return {string}
   */
		toNewObject: function toNewObject() {
			App.actions.transitionNewObjectWindow(CurrentApplication, function (err, newObject) {

				if (err) {
					return false;
				}

				objectList.add(newObject, 0);
				$$(ids.list).select(newObject.id);
			});
		}
	};

	/*
  * _templateListItem
  * 
  * The Object Row template definition.
  */
	var _templateListItem = ["<div class='ab-object-list-item'>", "#label#", "{common.unsyncNumber}", "{common.iconGear}", "</div>"].join('');

	var CurrentApplication = null;
	var objectList = null;

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
		populateObjectList: function populateObjectList(application) {
			_logic.listBusy();

			CurrentApplication = application;

			objectList = new webix.DataCollection({
				data: application.objects()
			});

			var List = $$(ids.list);
			List.clearAll();
			List.data.unsync();
			List.data.sync(objectList);
			List.refresh();
			List.unselectAll();

			_logic.syncNumberRefresh();
			_logic.listReady();
		},

		/**
   * @function getSelectedObject
   *
   * returns which ABObject is currently selected.
   * @return {ABObject}  or {null} if nothing selected.
   */
		getSelectedObject: function getSelectedObject() {
			return $$(ids.list).getSelectedItem();
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Application.
 *
 */



__webpack_require__(23);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object')

	}
};

OP.Component.extend('ab_work_object_list_newObject', function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_newObject_component')

	};

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
			"onBeforeShow": function onBeforeShow() {
				// blankObjectCreator.onInit();
				// importObjectCreator.onInit();
				// importCsvCreator.onInit();
			}
		},
		body: {
			view: "tabview",
			cells: [BlankTab.ui]
		}
	};

	// Our init() function for setting up our UI

	// importObjectCreator.getCreateView(),
	// importCsvCreator.getCreateView()
	var _init = function _init() {

		var ourCBs = {
			onCancel: _logic.hide,
			onSave: _logic.save
		};

		BlankTab.init(ourCBs);

		// webix.extend($$(ids.form), webix.ProgressBar);
	};

	// our internal business logic
	var _logic = {

		// *
		//  * @function cancel
		//  *
		//  * The Model Creator was canceled.

		// cancel: function() {

		// 	_logic.hide();
		// },

		/**
   * @function hide()
   *
   * remove the busy indicator from the form.
   */
		hide: function hide() {
			$$(ids.component).hide();
		},

		/**
   * @function save
   *
   * take the data gathered by our child creation tabs, and 
   * add it to our current application.
   *
   * @param {obj} values  key=>value hash of model values.
   * @param {fn}  cb 		node style callback to indicate success/failure
   */
		save: function save(values, cb) {

			// must have an application set.
			if (!currentApplication) {
				OP.Dialog.Alert({
					title: 'Shoot!',
					test: 'No Application Set!  Why?'
				});
				cb(true); // there was an error.
				return false;
			}

			var newObject = currentApplication.objectNew(values);

			var validationErrors = newObject.isValid();
			if (validationErrors) {
				cb(validationErrors);
				return false;
			}

			// if we get here, save the new Object
			newObject.save().then(function (obj) {

				// successfully done:
				cb();
				_logic.hide();
				currentCallBack(null, obj);
			})['catch'](function (err) {

				cb(err); // the current Tab
				// currentCallBack(err);	// the calling Component
			});
		},

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		}
	};

	var currentApplication = null;
	var currentCallBack = null;

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function transitionNewObjectWindow()
   *
   * Show our Create New Object window.
   *
   * @param {ABApplication} Application  	The current ABApplication 
   *										we are working with.
   */
		transitionNewObjectWindow: function transitionNewObjectWindow(Application, cb) {

			_logic.show();
			currentApplication = Application; // remember our current Application.
			currentCallBack = cb;
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_list_newObject_blank
 *
 * Display the form for creating a new Application.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABObject = __webpack_require__(10);

var _classesABObject2 = _interopRequireDefault(_classesABObject);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {
		placeholderName: L('ab.object.form.placeholderName', "*Object name")
	}
};

OP.Component.extend('ab_work_object_list_newObject_blank', function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_newObject_blank_component'),

		form: App.unique('ab_work_object_list_newObject_blank'),
		buttonSave: App.unique('ab-object-blank-object-save'),
		buttonCancel: App.unique('ab-object-blank-object-cancel')
	};

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		header: labels.common.create,
		body: {
			view: "form",
			id: ids.form,
			width: 400,
			rules: {

				// TODO:
				// name: inputValidator.rules.validateObjectName
			},
			elements: [{ view: "text", label: labels.common.formName, name: "name", required: true, placeholder: labels.component.placeholderName, labelWidth: 70 }, {
				margin: 5,
				cols: [{
					view: "button", id: ids.buttonSave, value: labels.common.add, type: "form", click: function click() {
						return _logic.save();
					}
				}, {
					view: "button", id: ids.buttonCancel, value: labels.common.cancel, click: function click() {
						_logic.cancel();
					}
				}]
			}]
		}
	};

	// Our init() function for setting up our UI
	var _init = function _init(options) {
		// webix.extend($$(ids.form), webix.ProgressBar);

		// load up our callbacks.
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}
	};

	// our internal business logic
	var _logic = {

		callbacks: {
			onCancel: function onCancel() {
				console.warn('NO onCancel()!');
			},
			onSave: function onSave(values, cb) {
				console.warn('NO onSave()!');
			}
		},

		cancel: function cancel() {

			_logic.formClear();
			_logic.callbacks.onCancel();
		},

		formClear: function formClear() {
			$$(ids.form).clearValidation();
			$$(ids.form).clear();
		},

		/**
   * @function hide()
   *
   * hide this component.
   */
		hide: function hide() {

			$$(ids.component).hide();
		},

		/**
   * @function save
   *
   * verify the current info is ok, package it, and return it to be 
   * added to the application.createModel() method.
   */
		save: function save() {
			var saveButton = $$(ids.buttonSave);
			saveButton.disable();

			var Form = $$(ids.form);

			Form.clearValidation();

			// if it doesn't pass the basic form validation, return:
			if (!Form.validate()) {
				saveButton.enable();
				return false;
			}

			var values = Form.getValues();

			// now send data back to be added:
			_logic.callbacks.onSave(values, function (err) {

				if (err) {
					if (OP.Form.isValidationError(err, Form)) {}
					// do I do anything else here?
					// this auto updates the form

					// get notified if there was an error saving.
					saveButton.enable();
					return false;
				}

				// if there was no error, clear the form for the next
				// entry:
				_logic.formClear();
			});
		},

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		}
	};

	// Expose any globally accessible Actions:
	var _actions = {}

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

	// return the current instance of this component:
	;return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

__webpack_require__(25);

__webpack_require__(26);

__webpack_require__(27);

__webpack_require__(28);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		addNewRow: L('ab.object.addNewRow', "*Add new row"),

		// formHeader: L('ab.application.form.header', "*Application Info"),

		// Toolbar:
		hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
		filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
		sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
		frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen columns"),
		defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
		permission: L('ab.object.toolbar.permission', "*Permission"),
		addFields: L('ab.object.toolbar.addFields', "*Add new column"),
		"export": L('ab.object.toolbar.export', "*Export")
	}
};

var idBase = 'ab_work_object_workspace';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

		buttonAddField: App.unique(idBase + '_buttonAddField'),
		buttonExport: App.unique(idBase + '_buttonExport'),
		buttonFieldsVisible: App.unique(idBase + '_buttonFieldsVisible'),
		buttonFilter: App.unique(idBase + '_buttonFilter'),
		buttonFrozen: App.unique(idBase + '_buttonFrozen'),
		buttonLabel: App.unique(idBase + '_buttonLabel'),
		buttonRowNew: App.unique(idBase + '_buttonRowNew'),
		buttonSort: App.unique(idBase + '_buttonSort'),

		datatable: App.unique(idBase + '_datatable'),

		// Toolbar:
		toolbar: App.unique(idBase + '_toolbar'),

		noSelection: App.unique(idBase + '_noSelection'),
		selectedObject: App.unique(idBase + '_selectedObject')

	};

	// The DataTable that displays our object:
	var DataTable = OP.Component['ab_work_object_workspace_datatable'](App);

	// Our webix UI definition:
	var _ui = {
		view: 'multiview',
		id: ids.component,
		rows: [{
			// view:''
			id: ids.noSelection,
			rows: [{ view: 'label', label: '* Select an Object to work with' }]
		}, {
			id: ids.selectedObject,
			rows: [{
				view: 'toolbar',
				id: ids.toolbar,
				hidden: true,
				cols: [{
					view: "button",
					id: ids.buttonFieldsVisible,
					label: labels.component.hideFields,
					// popup: 'self.webixUiId.visibleFieldsPopup',
					icon: "columns",
					type: "icon",
					width: 120,
					badge: 0,
					click: function click() {
						_logic.toolbarFieldsVisible(this.$view);
					}
				}, {
					view: 'button',
					id: ids.buttonFilter,
					label: labels.component.filterFields,
					icon: "filter",
					type: "icon",
					width: 120,
					badge: 0,
					click: function click() {
						_logic.toolbarFilter(this);
					}
				}, {
					view: 'button',
					id: ids.buttonSort,
					label: labels.component.sortFields,
					icon: "sort",
					type: "icon",
					width: 120,
					badge: 0,
					click: function click() {
						_logic.toolbarSort(this.$view);
					}
				}, {
					view: 'button',
					id: ids.buttonFrozen,
					label: labels.component.frozenColumns,
					popup: 'self.webixUiId.frozenColumnsPopup',
					icon: "table",
					type: "icon",
					width: 150,
					badge: 0
				}, {
					view: 'button',
					id: ids.buttonLabel,
					label: labels.component.defineLabel,
					icon: "newspaper-o",
					type: "icon",
					width: 130,
					click: function click() {
						_logic.toolbarDefineLabel(this.$view);
					}
				}, {
					view: 'button',
					label: labels.component.permission,
					icon: "lock",
					type: "icon",
					width: 120
				}, {
					view: 'button',
					id: ids.buttonAddField,
					label: labels.component.addFields,
					icon: "plus",
					type: "icon",
					width: 150,
					click: function click() {
						_logic.toolbarAddFields(this.$view);
					}
				}, {
					view: 'button',
					id: ids.buttonExport,
					label: labels.component["export"],
					popup: 'self.webixUiId.exportDataPopup',
					icon: "file-o",
					type: "icon",
					width: 90
				}]
			}, DataTable.ui, {
				cols: [{
					autowidth: true
				}, {
					view: "button",
					id: ids.buttonRowNew,
					value: labels.component.addNewRow,
					width: 150,
					align: 'right',
					click: function click() {
						// TODO:
						_logic.rowAdd();
						// self.addNewRow({});
					}
				}]
			}]

		}]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {
		// webix.extend($$(ids.form), webix.ProgressBar);

		DataTable.init();

		$$(ids.noSelection).show();
	};

	var CurrentObject = null;

	// our internal business logic
	var _logic = {

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		},

		onChangeAddFields: function onChangeAddFields(field) {
			DataTable.refresh();
		},

		onChangeDefineLabel: function onChangeDefineLabel() {

			console.error('!! TODO: .toolbarDefineLabelChange()');
		},

		onChangeFieldsVisible: function onChangeFieldsVisible() {

			var hiddenFields = CurrentObject.workspaceHiddenFields;
			$$(ids.buttonFieldsVisible).define('badge', hiddenFields.length);
			$$(ids.buttonFieldsVisible).refresh();

			DataTable.refresh();
		},

		toolbarAddFields: function toolbarAddFields($view) {
			PopupNewDataField.show($view);
		},

		toolbarDefineLabel: function toolbarDefineLabel($view) {
			PopupDefineLabel.show($view);
		},

		toolbarFieldsVisible: function toolbarFieldsVisible($view) {
			PopupHideField.show($view);
		},

		/**
   * @function toolbarFilter
   *
   * Show the progress indicator to indicate a Form operation is in 
   * progress.
   */
		toolbarFilter: function toolbarFilter($view) {
			// self.refreshPopupData();
			// $$(self.webixUiId.filterFieldsPopup).show($view);
			console.error('TODO: button filterFields()');
		},

		toolbarSort: function toolbarSort($view) {
			// self.refreshPopupData();
			// $$(self.webixUiId.sortFieldsPopup).show($view);
			console.error('TODO: toolbarSort()');
		}
	};

	// NOTE: declare these after _logic  for the callbacks:
	var PopupDefineLabelComponent = OP.Component['ab_work_object_workspace_popupDefineLabel'](App);
	var PopupDefineLabel = webix.ui(PopupDefineLabelComponent.ui);
	PopupDefineLabelComponent.init({
		onChange: _logic.toolbarDefinLabelChange // be notified when there is a change in the hidden fields
	});

	var PopupNewDataFieldComponent = OP.Component['ab_work_object_workspace_popupNewDataField'](App);
	var PopupNewDataField = webix.ui(PopupNewDataFieldComponent.ui);
	PopupNewDataFieldComponent.init({
		onSave: _logic.onChangeAddFields // be notified when a new Field is created
	});

	var PopupHideFieldComponent = OP.Component['ab_work_object_workspace_popupHideFields'](App);
	var PopupHideField = webix.ui(PopupHideFieldComponent.ui);
	PopupHideFieldComponent.init({
		onChange: _logic.onChangeFieldsVisible // be notified when there is a change in the hidden fields
	});

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function clearObjectWorkspace()
   *
   * Clear the object workspace. 
   */
		clearObjectWorkspace: function clearObjectWorkspace() {

			$$(ids.noSelection).show();
			console.error('TODO: clearObjectWorkspace()');
		},

		/**
   * @function populateObjectWorkspace()
   *
   * Initialize the Object Workspace with the provided ABObject.
   *
   * @param {ABObject} object  	current ABObject instance we are working with.
   */
		populateObjectWorkspace: function populateObjectWorkspace(object) {

			$$(ids.toolbar).show();
			$$(ids.selectedObject).show();

			CurrentObject = object;

			App.actions.populateObjectPopupAddDataField(object);

			// update hiddenFields
			_logic.onChangeFieldsVisible();

			PopupDefineLabelComponent.objectLoad(object);
			PopupHideFieldComponent.objectLoad(object);
			DataTable.objectLoad(object);
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

	component: {}
};

var idBase = 'ab_work_object_workspace_datatable';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component')

	};

	// Our webix UI definition:
	var _ui = {
		view: "datatable",
		id: ids.component,
		resizeColumn: true,
		resizeRow: true,
		prerender: false,
		editable: true,
		fixedRowHeight: false,
		editaction: "custom",
		select: "cell",
		dragColumn: true,
		height: 800, // #hack!
		on: {
			onBeforeSelect: function onBeforeSelect(data, preserve) {
				console.error('!! ToDo: onBeforeSelect()');
				// var itemNode = this.getItemNode({ row: data.row, column: data.column });

				// var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });
				// if (!column || column.length < 1) {
				// 	console.log('System could not found this column data');
				// 	return false;
				// } else
				// 	column = column[0];

				// return dataFieldsManager.customEdit(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj, column, data.row, itemNode);
			},
			onAfterSelect: function onAfterSelect(data, prevent) {
				console.error('!! todo: onAfterSelect()');
				// var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column),
				// 	fieldData = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });

				// if (!fieldData || fieldData.length < 1) {
				// 	console.log('System could not found this column data');
				// 	return false;
				// } else
				// 	fieldData = fieldData[0];

				// // Custom update data
				// if (dataFieldsManager.hasCustomEdit(columnConfig.fieldName, fieldData))
				// 	return false;

				// // Normal update data
				// this.editCell(data.row, data.column);
			},
			onCheck: function onCheck(row, col, val) {
				// Update checkbox data
				console.error('!! ToDo: onCheck()');
				// var item = $$(self.webixUiId.objectDatatable).getItem(row);

				// self.updateRowData({ value: (val > 0 ? true : false) }, { row: row, column: col }, false)
				// 	.fail(function (err) {
				// 		// Rollback
				// 		item[col] = !val;
				// 		$$(self.webixUiId.objectDatatable).updateItem(row, item);
				// 		$$(self.webixUiId.objectDatatable).refresh(row);

				// 		$$(self.webixUiId.objectDatatable).hideProgress();
				// 	})
				// 	.then(function (result) {
				// 		$$(self.webixUiId.objectDatatable).hideProgress();
				// 	});
			},
			onBeforeEditStop: function onBeforeEditStop(state, editor) {
				console.error('!! ToDo: onCheck()');
				// var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == editor.column; });

				// if (!column || column.length < 1) return true;
				// column = column[0];

				// var passValidate = dataFieldsManager.validate(column, state.value);

				// if (!passValidate) {
				// 	$$(self.webixUiId.objectDatatable).editCancel();
				// }

				// return passValidate;
			},
			onAfterEditStop: function onAfterEditStop(state, editor, ignoreUpdate) {
				console.error('!! ToDo: onAfterEditStop()');
				// var item = $$(self.webixUiId.objectDatatable).getItem(editor.row);

				// self.updateRowData(state, editor, ignoreUpdate)
				// 	.fail(function (err) { // Cached
				// 		item[editor.column] = state.old;
				// 		$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
				// 		$$(self.webixUiId.objectDatatable).refresh(editor.row);

				// 		// TODO : Message

				// 		$$(self.webixUiId.objectDatatable).hideProgress();
				// 	})
				// 	.then(function (result) {
				// 		if (item) {
				// 			item[editor.column] = state.value;

				// 			if (result && result.constructor.name === 'Cached' && result.isUnsync())
				// 				item.isUnsync = true;

				// 			$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
				// 		}

				// 		// TODO : Message

				// 		$$(self.webixUiId.objectDatatable).hideProgress();
				// 	});
			},
			onColumnResize: function onColumnResize(id, newWidth, oldWidth, user_action) {
				console.error('!! ToDo: onColumnResize()');
				// var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id);
				// var column = self.data.columns.filter(function (col) { return col.id == columnConfig.dataId; });
				// if (column && column[0])
				// 	column[0].setWidth(newWidth);

				// // if (typeof columnConfig.template !== 'undefined' && columnConfig.template !== null) {
				// // 	// For calculate/refresh row height
				// // 	$$(self.webixUiId.objectDatatable).render();
				// // }
			},
			onBeforeColumnDrag: function onBeforeColumnDrag(sourceId, event) {
				console.error('!! ToDo: onBeforeColumnDrag()');
				// if (sourceId === 'appbuilder_trash') // Remove column
				// 	return false;
				// else
				// 	return true;
			},
			onBeforeColumnDrop: function onBeforeColumnDrop(sourceId, targetId, event) {
				console.error('!! ToDo: onBeforeColumnDrag()');
				// if (targetId === 'appbuilder_trash') // Remove column
				// 	return false;

				// if ($$(self.webixUiId.visibleButton).config.badge > 0) {
				// 	webix.alert({
				// 		title: self.labels.object.couldNotReorderField,
				// 		ok: self.labels.common.ok,
				// 		text: self.labels.object.couldNotReorderFieldDetail
				// 	});

				// 	return false;
				// }
			},
			onAfterColumnDrop: function onAfterColumnDrop(sourceId, targetId, event) {
				console.error('!! ToDo: onAfterColumnDrop()');
				// self.reorderColumns();
			},
			onAfterColumnShow: function onAfterColumnShow(id) {
				console.error('!! ToDo: onAfterColumnShow()');
				// $$(self.webixUiId.visibleFieldsPopup).showField(id);
			},
			onAfterColumnHide: function onAfterColumnHide(id) {
				console.error('!! ToDo: onAfterColumnHide()');
				// $$(self.webixUiId.visibleFieldsPopup).hideField(id);
			}
		}
	};

	// Our init() function for setting up our UI
	var _init = function _init() {
		// webix.extend($$(ids.form), webix.ProgressBar);
	};

	var CurrentObject = null;

	// our internal business logic
	var _logic = {

		objectLoad: function objectLoad(object) {

			CurrentObject = object;

			_logic.refresh();
		},

		// rebuild the data table view:
		refresh: function refresh() {

			// wait until we have an Object defined:
			if (CurrentObject) {

				var DataTable = $$(ids.component);
				DataTable.clearAll();

				// update DataTable structure:
				var columnHeaders = CurrentObject.columnHeaders(true);
				DataTable.refreshColumns(columnHeaders);

				// update DataTable Content
			}
		},

		/**
   * @function show()
   *
   * Show this component.
   */
		show: function show() {

			$$(ids.component).show();
		}

	};

	// Expose any globally accessible Actions:
	var _actions = {};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		objectLoad: _logic.objectLoad,
		refresh: _logic.refresh,

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_workspace_popupDefineLabel
 *
 * Manage the Add New Data Field popup.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		labelFormat: L('ab.define_label.labelFormat', "*Label format"),
		selectFieldToGenerate: L('ab.define_label.selectFieldToGenerate', "*Select field item to generate format."),
		labelFields: L('ab.define_label.labelFields', "*Fields")
	}
};

var idBase = 'ab_work_object_workspace_popupDefineLabel';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.

	var ids = {
		component: App.unique(idBase + '_component'),
		format: App.unique(idBase + '_format'),
		list: App.unique(idBase + '_list'),

		buttonSave: App.unique(idBase + '_buttonSave')
	};

	// Our webix UI definition:
	var _ui = {
		view: "popup",
		id: ids.component,
		modal: true,
		autoheight: true,
		// maxHeight: 420,

		width: 500,
		body: {
			rows: [{
				view: "label",
				label: "<b>{0}</b>".replace("{0}", labels.component.labelFormat)
			}, {
				view: "textarea",
				id: ids.format,
				height: 100
			}, {
				view: "label",
				label: labels.component.selectFieldToGenerate
			}, {
				view: "label",
				label: "<b>{0}</b>".replace("{0}", labels.component.labelFields)
			}, {
				view: 'list',
				id: ids.list,
				width: 500,
				maxHeight: 180,
				select: false,
				template: '#label#',
				on: {
					onItemClick: function onItemClick(id, e, node) {
						_logic.onItemClick(id, e, node);
					}
				}
			}, {
				height: 10
			}, {
				cols: [{
					view: "button", value: labels.common.cancel, width: 100,
					click: function click() {
						_logic.buttonCancel();
					}
				}, {
					view: "button", id: ids.buttonSave, label: labels.common.save, type: "form", width: 120,
					click: function click() {
						_logic.buttonSave();
					}
				}]
			}]
		},
		on: {
			onShow: function onShow() {
				_logic.onShow();
			}
		}
	};

	var _currentObject = null;

	// Our init() function for setting up our UI
	var _init = function _init(options) {

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		webix.extend($$(ids.list), webix.ProgressBar);
	};

	// our internal business logic
	var _logic = {

		buttonCancel: function buttonCancel() {
			$$(ids.component).hide();
		},

		buttonSave: function buttonSave() {

			// disable our save button
			var ButtonSave = $$(ids.buttonSave);
			ButtonSave.disable();

			// get our current labelFormt
			var labelFormat = $$(ids.format).getValue();

			// start our spinner
			var List = $$(ids.list);
			List.showProgress({ type: 'icon' });

			// convert from our User Friendly {Label} format to our
			// object friendly {Name} format
			List.data.each(function (d) {
				labelFormat = labelFormat.replace(new RegExp('{' + d.label + '}', 'g'), '{' + d.id + '}');
			});

			// save the value
			_currentObject.labelFormat = labelFormat;
			_currentObject.save().then(function () {

				// all good, so
				List.hideProgress(); // hide the spinner
				ButtonSave.enable(); // enable the save button
				_logic.hide(); // hide the popup

				// alert our parent component we are done with our changes:
				_logic.callbacks.onSave();
			})['catch'](function (err) {
				List.hideProgress(); // hide the spinner
				ButtonSave.enable(); // enable the save button

				// display some error to the user:
				OP.Error.log('Error trying to save our Object', { error: err });
			});
		},

		callbacks: {
			onCancel: function onCancel() {
				console.warn('NO onCancel()!');
			},
			onSave: function onSave(field) {
				console.warn('NO onSave()!');
			}
		},

		hide: function hide() {
			$$(ids.component).hide();
		},

		objectLoad: function objectLoad(object) {
			_currentObject = object;

			// clear our list
			var List = $$(ids.list);
			List.clearAll();

			// refresh list with new set of fields
			var allFields = _currentObject.fields();
			var listFields = [];
			allFields.forEach(function (f) {
				listFields.push({
					id: f.name,
					label: f.label
				});
			});

			List.parse(allFields);
		},

		onItemClick: function onItemClick(id, e, node) {

			var selectedItem = $$(ids.list).getItem(id);

			var labelFormat = $$(ids.format).getValue();
			labelFormat += '{{0}}'.replace('{0}', selectedItem.label);

			$$(ids.format).setValue(labelFormat);
		},

		onShow: function onShow() {

			var labelFormat = _currentObject.labelFormat;

			var Format = $$(ids.format);
			var List = $$(ids.list);

			Format.setValue('');

			Format.enable();
			List.enable();
			$$(ids.buttonSave).enable();

			// our labelFormat should be in a computer friendly {name} format
			// here we want to convert it to a user friendly {label} format
			// to use in our popup:
			if (labelFormat) {
				if (List.data && List.data.count() > 0) {
					List.data.each(function (d) {
						labelFormat = labelFormat.replace('{' + d.id + '}', '{' + d.label + '}');
					});
				}
			} else {
				// no label format:
				// Default to first field
				if (List.data && List.data.count() > 0) {
					var field = List.getItem(List.getFirstId());
					labelFormat = '{' + field.label + '}';
				}
			}

			Format.setValue(labelFormat || '');
		},

		/**
   * @function show()
   *
   * Show this component.
   * @param {obj} $view  the webix.$view to hover the popup around.
   */
		show: function show($view) {

			$$(ids.component).show($view);
		}

	};

	// Expose any globally accessible Actions:
	var _actions = {};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		objectLoad: _logic.objectLoad,

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_workspace_popupNewDataField
 *
 * Manage the Add New Data Field popup.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		showAll: L('ab.visible_fields.showAll', "*Show All"),
		hideAll: L('ab.visible_fields.hideAll', "*Hide All")
	}
};

var idBase = 'ab_work_object_workspace_popupHideFields';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.

	var ids = {
		component: App.unique(idBase + '_component'),

		list: App.unique(idBase + "_list")

	};

	// Our webix UI definition:
	var _ui = {
		view: "popup",
		id: ids.component,
		// modal: true,
		autoheight: true,
		body: {
			rows: [{
				cols: [{
					view: 'button',
					value: labels.component.showAll,
					click: function click() {
						_logic.showAll();
						// var visible_popup = this.getTopParentView();

						// visible_popup.dataTable.eachColumn(function (cId) {
						//     visible_popup.dataTable.showColumn(cId);
						// }, true);

						// visible_popup.callChangeEvent();
					}
				}, {
					view: 'button',
					value: labels.component.hideAll,
					click: function click() {
						_logic.hideAll();
						// var visible_popup = this.getTopParentView(),
						//     columns = [];

						// visible_popup.dataTable.config.columns.forEach(function (c) {
						//     if (c.id != 'appbuilder_trash')
						//         columns.push(c.id);
						// });

						// columns.forEach(function (c) {
						//     visible_popup.dataTable.hideColumn(c);
						// });

						// visible_popup.callChangeEvent();
					}
				}]
			}, {
				view: 'list',
				id: ids.list,
				autoheight: true,
				select: false,
				template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle ab-visible-field-icon"></i>&nbsp;</span> #label#',
				on: {
					onItemClick: function onItemClick(id, e, node) {
						_logic.listItemClick(id, e, node);

						// var visible_popup = this.getTopParentView(),
						//     item = this.getItem(id);

						// if (visible_popup.dataTable.isColumnVisible(id))
						//     visible_popup.dataTable.hideColumn(id);
						// else
						//     visible_popup.dataTable.showColumn(id);

						// visible_popup.callChangeEvent();
					}
				}
			}]
		},
		on: {
			onShow: function onShow() {
				_logic.iconsReset();
			}
		}
	};

	// Our init() function for setting up our UI
	var _init = function _init(options) {

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}
	};

	var CurrentObject = null;

	// our internal business logic
	var _logic = {

		callbacks: {
			onChange: function onChange() {}
		},

		listItemClick: function listItemClick(id, e, node) {
			var newFields = [];
			var isHidden = CurrentObject.workspaceHiddenFields.filter(function (fID) {
				return fID == id;
			}).length > 0;
			if (isHidden) {
				// unhide this field

				// get remaining fields
				newFields = CurrentObject.workspaceHiddenFields.filter(function (fID) {
					return fID != id;
				});

				// find the icon and display it:
				_logic.iconShow(node);
			} else {
				newFields = CurrentObject.workspaceHiddenFields;
				newFields.push(id);

				_logic.iconHide(node);
			}

			// update our Object with current hidden fields
			CurrentObject.workspaceHiddenFields = newFields;
			CurrentObject.save().then(function () {
				_logic.callbacks.onChange();
			})["catch"](function (err) {
				console.error('!!! TODO: catch this error:', err);
			});
		},

		iconHide: function iconHide(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').style.visibility = "hidden";
			}
		},

		iconShow: function iconShow(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').style.visibility = "visible";
			}
		},

		iconsReset: function iconsReset() {

			var List = $$(ids.list);

			// for each item in the List
			var id = List.getFirstId();
			while (id) {

				// find it's HTML Node
				var node = List.getItemNode(id);

				// if this item is not hidden, show it.
				if (CurrentObject.workspaceHiddenFields.indexOf(id) == -1) {
					_logic.iconShow(node);
				} else {
					// else hide it
					_logic.iconHide(node);
				}

				// next item
				id = List.getNextId(id);
			}
		},

		objectLoad: function objectLoad(object) {
			CurrentObject = object;

			// refresh list
			var allFields = CurrentObject.fields();
			var listFields = [];
			allFields.forEach(function (f) {
				listFields.push({
					id: f.id,
					label: f.label
				});
			});

			$$(ids.list).parse(allFields);
		}

	};

	// Expose any globally accessible Actions:
	var _actions = {};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		objectLoad: _logic.objectLoad,

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * ab_work_object_workspace_popupNewDataField
 *
 * Manage the Add New Data Field popup.
 *
 */



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _classesABApplication = __webpack_require__(0);

var _classesABApplication2 = _interopRequireDefault(_classesABApplication);

var _classesABFieldManager = __webpack_require__(9);

var _classesABFieldManager2 = _interopRequireDefault(_classesABFieldManager);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		chooseType: L('ab.add_fields.chooseType', "*Choose field type..."),
		label: L('ab.add_fields.label', "*Label"),
		addNewField: L('ab.add_fields.addNewField', "*Add Column")

	}
};

var idBase = 'ab_work_object_workspace_popupNewDataField';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.

	var ids = {
		component: App.unique(idBase + '_component'),
		types: App.unique(idBase + '_types'),
		editDefinitions: App.unique(idBase + '_editDefinitions'),

		buttonSave: App.unique(idBase + '_buttonSave'),
		buttonCancel: App.unique(idBase + '_buttonCancel')
	};

	// Our webix UI definition:
	var _ui = {
		view: "popup",
		id: ids.component,
		modal: true,
		autoheight: true,
		// maxHeight: 420,
		ready: function ready() {
			console.error('ready() called!!!');
			_logic.resetState();
		},
		body: {
			css: 'ab-add-fields-popup',
			borderless: true,
			width: 380,
			paddingX: 17,
			rows: [{
				view: "menu",
				id: ids.types,
				minWidth: 500,
				autowidth: true,
				data: [{
					value: labels.component.chooseType,
					submenu: ['dataFieldsManager', '.getFieldMenuList()']
				}],
				click: function click(id, ev, node) {
					_logic.typeClick();
					ev.preventDefault();
				},
				on: {
					onMenuItemClick: function onMenuItemClick(id, ev, node) {
						_logic.onMenuItemClick(id);
						ev.preventDefault();
					}
				}
			}, { height: 10 }, {
				view: 'multiview',
				id: ids.editDefinitions,
				// NOTE: can't leave this an empty []. We redefine this value later.
				cells: [{ id: 'del_me', view: 'label', label: 'edit definition here' }]
			}, { height: 10 }, {
				cols: [{
					view: "button",
					id: ids.buttonSave,
					label: labels.component.addNewField,
					type: "form", width: 120, click: function click() {
						_logic.buttonSave();
					}
				}, {
					view: "button",
					value: labels.common.cancel,
					width: 100, click: function click() {
						_logic.buttonCancel();
					}
				}]
			}]
		},
		on: {
			onBeforeShow: function onBeforeShow() {
				_logic.resetState();
			},
			onShow: function onShow() {
				_logic.onShow();
			},
			onHide: function onHide() {
				_logic.resetState();
			}
		}
	};

	var _objectHash = {}; // 'name' => ABFieldXXX object
	var _componentHash = {}; // 'name' => ABFieldXXX ui component
	var _currentEditor = null;
	var _currentObject = null;

	// Our init() function for setting up our UI
	var _init = function _init(options) {

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		var Fields = _classesABFieldManager2["default"].allFields();

		//// we need to load a submenu entry and an editor definition for each
		//// of our Fields

		var submenus = []; // Create the submenus for our Data Fields:
		var defaultEditorComponent = null; // choose the 1st entry for the default editor.
		var newEditorList = {
			id: ids.editDefinitions,
			rows: []
		};

		Fields.forEach(function (F) {

			// add a submenu for the fields multilingual key
			submenus.push(F.menuName());

			// Add the Field's definition editor here:
			var editorComponent = F.propertiesComponent(App);
			if (!defaultEditorComponent) {
				defaultEditorComponent = editorComponent;
			}
			newEditorList.rows.push(editorComponent.ui);

			_objectHash[F.menuName()] = F;
			_componentHash[F.menuName()] = editorComponent;
		});

		// the submenu button has a placeholder we need to remove and update
		// with one that has all our submenus in it.
		var firstID = $$(ids.types).getFirstId();
		$$(ids.types).updateItem(firstID, {
			value: labels.component.chooseType,
			submenu: submenus
		});

		// now remove the 'del_me' definition editor placeholder.
		webix.ui(newEditorList, $$(ids.editDefinitions));

		defaultEditorComponent.show(); // show the default editor
		_currentEditor = defaultEditorComponent;

		// $$(ids.editDefinitions).show();

		// $$(ids.editDefinitions).cells() // define the edit Definitions here.
	};

	// our internal business logic
	var _logic = {

		buttonCancel: function buttonCancel() {

			_logic.resetState();

			// clear all editors:
			for (var c in _componentHash) {
				_componentHash[c].clear();
			}

			// hide this popup.
			$$(ids.component).hide();
		},

		buttonSave: function buttonSave() {

			// var self = this;

			$$(ids.buttonSave).disable();

			// var base = self.getTopParentView(),
			// 	dataTable = base.dataTable,
			// 	fieldInfo = dataFieldsManager.getSettings(base.fieldName);

			// if (!dataTable) {
			// 	webix.message({ type: "error", text: labels.add_fields.registerTableWarning });
			// 	self.enable();
			// 	return;
			// }

			// if (!fieldInfo) {
			// 	webix.alert({
			// 		title: 'Field info error',
			// 		text: 'System could not get this field information ',
			// 		ok: labels.common.ok
			// 	});
			// 	self.enable();
			// 	return;
			// }

			var editor = _currentEditor;
			if (editor) {

				// the editor can define some basic form validations.
				if (editor.isValid()) {

					var values = editor.values();
					var newField = _currentObject.fieldNew(values);

					// newField can check for more validations:
					var errors = newField.isValid();
					if (errors) {
						OP.Form.isValidationError(errors, $$(editor.ui.id));
						$$(ids.buttonSave).enable();
					} else {

						newField.save().then(function () {

							$$(ids.buttonSave).enable();
							_logic.hide();
							_logic.callbacks.onSave(newField);
						})["catch"](function (err) {
							$$(ids.buttonSave).enable();
						});
					}
				} else {
					$$(ids.buttonSave).enable();
				}
			} else {

				OP.Dialog.Alert({
					title: '! Could not find the current editor.',
					text: 'go tell a developer about this.'
				});
				$$(ids.buttonSave).enable();
			}

			// if (!inputValidator.validateFormat(fieldInfo.name)) {
			// 	self.enable();
			// 	return;
			// }

			// // Validate duplicate field name
			// var existsColumn = $.grep(dataTable.config.columns, function (c) { return c.id == fieldInfo.name.replace(/ /g, '_'); });
			// if (existsColumn && existsColumn.length > 0 && !data.editFieldId) {
			// 	webix.alert({
			// 		title: labels.add_fields.duplicateFieldTitle,
			// 		text: labels.add_fields.duplicateFieldDescription,
			// 		ok: labels.common.ok
			// 	});
			// 	this.enable();
			// 	return;
			// }

			// if (fieldInfo.weight == null)
			// 	fieldInfo.weight = dataTable.config.columns.length;

			// // Call callback function
			// if (base.saveFieldCallback && base.fieldName) {
			// 	base.saveFieldCallback(base.fieldName, fieldInfo)
			// 		.then(function () {
			// 			self.enable();
			// 			base.resetState();
			// 			base.hide();
			// 		});
			// }
		},

		callbacks: {
			onCancel: function onCancel() {
				console.warn('NO onCancel()!');
			},
			onSave: function onSave(field) {
				console.warn('NO onSave()!');
			}
		},

		hide: function hide() {
			$$(ids.component).hide();
		},

		/**
   * @function onMenuItemClick
   * swap the editor view to match the data field selected in the menu.
   *
   * @param {string} name  the menuName() of the submenu that was selected.
   */
		onMenuItemClick: function onMenuItemClick(name) {

			// note, the submenu returns the Field.menuName() values.
			// we use that to lookup the Field here:
			var editor = _componentHash[name];
			if (editor) {
				editor.show();
				_currentEditor = editor;
			} else {

				// most likely they clicked on the menu button itself.
				// do nothing.

				// OP.Error.log("App Builder:Workspace:Object:NewDataField: could not find editor for submenu item:"+name, { name:name });
			}
		},

		onShow: function onShow() {
			// if (!AD.comm.isServerReady()) {
			// 	this.getTopParentView().hide();

			// 	webix.alert({
			// 		title: labels.add_fields.cannotUpdateFields,
			// 		text: labels.add_fields.waitRestructureObjects,
			// 		ok: labels.common.ok
			// 	});
			// }
			// else { // Set default field type
			// 	this.showFieldData('string');
			// }
			console.error('TODO: onShow();');
		},

		resetState: function resetState() {

			// add mode :  change button text to 'Add'
			// show the default editor
			console.error('TODO: resetState()');
		},

		/**
   * @function show()
   *
   * Show this component.
   * @param {obj} $view  the webix.$view to hover the popup around.
   */
		show: function show($view) {

			$$(ids.component).show($view);
		},

		typeClick: function typeClick() {
			// NOTE: for functional testing we need a way to display the submenu
			// (functional tests don't do .hover very well)
			// so this routine is to enable .click() to show the submenu.

			var subMenuId = $$(ids.types).config.data[0].submenu;

			// #HACK Sub-menu popup does not render on initial
			// Force it to render popup by use .getSubMenu()
			if (typeof subMenuId != 'string') {
				$$(ids.types).getSubMenu($$(ids.types).config.data[0].id);
				subMenuId = $$(ids.types).config.data[0].submenu;
			}

			if ($$(subMenuId)) $$(subMenuId).show();
		}
	};

	// Expose any globally accessible Actions:
	var _actions = {

		populateObjectPopupAddDataField: function populateObjectPopupAddDataField(object) {
			_currentObject = object;
		}

	};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component 
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		_logic: _logic // {obj} 	Unit Testing
	};
});

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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


OP.Model.extend('opstools.BuildApp.ABApplication', {
	useSockets: true,
	restURL: '/app_builder/abapplication'
}, {
	// instance Methods
});

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * custom_editlist
 *
 * Create a custom webix component.
 *
 */



Object.defineProperty(exports, '__esModule', {
	value: true
});
function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {
		// formHeader: L('ab.application.form.header', "*Application Info"),
	}
};

var ComponentKey = 'ab_custom_edittree';
OP.CustomComponent.extend(ComponentKey, function (App, componentKey) {
	// App 	{obj}	our application instance object.
	// componentKey {string}	the destination key in App.custom[componentKey] for the instance of this component:

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('custom_editlist_component')

	};

	// Our webix UI definition:
	var _ui = {
		name: App.unique("custom_editlist") // keep this unique for this App instance.
	};

	// our internal business logic
	var _logic = {};

	// Tell Webix to create an INSTANCE of our custom component:
	webix.protoUI(_ui, webix.EditAbility, webix.ui.list);

	// current definition of our Component
	var Component = {
		view: _ui.name, // {string} the webix.view value for this custom component

		_logic: _logic // {obj} 	Unit Testing
	};

	// Save our definition into App.custom.[key]
	App.custom = App.custom || {};
	App.custom[componentKey] = Component;

	// return the current definition of this component:
	return Component;
});

// After importing this custom component, you get back the .key to use to
// lookup the OP.Component[] to create an application instance of
exports['default'] = { key: ComponentKey };
module.exports = exports['default'];

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * custom_edittree
 *
 * Create a custom webix component.
 *
 */



Object.defineProperty(exports, '__esModule', {
	value: true
});
function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {
		// formHeader: L('ab.application.form.header', "*Application Info"),
	}
};

var ComponentKey = 'ab_custom_edittree';
OP.CustomComponent.extend(ComponentKey, function (App, componentKey) {
	// App 	{obj}	our application instance object.
	// componentKey {string}	the destination key in App.custom[componentKey] for the instance of this component:

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('custom_edittree_component')

	};

	// Our webix Prototype definition:
	var _ui = {
		name: App.unique("custom_edittree") // keep this unique for this App instance.
	};

	// our internal business logic
	var _logic = {};

	// Tell Webix to create an INSTANCE of our custom component:
	webix.protoUI(_ui, webix.EditAbility, webix.ui.tree);

	// current definition of our Component
	var Component = {
		view: _ui.name, // {string} the webix.view value for this custom component

		_logic: _logic // {obj} 	Unit Testing
	};

	// Save our definition into App.custom.[key]
	App.custom = App.custom || {};
	App.custom[componentKey] = Component;

	// return the current definition of this component:
	return Component;
});

// After importing this custom component, you get back the .key to use to
// lookup the OP.Component[] to create an application instance of
exports['default'] = { key: ComponentKey };
module.exports = exports['default'];

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// import './OP/OP';
// import '../../../../../assets/js/webix/webix'



__webpack_require__(11);

AD.Control.OpsTool.extend('BuildApp', {

	init: function init(element, options) {
		var self = this;

		options = AD.defaults({
			templateDOM: '/opstools/BuildApp/views/BuildApp/BuildApp.ejs',
			resize_notification: 'BuildApp.resize',
			tool: null // the parent opsPortal Tool() object
		}, options);
		self.options = options;

		// Call parent init
		self._super(element, options);

		self.data = {};

		self.webixUiId = {
			loadingScreen: 'ab-loading-screen',
			syncButton: 'ab-sync-button'
		};

		self.initDOM(function () {
			self.initWebixUI();
		});
	},

	initDOM: function initDOM(cb) {
		var _this = this;

		can.view(this.options.templateDOM, {}, function (fragment) {
			_this.element.html(fragment);

			// _this.element.find(".ab-app-list").show();
			// _this.element.find(".ab-app-workspace").hide();

			cb();
		});
	},

	initWebixUI: function initWebixUI() {

		// get the AppBuilder (AB) Webix Component
		var AppBuilder = OP.Component['ab']();
		var ui = AppBuilder.ui;

		// tell the AppBuilder where to attach
		ui.container = 'ab-main-container';

		// instantiate the UI first
		this.AppBuilder = webix.ui(ui);

		// then perform the init()
		AppBuilder.init();
	},

	resize: function resize(height) {
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