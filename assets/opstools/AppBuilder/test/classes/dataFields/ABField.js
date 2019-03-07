import AB from '../../../components/ab'
import ABField from "../../../classes/dataFields/ABField"

import sampleApp from "../../fixtures/ABApplication"

describe("ABField unit tests", () => {

	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	var sandbox;

	var ab;
	var mockApp;
	var mockObject;
	var ids;

	var target;

	var columnName = 'TEST_FIELD_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = sampleApp.objects()[0];

		ids = {
			label: "TEST_ABField_label",
			columnName: "TEST_ABField_column",
			fieldDescription: "TEST_ABField_description",
			showIcon: "TEST_ABField_icon",
			required: "TEST_ABField_required",
			numberOfNull: "TEST_ABField_numberOfNull"
		};

		target = new ABField(
			{
				columnName: columnName,
				settings: {}
			},
			mockObject,
			{
				key: "TEST ABField"
			}
		);

	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(() => {
	});

	/* ABField test cases */
	describe('ABField test cases', () => {

		it('should exist field', () => {
			assert.isDefined(target);
		});

		it('.definitionEditor: should return valid UI definition', () => {

			let resultUI = ABField.definitionEditor(mockApp, ids, {}, target);

			resultUI.container = "ab_test_div";

			// render UI editor
			new webix.ui(resultUI);

		});

		it('.clearEditor: should clear values of UI editor', () => {

			ABField.clearEditor(ids);

			assert.isNull(ABField._CurrentField, 'should clear stored current field');
			assert.equal('', $$(ids.label).getValue());
			assert.equal('', $$(ids.columnName).getValue());
			assert.equal(1, $$(ids.showIcon).getValue());
			assert.equal(0, $$(ids.required).getValue());
			assert.isFalse($$(ids.numberOfNull).isVisible(), 'should hide numberOfNull component');

		});

		it('.editorPopulate: should populate valid values', () => {

			let field = {
				label: 'LABEL',
				columnName: 'COLUMN NAME',
				settings: {
					showIcon: 1,
					required: 1
				}
			};

			ABField.editorPopulate(ids, field);

			assert.equal(field, ABField._CurrentField, 'should store valid field');
			assert.equal(field.label, $$(ids.label).getValue());
			assert.equal(field.columnName, $$(ids.columnName).getValue());
			assert.equal(field.settings.showIcon, $$(ids.showIcon).getValue());
			assert.equal(field.settings.required, $$(ids.required).getValue());

		});

		it('.editorValues: should return valid settings', () => {

			let label = "LABEL";
			let columnName = "COLUMN NAME"; 
			let settings = {
				label: label,
				columnName: columnName,
				settings: {
					first: "ONE",
					second: "TWO"
				}
			};

			let result = ABField.editorValues(settings);

			assert.equal(label, result.label);
			assert.equal(columnName, result.columnName);
			assert.equal(settings, result.settings);
			assert.isUndefined(settings.label, 'should remove .label');
			assert.isUndefined(settings.columnName, 'should remove .columnName');

		});

		it('.isValid: should not error', () => {

			let validator = target.isValid();

			assert.isTrue(validator.pass());
			assert.isFalse(validator.fail());

		});

		it('.isValid: should call unique error', () => {

			// set duplicate column name
			target.id = "TEST ID";
			target.columnName = "Noun";

			let validator = target.isValid();

			assert.isTrue(validator.fail());
			assert.isFalse(validator.pass());

		});

		it('.destroy: should not call remove this field', (done) => {

			delete target.id;

			let stubFieldRemove = sandbox.stub(mockObject, 'fieldRemove').callsFake(function () { });
			let result = target.destroy().then(() => {

				assert.isTrue(result instanceof Promise);
				sandbox.assert.notCalled(stubFieldRemove);
				done();

			});

		});

		it('.destroy: should not call remove this field', (done) => {

			target.id = "TEST ID";

			let stubFieldRemove = sandbox.stub(mockObject, 'fieldRemove').callsFake(function () { });
			let result = target.destroy();

			assert.isTrue(result instanceof Promise);
			result.then(() => {

				sandbox.assert.calledOnce(stubFieldRemove);
				done();

			});

		});

		// it('.save: should ', (done) => {

		// 	done();

		// });

	});


});