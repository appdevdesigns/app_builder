/*
 * ABViewFormTextbox
 *
 * An ABViewFormTextbox defines a UI text box component.
 *
 */

import ABViewFormField from "./ABViewFormField"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormTextboxPropertyComponentDefaults = {
	type: 'single' // 'single', 'multiple' or 'rich'
}


var ABViewFormTextboxDefaults = {
	key: 'textbox',		// {string} unique key for this view
	icon: 'i-cursor',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.textbox' // {string} the multilingual label key for the class label
}

export default class ABViewFormTextbox extends ABViewFormField {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormTextboxDefaults);

		webix.codebase = "/js/webix/extras/";

		// OP.Multilingual.translate(this, this, ['text']);

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
		return ABViewFormTextboxDefaults;
	}

	///
	/// Instance Methods
	///

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

		var idBase = 'ABViewFormTextboxEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};
		var textView = this.component(App);

		var textUi = textView.ui;
		textUi.id = ids.component;

		var _ui = {
			rows: [
				textUi,
				{}
			]
		};

		var _init = (options) => {

			textView.init(options);

		}

		var _logic = {
		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}


	//// 
	//// Property Editor Interface
	////



    /** 
     * @method propertyEditorFields
     * return an array of webix UI fields to handle the settings of this
     * ABView. 
     * This method should make any modifications to ids, logic, and init
     * as needed to support the new fields added in this routine.
     * @param {App} App  The global App object for the current Application instance
     * @param {obj} ids the id.[name] references to our fields 
     * @param {obj} logic A hash of fn() called by our webix components
     * @return {array}  of webix UI definitions.
     */
	propertyEditorFields(App, ids, _logic) {  
		var components = super.propertyEditorFields(App, ids, _logic); 
        
        var L = App.Label;

        components = components.concat([
			{
				name: 'type',
				view: "radio",
				label: L('ab.component.textbox.type', '*Type'),
				vertical: true,
				options: [
					{ id: 'single', value: L('ab.component.textbox.single', '*Single line') },
					{ id: 'multiple', value: L('ab.component.textbox.multiple', '*Multiple lines') },
					{ id: 'rich', value: L('ab.component.textbox.rich', '*Rich editor') }
				]
			}
		]);


		return components;
	}



    /** 
     * @method propertyEditorDefaultValues
     * return an object of [name]:[value] data to set the your fields to a 
     * default (unused) state.
     * @return {obj}  
     */
    propertyEditorDefaultValues() {
        var defaults = super.propertyEditorDefaultValues();
        for(var d in ABViewFormTextboxPropertyComponentDefaults) {
            defaults[d] = ABViewFormTextboxPropertyComponentDefaults[d];
        }
        return defaults;
    }



    /** 
     * @method propertyEditorInit
     * perform any setup instructions on the fields you are displaying.
     * this is a good time to populate any select lists with data you need to 
     * look up.  
     * @param {App} App  The global App object for the current Application instance
     * @param {obj} ids the id.[name] references to our fields 
     * @param {obj} _logic A hash of fn() called by our webix components
     */
    // propertyEditorInit(App, ids, _logic) {
    // 	super.propertyEditorInit(App, ids, _logic);

    // }



    /** 
     * @method propertyEditorPopulate
     * set the initial values of the fields you are displaying.
     * @param {App} App the common App object shared among our UI components.
     * @param {obj} ids the id.[name] references to our fields 
     * @param {data} data the initial settings data for this object
     */
    propertyEditorPopulate(App, ids, data) {
        super.propertyEditorPopulate(App, ids, data);

        $$(ids.type).setValue(data.type || ABViewFormTextboxPropertyComponentDefaults.type);

    }



    /** 
     * @method propertyEditorValues
     * pull the values from the Propery Editor and store them in our object.
     * @param {obj} ids the id.[name] references to our fields 
     */
    propertyEditorValues(ids) {
        super.propertyEditorValues(ids);

		this.settings.type = $$(ids.type).getValue();
    }



    /** 
     * @method propertyEditorRemove
     * clean up our property editor before it is deleted.
     */
    // propertyEditorRemove() {
    //     super.propertyEditorRemove();
            
    // }



    ////
    //// Live View
    ////



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var component = super.component(App);
		var field = this.field();


		var idBase = this.parentFormUniqueID( 'ABViewFormTextbox_' + this.id + "_f_" );
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		component.ui.id = ids.component;

		switch (this.settings.type || ABViewFormTextboxPropertyComponentDefaults.type) {
			case 'single':
				component.ui.view = "text";
				break;
			case 'multiple':
				component.ui.view = "textarea";
				component.ui.height = 200;
				break;
			case 'rich':
				component.ui.view = 'forminput';
				component.ui.height = 200;
				component.ui.css = "ab-rich-text";
				component.ui.body = {
					view: 'tinymce-editor',
					value: ""
				};
				break;
		}


		component.onShow = () => {

			// WORKAROUND : to fix breaks TinyMCE when switch pages/tabs
			// https://forum.webix.com/discussion/6772/switching-tabs-breaks-tinymce
			if (this.settings.type &&
				this.settings.type == 'rich' &&
				$$(component.ui.id)) {

					// recreate rich editor
					webix.ui(component.ui, $$(component.ui.id));

				}
			}


		return webix.copy(component);
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


};