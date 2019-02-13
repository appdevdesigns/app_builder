import AB from '../../../components/ab'
import ABFieldDate from "../../../classes/dataFields/ABFieldDate"

let validFormat = (date) => {
	return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

describe("ABFieldDate unit tests", () => {

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

	var columnName = 'TEST_DATE_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = {};

		target = new ABFieldDate({
			columnName: columnName,
			settings: {}
		}, mockObject);

		targetComponent = ABFieldDate.propertiesComponent(mockApp);

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
	describe('Date field test cases', () => {

		it('should exist date field', () => {
			assert.isDefined(target);
		});

		it('should have valid date default value', () => {
			let defaultValues = ABFieldDate.defaults();

			let menuName = L('ab.dataField.date.menuName', '*Date');
			let description = L('ab.dataField.date.description', '*Pick one from a calendar.');

			assert.equal('date', defaultValues.key);
			assert.equal('calendar', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
			assert.equal(description, defaultValues.description);
		});

		it('.columnHeader: should return date column config', () => {
			var columnConfig = target.columnHeader();

			assert.equal('datetime', columnConfig.editor, 'should be "date" editor');
			assert.isUndefined(columnConfig.sort, 'should not define sort in webix datatable');
			assert.isDefined(columnConfig.format);
			assert.isDefined(columnConfig.editFormat);
		});

		it('.columnHeader: should return date/time column config when has includeTime setting', () => {
			target.settings.includeTime = 1;
			var columnConfig = target.columnHeader();

			assert.equal('datetime', columnConfig.editor, 'should be "datetime" editor');
			assert.isUndefined(columnConfig.sort, 'should not define sort in webix datatable');
			assert.isDefined(columnConfig.format);
			assert.isDefined(columnConfig.editFormat);
		});

		it('.defaultValue: should set current date to data', () => {
			var rowData = {};

			// set setting to current date as default
			target.settings.defaultDate = 2; // Current Date

			// Set default value
			target.defaultValue(rowData);

			assert.isDefined(rowData[columnName]);
			assert.isNotNaN(Date.parse(rowData[columnName]), 'should parse valid date object');
		});

		it('.defaultValue: should set valid date to data', () => {
			var rowData = {};

			// set specific date as default
			target.settings.defaultDate = 3
			target.settings.defaultDateValue = new Date('1986-02-28');

			// Set default value
			target.defaultValue(rowData);

			assert.isDefined(rowData[columnName]);
			assert.equal(target.settings.defaultDateValue.toISOString(), rowData[columnName]);
		});

		it('.isValidData - dateRange: should pass when enter date is in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			// Current date
			let currentDate = new Date();
			rowData[columnName] = currentDate;

			target.settings.validateCondition = 'dateRange';
			target.settings.validateRangeBefore = '5';
			target.settings.validateRangeAfter = '5';
			target.settings.validateRangeUnit = 'days';

			target.isValidData(rowData, validator);

			sandbox.assert.notCalled(stubAddError);

			// // .isValidDate should convert Date to ISO when valid
			// assert.equal(currentDate.toISOString(), rowData[columnName]);

			assert.equal(validFormat(currentDate), rowData[columnName]);

		});

		it('.isValidData - dateRange: should not pass when enter date is not in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			// Next 6 days from current
			rowData[columnName] = moment().add(6, 'days').toDate();

			target.settings.validateCondition = 'dateRange';
			target.settings.validateRangeBefore = '5';
			target.settings.validateRangeAfter = '5';
			target.settings.validateRangeUnit = 'days';

			target.isValidData(rowData, validator);

			sandbox.assert.calledOnce(stubAddError);
		});

		it('.isValidData - between: should pass when enter date is in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-15');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = 'between';
			target.settings.validateStartDate = '1986-02-01';
			target.settings.validateEndDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.notCalled(stubAddError);

			// // .isValidDate should convert Date to ISO when valid
			// assert.equal(enterDate.toISOString(), rowData[columnName]);

			assert.equal(validFormat(enterDate), rowData[columnName]);

		});

		it('.isValidData - notBetween: should not pass when enter date is not in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-03-01');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = 'between';
			target.settings.validateStartDate = '1986-02-01';
			target.settings.validateEndDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.calledOnce(stubAddError);
		});

		it('.isValidData - equal: should pass when enter date equals validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '=';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.notCalled(stubAddError);

			// // .isValidDate should convert Date to ISO when valid
			// assert.equal(enterDate.toISOString(), rowData[columnName]);

			assert.equal(validFormat(enterDate), rowData[columnName]);
		});

		it('.isValidData - equal: should not pass when enter date does not equal validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-03-01');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '=';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.calledOnce(stubAddError);
		});

		it('.isValidData - not equal: should pass when enter date does not equal validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-27');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '<>';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(validFormat(enterDate), rowData[columnName]);
		});

		it('.isValidData - not equal: should not pass when enter date equals validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '<>';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.calledOnce(stubAddError);
		});

		it('.isValidData - greater than: should pass when enter date is greater than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-03-01');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '>';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(validFormat(enterDate), rowData[columnName]);
		});

		it('.isValidData - greater than: should not pass when enter date does not greater than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '>';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.calledOnce(stubAddError);
		});

		it('.isValidData - lower than: should pass when enter date is lower than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-27');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '<';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(validFormat(enterDate), rowData[columnName]);
		});

		it('.isValidData - lower than: should not pass when enter date does not lower than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			target.settings.validateCondition = '<';
			target.settings.validateStartDate = '1986-02-28';

			target.isValidData(rowData, validator);

			sandbox.assert.calledOnce(stubAddError);
		});

	});


	/* Date field component test cases */
	describe('Date field component test cases', () => {

		it('should exist date component', () => {
			assert.isDefined(targetComponent);
		});

		it('should exist .dateDisplay', () => {
			assert.isDefined(targetComponent._logic.dateDisplay);
		});

		it('should valid default date format', () => {

			var date = new Date('Feb 28 1986 02:12:00'),
				// clone default settings
				formatSettings = JSON.parse(JSON.stringify(target.settings));

			formatSettings.timeFormat = 3; // %H:%i

			var expectedDate = '28/02/1986 02:12';

			var result = targetComponent._logic.dateDisplay(date, formatSettings);

			assert.equal(expectedDate, result);
		});

		it('should valid date format with comma delimiter', () => {

			var date = new Date('Feb 28 1986 02:12:00'),
				// clone default settings
				formatSettings = JSON.parse(JSON.stringify(target.settings));

			var expectedDate = 'Feb 28, 1986 02:12';

			formatSettings.timeFormat = 3;
			formatSettings.dateFormat = 4;

			var result = targetComponent._logic.dateDisplay(date, formatSettings);

			assert.equal(expectedDate, result);
		});

		it('should valid date format with space delimiter no time', () => {

			var date = new Date('Feb 28 1986 02:12:00'),
				// clone default settings
				formatSettings = JSON.parse(JSON.stringify(target.settings));

			var expectedDate = '02/28/1986';

			formatSettings.timeFormat = 1;
			formatSettings.dateFormat = 3;

			var result = targetComponent._logic.dateDisplay(date, formatSettings);

			assert.equal(expectedDate, result);
		});

		it('should valid time format - slash delimiter', () => {

			var date = new Date('Feb 28 1986 02:08:00'),
				// clone default settings
				formatSettings = JSON.parse(JSON.stringify(target.settings));

			var expectedDate = '28/02/1986 02:08 AM';

			formatSettings.timeFormat = 2;
			formatSettings.dateFormat = 2;

			var result = targetComponent._logic.dateDisplay(date, formatSettings);

			assert.equal(expectedDate, result);
		});

		it('should valid time format - dash delimiter', () => {

			var date = new Date('Feb 28 1986 22:08:00'),
				// clone default settings
				formatSettings = JSON.parse(JSON.stringify(target.settings));

			var expectedDate = '02/28/1986 22:08';

			formatSettings.timeFormat = 3;
			formatSettings.dateFormat = 3;

			var result = targetComponent._logic.dateDisplay(date, formatSettings);

			assert.equal(expectedDate, result);
		});


	});

});