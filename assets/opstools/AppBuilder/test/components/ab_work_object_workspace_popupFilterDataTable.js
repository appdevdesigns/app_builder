import AB from '../../components/ab'
import AB_Work_Object_Workspace_PopupFilterDataTable from "../../components/ab_work_object_workspace_popupFilterDataTable"

describe('ab_work_object_workspace_popupFilterDataTable component', () => {

	var sandbox;

	var ab;
	var mockApp;

	const componentName = 'ab_work_object_workspace_popupFilterDataTable';
	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new AB_Work_Object_Workspace_PopupFilterDataTable(mockApp);
	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
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

		it("should be webix's window", () => {
			assert.equal(target.ui.view, "popup");
		});

		it("should be .onShow event", () => {
			assert.isDefined(target.ui.on.onShow);
		});

	});


	// Init test cases
	describe('Init testing', () => {
		it("should exist init property", () => {
			assert.isDefined(target.init, "should have a init property");
		});

		it("should create webix ui", () => {
			// Call init
			let callbacks = { onChange: function () { } };
			target.init(callbacks);

			assert.equal(callbacks.onChange, target._logic.callbacks.onChange);
		});


	});


	// Actions test cases
	describe('Actions testing', () => {
	});


	// Logic test cases
	describe('Logic testing', () => {
		it('.callbacks.onChange: should exist', () => {
			assert.isDefined(target._logic.callbacks.onChange);
		});

		it('.objectLoad: should exist', () => {
			assert.isDefined(target._logic.objectLoad);
			assert.equal(target.objectLoad, target._logic.objectLoad);
		});

		it('.onShow: should exist', () => {
			assert.isDefined(target._logic.onShow);
		});
		
		it('.show: should exist', () => {
			assert.isDefined(target._logic.show);
			assert.equal(target.show, target._logic.show);
		});

	});


});
