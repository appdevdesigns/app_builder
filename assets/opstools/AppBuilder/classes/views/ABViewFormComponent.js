/*
 * ABViewFormText
 *
 * An ABViewFormComponent defines a UI component that is intended to be part of
 * a form.   These components are tied to an Object's data field.
 *
 */

import ABViewWidget from "./ABViewWidget"
// import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var PropertyComponentDefaults = {
	label:'',
}


var ABViewDefaults = {
	key: 'form.component',		// {string} unique key for this view
	icon:'font',		// {string} fa-[icon] reference for this view
	labelKey:'ab.components.form.component' // {string} the multilingual label key for the class label
}



export default class ABViewFormComponent extends ABViewWidget  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
    constructor(values, application, parent, defaults) {

    	super( values, application, parent, defaults );

    	OP.Multilingual.translate(this, this, ['formLabel']);

  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'viewKey',				// unique key for this View Type
  	// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
  	// 		label:'',					// pulled from translation
  	//		formLabel:''				// [multilingual] the label that is displayed on the UI

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


  	static newInstance (application, parent) {
  		return new this({}, application,parent);
 // console.error('ABViewFormComponent.newInstance()  should be overridden by its child component.');
 // return null;
  	}




	///
	/// Instance Methods
	///


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABViewFormText instance
	 * into the values needed for saving.
	 *
	 * @return {json}
	 */
	toObj () {

		OP.Multilingual.unTranslate(this, this, ['label', 'formLabel']);

		var obj = super.toObj();
		obj.views = [];			// no subviews
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
    	this.formLabel = values.formLabel || values.settings.formLabel || '**formLabel';

// this.settings.format = this.settings.format || PropertyComponentDefaults.format;

    	// we are not allowed to have sub views:
    	this._views = [];

    	// convert from "0" => 0
// this.settings.format = parseInt(this.settings.format);

	}


	fieldPointer(pointer) {
		this.settings.fieldPointer = pointer;
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

		var idBase = 'ABViewFormTextEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component')
		}

// var field = this.application.objectFromURL(this.settings.dataFieldURL);
var field = { columnName:'columnNameToDo'}

		var _ui = {
			view:"text", 
			value:"", 
			name:field.columnName,    // get this from the attached DataField
			label:this.formLabel, 
			inputAlign:"left", 
    		labelAlign:"left"
    	}

		_ui = this.uiFormatting(_ui)


		var _init = (options) => {
		}

		// var _logic = {
		// } 

		return {
			ui:_ui,
			init:_init
		}
	}



	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		// in addition to the common .label  values, we 
		// ask for:
		return [

			// .text :  The Text displayed for this label
			{
				view: "text",
				name:'formLabel',
				label: L('ab.component.form.text.label', '*Label'),
				placeholder: L('ab.component.form.text.labelPlaceholder', '*label Placeholder'),
				// labelWidth: App.config.labelWidthMedium,
			},
			// { 
			// 	view: "fieldset", 
			// 	label: L('ab.component.label.formatting','*format options:'), 
			// 	body:{
			//         rows:[
			// 			{
			// 				view: "radio", 
			// 				name: "format",
			// 				vertical: true,
			// 				value: PropertyComponentDefaults.format, 
			// 				options:[
			// 					{ id:0, value: L('ab.component.label.formatting.normal','*normal') },
			// 					{ id:1, value: L('ab.component.label.formatting.title','*title')  },
			// 					{ id:2, value: L('ab.component.label.formatting.description','*description') }
			//         		]
			//         	}
			//         ]
		 //    	}
		 //    }
		];

	}


	static propertyEditorPopulate(App, ids, view) {

		$$(ids.formLabel).setValue(view.formLabel);
	}


	static propertyEditorValues(ids, view) {

		view.formLabel  = $$(ids.formLabel).getValue();
	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {


		var idBase = 'ABViewFormText_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}


		// an ABViewFormText is a simple text input
		var _ui = {
			id: ids.component,
			view: 'text',
			// css: 'ab-component-header ab-ellipses-text',
			label: this.formLabel || '* formLabel'
		}
		// _ui = this.uiFormatting(_ui)


		// make sure each of our child views get .init() called
		var _init = (options) => {
		}


		return {
			ui:_ui,
			init:_init
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 * in the case of a Form Text field => no components.
	 */
	componentList() {
		return [];
	}


	/*
	 * uiFormatting
	 * a common routine to properly update the displayed label
	 * UI with the css formatting for the given .settings
	 * @param {obj} _ui the current webix.ui definition
	 * @return {obj} a properly formatted webix.ui definition
	 */
	// uiFormatting(_ui) {

	// 	// add different css settings based upon it's format 
	// 	// type.
	// 	switch(parseInt(this.settings.format)) {

	// 		// normal
	// 		case 0: 
	// 			break;

	// 		// title
	// 		case 1: 
	// 			_ui.css = 'ab-component-header ab-ellipses-text';
	// 			break;

	// 		// description
	// 		case 2:
	// 			_ui.css = 'ab-component-description ab-ellipses-text';
	// 			break;
	// 	}

	// 	return _ui;
	// }

}



/*

var ABViewPropertyComponent = new ABPropertyComponent({

	editObject: ABView,
	
	fieldDefaults: ABViewDefaults,

	elements:(App, field) => {

		var ids = {
			imageWidth: '',
			imageHeight: ''
		}
		ids = field.idsUnique(ids, App);

		return []
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: PropertyComponentDefaults,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules:{
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these: 
	// 	@param {obj} ids  the list of ids used to generate the UI.  your 
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here	
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, ABField) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic:{

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init:function(ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

})

*/
