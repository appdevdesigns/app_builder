/*
 * ABViewTab
 *
 * An ABViewTab defines a UI tab display component.
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABViewWidget from "./ABViewWidget"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewTabPropertyComponentDefaults = {
	height: 300
}


var ABViewTabDefaults = {
	key: 'tab',						// {string} unique key for this view
	icon: 'window-maximize',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.tab'	// {string} the multilingual label key for the class label
}



export default class ABViewTab extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewTabDefaults);

	}


	static common() {
		return ABViewTabDefaults;
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
	fromValues(values) {

		super.fromValues(values);

		// convert from "0" => 0
		this.settings.height = parseInt(this.settings.height);

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

		var idBase = 'ABViewTabEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component'),
			view: App.unique(idBase + '_view')
		};
		var component = this.component(App);

		var tabElem = component.ui;
		tabElem.id = ids.component;
		tabElem.tabbar = {
			on: {
				onItemClick: (id, e) => {

					var tabId = $$(ids.component).getValue(),
						tab = this.views(v => v.id == tabId)[0],
						currIndex = this._views.findIndex((v) => v.id == tabId);

					// Rename
					if (e.target.classList.contains('rename')) {

						ABViewTab.showPopup(tab);

					}
					// Reorder back
					else if (e.target.classList.contains('move-back')) {

						this.viewReorder(tabId, currIndex - 1);

						this.emit('properties.updated', this);

					}
					// Reorder next
					else if (e.target.classList.contains('move-next')) {

						this.viewReorder(tabId, currIndex + 1);

						this.emit('properties.updated', this);

					}

				}
			}
		};

		// Add action buttons
		if (tabElem.cells && tabElem.cells.length > 0) {
			tabElem.cells.forEach((tabView) => {

				// Add 'move back' icon
				tabView.header = ('<i class="fa fa-caret-left move-back" style="float: left; padding-left: 10px;"></i>' + tabView.header);
				// Add 'edit' icon
				tabView.header += ' <i class="fa fa-pencil-square-o rename"></i>';
				// Add 'move next' icon
				tabView.header += ' <i class="fa fa-caret-right move-next" style="float: right; padding-right: 10px;"></i>';

			});

		}

		var _ui = {
			rows: [
				tabElem,
				{}
			]
		};


		var _init = (options) => {

			component.init(options);

			// Add actions buttons - Edit , Delete
			if ($$(ids.component) &&
				$$(ids.component).config.view == "tabview") {
				webix.ui({
					container: $$(ids.component).getMultiview().$view,
					view: 'template',
					type: 'clean',
					autoheight: false,
					borderless: true,
					height: 1,
					width: 0,
					template: '<div class="ab-component-tools ab-layout-view">' +
					'<i class="fa fa-trash ab-component-remove"></i>' +
					'<i class="fa fa-edit ab-component-edit"></i>' +
					'</div>',
					onClick: {
						"ab-component-edit": function (e, id, trg) {
							_logic.tabEdit(e, id, trg);
						},
						"ab-component-remove": function (e, id, trg) {
							_logic.tabRemove(e, id, trg);
						}
					}
				});
			}

		}


		var _logic = {

			templateBlock: (tab) => {
				var _template = [
					'<div class="ab-component-in-page">',
					'<div id="' + ids.view + '_#objID#" >',
					'<i class="fa fa-#icon#"></i>',
					' #label#',
					'</div>',
					'</div>'
				].join('');

				return _template
					.replace('#objID#', tab.id)
					.replace('#icon#', tab.icon)
					.replace('#label#', tab.label);
			},

			tabEdit: (e, nodeId, trg) => {

				var tabId = $$(ids.component).getValue();
				var view = this.views(function (v) { return v.id == tabId; })[0];

				if (!view) return false;

				// NOTE: let webix finish this onClick event, before
				// calling .populateInterfaceWorkspace() which will replace
				// the interface elements with the edited view.  (apparently
				// that causes errors.)
				setTimeout(() => {
					App.actions.populateInterfaceWorkspace(view);
				}, 50);

				e.preventDefault();
				return false;

			},

			tabRemove: (e, nodeId, trg) => {

				var tabId = $$(ids.component).getValue();
				var deletedView = this.views((v) => v.id == tabId)[0];
				if (deletedView) {

					OP.Dialog.Confirm({
						title: L('ab.interface.component.tab.confirmDeleteTitle', '*Delete tab'),
						text: L('ab.interface.component.tab.confirmDeleteMessage', 'Do you want to delete <b>{0}</b>?').replace('{0}', deletedView.label),
						callback: (result) => {
							if (result) {
								this.viewDestroy(deletedView);

								// remove tab option
								$$(ids.component).removeView(tabId);
							}
						}
					});

				}

				e.preventDefault();
				return false;

			}
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

	static addTab(ids, _logic, tabName) {

		// get current instance and .addTab()
		var LayoutView = _logic.currentEditObject();
		LayoutView.addTab(tabName);

		// trigger a save()
		this.propertyEditorSave(ids, LayoutView);
	}


	static editTab(ids, _logic, tabId, tabName) {

		// get current instance and rename tab
		var LayoutView = _logic.currentEditObject();
		var editTab = LayoutView.views(v => v.id == tabId)[0];

		if (editTab) {
			editTab.label = tabName;

			// trigger a save()
			this.propertyEditorSave(ids, LayoutView);
		}

	}


	static showPopup(tab) {

		var popup = $$("ab-component-tab-add-new-tab-popup");
		var form = $$("ab-component-tab-add-new-tab-form");
		var button = $$("ab-component-tab-save-button");

		if (popup) {

			// Edit tab
			if (tab) {
				form.setValues({
					id: tab.id,
					label: tab.label
				});

				popup.getHead().setHTML(L('ab.component.tab.editTab', '*Edit Tab'));
				button.setValue(L('ab.common.edit', "*Edit"));
			}
			// Add new tab
			else {
				form.setValues({
					id: null,
					label: ""
				});

				popup.getHead().setHTML(L('ab.component.tab.addTab', '*Add Tab'));
				button.setValue(L('ab.common.add', "*Add"));
			}

			button.refresh();

			// show 'add new field' popup
			popup.show();

		}

	}

	static closePopup() {

		var popup = $$("ab-component-tab-add-new-tab-popup");

		if (popup)
			popup.hide();

	}

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// create 'add new tab' popup
		webix.ui({
			id: 'ab-component-tab-add-new-tab-popup',
			view: "window",
			height: 150,
			width: 300,
			modal: true,
			position: "center",
			head: ' ',
			body: {
				id: 'ab-component-tab-add-new-tab-form',
				view: 'form',
				elements: [
					{
						view: 'text',
						name: 'label',
						id: 'ab-component-tab-name',
						label: L('ab.component.tab.label', '*Label'),
						required: true
					},
					// action buttons
					{
						cols: [
							{ fillspace: true },
							{
								view: "button",
								value: L('ab.common.cancel', "*Cancel"),
								css: "ab-cancel-button",
								autowidth: true,
								click: () => {
									this.closePopup();
								}
							},
							{
								id: 'ab-component-tab-save-button',
								view: "button",
								value: L('ab.component.tab.addTab', '*Add Tab'),
								autowidth: true,
								type: "form",
								click: () => {

									var form = $$('ab-component-tab-add-new-tab-form');
									if (form.validate()) {

										var vals = form.getValues();

										if (vals.id == null)
											this.addTab(ids, _logic, vals.label);
										else
											this.editTab(ids, _logic, vals.id, vals.label);

										this.closePopup();

									}

								}
							}
						]
					}
				]
			}

		}).hide();

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				view: 'counter',
				name: 'height',
				label: L('ab.component.tab.height', '*Height')
			},
			// [button] : add tab
			{
				view: 'button',
				value: L('ab.component.tab.addTab', '*Add Tab'),
				click: () => {
					this.showPopup();
				}
			}

		]);
	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.height).setValue(view.settings.height || ABViewTabPropertyComponentDefaults.height);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.height = $$(ids.height).getValue();
	}




	addTab(tabName) {

		this._views.push(ABViewManager.newView({
			key: ABViewContainer.common().key,
			label: tabName
		}, this.application, this));

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
		this.views().forEach((v) => {
			viewComponents.push({
				view: v,
				component: v.component(App)
			});
		})

		var idBase = 'ABViewTab_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var _ui = {};

		if (viewComponents.length > 0) {
			_ui = {
				view: 'tabview',
				id: ids.component,
				multiview: {
					height: this.settings.height
				},
				cells: viewComponents.map((v) => {

					// able to 'scroll' in tab view
					var tabUi = {
						id: v.view.id,
						view: 'scrollview',
						body: v.component.ui
					};

					return {
						id: v.view.id,
						header: v.view.label,
						body: tabUi
					};
				})
			}
		}
		else {
			_ui = {
				view: 'spacer'
			};
		}


		var _logic = {

			changePage: (pageId) => {
				this.changePage(pageId);
			}

		};


		// make sure each of our child views get .init() called
		var _init = (options) => {

			viewComponents.forEach((v) => {
				v.component.init(options);

				// Trigger 'changePage' event to parent
				v.view.removeListener('changePage', _logic.changePage)
					.on('changePage', _logic.changePage);

			});

		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
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