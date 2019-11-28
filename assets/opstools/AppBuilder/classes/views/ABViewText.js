/*
 * ABViewText
 *
 * An ABViewText defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

import PdfConverter from "../PdfMakeConverter/PdfConverter"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewTextPropertyComponentDefaults = {
	text: '',
	height: 0,
	dataviewID: null
}


var ABViewDefaults = {
	key: 'text',		// {string} unique key for this view
	icon: 'font',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.text' // {string} the multilingual label key for the class label
}



export default class ABViewText extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		OP.Multilingual.translate(this, this, ['text']);

		// 	{
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
	 * @method toObj()
	 *
	 * properly compile the current state of this ABViewLabel instance
	 * into the values needed for saving.
	 *
	 * @return {json}
	 */
	toObj() {

		OP.Multilingual.unTranslate(this, this, ['text']);

		var obj = super.toObj();
		obj.views = [];
		return obj;
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		this.settings = this.settings || {};

		// convert from "0" => 0
		this.settings.height = parseInt(this.settings.height || ABViewTextPropertyComponentDefaults.height);

		// if this is being instantiated on a read from the Property UI,
		this.text = values.text || ABViewTextPropertyComponentDefaults.text;

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

		webix.codebase = "/js/webix/extras/";

		var idBase = 'ABViewTextEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}

		var _ui = {
			id: ids.component,
			view: 'tinymce-editor',
			value: this.text || ABViewTextPropertyComponentDefaults.text,
			config: {
				plugins: [
			        "advlist autolink lists link image charmap print preview anchor",
			        "searchreplace visualblocks code fullscreen",
			        "insertdatetime media table contextmenu paste imagetools wordcount"
			    ],
				toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
				// menu: {
				// 	file: { title: 'File', items: 'newdocument' },
				// 	edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall' },
				// 	format: { title: 'Format', items: 'formats | removeformat' }
				// },
				init_instance_callback: (editor) => {

					editor.on('KeyUp', (event) => {

						_logic.onChange();

					});

					editor.on('Change', function (event) {

						_logic.onChange();

					});

				}
			}
		};


		var _init = (options) => {
		}

		var _logic = {

			onChange: () => {

				if (this.__onChangeFn) {

					clearTimeout(this.__onChangeFn);

					this.__onChangeFn = null;
				}

				this.__onChangeFn = setTimeout(() => {

					this.text = $$(ids.component).getValue();
					this.save();

				}, 400);

			}

		};

		return {
			ui: _ui,
			init: _init,
			logic: _logic
		};
	}



	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// _logic functions

		_logic.selectSource = (dcId, oldDcId) => {

			var currView = _logic.currentEditObject();

			// Update field options in property
			this.propertyUpdateFieldOptions(ids, currView, dcId);

		};

		_logic.selectField = (field) => {

			let format = "{#label#}".replace('#label#', field.label);

			// insert text to tinymce
			tinymce.activeEditor.execCommand('mceInsertContent', false, format);

		};


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.list.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			},
			{
				name: 'dataview',
				view: 'richselect',
				label: L('ab.components.list.dataSource', "*Data Source"),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: _logic.selectSource
				}
			},
			{
				name: 'field',
				view: 'list',
				autoheight: true,
				template: '#label#',
				on: {
					onItemClick: function (id, e, node) {

						var field = this.getItem(id);

						_logic.selectField(field);
					}
				}
			}
		]);

	}

	/**
	 * @method propertyUpdateFieldOptions
	 * Populate fields of object to select list in property
	 * 
	 * @param {Object} ids 
	 * @param {ABViewForm} view - the current component
	 * @param {string} dvId - id of ABDataview
	 */
	static propertyUpdateFieldOptions(ids, view, dvId) {

		var dataview = view.application.dataviews(dv => dv.id == dvId)[0];

		if (!dataview && view.parent.key == "dataview") {
			dataview = view.application.dataviews(dv => dv.id == view.parent.settings.dataviewID)[0];
			$$(ids.dataview).setValue(view.parent.settings.dataviewID);
		}

		var object = dataview ? dataview.datasource : null;

		// Pull field list
		$$(ids.field).clearAll();
		if (object)
			$$(ids.field).parse(object.fields());
		$$(ids.field).refresh();

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.height).setValue(view.settings.height);

		var dataviewID = (view.settings.dataviewID ? view.settings.dataviewID : null);
		var SourceSelector = $$(ids.dataview);

		// Pull data collections to options
		var dvOptions = view.application.dataviews().map(dv => {

			return {
				id: dv.id,
				value: dv.label
			};
		});

		dvOptions.unshift({
			id: null,
			value: '[Select]'
		});
		SourceSelector.define('options', dvOptions);
		SourceSelector.define('value', dataviewID);
		SourceSelector.refresh();

		this.propertyUpdateFieldOptions(ids, view, dataviewID);

	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.height = $$(ids.height).getValue();
		view.settings.dataviewID = $$(ids.dataview).getValue();

	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App, idPrefix) {

		let baseCom = super.component(App);

		var idBase = 'ABViewText_' + (idPrefix ? idPrefix : '') + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}
		
		
		var _logic = {
			
			displayText: (val) => {

				var result = this.displayText(val, ids.component);

				if ($$(ids.component)) {
					$$(ids.component).define("template", result);
					$$(ids.component).refresh();
				}

			}

		
		}

		// an ABViewLabel is a simple Label
		var _ui = {
			id: ids.component,
			view: 'template',
			autoheight: true,
			minHeight: 10,
			css: 'ab-custom-template',
			borderless: true
		};

		// define height
		if (this.settings.height)
			_ui.height = this.settings.height;
		else
			_ui.autoheight = true;


		// make sure each of our child views get .init() called
		var _init = (options) => {
		}
		
		var _onShow = (viewId) => {

			baseCom.onShow(viewId);

			// listen DC events
			let dv = this.dataview;
			if (dv && this.parent.key != "dataview") {

				this.eventAdd({
					emitter: dv,
					eventName: 'changeCursor',
					listener: _logic.displayText
				});

			}

			_logic.displayText();

		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic,
			onShow: _onShow
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


	/**
	 * @property dataview
	 * return ABDataview of this form
	 * 
	 * @return {ABDataview}
	 */
	get dataview() {
		if (this.parent.key == "dataview") {
			return this.application.dataviews(dv => dv.id == this.parent.settings.dataviewID)[0];
		} else {
			return this.application.dataviews(dv => dv.id == this.settings.dataviewID)[0];
		}
	}


	displayText(val, componentID) {

		var result = this.text;

		let clearTemplateValue = (result) => {
			return result.replace(/{(.*?)}/g, "");
		};
		
		var dv = this.dataview;
		if (!dv) return clearTemplateValue(result);

		var object = dv.datasource;
		if (!object) return clearTemplateValue(result);

		object.fields().forEach(f => {
			
			var rowData = val || dv.getCursor() || {};

			var template = new RegExp('{' + f.label + '}', 'g');
			var prepend = "";
			if (f.key == "image") {
				prepend = "/opsportal/image/" + this.application.name + "/";
			}	
			var data = prepend + f.format(rowData) || "???"; // "???" default value 

			if (f.format(rowData) != "" && f.key == "image" && result.indexOf("onload") == -1) {
				var params = {
					"containerID": componentID
				};
				result = result.replace("img", "img onload='AD.comm.hub.publish(\"opsportal.resize\", \""+params+"\");' ")
			}

			result = result.replace(template, data);

		});


		return clearTemplateValue(result);
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

			var pdfConverter = new PdfConverter(),
				reportDef = pdfConverter.convertHTML(this.displayText());

			resolve(reportDef);

		});

	}

}