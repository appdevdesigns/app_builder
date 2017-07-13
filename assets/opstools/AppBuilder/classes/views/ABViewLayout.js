/*
 * ABViewLayout
 *
 * An ABViewLayout defines a UI column layout display component.
 *
 */

import ABView from "./ABView"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var PropertyComponentDefaults = {
	label:'',
	numColumns:1  	// The number of columns for this layout
}


var ABViewDefaults = {
	key: 'layout',		// {string} unique key for this view
	icon:'columns',		// {string} fa-[icon] reference for this view
	labelKey:'ab.components.layout' // {string} the multilingual label key for the class label
}



export default class ABViewLayout extends ABView  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );


  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'viewKey',				// unique key for this View Type
  	// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
  	// 		label:'',					// pulled from translation

	//		settings: {					// unique settings for the type of field
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
	// fromValues (values) {

	// 	super.fromValues(values);

 //    	// if this is being instantiated on a read from the Property UI,
 //    	// .text is coming in under .settings.label
 //    	this.text = values.text || values.settings.text || '*text';

 //    	this.settings.format = this.settings.format || PropertyComponentDefaults.format;

 //    	// we are not allowed to have sub views:
 //    	this._views = [];

 //    	// convert from "0" => 0
 //    	this.settings.format = parseInt(this.settings.format);

	// }



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

		var idBase = 'ABViewLayoutEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component'),
			view: App.unique(idBase + '_view')
		}


		var _init = (options) => {

			if (mode == 'preview') {

				var allComponents = [];

				// attach all the .UI views:
				viewList.forEach((child) => {
					var component = child.component(App);
					var id = ids.view + '_' + child.id;
					component.ui.container = id;
					webix.ui(component.ui);
					allComponents.push(component);
				})

				// perform any init setups for the content:
				allComponents.forEach((component) => {
					component.init();
				})
			}
		}

		var _logic = {

			template:function(obj) {
				if (mode == 'preview') {
					return _template.replace("#objID#", obj.id);
				} else {
					return _templateBlock
						.replace("#objID", obj.id)
						.replace('#icon#', obj.icon)
						.replace('#label#', obj.label);
				}
			},


			viewEdit:(e, id, trg) => {

				var view = this.views(function(v) { return v.id == id; })[0];

				if (!view) return false;

				// NOTE: let webix finish this onClick event, before
				// calling .populateInterfaceWorkspace() which will replace
				// the interface elements with the edited view.  (apparently
				// that causes errors.)
				setTimeout(()=>{
					App.actions.populateInterfaceWorkspace(view);
				}, 50);

				e.preventDefault();
				return false;
			},

			viewDelete:(e, id, trg) => {

				var view = this.views(function(v) { return v.id == id; })[0];

				OP.Dialog.Confirm({
					title: L('ab.interface.component.confirmDeleteTitle','*Delete component'), 
					text: L('ab.interface.component.confirmDeleteMessage', '*Do you want to delete <b>{0}</b>?').replace('{0}', view.label),
					callback: (result) => {
						if (result) {

							this.viewDestroy(view)
							.then(()=>{
								// refresh the editor interface.
								App.actions.populateInterfaceWorkspace(this);
							})
						}
					}
				});
				e.preventDefault();
			}
		} 


		var _template = [
			'<div class="ab-component-in-page">',
				'<div id="'+ids.view+'_#objID#" ></div>',
				'<div class="">',
					'<i class="fa fa-edit ab-component-edit "></i>',
					'<i class="fa fa-trash ab-component-remove "></i>',
				'</div>',
			'</div>'
		].join('');

		var _templateBlock = [
			'<div class="ab-component-in-page">',
				'<div id="'+ids.view+'_#objID#" >',
					'<i class="fa fa-#icon#"></i>',
					'#label#',
				'</div>',
				'<div class="">',
					'<i class="fa fa-edit ab-component-edit"></i>',
					'<i class="fa fa-trash ab-component-remove"></i>',
				'</div>',
			'</div>'
		].join('');


		//// Now setup the UI configuration:
		var _ui = {
			id: ids.component,
			cols: [],
			
		}

		var viewList = this.views();

		if (viewList.length > 0) {
			viewList.forEach((view)=>{
				_ui.cols.push({
					template: _logic.template(view),
					onClick: {
						"ab-component-edit": function (e, id, trg) {
							_logic.viewEdit(e, view.id, trg);
						},
						"ab-component-remove": function (e, id, trg) {
							_logic.viewDelete(e, view.id, trg);
						}
					}
				})
			})
		} else {

			// no views currently defined, so add a placeholder:
			_ui.cols.push({
				id:'del_me',
				view:'label',
				label:L('ab.component.layout.addView', '*Add a View')
			})
		}


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

	static addView (ids, _logic) {

		// get current instance and .addColumn()
		var LayoutView = _logic.currentEditObject();
		LayoutView.addColumn();

		// trigger a save()
		this.propertyEditorSave(ids, LayoutView);
	}


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		

		// if I don't create my own propertyEditorComponent, then I need to 
		// create the onClick handler that will cause the current view instance
		// to create a vew sub view/ column
		if (!_logic.onClick) {
			_logic.onClick = ()=>{
				this.addView(ids, _logic)
			}
		}

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			// [button] : add column
			{
				view: 'button',
				value: L('ab.component.layout.addColumn', '*Add Column '),
				click:_logic.onClick
			}

		]);

	}


	addColumn() {

		this._views.push(ABViewManager.newView({key:ABView.common().key}, this.application, this));

	}


	// static propertyEditorPopulate(ids, view) {

	// 	super.propertyEditorPopulate(ids, view);

	// 	$$(ids.text).setValue(view.text);
	// 	$$(ids.format).setValue(view.settings.format);
	// }


	// static propertyEditorValues(ids, view) {

	// 	super.propertyEditorValues(ids, view);

	// 	view.text  = $$(ids.text).getValue();
	// 	view.settings.format = $$(ids.format).getValue();
	// }


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

		function L(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		var idBase = 'ABViewLayout_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}


		// an ABViewLabel is a simple Label
		var _ui = {
			id: ids.component,
			cols:[]
		}
		

		// insert each of our sub views into our columns:
		viewComponents.forEach((view)=>{

//// TODO: track column widths?
			_ui.cols.push(view.ui);
		})



		// make sure each of our child views get .init() called
		var _init = (options) => {

			viewComponents.forEach((view)=>{
				view.init();
			})

			$$(ids.component).adjust();
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