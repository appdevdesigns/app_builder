/*
 * ABViewLabel
 *
 * An ABViewLabel defines a UI label display component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewLabelPropertyComponentDefaults = {
	label:'',
	format:0  	// 0 - normal, 1 - title, 2 - description
}


var ABViewDefaults = {
	key: 'label',		// {string} unique key for this view
	icon:'font',		// {string} fa-[icon] reference for this view
	labelKey:'ab.components.label' // {string} the multilingual label key for the class label
}



export default class ABViewLabel extends ABView  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );

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
	toObj () {

		OP.Multilingual.unTranslate(this, this, ['label', 'text']);

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
	fromValues (values) {

		super.fromValues(values);

    	// if this is being instantiated on a read from the Property UI,
    	// .text is coming in under .settings.label
    	this.text = values.text || values.settings.text || '*text';

    	this.settings.format = this.settings.format || ABViewLabelPropertyComponentDefaults.format;

    	// we are not allowed to have sub views:
    	this._views = [];

    	// convert from "0" => 0
    	this.settings.format = parseInt(this.settings.format);

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

		var idBase = 'ABViewLabelEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component')
		}


		var _ui = {
			id: ids.component,
			view: 'label',
			// css: 'ab-component-header ab-ellipses-text',
			label: this.text || ''
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

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			// .text :  The Text displayed for this label
			{
				view: "text",
				name:'text',
				label: L('ab.component.label.text', '*Text'),
				placeholder: L('ab.component.label.textPlaceholder', '*Text Placeholder'),
				// labelWidth: App.config.labelWidthMedium,
			},
			{ 
				view: "fieldset", 
				label: L('ab.component.label.formatting','*format options:'), 
				body:{
			        rows:[
						{
							view: "radio", 
							name: "format",
							vertical: true,
							value: ABViewLabelPropertyComponentDefaults.format, 
							options:[
								{ id:0, value: L('ab.component.label.formatting.normal','*normal') },
								{ id:1, value: L('ab.component.label.formatting.title','*title')  },
								{ id:2, value: L('ab.component.label.formatting.description','*description') }
			        		]
			        	}
			        ]
		    	}
		    }
		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.text).setValue(view.text);
		$$(ids.format).setValue(view.settings.format);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.text  = $$(ids.text).getValue();
		view.settings.format = $$(ids.format).getValue();
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


		var idBase = 'ABViewLabel_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}


		// an ABViewLabel is a simple Label
		var _ui = {
			id: ids.component,
			view: 'label',
			// css: 'ab-component-header ab-ellipses-text',
			label: this.text || '*'
		}
		_ui = this.uiFormatting(_ui)


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
	uiFormatting(_ui) {

		// add different css settings based upon it's format 
		// type.
		switch(parseInt(this.settings.format)) {

			// normal
			case 0: 
				break;

			// title
			case 1: 
				_ui.css = 'ab-component-header ab-ellipses-text';
				break;

			// description
			case 2:
				_ui.css = 'ab-component-description ab-ellipses-text';
				break;
		}

		return _ui;
	}

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
	defaultValues: ABViewLabelPropertyComponentDefaults,

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