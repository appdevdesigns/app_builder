import AB from '../../../components/ab'
import ABFieldLongText from "../../../classes/dataFields/ABFieldLongText"

describe("ABFieldLongText unit tests", () => {

	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	var sandbox;

	var ab;
	var mockApp;
	var mockObject;

	var longTextField;
	var longTextComponent;

	var columnName = 'TEST_LONGTEXT_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = {};

		longTextField = new ABFieldLongText({
			columnName: columnName,
			settings: {}
		}, mockObject);

		longTextComponent = ABFieldLongText.propertiesComponent(mockApp);
	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	/* Field test cases */
	describe('LongText data field', () => {

		it('should exist', () => {
			assert.isDefined(longTextField);
		});

		it('should have valid defaults', () => {
			let defaultValues = ABFieldLongText.defaults();

			let menuName = L('ab.dataField.LongText.menuName', '*Long text');
			let description = L('ab.dataField.LongText.description', '*Multiple lines of text.');

			assert.equal('LongText', defaultValues.key);
			assert.equal('align-right', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
			assert.equal(description, defaultValues.description);
		});

		it('.columnHeader: should return column config', () => {
			var columnConfig = longTextField.columnHeader();
			assert.equal('text', columnConfig.editor);
			assert.equal('string', columnConfig.sort);
		});

		it('.defaultValue: should follow empty textDefault setting', () => {
			var rowData = {};

			longTextField.settings.textDefault = null;
			longTextField.defaultValue(rowData);
			assert.isDefined(rowData[columnName]);
			assert.equal('', rowData[columnName]);
			
			longTextField.settings.textDefault = undefined;
			longTextField.defaultValue(rowData);
			assert.isDefined(rowData[columnName]);
			assert.equal('', rowData[columnName]);
		});
		
		it('.defaultValue: should follow non-empty textDefault setting', () => {
			var rowData = {};

			longTextField.settings.textDefault = 'hello world';
			longTextField.defaultValue(rowData);
			assert.isDefined(rowData[columnName]);
			assert.equal('hello world', rowData[columnName]);
		});

	});


	/* Long text field component test cases */
	describe('Long text field component', () => {
		it('should exist', () => {
			assert.isDefined(longTextComponent);
		});

	});

});