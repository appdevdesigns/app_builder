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
		it('.callChangeEvent: should exist', () => {
			assert.isDefined(target._logic.callChangeEvent);
		});

		it('.clickAddNewFilter: should exist', () => {
			assert.isDefined(target._logic.clickAddNewFilter);
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
		
		it('.addNewFilter: should add a new element to UI', () => {
			// Load first object from a sample ABApplication			
			let mockObj = new ABObject(sampleApp.objects[0]);						
			target.objectLoad(mockObj);
			
			// Set up simulated button click and spy for clickAddNewSort function
			let addNewFilterButtonClickFn = target.ui.body.elements[target.ui.body.elements.length - 1].on.onItemClick,
				onShowFn = target.ui.on.onShow,
				spyLogicOnChange = sandbox.spy(target._logic.callbacks, 'onChange'),
				spyLogicClickAddNewFilter = sandbox.spy(target._logic, 'clickAddNewFilter');
			
			// Tell the app the save was successfull	
			let stubSave = sandbox.stub(mockObj, 'save').callsFake(function () { 
				return new Promise((resolve, reject) => { });
			});
			
			// Set up the object list by calling onShow
			onShowFn();

			// Even if there are no sorts previously we will call this at least once to set up the old sorts
			sandbox.assert.called(spyLogicClickAddNewFilter);
			
			// At the end of a new sort added we call the onChange to update the data table
			sandbox.assert.called(spyLogicOnChange);

			// Make sure the functions are only called the number of times we expect
			sandbox.assert.callCount(spyLogicClickAddNewFilter, mockObj.workspaceFilterConditions.length);
			sandbox.assert.callCount(spyLogicOnChange, mockObj.workspaceSortFields.length);
			
			// Assume clear all button is clicked
			addNewFilterButtonClickFn(null, null, null);
			
			// Assert the number of times the addNewFilter has been called should increase by 1
			sandbox.assert.callCount(spyLogicClickAddNewFilter, mockObj.workspaceFilterConditions.length + 1);
			
		});


	});


});
