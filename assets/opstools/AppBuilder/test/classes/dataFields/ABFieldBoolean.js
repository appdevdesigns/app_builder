import AB from '../../../components/ab'
import ABFieldBoolean from "../../../classes/dataFields/ABFieldBoolean"

describe("ABFieldBoolean unit tests", () => {

	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	var sandbox;

	var ab;
	var mockApp;
	var mockObject;

	var target;
	var targetComponent;

	var webixCom;

	var columnName = 'TEST_BOOLEAN_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = {};

		target = new ABFieldBoolean({
			columnName: columnName,
			settings: {}
		}, mockObject);

		targetComponent = ABFieldBoolean.propertiesComponent(mockApp);

		// render edit component
		targetComponent.ui.container = "ab_test_div";
		webixCom = new webix.ui(targetComponent.ui);
	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(() => {
		if (webixCom && webixCom.destructor)
			webixCom.destructor();
	});

	/* Date field test cases */
	describe('Boolean field test cases', () => {

		it('should exist date field', () => {
			assert.isDefined(target);
		});

		it('should have valid date default value', () => {
			let defaultValues = ABFieldBoolean.defaults();

			let menuName = L('ab.dataField.boolean.menuName', '*Checkbox');
			let description = L('ab.dataField.boolean.description', '*A single checkbox that can be checked or unchecked.');

			assert.equal('boolean', defaultValues.key);
			assert.equal('check-square-o', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
			assert.equal(description, defaultValues.description);
		});

		it('.columnHeader: should return date column config', () => {
			var columnConfig = target.columnHeader();

			assert.equal('template', columnConfig.editor, 'should be "date" editor');
			assert.equal('<div class="ab-boolean-display">{common.checkbox()}</div>', columnConfig.template);
			assert.equal('center', columnConfig.css);
			assert.isUndefined(columnConfig.sort, 'should not define sort in webix datatable');
		});

		it('.defaultValue: should set 1', () => {
			var rowData = {};

			// set default to true
			target.settings.default = 1;

			target.defaultValue(rowData);

			assert.isDefined(rowData[columnName]);
			assert.isTrue(rowData[columnName] == 1);
		});

		it('.defaultValue: should set 0', () => {
			var rowData = {};

			// set default to true
			target.settings.default = 0;

			target.defaultValue(rowData);

			assert.isDefined(rowData[columnName]);
			assert.isTrue(rowData[columnName] == 0);
		});

	});

});