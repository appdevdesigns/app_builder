import AB from '../../components/ab'
import ABApplication from "../../classes/ABApplication"
import ABListNewObject from "../../components/ab_work_object_list_newObject"

describe('ab_work_object_list_newObject component', () => {

	var sandbox;

	var ab;
	var mockApp;

	const componentName = 'ab_work_object_list_newObject';
	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new ABListNewObject(mockApp);
	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});


	it('should look like a component', () => {
		OP.Test.isComponent(target);
	});


	// UI test cases
	describe('UI testing', () => {

		it("should be webix's window", () => {
			assert.equal(target.ui.view, "window");
		});

	});


	// Init test cases
	describe('Init testing', () => {

		it("should create webix ui", () => {
			// Call init
			let callbacks = { onDone: function () { } };
			target.init(callbacks);
		});


	});


	// Actions test cases
	describe('Actions testing', () => {
	});


	// Logic test cases
	describe('Logic testing', () => {
		it('.applicationLoad: should exist', () => {
			assert.isDefined(target.applicationLoad);
			assert.equal(target.applicationLoad, target._logic.applicationLoad);
		});

		it('.show: should exist', () => {
			assert.isDefined(target.show);
			assert.equal(target.show, target._logic.show);
		});

		it('.hide: should exist', () => {
			assert.isDefined(target._logic.hide);
		});

		it('.save: should show a alert box when currentApplication is null', () => {
			// Use stub instead of spy to avoid show alert popup
			let stubAlert = sinon.stub(OP.Dialog, 'Alert').callsFake(function () { });

			let newObjectValues = {};
			let callback = function (err) {
				// Assert it should return error in callback
				assert.isDefined(err);
			};

			// Call save object
			let result = target._logic.save(newObjectValues, callback);

			assert.isFalse(result);
			sinon.assert.calledOnce(stubAlert);
		});

		it('.save: should create a new object to current application', () => {
			var sampleApp = new ABApplication({
				id: 999,
				name: "Test Application",
				json: {}
			});

			// Load a example application to component
			target.applicationLoad(sampleApp);

			let spyObjectNew = sinon.spy(sampleApp, "objectNew");
			let sampleObject = {};
			let callback = function (err) {
				// Assert it should not return any error in callback
				assert.isNull(err);
			};
			let result = target._logic.save(sampleObject, callback)

			sinon.assert.calledOnce(spyObjectNew);
		});
	});


});