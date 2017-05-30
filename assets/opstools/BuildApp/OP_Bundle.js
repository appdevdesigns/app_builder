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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
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

var _comm = __webpack_require__(5);

var _comm2 = _interopRequireDefault(_comm);

var _component = __webpack_require__(2);

var _component2 = _interopRequireDefault(_component);

var _config = __webpack_require__(6);

var _config2 = _interopRequireDefault(_config);

var _customComponent = __webpack_require__(7);

var _customComponent2 = _interopRequireDefault(_customComponent);

var _model = __webpack_require__(8);

var _model2 = _interopRequireDefault(_model);

var _multilingual = __webpack_require__(9);

var _multilingual2 = _interopRequireDefault(_multilingual);

var _util = __webpack_require__(10);

var _util2 = _interopRequireDefault(_util);

var _validation = __webpack_require__(11);

var _validation2 = _interopRequireDefault(_validation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class OP
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

window.OP = OP;

// OP.xxxx      These properties hold the defined Class/Controller/Model definitions
//              for our loaded projects.

OP.Comm = _comm2.default; // communication routines (AJAX calls)

OP.Component = _component2.default; // our defined components

OP.Config = _config2.default; // configuration Settings for our current environment.

OP.CustomComponent = _customComponent2.default; // Webix Custom Components

OP.Dialog = AD.op.Dialog;

OP.Error = AD.error;

OP.Model = _model2.default;

OP.Multilingual = _multilingual2.default;

OP.Util = _util2.default;

OP.Validation = _validation2.default;

exports.default = OP;
// }


// import "./model.js"
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UIComponent = function () {

	/**
  * @param {object} App 
  *      ?what is this?
  * @param {string} idBase
  *      Identifier for this component
  */
	function UIComponent(App, idBase) {
		_classCallCheck(this, UIComponent);

		if (!App) {
			App = {

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
				config: OP.Config.config(),

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
		}

		this.App = App;

		this.idBase = idBase || '?idbase?';
	}

	_createClass(UIComponent, [{
		key: 'actions',
		value: function actions(_actions) {
			if (_actions) {
				for (var a in _actions) {
					this.App.actions[a] = _actions[a];
				}
			}
		}
	}, {
		key: 'Label',
		value: function Label(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}
	}, {
		key: 'unique',
		value: function unique(key) {
			return this.App.unique(this.idBase + '_' + key);
		}
	}]);

	return UIComponent;
}();

exports.default = UIComponent;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _comm_service = __webpack_require__(12);

var _comm_service2 = _interopRequireDefault(_comm_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	// OP.Comm.Service.*
	Service: _comm_service2.default
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _configDesktop = __webpack_require__(13);

var _configDesktop2 = _interopRequireDefault(_configDesktop);

var _configMobile = __webpack_require__(14);

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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _component = __webpack_require__(2);

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UICustomComponent = function (_Component) {
	_inherits(UICustomComponent, _Component);

	function UICustomComponent(App, componentKey) {
		_classCallCheck(this, UICustomComponent);

		// Save our definition into App.custom.[key]
		var _this = _possibleConstructorReturn(this, (UICustomComponent.__proto__ || Object.getPrototypeOf(UICustomComponent)).call(this, App, componentKey));

		App.custom = App.custom || {};
		App.custom[componentKey] = _this;
		return _this;
	}

	return UICustomComponent;
}(_component2.default);

exports.default = UICustomComponent;

/***/ }),
/* 8 */
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
/* 9 */
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

						// verify obj[f] is defined 
						// --> DONT erase the existing translation
						if (typeof obj[f] != 'undefined') {
							t[f] = obj[f];
						}
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	uuid: AD.util.uuid

};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(OP) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OPValidator = function () {
	function OPValidator() {
		_classCallCheck(this, OPValidator);

		this.errors = [];
	}

	_createClass(OPValidator, [{
		key: 'addError',
		value: function addError(name, message) {
			this.errors.push({ name: name, message: message });
		}
	}, {
		key: 'pass',
		value: function pass() {
			return this.errors.length == 0;
		}
	}, {
		key: 'fail',
		value: function fail() {
			return this.errors.length > 0;
		}
	}, {
		key: 'toValidationObject',
		value: function toValidationObject() {
			var obj = {
				error: 'E_VALIDATION',
				invalidAttributes: {}
			};

			var attr = obj.invalidAttributes;

			this.errors.forEach(function (e) {

				attr[e.name] = attr[e.name] || [];
				attr[e.name].push(e);
			});

			return obj;
		}
	}, {
		key: 'updateForm',
		value: function updateForm(form) {
			var vObj = this.toValidationObject();
			OP.Validation.isFormValidationError(vObj, form);
		}
	}, {
		key: 'updateGrid',
		value: function updateGrid(rowID, grid) {
			var vObj = this.toValidationObject();
			OP.Validation.isGridValidationError(vObj, rowID, grid);
		}
	}]);

	return OPValidator;
}();

