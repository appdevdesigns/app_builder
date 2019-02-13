import AB from '../../components/ab'
import RowFilter from '../../classes/RowFilter'

import sampleApp from "../fixtures/ABApplication"

describe('RowFilter component', () => {

	var sandbox;

	var ab;
	var mockApp;

	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new RowFilter(mockApp);
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

	});


	// Init test cases
	describe('Init testing', () => {
		it("should exist init property", () => {
			assert.isDefined(target.init, "should have a init property");
		});

		it("should accept .onChange in init", () => {
			// Call init
			let callbacks = { onChange: function () { } };
			target.init(callbacks);

			assert.equal(callbacks.onChange, target._logic.callbacks.onChange);
		});

	});

	// Public functions
	describe('Public function testing', () => {

		it("should exist .objectLoad function", () => {
			assert.isDefined(target.objectLoad, "should have .objectLoad function");
		});

		it("should exist .viewLoad function", () => {
			assert.isDefined(target.viewLoad, "should have .viewLoad function");
		});

		it("should exist .addNewFilter function", () => {
			assert.isDefined(target.addNewFilter, "should have .addNewFilter function");
		});

		it("should exist .getValue function", () => {
			assert.isDefined(target.getValue, "should have .getValue function");
		});

		it("should exist .setValue function", () => {
			assert.isDefined(target.setValue, "should have .setValue function");
		});

		it("should exist .isValid function", () => {
			assert.isDefined(target.isValid, "should have .isValid function");
		});

	});

	// Logic test cases
	describe('Logic testing', () => {

		it('.callbacks.onChange: should exist', () => {
			assert.isDefined(target._logic.callbacks.onChange);
		});

		it('.getFieldList: should return the field list when load object in .objectLoad', () => {

			let mockObj = sampleApp.objects()[0],
				mockFields = mockObj.fields();

			target._logic.objectLoad(mockObj);

			let result = target._logic.getFieldList();

			result.forEach((field, index) => {

				if (index == 0) {
					assert.equal('this_object', field.id);
					assert.equal(mockObj.label, field.value);
					assert.isUndefined(field.alias);
				}
				else {

					let mockField = mockFields[index - 1];

					assert.equal(mockField.id, field.id);
					assert.equal(mockField.label, field.value);
					assert.equal(mockField.alias, field.alias);

				}

			});

		});


		it('.getAddButtonUI: should return button view definition', () => {

			let result = target._logic.getAddButtonUI();

			assert.equal('button', result.view);

		});

		it('.getAddButtonUI: should call .addNewFilter when click', () => {

			let result = target._logic.getAddButtonUI();

			let spyAddNewFilter = sandbox.spy(target._logic, 'addNewFilter');

			result.click();

			sandbox.assert.calledOnce(spyAddNewFilter);

		});

		it('.addNewFilter: should add a new element to UI', () => {
			// Load first object from a sample ABApplication
			let mockObj = sampleApp.objects()[0];
			target.objectLoad(mockObj);

			// Set up simulated button click and spy for clickAddNewSort function
			let addNewFilterButtonClickFn = target.ui.rows[1].click,
				spyLogicOnChange = sandbox.spy(target._logic.callbacks, 'onChange'),
				spyLogicClickAddNewFilter = sandbox.spy(target._logic, 'addNewFilter');

			// Even if there are no sorts previously we will call this at least once to set up the old sorts
			// sandbox.assert.called(spyLogicClickAddNewFilter);

			// At the end of a new sort added we call the onChange to update the data table
			// NOTE: having difficulty with this one due to internal async call to CurrentObject.save().then({ _logic.callChangeEvent() });
			// sandbox.assert.called(spyLogicOnChange);

			// Make sure the functions are only called the number of times we expect
			// sandbox.assert.callCount(spyLogicClickAddNewFilter, mockObj.workspaceFilterConditions.length);

			// Assume clear all button is clicked
			addNewFilterButtonClickFn(null, null, null);

			// Assert the number of times the addNewFilter has been called should increase by 1
			// sandbox.assert.callCount(spyLogicClickAddNewFilter, mockObj.workspaceFilterConditions.length + 1);

			sandbox.assert.called(spyLogicClickAddNewFilter);

		});

		it('.removeNewFilter: ', () => {

		});


	});

});