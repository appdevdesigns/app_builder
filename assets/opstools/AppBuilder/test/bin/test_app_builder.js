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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
		assert.isNotNull(target);
	});

	// UI test cases
	describe('UI testing', function () {

		it('should have ui setting', function () {
			assert.isNotNull(target.ui, "should have a ui property");
		});

		it("should be webix's window", function () {
			assert.equal(target.ui.view, "window");
		});
	});

	// Init test cases
	describe('Init testing', function () {
		it("should exist init property", function () {
			assert.isNotNull(target.init, "should have a init property");
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
		it('should exist .applicationLoad', function () {
			assert.isNotNull(target.applicationLoad);
		});

		it('should exist .hide', function () {
			assert.isNotNull(target.hide);
		});

		it('should exist .show', function () {
			assert.isNotNull(target.show);
		});

		// TODO : Mock up ABApplication to test .save()
		it.skip('should create new object to application', function () {
			var newObjectValues = {};

			target.save(newObjectValues);
		});
	});
});

/***/ }),
/* 1 */
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
		assert.isNotNull(target);
	});

	// UI test cases
	describe('UI testing', function () {

		it('should have ui setting', function () {
			assert.isNotNull(target.ui, "should have a ui property");
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

			assert.isNotNull(itemClickFn, 'should have item click event');
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
			assert.isNotNull(target.init, "should have a init property");
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
			assert.isNotNull(target._logic.show);
		});

		it('should exist .hide', function () {
			assert.isNotNull(target._logic.hide);
		});
	});
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(1);

__webpack_require__(0);

/***/ })
/******/ ]);
//# sourceMappingURL=test_app_builder.js.map