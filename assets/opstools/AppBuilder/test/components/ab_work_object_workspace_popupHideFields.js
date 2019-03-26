import AB from '../../components/ab'
import ABObject from "../../classes/ABObject"
import AB_Work_Object_Workspace_PopupHideFields from "../../components/ab_work_object_workspace_popupHideFields"

import mockApplication from "../fixtures/ABApplication"

describe('ab_work_object_workspace_popupHideFields component', () => {

	var sandbox;

	var ab;
	var mockUIApp;

	const componentName = 'ab_work_object_workspace_popupHideFields';
	var target;

	before(() => {
		ab = new AB();

		mockUIApp = ab._app;

		target = new AB_Work_Object_Workspace_PopupHideFields(mockUIApp);
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
		it('.clickHideAll: should exist', () => {
			assert.isDefined(target._logic.clickHideAll);
		});

		it('.clickShowAll: should exist', () => {
			assert.isDefined(target._logic.clickShowAll);
		});

		it('.clickListItem: should exist', () => {
			assert.isDefined(target._logic.clickListItem);
		});

		it('.iconFreezeOff: should exist', () => {
			assert.isDefined(target._logic.iconFreezeOff);
		});

		it('.iconFreezeOn: should exist', () => {
			assert.isDefined(target._logic.iconFreezeOn);
		});

		it('.iconHide: should exist', () => {
			assert.isDefined(target._logic.iconHide);
		});

		it('.iconShow: should exist', () => {
			assert.isDefined(target._logic.iconShow);
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


		it('.clickHideAll: should hide all columns from application object workspace', () => {
			
			// Load first object from a sample ABApplication
			let mockObj = mockApplication.objects()[0];
			target.objectLoad(mockObj);

			// Set up simulated button click and spy for clickHideAll function
			let buttonClickFn = target.ui.body.rows[1].cols[0].on.onItemClick,
				spyLogicClickHideAll = sandbox.spy(target._logic, 'clickHideAll');
			
			// Tell the app the save was successfull	
			let stubSave = sandbox.stub(mockObj, 'save').callsFake(function () { 
				return new Promise((resolve, reject) => { });
			});

			// Assume clear all button is clicked
			buttonClickFn(null, null, null);
			
			// Assert _logic.clickClearAll should be called when hide all button is clicked
			sandbox.assert.calledOnce(spyLogicClickHideAll);
			
			// Assert length of hidden column array should be the same as the length of the sample objects fields array
			assert.equal(mockObj.fields().length, mockObj.workspaceHiddenFields.length);

		});

		it('.clickShowAll: should show all columns from application object workspace', () => {
			
			// Load first object from a sample ABApplication
			let mockObj = mockApplication.objects()[0];
			target.objectLoad(mockObj);
			
			// Set up simulated button click and spy for clickShowAll function
			let buttonClickFn = target.ui.body.rows[1].cols[1].on.onItemClick,
				spyLogicClickShowAll = sandbox.spy(target._logic, 'clickShowAll');
			
			// Tell the app the save was successfull	
			let stubSave = sandbox.stub(mockObj, 'save').callsFake(function () { 
				return new Promise((resolve, reject) => { });
			});

			// Assume clear all button is clicked
			buttonClickFn(null, null, null);
			
			// Assert _logic.clickClearAll should be called when show all button is clicked
			sandbox.assert.calledOnce(spyLogicClickShowAll);
			
			// Assert length of hidden column array should be 0
			assert.equal(0, mockObj.workspaceHiddenFields.length);

		});

		it('.clickListItem: should assign that items key as an item in the hidden columns array and remove it if it is already there', () => {
			
			// Load first object from a sample ABApplication
			let mockObj = mockApplication.objects()[0];
			target.objectLoad(mockObj);

			// Set up simulated list item click and spy for clickListItem function
			let itemClickFn = target.ui.body.rows[0].on.onItemClick,
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
		
			let testField = mockObj.fields()[1];

			// Assume second item in list is clicked
			itemClickFn(testField.id, null, null);

			// Assert _logic.clickClearAll should be called when item is clicked
			sandbox.assert.calledOnce(spyLogicClickListItem);
			
			// Assert hidden columns array should contain the key of the item you clicked
			var match = sandbox.match.array.contains([testField.columnName]);
			match.test(mockObj.workspaceHiddenFields);

			// Assume second item in list is clicked again (to remove it)
			itemClickFn(testField.id, null, null);

			// Assert hidden columns array should contain the key of the item you clicked
			assert.equal(-1, mockObj.workspaceHiddenFields.indexOf(testField.columnName));
			
		});

		it('.clickListItem: should promt user if item is the frozen column key so they do not hide it', () => {
			
			// Load first object from a sample ABApplication
			let mockObj = mockApplication.objects()[0];
			target.objectLoad(mockObj);

			// Set up simulated list item click and spy for clickListItem function
			let itemClickFn = target.ui.body.rows[0].on.onItemClick,
				onShowFn = target.ui.on.onShow,
				spyLogicClickListItem = sandbox.spy(target._logic, 'clickListItem');
			
			// Use stub instead of spy to avoid show alert popup
			let stubAlert = sandbox.stub(OP.Dialog, 'Alert').callsFake(function () { });
			
			// Tell the app the icons were set up without issue
			let stubIconReset = sandbox.stub(target._logic, 'iconsReset').callsFake(function () { 
				// don't need to do anything but lets assume the UI did some magic here
			});
			
			// Set up the object list by calling onShow
			onShowFn();
		
			// Assume second item in list is clicked
			itemClickFn(mockObj.fields()[2].id, null, null);

			// Assert _logic.clickClearAll should be called when item is clicked
			sandbox.assert.calledOnce(spyLogicClickListItem);
			sandbox.assert.calledOnce(stubAlert);

		});

	});


});
