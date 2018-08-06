/*
 * ABViewImage
 *
 * An ABViewImage defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewImagePropertyComponentDefaults = {
	filename: "",
	width: 200,
	height: 100
}


var ABViewDefaults = {
	key: 'image',		// {string} unique key for this view
	icon: 'picture-o',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.image' // {string} the multilingual label key for the class label
}



export default class ABViewImage extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//			format: x				// the display style of the text
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}

	static common() {
		return ABViewDefaults;
	}

	///
	/// Instance Methods
	///

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// convert from "0" => 0
		this.settings.width = parseInt(this.settings.width || ABViewImagePropertyComponentDefaults.width);
		this.settings.height = parseInt(this.settings.height || ABViewImagePropertyComponentDefaults.height);

	}



	//
	//	Editor Related
	//


	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {

		var idBase = 'ABViewImageEditorComponent';

		var ImageComponent = this.component(App, idBase);

		return ImageComponent;

	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		_logic.validateType = (item) => {

			// verify file type
			var acceptableTypes = ['jpg', 'jpeg', 'bmp', 'png', 'gif'];
			var type = item.type.toLowerCase();
			if (acceptableTypes.indexOf(type) == -1) {
				//// TODO: multilingual
				webix.message("Only [" + acceptableTypes.join(", ") + "] images are supported");
				return false;
			}
			else {

				// set upload url to uploader
				var currView = _logic.currentEditObject();
				var actionKey = 'opstool.AB_' + currView.application.name.replace('_', '') + '.view';
				var url = '/' + ['opsportal', 'image', currView.application.name, actionKey, '1'].join('/');

				$$(ids.file).define("upload", url);
				$$(ids.file).refresh();

				return true;
			}
		};

		_logic.uploadedFile = (fileInfo) => {

			if (!fileInfo || !fileInfo.data)
				return;

			var currView = _logic.currentEditObject();
			currView.settings.filename = fileInfo.data.uuid;

			// trigger a save()
			this.propertyEditorSave(ids, currView);

		};


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			{
				cols: [
					{
						view: "label",
						label: L("ab.component.image.image", "*Image:"),
						css: 'ab-text-bold',
						width: App.config.labelWidthXLarge,
					},
					{
						view: "uploader",
						value: '*Upload image',
						name: "file",
						apiOnly: true,
						inputName: 'image',
						multiple: false,
						on: {
							onBeforeFileAdd: (item) => {

								return _logic.validateType(item);

							},

							onFileUpload: (file, response) => {

								_logic.uploadedFile(file);

							},

							onFileUploadError: (file, response) => {

							}
						}
					}
				]
			},
			{
				view: 'counter',
				name: "width",
				label: L("ab.component.image.width", "*Width:"),
				labelWidth: App.config.labelWidthXLarge,
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.image.height", "*Height:"),
				labelWidth: App.config.labelWidthXLarge,
			}

		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.width).setValue(view.settings.width);
		$$(ids.height).setValue(view.settings.height);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.width = $$(ids.width).getValue();
		view.settings.height = $$(ids.height).getValue();
	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewImage_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		// an ABViewLabel is a simple Label
		var _ui = {
			cols: [
				{
					id: ids.component,
					view: "template",
					template: '',
					height: this.settings.height,
					width: this.settings.width
				},
				{}
			]
		};


		// make sure each of our child views get .init() called
		var _init = (options) => {

			if (!$$(ids.component)) return;

			if (this.settings.filename) {
				var imgTag = '<img src="/opsportal/image/{application}/{filename}" height="{height}" width="{width}">'
					.replace("{application}", this.application.name)
					.replace("{filename}", this.settings.filename)
					.replace("{height}", this.settings.height)
					.replace("{width}", this.settings.width);

				$$(ids.component).define('template', imgTag);
			}
			else {
				$$(ids.component).define('template', '');
			}

			$$(ids.component).refresh();

		}


		return {
			ui: _ui,
			init: _init
		}

	}


	//// Report ////

	/**
	 * @method print
	 * 
	 * 
	 * @return {Object} - PDF object definition
	 */
	print() {

		return new Promise((resolve, reject) => {

			var reportDef = {};

			if (!this.settings.filename)
				return resolve(reportDef);

			// pull image data
			var img = new Image();
			img.crossOrigin = 'Anonymous';
			img.onerror = function (err) {
				reject(err);
			};
			img.onload = () => {
				let canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				let ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
				let dataURL = canvas.toDataURL();
				let imageData = {
					data: dataURL,
					width: img.width,
					height: img.height
				};

				resolve({
					image: imageData.data,
					width: this.settings.width || imageData.width,
					height: this.settings.height || imageData.height,
				});

			};

			img.src = "/opsportal/image/{application}/{image}"
				.replace("{application}", this.application.name)
				.replace("{image}", this.settings.filename);


		});

	}


}