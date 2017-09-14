/*
 * ABViewDataSource
 *
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewPropertyComponentDefaults = {
}


var ABViewDefaults = {
	key: 'datasource',		// {string} unique key for this view
	icon: 'database',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.datasource' // {string} the multilingual label key for the class label
}

export default class ABViewDataSource extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		// OP.Multilingual.translate(this, this, ['label']);

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
     * @method save()
     *
     * persist this instance of ABViewDataSource with it's parent
     *
     *
     * @return {Promise}
     *         .resolve( {this} )
     */
	save() {
		return new Promise(
			(resolve, reject) => {

				// if this is our initial save()
				if (!this.id) {
					this.id = OP.Util.uuid();   // setup default .id
				}

				var parent = this.parentPage;

				parent.dataSourceSave(this)
					.then(resolve)
					.catch(reject);
			}
		)
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

		var idBase = 'ABViewDataSourceEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};

		var _ui = {
		};

		var _init = (options) => {
		};

		var _logic = {
		};

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

		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.datasource.dataSource', '*Data Source:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					rows: [
						{
							view: "select",
							name: "dataSource",
							label: L('ab.component.label.dataSource', '*Object:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							on: {
								onChange: function (newv, oldv) {
									// if (newv != oldv) {
									// 	_logic.newObject();
									// 	$$(ids.linkedObject).setValue("");
									// 	$$(ids.linkedField).setValue("");
									// 	$$(ids.linkedPage).setValue("");
									// 	$$(ids.linkedPageView).setValue("");
									// 	$$(ids.linkedEditPage).setValue("");
									// 	$$(ids.linkedEditPageForm).setValue("");
									// }
								}
							}
						},
						{
							view: "select",
							name: "linkedObject",
							label: L('ab.component.label.linkedObject', '*Linked To:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							// hidden: 1,
							on: {
								onChange: function (newv, oldv) {
									// if (newv != oldv) {
									// 	$$(ids.linkedField).setValue("");
									// }
								}
							}
						},
						{
							view: "select",
							name: "linkedField",
							label: L('ab.component.label.linkedField', '*Linked Field:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							hidden: 1
						}
					]
				}
			},
			{
				view: "fieldset",
				label: L('ab.component.label.customizeDisplay', '*Customize Display:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.label.filterData", "*Filter Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									// id: ids.buttonFilter,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										// _logic.toolbarFilter(this.$view);
									}
								}
							]
						},
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.label.sortData", "*Sort Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									label: L("ab.component.label.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										// _logic.toolbarSort(this.$view);
									}
								}
							]
						}
					]
				}
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

	}


	/**
	* @method component()
	* return a UI component based upon this view.
	* @param {obj} App 
	* @return {obj} UI component
	*/
	component(App) {

		var _ui = {
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		};

		return {
			ui: _ui,
			init: _init
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