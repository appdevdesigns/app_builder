/*
 * ABViewChart
 *
 * An ABViewChart defines a Chart view type.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewChartPropertyComponentDefaults = {
	object: "",
	column: "",
	dataColor: ""
}


var ABViewDefaults = {
	key: 'chart',		// {string} unique key for this view
	icon: 'bar-chart',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.chart' // {string} the multilingual label key for the class label
}



export default class ABViewChart extends ABViewWidget  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent, defaultValues) {

    	super( values, application, parent, (defaultValues || ABViewDefaults) );

    	OP.Multilingual.translate(this, this, ['chartLabel']);

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
	toObj () {

		// OP.Multilingual.unTranslate(this, this, ['label', 'text']);

		var obj = super.toObj();

		return obj;
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

		super.fromValues(values);

    	// if this is being instantiated on a read from the Property UI,
    	// .text is coming in under .settings.label
    	this.text = values.text || values.settings.text || '*text';

    	// this.settings.format = this.settings.format || ABViewLabelPropertyComponentDefaults.format;

    	// we are not allowed to have sub views:
    	// this._views = [];

    	// convert from "0" => 0
    	// this.settings.format = parseInt(this.settings.format);

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

		var idBase = 'ABViewChartEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component')
		}


		// You will need to build your own UI relevant to the component sample of label below
		// var _ui = {
		// 	id: ids.component,
		// 	view: 'label',
		// 	label: this.text || ''
		// }
		// _ui = this.uiFormatting(_ui);
		// 
		// // This gives adequate space to the view
		// _ui = {
		// 	type: "space", // this code provides some margin between the rows so we don't have tangents
		// 	rows: [
		// 		_ui,
		// 		{}// this little bit provides a spacer below the content that will fill the area but we added it here so we wouldn't loose the styles applied in uiFormatting
		// 	]
		// };

		var _ui = {
			rows: [
				{}
			]
		};

		var _init = (options) => {
		}

		var _logic = {
		} 

		return {
			ui:_ui,
			init:_init,
			logic:_logic
		}
	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			// You will build your own UI for properties sample of label below
			// .text :  The Text displayed for this label
			// {
			// 	view: "text",
			// 	name:'text',
			// 	label: L('ab.component.label.text', '*Text'),
			// 	placeholder: L('ab.component.label.textPlaceholder', '*Text Placeholder'),
			// },
			// The options for formating of the text for this label
			// { 
			// 	view: "fieldset", 
			// 	label: L('ab.component.label.formatting','*format options:'), 
			// 	body:{
			//         rows:[
			// 			{
			// 				view: "radio", 
			// 				name: "format",
			// 				vertical: true,
			// 				value: ABViewLabelPropertyComponentDefaults.format, 
			// 				options:[
			// 					{ id:0, value: L('ab.component.label.formatting.normal','*normal') },
			// 					{ id:1, value: L('ab.component.label.formatting.title','*title')  },
			// 					{ id:2, value: L('ab.component.label.formatting.description','*description') }
			//         		]
			//         	}
			//         ]
		    // 	}
		    // },
			// {}
		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		// Make sure you set the values for this property editor in Webix
		// $$(ids.text).setValue(view.text);
		// $$(ids.format).setValue(view.settings.format);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		// view.text  = $$(ids.text).getValue();
		// view.settings.format = $$(ids.format).getValue();
	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = [];
		this.views().forEach((v)=>{
			viewComponents.push(v.component(App));
		})


		var idBase = 'ABViewChart_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}


		// sample of an ABViewLabel
		// var _ui = {
		// 	id: ids.component,
		// 	view: 'label',
		// 	label: this.text || '*',
		// 	type: {
		// 		height: "auto"
		// 	}
		// }
		// _ui = this.uiFormatting(_ui)

		var _ui = {
			id: ids.component,
			cols: []
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		}


		var _logic = {
		}


		return {
			ui:_ui,
			init:_init,
			logic:_logic
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}

	// Custom functions needed for UI

	/*
	 * uiFormatting
	 * a common routine to properly update the displayed label
	 * UI with the css formatting for the given .settings
	 * @param {obj} _ui the current webix.ui definition
	 * @return {obj} a properly formatted webix.ui definition
	 */
	// uiFormatting(_ui) {
	// 
	// 	// add different css settings based upon it's format 
	// 	// type.
	// 	switch(parseInt(this.settings.format)) {
	// 
	// 		// normal
	// 		case 0: 
	// 			break;
	// 
	// 		// title
	// 		case 1: 
	// 			_ui.css = 'ab-component-header ab-ellipses-text';
	// 			break;
	// 
	// 		// description
	// 		case 2:
	// 			_ui.css = 'ab-component-description ab-ellipses-text';
	// 			break;
	// 	}
	// 
	// 	return _ui;
	// }

}