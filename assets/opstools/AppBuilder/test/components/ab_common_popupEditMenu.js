
import AB from '../../components/ab'
import ABCommonPopup from '../../components/ab_common_popupEditMenu';

describe('ab_common_popupEditMenu component', () => {

	var sandbox;

	var ab = new AB();
	var ui = ab.ui;
	ui.container = 'mocha_test_div';
	webix.ui(ui)

	var mockApp = ab._app;

	var componentName = 'ab_common_popupEditMenu';
	var target;

	before(() => {

		// OP.Component['ab'](mockApp);

		target = new ABCommonPopup(mockApp);

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




	it('should exist component', () => {
		assert.isDefined(target);
	});

	// UI test cases
	describe('UI testing', () => {

		it('should have ui setting', () => {
			assert.isDefined(target.ui, "should have a ui property");
		});

		it("should be webix's popup", () => {
			assert.equal(target.ui.view, "popup");
		});

		it('should have item click event', () => {
			let itemClickFn = target.ui.body.on.onItemClick;

			assert.isDefined(itemClickFn, 'should have item click event');
		});

		it('should call _logic.onItemClick when a menu item is clicked', () => {
			let itemClickFn = target.ui.body.on.onItemClick,
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


	describe('Init testing', () => {
		it('should have init function', () => {
			assert.isDefined(target.init, "should have a init property");
		});

		it('should create webix ui', () => {
			let spyWebixUi = sandbox.spy(webix, 'ui'),
				spyLogicHide = sandbox.spy(target._logic, 'hide');

			// Call init
			target.init();

			// Assert call webix.ui once and pass .ui of this component to webix.ui()
			sinon.assert.calledOnce(spyWebixUi);
			sinon.assert.calledWith(spyWebixUi, target.ui);

			// Assert call _logic.hide once
			sinon.assert.calledOnce(spyLogicHide);

		});

		it('should set callbacks to _logic', () => {
			let options = {
				onClick: function (action) {
				}
			};

			// Call init
			target.init(options);

			// Assert onClick callback should be in _logic
			assert.equal(target._logic.callbacks.onClick, options.onClick);
		});

	});

	describe('Actions testing', () => {
	});

	describe('Logic testing', () => {
		it('should pass "rename" to callback when the rename item is clicked', () => {
			let spyCallbacks = sandbox.spy(target._logic.callbacks, 'onClick');
			let spyHide = sandbox.spy(target._logic, 'hide');

			// Assume menu item is clicked
			let result = target._logic.onItemClick({ textContent: mockApp.labels.rename });

			// Should call onClick callback and pass "rename" to a parameter 
			sinon.assert.calledOnce(spyCallbacks);
			sinon.assert.calledWith(spyCallbacks, 'rename');

			// Should hide this popup
			sinon.assert.calledOnce(spyHide);

			// Should return false to cancel a event of webix
			assert.equal(result, false);

		});

		it('should pass "delete" to callback when the delete item is clicked', () => {
			let spyCallbacks = sandbox.spy(target._logic.callbacks, 'onClick');
			let spyHide = sandbox.spy(target._logic, 'hide');

			// Assume menu item is clicked
			let result = target._logic.onItemClick({ textContent: mockApp.labels['delete'] });

			// Should call onClick callback and pass "delete" to a parameter 
			sinon.assert.calledOnce(spyCallbacks);
			sinon.assert.calledWith(spyCallbacks, 'delete');

			// Should hide this popup
			sinon.assert.calledOnce(spyHide);

			// Should return false to cancel a event of webix
			assert.equal(result, false);

		});

		it('should exist .show', () => {
			assert.isDefined(target._logic.show);
		});

		it('should exist .hide', () => {
			assert.isDefined(target._logic.hide);
		});

	});



});