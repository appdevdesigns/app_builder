import AB from '../../../components/ab'
import ABFieldEmail from "../../../classes/dataFields/ABFieldFile"

import sampleApp from "../../fixtures/ABApplication"
import ABFieldFile from '../../../classes/dataFields/ABFieldFile';

describe("ABFieldFile unit tests", () => {

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

	var columnName = 'TEST_FILE_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = sampleApp.objects()[0];

		target = new ABFieldEmail({
			columnName: columnName,
			settings: {}
		}, mockObject);

		targetComponent = ABFieldEmail.propertiesComponent(mockApp);

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

	/* File field test cases */
	describe('File field test cases', () => {

		it('should exist file field', () => {
			assert.isDefined(target);
		});

		it('should have valid default value', () => {
			let defaultValues = ABFieldFile.defaults();

			let menuName = L('ab.dataField.file.menuName', '*File Attachment');
			let description = L('ab.dataField.file.description', '*Attach a File to this object.');

			assert.equal('file', defaultValues.key);
			assert.equal('file', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
			assert.equal(description, defaultValues.description);
			assert.isFalse(defaultValues.isSortable);
			assert.isFalse(defaultValues.isFilterable);
			assert.isFalse(defaultValues.useAsLabel);
			assert.isFalse(defaultValues.supportRequire);
		});

		it('.columnHeader: should return valid column config', () => {
			let columnConfig = target.columnHeader();

			assert.isFalse(columnConfig.editor, 'should not use editor of webix');
			assert.isFunction(columnConfig.template);
			assert.isUndefined(columnConfig.sort, 'should not define sort in webix datatable');
		});

		it('.columnHeader: .template should return plain data in grouping feature', () => {
			let columnConfig = target.columnHeader();

			let row = {
				$group: true
			};
			row[columnName] = "EXPECT THIS";

			let result = columnConfig.template(row);

			assert.equal(row[columnName], result);
		});

		it('.columnHeader: .template should return valid read-only', () => {
			let columnConfig = target.columnHeader();

			let row = {};
			row[columnName] = {
				uuid: "UUID",
				filename: "FILENAME"
			};

			let result = columnConfig.template(row);

			let expect = [
				'<div class="ab-file-data-field" style="float: left;">',
				'<div class="webix_view ab-file-holder">',
				'<div class="webix_template">',
				'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; display:none">',
				'<i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>',
				'</div>',
				'<div class="file-data-field-name" style=" width:100%; height:100%; position:relative; ">',
				`<a target="_blank" href="/opsportal/file/AppDev_Apps/${row[columnName].uuid}">${row[columnName].filename}</a>`,
				'</div>',
				'</div>',
				'</div>',
				'</div>'
			].join('');

			assert.equal(expect, result);
		});

		it('.columnHeader: .template should return valid file upload HTML', () => {
			let editable = true;
			let columnConfig = target.columnHeader(null, null, editable);

			let row = {};
			row[columnName] = {
				uuid: "UUID",
				filename: "FILENAME"
			};

			let result = columnConfig.template(row);

			let expect = [
				'<div class="ab-file-data-field" style="float: left;">',
				'<div class="webix_view ab-file-holder">',
				'<div class="webix_template">',
				'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; display:none">',
				'<i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>',
				'<br/>Drag and drop or click here',
				'</div>',
				'<div class="file-data-field-name" style=" width:100%; height:100%; position:relative; ">',
				`<a target="_blank" href="/opsportal/file/AppDev_Apps/${row[columnName].uuid}">${row[columnName].filename}</a>`,
				'<a style="" class="ab-delete-photo" href="javascript:void(0);"><i class="fa fa-times delete-image"></i></a>',
				'</div>',
				'</div>',
				'</div>',
				'</div>'
			].join('');

			assert.equal(expect, result);
		});

		it('.formComponent: should return form component { common, newInstance }', () => {

			assert.isDefined(target.formComponent);
			assert.isFunction(target.formComponent);

			let result = target.formComponent();

			// common property
			assert.isDefined(result.common);
			assert.isFunction(result.common);
			assert.equal('fieldcustom', result.common().key);

			// newInstance property
			assert.isDefined(result.newInstance);
			assert.isFunction(result.newInstance);

		});

		it('.detailComponent: should return detail component { common, newInstance }', () => {

			assert.isDefined(target.detailComponent);
			assert.isFunction(target.detailComponent);

			let result = target.detailComponent();

			// common property
			assert.isDefined(result.common);
			assert.isFunction(result.common);
			assert.equal('detailcustom', result.common().key);

			// newInstance property
			assert.isDefined(result.newInstance);
			assert.isFunction(result.newInstance);

		});

		it('.fileTemplate: should return read-only HTML for empty data', () => {

			let row = {},
				editable = false;

			row[columnName] = {
				uuid: '',
				filename: ''
			};

			let expect = [
				'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; ">',
				'<i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>',
				'</div>',
				'<div class="file-data-field-name" style="display:none width:100%; height:100%; position:relative; ">',
				'<a target="_blank" href=""></a>',
				'</div>'
			].join('');
			let result = target.fileTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.fileTemplate: should return read-only HTML for exists data', () => {

			let row = {},
				editable = false;

			row[columnName] = {
				uuid: 'UUID',
				filename: 'FILENAME'
			};

			let expect = [
				'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; display:none">',
				'<i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>',
				'</div>',
				'<div class="file-data-field-name" style=" width:100%; height:100%; position:relative; ">',
				`<a target="_blank" href="/opsportal/file/AppDev_Apps/${row[columnName].uuid}">${row[columnName].filename}</a>`,
				'</div>'
			].join('');
			let result = target.fileTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.fileTemplate: should return HTML for empty data', () => {

			let row = {},
				editable = true;

			row[columnName] = {
				uuid: '',
				filename: ''
			};

			let expect = [
				'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; ">',
				'<i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>',
				'<br/>Drag and drop or click here',
				'</div>',
				'<div class="file-data-field-name" style="display:none width:100%; height:100%; position:relative; ">',
				'<a target="_blank" href=""></a>',
				'<a style="display:none" class="ab-delete-photo" href="javascript:void(0);">',
				'<i class="fa fa-times delete-image"></i>',
				'</a>',
				'</div>'
			].join('');
			let result = target.fileTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.fileTemplate: should return HTML for exists data', () => {

			let row = {},
				editable = true;

			row[columnName] = {
				uuid: 'UUID',
				filename: 'FILENAME'
			};

			let expect = [
				'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; display:none">',
				'<i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>',
				'<br/>Drag and drop or click here',
				'</div>',
				'<div class="file-data-field-name" style=" width:100%; height:100%; position:relative; ">',
				`<a target="_blank" href="/opsportal/file/AppDev_Apps/${row[columnName].uuid}">${row[columnName].filename}</a>`,
				'<a style="" class="ab-delete-photo" href="javascript:void(0);">',
				'<i class="fa fa-times delete-image"></i></a></div>'
			].join('');
			let result = target.fileTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.getValue: should return valid data', () => {

			let row = {};
			row[columnName] = {
				uuid: "UUID",
				filename: "FILENAME"
			};

			let item = webix.ui({
				view: 'template',
				template: `<div class="file-data-field-name" file-uuid="${row[columnName].uuid}"><a href="#">${row[columnName].uuid}</a></div>`
			});

			let result = target.getValue(item, row);

			assert.equal(row[columnName].uuid, result.uuid);
			assert.equal(row[columnName].filename, result.filename);

		});

	});

});