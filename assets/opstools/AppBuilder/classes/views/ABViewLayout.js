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
				});
				
				// perform any init setups for the content:
				allComponents.forEach((component) => {
					component.init();
				});
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
				'<div class="ab-layout-view-cols" id="'+ids.view+'_#objID#" ></div>',
				'<div class="ab-component-tools ab-layout-view">',
					'<i class="fa fa-trash ab-component-remove "></i>',
					'<i class="fa fa-edit ab-component-edit "></i>',
				'</div>',
				'<div id="'+ids.view+'_#objID#" ></div>',
			'</div>'
		].join('');

		var _templateBlock = [
			'<div class="ab-component-in-page">',
				'<div id="'+ids.view+'_#objID#" >',
					'<i class="fa fa-#icon#"></i>',
					'#label#',
				'</div>',
				'<div class="ab-component-tools ab-layout-view">',
					'<i class="fa fa-trash ab-component-remove"></i>',
					'<i class="fa fa-edit ab-component-edit"></i>',
				'</div>',
				'<div id="'+ids.view+'_#objID#" >',
					'<i class="fa fa-#icon#"></i>',
					'#label#',
				'</div>',
			'</div>'
		].join('');


		//// Now setup the UI configuration:
		// var _ui = {
		// 	type: "space",
		// 	id: ids.component,
		// 	cols: [],
		// }
		// var _ui = {
		// 	type: "space",
		// 	rows: [
		// 		{
		// 			id: ids.component,
		// 			cols: [],
		// 		},
		// 		{}
		// 	]
		// }

		var viewList = this.views();

		if (viewList.length > 0) {
			var _ui = {
				type: "space",
				id: ids.component,
				cols: [],
			}

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
			var _ui = {
				type: "space",
				rows: [
					{
						id: ids.component,
						cols: [],
					},
					{}
				]
			}

			// no views currently defined, so add a placeholder:
			_ui.rows[0].cols.push({
				id:'del_me',
				view:'label',
				align:'center',
				label:L('ab.component.layout.addView', '*Add a column from the properties panel.')
			});
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


	/*
	 * @function addView
	 * called when the .propertyEditorDefaultElements() button is clicked.
	 * This method should find the current View instance and call it's .addColumn()
	 * method.
	 */
	static addView (ids, _logic) {

		// get current instance and .addColumn()
		var LayoutView = _logic.currentEditObject();
		LayoutView.addColumn();

		// trigger a save()
		this.propertyEditorSave(ids, LayoutView);
	}



	/*
	 * @function propertyEditorDefaultElements
	 * return the input form used in the property editor for this View.
	 */
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


	/*
	 * @function addColumn
	 * method to actually add a new ABView as one of our columns.
	 * This is called by the static .addView() method.
	 */
	addColumn() {

		this._views.push(ABViewManager.newView({key:ABView.common().key}, this.application, this));

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

		function L(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		var idBase = 'ABViewLayout_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}


		// an ABViewLayout is a container with X number of columns
		var _ui = {
			id: ids.component,
			// type: "space",
			cols:[]
		}
		
		if (viewComponents.length > 0) {
			// insert each of our sub views into our columns:
			viewComponents.forEach((view)=>{

	//// TODO: track column widths?
				_ui.cols.push(view.ui);
			});
		} else {
			_ui.cols.push({
				view: "label",
				label: L('ab.interface.component.noColumnsYet','*No columns have been added yet.')
			});
		}



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


// NOTE: to keep things simple at the moment: the layout view will return 
// it's parent's list of components that are able to be dropped upon it.  
// however, when a layout is in the editor at the time, no component will be
// dropped onto the layout view.  The editor only allows [add] ing a new 
// column.  When you edit the column, you can then drop components onto that 
// view.


		// the layout view doesn't care what components are offered, it get's 
		// the list from it's parent view.
		// ## NOTE: layout views should not be root views.
		if (this.parent) {
			return this.parent.componentList();
		} else { 
			return [];  // really shouldn't get here!
		}
	}


}

