/*
 * ABViewMenu
 *
 * An ABViewMenu defines a UI menu component.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewMenuPropertyComponentDefaults = {
	orientation: 'x',
	buttonStyle: 'ab-menu-default',
	// [
	// 		{
	//			pageId: uuid,
	//			isChecked: bool,
	//			aliasname: string,
	//			translations: []
	//		}
	// ]
	pages: []
}


var ABMenuDefaults = {
	key: 'menu',		// {string} unique key for this view
	icon: 'th-large',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.menu' // {string} the multilingual label key for the class label
}


export default class ABViewMenu extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABMenuDefaults);

		OP.Multilingual.translate(this, this, ['menulabel']);

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
	toObj () {
		
		if (this.settings.pages) {
			this.settings.pages.forEach(page => {
				OP.Multilingual.unTranslate(page, page, ["aliasname"]);
			});
		}
		
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

		this.settings.pages = this.settings.pages || ABViewMenuPropertyComponentDefaults.pages;

		for (var i = 0; i < this.settings.pages.length; i++) {

			var page = this.settings.pages[i];
			if (page instanceof Object) {
				page.isChecked = JSON.parse(page.isChecked || false);
				page.translations = OP.Multilingual.translate(page, page, ["aliasname"]);
			}
			// Compatible with old data
			else if (typeof page == 'string') {
				this.settings.pages[i] = {
					pageId: page,
					isChecked: true
				};
			}
			
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

		var idBase = 'ABViewMenuEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component'),
			pages: App.unique(idBase + '_pages')
		}

		var component = this.component(App);

		var menu = component.ui;
		menu.id = ids.component;
		menu.rows[0].drag = true;
		menu.rows[0].id = ids.component;
		menu.rows[0].on = {
			onAfterDrop: (context, native_event) => {
				var newOrder = context.from.data.order.slice(0)
				this.settings.pages = newOrder;
				this.save();
			}
		}

		var _ui = {
			type: "space",
			rows: [
				menu,
				{
					view: "label",
					label: "Drag and drop menu items to reorder.",
					align: "center"
				},
				{}
			]
		};

		var _init = (options) => {

			var Menu = $$(ids.component);

			this.ClearPagesInView(Menu);
			if (this.settings.pages && this.settings.pages.length > -1) {
				var orderMenu = [];
				var orderMenu = this.AddPagesToView(this.application, Menu, this.settings.pages, orderMenu);
				this.AddOrderedPagesToView(this.application, Menu, this.settings.pages, orderMenu);
			}

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
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'x', value: L('ab.component.menu.horizontal', '*Horizontal') },
					{ id: 'y', value: L('ab.component.menu.vertical', '*Vertical') }
				]
			},
			{
				name: 'buttonStyle',
				view: "richselect",
				label: L('ab.component.menu.buttonStyle', '*Button Style'),
				value: ABViewMenuPropertyComponentDefaults.buttonstyle,
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'ab-menu-default', value: L('ab.component.menu.defaulButton', '*Default') },
					{ id: 'ab-menu-link', value: L('ab.component.menu.linkeButton', '*Link') }
				]
			},
			{
				name: "pagesFieldset",
				view: "fieldset",
				label: L('ab.component.menu.pageList', '*Page List:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					rows: [
						{
							name: "pages",
							view: 'edittree',
							borderless: true,
							css: "transparent",
							editor: "inline-text",
							editable: true,
							editValue: "aliasname",
							editor: "text",
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
									.replace('#label#', item.aliasname ? item.aliasname : item.label);
							},
							on: {
								onItemCheck: function () {
									// trigger to save settings
									_logic.onChange();
								},
								onBeforeEditStart: function(id) {
									var item = this.getItem(id);
									if(!item.aliasname) {
										item.aliasname = item.label;
										this.updateItem(item);
									}
								},
								onBeforeEditStop: function(state, editor) {
									var item = this.getItem(editor.id);
									if(item) {
										item.aliasname = state.value;
										this.updateItem(item);
									}
									_logic.onChange();
								}
							}
						}
					]
				}
			}
		]);


	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.orientation).setValue(view.settings.orientation || ABViewMenuPropertyComponentDefaults.orientation);
		$$(ids.buttonStyle).setValue(view.settings.buttonStyle || ABViewMenuPropertyComponentDefaults.buttonStyle);

		var pageTree = new webix.TreeCollection();
		var application = view.application;
		var currentPage = view.pageParent();
		var parentPage = currentPage.pageParent();
		
		var addPage = function (page, index, parentId) {
			if(view.settings.pages) {
				view.settings.pages.forEach((localpage)=> {
					if(localpage.pageId == page.id) {
						page.aliasname = localpage.aliasname;
					}
				});
			}
			pageTree.add(page, index, parentId);

			page.pages().forEach((childPage, childIndex)=>{
				addPage(childPage, childIndex, page.id);
			});
		}

		application.pages().forEach((p, index)=>{
 			if ( (parentPage && p == parentPage) || p == currentPage ) {
 				addPage(p, index);				
 			}
 		})

		$$(ids.pages).clearAll();
		// $$(ids.pages).data.unsync();
		$$(ids.pages).data.importData(pageTree);
		$$(ids.pages).refresh();
		$$(ids.pages).uncheckAll();
		$$(ids.pages).openAll();

		// Select pages
		if (view.settings.pages && view.settings.pages.forEach) {
			view.settings.pages.forEach((page) => {

				if(page.isChecked) {
					$$(ids.pages).checkItem(page.pageId);
				}

			});
		}
		
		$$(ids.pagesFieldset).config.height = ($$(ids.pages).count()*28)+18; // Number of pages plus 9px of padding top and bottom
		$$(ids.pagesFieldset).resize();
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.orientation = $$(ids.orientation).getValue();
		view.settings.buttonStyle = $$(ids.buttonStyle).getValue();

		var pagesIdList = []
		var temp = $$(ids.pages).data.count();
		if ($$(ids.pages)) {
			for (var i=0; i < $$(ids.pages).data.count(); i++) {
				var currentPageId = $$(ids.pages).getIdByIndex(i);
				var currentItem = $$(ids.pages).getItem(currentPageId);
				pagesIdList.push({ pageId: currentPageId,
								   isChecked: currentItem.checked,
								   aliasname: currentItem.aliasname,
								   translations: []
								 });
			}
		}
		view.settings.pages = pagesIdList;

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
			type: "form",
			rows: [
				{
					id: ids.component,
					view: "menu",
					autoheight: true,
					datatype: "json",
					css: this.settings.buttonStyle || ABViewMenuPropertyComponentDefaults.buttonStyle,
					layout: this.settings.orientation || ABViewMenuPropertyComponentDefaults.orientation,
					on: {
						onItemClick: (id, e, node) => {
							this.changePage(id);
						}
					}
				}
			]
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {

			var Menu = $$(ids.component);
			if (Menu) {
				this.ClearPagesInView(Menu);
				if (this.settings.pages && this.settings.pages.length > -1) {
					var orderMenu = [];
					var orderMenu = this.AddPagesToView(this.application, Menu, this.settings.pages, orderMenu);
					this.AddOrderedPagesToView(this.application, Menu, this.settings.pages, orderMenu);
				}
			}


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


	ClearPagesInView(menu) {
		// clear menu items
		if (menu && menu.count() > 1) {
			menu.find({}).forEach((item) => {
				menu.remove(item.id);
			});
		}
	}

	AddPagesToView(parent, menu, pages, insertPages) {

		if (!parent || !parent.pages || !menu || !pages) return;

		var parentPages = parent.pages() || [];

		var insertPages = insertPages;

		parentPages.forEach((parentPage) => {

			pages.forEach((localPage) => {
				if(localPage.pageId == parentPage.id && localPage.isChecked) {
					insertPages[parentPage.id] = {
						id: parentPage.id,
						value: localPage.aliasname ? localPage.aliasname : parentPage.label
					};
				}
			});

			this.AddPagesToView(parentPage, menu, pages, insertPages);

		});

		return insertPages;

	}

	AddOrderedPagesToView(parent, menu, pageIds, orderMenu) {
		var orderMenu = orderMenu;
		pageIds.forEach((page) => {
			if (orderMenu[page.pageId])
				menu.add(orderMenu[page.pageId]);
		});
	}

};