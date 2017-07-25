/*
 * ABViewSelectSingle
 *
 * An ABViewSelectSingle defines a UI text box component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewSelectSinglePropertyComponentDefaults = {
	type: 'richselect'
}


var ABSelectSingleDefaults = {
	key: 'selectsingle',		// {string} unique key for this view
	icon: 'list-ul',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.selectsingle' // {string} the multilingual label key for the class label
}

export default class ABViewSelectSingle extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABSelectSingleDefaults);

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
		return ABSelectSingleDefaults;
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

		var idBase = 'ABViewSelectSingleEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component'),
			options: App.unique(idBase + '_option'),
		}

		var selectlist = this.component(App).ui;
		selectlist.id = ids.component;

		var _ui = {
			rows: [
				selectlist
			]
		};

		if (mode == 'block') {
			// options list
			_ui.rows.push({
				id: ids.options,
				name: 'options',
				view: App.custom.editlist.view,
				template: "<div style='position: relative;'>#value#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
				autoheight: true,
				drag: true,
				editable: true,
				editor: "text",
				editValue: "value",
				onClick: {
					"ab-new-field-remove": function (e, itemId, trg) {
						// Remove option item
						$$(ids.options).remove(itemId);
					}
				},
				on: {
					onAfterAdd: () => {
						_logic.updateSelectOptions();
					},
					onAfterEditStop: () => {
						_logic.updateSelectOptions();
					},
					onAfterDelete: () => {
						_logic.updateSelectOptions();
					}
				}
			});

			// 'Add a option' button
			_ui.rows.push({
				cols: [
					{},
					{
						view: 'button',
						width: 160,
						value: L('ab.component.selectsingle.addNewOption', '*Add a new option'),
						click: () => {
							_logic.addNewOption();
						}
					}
				]
			});
		}

		_ui.rows.push({});

		var _init = (options) => {
		}

		var _logic = {

			updateSelectOptions: () => {
				var options = $$(ids.options).find({}).map(function (opt) {
					return {
						id: opt.id,
						value: opt.value
					}
				});

				$$(ids.component).define('options', options);
				$$(ids.component).refresh();
			},

			addNewOption: () => {
				var itemId = webix.uid();
				$$(ids.options).add({ id: itemId, value: '' }, $$(ids.options).count());
				$$(ids.options).edit(itemId);
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
				name: 'type',
				view: 'richselect',
				label: L('ab.component.selectsingle.type', '*Type'),
				options: [
					{
						id: 'richselect',
						value: L('ab.component.selectsingle.selectlist', '*Select list')
					},
					{
						id: 'radio',
						value: L('ab.component.selectsingle.radio', '*Radio')
					}
				]
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.type).setValue(view.settings.type || ABViewSelectSinglePropertyComponentDefaults.type);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.type = $$(ids.type).getValue();

	}



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABSelectSingleLabel_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		var _ui = {
			view: this.settings.type || ABViewSelectSinglePropertyComponentDefaults.type
		};

		_ui.options = this.settings.options || [];

		// radio element could not be empty options
		if (_ui.view == 'radio' && _ui.options.length < 1) {
			_ui.options.push({
				id: 'temp',
				value: 'Option'
			});
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


};