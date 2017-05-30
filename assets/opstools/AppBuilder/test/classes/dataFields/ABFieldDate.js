import ABFieldDate from "../../../classes/dataFields/ABFieldDate"

describe("ABFieldDate unit tests", () => {

	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	var sandbox;

	var dateField;
	var dateComponent;
	var mockApp;
	var mockObject;

	var columnName = 'TEST_DATE_COLUMN';

	before(() => {
		mockApp = OP.Component._newApp();
		mockObject = {};

		dateField = new ABFieldDate({
			columnName: columnName,
			settings: {}
		}, mockObject);

		dateComponent = ABFieldDate.propertiesComponent(mockApp);
	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	/* Date field test cases */
	describe('Date data field test cases', () => {

		it('should exist date field', () => {
			assert.isDefined(dateField);
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
			var columnConfig = dateField.columnHeader();

			assert.equal('date', columnConfig.editor);
			assert.equal('string', columnConfig.sort);
			assert.isDefined(columnConfig.format);
			assert.isDefined(columnConfig.editFormat);
		});

		it('.columnHeader: should return date/time column config when has includeTime setting', () => {
			dateField.settings.includeTime = 1;
			var columnConfig = dateField.columnHeader();

			assert.equal('datetime', columnConfig.editor);
			assert.equal('string', columnConfig.sort);
			assert.isDefined(columnConfig.format);
			assert.isDefined(columnConfig.editFormat);
		});

		it('.defaultValue: should set current date to data', () => {
			var rowData = {};

			// set setting to current date as default
			dateField.settings.defaultCurrentDate = 1;

			// Set default value
			dateField.defaultValue(rowData);

			assert.isDefined(rowData[columnName]);
		});

		it('.defaultValue: should set valid date to data', () => {
			var rowData = {};

			// set specific date as default
			dateField.settings.defaultCurrentDate = 0;
			dateField.settings.defaultDate = new Date('1986-02-28');

			// Set default value
			dateField.defaultValue(rowData);

			assert.isDefined(rowData[columnName]);
			assert.equal(dateField.settings.defaultDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - dateRange: should pass when enter date is in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			// Current date
			let currentDate = new Date();
			rowData[columnName] = currentDate;

			dateField.settings.validateCondition = 'dateRange';
			dateField.settings.validateRangeBefore = '5';
			dateField.settings.validateRangeAfter = '5';
			dateField.settings.validateRangeUnit = 'days';

			dateField.isValidData(rowData, validator);

			sinon.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(currentDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - dateRange: should not pass when enter date is not in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			// Next 6 days from current
			rowData[columnName] = moment().add(6, 'days').toDate();

			dateField.settings.validateCondition = 'dateRange';
			dateField.settings.validateRangeBefore = '5';
			dateField.settings.validateRangeAfter = '5';
			dateField.settings.validateRangeUnit = 'days';

			dateField.isValidData(rowData, validator);

			sinon.assert.calledOnce(stubAddError);
		});

		it('.isValidData - between: should pass when enter date is in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-15');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = 'between';
			dateField.settings.validateStartDate = '1986-02-01';
			dateField.settings.validateEndDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(enterDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - notBetween: should not pass when enter date is not in range', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-03-01');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = 'between';
			dateField.settings.validateStartDate = '1986-02-01';
			dateField.settings.validateEndDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.calledOnce(stubAddError);
		});

		it('.isValidData - equal: should pass when enter date equals validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '=';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(enterDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - equal: should not pass when enter date does not equal validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-03-01');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '=';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.calledOnce(stubAddError);
		});

		it('.isValidData - not equal: should pass when enter date does not equal validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-27');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '<>';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(enterDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - not equal: should not pass when enter date equals validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '<>';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.calledOnce(stubAddError);
		});

		it('.isValidData - greater than: should pass when enter date is greater than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-03-01');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '>';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(enterDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - greater than: should not pass when enter date does not greater than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '>';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.calledOnce(stubAddError);
		});

		it('.isValidData - lower than: should pass when enter date is lower than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-27');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '<';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.notCalled(stubAddError);

			// .isValidDate should convert Date to ISO when valid
			assert.equal(enterDate.toISOString(), rowData[columnName]);
		});

		it('.isValidData - lower than: should not pass when enter date does not lower than validate date', () => {
			let validator = { addError: function () { } };
			let stubAddError = sinon.stub(validator, 'addError').callsFake(function () { });

			let rowData = {};
			let enterDate = new Date('1986-02-28');
			rowData[columnName] = enterDate;

			dateField.settings.validateCondition = '<';
			dateField.settings.validateStartDate = '1986-02-28';

			dateField.isValidData(rowData, validator);

			sinon.assert.calledOnce(stubAddError);
		});

	});


	/* Date field component test cases */
	describe('Date field component test cases', () => {

		it('should exist date component', () => {
			assert.isDefined(dateComponent);
		});

	});

});