describe('ab_work_object_list_newObject component', () => {

	var sandbox;

	var componentName = 'ab_work_object_list_newObject';
	var mockApp;
	var target;

	before(() => {
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

	it('should exist component', () => {
		assert.isNotNull(target);
	});

	// UI test cases
	describe('UI testing', () => {

		it('should have ui setting', () => {
			assert.isNotNull(target.ui, "should have a ui property");
		});

		it("should be webix's window", () => {
			assert.equal(target.ui.view, "window");
		});

	});


	// Init test cases
	describe('Init testing', () => {
		it("should exist init property", () => {
			assert.isNotNull(target.init, "should have a init property");
		});

		it("should create webix ui", () => {
			let spyWebixUi = sandbox.spy(webix, 'ui');

			// Call init
			let callbacks = { onDone: function () { } };
			target.init(callbacks);

			// Assert call webix.ui once and pass .ui of this component to webix.ui()
			sinon.assert.calledOnce(spyWebixUi);
			sinon.assert.calledWith(spyWebixUi, target.ui);
		});


	});


	// Actions test cases
	describe('Actions testing', () => {
	});


	// Logic test cases
	describe('Logic testing', () => {
		it('should exist .applicationLoad', () => {
			assert.isNotNull(target.applicationLoad);
		});

		it('should exist .hide', () => {
			assert.isNotNull(target.hide);
		});

		it('should exist .show', () => {
			assert.isNotNull(target.show);
		});

		// TODO : Mock up ABApplication to test .save()
		it.skip('should create new object to application', () => {
			let newObjectValues = {};

			target.save(newObjectValues);
		});
	});


});