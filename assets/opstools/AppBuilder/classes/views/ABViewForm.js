/*
 * ABViewForm
 *
 * An ABViewForm is an ABView that allows you to choose an object and create 
 * special form controls for each of the Object's properties.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewManager from "../ABViewManager"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var PropertyComponentDefaults = {
	label:''
}


var ABViewDefaults = {
	key: 'form',		// {string} unique key for this view
	icon:'list',		// {string} fa-[icon] reference for this view
	labelKey:'ab.components.form' // {string} the multilingual label key for the class label
}



export default class ABViewForm extends ABView  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );

//OP.Multilingual.translate(this, this, ['text']);

  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'viewKey',				// unique key for this View Type
  	// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
  	// 		label:'',					// pulled from translation

	//		settings: {					// unique settings for the type of field
	//			object: [object.id]				// the display style of the text
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
	// toObj () {

	// 	OP.Multilingual.unTranslate(this, this, ['label', 'text']);

	// 	var obj = super.toObj();
	// 	obj.views = [];
	// 	return obj;
	// }


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

		super.fromValues(values);

    	
    	this.settings.object = this.settings.object || 'none';
    	this.settings.linkedTo = this.settings.linkedTo || 'none';
    	this.settings.linkField = this.settings.linkField || 'none';

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
	// editorComponent(App, mode) {

	// 	var idBase = 'ABViewLabelEditorComponent';
	// 	var ids = {
	// 		component: App.unique(idBase+'_component')
	// 	}


	// 	var _ui = {
	// 		id: ids.component,
	// 		view: 'label',
	// 		// css: 'ab-component-header ab-ellipses-text',
	// 		label: this.text || ''
	// 	}
	// 	_ui = this.uiFormatting(_ui)


	// 	var _init = (options) => {
	// 	}

	// 	// var _logic = {
	// 	// } 

	// 	return {
	// 		ui:_ui,
	// 		init:_init
	// 	}
	// }



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

			{ 
				view: "label",
				label: L('ab.components.form.dataSource', "*Data source"),
			},

			{
				view: 'richselect',
				name: 'object',
				label: L('ab.components.form.object', "*Object"),
				options:[
					{ id:'none', value:L('ad.components.form.selectObject', '*[Select]') }
				]
			},

			{
				view: 'richselect',
				name: 'linkedTo',
				label: L('ab.components.form.linkedTo', "*Linked to"),
				options: [
					{ id:'none', value: "["+App.labels.none+"]" }
				]
			},

			{
				view: 'richselect',
				name: 'linkField',
				label: L('ab.components.form.linkField', "*Link field"),
				options:[
					{ id:'none', value:'' }
				]
			}
		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		// get the list of all objects:
		var allObjects = view.application.objects();
		var options = [];
		allObjects.forEach((o)=>{
			options.push({id:o.id, value:o.label });
		})


		// translate this list into the object selection options:
		var objectOptions = [
			{ id:'none', value:L('ad.components.form.selectObject', '*[Select]') }
		];
		objectOptions = objectOptions.concat(options);
		var objectList = $$(ids.object).getList();
		objectList.clearAll(); //delete old data
		objectList.parse(objectOptions);

		// set the default value for the object entry:
		$$(ids.object).setValue(view.settings.object);


		// translate the object list into 
		if (view.settings.object != 'none') {
// TODO: find the objects linked to the selected view.settings.object
// and populate the .linkedTo list with these objects.			
		}
		$$(ids.linkedTo).setValue(view.settings.linkedTo);


		$$(ids.linkField).setValue(view.settings.linkField);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		var fields = ['object', 'linkedTo', 'linkField'];
		fields.forEach((f)=>{
			view.settings[f] = $$(ids[f]).getValue();
		})
	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	// component(App) {

	// 	// get a UI component for each of our child views
	// 	var viewComponents = [];
	// 	this.views().forEach((v)=>{
	// 		viewComponents.push(v.component(App));
	// 	})


	// 	var idBase = 'ABViewLabel_'+this.id;
	// 	var ids = {
	// 		component: App.unique(idBase+'_component'),
	// 	}


	// 	// an ABViewLabel is a simple Label
	// 	var _ui = {
	// 		id: ids.component,
	// 		view: 'label',
	// 		// css: 'ab-component-header ab-ellipses-text',
	// 		label: this.text || '*',
	// 		type: {
	// 			height: "auto"
	// 		}
	// 	}
	// 	_ui = this.uiFormatting(_ui)


	// 	// make sure each of our child views get .init() called
	// 	var _init = (options) => {
	// 	}


	// 	return {
	// 		ui:_ui,
	// 		init:_init
	// 	}
	// }


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 * A Form component only displays a few  of the common components, and a component
	 * for each of the linked object's fields 
	 * @param {bool} isEdited  is this component currently in the Interface Editor
	 * @return {array} of ABView objects.
	 */
	componentList( isEdited ) {
		var viewsAllowed = [ 'label', 'layout'];

		var allComponents = ABViewManager.allViews();
		var allowedComponents = allComponents.filter((c)=>{
			return (viewsAllowed.indexOf(c.common().key) != -1)
		});

		if (this.settings.object != 'none') {

			// get the object
			var object = this.application.objectByID(this.settings.object);
			if (object) {

				// get a form component from each of it's fields:
				var fields = object.fields();
				fields.forEach((f)=>{
//// LEFT OFF HERE:
					allowedComponents.push(f.formComponent());
				})
			}
		}

		
		return allowedComponents;
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