/*
 * ABViewTab
 *
 * An ABViewTab defines a UI tab display component.
 *
 */

import ABView from "./ABView"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewTabPropertyComponentDefaults = {
}


var ABViewTabDefaults = {
	key: 'tab',						// {string} unique key for this view
	icon: 'window-maximize',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.tab'	// {string} the multilingual label key for the class label
}



export default class ABViewTab extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewTabDefaults);


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
		return ABViewTabDefaults;
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

		var idBase = 'ABViewTabEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};

		var tabElem = this.component(App).ui;
		tabElem.id = ids.component;
		tabElem.tabbar = {
			close: true,
			on: {
				onBeforeTabClose: (id, e) => {
					_logic.tabRemove(id);

					return false;
				}
			}
		};


		var _ui = {
			rows: [
				tabElem,
				{}
			]
		};

		var _init = (options) => {
		}

		var _logic = {
			tabRemove: (id) => {

				var deletedView = this.views((v) => v.id == id)[0];
				if (deletedView) {

					OP.Dialog.Confirm({
						title: L('ab.interface.component.tab.confirmDeleteTitle', '*Delete tab'),
						text: L('ab.interface.component.tab.confirmDeleteMessage', 'Do you want to delete <b>{0}</b>?').replace('{0}', deletedView.label),
						callback: (result) => {
							if (result) {
								this.viewDestroy(deletedView);

								// remove tab option
								$$(ids.component).getTabbar().removeOption(id);
							}
						}
					});

				}

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

	static addTab(ids, _logic) {

		// get current instance and .addColumn()
		var LayoutView = _logic.currentEditObject();
		LayoutView.addTab();

		// trigger a save()
		this.propertyEditorSave(ids, LayoutView);
	}


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// if I don't create my own propertyEditorComponent, then I need to 
		// create the onClick handler that will cause the current view instance
		// to create a vew sub view/ column
		if (!_logic.onClick) {
			_logic.onClick = () => {
				this.addTab(ids, _logic)
			}
		}

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			// [button] : add column
			{
				view: 'button',
				value: L('ab.component.tab.addTab', '*Add Tab'),
				click: _logic.onClick
			}

		]);

	}


	addTab() {

		var tabName = "#name# #index#"
			.replace('#name#', L('ab.components.tab', '*Tab'))
			.replace('#index#', this._views.length + 1);

		this._views.push(ABViewManager.newView({
			key: ABView.common().key,
			label: tabName
		}, this.application, this));

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

		var idBase = 'ABViewTab_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var _ui = {};

		var tabs = this.views() || [];

		if (tabs.length > 0) {
			_ui = {
				view: 'tabview',
				id: ids.component,
				cells: tabs.map((t) => {
					t.header = t.label;

					return t;
				})
			}
		}
		else {
			_ui = {
				view: 'spacer'
			};
		}


		// make sure each of our child views get .init() called
		var _init = (options) => {
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


}