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
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

/***/ }),
/* 1 */
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

var _ABField = __webpack_require__(0);

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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ABApplication = __webpack_require__(4);

var _ABApplication2 = _interopRequireDefault(_ABApplication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ab_work_object_list_newObject component', function () {

	var sandbox;

	var componentName = 'ab_work_object_list_newObject';
	var mockApp;
	var target;

	before(function () {
		mockApp = OP.Component._newApp();

		OP.Component['ab'](mockApp);

		target = OP.Component[componentName](mockApp);
	});

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should exist component', function () {
		assert.isDefined(target);
	});

	// UI test cases
	describe('UI testing', function () {

		it('should have ui setting', function () {
			assert.isDefined(target.ui, "should have a ui property");
		});

		it("should be webix's window", function () {
			assert.equal(target.ui.view, "window");
		});
	});

	// Init test cases
	describe('Init testing', function () {
		it("should exist init property", function () {
			assert.isDefined(target.init, "should have a init property");
		});

		it("should create webix ui", function () {
			var spyWebixUi = sandbox.spy(webix, 'ui');

			// Call init
			var callbacks = { onDone: function onDone() {} };
			target.init(callbacks);

			// Assert call webix.ui once and pass .ui of this component to webix.ui()
			sinon.assert.calledOnce(spyWebixUi);
			sinon.assert.calledWith(spyWebixUi, target.ui);
		});
	});

	// Actions test cases
	describe('Actions testing', function () {});

	// Logic test cases
	describe('Logic testing', function () {
		it('.applicationLoad: should exist', function () {
			assert.isDefined(target.applicationLoad);
			assert.equal(target.applicationLoad, target._logic.applicationLoad);
		});

		it('.show: should exist', function () {
			assert.isDefined(target.show);
			assert.equal(target.show, target._logic.show);
		});

		it('.hide: should exist', function () {
			assert.isDefined(target._logic.hide);
		});

		it('.save: should show a alert box when currentApplication is null', function () {
			// Use stub instead of spy to avoid show alert popup
			var stubAlert = sinon.stub(OP.Dialog, 'Alert', function () {});

			var newObjectValues = {};
			var callback = function callback(err) {
				// Assert it should return error in callback
				assert.isDefined(err);
			};

			// Call save object
			var result = target._logic.save(newObjectValues, callback);

			assert.isFalse(result);
			sinon.assert.calledOnce(stubAlert);
		});

		it('.save: should create a new object to current application', function () {
			var sampleApp = new _ABApplication2.default({
				id: 999,
				name: "Test Application",
				json: {}
			});

			// Load a example application to component
			target.applicationLoad(sampleApp);

			var spyObjectNew = sinon.spy(sampleApp, "objectNew");
			var sampleObject = {};
			var callback = function callback(err) {
				// Assert it should not return any error in callback
				assert.isNotDefined(err);
			};
			var result = target._logic.save(sampleObject, callback);

			sinon.assert.calledOnce(spyObjectNew);
		});
	});
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('ab_work_object_list_popupEditMenu component', function () {

	var sandbox;

	var mockApp = OP.Component._newApp();
	var componentName = 'ab_work_object_list_popupEditMenu';
	var target;

	before(function () {

		OP.Component['ab'](mockApp);

		target = OP.Component[componentName](mockApp);

		// TODO: render UI function
		// buildHTML();

		// TODO: mock up parent dependencies
	});

	/*
 ** sinon.js is a test tool that allow us create spies, stubs and mocks to replace a function 
 ** after run a test case, then they should be restored function back.
 **
 ** sinon.sandbox it helps to create spies, stubs and mocks in a test case scope
 */
	beforeEach(function () {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should exist component', function () {
		assert.isDefined(target);
	});

	// UI test cases
	describe('UI testing', function () {

		it('should have ui setting', function () {
			assert.isDefined(target.ui, "should have a ui property");
		});

		it("should be webix's popup", function () {
			assert.equal(target.ui.view, "popup");
		});

		it('should have 2 menu items', function () {
			var menuItems = target.ui.body.data;

			var labelRename = mockApp.labels.rename;
			var labelDelete = mockApp.labels['delete'];

			assert.equal(menuItems.length, 2);
			assert.equal(menuItems[0].command, labelRename, 'first menu item should be rename');
			assert.equal(menuItems[1].command, labelDelete, 'second menu item should be delete');
		});

		it('should have item click event', function () {
			var itemClickFn = target.ui.body.on.onItemClick;

			assert.isDefined(itemClickFn, 'should have item click event');
		});

		it('should call _logic.onItemClick when a menu item is clicked', function () {
			var itemClickFn = target.ui.body.on.onItemClick,
			    spyLogicItemClick = sandbox.spy(target._logic, 'onItemClick'),
			    itemClickParam = { textContent: 'rename' };

			// Assume a menu item is clicked
			itemClickFn(null, null, itemClickParam);

			// Assert _logic.onItemClick should be called in onItemClick of menu
			sinon.assert.calledOnce(spyLogicItemClick);

			// Assert pass a correct parameter to _logic.onItemClick
			sinon.assert.calledWith(spyLogicItemClick, itemClickParam);
		});
	});

	describe('Init testing', function () {
		it('should have init function', function () {
			assert.isDefined(target.init, "should have a init property");
		});

		it('should create webix ui', function () {
			var spyWebixUi = sandbox.spy(webix, 'ui'),
			    spyLogicHide = sandbox.spy(target._logic, 'hide');

			// Call init
			target.init();

			// Assert call webix.ui once and pass .ui of this component to webix.ui()
			sinon.assert.calledOnce(spyWebixUi);
			sinon.assert.calledWith(spyWebixUi, target.ui);

			// Assert call _logic.hide once
			sinon.assert.calledOnce(spyLogicHide);
		});

		it('should set callbacks to _logic', function () {
			var options = {
				onClick: function onClick(action) {
					console.log("This is a test callback");
				}
			};

			// Call init
			target.init(options);

			// Assert onClick callback should be in _logic
			assert.equal(target._logic.callbacks.onClick, options.onClick);
		});
	});

	describe('Actions testing', function () {});

	describe('Logic testing', function () {
		it('should pass "rename" to callback when the rename item is clicked', function () {
			var spyCallbacks = sandbox.spy(target._logic.callbacks, 'onClick');
			var spyHide = sandbox.spy(target._logic, 'hide');

			// Assume menu item is clicked
			var result = target._logic.onItemClick({ textContent: mockApp.labels.rename });

			// Should call onClick callback and pass "rename" to a parameter 
			sinon.assert.calledOnce(spyCallbacks);
			sinon.assert.calledWith(spyCallbacks, 'rename');

			// Should hide this popup
			sinon.assert.calledOnce(spyHide);

			// Should return false to cancel a event of webix
			assert.equal(result, false);
		});

		it('should pass "delete" to callback when the delete item is clicked', function () {
			var spyCallbacks = sandbox.spy(target._logic.callbacks, 'onClick');
			var spyHide = sandbox.spy(target._logic, 'hide');

			// Assume menu item is clicked
			var result = target._logic.onItemClick({ textContent: mockApp.labels['delete'] });

			// Should call onClick callback and pass "delete" to a parameter 
			sinon.assert.calledOnce(spyCallbacks);
			sinon.assert.calledWith(spyCallbacks, 'delete');

			// Should hide this popup
			sinon.assert.calledOnce(spyHide);

			// Should return false to cancel a event of webix
			assert.equal(result, false);
		});

		it('should exist .show', function () {
			assert.isDefined(target._logic.show);
		});

		it('should exist .hide', function () {
			assert.isDefined(target._logic.hide);
		});
	});
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import OP from "OP"


__webpack_require__(11);

var _ABObject = __webpack_require__(6);

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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ABFieldString = __webpack_require__(10);

var _ABFieldString2 = _interopRequireDefault(_ABFieldString);

var _ABFieldNumber = __webpack_require__(9);

var _ABFieldNumber2 = _interopRequireDefault(_ABFieldNumber);

var _ABFieldDate = __webpack_require__(7);

var _ABFieldDate2 = _interopRequireDefault(_ABFieldDate);

var _ABFieldImage = __webpack_require__(8);

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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import OP from "OP"


var _ABFieldManager = __webpack_require__(5);

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
			if (typeof attributes.objectWorkspace.hiddenFields == "undefined") attributes.objectWorkspace.hiddenFields = [];
			if (typeof attributes.objectWorkspace.frozenColumnID == "undefined") attributes.objectWorkspace.frozenColumnID = "";
		}

		this.objectWorkspace = attributes.objectWorkspace || {
			hiddenFields: [], // array of [ids] to add hidden:true to
			frozenColumnID: "" };

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
		key: "workspaceHiddenFields",
		get: function get() {
			return this.objectWorkspace.hiddenFields;
		},
		set: function set(fields) {
			this.objectWorkspace.hiddenFields = fields;
		}
	}, {
		key: "workspaceFrozenColumnID",
		get: function get() {
			return this.objectWorkspace.frozenColumnID;
		},
		set: function set(id) {
			this.objectWorkspace.frozenColumnID = id;
		}
	}]);

	return ABObject;
}();

exports.default = ABObject;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(0);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(1);

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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(0);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(1);

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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(0);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(1);

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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ABField2 = __webpack_require__(0);

var _ABField3 = _interopRequireDefault(_ABField2);

var _ABFieldComponent = __webpack_require__(1);

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
/* 11 */
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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(3);

__webpack_require__(2);

/***/ })
/******/ ]);
//# sourceMappingURL=test_app_builder.js.map