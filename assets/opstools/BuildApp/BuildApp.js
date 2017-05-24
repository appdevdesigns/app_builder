/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _comm = __webpack_require__(4);

var _comm2 = _interopRequireDefault(_comm);

var _form = __webpack_require__(6);

var _form2 = _interopRequireDefault(_form);

var _multilingual = __webpack_require__(8);

var _multilingual2 = _interopRequireDefault(_multilingual);

var _model = __webpack_require__(7);

var _model2 = _interopRequireDefault(_model);

var _util = __webpack_require__(9);

var _util2 = _interopRequireDefault(_util);

var _config = __webpack_require__(5);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

OP.Comm = _comm2.default;

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
		config: _config2.default.config(),

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

OP.Form = _form2.default;

OP.Multilingual = _multilingual2.default;
OP.Model = _model2.default;

OP.Util = _util2.default;

exports.default = OP;
// }


// import "./model.js"
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import OP from "OP"


__webpack_require__(40);

var _ABObject = __webpack_require__(16);

var _ABObject2 = _interopRequireDefault(_ABObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _AllApplications = [];

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function toDC(data) {
	return new webix.DataCollection({
		data: data

	});
}

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

var ABApplication = function () {
	function ABApplication(attributes) {
		var _this = this;

		_classCallCheck(this, ABApplication);

		// ABApplication Attributes
		this.id = attributes.id;
		this.json = attributes.json;
		this.name = attributes.name || this.json.name || "";
		this.role = attributes.role;

		// multilingual fields: label, description
		OP.Multilingual.translate(this, this.json, ABApplication.fieldsMultilingual());

		// import all our ABObjects
		var newObjects = [];
		(attributes.json.objects || []).forEach(function (obj) {
			newObjects.push(new _ABObject2.default(obj, _this));
		});
		this._objects = newObjects;

		// import all our ABViews


		// instance keeps a link to our Model for .save() and .destroy();
		this.Model = OP.Model.get('opstools.BuildApp.ABApplication');
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

			OP.Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());
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
				AD.comm.service.delete({ url: '/app_builder/' + _this7.id + '/role' }).fail(reject).done(resolve);
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
			return new _ABObject2.default(values, this);
		}

		/**
   * @method objectDestroy()
   *
   * remove the current ABObject from our list of ._objects.
   *
   * @param {ABObject} object
   * @return {Promise}
   */

	}, {
		key: "objectDestroy",
		value: function objectDestroy(object) {

			var remaininObjects = this.objects(function (o) {
				return o.id != object.id;
			});
			this._objects = remaininObjects;
			return this.save();

			// var isIncluded = (this.objects(function(o){ return o.id == object.id }).length > 0);
			// if (!isIncluded) {
			// 	this._objects.push(object);
			// }

			// return this.save();
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

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll().then(function (data) {

					// NOTE: data is already a DataCollection from .findAll()
					_AllApplications = data;

					resolve(data);
				}).catch(reject);
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
				OP.Multilingual.unTranslate(values, newApp, ABApplication.fieldsMultilingual());
				values.json = newApp;
				newApp.name = values.name;

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.create(values).then(function (app) {

					// return an instance of ABApplication
					var App = new ABApplication(app);

					_AllApplications.add(App, 0);
					resolve(App);
				}).catch(reject);
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

					errors = OP.Form.validationError({
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
}();

exports.default = ABApplication;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * ABField
 *
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */

// import OP from "../../OP/OP"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABField = function () {
	function ABField(values, object, fieldDefaults) {
		_classCallCheck(this, ABField);

		// NOTE: setup this first so later we can use .fieldType(), .fieldIcon()
		this.defaults = fieldDefaults;

		/*
  {
  id:'uuid',					// uuid value for this obj
  key:'fieldKey',				// unique key for this Field
  icon:'font',				// fa-[icon] reference for an icon for this Field Type
  label:'',					// pulled from translation
  columnName:'column_name',	// a valid mysql table.column name
  settings: {					// unique settings for the type of field
  showIcon:true/false,	// only useful in Object Workspace DataTable
  // specific for dataField
  },
  translations:[]
  }
  */
		this.fromValues(values);

		// label is a multilingual value:
		OP.Multilingual.translate(this, this, ['label']);

		this.object = object;
	}

	///
	/// Static Methods
	///
	/// Available to the Class level object.  These methods are not dependent
	/// on the instance values of the Application.
	///

	_createClass(ABField, [{
		key: 'fieldKey',


		// unique key to reference this specific DataField
		value: function fieldKey() {
			return this.defaults.key;
		}

		// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	}, {
		key: 'fieldIcon',
		value: function fieldIcon() {
			return this.defaults.icon;
		}

		// the multilingual text for the name of this data field.

	}, {
		key: 'fieldMenuName',
		value: function fieldMenuName() {
			return this.defaults.menuName;
		}

		// the multilingual text for the name of this data field.

	}, {
		key: 'fieldDescription',
		value: function fieldDescription() {
			return this.defaults.description;
		}

		/*
   * @method isValid
   * check the current values to make sure they are valid.
   * Here we check the default values provided by ABField.
   *
   * @return null or [{OP.Form.validationError()}] objects.
   */

	}, {
		key: 'isValid',
		value: function isValid() {
			var _this = this;

			var errors = null;

			// .columnName must be unique among fileds on the same object
			var isNameUnique = this.object.fields(function (f) {
				var isDifferent = f.id != _this.id;
				return f.id != _this.id && f.columnName.toLowerCase() == _this.columnName.toLowerCase();
			}).length == 0;
			if (!isNameUnique) {
				errors = OP.Form.validationError({
					name: 'columnName',
					message: L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.columnName)
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
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				// verify we have been .save()d before:
				if (_this2.id) {

					// NOTE: our .migrateXXX() routines expect the object to currently exist
					// in the DB before we perform the DB operations.  So we need to
					// .migrateDrop()  before we actually .objectDestroy() this.
					_this2.migrateDrop().then(function () {
						return _this2.object.fieldRemove(_this2);
					}).then(resolve).catch(reject);
				} else {

					resolve(); // nothing to do really
				}
			});
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
			var _this3 = this;

			return new Promise(function (resolve, reject) {

				var isAdd = false;
				// if this is our initial save()
				if (!_this3.id) {
					isAdd = true;
					_this3.id = OP.Util.uuid(); // setup default .id
				}

				_this3.object.fieldSave(_this3).then(function () {

					if (isAdd) {

						_this3.migrateCreate().then(function () {
							resolve(_this3);
						}).catch(reject);
					} else {
						resolve(_this3);
					}
				}).catch(function (err) {
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
			OP.Multilingual.unTranslate(this, this, ["label"]);

			return {
				id: this.id,
				key: this.key,
				icon: this.icon,
				columnName: this.columnName,
				settings: this.settings,
				translations: this.translations
			};
		}

		/**
   * @method fromValues()
   *
   * initialze this object with the given set of values.
   * @param {obj} values
   */

	}, {
		key: 'fromValues',
		value: function fromValues(values) {

			this.id = values.id; // NOTE: only exists after .save()
			this.key = values.key || this.fieldKey();
			this.icon = values.icon || this.fieldIcon();

			// if this is being instantiated on a read from the Property UI,
			// .label is coming in under .settings.label
			this.label = values.label || values.settings.label || '?label?';

			this.columnName = values.columnName || '';
			this.translations = values.translations || [];

			this.settings = values.settings || {};
			this.settings.showIcon = values.settings.showIcon + "" || "1";

			// convert from "0" => 0
			this.settings.showIcon = parseInt(this.settings.showIcon);
		}

		///
		/// DB Migrations
		///

	}, {
		key: 'migrateCreate',
		value: function migrateCreate() {
			var url = '/app_builder/migrate/application/#appID#/object/#objID#/field/#fieldID#'.replace('#appID#', this.object.application.id).replace('#objID#', this.object.id).replace('#fieldID#', this.id);

			return OP.Comm.Service.post({
				url: url
			});
		}
	}, {
		key: 'migrateDrop',
		value: function migrateDrop() {
			var url = '/app_builder/migrate/application/#appID#/object/#objID#/field/#fieldID#'.replace('#appID#', this.object.application.id).replace('#objID#', this.object.id).replace('#fieldID#', this.id);

			return OP.Comm.Service['delete']({
				url: url
			});
		}

		///
		/// Working with Actual Object Values:
		///

		/*
   * @function columnHeader
   * Return the column header for a webix grid component for this specific
   * data field.
   * @param {bool} isObjectWorkspace is this being used in the Object
   *								   workspace.
   * @return {obj}  configuration obj
   */

	}, {
		key: 'columnHeader',
		value: function columnHeader(isObjectWorkspace) {

			var config = {
				id: this.id,
				header: this.label
			};

			if (isObjectWorkspace) {
				if (this.settings.showIcon) {
					config.header = '<span class="webix_icon fa-{icon}"></span>'.replace('{icon}', this.fieldIcon()) + config.header;
				}
			}

			return config;
		}
	}], [{
		key: 'clearEditor',
		value: function clearEditor(ids) {

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
	}, {
		key: 'editorPopulate',
		value: function editorPopulate(ids, field) {

			$$(ids.label).setValue(field.label);
			$$(ids.columnName).setValue(field.columnName);
			$$(ids.showIcon).setValue(field.settings.showIcon);
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
				rows: [
				// {
				// 	view: "label",
				// 	label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', Field.icon).replace('{1}', Field.menuName)
				// },
				{
					view: "text",
					id: ids.label,
					name: 'label',
					label: App.labels.dataFieldHeaderLabel,
					placeholder: App.labels.dataFieldHeaderLabelPlaceholder,
					labelWidth: App.config.labelWidthMedium,
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
					labelWidth: App.config.labelWidthMedium,
					placeholder: App.labels.dataFieldColumnNamePlaceholder }, {
					view: "label",
					id: ids.fieldDescription,
					label: Field.description,
					align: "right"
				}, {
					view: 'checkbox',
					id: ids.showIcon,
					name: 'showIcon',
					labelRight: App.labels.dataFieldShowIcon, // 'Show icon',
					labelWidth: App.config.labelWidthCheckbox,
					value: true
				}]
			};

			return _ui;
		}
	}, {
		key: 'editorValues',
		value: function editorValues(settings) {

			var obj = {
				label: settings.label,
				columnName: settings.columnName,
				settings: settings
			};

			delete settings.label;
			delete settings.columnName;

			return obj;
		}
	}]);

	return ABField;
}();

exports.default = ABField;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * ABFieldComponent
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * An ABFieldComponent defines the UI component used by an ABField to display it's properties.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _ABField = __webpack_require__(2);

var _ABField2 = _interopRequireDefault(_ABField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldComponent = function () {
	function ABFieldComponent(options) {
		_classCallCheck(this, ABFieldComponent);

		this.options = options;

		this.fieldDefaults = options.fieldDefaults || {};

		this.elements = options.elements || function (App) {
			return [];
		};

		this.defaultValues = options.defaultValues || {};

		this.rules = options.rules || {};

		this.logic = options.logic || {};

		this.init = options.init || function () {};

		this.idBase = this.fieldDefaults.key || '??fieldKey??';

		// this.ids = options.ids || {};
		this.ids = {};
	}

	///
	/// Static Methods
	///
	/// Available to the Class level object.  These methods are not dependent
	/// on the instance values of the Application.
	///


	///
	/// Instance Methods
	///

	_createClass(ABFieldComponent, [{
		key: 'component',
		value: function component(App) {
			var _this = this;

			// for each provided element: create an this.ids for it:
			var elements = this.elements(App, this);

			////
			//// prepare our ids
			////

			var ids = {

				component: App.unique(this.idBase + '_component'),

				// the common property fields
				label: App.unique(this.idBase + '_label'),
				columnName: App.unique(this.idBase + '_columnName'),
				fieldDescription: App.unique(this.idBase + '_fieldDescription'),
				showIcon: App.unique(this.idBase + '_showIcon')
			};

			this.eachDeep(elements, function (e) {
				if (e.name) {
					// if element has an .id, then use it in our list as is
					if (e.id) {
						ids[e.name] = e.id;
					}

					// otherwise create a new entry in our base list
					_this.ids[e.name] = e.name;
				}
			});

			// convert the entries in our base list into a globally acceptable id
			// and use that in our ids list if it doesn't already exist
			for (var i in this.ids) {
				if (!ids[i]) {
					ids[i] = App.unique(this.idBase + '_' + i);
				}
			}

			// update our elements to include our ids as we have them now.
			this.eachDeep(elements, function (e) {
				if (e.name) {
					e.id = ids[e.name];
				}
			});

			////
			//// our UI definition:
			////

			// our base form:
			var _ui = {
				view: 'form',
				id: ids.component,
				autoheight: true,
				borderless: true,
				elements: [
					// {
					// 	view: "text",
					// 	id: ids.textDefault,
					// 	name:'textDefault',
					// 	placeholder: labels.component.defaultText
					// },
					// {
					// 	view: "checkbox",
					// 	id: ids.supportMultilingual,
					// 	name:'supportMultilingual',
					// 	labelRight: labels.component.supportMultilingual,
					// 	labelWidth: 0,
					// 	value: true
					// }
				],

				rules: {
					'label': webix.rules.isNotEmpty,
					'columnName': webix.rules.isNotEmpty
				}
			};

			var _init = function _init() {

				// call our provided .init() routine
				this.init(ids);
			};

			var _logic = {

				/*
     * @function clear
     *
     * clear the form.
     */
				clear: function clear() {

					_ABField2.default.clearEditor(ids);

					for (var f in _this.defaultValues) {
						var component = $$(ids[f]);
						if (component) {
							component.setValue(_this.defaultValues[f]);
						} else {
							console.warn('!! could not find component for default value: name:' + f + ' id:' + ids[f]);
						}
					}

					$$(ids.component).clearValidation();

					// perform provided .clear()
					if (_this.logic.clear) {
						_this.logic.clear(ids);
					}
				},

				/*
     * @function hide
     *
     * hide this component.
     */
				hide: function hide() {
					$$(ids.component).clearValidation();
					$$(ids.component).hide(false, false);

					// perform provided .hide()
					if (_this.logic.hide) {
						_this.logic.hide(ids);
					}
				},

				/*
     * @function isValid
     *
     * checks the current values on the componet to see if they are Valid
     */
				isValid: function isValid() {

					var isValid = $$(ids.component).validate();

					// perform provided .isValid()
					if (_this.logic.isValid) {
						isValid = _this.logic.isValid(ids, isValid);
					}

					return isValid;
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
     * @param {ABField} field
     */
				populate: function populate(field) {

					// populate the base ABField values:
					_ABField2.default.editorPopulate(ids, field);

					_this.eachDeep(elements, function (e) {
						if (e.name != null) {
							$$(ids[e.name]).setValue(field.settings[e.name]);
						}
					});

					// perform provided .populate()
					if (_this.logic.populate) {
						_this.logic.populate(ids, field);
					}
				},

				/*
     * @function show
     *
     * show this component.
     */
				show: function show(a, b) {
					$$(ids.component).clearValidation();
					$$(ids.component).show(a, b);

					// perform provided .show()
					if (_this.logic.show) {
						_this.logic.show(ids);
					}
				},

				/*
     * @function values
     *
     * return the values for this form.
     * @return {obj}  
     */
				values: function values() {

					var settings = $$(ids.component).getValues();
					var values = _ABField2.default.editorValues(settings);

					values.key = _this.fieldDefaults.key;

					// perform provided .values()
					if (_this.logic.values) {
						values = _this.logic.values(ids, values);
					}

					return values;
				}

			};

			// apply additional logic functions:
			for (var l in this.logic) {
				if (!_logic[l]) _logic[l] = this.logic[l];
			}

			// make sure our given elements, have an id set:


			// get the common UI headers entries, and insert them above ours here:
			// NOTE: put this here so that _logic is defined.
			var commonUI = _ABField2.default.definitionEditor(App, ids, _logic, this.fieldDefaults);
			_ui.elements = commonUI.rows.concat(elements);

			for (var r in this.rules) {
				_ui.rules[r] = this.rules[r];
			}

			// return the current instance of this component:
			return this._component = {
				ui: _ui, // {obj} 	the webix ui definition for this component
				init: _init, // {fn} 	init() to setup this component  
				// actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


				// DataField exposed actions:
				clear: _logic.clear,
				hide: _logic.hide,
				isValid: _logic.isValid,
				populate: _logic.populate,
				show: _logic.show,
				values: _logic.values,

				_logic: _logic // {obj} 	Unit Testing
			};
		}

		/**
   * @function eachDeep
   * a depth first fn to apply fn() to each element of our list.
   * @param {array} list  array of webix elements to scan
   * @param {fn} fn function to apply to each element.
   */

	}, {
		key: 'eachDeep',
		value: function eachDeep(list, fn) {
			var _this2 = this;

			list.forEach(function (e) {

				// process sub columns
				if (e.cols) {
					_this2.eachDeep(e.cols, fn);
					return;
				}

				// or rows
				if (e.rows) {
					_this2.eachDeep(e.rows, fn);
					return;
				}

				// or just process this element:
				fn(e);
			});
		}
	}, {
		key: 'idsUnique',
		value: function idsUnique(ids, App) {

			for (var i in ids) {
				if (ids[i] == '') {
					ids[i] = App.unique(this.idBase + '_' + i);
				} else {
					ids[i] = App.unique(this.idBase + '_' + ids[i]);
				}
			}
			return ids;
		}

		// populate(field) {
		// 	this._component.populate(field);
		// }

	}]);

	return ABFieldComponent;
}();

exports.default = ABFieldComponent;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _comm_service = __webpack_require__(10);

var _comm_service2 = _interopRequireDefault(_comm_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	// OP.Comm.Service.*
	Service: _comm_service2.default
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _configDesktop = __webpack_require__(11);

var _configDesktop2 = _interopRequireDefault(_configDesktop);

var _configMobile = __webpack_require__(12);

var _configMobile2 = _interopRequireDefault(_configMobile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class config
 *
 * Manage our configuration settings.
 */

exports.default = {
	config: function config() {

		// TODO: decide which config file to return here:
		if (window.innerWidth < 768) {
			return _configMobile2.default;
		}
		return _configDesktop2.default;
	}
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _restURLs = {
	findAll: 'GET #url#',
	findOne: 'GET #url#/{id}',
	create: 'POST #url#',
	update: 'PUT #url#/{id}',
	destroy: 'DELETE #url#/{id}'
};

var _Models = {};

var OPModel = function () {
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
}();

exports.default = {

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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/*
 * OP.Multilingual
 *
 * A set of helpers for Multilingual Data.
 *
 */

exports.default = {

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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	uuid: AD.util.uuid

};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
//
// OP.Comm.Service.*
// 
// Map our old jQuery deferred comm utilities with ES6 promises.
//


var services = {

	// OP.Comm.Service.get(options, cb) => {promise}
	get: function get(options, cb) {
		return new Promise(function (resolve, reject) {
			AD.comm.service.get(options, cb).then(resolve, reject);
		});
	},

	// OP.Comm.Service.post(options, cb) => {promise}
	post: function post(options, cb) {
		return new Promise(function (resolve, reject) {
			AD.comm.service.post(options, cb).then(resolve, reject);
		});
	},

	// OP.Comm.Service.put(options, cb) => {promise}
	put: function put(options, cb) {
		return new Promise(function (resolve, reject) {
			AD.comm.service.put(options, cb).then(resolve, reject);
		});
	}

};

// OP.Comm.Service.delete(options, cb) => {promise}
services['delete'] = function (options, cb) {
	return new Promise(function (resolve, reject) {
		AD.comm.service['delete'](options, cb).then(resolve, reject);
	});
};

exports.default = services;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

/**
 * @class configDesktop
 *
 * Manage our configuration settings for Desktop styles.

 */

exports.default = {

	// Application List
	appListRowHeight: 70,

	// button types
	buttonWidthLarge: 200,
	buttonWidthMedium: 150,
	buttonWidthSmall: 100,
	buttonWidthExtraSmall: 50,

	// tab types
	tabWidthLarge: 200,
	tabWidthMedium: 120,
	tabWidthSmall: 100,
	tabWidthExtraSmall: 50,

	// column types


	// spacers
	smallSpacer: 10,
	mediumSpacer: 25,
	largeSpacer: 50,
	xLargeSpacer: 100,
	xxLargeSpacer: 200,
	appListSpacerRowHeight: 100,
	appListSpacerColMinWidth: 100,
	appListSpacerColMaxWidth: 200,
	objectWorkspaceColWidth: 20,

	// labels
	labelWidthSmall: 50,
	labelWidthMedium: 80,
	labelWidthLarge: 120,
	labelWidthXLarge: 150,
	labelWidthCheckbox: 0,

	// show elements on desktop
	hideMobile: false

};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

/**
 * @class configMobile
 *
 * Manage our configuration settings for mobile styles.

 */

exports.default = {

	// Application List
	appListRowHeight: 70,

	// button types
	buttonWidthLarge: 200,
	buttonWidthMedium: 150,
	buttonWidthSmall: 100,
	buttonWidthExtraSmall: 50,

	// tab types
	tabWidthLarge: 200,
	tabWidthMedium: 120,
	tabWidthSmall: 100,
	tabWidthExtraSmall: 50,

	// column types


	// spacers
	smallSpacer: 1,
	mediumSpacer: 10,
	largeSpacer: 20,
	xLargeSpacer: 50,
	xxLargeSpacer: 100,
	appListSpacerRowHeight: 10,
	appListSpacerColMinWidth: 1,
	appListSpacerColMaxWidth: 1,
	objectWorkspaceColWidth: 1,

	// labels
	labelWidthSmall: 50,
	labelWidthMedium: 80,
	labelWidthLarge: 120,
	labelWidthCheckbox: 0,

	// hide elements for mobile
	hideMobile: true

};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ABFieldString = __webpack_require__(20);

var _ABFieldString2 = _interopRequireDefault(_ABFieldString);

var _ABFieldNumber = __webpack_require__(19);

var _ABFieldNumber2 = _interopRequireDefault(_ABFieldNumber);

var _ABFieldDate = __webpack_require__(17);

var _ABFieldDate2 = _interopRequireDefault(_ABFieldDate);

var _ABFieldImage = __webpack_require__(18);

var _ABFieldImage2 = _interopRequireDefault(_ABFieldImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* 
 * Fields
 * A name => ABField  hash of the different ABFields available.
 */
/* 
 * ABFieldManager
 * 
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */

var Fields = {};
Fields[_ABFieldString2.default.defaults().key] = _ABFieldString2.default;
Fields[_ABFieldNumber2.default.defaults().key] = _ABFieldNumber2.default;
Fields[_ABFieldDate2.default.defaults().key] = _ABFieldDate2.default;

Fields[_ABFieldImage2.default.defaults().key] = _ABFieldImage2.default;

exports.default = {

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

		if (values.key) {
			return new Fields[values.key](values, object);
		} else {

			//// TODO: what to do here?
		}
	}

};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

__webpack_require__(21);

__webpack_require__(25);

var _edittree = __webpack_require__(42);

var _edittree2 = _interopRequireDefault(_edittree);

var _editlist = __webpack_require__(41);

var _editlist2 = _interopRequireDefault(_editlist);

var _AppBuilder = __webpack_require__(47);

var _AppBuilder2 = _interopRequireDefault(_AppBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
		rename: L('ab.common.rename', "*Rename"),
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

		renameErrorMessage: L('ab.common.rename.error', "*System could not rename <b>{0}</b>."),
		renameSuccessMessage: L('ab.common.rename.success', "*<b>{0}</b> is renamed."),

		// Data Field  common Property labels:
		dataFieldHeaderLabel: L('ab.dataField.common.headerLabel', '*Label'),
		dataFieldHeaderLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Header Name'),

		dataFieldColumnName: L('ab.dataField.common.columnName', '*Name'),
		dataFieldColumnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Column Name'),

		dataFieldShowIcon: L('ab.dataField.common.showIcon', '*show icon?')
	};

	// make instances of our Custom Components:
	OP.CustomComponent[_edittree2.default.key](App, 'edittree'); // ->  App.custom.edittree  now exists
	OP.CustomComponent[_editlist2.default.key](App, 'editlist'); // ->  App.custom.editlist  now exists


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
		borderless: true,
		animate: false,
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


// Import our Custom Components here:

/*
 * AB
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */

// import '../OP/OP'
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

__webpack_require__(14);

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

			// Removed this because the 140 pixels was causing the list to not scroll to the bottom of the page
			// var computedHeight = height - 140;

			var computedHeight = height;
			console.log("computed height: " + computedHeight);
			var mh = parseInt(appListDom.css('min-height').replace('px', ''));
			console.log("min-height: " + mh);
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
// import 'OP';
// import '../../../../../assets/js/webix/webix'
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import OP from "OP"


var _ABFieldManager = __webpack_require__(13);

var _ABFieldManager2 = _interopRequireDefault(_ABFieldManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function toDC(data) {
	return new webix.DataCollection({
		data: data

	});
}

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABObject = function () {
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

		if (typeof attributes.objectWorkspace != "undefined") {
			if (typeof attributes.objectWorkspace.sortFields == "undefined") attributes.objectWorkspace.sortFields = [];
			if (typeof attributes.objectWorkspace.frozenColumnID == "undefined") attributes.objectWorkspace.frozenColumnID = "";
			if (typeof attributes.objectWorkspace.hiddenFields == "undefined") attributes.objectWorkspace.hiddenFields = [];
		}

		this.objectWorkspace = attributes.objectWorkspace || {
			sortFields: [], // array of columns with their sort configurations
			frozenColumnID: "", // id of column you want to stop freezing
			hiddenFields: [] };

		// multilingual fields: label, description
		OP.Multilingual.translate(this, this, ['label']);

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
				errors = OP.Form.validationError({
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
			var _this3 = this;

			return new Promise(function (resolve, reject) {

				// OK, some of our Fields have special follow up actions that need to be
				// considered when they no longer exist, so before we simply drop this
				// object/table, drop each of our fields and give them a chance to clean up
				// what needs cleaning up.

				// ==> More work, but safer.
				var fieldDrops = [];
				_this3.fields().forEach(function (f) {
					fieldDrops.push(f.destroy());
				});

				Promise.all(fieldDrops).then(function () {

					// now drop our table
					// NOTE: our .migrateXXX() routines expect the object to currently exist
					// in the DB before we perform the DB operations.  So we need to
					// .migrateDrop()  before we actually .objectDestroy() this.
					_this3.migrateDrop().then(function () {

						// finally remove us from the application storage
						return _this3.application.objectDestroy(_this3);
					}).then(resolve).catch(reject);
				}).catch(reject);
			});
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
			var _this4 = this;

			return new Promise(function (resolve, reject) {

				var isAdd = false;

				// if this is our initial save()
				if (!_this4.id) {

					_this4.id = OP.Util.uuid(); // setup default .id
					_this4.label = _this4.label || _this4.name;
					_this4.urlPath = _this4.urlPath || _this4.application.name + '/' + _this4.name;
					isAdd = true;
				}

				_this4.application.objectSave(_this4).then(function () {

					if (isAdd) {

						// on a Create: trigger a migrateCreate object
						_this4.migrateCreate().then(function () {
							resolve(_this4);
						}, reject);
					} else {
						resolve(_this4);
					}
				}).catch(function (err) {
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

			OP.Multilingual.unTranslate(this, this, ["label"]);

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
		/// DB Migrations
		///

	}, {
		key: "migrateCreate",
		value: function migrateCreate() {
			var url = '/app_builder/migrate/application/#appID#/object/#objID#'.replace('#appID#', this.application.id).replace('#objID#', this.id);

			return OP.Comm.Service.post({
				url: url
			});
		}
	}, {
		key: "migrateDrop",
		value: function migrateDrop() {
			var url = '/app_builder/migrate/application/#appID#/object/#objID#'.replace('#appID#', this.application.id).replace('#objID#', this.id);

			return OP.Comm.Service['delete']({
				url: url
			});
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
			return _ABFieldManager2.default.newField(values, this);
		}

		/**
   * @method fieldRemove()
   *
   * remove the given ABField from our ._fields array and persist the current
   * values.
   *
   * @param {ABField} field The instance of the field to remove.
   * @return {Promise}
   */

	}, {
		key: "fieldRemove",
		value: function fieldRemove(field) {
			this._fields = this.fields(function (o) {
				return o.id != field.id;
			});

			return this.save();
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
				if (this.workspaceHiddenFields.length > 0) {
					this.workspaceHiddenFields.forEach(function (hfID) {
						headers.forEach(function (h) {
							if (idLookup[h.id] == hfID) {
								h.hidden = true;
							}
						});
					});
				}
			}

			return headers;
		}
	}, {
		key: "workspaceSortFields",
		get: function get() {
			return this.objectWorkspace.sortFields;
		},
		set: function set(fields) {
			this.objectWorkspace.sortFields = fields;
		}
	}, {
		key: "workspaceFrozenColumnID",
		get: function get() {
			return this.objectWorkspace.frozenColumnID;
		},
		set: function set(id) {
			this.objectWorkspace.frozenColumnID = id;
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
}();

exports.default = ABObject;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(2);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(3);

var _ABFieldComponent2 = _interopRequireDefault(_ABFieldComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * ABFieldDate
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * An ABFieldDate defines a date/datetime field type.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldDateDefaults = {
	key: 'date', // unique key to reference this specific DataField

	icon: 'calendar', // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.date.menuName', '*Date'),

	// description: what gets displayed in the Editor description.
	description: ''
};

/**
 * ABFieldDateComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldDateComponent = new _ABFieldComponent2.default({
	fieldDefaults: ABFieldDateDefaults,

	elements: function elements(App) {
		return [{
			view: "label",
			label: "Pick one from a calendar."
		}, {
			view: "checkbox",
			name: "includeTime",
			labelRight: "Include time",
			labelWidth: 0,
			on: {
				onChange: function onChange(newVal, oldVal) {
					// TODO : Re-render default date picker
					// webix.ui({
					// 	view: 'datepicker',
					// 	label: "Default",
					// 	id: componentIds.default,
					// 	timepicker: newVal ? true : false,
					// 	disabled: $$(componentIds.currentToDefault).getValue() == true
					// }, $$(componentIds.default));
				}
			}
		}, {
			view: 'checkbox',
			name: "defaultCurrentDate",
			labelRight: 'Set current date to default value',
			labelWidth: 0,
			on: {
				onChange: function onChange(newVal, oldVal) {
					// if (newVal) {
					// 	$$(componentIds.default).disable();
					// }
					// else {
					// 	$$(componentIds.default).enable();
					// }
				}
			}
		}, {
			view: 'datepicker',
			label: "Default",
			name: 'defaultDate',
			timepicker: false // TODO
		}, {
			view: "label",
			label: "Date format options"
		}, {
			view: "text",
			name: "dateDisplay",
			label: "Date Display",
			labelWidth: "100",
			// id: componentIds.dateDisplay,
			disabled: true,
			//value : showdateDisplay(),
			placeholder: "date-display"
		}, {
			cols: [{
				view: "richselect",
				name: "dayFormat",
				// id: componentIds.includeDayFormat,
				label: "Day",
				value: 'includeDay-ddd',
				options: [{ id: 'includeDay-D', value: "1 2 ... 30 31" }, { id: 'includeDay-Do', value: "1st 2nd ... 30th 31st" }, { id: 'includeDay-DD', value: "01 02 ... 30 31" }, { id: 'includeDay-dd', value: "Su Mo ... Fr Sa" }, { id: 'includeDay-ddd', value: "Sun Mon ... Fri Sat" }, { id: 'includeDay-dddd', value: "Sunday Monday ... Friday Saturday" }],
				on: {
					'onChange': function onChange(newValue, oldValue) {
						// showDateDisplay();
					}
				}

			}, {
				view: "richselect",
				name: "dayOrder",
				// id: componentIds.includeDayOrder,
				label: "Places",
				value: 1,
				//disabled: true,
				options: [{ id: 1, value: "1" }, { id: 2, value: "2" }, { id: 3, value: "3" }],
				on: {
					'onChange': function onChange(newValue, oldValue) {
						// showDateDisplay();
					}
				}
			}]

		}, {
			view: "radio",
			name: "dayDelimiter",
			// id: componentIds.typeDayFormatDelimiters,
			label: "Delimiters",
			value: 'slash',
			vertical: true,
			options: [{ id: 'comma', value: "Comma" }, { id: 'slash', value: "Slash" }, { id: 'space', value: "Space" }, { id: 'dash', value: "Dash" }],
			on: {
				'onChange': function onChange(newValue, oldValue) {
					// showDateDisplay();
				}
			}
		}, {
			cols: [{
				view: "richselect",
				name: "monthFormat",
				// id: componentIds.includeMonthFormat,
				label: "Month",
				value: 'includeMonth-MMM',
				options: [{ id: 'includeMonth-M', value: "1 2 ... 11 12" }, { id: 'includeMonth-Mo', value: "1st 2nd ... 11th 12th" }, { id: 'includeMonth-MM', value: "01 02 ... 11 12" }, { id: 'includeMonth-MMM', value: "Jan Feb ... Nov Dec" }, { id: 'includeMonth-MMMM', value: "January February ... November December" }],
				on: {
					'onChange': function onChange(newValue, oldValue) {
						// showDateDisplay();
					}
				}
			}, {
				view: "richselect",
				name: "monthOrder",
				// id: componentIds.includeMonthOrder,
				label: "Places",
				value: 2,
				//disabled: true,
				options: [{ id: 1, value: "1" }, { id: 2, value: "2" }, { id: 3, value: "3" }],
				on: {
					'onChange': function onChange(newValue, oldValue) {
						// showDateDisplay();
					}
				}
			}]
		}, {
			view: "radio",
			name: "monthDelimiter",
			// id: componentIds.typeMonthFormatDelimiters,
			label: "Delimiters",
			value: 'slash',
			vertical: true,
			options: [{ id: 'comma', value: "Comma" }, { id: 'slash', value: "Slash" }, { id: 'space', value: "Space" }, { id: 'dash', value: "Dash" }],
			on: {
				'onChange': function onChange(newValue, oldValue) {
					// showDateDisplay();
				}
			}
		}, {
			cols: [{
				view: "richselect",
				name: "yearDelimiter",
				// id: componentIds.includeYearFormat,
				label: "Year",
				value: 'includeYear-YYYY',
				options: [{ id: 'includeYear-YY', value: "70 71 ... 29 30" }, { id: 'includeYear-YYYY', value: "1970 1971 ... 2029 2030" }],
				on: {
					'onChange': function onChange(newValue, oldValue) {
						// showDateDisplay();
					}
				}
			}, {
				view: "richselect",
				name: "yearOrder",
				// id: componentIds.includeYearOrder,
				label: "Places",
				value: 3,
				//disabled: true,
				options: [{ id: 1, value: "1" }, { id: 2, value: "2" }, { id: 3, value: "3" }],
				on: {
					'onChange': function onChange(newValue, oldValue) {
						// showDateDisplay();
					}
				}
			}]

		}, {
			view: "radio",
			name: "yearDelimiter",
			// id: componentIds.typeYearFormatDelimiters,
			label: "Delimiters",
			value: 'slash',
			vertical: true,
			options: [{ id: 'comma', value: "Comma" }, { id: 'slash', value: "slash" }, { id: 'space', value: "Space" }, { id: 'dash', value: "Dash" }],
			on: {
				'onChange': function onChange(newValue, oldValue) {
					// showDateDisplay();
				}
			}
		},

		// Validator
		{
			view: 'label',
			label: 'Validation criteria',
			css: 'ab-text-bold'
		}, {
			// id: componentIds.validateCondition,
			view: "select",
			name: "validateCondition",
			label: "Condition",
			value: 'none',
			options: [{ id: 'none', value: '[Condition]' }, { id: 'dateRange', value: 'Range' }, { id: 'between', value: 'Between' }, { id: 'notBetween', value: 'Not between' }, { id: '=', value: 'Equal to' }, { id: '<>', value: 'Not equal to' }, { id: '>', value: 'Greater than' }, { id: '<', value: 'Less than' }, { id: '>=', value: 'Greater than or Equal to' }, { id: '<=', value: 'Less than or Equal to' }],
			on: {
				onChange: function onChange(newVal, oldVal) {
					// switch (newVal) {
					// 	case 'none':
					// 		$$(componentIds.validateRange).hide();
					// 		$$(componentIds.validateLeft).hide();
					// 		$$(componentIds.validateRight).hide();
					// 		break;
					// 	case 'dateRange':
					// 		$$(componentIds.validateRange).show();
					// 		$$(componentIds.validateLeft).hide();
					// 		$$(componentIds.validateRight).hide();
					// 		break;
					// 	case 'between':
					// 	case 'notBetween':
					// 		$$(componentIds.validateRange).hide();
					// 		$$(componentIds.validateLeft).define('label', 'Start Date');
					// 		$$(componentIds.validateLeft).refresh();
					// 		$$(componentIds.validateLeft).show();
					// 		$$(componentIds.validateRight).show();
					// 		break;
					// 	case '=':
					// 	case '<>':
					// 	case '>':
					// 	case '<':
					// 	case '>=':
					// 	case '<=':
					// 		$$(componentIds.validateRange).hide();
					// 		$$(componentIds.validateLeft).define('label', 'Date');
					// 		$$(componentIds.validateLeft).refresh();
					// 		$$(componentIds.validateLeft).show();
					// 		$$(componentIds.validateRight).hide();
					// 		break;
					// }
				}
			}
		}, {
			// id: componentIds.validateRange,
			rows: [{
				// id: componentIds.validateRangeUnit,
				view: "select",
				name: "validateRangeUnit",
				label: 'Unit',
				options: [{ id: 'days', value: 'Days' }, { id: 'months', value: 'Months' }, { id: 'years', value: 'Years' }],
				on: {
					onChange: function onChange(newVal) {
						// $$(componentIds.validateRangeBeforeLabel).refresh();
						// $$(componentIds.validateRangeAfterLabel).refresh();
					}
				}
			}, {
				cols: [{
					// id: componentIds.validateRangeBeforeLabel,
					view: 'template',
					align: 'left',
					width: 125,
					borderless: true
				}, {
					view: 'label',
					label: '[Current date]',
					align: 'center'
				}, {
					// id: componentIds.validateRangeAfterLabel,
					view: 'template',
					align: 'right',
					borderless: true
				}]
			}, {
				cols: [{
					// id: componentIds.validateRangeBefore,
					view: 'slider',
					name: "validateRangeBefore",
					on: {
						onChange: function onChange(newVal, oldValue) {
							// $$(componentIds.validateRangeBeforeLabel).refresh();
						}
					}
				}, {
					// id: componentIds.validateRangeAfter,
					view: 'slider',
					name: "validateRangeAfter",
					on: {
						onChange: function onChange(newVal, oldValue) {
							// $$(componentIds.validateRangeAfterLabel).refresh();
						}
					}
				}]
			}]
		}, {
			// id: componentIds.validateLeft,
			name: "validateStartDate",
			view: 'datepicker',
			label: 'Start Date'
		}, {
			// id: componentIds.validateRight,
			name: "validateEndDate",
			view: 'datepicker',
			label: 'End Date'
		}];
	}

});

var ABFieldDate = function (_ABField) {
	_inherits(ABFieldDate, _ABField);

	function ABFieldDate(values, object) {
		_classCallCheck(this, ABFieldDate);

		return _possibleConstructorReturn(this, (ABFieldDate.__proto__ || Object.getPrototypeOf(ABFieldDate)).call(this, values, object, ABFieldDateDefaults));

		/*
  {
  	settings: {
  		textDefault: 'string',
  		supportMultilingual: true/false
  	}
  }
  */
	}

	// return the default values for this DataField


	_createClass(ABFieldDate, [{
		key: "isValid",


		///
		/// Instance Methods
		///


		value: function isValid() {

			var errors = _get(ABFieldDate.prototype.__proto__ || Object.getPrototypeOf(ABFieldDate.prototype), "isValid", this).call(this);

			// errors = OP.Form.validationError({
			// 	name:'columnName',
			// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
			// }, errors);

			return errors;
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
		// toObj () {

		// 	var obj = super.toObj();

		// 	// obj.settings = this.settings;  // <--  super.toObj()

		// 	return obj;
		// }


		///
		/// Working with Actual Object Values:
		///

		// return the grid column header definition for this instance of ABFieldDate

	}, {
		key: "columnHeader",
		value: function columnHeader(isObjectWorkspace) {
			var config = _get(ABFieldDate.prototype.__proto__ || Object.getPrototypeOf(ABFieldDate.prototype), "columnHeader", this).call(this, isObjectWorkspace);

			config.editor = 'text';
			config.sort = 'string';

			return config;
		}
	}], [{
		key: "defaults",
		value: function defaults() {
			return ABFieldDateDefaults;
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
		key: "propertiesComponent",
		value: function propertiesComponent(App) {
			return ABFieldDateComponent.component(App);
		}
	}]);

	return ABFieldDate;
}(_ABField3.default);

exports.default = ABFieldDate;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(2);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(3);

var _ABFieldComponent2 = _interopRequireDefault(_ABFieldComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * ABFieldImage
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * An ABFieldImage defines a Image field type.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldImageDefaults = {
	key: 'image', // unique key to reference this specific DataField
	// type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	icon: 'file-image-o', // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.image.menuName', '*Image Attachment'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.image.description', '*Attach an image to this object.')
};

var defaultValues = {
	'useWidth': 0,
	'imageWidth': '',
	'useHeight': 0,
	'imageHeight': '',
	'removeExistingData': 0
};

/**
 * ABFieldImageComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldImageComponent = new _ABFieldComponent2.default({

	fieldDefaults: ABFieldImageDefaults,

	elements: function elements(App, field) {

		var ids = {
			imageWidth: '',
			imageHeight: ''
		};
		ids = field.idsUnique(ids, App);

		return [{
			cols: [{
				view: "checkbox",
				name: "useWidth",
				labelRight: L('ab.dataField.image.width', "*width"),
				width: 80,
				labelWidth: 0,
				value: 1,
				click: function click() {
					if (this.getValue()) $$(ids.imageWidth).enable();else $$(ids.imageWidth).disable();
				}
			}, {
				view: 'text',
				name: 'imageWidth',
				id: ids.imageWidth
			}]
		}, {
			cols: [{
				view: "checkbox",
				name: "useHeight",
				// id:componentIds.useHeight, 
				labelRight: L('ab.dataField.image.height', "*height"),
				width: 80,
				labelWidth: 0,
				value: 1,
				click: function click() {
					if (this.getValue()) $$(ids.imageHeight).enable();else $$(ids.imageHeight).disable();
				}

			}, {
				view: 'text',
				name: 'imageHeight',
				id: ids.imageHeight
			}]
		}];
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these: 
	// 	@param {obj} ids  the list of ids used to generate the UI.  your 
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here	
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, values) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic: {},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function init(ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

});

var ABFieldImage = function (_ABField) {
	_inherits(ABFieldImage, _ABField);

	function ABFieldImage(values, object) {
		_classCallCheck(this, ABFieldImage);

		/*
  {
  settings: {
  'useWidth':0,
  'imageWidth':'',
  'useHeight': 0,
  'imageHeight': '',
  'removeExistingData': 0
  }
  }
  */

		// we're responsible for setting up our specific settings:
		var _this = _possibleConstructorReturn(this, (ABFieldImage.__proto__ || Object.getPrototypeOf(ABFieldImage)).call(this, values, object, ABFieldImageDefaults));

		for (var dv in defaultValues) {
			_this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		// text to Int:
		_this.settings.useWidth = parseInt(_this.settings.useWidth);
		_this.settings.useHeight = parseInt(_this.settings.useHeight);
		_this.settings.removeExistingData = parseInt(_this.settings.removeExistingData);
		return _this;
	}

	// return the default values for this DataField


	_createClass(ABFieldImage, [{
		key: "isValid",


		///
		/// Instance Methods
		///


		value: function isValid() {

			var errors = _get(ABFieldImage.prototype.__proto__ || Object.getPrototypeOf(ABFieldImage.prototype), "isValid", this).call(this);

			// errors = OP.Form.validationError({
			// 	name:'columnName',
			// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
			// }, errors);

			return errors;
		}

		/**
   * @function destroy
   * On a destroy operation, ask if the user wants to keep the related images.
   */

	}, {
		key: "destroy",
		value: function destroy() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				// verify we have been .save()d before:
				if (_this2.id) {

					// Ask the user what to do about the existing images:
					OP.Dialog.Confirm({
						title: L('ab.dataField.image.keepImages', '*Keep Images?'),
						message: L('ab.dataField.image.keepImagesDescription', '*Do you want to keep the images referenced by #label#?').replace('#label#', _this2.label),
						callback: function callback(result) {

							// update this setting so the server can respond correctly in
							// ABFieldImage.migrateDrop()
							_this2.settings.removeExistingData = result ? 0 : 1;
							_this2.save().then(function () {

								// TODO: a reminder that you still got alot on the server to do!
								OP.Dialog.Alert({
									title: '!! TODO !!',
									text: 'Tell a Developer to actually pay attention to this!'
								});
								// now the default .destroy() 
								_get(ABFieldImage.prototype.__proto__ || Object.getPrototypeOf(ABFieldImage.prototype), "destroy", _this2).call(_this2).then(resolve).catch(reject);
							}).catch(reject);
						}
					});
				} else {
					resolve(); // nothing to do really
				}
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
		// toObj () {

		// 	var obj = super.toObj();

		// 	// obj.settings = this.settings;  // <--  super.toObj()

		// 	return obj;
		// }


		///
		/// Working with Actual Object Values:
		///

		// return the grid column header definition for this instance of ABFieldImage

	}, {
		key: "columnHeader",
		value: function columnHeader(isObjectWorkspace) {
			var config = _get(ABFieldImage.prototype.__proto__ || Object.getPrototypeOf(ABFieldImage.prototype), "columnHeader", this).call(this, isObjectWorkspace);

			config.editor = 'text'; // '[edit_type]'   for your unique situation
			config.sort = 'string'; // '[sort_type]'   for your unique situation

			return config;
		}
	}], [{
		key: "defaults",
		value: function defaults() {
			return ABFieldImageDefaults;
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
		key: "propertiesComponent",
		value: function propertiesComponent(App) {
			return ABFieldImageComponent.component(App);
		}
	}]);

	return ABFieldImage;
}(_ABField3.default);

//// NOTE: if you need a unique [edit_type] by your returned config.editor above:
// webix.editors = {
//   "[edit_type]": {
//     focus: function () {...}
//     getValue: function () {...},
//     setValue: function (value) {...},
//     render: function () {...}
//   }
// };


//// NOTE: if you need a unique [sort_type] by your returned config.sort above:
// webix.DataStore.prototype.sorting.as.[sort_type] = function(a,b){ 
//     return a > b ? 1 : -1; 
// }


exports.default = ABFieldImage;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(2);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(3);

var _ABFieldComponent2 = _interopRequireDefault(_ABFieldComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * ABFieldNumber
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * An ABFieldNumber defines a Number field type.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldNumberDefaults = {
	key: 'number', // unique key to reference this specific DataField
	icon: 'slack', // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.number.menuName', '*Number'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.number.description', '*A Float or Integer Value')
};

var formatList = [{ id: 'none', value: L('ab.dataField.number.none', "*None") }, { id: 'dollar', value: L('ab.dataField.number.format.dollar', "$"), sign: "$", position: "prefix" }, { id: 'pound', value: L('ab.dataField.number.format.pound', "£"), sign: "£", position: "prefix" }, { id: 'euroBefore', value: L('ab.dataField.number.format.euroBefore', "€ (before)"), sign: "€", position: "prefix" }, { id: 'euroAfter', value: L('ab.dataField.number.format.euroAfter', "€ (after)"), sign: "€", position: "postfix" }, { id: 'percent', value: L('ab.dataField.number.format.percent', "%"), sign: "%", position: "postfix" }];

var defaultValues = {
	'allowRequired': 0,
	'numberDefault': '',
	'typeFormat': 'none',
	'typeDecimals': 'none',
	'typeDecimalPlaces': 'none',
	'typeRounding': 'none',
	'typeThousands': 'none',
	'validation': 0,
	'validateMinimum': '',
	'validateMaximum': ''
};

/**
 * ABFieldNumberComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldNumberComponent = new _ABFieldComponent2.default({

	fieldDefaults: ABFieldNumberDefaults,

	elements: function elements(App, field) {

		// var idBase = ABFieldNumberDefaults.type;
		// var ids = {
		// 	typeDecimalPlaces: this.unique(App, '_typeDecimalPlaces'),  // App.unique(idBase +'_typeDecimalPlaces'),
		// 	typeRounding: App.unique(idBase +'_typeRounding'),
		// 	validateMinimum: App.unique(idBase + '_validateMinimum'),
		// 	validateMaximum: App.unique(idBase + '_validateMaximum')
		// }

		var ids = {
			typeDecimalPlaces: '',
			typeRounding: '',
			validateMinimum: '',
			validateMaximum: ''
		};
		ids = field.idsUnique(ids, App);

		return [
		// {
		// 	view: "text",
		// 	name:'textDefault',
		// 	labelWidth: App.config.labelWidthLarge,
		// 	placeholder: L('ab.dataField.string.default', '*Default text')
		// },
		{
			view: "checkbox",
			// id: componentIds.allowRequired,
			name: "allowRequired",
			labelRight: L("ab.dataField.number.required", "*Required"),
			// inputWidth: 130,
			labelWidth: 0
		}, {
			view: "text",
			label: L("ab.dataField.number.defaultValue", "*Default Value"),
			labelWidth: App.config.labelWidthLarge,
			// id: componentIds.numberDefault,
			name: "numberDefault",
			placeholder: L('ab.dataField.number.defaultNumber', '*Default number'),
			on: {
				onChange: function onChange(newVal, oldVal) {
					// Validate number
					if (!new RegExp('^[0-9.]*$').test(newVal)) {
						// $$(componentIds.numberDefault).setValue(oldVal);
						this.setValue(oldVal);
					}
				}
			}
		}, {
			view: "richselect",
			// id: componentIds.typeFormat,
			name: 'typeFormat',
			label: L('ab.dataField.number.format', "*Format"),
			value: 'none',
			labelWidth: App.config.labelWidthLarge,
			options: formatList
		}, {
			view: "richselect",
			// id: componentIds.typeDecimals,
			name: 'typeDecimals',
			label: L('ab.dataField.number.decimals', "*Decimals"),
			value: 'none',
			labelWidth: App.config.labelWidthLarge,
			options: [{ id: 'none', value: L('ab.dataField.number.none', "*None") }, { id: 'period', value: L('ab.dataField.number.period', "*Period") }, { id: 'comma', value: L('ab.dataField.number.comma', "*Comma") }],
			on: {
				'onChange': function onChange(newValue, oldValue) {
					if (newValue == 'none') {
						$$(ids.typeDecimalPlaces).disable();
						$$(ids.typeRounding).disable();
						$$(ids.typeDecimalPlaces).hide();
						$$(ids.typeRounding).hide();
					} else {
						$$(ids.typeDecimalPlaces).enable();
						$$(ids.typeRounding).enable();
						$$(ids.typeDecimalPlaces).show();
						$$(ids.typeRounding).show();
					}
				}
			}
		}, {
			view: "richselect",
			id: ids.typeDecimalPlaces,
			name: 'typeDecimalPlaces',
			label: "Places",
			value: 'none',
			labelWidth: App.config.labelWidthLarge,
			disabled: true,
			hidden: true,
			options: [{ id: 'none', value: "0" }, { id: 1, value: "1" }, { id: 2, value: "2" }, { id: 3, value: "3" }, { id: 4, value: "4" }, { id: 5, value: "5" }, { id: 10, value: "10" }]
		}, {
			view: "richselect",
			id: ids.typeRounding,
			name: 'typeRounding',
			label: L('ab.dataField.number.rounding', "*Rounding"),
			value: 'none',
			labelWidth: App.config.labelWidthLarge,
			vertical: true,
			disabled: true,
			hidden: true,
			options: [{ id: 'none', value: L('ab.dataField.number.default', "*Default") }, { id: 'roundUp', value: L('ab.dataField.number.roundUp', "*Round Up") }, { id: 'roundDown', value: L('ab.dataField.number.roundDown', "*Round Down") }]
		}, {
			view: "richselect",
			// id: componentIds.typeThousands,
			name: 'typeThousands',
			label: L('ab.dataField.number.thousands', "*Thousands"),
			value: 'none',
			labelWidth: App.config.labelWidthLarge,
			vertical: true,
			options: [{ id: 'none', value: L('ab.dataField.number.none', "*None") }, { id: 'comma', value: L('ab.dataField.number.comma', "*Comma") }, { id: 'period', value: L('ab.dataField.number.period', "*Period") }, { id: 'space', value: L('ab.dataField.number.space', "*Space") }]
		}, {
			view: 'checkbox',
			// id: componentIds.validate,
			name: 'validation',
			labelWidth: App.config.labelWidthCheckbox,
			labelRight: L('ab.dataField.number.validation', "*Validation"),
			on: {
				onChange: function onChange(newVal) {
					if (newVal) {
						$$(ids.validateMinimum).enable();
						$$(ids.validateMaximum).enable();
						$$(ids.validateMinimum).show();
						$$(ids.validateMaximum).show();
					} else {
						$$(ids.validateMinimum).disable();
						$$(ids.validateMaximum).disable();
						$$(ids.validateMinimum).hide();
						$$(ids.validateMaximum).hide();
					}
				}
			}
		}, {
			view: 'text',
			id: ids.validateMinimum,
			name: 'validateMinimum',
			label: L('ab.dataField.number.minimum', "*Minimum"),
			labelWidth: App.config.labelWidthLarge,
			disabled: true,
			hidden: true,
			on: {
				onChange: function onChange(newVal, oldVal) {
					// Validate number
					if (!new RegExp('^[0-9.]*$').test(newVal)) {
						$$(ids.validateMinimum).setValue(oldVal || '');
					}
				}
			}
		}, {
			view: 'text',
			id: ids.validateMaximum,
			name: 'validateMaximum',
			label: L('ab.dataField.number.maximum', "*Maximum"),
			labelWidth: App.config.labelWidthLarge,
			disabled: true,
			hidden: true,
			on: {
				onChange: function onChange(newVal, oldVal) {
					// Validate number
					if (!new RegExp('^[0-9.]*$').test(newVal)) {
						$$(ids.validateMaximum).setValue(oldVal || '');
					}
				}
			}
		}];
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	// 	@param {obj} ids  the list of ids used to generate the UI.  your
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, values) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic: {

		populate: function populate(ids, values) {
			if (values.settings.validation) {
				$$(ids.validateMinimum).enable();
				$$(ids.validateMaximum).enable();
			} else {
				$$(ids.validateMinimum).disable();
				$$(ids.validateMaximum).disable();
			}
		}
	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function init(ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

});

var ABFieldNumber = function (_ABField) {
	_inherits(ABFieldNumber, _ABField);

	function ABFieldNumber(values, object) {
		_classCallCheck(this, ABFieldNumber);

		/*
  {
  settings: {
  'allowRequired':0,
  'numberDefault':null,
  'typeFormat': 'none',
  'typeDecimals': 'none',
  'typeDecimalPlaces': 'none',
  'typeRounding' : 'none',
  'typeThousands': 'none',
  'validation':0,
  'validateMinimum':null,
  'validateMaximum':null
  }
  }
  */

		// we're responsible for setting up our specific settings:
		var _this = _possibleConstructorReturn(this, (ABFieldNumber.__proto__ || Object.getPrototypeOf(ABFieldNumber)).call(this, values, object, ABFieldNumberDefaults));

		for (var dv in defaultValues) {
			_this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		// text to Int:
		_this.settings.allowRequired = parseInt(_this.settings.allowRequired);
		_this.settings.validation = parseInt(_this.settings.validation);

		return _this;
	}

	// return the default values for this DataField


	_createClass(ABFieldNumber, [{
		key: "isValid",


		///
		/// Instance Methods
		///


		value: function isValid() {

			var errors = _get(ABFieldNumber.prototype.__proto__ || Object.getPrototypeOf(ABFieldNumber.prototype), "isValid", this).call(this);

			// errors = OP.Form.validationError({
			// 	name:'columnName',
			// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
			// }, errors);

			return errors;
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
		// toObj () {

		// 	var obj = super.toObj();

		// 	// obj.settings = this.settings;  // <--  super.toObj()

		// 	return obj;
		// }


		///
		/// Working with Actual Object Values:
		///

		// return the grid column header definition for this instance of ABFieldNumber

	}, {
		key: "columnHeader",
		value: function columnHeader(isObjectWorkspace) {
			var config = _get(ABFieldNumber.prototype.__proto__ || Object.getPrototypeOf(ABFieldNumber.prototype), "columnHeader", this).call(this, isObjectWorkspace);

			config.editor = 'number'; // [edit_type] simple inline editing.
			config.sort = 'int'; // [sort_type]

			return config;
		}
	}], [{
		key: "defaults",
		value: function defaults() {
			return ABFieldNumberDefaults;
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
		key: "propertiesComponent",
		value: function propertiesComponent(App) {
			return ABFieldNumberComponent.component(App);
		}
	}]);

	return ABFieldNumber;
}(_ABField3.default);

// NOTE: if you need a unique [edit_type] by your returned config.editor above:


webix.editors.number = webix.extend({
	// TODO : Validate number only
}, webix.editors.text);

//// NOTE: if you need a unique [sort_type] by your returned config.sort above:
// webix.DataStore.prototype.sorting.as.[sort_type] = function(a,b){
//     return a > b ? 1 : -1;
// }

exports.default = ABFieldNumber;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(2);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(3);

var _ABFieldComponent2 = _interopRequireDefault(_ABFieldComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * ABFieldString
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * An ABFieldString defines a string field type.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldStringDefaults = {
	key: 'string', // unique key to reference this specific DataField
	// type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	icon: 'font', // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.string.menuName', '*Single line text'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.string.description', '*short string value')
};

/**
 * ABFieldStringComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldStringComponent = new _ABFieldComponent2.default({

	fieldDefaults: ABFieldStringDefaults,

	elements: function elements(App) {
		return [{
			view: "text",
			name: 'textDefault',
			labelWidth: App.config.labelWidthMedium,
			label: L('ab.dataField.string.defaultLabel', '*Default'),
			placeholder: L('ab.dataField.string.default', '*Enter default value')
		}, {
			view: "checkbox",
			name: 'supportMultilingual',
			labelRight: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),
			labelWidth: App.config.labelWidthCheckbox,
			value: true
		}];
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: {
		'textDefault': '',
		'supportMultilingual': 1
	},

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	// 	@param {obj} ids  the list of ids used to generate the UI.  your
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, values) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic: {},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function init(ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

});

var ABFieldString = function (_ABField) {
	_inherits(ABFieldString, _ABField);

	function ABFieldString(values, object) {
		_classCallCheck(this, ABFieldString);

		/*
  {
  settings: {
  textDefault: 'string',
  supportMultilingual: true/false
  }
  }
  */

		// we're responsible for setting up our specific settings:
		var _this = _possibleConstructorReturn(this, (ABFieldString.__proto__ || Object.getPrototypeOf(ABFieldString)).call(this, values, object, ABFieldStringDefaults));

		_this.settings.textDefault = values.settings.textDefault || '';
		_this.settings.supportMultilingual = values.settings.supportMultilingual + "" || "1";

		// text to Int:
		_this.settings.supportMultilingual = parseInt(_this.settings.supportMultilingual);

		return _this;
	}

	// return the default values for this DataField


	_createClass(ABFieldString, [{
		key: "isValid",


		///
		/// Instance Methods
		///


		value: function isValid() {

			var errors = _get(ABFieldString.prototype.__proto__ || Object.getPrototypeOf(ABFieldString.prototype), "isValid", this).call(this);

			// errors = OP.Form.validationError({
			// 	name:'columnName',
			// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
			// }, errors);

			return errors;
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
		// toObj () {

		// 	var obj = super.toObj();

		// 	// obj.settings = this.settings;  // <--  super.toObj()

		// 	return obj;
		// }


		///
		/// Working with Actual Object Values:
		///

		// return the grid column header definition for this instance of ABFieldString

	}, {
		key: "columnHeader",
		value: function columnHeader(isObjectWorkspace) {
			var config = _get(ABFieldString.prototype.__proto__ || Object.getPrototypeOf(ABFieldString.prototype), "columnHeader", this).call(this, isObjectWorkspace);

			config.editor = 'text';
			config.sort = 'string';

			return config;
		}
	}], [{
		key: "defaults",
		value: function defaults() {
			return ABFieldStringDefaults;
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
		key: "propertiesComponent",
		value: function propertiesComponent(App) {
			return ABFieldStringComponent.component(App);
		}
	}]);

	return ABFieldString;
}(_ABField3.default);

exports.default = ABFieldString;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

__webpack_require__(23);

__webpack_require__(22);

/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */

var idBase = 'ab_choose';
OP.Component.extend(idBase, function (App) {

	var ids = {
		component: App.unique(idBase + '_component')
	};

	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);

	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view: "multiview",
		animate: false,
		id: ids.component,
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * AB Choose Form
 *
 * Display the form for creating a new Application.
 *
 */

var labels = {

	component: {

		formHeader: L('ab.application.form.header', "*Application Info"),
		placeholderName: L('ab.application.form.placeholderName', "*Application name"),
		placeholderDescription: L('ab.application.form.placeholderDescription', "*Application description"),
		formDescription: L('ab.application.form.formDescription', "*Description"),

		sectionPermission: L('ab.application.form.sectionPermission', "*Permission"),
		permissionHeader: L('ab.application.form.headerPermission', "*Who can use this app?"),
		createNewRole: L('ab.application.form.createNewRoleButton', "*Create new roll"),

		invalidName: L('ab.application.invalidName', "*This application name is invalid"),
		duplicateName: L('ab.application.duplicateName', "*Name must be unique.")

	}
};

var idBase = 'ab_choose_form';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	var ids = {
		component: App.unique(idBase + '_component'),

		form: App.unique(idBase + '_form'),
		appFormPermissionList: App.unique(idBase + '_permission'),
		appFormCreateRoleButton: App.unique(idBase + '_createRole'),

		saveButton: App.unique(idBase + '_buttonSave')
	};

	var _ui = {

		id: ids.component,
		responsive: "hide",
		cols: [{
			maxWidth: App.config.appListSpacerColMaxWidth,
			minWidth: App.config.appListSpacerColMinWidth,
			width: App.config.appListSpacerColMaxWidth
		}, {
			responsiveCell: false,
			rows: [{
				maxHeight: App.config.appListSpacerRowHeight,
				hidden: App.config.hideMobile
			}, {
				view: "toolbar",
				cols: [{ view: "label", label: labels.component.formHeader, fillspace: true }]
			}, {
				view: "form",
				id: ids.form,
				autoheight: true,
				margin: 0,
				elements: [
				//{ type: "section", template: '<span class="webix_icon fa-edit" style="max-width:32px;"></span>Information', margin: 0 },
				{
					name: "label",
					view: "text",
					label: labels.common.formName,
					required: true,
					placeholder: labels.component.placeholderName,
					labelWidth: 100,
					on: {
						onChange: function onChange(newValue, oldValue) {
							_logic.permissionRenameRole(newValue, oldValue);
						}
					}
				}, { height: App.config.smallSpacer }, {
					name: "description",
					view: "textarea",
					// label: labels.common.formDescription,
					label: "Description",
					labelAlign: "left",
					labelWidth: 100,
					placeholder: labels.component.placeholderDescription,
					height: 100
				}, { height: App.config.smallSpacer }, {
					view: "toolbar",
					css: "ab-toolbar-submenu",
					cols: [{
						template: labels.component.permissionHeader,
						type: 'header',
						borderless: true
					}, {
						view: "toggle",
						id: ids.appFormCreateRoleButton,
						type: "icon",
						align: "right",
						autowidth: true,
						css: "ab-standard-button",
						offIcon: "square-o",
						onIcon: "check-square-o",
						label: labels.component.createNewRole,
						on: {
							onItemClick: function onItemClick(id, e) {
								_logic.createRoleButtonClick();
							}
						}
					}]
				}, {
					name: "permissions",
					id: ids.appFormPermissionList,
					view: "list",
					//height: 130,
					autowidth: true,
					autoheight: true,
					margin: 0,
					css: "ab-app-form-permission",
					template: "{common.markCheckbox()} #name#",
					type: {
						markCheckbox: function markCheckbox(obj) {
							return "<span class='check webix_icon fa-" + (obj.markCheckbox ? "check-" : "") + "square-o'></span>";
						}
					},
					on: {
						onItemClick: function onItemClick(id, e, node) {
							_logic.permissionClick(id, e, node);
						}
					}
				}, { height: App.config.smallSpacer }, {
					margin: 5,
					cols: [{ fillspace: true }, {
						view: "button",
						value: labels.common.cancel,
						width: App.config.buttonWidthSmall,
						css: "ab-cancel-button",
						click: function click() {
							_logic.cancel();
						}
					}, {
						id: ids.saveButton,
						view: "button",
						label: labels.common.save,
						type: "form",
						width: App.config.buttonWidthSmall,
						click: function click() {
							_logic.buttonSaveClick();
						} // end click()
					}]
				}]
			}, {
				maxHeight: App.config.appListSpacerRowHeight,
				hidden: App.config.hideMobile
			}]
		}, {
			maxWidth: App.config.appListSpacerColMaxWidth,
			minWidth: App.config.appListSpacerColMinWidth,
			width: App.config.appListSpacerColMaxWidth
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
				_ABApplication2.default.create(newApp).then(function (result) {
					cb(null, result);
				}).catch(cb);
			}, function (createdApp, cb) {
				_logic.permissionSave(createdApp).then(function () {
					cb();
				}).catch(cb);
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
				}).catch(next);
			}, function (app_role, next) {
				// Update application data
				Application.label = values.label;
				Application.description = values.description;

				if (app_role && app_role.id) Application.role = app_role.id;else Application.role = null;

				Application.save().then(function () {
					next();
				}).catch(next);
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
   * @function buttonSaveClick
   *
   * Process the user clicking on the [Save] button.
   */
		buttonSaveClick: function buttonSaveClick() {

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
   * @function createRoleButtonClick
   *
   * The user clicked the [Create Role] button.  Update the UI and add a
   * unique Application permission to our list.
   */
		createRoleButtonClick: function createRoleButtonClick() {

			if ($$(ids.appFormCreateRoleButton).getValue()) {

				// TODO: if not called from anywhere else, then move the name gathering into .permissionAddNew()
				// Add new app role
				var appName = $$(ids.form).elements["label"].getValue();
				_logic.permissionAddNew(appName);
			} else {
				// Remove app role
				_logic.permissionRemoveNew();
			}
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

			var errors = _ABApplication2.default.isValid(op, Form.getValues());
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
			// 		title: labels.component.invalidName,
			// 		text: labels.component.duplicateName.replace("#appName#", appName),
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
				isApplicationRole: true,
				markCheckbox: 1
			}, 0);

			// Select new role
			var selectedIds = $$(ids.appFormPermissionList).getSelectedId(true);
			selectedIds.push('newRole');
			$$(ids.appFormPermissionList).select(selectedIds);
		},

		/**
   * @function permissionClick
   *
   * Process when a permission entry in the list is clicked.
   */
		permissionClick: function permissionClick(id, e, node) {

			var List = $$(ids.appFormPermissionList);

			var item = List.getItem(id);

			if (List.getItem(id).isApplicationRole) {
				return;
			}

			if (List.isSelected(id)) {
				item.markCheckbox = 0;
				List.unselect(id);
			} else {
				item.markCheckbox = 1;
				var selectedIds = List.getSelectedId();

				if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
					if (selectedIds) selectedIds = [selectedIds];else selectedIds = [];
				}

				selectedIds.push(id);

				List.select(selectedIds);

				List.updateItem(id, item);
			}
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
					}).catch(function (err) {
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
						if (r.id == (application.role.id || application.role)) {
							r.isApplicationRole = true;
							r.markCheckbox = 1;
						}
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
					available_roles.forEach(function (r) {
						if (selected_role_ids.indexOf(r.id) > -1) {
							var item = $$(ids.appFormPermissionList).getItem(r.id);
							item.markCheckbox = 1;
							$$(ids.appFormPermissionList).updateItem(r.id, item);
						}
					});

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
							}).catch(cb);
						});
					}
				} else {
					// Delete any existing application roles
					saveRoleTasks.push(function (cb) {
						app.deletePermission().then(function () {
							cb();
						}).catch(cb);
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
					}).catch(cb);
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

			$$(ids.component).show();
		}
	};

	// Expose any globally accessible Actions:
	var _actions = {

		// initiate a request to create a new Application
		transitionApplicationForm: function transitionApplicationForm(application) {

			// if no application is given, then this should be a [create] operation,

			// so clear our AppList
			if ('undefined' == typeof application) {
				App.actions.unselectApplication();
			}

			// now prepare our form:
			_logic.formReset();
			if (application) {
				// populate Form here:
				_logic.formPopulate(application);
			}
			_logic.permissionPopulate(application);
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

__webpack_require__(24);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

	component: {
		title: L('ab.application.application', '*Application'),

		createNew: L('ab.application.createNew', '*Add new application'),
		noApplication: L('ab.application.noApplication', "*There is no application data")
	}
};

var idBase = 'ab_choose_list';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	var ids = {
		component: App.unique(idBase + '_component'),

		uploader: App.unique(idBase + '_uploader'),
		list: App.unique(idBase + '_list'),
		toolBar: App.unique(idBase + '_toolbar'),
		buttonCreateNewApplication: App.unique(idBase + '_buttonNewApp')
	};

	var MenuComponent = OP.Component['ab_choose_list_menu'](App);
	var PopupMenu = webix.ui(MenuComponent.ui);
	PopupMenu.hide();

	var _ui = {

		id: ids.component,
		responsive: "hide",

		cols: [{
			maxWidth: App.config.appListSpacerColMaxWidth,
			minWidth: App.config.appListSpacerColMinWidth,
			width: App.config.appListSpacerColMaxWidth
		}, {
			responsiveCell: false,
			rows: [{
				maxHeight: App.config.appListSpacerRowHeight,
				hidden: App.config.hideMobile
			},
			//
			// ToolBar
			//
			{
				view: "toolbar",
				id: ids.toolBar,
				cols: [{ view: "label", label: labels.component.title, fillspace: true }, {
					id: ids.buttonCreateNewApplication,
					view: "button",
					label: labels.component.createNew,
					autowidth: true,
					type: "icon",
					icon: "plus",
					click: function click() {
						// Inform our Chooser we have a request to create an Application:
						App.actions.transitionApplicationForm();
					}
				}, {
					view: "uploader",
					id: ids.uploader,
					label: labels.common.import,
					autowidth: true,
					upload: '/app_builder/appJSON',
					multiple: false,
					type: "icon",
					icon: "upload",
					autosend: true,
					on: {
						onAfterFileAdd: function onAfterFileAdd() {
							_logic.onAfterFileAdd();
						},
						onFileUpload: function onFileUpload(item, response) {
							_logic.onFileUpload(item, response);
						},
						onFileUploadError: function onFileUploadError(details, response) {
							_logic.onFileUploadError(details, response);
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
				css: 'ab-app-select-list',
				template: function template(obj, common) {
					return _logic.templateListItem(obj, common);
				},
				type: {
					height: App.config.appListRowHeight, // Defines item height
					iconGear: "<span class='webix_icon fa-cog'></span>"
				},
				select: false,
				onClick: {
					"ab-app-list-item": function abAppListItem(ev, id, trg) {
						return _logic.onClickListItem(ev, id, trg);
					},
					"ab-app-list-edit": function abAppListEdit(ev, id, trg) {
						return _logic.onClickListEdit(ev, id, trg);
					}
				}
			}, {
				maxHeight: App.config.appListSpacerRowHeight,
				hidden: App.config.hideMobile
			}]
		}, {
			maxWidth: App.config.appListSpacerColMaxWidth,
			minWidth: App.config.appListSpacerColMinWidth,
			width: App.config.appListSpacerColMaxWidth
		}]
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
			_ABApplication2.default.allApplications().then(function (data) {

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
			}).catch(function (err) {
				_logic.ready();
				webix.message({
					type: "error",
					text: err
				});
				AD.error.log('App Builder : Error loading application data', { error: err });
			});
		},

		/**
   * @function onAfterFileAdd
   *
   * UI updates for when a file upload is initiated
   */
		onAfterFileAdd: function onAfterFileAdd() {
			$$(ids.uploader).disable();
			_logic.busy();
		},

		/**
   * @function onClickListEdit
   *
   * UI updates for when the edit gear is clicked
   */
		onClickListEdit: function onClickListEdit(ev, id, trg) {

			// Show menu
			PopupMenu.show(trg);
			$$(ids.list).select(id);

			return false; // block default behavior
		},

		/**
   * @function onClickListItem
   *
   * An item in the list is selected. So update the workspace with that 
   * object.
   */
		onClickListItem: function onClickListItem(ev, id, trg) {

			_logic.busy();

			$$(ids.list).select(id);

			var selectedApp = $$(ids.list).getItem(id);

			if (selectedApp) {

				_logic.ready();

				// We've selected an Application to work with
				App.actions.transitionWorkspace(selectedApp);
			}

			return false; // block default behavior
		},

		/**
   * @function onFileUpload
   *
   * The File Upload process finished.
   */
		onFileUpload: function onFileUpload(item, response) {
			_logic.loadData(); // refresh app list
			$$(ids.uploader).enable();
			_logic.ready();
		},

		/**
   * @function onFileUploadError
   *
   * The File Upload process exited with an error.
   */
		onFileUploadError: function onFileUploadError(details, response) {

			var errorMessage = 'Error: ' + (response && response.message);
			OP.Dialog.Alert({
				text: errorMessage
			});
			// webix.message({
			// 	type: 'error',
			// 	text: errorMessage
			// });
			_logic.loadData(); // refresh app list
			$$(ids.uploader).enable();
			_logic.ready();
		},

		/**
   * @function refreshOverlay
   *
   * If we have no items in our list, display a Message.
   */
		refreshOverlay: function refreshOverlay() {
			var appList = $$(ids.list);

			if (!appList.count()) //if no data is available
				appList.showOverlay(labels.component.noApplication);else appList.hideOverlay();
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
			}).catch(function (err) {
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

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

	component: {
		menu: L('ab.application.menu', "*Application Menu"),
		confirmDeleteTitle: L('ab.application.delete.title', "*Delete application"),
		confirmDeleteMessage: L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")
	}
};

var idBase = 'ab_choose_list_menu';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	var ids = {
		menu: App.unique(idBase + '_menu')
	};

	var _ui = {
		view: "popup",
		id: ids.menu,
		head: labels.component.menu,
		width: 100,
		body: {
			view: "list",
			borderless: true,
			data: [{ command: labels.common.edit, icon: "fa-pencil-square-o" }, { command: labels.common.export, icon: "fa-download" }, { command: labels.common.delete, icon: "fa-trash" }],
			datatype: "json",

			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			autoheight: true,
			select: false,
			on: {
				'onItemClick': function onItemClick(timestamp, e, trg) {
					return _logic.onItemClick(timestamp, e, trg);
				}
			}
		}
	};

	var _data = {};

	var _init = function _init() {};

	var _logic = {

		/**
   * @function onItemClick
   * process which item in our popup was selected.
   */
		onItemClick: function onItemClick(timestamp, e, trg) {

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
						title: labels.component.confirmDeleteTitle,
						text: labels.component.confirmDeleteMessage.replace('{0}', selectedApp.label),
						callback: function callback(result) {

							if (!result) return;

							App.actions.deleteApplication(selectedApp);
						}
					});
					break;

				case labels.common.export:
					// Download the JSON file to disk
					window.location.assign('/app_builder/appJSON/' + selectedApp.id + '?download=1');
					break;
			}

			return false;
		}

	};

	return {
		ui: _ui,
		init: _init,

		_logic: _logic // exposed for Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

__webpack_require__(27);

__webpack_require__(26);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work
 *
 * Display the component for working with an ABApplication.
 *
 */

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
		rows: [{
			view: "toolbar",
			id: ids.toolBar,
			autowidth: true,
			cols: [{
				view: "button",
				label: labels.application.backToApplication,
				width: 200,
				type: "icon",
				icon: "arrow-left",
				align: "left",

				click: function click() {
					App.actions.transitionApplicationChooser();
				}
			}, {
				view: "label",
				id: ids.labelAppName,
				align: "center"
			}, {
				view: "spacer",
				width: 200,
				alrign: "right"
			}
			// {
			// 	id: ids.buttonSync,
			// 	view: "button",
			// 	type: "icon",
			// 	icon: "refresh",
			// 	label: labels.application.synchronize,
			// 	autowidth: true,
			// 	align: "right",
			// 	click: function () {
			// 		_logic.synchronize();
			// 	}
			// }
			]
		},
		//{ height: App.config.mediumSpacer },
		// {
		// 	view:"segmented",
		// 	id: ids.tabbar,
		// 	value: ids.tab_object,
		// 	multiview: true,
		// 	align: "center",
		// 	options:[
		// 		{
		// 			id: ids.tab_object,
		// 			value: labels.application.objectTitle,
		// 			width: App.config.tabWidthMedium
		// 		},
		// 		{
		// 			id: ids.tab_interface,
		// 			value: labels.application.interfaceTitle,
		// 			width: App.config.tabWidthMedium
		// 		}
		// 	],
		// 	on: {
		// 		onChange: function (idNew, idOld) {
		// 			if (idNew != idOld) {
		// 				_logic.tabSwitch(idNew, idOld);
		// 			}
		// 		}
		// 	}
		// },
		{ height: App.config.mediumSpacer }, {
			cols: [{
				width: App.config.mediumSpacer
			}, {
				rows: [{
					view: "tabbar",
					id: ids.tabbar,
					value: ids.tab_object,
					multiview: true,
					options: [{
						id: ids.tab_object,
						value: labels.application.objectTitle,
						width: App.config.tabWidthMedium
					}, {
						id: ids.tab_interface,
						value: labels.application.interfaceTitle,
						width: App.config.tabWidthMedium
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
			}, {
				width: App.config.mediumSpacer
			}]
		}, { height: App.config.mediumSpacer }]
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

					// $$(ids.buttonSync).show();
					AppObjectWorkspace.show();
					break;

				// Interface Workspace Tab
				case ids.tab_interface:

					// $$(ids.buttonSync).hide();
					AppInterfaceWorkspace.show();
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
			AppObjectWorkspace.applicationLoad(application);
			AppInterfaceWorkspace.applicationLoad(application);

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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */

var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
};

var idBase = 'ab_work_interface';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component')

	};

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		//scroll: true,
		rows: [{
			view: "label",
			label: "interface workspace"
		}]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {}
	// webix.extend($$(ids.form), webix.ProgressBar);

	// our internal business logic
	;var _logic = {

		/**
   * @function applicationLoad
   *
   * Initialize the Object Workspace with the given ABApplication.
   *
   * @param {ABApplication} application 
   */
		applicationLoad: function applicationLoad(application) {
			console.error('TODO: ab_work_interface.applicationLoad()');
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

		applicationLoad: _logic.applicationLoad,
		show: _logic.show,

		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

__webpack_require__(28);

__webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object
 *
 * Display the Object Tab UI:
 *
 */

var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
};

var idBase = 'ab_work_object';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component')

	};

	var ObjectList = OP.Component['ab_work_object_list'](App);
	var ObjectWorkspace = OP.Component['ab_work_object_workspace'](App);

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		margin: 10,
		cols: [ObjectList.ui, { view: "resizer" }, ObjectWorkspace.ui]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {

		ObjectWorkspace.init();
		ObjectList.init();
	};

	// our internal business logic
	var _logic = {

		/**
   * @function applicationLoad
   *
   * Initialize the Object Workspace with the given ABApplication.
   *
   * @param {ABApplication} application
   */
		applicationLoad: function applicationLoad(application) {
			ObjectList.applicationLoad(application);
			App.actions.clearObjectWorkspace();
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


		applicationLoad: _logic.applicationLoad,
		show: _logic.show,

		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

__webpack_require__(29);

__webpack_require__(31);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */

var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),

		confirmDeleteTitle: L('ab.object.delete.title', "*Delete object"),
		confirmDeleteMessage: L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")

	}
};

var idBase = 'ab_work_object_list';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

		list: App.unique(idBase + '_editlist'),
		buttonNew: App.unique(idBase + '_buttonNew')

	};

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		rows: [{
			view: App.custom.editlist.view, // "editlist",
			id: ids.list,
			width: 250,

			//height:800, // #Hack!

			select: true,
			editaction: 'custom',
			editable: true,
			editor: "text",
			editValue: "label",
			template: function template(obj, common) {
				return _logic.templateListItem(obj, common);
			},
			type: {
				height: 35,
				iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
			},
			on: {
				onAfterRender: function onAfterRender() {
					_logic.onAfterRender();
				},
				onAfterSelect: function onAfterSelect(id) {
					_logic.selectObject(id);
				},
				onBeforeEditStop: function onBeforeEditStop(state, editor) {
					_logic.onBeforeEditStop(state, editor);
				},
				onAfterEditStop: function onAfterEditStop(state, editor, ignoreUpdate) {
					_logic.onAfterEditStop(state, editor, ignoreUpdate);
				}
			},
			onClick: {
				"ab-object-list-edit": function abObjectListEdit(e, id, trg) {
					_logic.clickEditMenu(e, id, trg);
				}
			}
		}, {
			view: 'button',
			id: ids.buttonNew,
			value: labels.component.addNew,
			click: function click() {
				_logic.clickNewObject();
			}
		}]
	};

	// Our init() function for setting up our UI
	var _init = function _init() {

		if ($$(ids.component)) $$(ids.component).adjust();

		if ($$(ids.list)) {
			webix.extend($$(ids.list), webix.ProgressBar);
			$$(ids.list).adjust();
		}

		PopupNewObjectComponent.init({
			onDone: _logic.callbackNewObject
		});

		PopupEditObjectComponent.init({
			onClick: _logic.callbackObjectEditorMenu
		});
	};

	// our internal business logic
	var _logic = {

		/**
   * @function applicationLoad
   *
   * Initialize the Object List from the provided ABApplication
   *
   * If no ABApplication is provided, then show an empty form. (create operation)
   *
   * @param {ABApplication} application  	[optional] The current ABApplication
   *										we are working with.
   */
		applicationLoad: function applicationLoad(application) {
			_logic.listBusy();

			CurrentApplication = application;

			// get a DataCollection of all our objects
			objectList = new webix.DataCollection({
				data: application.objects()
			});

			// clear our list and display our objects:
			var List = $$(ids.list);
			List.clearAll();
			List.data.unsync();
			List.data.sync(objectList);
			List.refresh();
			List.unselectAll();

			//
			_logic.listReady();

			// prepare our Popup with the current Application
			PopupNewObjectComponent.applicationLoad(application);
		},

		clickEditMenu: function clickEditMenu(e, id, trg) {
			// Show menu
			PopupEditObjectComponent.show(trg);

			return false;
		},

		listBusy: function listBusy() {
			$$(ids.list).showProgress({ type: "icon" });
		},

		listReady: function listReady() {
			$$(ids.list).hideProgress();
		},

		onAfterRender: function onAfterRender() {
			console.error('!! todo: onAfterRender() editing');
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

		onAfterEditStop: function onAfterEditStop(state, editor, ignoreUpdate) {

			_logic.showGear(editor.id);

			if (state.value != state.old) {
				_logic.listBusy();

				var selectedObject = $$(ids.list).getSelectedItem(false);
				selectedObject.label = state.value;

				// Call server to rename
				selectedObject.save().catch(function () {
					_logic.listReady();

					OP.Dialog.Alert({
						text: labels.common.renameErrorMessage.replace("{0}", state.old)
					});
				}).then(function () {
					_logic.listReady();

					// TODO : should use message box
					OP.Dialog.Alert({
						text: labels.common.renameSuccessMessage.replace("{0}", state.value)
					});
				});
			}
		},

		onBeforeEditStop: function onBeforeEditStop(state, editor) {
			console.error('!! todo: onBeforeEditStop() editing');
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

		/**
   * @function selectObject()
   *
   * Perform these actions when an Object is selected in the List.
   */
		selectObject: function selectObject(id) {

			var object = $$(ids.list).getItem(id);
			App.actions.populateObjectWorkspace(object);

			//// TODO: do we need these?

			// // Refresh unsync number
			// self.refreshUnsyncNumber();

			_logic.showGear(id);
		},

		showGear: function showGear(id) {
			var gearIcon = $$(ids.list).getItemNode(id).querySelector('.ab-object-list-edit');
			gearIcon.style.visibility = "visible";
			gearIcon.style.display = "block";
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
   * @function callbackNewObject
   *
   * Once a New Object was created in the Popup, follow up with it here.
   */
		callbackNewObject: function callbackNewObject(err, object) {

			if (err) {
				OP.Error.log('Error creating New Object', { error: err });
				return;
			}

			objectList.add(object, objectList.count());
			$$(ids.list).select(object.id);
		},

		/**
   * @function clickNewObject
   *
   * Manages initiating the transition to the new Object Popup window
   */
		clickNewObject: function clickNewObject() {

			// show the new popup
			PopupNewObjectComponent.show();
		},

		rename: function rename() {
			var objectId = $$(ids.list).getSelectedId(false);
			$$(ids.list).edit(objectId);
		},

		remove: function remove() {

			var selectedObject = $$(ids.list).getSelectedItem(false);

			// verify they mean to do this:
			OP.Dialog.Confirm({
				title: labels.component.confirmDeleteTitle,
				message: labels.component.confirmDeleteMessage.replace('{0}', selectedObject.label),
				callback: function callback(isOK) {

					if (isOK) {
						_logic.listBusy();

						selectedObject.destroy().then(function () {
							_logic.listReady();

							$$(ids.list).remove(selectedObject.id);
							App.actions.clearObjectWorkspace();
						});
					}
				}
			});
		},

		callbackObjectEditorMenu: function callbackObjectEditorMenu(action) {
			switch (action) {
				case 'rename':
					_logic.rename();
					break;
				case 'delete':
					_logic.remove();
					break;
			}
		}
	};

	/*
  * _templateListItem
  *
  * The Object Row template definition.
  */
	var _templateListItem = ["<div class='ab-object-list-item'>", "#label#",
	// "{common.unsyncNumber}",
	"{common.iconGear}", "</div>"].join('');

	// Note: put these here so _logic is defined:
	// There is a Popup for adding a new Object:
	var PopupNewObjectComponent = OP.Component['ab_work_object_list_newObject'](App);
	var PopupEditObjectComponent = OP.Component['ab_work_object_list_popupEditMenu'](App);

	var CurrentApplication = null;
	var objectList = null;

	// Expose any globally accessible Actions:
	var _actions = {

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

		// interface methods for parent component:
		applicationLoad: _logic.applicationLoad,

		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

__webpack_require__(30);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Object.  This Popup will manage several
 * different sub components for gathering Object data for saving.
 *
 * The sub components will gather the data for the object and do basic form
 * validations on their interface.
 *
 * when ready, the sub component will call onSave(values, cb)  to allow this
 * component to manage the actual final object validation, and saving to this
 * application.  On success, cb(null) will be called.  on error cb(err) will
 * be called.
 *
 */

var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object')

	}
};

var idBase = 'ab_work_object_list_newObject';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component')
	};

	var BlankTab = OP.Component['ab_work_object_list_newObject_blank'](App);

	// Our webix UI definition:
	var _ui = {
		view: "window",
		id: ids.component,
		// width: 400,
		position: "center",
		modal: true,
		head: labels.component.addNew,
		selectNewObject: true,
		body: {
			view: "tabview",
			cells: [BlankTab.ui]
		}
	};

	// Our init() function for setting up our UI
	var _init = function _init(options) {
		webix.ui(_ui);

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		var ourCBs = {
			onCancel: _logic.hide,
			onSave: _logic.save
		};

		BlankTab.init(ourCBs);
	};

	// our internal business logic
	var _logic = {

		/**
   * @function applicationLoad()
   *
   * prepare ourself with the current application
   */
		applicationLoad: function applicationLoad(application) {
			// _logic.show();
			currentApplication = application; // remember our current Application.
		},

		callbacks: {
			onDone: function onDone() {}
		},

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

			// create a new (unsaved) instance of our object:
			var newObject = currentApplication.objectNew(values);

			// have newObject validate it's values.
			var validationErrors = newObject.isValid();
			if (validationErrors) {
				cb(validationErrors); // tell current Tab component the errors
				return false; // stop here.
			}

			// if we get here, save the new Object
			newObject.save().then(function (obj) {

				// successfully done:
				cb(); // tell current tab component save successful
				_logic.hide(); // hide our popup
				_logic.callbacks.onDone(null, obj); // tell parent component we're done
			}).catch(function (err) {
				cb(err); // tell current Tab component there was an error
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
	// var currentCallBack = null;


	// Expose any globally accessible Actions:
	var _actions = {};

	// return the current instance of this component:
	return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		applicationLoad: _logic.applicationLoad,
		show: _logic.show,

		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

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

	component: {
		placeholderName: L('ab.object.form.placeholderName', "*Object name")
	}
};

var idBase = 'ab_work_object_list_newObject_blank';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

		form: App.unique(idBase + '_blank'),
		buttonSave: App.unique(idBase + '_save'),
		buttonCancel: App.unique(idBase + '_cancel')
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
					view: "button", id: ids.buttonCancel, value: labels.common.cancel,
					click: function click() {
						_logic.cancel();
					}
				}, {
					view: "button", id: ids.buttonSave, value: labels.common.add, type: "form",
					click: function click() {
						return _logic.save();
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
				saveButton.enable();
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

/*
 * Edit object popup 
 *
 * .
 *
 */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {
		menu: L('ab.application.menu', "*Application Menu"),
		confirmDeleteTitle: L('ab.application.delete.title', "*Delete application"),
		confirmDeleteMessage: L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")
	}
};

var idBase = 'ab_work_object_list_popupEditMenu';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	var ids = {
		menu: App.unique(idBase + '_menu')
	};

	var _ui = {
		view: "popup",
		id: ids.menu,
		head: labels.component.menu,
		width: 120,
		body: {
			view: "list",
			borderless: true,
			data: [{ command: labels.common.rename, icon: "fa-pencil-square-o" }, { command: labels.common.delete, icon: "fa-trash" }],
			datatype: "json",
			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			autoheight: true,
			select: false,
			on: {
				'onItemClick': function onItemClick(timestamp, e, trg) {
					return _logic.onItemClick(trg);
				}
			}
		}
	};

	var _data = {};

	var _init = function _init(options) {
		webix.ui(_ui);

		_logic.hide();

		// register our callbacks:
		for (var c in _logic.callbacks) {
			if (options && options[c]) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}
		}
	};

	var _logic = {

		callbacks: {
			onClick: function onClick(action) {}
		},

		/**
   * @function onItemClick
   * process which item in our popup was selected.
   */
		onItemClick: function onItemClick(itemNode) {

			// hide our popup before we trigger any other possible UI animation: (like .edit)
			// NOTE: if the UI is animating another component, and we do .hide()
			// while it is in progress, the UI will glitch and give the user whiplash.

			switch (itemNode.textContent.trim()) {
				case labels.common.rename:
					this.callbacks.onClick('rename');
					break;
				case labels.common['delete']:
					this.callbacks.onClick('delete');
					break;
			}

			this.hide();

			return false;
		},

		show: function show(itemNode) {
			if ($$(ids.menu) && itemNode) $$(ids.menu).show(itemNode);
		},

		hide: function hide() {
			if ($$(ids.menu)) $$(ids.menu).hide();
		}

	};

	return {
		ui: _ui,
		init: _init,

		show: _logic.show,

		_logic: _logic // exposed for Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

__webpack_require__(33);

__webpack_require__(34);

__webpack_require__(35);

__webpack_require__(37);

__webpack_require__(38);

__webpack_require__(39);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

var labels = {

	component: {

		addNewRow: L('ab.object.addNewRow', "*Add new row"),

		selectObject: L('ab.object.selectObject', "*Select an object to work with."),

		// formHeader: L('ab.application.form.header', "*Application Info"),

		// Toolbar:
		hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
		filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
		sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
		frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen columns"),
		defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
		permission: L('ab.object.toolbar.permission', "*Permission"),
		addFields: L('ab.object.toolbar.addFields', "*Add new column"),
		"export": L('ab.object.toolbar.export', "*Export"),

		confirmDeleteTitle: L('ab.object.delete.title', "*Delete data field"),
		confirmDeleteMessage: L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")
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

	// Various Popups on our page:
	var PopupDefineLabelComponent = OP.Component['ab_work_object_workspace_popupDefineLabel'](App);
	var PopupDefineLabel = webix.ui(PopupDefineLabelComponent.ui);

	var PopupFrozenColumnsComponent = OP.Component['ab_work_object_workspace_popupFrozenColumns'](App);
	var PopupFrozenColumns = webix.ui(PopupFrozenColumnsComponent.ui);

	var PopupHideFieldComponent = OP.Component['ab_work_object_workspace_popupHideFields'](App);
	var PopupHideField = webix.ui(PopupHideFieldComponent.ui);

	var PopupNewDataFieldComponent = OP.Component['ab_work_object_workspace_popupNewDataField'](App);
	// var PopupNewDataField = webix.ui(PopupNewDataFieldComponent.ui);
	webix.ui(PopupNewDataFieldComponent.ui);

	var PopupSortFieldComponent = OP.Component['ab_work_object_workspace_popupSortFields'](App);
	var PopupSortField = webix.ui(PopupSortFieldComponent.ui);

	// Our webix UI definition:
	var _ui = {
		view: 'multiview',
		id: ids.component,
		rows: [{
			id: ids.noSelection,
			rows: [{
				maxHeight: App.config.xxLargeSpacer,
				hidden: App.config.hideMobile
			}, {
				view: 'label',
				align: "center",
				label: labels.component.selectObject
			}, {
				maxHeight: App.config.xxLargeSpacer,
				hidden: App.config.hideMobile
			}]
		}, {
			id: ids.selectedObject,
			rows: [{
				view: 'toolbar',
				id: ids.toolbar,
				hidden: true,
				css: "ab-data-toolbar",
				cols: [{
					view: "button",
					id: ids.buttonFieldsVisible,
					label: labels.component.hideFields,
					// popup: 'self.webixUiId.visibleFieldsPopup',
					icon: "eye-slash",
					type: "icon",
					// width: 120,
					autowidth: true,
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
					// width: 120,
					autowidth: true,
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
					// width: 120,
					autowidth: true,
					badge: 0,
					click: function click() {
						_logic.toolbarSort(this.$view);
					}
				}, {
					view: 'button',
					id: ids.buttonFrozen,
					label: labels.component.frozenColumns,
					icon: "thumb-tack",
					type: "icon",
					autowidth: true,
					badge: 0,
					click: function click() {
						_logic.toolbarFrozen(this.$view);
					}
				}, {
					view: 'button',
					id: ids.buttonLabel,
					label: labels.component.defineLabel,
					icon: "crosshairs",
					type: "icon",
					// width: 130,
					autowidth: true,
					click: function click() {
						_logic.toolbarDefineLabel(this.$view);
					}
				}, {
					view: 'button',
					label: labels.component.permission,
					icon: "lock",
					type: "icon",
					autowidth: true,
					click: function click() {
						_logic.toolbarPermission(this.$view);
					}

				}, {
					view: 'button',
					id: ids.buttonAddField,
					label: labels.component.addFields,
					icon: "plus",
					type: "icon",
					// width: 150,
					autowidth: true,
					click: function click() {
						_logic.toolbarAddFields(this.$view);
					}
				}, {
					view: 'button',
					id: ids.buttonExport,
					label: labels.component.export,
					icon: "download",
					type: "icon",
					autowidth: true,
					click: function click() {
						_logic.toolbarButtonExport(this.$view);
					}
				}]
			}, DataTable.ui, {
				cols: [{
					view: "button",
					id: ids.buttonRowNew,
					value: labels.component.addNewRow,
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

		DataTable.init({
			onEditorMenu: _logic.callbackHeaderEditorMenu
		});

		PopupDefineLabelComponent.init({
			onChange: _logic.callbackDefineLabel // be notified when there is a change in the label
		});

		PopupFrozenColumnsComponent.init({
			onChange: _logic.callbackFrozenColumns // be notified when there is a change in the frozen columns
		});

		PopupHideFieldComponent.init({
			onChange: _logic.callbackFieldsVisible // be notified when there is a change in the hidden fields
		});

		PopupNewDataFieldComponent.init({
			onSave: _logic.callbackAddFields // be notified when a new Field is created & saved
		});

		var fieldList = DataTable.getFieldList();

		PopupSortFieldComponent.init({
			data: { "james": "duncan" },
			datatable: DataTable,
			fieldList: fieldList,
			onChange: _logic.callbackSortFields // be notified when there is a change in the sort fields
		});

		$$(ids.noSelection).show();
	};

	var CurrentObject = null;

	// our internal business logic
	var _logic = {

		/**
   * @function callbackDefineLabel
   *
   * call back for when the Define Label popup is finished.
   */
		callbackAddFields: function callbackAddFields(field) {
			DataTable.refresh();
		},

		/**
   * @function callbackDefineLabel
   *
   * call back for when the Define Label popup is finished.
   */
		callbackDefineLabel: function callbackDefineLabel() {},

		/**
   * @function callbackFrozenColumns
   *
   * call back for when the hidden fields have changed.
   */
		callbackFrozenColumns: function callbackFrozenColumns(skipRefresh) {

			var frozenID = CurrentObject.workspaceFrozenColumnID;

			if (typeof frozenID != "undefined") {
				var badgeNumber = DataTable.getColumnIndex(frozenID) + 1;

				$$(ids.buttonFrozen).define('badge', badgeNumber);
				$$(ids.buttonFrozen).refresh();

				if (!skipRefresh) {
					DataTable.refresh();
				}
			}
		},

		/**
   * @function callbackFieldsVisible
   *
   * call back for when the hidden fields have changed.
   */
		callbackFieldsVisible: function callbackFieldsVisible() {

			var hiddenFields = CurrentObject.workspaceHiddenFields;

			if (typeof hiddenFields != "undefined") {
				$$(ids.buttonFieldsVisible).define('badge', hiddenFields.length);
				$$(ids.buttonFieldsVisible).refresh();

				DataTable.refresh();

				// if you unhide a field it may fall inside the frozen columns range so lets check
				_logic.callbackFrozenColumns();
			}
		},

		/**
   * @function callbackHeaderEditorMenu
   *
   * call back for when an editor menu action has been selected.
   * @param {string} action [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
   */
		callbackHeaderEditorMenu: function callbackHeaderEditorMenu(action, field, node) {

			switch (action) {

				case 'hide':
				case 'filter':
				case 'sort':
					console.error('!! TODO: callbackHeaderEditorMenu():  unimplemented action:' + action);
					break;

				case 'edit':
					// pass control on to our Popup:
					PopupNewDataFieldComponent.show(node, field);
					break;

				case 'delete':

					// verify they mean to do this:
					OP.Dialog.Confirm({
						title: labels.component.confirmDeleteTitle,
						message: labels.component.confirmDeleteMessage.replace('{0}', field.label),
						callback: function callback(isOK) {

							if (isOK) {

								field.destroy().then(function () {
									DataTable.refresh();
								});
							}
						}
					});
					break;
			}
		},

		/**
   * @function callbackSortFields
   *
   * call back for when the sort fields popup changes
   */
		callbackSortFields: function callbackSortFields() {

			var fieldList = DataTable.getFieldList();

			//alert(fieldList);

			// if (typeof(fieldList) != "undefined") {
			// 	$$(ids.buttonFieldsVisible).define('badge', hiddenFields.length);
			// 	$$(ids.buttonFieldsVisible).refresh();
			//
			// 	DataTable.refresh();
			// }
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
   * @function toolbarAddFields
   *
   * Show the popup to allow the user to create new fields for
   * this object.
   */
		toolbarAddFields: function toolbarAddFields($view) {
			PopupNewDataFieldComponent.show($view);
		},

		toolbarButtonExport: function toolbarButtonExport($view) {
			console.error('TODO: Button Export()');
		},

		/**
   * @function toolbarDefineLabel
   *
   * Show the popup to allow the user to define the default label for
   * this object.
   */
		toolbarDefineLabel: function toolbarDefineLabel($view) {
			PopupDefineLabel.show($view);
		},

		/**
   * @function toolbarFieldsVisible
   *
   * Show the popup to allow the user to hide columns for this view.
   */
		toolbarFieldsVisible: function toolbarFieldsVisible($view) {
			PopupHideField.show($view);
		},

		/**
   * @function toolbarFilter
   *
   * show the popup to add a filter to the datatable
   */
		toolbarFilter: function toolbarFilter($view) {
			// self.refreshPopupData();
			// $$(self.webixUiId.filterFieldsPopup).show($view);
			console.error('TODO: button filterFields()');
		},

		/**
   * @function toolbarFrozen
   *
   * show the popup to freeze columns for the datatable
   */
		toolbarFrozen: function toolbarFrozen($view) {
			PopupFrozenColumns.show($view);
		},

		toolbarPermission: function toolbarPermission($view) {
			console.error('TODO: toolbarPermission()');
		},

		/**
   * @function toolbarSort
   *
   * show the popup to sort the datatable
   */
		toolbarSort: function toolbarSort($view) {
			PopupSortField.show($view);
			// self.refreshPopupData();
			// $$(self.webixUiId.sortFieldsPopup).show($view);
			//console.error('TODO: toolbarSort()');
		}
	};

	// Expose any globally accessible Actions:
	var _actions = {

		/**
   * @function clearObjectWorkspace()
   *
   * Clear the object workspace.
   */
		clearObjectWorkspace: function clearObjectWorkspace() {

			// NOTE: to clear a visual glitch when multiple views are updating
			// at one time ... stop the animation on this one:
			$$(ids.noSelection).show(false, false);
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
			_logic.callbackFieldsVisible();

			DataTable.objectLoad(object);

			PopupDefineLabelComponent.objectLoad(object);
			PopupFrozenColumnsComponent.objectLoad(object);
			PopupHideFieldComponent.objectLoad(object);
			PopupSortFieldComponent.objectLoad(object);

			_logic.callbackFrozenColumns(true);
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

__webpack_require__(36);

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

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
		//height:800,  // #hack!
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
			},

			onHeaderClick: function onHeaderClick(id, e, node) {
				_logic.onHeaderClick(id, e, node);
			}
		}
	};

	// Our init() function for setting up our UI
	var _init = function _init(options) {

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		// webix.extend($$(ids.form), webix.ProgressBar);
	};

	var CurrentObject = null; // current ABObject being displayed
	var EditField = null; // which field (column header) is popup editor for
	var EditNode = null; // which html node (column header) is popup editor for

	// our internal business logic
	var _logic = {

		callbacks: {

			/**
    * @function onEditorMenu
    * report back which menu action was clicked.
    * We get the info from our popupHeaderEditor component, but all the
    * logic to respond to those options are in our parent. So we pass it
    * on ...
    *
    * @param {string} action [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
    * @param {ABField} field  the field to which the action is to be applied
    * @param {dom} node  the optional html node for this header item.
    */
			onEditorMenu: function onEditorMenu(action, field) {}
		},

		/**
   * @function callbackHeaderEdit
   *
   * call back for when an item in the Header Edit Menu has been selected.
   * @param {string} action the action requested for this field:
   */
		callbackHeaderEdit: function callbackHeaderEdit(action) {

			PopupHeaderEdit.hide();
			_logic.callbacks.onEditorMenu(action, EditField, EditNode);
		},

		/**
   * @function getColumnIndex
   *
   * return the column index of a given column ID
   * @param {string} id column id you want the index of
   */
		getColumnIndex: function getColumnIndex(id) {
			var DataTable = $$(ids.component);

			return DataTable.getColumnIndex(id);
		},

		/**
   * @function getColumnConfig
   *
   * return the column config of a datagrid
   * @param {string} id datagrid id you want the column info from
   */
		getFieldList: function getFieldList() {
			var DataTable = $$(ids.component);

			return DataTable.fieldList;
		},

		/**
   * @function onHeaderClick
   *
   * process the user clicking on the header for one of our columns.
   */
		onHeaderClick: function onHeaderClick(id, e, node) {

			// Ignore system columns
			if (id.column == 'appbuilder_trash') return false;

			// save our EditNode & EditField:
			EditNode = node;

			EditField = CurrentObject.fields(function (f) {
				return f.id == id.column;
			})[0];
			if (EditField) {

				// show the popup
				PopupHeaderEdit.show(node);
			}

			return false;
		},

		objectLoad: function objectLoad(object) {

			CurrentObject = object;

			PopupHeaderEditComponent.objectLoad(object);

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
				// freeze columns:
				if (CurrentObject.workspaceFrozenColumnID != "") {
					DataTable.define('leftSplit', DataTable.getColumnIndex(CurrentObject.workspaceFrozenColumnID) + 1);
					DataTable.refreshColumns();
				}

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

	//// NOTE: declare these after _logic  for the callbacks:

	var PopupHeaderEditComponent = OP.Component['ab_work_object_workspace_popupHeaderEditMenu'](App);
	var PopupHeaderEdit = webix.ui(PopupHeaderEditComponent.ui);
	PopupHeaderEditComponent.init({
		onClick: _logic.callbackHeaderEdit // be notified when there is a change in the hidden fields
	});

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

		// expose data for badge on frozen button
		getColumnIndex: _logic.getColumnIndex,

		// expose data for column sort UI
		getFieldList: _logic.getFieldList,

		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

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
			}).catch(function (err) {
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_workspace_popupFrozenColumns
 *
 * Manage the Frozen Columns popup.
 *
 */

var labels = {

	component: {
		clearAll: L('ab.frozen_fields.clearAll', "*Clear All")
	}
};

var idBase = 'ab_work_object_workspace_popupFrozenColumns';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components
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
		width: 500,
		body: {
			rows: [{
				view: 'button', value: labels.component.clearAll, click: function click(id, e, node) {
					_logic.clickClearAll(id, e, node);

					// dataTable.define('leftSplit', 0);
					// dataTable.refreshColumns();
					//
					// $$(ids.component).refreshShowIcons();
					// $$(ids.component).callChangeEvent();
				}
			}, {
				view: 'list',
				id: ids.list,
				width: 250,
				autoheight: true,
				select: false,
				template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle-o ab-frozen-field-icon"></i>&nbsp;</span> #label#',
				on: {
					onItemClick: function onItemClick(id, e, node) {
						_logic.clickListItem(id, e, node);

						// dataTable.define('leftSplit', dataTable.getColumnIndex(id) + 1);
						// dataTable.refreshColumns();
						//
						// $$(ids.component).refreshShowIcons();
						// $$(ids.component).callChangeEvent();
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

			/**
    * @function onChange
    * called when we have made changes to the hidden field settings
    * of our Current Object.
    *
    * this is meant to alert our parent component to respond to the
    * change.
    */
			onChange: function onChange() {}
		},

		/**
   * @function clickClearAll
   * the user clicked the [clear all] option.  So show unfreeze all our columns.
   */
		clickClearAll: function clickClearAll() {
			// store empty string to not freeze any columns
			CurrentObject.workspaceFrozenColumnID = "";
			CurrentObject.save().then(function () {
				_logic.iconsReset();
				_logic.callbacks.onChange();
			}).catch(function (err) {
				OP.Error.log('Error trying to save workspaceFrozenColumnID', { error: err, fields: "" });
			});
		},

		/**
   * @function clickListItem
   * update the list to show which columns are frozen by showing an icon next to the column name
   */
		clickListItem: function clickListItem(id, e, node) {
			// update our Object with current frozen column id
			CurrentObject.workspaceFrozenColumnID = id;
			CurrentObject.save().then(function () {
				_logic.iconsReset();
				_logic.callbacks.onChange();
			}).catch(function (err) {
				OP.Error.log('Error trying to save workspaceFrozenColumnID', { error: err, fields: id });
			});
		},

		/**
   * @function iconDefault
   * Hide the icon for the given node
   * @param {DOM} node  the html dom node of the element that contains our icon
   */
		iconDefault: function iconDefault(node) {
			if (node) {
				node.querySelector('.ab-frozen-field-icon').classList.remove("fa-circle");
				node.querySelector('.ab-frozen-field-icon').classList.add("fa-circle-o");
			}
		},

		/**
   * @function iconFreeze
   * Show the icon for the given node
   * @param {DOM} node  the html dom node of the element that contains our icon
   */
		iconFreeze: function iconFreeze(node) {
			if (node) {
				node.querySelector('.ab-frozen-field-icon').classList.remove("fa-circle-o");
				node.querySelector('.ab-frozen-field-icon').classList.add("fa-circle");
			}
		},

		/**
   * @function iconsReset
   * Reset the icon displays according to the current values in our Object
   */
		iconsReset: function iconsReset() {
			var List = $$(ids.list);
			var isFrozen = false;

			// for each item in the List
			var id = List.getFirstId();
			while (id) {
				// find it's HTML Node
				var node = List.getItemNode(id);

				if (CurrentObject.workspaceFrozenColumnID == "") {
					// if there isn't any frozen columns just use the plain icon
					_logic.iconDefault(node);
				} else if (isFrozen == false) {
					// if this item is not the frozen id it is frozen until we reach the frozen id
					_logic.iconFreeze(node);
				} else {
					// else just show default icon
					_logic.iconDefault(node);
				}

				if (CurrentObject.workspaceFrozenColumnID == id) {
					isFrozen = true;
				}

				if (CurrentObject.workspaceHiddenFields.indexOf(id) != -1) {
					node.style.display = "none";
				} else {
					node.style.display = "";
				}

				// next item
				id = List.getNextId(id);
			}
		},

		/**
   * @function objectLoad
   * Ready the Popup according to the current object
   * @param {ABObject} object  the currently selected object.
   */
		objectLoad: function objectLoad(object) {
			CurrentObject = object;

			// refresh list
			var allFields = CurrentObject.fields();
			var listFields = [];
			allFields.forEach(function (f) {
				listFields.push({
					id: f.id,
					label: f.label,
					$css: "hidden_fields_" + f.id
				});
			});

			$$(ids.list).parse(listFields);
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

/*
 * ab_work_object_workspace_popupHeaderEditMenu
 *
 * Manage the Add New Data Field popup.
 *
 */

// import ABApplication from "../classes/ABApplication"
// import ABFieldManager from "../classes/ABFieldManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		hideField: L('ab.object.hideField', "*Hide field"),
		filterField: L('ab.object.filterField', "*Filter field"),
		sortField: L('ab.object.sortField', "*Sort field"),
		editField: L('ab.object.editField', "*Edit field"),
		deleteField: L('ab.object.deleteField', "*Delete field")
	}
};

var idBase = 'ab_work_object_workspace_popupHeaderEditMenu';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.

	var ids = {
		component: App.unique(idBase + '_component'),

		list: App.unique(idBase + '_list')
	};

	// the list of options shown in the popup menu:
	var menuItems = {

		// Normally all items are available
		'default': [{ command: labels.component.hideField, icon: "fa-columns" }, { command: labels.component.filterField, icon: "fa-filter" }, { command: labels.component.sortField, icon: "fa-sort" }, { command: labels.component.editField, icon: "fa-pencil-square-o" }, { command: labels.component.deleteField, icon: "fa-trash" }],
		// But for imported objects, edit & delete are disabled
		'imported': [{ command: labels.component.hideField, icon: "fa-columns" }, { command: labels.component.filterField, icon: "fa-filter" }, { command: labels.component.sortField, icon: "fa-sort" }]
	};

	// Our webix UI definition:
	var _ui = {
		view: "popup",
		id: ids.component,
		modal: false,
		autoheight: true,

		width: 180,
		body: {
			id: ids.list,
			view: 'list',
			datatype: "json",
			autoheight: true,
			select: false,
			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			data: menuItems['default'], // start with the default set:
			on: {
				'onItemClick': function onItemClick(timestamp, e, node) {
					_logic.onItemClick(timestamp, e, node);
				}
			}
		}
	};

	var CurrentObject = null;

	// Our init() function for setting up our UI
	var _init = function _init(options) {

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		// $$(ids.editDefinitions).cells() // define the edit Definitions here.
	};

	// our internal business logic
	var _logic = {

		callbacks: {
			/**
    * @function onClick
    * report back which menu action was clicked.
    * possible actions: [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
    */
			onClick: function onClick(action) {}
		},

		hide: function hide() {
			$$(ids.component).hide();
		},

		/**
   * @function objectLoad
   * Ready the Popup according to the current object
   * @param {ABObject} object  the currently selected object.
   */
		objectLoad: function objectLoad(object) {
			CurrentObject = object;

			// TODO:
			// check if object is imported, if so, then switch the shown fields to the imported menu:

			var listItems = menuItems['default'];
			// if (object.isImported) {
			// 	listItems = menuItems['imported'];
			// }
			var List = $$(ids.list);
			List.clearAll();
			List.parse(listItems);
		},

		/**
   * @function onItemClick
   * when an entry in our popup menu is selected, make sure our parent component is
   * alerted to the action requested.
   *
   * possible return action values: [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
   *
   */
		onItemClick: function onItemClick(timestamp, e, node) {

			var action = null;
			var menu = node.textContent.trim();
			switch (menu) {
				case labels.component.hideField:
					action = 'hide';
					break;
				case labels.component.filterField:
					action = 'filter';
					break;
				case labels.component.sortField:
					action = 'sort';
					break;
				case labels.component.editField:
					action = 'edit';
					break;
				case labels.component.deleteField:
					action = 'delete';
					break;
			}

			_logic.callbacks.onClick(action);
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
	var _actions = {}

	// populateObjectPopupAddDataField: function(object) {
	// 	_currentObject = object;
	// }

	// return the current instance of this component:
	;return {
		ui: _ui, // {obj} 	the webix ui definition for this component
		init: _init, // {fn} 	init() to setup this component
		actions: _actions, // {ob}		hash of fn() to expose so other components can access.


		hide: _logic.hide,
		objectLoad: _logic.objectLoad,
		show: _logic.show, // function($view, field_id) 


		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_workspace_popupHideFields
 *
 * Manage the Hide Fields popup.
 *
 */

var labels = {

	component: {

		showAll: L('ab.visible_fields.showAll', "*Show All"),
		hideAll: L('ab.visible_fields.hideAll', "*Hide All"),
		errorFrozen: L('ab.visible_fields.errorFrozen', "*Sorry, you cannot hide your last frozen column.")
	}
};

var idBase = 'ab_work_object_workspace_popupHideFields';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components
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
						_logic.clickShowAll();
					}
				}, {
					view: 'button',
					value: labels.component.hideAll,
					click: function click() {
						_logic.clickHideAll();
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
						_logic.clickListItem(id, e, node);
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

			/**
    * @function onChange
    * called when we have made changes to the hidden field settings
    * of our Current Object.
    *
    * this is meant to alert our parent component to respond to the
    * change.
    */
			onChange: function onChange() {}
		},

		/**
   * @function clickHideAll
   * the user clicked the [hide all] option.  So hide all our fields.
   */
		clickHideAll: function clickHideAll() {

			// create an array of all our field.id's:
			var allFields = CurrentObject.fields();
			var newHidden = [];
			allFields.forEach(function (f) {
				newHidden.push(f.id);
			});

			// store that
			CurrentObject.workspaceHiddenFields = newHidden;
			CurrentObject.save().then(function () {
				_logic.iconsReset();
				_logic.callbacks.onChange();
			}).catch(function (err) {
				OP.Error.log('Error trying to save workspaceHiddenFields', { error: err, fields: newHidden });
			});
		},

		/**
   * @function clickShowAll
   * the user clicked the [show all] option.  So show all our fields.
   */
		clickShowAll: function clickShowAll() {

			// store an empty array of hidden fields
			CurrentObject.workspaceHiddenFields = [];
			CurrentObject.save().then(function () {
				_logic.iconsReset();
				_logic.callbacks.onChange();
			}).catch(function (err) {
				OP.Error.log('Error trying to save workspaceHiddenFields', { error: err, fields: newHidden });
			});
		},

		/**
   * @function clickListItem
   * update the clicked field setting.
   */
		clickListItem: function clickListItem(id, e, node) {
			if (CurrentObject.workspaceFrozenColumnID == id) {
				OP.Dialog.Alert({
					text: labels.component.errorFrozen
				});
				return;
			}

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
			}).catch(function (err) {
				OP.Error.log('Error trying to save workspaceHiddenFields', { error: err, fields: newFields });
			});
		},

		/**
   * @function iconFreezeOff
   * Remove thumb tack if the field is not the choosen frozen column field
   * @param {DOM} node  the html dom node of the element that contains our icon
   */
		iconFreezeOff: function iconFreezeOff(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').classList.remove("fa-thumb-tack");
				node.querySelector('.ab-visible-field-icon').classList.add("fa-circle");
			}
		},

		/**
   * @function iconFreezeOn
   * Show a thumb tack if the field is the choosen frozen column field
   * @param {DOM} node  the html dom node of the element that contains our icon
   */
		iconFreezeOn: function iconFreezeOn(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').classList.remove("fa-circle");
				node.querySelector('.ab-visible-field-icon').classList.add("fa-thumb-tack");
			}
		},

		/**
   * @function iconHide
   * Hide the icon for the given node
   * @param {DOM} node  the html dom node of the element that contains our icon
   */
		iconHide: function iconHide(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').style.visibility = "hidden";
			}
		},

		/**
   * @function iconShow
   * Show the icon for the given node
   * @param {DOM} node  the html dom node of the element that contains our icon
   */
		iconShow: function iconShow(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').style.visibility = "visible";
			}
		},

		/**
   * @function iconsReset
   * Reset the icon displays according to the current values in our Object
   */
		iconsReset: function iconsReset() {

			var List = $$(ids.list);

			// for each item in the List
			var id = List.getFirstId();
			while (id) {

				// find it's HTML Node
				var node = List.getItemNode(id);

				if (CurrentObject.workspaceFrozenColumnID == id) {
					_logic.iconFreezeOn(node);
				} else {
					_logic.iconFreezeOff(node);
				}

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

		/**
   * @function objectLoad
   * Ready the Popup according to the current object
   * @param {ABObject} object  the currently selected object.
   */
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

var _ABFieldManager = __webpack_require__(13);

var _ABFieldManager2 = _interopRequireDefault(_ABFieldManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * ab_work_object_workspace_popupNewDataField
 *
 * Manage the Add New Data Field popup.
 *
 */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		fieldType: L('ab.add_fields.fieldType', "*Field type"),
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

		// ready: function () {
		// 	console.error('ready() called!!!')
		// 	_logic.resetState();
		// },

		body: {
			css: 'ab-add-fields-popup',
			borderless: true,
			rows: [{
				view: "richselect",
				id: ids.types,
				label: labels.component.fieldType,
				labelWidth: App.config.labelWidthLarge,
				options: [
				//We will add these later
				{ id: 'temporary', view: 'temporary' }],
				on: {
					onChange: function onChange(id, ev, node) {
						_logic.onChange(id);
					}
				}
			}, {
				height: 10,
				type: "line"
			}, {
				view: 'multiview',
				id: ids.editDefinitions,
				// NOTE: can't leave this an empty []. We redefine this value later.
				cells: [{ id: 'del_me', view: 'label', label: 'edit definition here' }]
			}, { height: 10 }, {
				cols: [{ fillspace: true }, {
					view: "button",
					value: labels.common.cancel,
					css: "ab-cancel-button",
					autowidth: true,
					click: function click() {
						_logic.buttonCancel();
					}
				}, {
					view: "button",
					id: ids.buttonSave,
					label: labels.component.addNewField,
					autowidth: true,
					type: "form",
					click: function click() {
						_logic.buttonSave();
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
	var _componentsByType = {}; // 'type' => ABFieldXXX ui component
	var _currentEditor = null;
	var _currentObject = null;

	var defaultEditorComponent = null; // the default editor.
	var defaultEditorID = null; // the default editor id.
	var submenus = []; // Create the submenus for our Data Fields:

	var _editField = null; // field instance being edited

	// Our init() function for setting up our UI
	var _init = function _init(options) {

		// register our callbacks:
		for (var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		var Fields = _ABFieldManager2.default.allFields();

		//// we need to load a submenu entry and an editor definition for each
		//// of our Fields


		var newEditorList = {
			view: 'multiview',
			id: ids.editDefinitions,
			rows: []
		};

		Fields.forEach(function (F) {

			var menuName = F.defaults().menuName;
			var key = F.defaults().key;

			// add a submenu for the fields multilingual key
			submenus.push({ "id": menuName, "value": menuName });

			// Add the Field's definition editor here:
			var editorComponent = F.propertiesComponent(App);
			if (!defaultEditorComponent) {
				defaultEditorComponent = editorComponent;
				defaultEditorID = menuName;
			}
			newEditorList.rows.push(editorComponent.ui);

			_objectHash[menuName] = F;
			_componentHash[menuName] = editorComponent;
			_componentsByType[key] = editorComponent;
		});

		// the submenu button has a placeholder we need to remove and update
		// with one that has all our submenus in it.
		// var firstID = $$(ids.types).getFirstId();
		// $$(ids.types).updateItem(firstID, {
		// 	value: labels.component.chooseType,
		// 	submenu: submenus
		// })
		$$(ids.types).define("options", submenus);
		$$(ids.types).refresh;

		// now remove the 'del_me' definition editor placeholder.
		webix.ui(newEditorList, $$(ids.editDefinitions));

		// hide all the unused editors:
		for (var c in _componentHash) {
			_componentHash[c].hide();
		}

		defaultEditorComponent.show(); // show the default editor
		_currentEditor = defaultEditorComponent;

		// set the richselect to the first option by default.
		$$(ids.types).setValue(submenus[0].id);

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

			$$(ids.buttonSave).disable();

			var editor = _currentEditor;
			if (editor) {

				// the editor can define some basic form validations.
				if (editor.isValid()) {

					var values = editor.values();

					var field = null;
					var oldData = null;

					// if this is an ADD operation, (_editField will be undefined)
					if (!_editField) {

						// get a new instance of a field:
						field = _currentObject.fieldNew(values);
					} else {

						// use our _editField, backup our oldData
						oldData = _editField.toObj();
						_editField.fromValues(values);

						field = _editField;
					}

					var errors = field.isValid();
					if (errors) {
						OP.Form.isValidationError(errors, $$(editor.ui.id));

						// keep our old data
						if (oldData) {
							field.fromValues(oldData);
						}

						$$(ids.buttonSave).enable();
					} else {

						field.save().then(function () {

							$$(ids.buttonSave).enable();
							_logic.hide();
							_currentEditor.clear();
							_logic.callbacks.onSave(field);
						}).catch(function (err) {
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

		modeAdd: function modeAdd() {

			// show default editor:
			defaultEditorComponent.show(false, false);
			_currentEditor = defaultEditorComponent;

			// show the ability to switch data types
			$$(ids.types).show();

			// change button text to 'add'
			$$(ids.buttonSave).define('label', labels.component.addNewField);
			$$(ids.buttonSave).refresh();
		},

		modeEdit: function modeEdit(field) {

			if (_currentEditor) _currentEditor.hide();

			// switch to this field's editor:
			// hide the rest
			for (var c in _componentsByType) {
				if (c == field.key) {
					_componentsByType[c].populate(field);
					_componentsByType[c].show(false, false);
					_currentEditor = _componentsByType[c];
				} else {
					_componentsByType[c].hide();
				}
			}

			// hide the ability to switch data types
			$$(ids.types).hide();

			// change button text to 'save'
			$$(ids.buttonSave).define('label', labels.common.save);
			$$(ids.buttonSave).refresh();
		},

		/**
   * @function onChange
   * swap the editor view to match the data field selected in the menu.
   *
   * @param {string} name  the menuName() of the submenu that was selected.
   */
		onChange: function onChange(name) {
			// note, the submenu returns the Field.menuName() values.
			// we use that to lookup the Field here:
			var editor = _componentHash[name];
			if (editor) {
				editor.show();
				_currentEditor = editor;
				$$(ids.types).blur();
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
			defaultEditorComponent.show(); // show the default editor
			_currentEditor = defaultEditorComponent;

			// set the richselect to the first option by default.
			$$(ids.types).setValue(submenus[0].id);

			// add mode :  change button text to 'Add'
			// show the default editor
			console.error('TODO: resetState()');
		},

		/**
   * @function show()
   *
   * Show this component.
   * @param {obj} $view  the webix.$view to hover the popup around.
   * @param {ABField} field the ABField to edit.  If not provided, then
   *						  this is an ADD operation.
   */
		show: function show($view, field) {

			_editField = field;

			if (_editField) {

				_logic.modeEdit(field);
			} else {

				_logic.modeAdd();
			}

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


		show: _logic.show, // {fn} 	fn(node, ABField)


		_logic: _logic // {obj} 	Unit Testing
	};
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

var _ABApplication = __webpack_require__(1);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}
/*
 * ab_work_object_workspace_popupSortFields
 *
 * Manage the Sort Fields popup.
 *
 */

var labels = {

	component: {
		addNewSort: L('ab.sort_fields.addNewSort', "*Add new sort"),
		selectField: L('ab.sort_fields.selectField', "*Please select field"),
		textAsc: L('ab.sort_fields.textAsc', "*A -> Z"),
		textDesc: L('ab.sort_fields.textDesc', "*Z -> A"),
		dateAsc: L('ab.sort_fields.dateAsc', "*Before -> After"),
		dateDesc: L('ab.sort_fields.dateDesc', "*After -> Before"),
		numberAsc: L('ab.sort_fields.numberAsc', "*1 -> 9"),
		numberDesc: L('ab.sort_fields.numberDesc', "*9 -> 1"),
		booleanAsc: L('ab.sort_fields.booleanAsc', "*Checked -> Unchecked"),
		booleanDesc: L('ab.sort_fields.booleanDesc', "*Unchecked -> Checked")
	}
};

var idBase = 'ab_work_object_workspace_popupSortFields';
OP.Component.extend(idBase, function (App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components
	var ids = {
		component: App.unique(idBase + '_component'),
		list: App.unique(idBase + "_list"),
		form: App.unique(idBase + "_form")
	};

	// Our webix UI definition:
	var _ui = {
		view: "popup",
		id: ids.component,
		autoheight: true,
		width: 500,
		body: {
			view: "form",
			id: ids.form,
			autoheight: true,
			elements: [{
				view: "button", value: labels.component.addNewSort, click: function click(id, e, node) {
					_logic.clickAddNewSort();
					_logic.callbacks.onChange();

					// this.getTopParentView().addNewSort();
					// this.getTopParentView().callChangeEvent();
				}
			}]
		},
		on: {
			onShow: function onShow() {
				_logic.onShow();
				// var sort_popup = this,
				// sort_form = sort_popup.getChildViews()[0];
				//
				// if (sort_form.getChildViews().length < 2) {
				// 	sort_form.getTopParentView().addNewSort();
				// 	sort_popup.callChangeEvent();
				// }
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

			/**
    * @function onChange
    * called when we have made changes to the hidden field settings
    * of our Current Object.
    *
    * this is meant to alert our parent component to respond to the
    * change.
    */
			onChange: function onChange() {}
		},

		/**
   * @function clickAddNewSort
   * the user clicked the add new sort buttton. I don't know what it does...will update later
   */
		clickAddNewSort: function clickAddNewSort(by, dir, as, id) {
			// Prevent duplicate fields
			var sort_popup = $$(ids.component),
			    sort_form = $$(ids.form),
			    isExists = false;

			if (by) {
				sort_form.getChildViews().forEach(function (v, index) {
					if (index >= sort_form.getChildViews().length - 1) return;

					if (by == v.getChildViews()[0].getValue()) {
						isExists = true;
						return;
					}
				});

				// If field exists, it will not add new sort
				if (isExists) return;
			}

			var viewIndex = sort_form.getChildViews().length - 1;
			var listFields = _logic.getFieldList(true);
			sort_form.addView({
				id: 'sort' + webix.uid(),
				cols: [{
					view: "combo",
					width: 220,
					options: listFields,
					on: {
						"onChange": function onChange(columnId) {
							//var columnConfig = sort_popup.dataTable.getColumnConfig(columnId),
							var allFields = CurrentObject.fields();
							var columnConfig = "",
							    sortInput = this.getParentView().getChildViews()[1],
							    options = null;

							allFields.forEach(function (f) {
								if (f.columnName == columnId) {
									columnConfig = f;
								}
							});

							if (!columnConfig) return;

							switch (columnConfig.key) {
								case "string":
								case "text":
								case "list":
								case "multiselect":
									options = [{ id: 'asc', value: labels.component.textAsc }, { id: 'desc', value: labels.component.textDesc }];
									break;
								case "date":
									options = [{ id: 'asc', value: labels.component.dateAsc }, { id: 'desc', value: labels.component.dateDesc }];
									break;
								case "number":
									options = [{ id: 'asc', value: labels.component.numberAsc }, { id: 'desc', value: labels.component.numberDesc }];
									break;
								case "boolean":
									options = [{ id: 'asc', value: labels.component.booleanAsc }, { id: 'desc', value: labels.component.booleanDesc }];
									break;
							}

							sortInput.define('options', options);
							sortInput.refresh();

							_logic.refreshFieldList();
							//sort_popup.sort();

							var sortFields = CurrentObject.workspaceSortFields;
							sortFields[columnId] = options[0];

							CurrentObject.workspaceSortFields = sortFields;
							CurrentObject.save();

							//this.getTopParentView().callChangeEvent();
							_logic.callbacks.onChange();
						}
					}
				}, {
					view: "segmented", width: 200, options: [{ id: '', value: labels.component.selectField }],
					on: {
						onChange: function onChange(newv, oldv) {// 'asc' or 'desc' values
							//CurrentObject.workspaceSortFields[columnId] = newv;
							//CurrentObject.save();
							//sort_popup.sort();
						}
					}
				}, {
					view: "button", icon: "trash", type: "icon", width: 30, click: function click() {
						sort_form.removeView(this.getParentView());
						_logic.refreshFieldList(true);
						sort_popup.sort();

						// this.getTopParentView().callChangeEvent();
						_logic.callbacks.onChange();
					}
				}]
			}, viewIndex);

			// Select field
			if (id) {
				var fieldsCombo = sort_form.getChildViews()[viewIndex].getChildViews()[0];
				fieldsCombo.setValue(id);
				// this.getTopParentView().callChangeEvent();
				_logic.callbacks.onChange();
			}
		},

		/**
   * @function getFieldList
   * return field list so we can present a custom UI for view
   */
		getFieldList: function getFieldList(excludeSelected) {
			var sort_popup = $$(ids.component),
			    sort_form = $$(ids.form),
			    listFields = [];

			if (!CurrentObject.fields()) return listFields;

			// Get all fields include hidden fields
			var allFields = CurrentObject.fields();
			allFields.forEach(function (f) {
				console.log(f);
				listFields.push({
					id: f.columnName,
					label: f.label
				});
			});

			// Remove selected field
			if (excludeSelected) {
				var childViews = sort_form.getChildViews();
				if (childViews.length > 1) {
					// Ignore 'Add new sort' button
					childViews.forEach(function (cView, index) {
						if (childViews.length - 1 <= index) return false;

						var selectedValue = cView.getChildViews()[0].getValue();
						if (selectedValue) {
							var removeIndex = null;
							var removeItem = $.grep(listFields, function (f, index) {
								if (f.id == selectedValue) {
									removeIndex = index;
									return true;
								} else {
									return false;
								}
							});
							listFields.splice(removeIndex, 1);
						}
					});
				}
			}
			alert(listFields);
			return listFields;
		},

		/**
   * @function refreshFieldList
   * return an updated field list so you cannot duplicate a sort
   */
		refreshFieldList: function refreshFieldList(ignoreRemoveViews) {
			var sort_popup = $$(ids.component),
			    sort_form = $$(ids.form),
			    listFields = _logic.getFieldList(false),
			    selectedFields = [],
			    removeChildViews = [];

			var childViews = sort_form.getChildViews();
			if (childViews.length > 1) {
				// Ignore 'Add new sort' button
				childViews.forEach(function (cView, index) {
					if (childViews.length - 1 <= index) return false;

					var fieldId = cView.getChildViews()[0].getValue(),
					    fieldObj = $.grep(listFields, function (f) {
						return f.id == fieldId;
					});

					if (fieldObj.length > 0) {
						// Add selected field to list
						selectedFields.push(fieldObj[0]);
					} else {
						// Add condition to remove
						removeChildViews.push(cView);
					}
				});
			}

			// Remove filter conditions when column is deleted
			if (!ignoreRemoveViews) {
				removeChildViews.forEach(function (cView, index) {
					sort_form.removeView(cView);
				});
			}

			// Field list should not duplicate field items
			childViews = sort_form.getChildViews();
			if (childViews.length > 1) {
				// Ignore 'Add new sort' button
				childViews.forEach(function (cView, index) {
					if (childViews.length - 1 <= index) return false;

					var fieldId = cView.getChildViews()[0].getValue(),
					    fieldObj = $.grep(listFields, function (f) {
						return f.id == fieldId;
					});

					var selectedFieldsExcludeCurField = $(selectedFields).not(fieldObj);

					var enableFields = $(listFields).not(selectedFieldsExcludeCurField).get();

					// Update field list
					cView.getChildViews()[0].define('options', enableFields);
					cView.getChildViews()[0].refresh();
				});
			}
		},

		/**
   * @function sort
   * this preforms the sort on the datagrid (this may move to the datagrid once I read further)
   */
		sort: function sort() {
			var sort_popup = $$(ids.component),
			    sort_form = $$(ids.form),
			    columnOrders = [];

			sort_form.getChildViews().forEach(function (cView, index) {
				if (sort_form.getChildViews().length - 1 <= index) // Ignore 'Add a sort' button
					return;

				var columnId = cView.getChildViews()[0].getValue();
				var order = cView.getChildViews()[1].getValue();

				if (columnId) {
					var columnConfig = sort_popup.dataTable.getColumnConfig(columnId);

					if (columnConfig) {
						columnOrders.push({
							name: columnConfig.id,
							order: order
						});
					}
				}
			});

			sort_popup.dataTable.sort(function (a, b) {
				var result = false;

				for (var i = 0; i < columnOrders.length; i++) {
					var column = columnOrders[i],
					    aValue = a[column.name],
					    bValue = b[column.name];

					if ($.isArray(aValue)) {
						aValue = $.map(aValue, function (item) {
							return item.text;
						}).join(' ');
					}

					if ($.isArray(bValue)) {
						bValue = $.map(bValue, function (item) {
							return item.text;
						}).join(' ');
					}

					if (aValue != bValue) {
						if (column.order == 'asc') {
							result = aValue > bValue ? 1 : -1;
						} else {
							result = aValue < bValue ? 1 : -1;
						}
						break;
					}
				}

				return result;
			});
		},

		/**
   * @function objectLoad
   * Ready the Popup according to the current object
   * @param {ABObject} object  the currently selected object.
   */
		objectLoad: function objectLoad(object) {
			CurrentObject = object;

			// // refresh list
			// var allFields = CurrentObject.fields();
			// allFields.forEach((f) => {
			// 	alert(f.label);
			// 	listFields.push({
			// 		id: f.id,
			// 		label: f.label,
			// 		$css:"hidden_fields_"+f.id
			// 	})
			// })

			//$$(ids.list).parse(listFields);
		},

		/**
   * @function objectLoad
   * Ready the Popup according to the current object
   * @param {ABObject} object  the currently selected object.
   */
		onShow: function onShow() {
			var sort_popup = $$(ids.component),
			    sort_form = $$(ids.form);

			if (sort_form.getChildViews().length < 2) {
				// sort_form.getTopParentView().addNewSort();
				// sort_popup.callChangeEvent();
				_logic.clickAddNewSort();
				_logic.callbacks.onChange();
			} else {
				var sorts = CurrentObject.workspaceSortFields;
				sorts.forEach(function (s) {
					_logic.clickAddNewSort(s.by, s.dir, s.as);
				});
			}
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

/*
 * custom_editlist
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
};

var ComponentKey = 'ab_custom_editlist';
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
exports.default = { key: ComponentKey };
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

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
exports.default = { key: ComponentKey };
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if (item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
	// get current location
	var location = typeof window !== "undefined" && window.location;

	if (!location) {
		throw new Error("fixUrls requires window.location");
	}

	// blank or null?
	if (!css || typeof css !== "string") {
		return css;
	}

	var baseUrl = location.protocol + "//" + location.host;
	var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
 This regular expression is just a way to recursively match brackets within
 a string.
 	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
    (  = Start a capturing group
      (?:  = Start a non-capturing group
          [^)(]  = Match anything that isn't a parentheses
          |  = OR
          \(  = Match a start parentheses
              (?:  = Start another non-capturing groups
                  [^)(]+  = Match anything that isn't a parentheses
                  |  = OR
                  \(  = Match a start parentheses
                      [^)(]*  = Match anything that isn't a parentheses
                  \)  = Match a end parentheses
              )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
  \)  = Match a close parens
 	 /gi  = Get all matches, not the first.  Be case insensitive.
  */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl.trim().replace(/^"(.*)"$/, function (o, $1) {
			return $1;
		}).replace(/^'(.*)'$/, function (o, $1) {
			return $1;
		});

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
			return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
			//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(43)(undefined);
// imports


// module
exports.push([module.i, ".webix_view, .webix_el_colorpicker input, .webix_el_combo input, .webix_el_datepicker input, .webix_el_search input, .webix_el_text input, .webix_control button, .webix_control input, .webix_control textarea, .webix_el_label, .webix_inp_bottom_label, .webix_inp_label, .webix_inp_top_label {\n\tfont-family: \"Helvetica Neue\",Helvetica,Arial,sans-serif !important;\n}\n.ab-generated-page {\n\toverflow-y: auto;\n}\n.ab-main-container {\n\tposition: relative;\n\tdisplay: block;\n\twidth: 100%;\n\tbackground: -moz-linear-gradient(top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%); /* FF3.6-15 */\n\tbackground: -webkit-linear-gradient(top, rgba(0,0,0,0.2) 0%,rgba(0,0,0,0) 100%); /* Chrome10-25,Safari5.1-6 */\n\tbackground: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%,rgba(0,0,0,0) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n}\n.ab-main-container .pointer {\n\tcursor: pointer;\n}\n.ab-main-container .right {\n\ttext-align: right;\n}\n.ab-main-container .center {\n\ttext-align: center;\n}\n.ab-main-container .left {\n\ttext-align: left;\n}\n.ab-text-bold {\n\tfont-weight: bold !important;\n}\n.ab-scroll-y {\n\toverflow-y: auto !important;\n}\n.ab-ellipses-text, .ab-ellipses-text > div {\n\toverflow: hidden;\n\twhite-space: nowrap;\n\ttext-overflow: ellipsis;\n}\n.float-left {\n\tfloat: left;\n}\n.float-right {\n\tfloat: right;\n}\n\n/* Webix icon */\n.ab-main-container .webix_icon {\n\tline-height: inherit;\n}\n\n/* Fix overflow-x */\n.ab-generated-page .webix_scroll_cont {\n\toverflow: auto !important;\n}\n\n/* == Webix datatable == */\n/* Checkbox column */\n.ab-main-container .webix_hcell.center input[type=checkbox] {\n\twidth:20px;\n\theight:20px;\n\tmargin-top:12px;\n  }\n.ab-main-container .webix_table_checkbox {\n\twidth:20px;\n\theight:20px;\n\tmargin-top:5px;\n}\n/* Last column */\n.ab-main-container .webix_column.webix_last > div,\n.ab-main-container .webix_hs_center td.webix_last,\n.ab-main-container .ab-app-list-descriptionwebix_hs_right td.webix_last {\n\tborder-right-width: 1px !important;\n}\n/* No padding/margin column */\n.ab-column-no-padding div {\n\tpadding: 0px !important;\n\tmargin: 0px !important;\n}\n.ab-main-container .ab-cell-warn {\n\tbackground-color: #F5AE0F !important;\n}\n\n/* Webix selected item */\n.webix_list_item.webix_selected,\n.webix_column>div.webix_cell_select,\n.webix_column>div.webix_column_select,\n.webix_column>div.webix_row_select {\n\tbackground-color: #3498db !important;\n}\n\n/* Webix message */\n.webix_success {\n  background-color: #BFF2BF;\n}\n.webix_success div {\n  background-color: #BFF2BF;\n  border: 1px solid #007A00;\n  color: #000;\n}\n\n/* Webix list */\n.ab-main-container .webix_list_item .webix_selected,\n.ab-main-container .webix_tree_item.webix_selected {\n\tcolor: #fff !important;\n\tbackground-color: #3498db !important;\n}\n.ab-app-form-permission .webix_selected {\n\tcolor: #333 !important;\n\tbackground-color: transparent !important;\n}\n\n/* Webix toolbar */\n.ab-toolbar-submenu, .ab-toolbar-submenu .webix_header>div {\n\tbackground: #EEE !important;\n\tcolor: #666 !important;\n\tfont-size: 15px !important;\n\tfont-weight: bold !important;\n\tborder-bottom: 0px !important;\n}\n\n/* Webix segmented */\n.ab-form-component-item .webix_segment_0.webix_selected,\n.ab-form-component-item .webix_segment_1.webix_selected,\n.ab-form-component-item .webix_segment_N.webix_selected,\n.ab-component-view-edit-field .webix_segment_0.webix_selected,\n.ab-component-view-edit-field .webix_segment_1.webix_selected,\n.ab-component-view-edit-field .webix_segment_N.webix_selected {\n\tcolor: #fff !important;\n\tbackground-color: #3498db !important;\n}\n\n.ab-form-component-item .webix_segment_0,\n.ab-form-component-item .webix_segment_1,\n.ab-form-component-item .webix_segment_N,\n.ab-component-view-edit-field .webix_segment_0,\n.ab-component-view-edit-field .webix_segment_1,\n.ab-component-view-edit-field .webix_segment_N {\n\tcolor: #3498db;\n\tbackground: #fff;\n}\n\n/* Add new columns popup */\n.ab-add-fields-popup {\n\toverflow-y: auto;\n}\n\n/* Application list */\n.ab-app-list {\n/*\n\tmin-height: 300px;\n\tpadding: 40px 100px;\n*/\n}\n.ab-app-select-list .webix_selected {\n\tbackground-color: #FFF !important;\n\tcolor: #333 !important;\n}\n.ab-app-select-list .webix_list_item:hover {\n\tbackground: #ebebeb;\n}\n.ab-app-list-item {\n\tposition: relative;\n\theight: 100%;\n\tmargin: -2px -10px;\n\tpadding: 15px;\n\tline-height: 20px;\n}\ndiv[view_id='ab-app-list'] div.webix_list_item:hover,\ndiv[view_id='ab-object-list'] div.webix_list_item:hover,\ndiv[view_id='ab-object-list-menu'] div.webix_list_item:hover,\ndiv[view_id='ab-new-connectObject-list-item'] div.webix_list_item:hover,\ndiv[view_id='ab-edit-header-items'] div.webix_list_item:hover,\ndiv[view_id='ab-frozen-field-list'] div.webix_list_item:hover {\n\tbackground-color: #eee;\n}\n.ab-app-list-name {\n\tfont-size: large;\n}\n.ab-app-list-description {\n\tcolor: #999;\n\tfont-size: small;\n}\n.ab-app-list-info {\n\twidth: 95%;\n\tdisplay: inline-block;\n}\n.ab-app-list-edit {\n\tposition: absolute;\n\ttop: 0;\n\tright: 10px;\n\topacity: 0.4;\n\tline-height: 70px;\n\theight: 70px;\n}\n.ab-app-list-edit:hover {\n\topacity: 1;\n}\n\n/* Application workspace */\n.ab-app-workspace {\n\t/*min-height: 100px;*/\n}\n.ab-unsync-data-warning {\n\tcursor: pointer;\n    color: #fff;\n    background-color: #F5962F;\n    border: #fff dotted 1px !important;\n    padding-left: 2px;\n}\n.ab-unsync-data-popup .webix_win_head {\n\tbackground-color: #F5962F;\n}\n.ab-unsync-data-popup .webix_win_head .header {\n\tpadding-left: 5px;\n\tfont-weight: bold;\n    color: #fff;\n}\n.ab-unsync-data-status {\n\tpadding: 3px;\n}\n.ab-unsync-data-in-progress {\n\tbackground-color: #F5AE0F;\n}\n.ab-unsync-data-done {\n\tbackground-color: #3AB349;\n}\n.ab-unsync-data-error {\n\tbackground-color: #EC2F2F;\n}\n\n/* Object list */\n.ab-object-list-item {\n\tposition: relative;\n\theight: 100%;\n}\n.ab-object-list-edit {\n\tposition: absolute;\n\ttop: 0px;\n\tright: 5px;\n\tdisplay: none;\n}\n.ab-object-unsync {\n\tbackground-color: #d2e3ef;\n\tcolor: #4a4a4a;\n\tposition: absolute;\n\ttop: 4px;\n\tright: 30px;\n\tfont-size: 12px;\n\tborder-radius: 6px;\n\tpadding: 0px 4px;\n\theight: 20px;\n\tline-height: 20px;\n\tdisplay: none;\n}\n\n/* Interface list */\n.ab-page-list-item {\n\tposition: relative;\n\theight: 100%;\n}\n.ab-page-list-edit {\n\tposition: absolute;\n\ttop: 0px;\n\tright: 5px;\n\tdisplay: none;\n\tcursor: pointer;\n}\n\n/* Object datatable */\n.ab-object-data-header {\n\tposition: relative;\n}\n.ab-object-data-new-header {\n\tbackground-color: #cfd9e0;\n}\n\n.ab-object-data-header-edit {\n\tdisplay: none;\n\tposition: absolute;\n\ttop: 15px;\n\tright: 10px;\n}\n.ab-object-data-header:hover .ab-object-data-header-edit {\n\tdisplay: block;\n}\n.ab-object-unsync-data {\n\tbackground-color: #dae6fb;\n}\n.ab-object-view-column {\n\tcolor: #3498db;\n\tfont-weight: bold;\n\ttext-align: center;\n\tcursor: pointer;\n}\n\n/* Connect object data */\n.ab-connect-data-info {\n\tdisplay: inline-block;\n\twidth: 90px;\n\twhite-space: nowrap;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n\n.ab-connect-data-disable {\n\tbackground-color: #aaa;\n}\n\n/* Custom selectivity */\n.ab-main-container .selectivity-multiple-input-container {\n\tbackground: none !important;\n\tpadding: 0px !important;\n\toverflow: hidden !important;\n\tmax-height: 100% !important;\n}\n.ab-main-container .selectivity-multiple-selected-item {\n\tbackground: #3498db !important;\n\tpadding-right: 5px;\n\t/*max-width: 100px !important;*/\n}\n\n/* Interface tree view */\n.ab-main-container .webix_tree_item.webix_selected span {\n\tpadding: 0px;\n\tbackground: #3498db !important;\n}\n\n/* Interface new page popup */\n.ab-interface-new-quick-page {\n    overflow: scroll !important;\n\toverflow-x: hidden !important;\n\toverflow-y: auto !important;\n}\n\n.ab-interface-new-quick-page .webix_inp_checkbox_border label {\n\tfont-weight: normal; /* Override bootstrap*/\n}\n\n/* Interface page layout */\n.ab-component-drop-area {\n\tmargin-right: 2px;\n\tborder: 1px dashed #000 !important;\n\tbackground-color: #D3E9EF;\n\tbackground-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='30px' width='90px'><text x='20' y='20' fill='#95CBEF' font-size='15'>Drop Here</text></svg>\");\n}\n\ndiv[view_id='ab-interface-layout-page'] .webix_list_item,\n.ab-component-in-page {\n\twidth: 100%;\n\tposition: relative;\n\tbackground-color: #fff;\n\tclear: both;\n}\n\n.ab-component-item-name {\n\tfloat: left;\n\tfont-size: 18px;\n\tborder-right: 1px solid #ebebeb;\n\tvertical-align: top;\n\tpadding-top: 10px;\n\twidth: 90px;\n\tmargin-bottom: -500em; /* CSS hack: equal height of right float */\n\tpadding-bottom: 500em;\n}\n\n.ab-component-item-display {\n\tfloat: right;\n\tvertical-align: top;\n\tpadding: 10px;\n\twidth: 87%;\n\tline-height: 100%;\n\toverflow-x: auto;\n}\n\n.ab-component-remove {\n\tposition: absolute;\n\ttop: 5px;\n\tright: 1px;\n}\n\n.ab-component-link {\n\tcolor: #003B7E;\n\ttext-decoration: underline;\n\tcursor: pointer;\n}\n\n/* Interface component list */\n.ab-component-item-drag {\n\tborder: 1px dotted #000 !important;\n\tfont-size: 35px;\n\tbackground-color: #fff;\n}\n\n/* Header component */\n.ab-component-header {\n\tfont-size: 25px;\n\tfont-weight: bold;\n\tmargin: 0px;\n\tpadding: 0px;\n}\n.ab-component-description {\n\tfont-size: 14px;\n\tpadding: 0px;\n}\n\n/* Menu component */\n.ab-page-list-item .webix_tree_checkbox {\n\tmargin: 0px !important;\n}\n\n/* Object toolbar */\n.ab-data-toolbar {\n\tbackground: #aaa !important;\n}\n.ab-data-toolbar button {\n\ttext-align: center;\n\tfont-size: 14px;\n}\n.ab-data-toolbar button:hover, .ab-data-toolbar button:active {\n\tbackground: #aaa !important;\n}\n.ab-data-toolbar button .webix_icon_btn {\n\topacity: 0.6;\n\tfont-size: 15px;\n}\n.ab-data-toolbar button:hover .webix_icon_btn {\n\topacity: 1;\n}\n\n/* Grid component */\n.ab-page-grid-column-item .column-checkbox {\n\tdisplay: inline-block;\n\tposition: relative;\n\ttop: -5px;\n\twidth: 30px;\n}\n\n.ab-page-grid-column-item .column-empty-checkbox {\n\tposition: relative;\n\twidth: 50px;\n\theight: 38px;\n}\n\n.ab-page-grid-column-item .column-name {\n\tdisplay: inline-block;\n\tposition: relative;\n\ttop: -18px;\n}\n\n/* Form component */\n.ab-standard-button button, .ab-standard-button button:hover, .ab-standard-button button:active, .ab-standard-button .webix_icon_btn {\n\tbackground: transparent !important;\n\tborder-color: transparent !important;\n\tcolor: #666 !important;\n\tbox-shadow: none !important;\n}\n.ab-cancel-button button {\n\tbackground: transparent !important;\n\tcolor: #AAA;\n\tborder-color: transparent;\n}\n.ab-cancel-button button:hover {\n\ttext-decoration: underline;\n}\n.ab-cancel-button button:active {\n\tbox-shadow: none;\n}\n.ab-form-connect-data {\n\tfloat: left;\n\tborder: #CCC solid 1px;\n\tpadding: 0px 5px;\n\tmin-width: 70%;\n\tborder-radius: 6px;\n}\n\n.ab-main-container .webix_layout_form {\n\tbackground-color: #fff !important;\n}\n\n/* Loading Screen */\n.ab-loading-screen {\n\tbackground: #000;\n\topacity: 0.7;\n\tposition: absolute !important;\n}\n.ab-loading-body {\n\tbackground: #000;\n\tborder-width: 0px !important;\n}\n.ab-loading-message {\n\tcolor: #fff !important;\n\tbackground: #000 !important;\n\tfont-size: 30px !important;\n\ttext-align: center;\n\tvertical-align: middle;\n\tborder-width: 0px !important;\n\tpadding-top: 20% !important;\n\theight: 100px !important;\n}\n.ab-loading-button {\n\ttext-align: center;\n}\n.ab-loading-button button {\n\tbackground-color: #003B7E;\n\twidth: 200px;\n}\n.ab-loading-cancel-button {\n\ttext-align: center;\n\tbackground: transparent;\n}\n.ab-loading-cancel-button a {\n\tcolor: #fff !important;\n}\n.ab-loading-screen .webix_progress_bottom {\n\theight: 40px !important;\n\topacity: 1;\n}\n.ab-loading-screen .webix_progress_bottom .webix_progress_state {\n\theight: 40px !important;\n}\n\n/* Dynamic DataTable */\n.dynamic-datatable-view .webix_badge {\n\tmargin: 0 !important;\n}\n\n/* Number data field */\n.ab-number-format-show {\n\twhite-space: nowrap;\n}\n\n/* Icon Picker */\n.ab-main-container .iconpicker .iconpicker-items {\n\tcolor: #000;\n}\n\n/* Webix Tabs */\ndiv.webix_item_tab {\n\tfont-size: 16px;\n}\n\n::-webkit-input-placeholder { /* Chrome/Opera/Safari */\n  color: #CCC;\n}\n::-moz-placeholder { /* Firefox 19+ */\n  color: #CCC;\n}\n:-ms-input-placeholder { /* IE 10+ */\n  color: #CCC;\n}\n:-moz-placeholder { /* Firefox 18- */\n  color: #CCC;\n}\n\n/* Webix popup */\n.webix_popup_text {\n\tpadding-right: 20px;\n\tpadding-left: 20px;\n}\n\n/* Webix badge */\n.webix_badge {\n\tline-height: 22px;\n\ttext-indent: -1px;\n}\n", ""]);

// exports


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(44);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(45);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(46)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./AppBuilder.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./AppBuilder.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ })
/******/ ]);
//# sourceMappingURL=BuildApp.js.map