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
	icon: 'th-large',		// {string} fa-[icon] reference for this view
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

		var component = this.component(App);

		var menu = component.ui;
		menu.id = ids.component;

		var _ui = {
			rows: [
				menu,
				{}
			]
		};

		var _init = (options) => {

			this.AddPagesToView(this.application, $$(ids.component), this.settings.pages);

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


		return commonUI.concat([
			{
				name: 'orientation',
				view: "richselect",
				label: L('ab.component.menu.orientation', '*Orientation'),
				value: ABViewMenuPropertyComponentDefaults.orientation,
				options: [
					{ id: 'x', value: L('ab.component.menu.horizontal', '*Horizontal') },
					{ id: 'y', value: L('ab.component.menu.vertical', '*Vertical') }
				]
			},
			{
				view: 'label',
				label: 'Page list',
				height: 20
			},
			{
				name: "pages",
				view: 'tree',
				template: function (item, common) {
					return ("<div class='ab-page-list-item'>" +
						"{common.icon()} " +

						// TODO : Hide checkbox at own page
						// (item.id == _logic.currentEditObject().parent.id ?
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
						// trigger to save settings
						_logic.onChange();
					}
				}
			}
		]);


	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.orientation).setValue(view.settings.orientation || ABViewMenuPropertyComponentDefaults.orientation);

		var pageTree = new webix.TreeCollection();
		var currentPage = view.pageParent();

		// Add parent of current page
		if (currentPage.parentPage)
			pageTree.add(currentPage.parentPage);

		// Add current page
		pageTree.add(currentPage, 0, (currentPage.parentPage ? currentPage.parentPage.id : null));

		// get sub-pages of parent
		currentPage.pages().forEach((page, index) => {
			pageTree.add(page, index, currentPage.id);
		});

		$$(ids.pages).clearAll();
		$$(ids.pages).data.unsync();
		$$(ids.pages).data.sync(pageTree);
		$$(ids.pages).refresh();
		$$(ids.pages).openAll();

		// Select pages
		if (view.settings.pages && view.settings.pages.forEach) {
			view.settings.pages.forEach((pageId) => {

				if ($$(ids.pages).exists(pageId))
					$$(ids.pages).checkItem(pageId);

			});
		}
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.orientation = $$(ids.orientation).getValue();
		view.settings.pages = $$(ids.pages).getChecked() || [];

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
			datatype: "json",
			layout: this.settings.orientation || ABViewMenuPropertyComponentDefaults.orientation
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {

			this.AddPagesToView(this.application, $$(ids.component), this.settings.pages);

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



	AddPagesToView(parent, domNode, pageIds) {

		if (!parent || !parent.pages || !domNode || !pageIds) return;

		var pages = parent.pages() || [];

		pages.forEach((page) => {

			if (pageIds.indexOf(page.id) > -1){
				domNode.add({
					id: page.id,
					value: page.label
				});
			}

			this.AddPagesToView(page, domNode, pageIds);

		});

		domNode.refresh();
	}


};