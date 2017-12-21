/*
 * ABViewDetailTree
 *
 * An ABViewDetailTree defines a UI string component in the detail component.
 *
 */

import ABViewDetailComponent from "./ABViewDetailComponent"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDetailPropertyComponentDefaults = {
}


var ABViewDetailTreeDefaults = {
	key: 'detailtree',	// {string} unique key for this view
	icon: 'sitemap',	// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail.tree' // {string} the multilingual label key for the class label
}


export default class ABViewDetailTree extends ABViewDetailComponent {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailTreeDefaults);

	}


	static common() {
		return ABViewDetailTreeDefaults;
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

		var idBase = 'ABViewDetailTreeEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var elem = this.component(App).ui;
		elem.id = ids.component;

		var _ui = {
			rows: [
				elem,
				{}
			]
		};

		var _init = (options) => {
		}

		var _logic = {
		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
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
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

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
		var detailView = this.detailComponent();

		var idBase = 'ABViewDetailTree_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		};
		var className = 'ab-detail-tree';


		component.ui.id = ids.component;


		var _init = (options) => {

			component.init(options);


			// add div of tree to detail
			var divTree = '<div class="#className#"></div>'.replace("#className#", className);
			component.logic.setValue(ids.component, divTree);

		};

		var _logic = {

			getDomTree: () => {
				var elem = $$(ids.component);
				if (!elem) return;

				return elem.$view.getElementsByClassName(className)[0];
			},

			setValue: (val) => {

				// convert value to array
				if (val != null && !(val instanceof Array)) {
					val = [val];
				}
				
				setTimeout(function(){ 
					// get tree dom
					var domTree = _logic.getDomTree();
					
					if (!domTree) return false;
					
				    var branches = [];
				    if (typeof field.settings.options.data == "undefined") {
				        field.settings.options = new webix.TreeCollection({ data:field.settings.options });        
				    }
				    
				    field.settings.options.data.each( function(obj){
				        if (val != null && val.indexOf(obj.id) != -1) {
				            var html = "";
				            
				            var rootid = obj.id;
				            while (this.getParentId(rootid)) {
				              field.settings.options.data.each( function(par){
				                if (field.settings.options.data.getParentId(rootid) == par.id) {
				                  html = par.text + ": " + html;
				                }
				              });
				              rootid = this.getParentId(rootid);
				            }

				            html += obj.text;
				            branches.push(html);
				        }
				    });

				    var myHex = "#4CAF50";
				    var nodeHTML = "<div class='list-data-values'>";
				    branches.forEach(function(item) {
				      nodeHTML += '<span class="selectivity-multiple-selected-item rendered" style="background-color:' + myHex + ' !important;">' + item + '</span>';          
				    });
				    nodeHTML += "</div>";
				    domTree.innerHTML = nodeHTML;
					
					var height = 33;
					if (domTree.scrollHeight > 33)
						height = domTree.scrollHeight;
					
					$$(ids.component).config.height = height;
					$$(ids.component).resize();

				}, 50);
			    
			}

		};

		return {
			ui: component.ui,

			init: _init,
			logic: _logic
		};
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


}