/*
 * ABViewList
 *
 * An ABViewList defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewListPropertyComponentDefaults = {
	dataviewID: null,
	field: null,
	height: 0
}


var ABViewDefaults = {
	key: 'list',		// {string} unique key for this view
	icon: 'list-ul',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.list' // {string} the multilingual label key for the class label
}



export default class ABViewLabel extends ABViewWidget {

	/**
 * @param {obj} values  key=>value hash of ABView values
 * @param {ABApplication} application the application object this view is under
 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

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

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

		super.fromValues(values);
		// convert from "0" => 0
		this.settings.height = parseInt(this.settings.height || 0);

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

		var idBase = 'ABViewListEditorComponent';

		var ListView = this.component(App, idBase);

		return {
			ui: ListView.ui,
			logic: ListView.logic,
			onShow: ListView.onShow,

			init: () => {

				// remove id of the component in caching for refresh .bind of the data collection
				let dv = this.datacollection;
				if (dv)
					dv.removeComponent(ListView.ui.id);

				ListView.init();
			}
		};
	}


	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// _logic functions

		_logic.selectSource = (dcId, oldDcId) => {

			var currView = _logic.currentEditObject();

			// Update field options in property
			this.propertyUpdateFieldOptions(ids, currView, dcId);

		};

		return commonUI.concat([
			{
				name: 'datacollection',
				view: 'richselect',
				label: L('ab.components.list.dataSource', "*Data Source"),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: _logic.selectSource
				}
			},
			{
				name: 'field',
				view: 'richselect',
				label: L('ab.components.list.field', "*Field"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.list.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			}
		]);

	}


	/**
	 * @method propertyUpdateFieldOptions
	 * Populate fields of object to select list in property
	 * 
	 * @param {Object} ids 
	 * @param {ABViewForm} view - the current component
	 * @param {string} dvId - id of ABDatacollection
	 */
	static propertyUpdateFieldOptions(ids, view, dvId) {

		var datacollection = view.application.datacollections(dc => dc.id == dvId)[0];
		var object = datacollection ? datacollection.datasource : null;

		// Pull field list
		var fieldOptions = [];
		if (object != null) {

			fieldOptions = object.fields().map(f => {

				return {
					id: f.id,
					value: f.label
				};

			});
		}

		$$(ids.field).define("options", fieldOptions);
		$$(ids.field).refresh();

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var datacollectionId = (view.settings.dataviewID ? view.settings.dataviewID : null);
		var SourceSelector = $$(ids.datacollection);

		// Pull data collections to options
		var dcOptions = view.application.datacollections().map((dc) => {

			return {
				id: dc.id,
				value: dc.label
			};
		});

		dcOptions.unshift({
			id: null,
			value: '[Select]'
		});
		SourceSelector.define('options', dcOptions);
		SourceSelector.define('value', datacollectionId);
		SourceSelector.refresh();

		this.propertyUpdateFieldOptions(ids, view, datacollectionId);

		$$(ids.field).setValue(view.settings.field);
		$$(ids.height).setValue(view.settings.height);

	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataviewID = $$(ids.datacollection).getValue();
		view.settings.field = $$(ids.field).getValue();
		view.settings.height = $$(ids.height).getValue();

	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		let baseCom = super.component(App);

		var idBase = 'ABViewListEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};


		var _ui = {
			id: ids.component,
			view: "dataview",
			height: this.settings.height,
			type: {
				width: 1000,
				height: 30
			},
			template: (item) => {

				var field = this.field();
				if (!field)
					return "";

				return field.format(item);
			}
		};


		var _init = (options) => {

			var dv = this.datacollection;
			if (!dv) return;

			// bind dc to component
			dv.bind($$(ids.component));

		}

		// var _logic = {
		// } 

		return {
			ui: _ui,
			init: _init,

			onShow: baseCom.onShow
		}
	}

	field() {

		var dv = this.datacollection;
		if (!dv) return null;

		var object = dv.datasource;
		if (!object) return null;

		return object.fields(f => f.id == this.settings.field)[0];
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

			var reportDef = {
				ul: []
			};

			var dv = this.datacollection;
			if (!dv) return resolve(reportDef);

			var field = this.field();
			if (!field) return resolve(reportDef);

			dv.getData().forEach(item => {

				var display = field.format(item);

				reportDef.ul.push(display);

			});

			resolve(reportDef);


		});

	}


}
