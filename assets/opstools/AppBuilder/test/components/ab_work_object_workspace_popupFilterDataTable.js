import AB from '../../components/ab'
import ABObject from "../../classes/ABObject"
import AB_Work_Object_Workspace_PopupFilterDataTable from "../../components/ab_work_object_workspace_popupFilterDataTable"

import sampleApp from "../fixtures/ABApplication"

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

	});


	// Init test cases
	describe('Init testing', () => {
		it("should exist init property", () => {
			assert.isDefined(target.init, "should have a init property");
		});

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
		it('.addNewFilter: should exist', () => {
			assert.isDefined(target._logic.addNewFilter);
		});

		it('.callChangeEvent: should exist', () => {
			assert.isDefined(target._logic.callChangeEvent);
		});
		
		it('.columns_setter: should exist', () => {
			assert.isDefined(target._logic.columns_setter);
		});

		it('.dataTable_setter: should exist', () => {
			assert.isDefined(target._logic.dataTable_setter);
		});

		it('.filter: should exist', () => {
			assert.isDefined(target._logic.filter);
		});

		it('.getFieldList: should exist', () => {
			assert.isDefined(target._logic.getFieldList);
		});

		it('.refreshFieldList: should exist', () => {
			assert.isDefined(target._logic.refreshFieldList);
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
