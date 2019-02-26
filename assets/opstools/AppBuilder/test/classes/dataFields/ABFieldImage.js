import AB from '../../../components/ab'
import ABFieldImage from '../../../classes/dataFields/ABFieldImage';

import sampleApp from "../../fixtures/ABApplication"

describe("ABFieldImage unit tests", () => {

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

	var columnName = 'TEST_IMAGE_COLUMN';

	before(() => {
		ab = new AB();

		mockApp = ab._app;
		mockObject = sampleApp.objects()[0];

		target = new ABFieldImage({
			columnName: columnName,
			settings: {}
		}, mockObject);

		targetComponent = ABFieldImage.propertiesComponent(mockApp);

		// render edit component
		targetComponent.ui.container = "ab_test_div";
		webixCom = new webix.ui(targetComponent.ui);
	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		target.settings = {};
		sandbox.restore();
	});

	after(() => {
		if (webixCom && webixCom.destructor)
			webixCom.destructor();
	});

	/* Image field test cases */
	describe('Image field test cases', () => {

		it('should exist Image field', () => {
			assert.isDefined(target);
		});

		it('should have valid default value', () => {
			let defaultValues = ABFieldImage.defaults();

			let menuName = L('ab.dataField.image.menuName', '*Image Attachment');
			let description = L('ab.dataField.image.description', '*Attach an image to this object.');

			assert.equal('image', defaultValues.key);
			assert.equal('file-image-o', defaultValues.icon);
			assert.equal(menuName, defaultValues.menuName);
			assert.equal(description, defaultValues.description);
			assert.isFalse(defaultValues.isSortable);
			assert.isFalse(defaultValues.isFilterable);
			assert.isFalse(defaultValues.useAsLabel);
			assert.isFalse(defaultValues.supportRequire);
		});

		it('.columnHeader: should return valid config without specific width', () => {
			let columnConfig = target.columnHeader();

			assert.isFalse(columnConfig.editor, 'should not use editor of webix');
			assert.isFunction(columnConfig.template);
			assert.isUndefined(columnConfig.sort, 'should not define sort in webix datatable');
			assert.isUndefined(columnConfig.width, 'should not specific width');
		});

		it('.columnHeader: should return valid config with specific width', () => {
			target.settings.useWidth = true;
			target.settings.imageWidth = 200;

			let columnConfig = target.columnHeader();

			assert.isFalse(columnConfig.editor, 'should not use editor of webix');
			assert.isFunction(columnConfig.template);
			assert.isUndefined(columnConfig.sort, 'should not define sort in webix datatable');
			assert.isDefined(columnConfig.width, 'should specific width');
			assert.equal(target.settings.imageWidth, columnConfig.width);
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

		it('.columnHeader: .template should return valid HTML', () => {
			let columnConfig = target.columnHeader();

			let row = {};
			row[columnName] = "IMAGE_FILE";

			let result = columnConfig.template(row);

			let expect = [
				'<div class="ab-image-data-field" style="float: left; width: 100%; height: 100%">' +
				'<div class="webix_view ab-image-holder" style="width: 100%; height: 100%">' +
				'<div class="webix_template">' +
				'<div class="image-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 8px; display:none">' +
				'<i class="fa fa-picture-o fa-2x" style="opacity: 0.6; font-size: 32px; margin-bottom: 5px;"></i>' +
				'</div>' +
				`<div class="image-data-field-image" style=" width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image:url('/opsportal/image/AppDev_Apps/${row[columnName]}');">` +
				'</div></div></div></div>'
			].join('');

			assert.equal(expect, result);
		});

		it('.customDisplay: should initial uploader to div', () => {

			let row = {},
				node = webix.ui({
					view: 'template',
					template: '<div class="ab-image-holder"></div>'
				});

			target.customDisplay(row, mockApp, node.$view);

			assert.isNotNull(node.$view.querySelector('.image-data-field-icon'));
			assert.isNotNull(node.$view.querySelector('.image-data-field-image'));

		});

		it('.customEdit: should always return false', () => {

			let row = {},
				node = webix.ui({
					view: 'template',
					template: '<div class="ab-image-holder"></div>'
				});

			let result = target.customEdit(row, mockApp, node.$view);

			assert.isFalse(result);

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
			assert.equal('detailimage', result.common().key);

			// newInstance property
			assert.isDefined(result.newInstance);
			assert.isFunction(result.newInstance);

		});

		it('.imageTemplate: should return read-only HTML for empty data', () => {

			let row = {},
				editable = false;

			row[columnName] = '';

			let expect = [
				'<div class="image-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 8px; ">' +
				'<i class="fa fa-picture-o fa-2x" style="opacity: 0.6; font-size: 32px; margin-bottom: 5px;"></i>' +
				'</div>' +
				'<div class="image-data-field-image" style="display:none width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover; "></div>'
			].join('');
			let result = target.imageTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.imageTemplate: should return read-only HTML for exists data', () => {

			let row = {},
				editable = false;

			row[columnName] = "IMAGE VALUE";

			let expect = [
				'<div class="image-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 8px; display:none">' +
				'<i class="fa fa-picture-o fa-2x" style="opacity: 0.6; font-size: 32px; margin-bottom: 5px;"></i>' +
				'</div>' +
				`<div class="image-data-field-image" style=" width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image:url('/opsportal/image/AppDev_Apps/${row[columnName]}');">` +
				'</div>'
			].join('');
			let result = target.imageTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.imageTemplate: should return HTML for empty data', () => {

			let row = {},
				editable = true;

			row[columnName] = '';

			let expect = [
				'<div class="image-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 8px; ">' +
				'<i class="fa fa-picture-o fa-2x" style="opacity: 0.6; font-size: 32px; margin-bottom: 5px;"></i><br/>' +
				'Drag and drop or click here</div>' +
				'<div class="image-data-field-image" style="display:none width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover; ">' +
				'<a style="display:none" class="ab-delete-photo" href="javascript:void(0);">' +
				'<i class="fa fa-times delete-image"></i>' +
				'</a></div>'
			].join('');
			let result = target.imageTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.imageTemplate: should return HTML for exists data', () => {

			let row = {},
				editable = true;

			row[columnName] = 'IMAGE';

			let expect = [
				'<div class="image-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 8px; display:none">' +
				'<i class="fa fa-picture-o fa-2x" style="opacity: 0.6; font-size: 32px; margin-bottom: 5px;"></i>' +
				'<br/>Drag and drop or click here</div>' +
				`<div class="image-data-field-image" style=" width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image:url('/opsportal/image/AppDev_Apps/${row[columnName]}');">` +
				'<a style="" class="ab-delete-photo" href="javascript:void(0);"><i class="fa fa-times delete-image"></i></a>' +
				'</div>'
			].join('');
			let result = target.imageTemplate(row, editable);

			assert.equal(expect, result);

		});

		it('.getValue: should return valid data', () => {

			let row = {};
			row[columnName] = "EXPECT THIS";

			let item = webix.ui({
				view: 'template',
				template: `<div class="image-data-field-image" image-uuid="${row[columnName]}"></div>`
			});

			let result = target.getValue(item, row);

			assert.equal(row[columnName], result);

		});

		it('.setValue: should set valid HTML dom when data is set', () => {

			let row = {};
			row[columnName] = "IMAGE VALUE";

			let item = webix.ui({
				view: 'template',
				template: '<div>' +
					'<div class="image-data-field-icon"></div>' + // Image icon
					'<div class="image-data-field-image">' +
					'	<div class="ab-delete-photo"></div>' + // remove icon
					'</div>' +
					'</div>'
			});

			target.setValue(item, row);

			let elem = item.$view,
				imageIcon = elem.querySelector('.image-data-field-icon'),
				imagePanel = elem.querySelector('.image-data-field-image'),
				imageDeleteIcon = imagePanel.querySelector('.ab-delete-photo');

			assert.equal('none', imageIcon.style.display, 'should not display the Image icon');
			assert.equal('block', imageDeleteIcon.style.display, 'should show remove icon');

			assert.equal('block', imagePanel.style.display, 'should show Image name');
			assert.equal(row[columnName], imagePanel.getAttribute("Image-uuid"), 'should match');

		});

		it('.setValue: should set valid HTML dom when data is empty', () => {

			let row = {};

			let item = webix.ui({
				view: 'template',
				template: '<div>' +
					'<div class="image-data-field-icon"></div>' + // Image icon
					'<div class="image-data-field-image">' +
					'	<div class="ab-delete-photo"></div>' + // remove icon
					'</div>' +
					'</div>'
			});


			target.setValue(item, row);

			let elem = item.$view,
				imageIcon = elem.querySelector('.image-data-field-icon'),
				imagePanel = elem.querySelector('.image-data-field-image'),
				imageDeleteIcon = imagePanel.querySelector('.ab-delete-photo');

			assert.equal('block', imageIcon.style.display, 'should display the Image icon');
			assert.equal('none', imageDeleteIcon.style.display, 'should not display remove icon');

			assert.equal('none', imagePanel.style.display, 'should not display Image name');
			assert.isNull(imagePanel.getAttribute("Image-uuid"), 'should be null');

		});

	});

});