//// LEFT OFF HERE:
// add an OP.Validation  and remove OP.Form  OP.Grid
// update existing Applicaiton, Object, Field forms to use this.


exports.default = {

	/**
  * @function OP.Validation.validator
  * return a new instance of OPValidator.
  * @return {OPValidator}
  */
	validator: function validator() {
		return new OPValidator();
	},

	// var validator = OP.Validation.validator()
	// validator.addError('name', 'message')
	// validator.pass() 
	// validator.updateForm(Form);
	// validator.updateGrid(editor, Grid);

	/**
  * @function OP.Validation.isFormValidationError
  *
  * scans the given error to see if it is a sails' response about an invalid
  * value from one of the form elements.
  *
  * @codestart
  * var form = $$('formID');
  * var values = form.getValues();
  * model.attr(values);
  * model.save()
  * .fail(function(err){
  *     if (!OP.Form.isFormValidationError(err, form)) {
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
	isFormValidationError: function isFormValidationError(error, form) {

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
	},

	/**
  * @function OP.Validation.isGridValidationError
  *
  * scans the given error to see if it is a sails' response about an invalid
  * value from one of our grid columns.
  *
  * @codestart
  * var grid = $$('myGrid');
  * model.attr(values);
  * model.save()
  * .fail(function(err){
  *     if (!OP.Validation.isGridValidationError(err, editor, grid)) {
  *         OP.error.log('Error saving current model ()', {error:err, values:values});
  *     }
  * })
  * .then(function(newData){
  * 
  * });
  * @codeend
  *
  * @param {obj} error  the error response object
  * @param {integer} row the row id of the Grid to update.
  * @param {obj} Grid   the webix grid instance (or reference)
  * @return {bool}      true if error was about a grid column.  false otherwise.
  */
	isGridValidationError: function isGridValidationError(error, row, Grid) {

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

			// if this is from our server response:
			if (error.data && error.data.error && error.data.error == 'E_VALIDATION') {
				error = error.data;
			}

			//// Now process the error object
			//// 
			if (error.error && error.error == 'E_VALIDATION' || error.code && error.code == 'E_VALIDATION') {

				var attrs = error.invalidAttributes;
				if (attrs) {

					var wasGrid = false;
					for (var attr in attrs) {

						// if this is a field in the form:
						// if (form.elements[attr]) {

						// 	var errors = attrs[attr];
						// 	var msg = [];
						// 	errors.forEach(function(err) {
						// 		msg.push(err.message);
						// 	})

						// 	// set the invalid error message
						// 	form.markInvalid(attr, msg.join(', '));

						// 	// set focus to the 1st form element we mark:
						// 	if (!hasFocused) {
						// 		form.elements[attr].focus();
						// 		hasFocused = true;
						// 	}

						// 	wasForm = true;
						// }


						Grid.addCellCss(row, attr, "webix_invalid");
						Grid.addCellCss(row, attr, "webix_invalid_cell");

						var msg = [];
						attrs[attr].forEach(function (e) {
							msg.push(e.message);
						});

						OP.Dialog.Alert({
							text: attr + ': ' + msg.join(', ')
						});

						wasGrid = true;
					}

					Grid.refresh(row);

					if (wasGrid) {
						return true;
					}
				}
			}
		}

		// if we missed updating our Grid with an error
		// this was not a validation error so return false
		return false;
	}

};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 12 */
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
/* 13 */
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
	xxxLargeSpacer: 400,
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
/* 14 */
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
	xxxLargeSpacer: 120,
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

/***/ })
/******/ ]);
//# sourceMappingURL=OP_Bundle.js.map