/*
 * ABViewFormText
 *
 * An ABViewFormText defines a UI label display component.
 *
 */

// import ABView from "./ABView"
import ABViewFormComponent from "./ABViewFormComponent"
// import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var PropertyComponentDefaults = {
	label:'',
	useFormDefaults:1,
	labelPosition:'side',
	labelAlignment: 'left',  // or 'right'
	labelWidth:''

}


var ABViewDefaults = {
	key: 'form.text',		// {string} unique key for this view
	icon:'font',		// {string} fa-[icon] reference for this view
	labelKey:'ab.components.form.text' // {string} the multilingual label key for the class label
}



export default class ABViewFormText extends ABViewFormComponent  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );

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

		this.settings.useFormDefaults = this.settings.useFormDefaults || PropertyComponentDefaults.useFormDefaults;
		this.settings.labelPosition = this.settings.labelPosition || PropertyComponentDefaults.labelPosition;
		this.settings.labelAlignment = this.settings.labelAlignment || PropertyComponentDefaults.labelAlignment;
		this.settings.labelWidth = this.settings.labelWidth || PropertyComponentDefaults.labelWidth;

    	// we are not allowed to have sub views:
    	this._views = [];

    	// convert from "0" => 0
		this.settings.useFormDefaults = parseInt(this.settings.useFormDefaults);
		if (this.settings.labelWidth != '') {
			this.settings.labelWidth = parseInt(this.settings.labelWidth);
		}

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

		var name = this.formLabel;  // default for name if no fieldPointer set

		if (this.settings.fieldPointer) {

			// get the field object we are connected to:
			var field = this.application.urlResolve(this.settings.fieldPointer);
			name = field.columnName;
		}

		var _ui = {
			view:"text", 
			value:"", 
			name:name,    // get this from the attached DataField
			label:this.formLabel
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


	/*
	 * uiFormatting
	 * a common routine to properly update the displayed text box
	 * UI with the formatting for the given .settings
	 * @param {obj} _ui the current webix.ui definition
	 * @return {obj} a properly formatted webix.ui definition
	 */
	uiFormatting(_ui) {

		if (!this.settings.useFormDefaults) {
			
			if (this.settings.labelPosition == 'top') {
				_ui.labelPosition = 'top';
			}
			
			_ui.labelAlignment = this.settings.labelAlignment;
		
			if (this.settings.labelWidth != '') {
				_ui.labelWidth = this.settings.labelWidth;
			}

		}

		// let the form component specify .elementsConfig for it's child
		// components.
		return _ui;
	}


	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		// grab the default ABViewFormComponent editor entries:
		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			// .text :  The Text displayed for this label
			{
				view: "checkbox",
				name:'useFormDefaults',
				labelRight: L('ab.component.form.text.useFormDefaults', '*use form defaults'),
				on:{
					onChange:function(newVal, oldVal) {

						if (newVal) {
							$$(ids.labelPosition).disable();
							$$(ids.labelAlignment).disable();
						} else {
							$$(ids.labelPosition).enable();
							$$(ids.labelAlignment).enable();
						}

						return true;  // to run default onChange()
					}
				}
				// placeholder: L('ab.component.form.text.labelPlaceholder', '*label Placeholder'),
				// labelWidth: App.config.labelWidthMedium,
			},
			{
			    view:"select", 
			    name:'labelPosition',
			    label: L('ab.component.form.text.labelPosition', '*position'), 
			    options:[
			        { "id":'side', "value":L('ab.component.form.text.labelPosition.side', '*side') },
			        { "id":'top', "value":L('ab.component.form.text.labelPosition.top', '*top') }
			    ]
			},
			{
			    view:"select", 
			    name:'labelAlignment',
			    label: L('ab.component.form.text.labelAlignment', '*label alignment'), 
			    options:[
			        { "id":'left', "value":L('ab.component.form.text.labelAlignment.left', '*left') },
			        { "id":'right', "value":L('ab.component.form.text.labelAlignment.right', '*right') }
			    ]
			}
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
		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.useFormDefaults).setValue(view.settings.useFormDefaults);
		$$(ids.labelPosition).setValue(view.settings.labelPosition);
		$$(ids.labelAlignment).setValue(view.settings.labelAlignment);


		if (view.settings.useFormDefaults) {
			$$(ids.labelPosition).disable();
			$$(ids.labelAlignment).disable();
		} else {
			$$(ids.labelPosition).enable();
			$$(ids.labelAlignment).enable();
		}
		// $$(ids.format).setValue(view.settings.format);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.useFormDefaults  = $$(ids.useFormDefaults).getValue();
		view.settings.labelPosition    = $$(ids.labelPosition).getValue();
		view.settings.labelAlignment    = $$(ids.labelAlignment).getValue();

		// view.settings.format = $$(ids.format).getValue();
	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var component = super.component(App);
		var field = this.field();

		var idBase = 'ABViewFormText_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}

		var name = this.formLabel; // default to the formLabel

		// if a fieldPointer is set, then use columnName for name:
		if ( this.settings.fieldPointer) {
			var field = this.application.urlResolve(this.settings.fieldPointer);
			name = field.columnName;
		}
		
		// an ABViewFormText is a simple text input
		var _ui = {
			id: ids.component,
			view: 'text',
			name:name,    // get this from the attached DataField
			
			// css: 'ab-component-header ab-ellipses-text',
			label: this.formLabel || '* formLabel'
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
	 * in the case of a Form Text field => no components.
	 */
	componentList() {
		return [];
	}


}



//// LEFT OFF:
// trace down the onChange() handling for the property Editor
// layout component: should show parent's form fields
// initial layout componet should have column size 1 / or a default height.

