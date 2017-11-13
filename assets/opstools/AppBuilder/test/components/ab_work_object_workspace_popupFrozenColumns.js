import AB from '../../components/ab'
import ABObject from "../../classes/ABObject"
import AB_Work_Object_Workspace_PopupFrozenColumns from "../../components/ab_work_object_workspace_popupFrozenColumns"

import sampleApp from "../fixtures/ABApplication"

describe('ab_work_object_workspace_popupFrozenColumns component', () => {

	var sandbox;

	var ab;
	var mockApp;

	const componentName = 'ab_work_object_workspace_popupFrozenColumns';
	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new AB_Work_Object_Workspace_PopupFrozenColumns(mockApp);
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
		it('.clickClearAll: should exist', () => {
			assert.isDefined(target._logic.clickClearAll);
		});

		it('.clickListItem: should exist', () => {
			assert.isDefined(target._logic.clickListItem);
		});

		it('.iconDefault: should exist', () => {
			assert.isDefined(target._logic.iconDefault);
		});

		it('.iconFreeze: should exist', () => {
			assert.isDefined(target._logic.iconFreeze);
		});

		it('.iconsReset: should exist', () => {
			assert.isDefined(target._logic.iconsReset);
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

		it('.clickClearAll: should remove all frozen columns from application object workspace', () => {
			
			// Load first object from a sample ABApplication			
			let mockObj = new ABObject(sampleApp.objects[0]);						
			target.objectLoad(mockObj);
			
			// Set up simulated button click and spy for clickClearAll function
			let buttonClickFn = target.ui.body.rows[0].on.onItemClick,
				spyLogicClickClearAll = sandbox.spy(target._logic, 'clickClearAll');
			
			// Tell the app the save was successfull	
			let stubSave = sandbox.stub(mockObj, 'save').callsFake(function () { 
				return new Promise((resolve, reject) => { });
			});

			// Assume clear all button is clicked
			buttonClickFn(null, null, null);
			
			// Assert _logic.clickClearAll should be called when claer all button is clicked
			sandbox.assert.calledOnce(spyLogicClickClearAll);
			
			// Assert frozen column should be empty string
			assert.equal('', mockObj.workspaceFrozenColumnID);

		});

		it('.clickListItem: should assign that items key as the frozen column index', () => {
			
			// Load first object from a sample ABApplication			
			let mockObj = new ABObject(sampleApp.objects[0]);						
			target.objectLoad(mockObj);
			
			// Set up simulated list item click and spy for clickListItem function
			let itemClickFn = target.ui.body.rows[1].on.onItemClick,
				onShowFn = target.ui.on.onShow,
				spyLogicClickListItem = sandbox.spy(target._logic, 'clickListItem');
			
			// Tell the app the save was successfull	
			let stubSave = sandbox.stub(mockObj, 'save').callsFake(function () { 
				return new Promise((resolve, reject) => { });
			});

			// Tell the app the icons were set up without issue
			let stubIconReset = sandbox.stub(target._logic, 'iconsReset').callsFake(function () { 
				// don't need to do anything but lets assume the UI did some magic here
			});
			
			// Set up the object list by calling onShow
			onShowFn();

			// Assume second item in list is clicked
			itemClickFn(sampleApp.objects[0].fields[1].id, null, null);
			
			// Assert _logic.clickClearAll should be called when claer all button is clicked
			sandbox.assert.calledOnce(spyLogicClickListItem);
			
			// Assert frozen column should be the columanName of the item clicked
			assert.equal(sampleApp.objects[0].fields[1].columnName, mockObj.workspaceFrozenColumnID);

		});

	});


});
