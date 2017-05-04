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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
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

/***/ })
/******/ ]);