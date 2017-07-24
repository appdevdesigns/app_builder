import AB from '../../../components/ab'
import ABFieldUser from "../../../classes/dataFields/ABFieldUser"

describe("ABFieldUser unit tests", () => {

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

	var columnName = 'TEST_USER_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = {};

		target = new ABFieldUser({
			columnName: columnName,
			settings: {}
		}, mockObject);

		targetComponent = ABFieldUser.propertiesComponent(mockApp);

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

	/* User field test cases */
	describe('User field test cases', () => {

		it('should exist boolean field', () => {
			assert.isDefined(target);
		});

		it('should have valid default value', () => {
			let defaultValues = ABFieldUser.defaults();
			
			let menuName = L('ab.dataField.user.menuName', '*User');

			assert.equal('user', defaultValues.key);
			assert.equal('user-o', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
		});

		it('.columnHeader: should return valid column config when it is a single select field using richselect and is editable', () => {
			target.settings.editable = 1;
			target._options = {
				users: {}
			};
			var columnConfig = target.columnHeader();
			
			assert.equal('richselect', columnConfig.editor, 'should be "richselect" editor');
			assert.isUndefined(columnConfig.template, 'should not define "template" for a single select user');
			assert.isUndefined(columnConfig.sort, 'should not define "sort" in webix datatable');
		});

		it('.columnHeader: should return valid column config when it is a single select field using richselect and is editable', () => {
			target.settings.editable = 1;
			target._options = {
				users: {}
			};
			var columnConfig = target.columnHeader();
			
			assert.equal('richselect', columnConfig.editor, 'should be "richselect" editor');
			assert.isUndefined(columnConfig.template, 'should not define "template" for a single select user');
			assert.isUndefined(columnConfig.sort, 'should not define "sort" in webix datatable');
		});

		it('.columnHeader: should return valid column config when it is a multiple select field using selectivity', () => {
			target.settings.isMultiple = 1;
			var columnConfig = target.columnHeader();

			assert.equal('<div class="list-data-values"></div>', columnConfig.template);
			assert.isUndefined(columnConfig.editor, 'should not define "editor" for a single select user');
			assert.isUndefined(columnConfig.sort, 'should not define "sort" in webix datatable');
		});


		it('.defaultValue: should set current user', () => {
			var currentUser = {
				user: "james"
			};
		
			// set default to true
			target.settings.isCurrentUser = 1;
			target._currentUser = {
				user: "james"
			};

			target.defaultValue(currentUser);
		
			assert.isDefined(currentUser[columnName]);
			assert.equal(currentUser[columnName], "james");
		});

	});

});