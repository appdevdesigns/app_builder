/*
 * ABViewMenu
 *
 * An ABViewMenu defines a UI menu component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewMenuPropertyComponentDefaults = {
	orientation: 'x'
}


var ABMenuDefaults = {
	key: 'menu',		// {string} unique key for this view
	icon: 'th-list',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.menu' // {string} the multilingual label key for the class label
}


export default class ABViewMenu extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABMenuDefaults);

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
		return ABMenuDefaults;
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
	toObj() {

	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

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

		var idBase = 'ABViewMenuEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component'),
			pages: App.unique(idBase + '_pages')
		}


		var _ui = {
			rows: [
				{
					id: ids.component,
					view: "menu",
					layout: (this.settings && this.settings.orientation) || 'x',
					autoheight: true,
					minWidth: 500,
					datatype: "json"
				},
				{}
			]
		};

		if (mode == 'block') {
			_ui.rows = _ui.rows.concat([
				{
					view: 'label',
					label: 'Page list'
				},
				{
					id: ids.pages,
					view: 'tree',
					template: function (item, common) {
						return ("<div class='ab-page-list-item'>" +
							"{common.icon()} " +

							// TODO : Hide checkbox at own page
							// (item.id == AD.classes.AppBuilder.currApp.currPage.id ?
							(false ?
								'<input type="checkbox" class="webix_tree_checkbox" disabled="disabled">' :
								"{common.checkbox()} ") +

							"{common.folder()} #label#" +
							"</div>")
							.replace('{common.icon()}', common.icon(item))
							.replace('{common.checkbox()}', common.checkbox(item, false))
							.replace('{common.folder()}', common.folder(item))
							.replace('#label#', item.label);
					},
					on: {
						onItemCheck: function () {
							var selectedPages = $$(ids.pages).getChecked().map((pageId) => {

								return {
									id: pageId,
									label: $$(ids.pages).getItem(pageId).label
								}

							});

							_logic.updateMenuItems(selectedPages);
						}
					}
				}
			]);
		}


		var _init = (options) => {

			if (mode == 'block') {

				_logic.updatePageList(this.parent);

			}

		}

		var _logic = {

			updatePageList: (pageParent) => {
				let pageChildren = pageParent.views((v) => v.key == "page");

				let pageItems = [],
					parentItem = {
						id: pageParent.id,
						label: pageParent.label,
						data: []
					};

				pageItems.push(parentItem);

				$$(ids.pages).clearAll();
				$$(ids.pages).parse(pageItems);
				$$(ids.pages).openAll();
			},

			updateMenuItems: (selectedPages) => {
				$$(ids.component).clearAll();

				selectedPages.forEach((page) => {

					$$(ids.component).add({
						id: page.id,
						value: page.label
					}, $$(ids.component).count());

				});

			}
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
			{
				name: 'orientation',
				view: "richselect",
				label: L('ab.component.menu.orientation','*Orientation'),
				value: ABViewMenuPropertyComponentDefaults.orientation,
				options: [
					{ id: 'x', value: L('ab.component.menu.horizontal','*Horizontal') },
					{ id: 'y', value: L('ab.component.menu.vertical','*Vertical') }
				]
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.orientation).setValue(view.settings.orientation);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.orientation = $$(ids.orientation).getValue();

	}



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABMenuLabel_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		var _ui = {
			id: ids.component,
			view: "menu",
			autoheight: true,
			minWidth: 500,
			datatype: "json"
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
			// TODO: populate menu items
			$$(ids.component).define('data', [
				{ id: 1, value: 'TEST' }
			]);
		}


		return {
			ui: _ui,
			init: _init
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


};