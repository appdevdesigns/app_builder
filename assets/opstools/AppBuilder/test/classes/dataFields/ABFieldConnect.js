import AB from '../../../components/ab'
import ABFieldConnect from "../../../classes/dataFields/ABFieldConnect"

describe("ABFieldConnect unit tests", () => {
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

	var columnName = 'TEST_CONNECT_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockApp.objects = function () { };

		mockObject = {
			application: mockApp
		};

		target = new ABFieldConnect({
			columnName: columnName,
			settings: {}
		}, mockObject);

		targetComponent = ABFieldConnect.propertiesComponent(mockApp);

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

	/* Connect field test cases */
	describe('Connect field test cases', () => {

		it('should exist field', () => {
			assert.isDefined(target);
		});

		it('should have valid default value', () => {
			let defaultValues = ABFieldConnect.defaults();

			let menuName = L('ab.dataField.connectObject.menuName', '*Connect to another record');
			let description = L('ab.dataField.connectObject.description', '*Connect two data objects together');;

			assert.equal('connectObject', defaultValues.key);
			assert.equal('external-link', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
			assert.equal(description, defaultValues.description);
			assert.isFalse(defaultValues.isSortable);
			assert.isTrue(defaultValues.isFilterable);
			assert.isFalse(defaultValues.useAsLabel);
			assert.isFalse(defaultValues.supportRequire);
		});

		it('.columnHeader: should return valid column config', () => {
			var columnConfig = target.columnHeader();

			assert.isFunction(columnConfig.template, ' should return a function() ');
		});

		it('.customDisplay: should render single selectivity when link type is one', () => {
			var rowData = {},
				domNode = document.createElement("div"),
				domSelectArea = document.createElement("div");

			domSelectArea.className = "connect-data-values";
			domNode.appendChild(domSelectArea);

			var stubObjects = sandbox.stub(mockApp, "objects").callsFake((objId) => {
				return {

				};
			});

			target.customDisplay(rowData, mockApp, domNode);

			assert.isDefined(domSelectArea.selectivity);
			assert.isTrue(domSelectArea.selectivity instanceof Selectivity.Inputs.Single);

		});

		it('.customDisplay: should render multiple selectivity when link type is multiple', () => {
			var rowData = {},
				domNode = document.createElement("div"),
				domSelectArea = document.createElement("div");

			domSelectArea.className = "connect-data-values";
			domNode.appendChild(domSelectArea);

			var stubObjects = sandbox.stub(mockApp, "objects").callsFake((objId) => {
				return {

				};
			});

			target.settings.linkType = 'many';
			target.customDisplay(rowData, mockApp, domNode);

			assert.isDefined(domSelectArea.selectivity);
			assert.isTrue(domSelectArea.selectivity instanceof Selectivity.Inputs.Multiple);

		});

		it('.customEdit: should return false', () => {

			var rowData = {},
				domNode = document.createElement("div"),
				domSelectArea = document.createElement("div");

			domSelectArea.className = "connect-data-values";
			domNode.appendChild(domSelectArea);



			var result = target.customEdit(rowData, mockApp, domNode);

			assert.isFalse(result);
		});

		it('.relationName: should return valid relation name', () => {
			var result = target.relationName();

			assert.equal('TESTCONNECTCOLUMN__relation', result);
		});


	});

});