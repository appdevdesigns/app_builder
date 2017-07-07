import AB from '../../components/ab'
import ABPopupDefineLabel from "../../components/ab_work_object_workspace_popupDefineLabel"

describe('ab_work_object_workspace_popupDefineLabel component', () => {

	var sandbox;

	var ab;
	var mockApp;

	const componentName = 'ab_work_object_workspace_popupDefineLabel';
	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new ABPopupDefineLabel(mockApp);
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

		it("should be webix's popup", () => {
			assert.equal(target.ui.view, "popup");
		});

		it("should call .onShow when popup shows", () => {
			var popup = target.ui,
				stubOnShow = sinon.stub(target._logic, "onShow").callsFake(() => { });

			popup.on.onShow();

			sandbox.assert.calledOnce(stubOnShow);
		});

		it("should call .onItemClick when column list item is clicked", () => {
			var columnList = OP.Test.findElement(target.ui, { name: "columnList" }),
				stubOnItemClick = sinon.stub(target._logic, "onItemClick").callsFake(() => { });

			var param1 = "Test Param 1",
				param2 = "Test Param 2",
				param3 = "Test Param 3"

			columnList.on.onItemClick(param1, param2, param3);

			sandbox.assert.calledOnce(stubOnItemClick);
			sandbox.assert.calledWith(stubOnItemClick, param1, param2, param3);
		});

		it("should call .buttonCancel when 'cancel' button is clicked ", () => {
			var cancelButton = OP.Test.findElement(target.ui, { name: "cancel" }),
				stubButtonCancel = sinon.stub(target._logic, "buttonCancel").callsFake(() => { });

			cancelButton.click();

			sandbox.assert.calledOnce(stubButtonCancel);
		});

		it("should call .buttonSave when 'save' button is clicked ", () => {
			var saveButton = OP.Test.findElement(target.ui, { name: "save" }),
				stubButtonSave = sinon.stub(target._logic, "buttonSave").callsFake(() => { });

			saveButton.click();

			sandbox.assert.calledOnce(stubButtonSave);
		});

	});


	// Init test cases
	describe('Init testing', () => {
		it("should exist init property", () => {
			assert.isDefined(target.init, "should have a init property");
		});

		it("should define callbacks when initial", () => {
			// Call init
			let callbacks = {
				onCancel: function () { },
				onSave: function () { }
			};
			target.init(callbacks);

			assert.equal(callbacks.onCancel, target._logic.callbacks.onCancel);
			assert.equal(callbacks.onSave, target._logic.callbacks.onSave)
		});

		it("should render webix component when initial", () => {
			var spyUi = sandbox.spy(webix, "ui");

			target.init({});

			sandbox.assert.calledOnce(spyUi);
			sandbox.assert.calledWith(spyUi, target.ui);
		});

	});


	// Actions test cases
	describe('Actions testing', () => {
	});


	// Logic test cases
	describe('Logic testing', () => {
	});





});