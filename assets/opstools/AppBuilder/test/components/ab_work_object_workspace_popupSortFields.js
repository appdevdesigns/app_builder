import AB from '../../components/ab'
import ABObject from "../../classes/ABObject"
import AB_Work_Object_Workspace_PopupSortFields from "../../components/ab_work_object_workspace_popupSortFields"

import sampleApp from "../fixtures/ABApplication"

describe('ab_work_object_workspace_popupSortFields component', () => {

	var sandbox;

	var ab;
	var mockApp;

	const componentName = 'ab_work_object_workspace_popupSortFields';
	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new AB_Work_Object_Workspace_PopupSortFields(mockApp);
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
		it('.clickAddNewSort: should exist', () => {
			assert.isDefined(target._logic.clickAddNewSort);
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

		it('.clickAddNewSort: should add a new element to UI', () => {
			// Load first object from a sample ABApplication
			let mockObj = sampleApp.objects()[0];
			target.objectLoad(mockObj);
			
			// Set up simulated button click and spy for clickAddNewSort function
			let addNewSortButtonClickFn = target.ui.body.elements[target.ui.body.elements.length - 1].on.onItemClick,
				onShowFn = target.ui.on.onShow,
				spyLogicOnChange = sandbox.spy(target._logic.callbacks, 'onChange'),
				spyLogicClickAddNewSort = sandbox.spy(target._logic, 'clickAddNewSort');
			
			// Tell the app the save was successfull	
			let stubSave = sandbox.stub(mockObj, 'save').callsFake(function () { 
				return new Promise((resolve, reject) => { });
			});
			
			// Set up the object list by calling onShow
			onShowFn();

			// Even if there are no sorts previously we will call this at least once to set up the old sorts
			sandbox.assert.called(spyLogicClickAddNewSort);
			
			// At the end of a new sort added we call the onChange to update the data table
			sandbox.assert.called(spyLogicOnChange);

			// Make sure the functions are only called the number of times we expect
			sandbox.assert.callCount(spyLogicClickAddNewSort, mockObj.workspaceSortFields.length);
			sandbox.assert.callCount(spyLogicOnChange, mockObj.workspaceSortFields.length);
			
			// Assume clear all button is clicked
			addNewSortButtonClickFn(null, null, null);
			
			// Assert the number of times the click add new sort should match the number of entries in the database
			sandbox.assert.callCount(spyLogicClickAddNewSort, mockObj.workspaceSortFields.length + 1);
			
		});

	});


});
