/*
 * ABViewForm
 *
 * An ABViewForm is an ABView that allows you to choose an object and create 
 * special form controls for each of the Object's properties.
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABViewFormButton from "./ABViewFormButton"
import ABViewFormCustom from "./ABViewFormCustom"
import ABViewFormDatepicker from "./ABViewFormDatepicker"
import ABViewFormField from "./ABViewFormField"
import ABViewFormTextbox from "./ABViewFormTextbox"
import ABViewManager from "../ABViewManager"
import ABPropertyComponent from "../ABPropertyComponent"

import ABDisplayRule from "./ABViewFormPropertyDisplayRule"
// import ABRecordRule from "./ABViewFormPropertyRecordRule"
// import ABSubmitRule from "./ABViewFormPropertySubmitRule"
import ABRecordRule from "../rules/ABViewRuleListFormRecordRules"
import ABSubmitRule from "../rules/ABViewRuleListFormSubmitRules"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormDefaults = {
	key: 'form',		// unique key identifier for this ABViewForm
	icon: 'list-alt',		// icon reference: (without 'fa-' )
	labelKey: 'ab.components.form' // {string} the multilingual label key for the class label

}

var ABViewFormPropertyComponentDefaults = {
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 120,
	height: 200,
	clearOnLoad: false,
	displayRules: [],

	//	[{
	//		action: {string},
	//		when: [
	//			{
	//				fieldId: {UUID},
	//				comparer: {string},
	//				value: {string}
	//			}
	//		],
	//		values: [
	//			{
	//				fieldId: {UUID},
	//				value: {object}
	//			}
	//		]
	//	}]
	recordRules: [],

	//	[{
	//		action: {string},
	//		when: [
	//			{
	//				fieldId: {UUID},
	//				comparer: {string},
	//				value: {string}
	//			}
	//		],
	//		value: {string}
	//	}]
	submitRules: []
}

var PopupDisplayRule = null;
var PopupRecordRule = null;
var PopupSubmitRule = null;

export default class ABViewForm extends ABViewContainer {

	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormDefaults);


		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//		},

		//		translations:[]
		// 	}


	}


	static common() {
		return ABViewFormDefaults;
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
	// toObj () {

	// 	OP.Multilingual.unTranslate(this, this, ['label', 'text']);

	// 	var obj = super.toObj();
	// 	obj.views = [];
	// 	return obj;
	// }


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		this.settings.labelPosition = this.settings.labelPosition || ABViewFormPropertyComponentDefaults.labelPosition;

		// convert from "0" => true/false
		this.settings.showLabel = JSON.parse(this.settings.showLabel != null ? this.settings.showLabel : ABViewFormPropertyComponentDefaults.showLabel);
		this.settings.clearOnLoad = JSON.parse(this.settings.clearOnLoad != null ? this.settings.clearOnLoad : ABViewFormPropertyComponentDefaults.clearOnLoad);

		// convert from "0" => 0
		this.settings.labelWidth = parseInt(this.settings.labelWidth || ABViewFormPropertyComponentDefaults.labelWidth);
		this.settings.height = parseInt(this.settings.height || ABViewFormPropertyComponentDefaults.height);

	}

	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {

		var comp = super.editorComponent(App, mode);

		// Define height of cell
		comp.ui.rows[0].cellHeight = 75;

		return comp;
	}


	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		var idBase = "ABViewForm";

		PopupDisplayRule = new ABDisplayRule(App, idBase + "_displayrule");

		PopupRecordRule = new ABRecordRule();
		PopupRecordRule.component(App, idBase + "_recordrule");		// prepare the UI component.

		PopupSubmitRule = new ABSubmitRule();
		PopupSubmitRule.component(App, idBase + "_submitrule");


		// _logic functions

		_logic.selectSource = (dcId, oldDcId) => {

			// TODO : warning message

			var currView = _logic.currentEditObject();
			var formView = currView.parentFormComponent();

			// remove all old components
			if (oldDcId != null) {
				var oldComps = formView.views();
				oldComps.forEach(child => child.destroy());
			}

			// Update field options in property
			this.propertyUpdateFieldOptions(ids, currView, dcId);

			// add all fields to editor by default
			if (currView._views.length < 1) {

				var fields = $$(ids.fields).find({});
				fields.reverse();
				fields.forEach((f, index) => {

					if (!f.selected) {

						var yPosition = (fields.length - index - 1);

						// Add new form field
						var newFieldView = currView.addFieldToForm(f, yPosition);
						newFieldView.once('destroyed', () => this.propertyEditorPopulate(App, ids, currView));

						// update item to UI list
						f.selected = 1;
						$$(ids.fields).updateItem(f.id, f);
					}

				});

				// Add a default button
				var newButton = ABViewFormButton.newInstance(formView.application, formView);
				newButton.position.y = fields.length;
				formView._views.push(newButton);

			}

			// Update field options in property
			this.propertyUpdateRules(ids, currView, dcId);

		};

		_logic.listTemplate = (field, common) => {

			var componentKey = field.formComponent().common().key;
			var formComponent = ABViewManager.allViews((v) => v.common().key == componentKey)[0];

			return common.markCheckbox(field) + " #label# <div class='ab-component-form-fields-component-info'> <i class='fa fa-#icon#'></i> #component# </div>"
				.replace("#label#", field.label)
				.replace("#icon#", (formComponent ? formComponent.common().icon : "fw"))
				.replace("#component#", (formComponent ? L(formComponent.common().labelKey, "") : ""));

		};

		_logic.check = (e, fieldId) => {

			var currView = _logic.currentEditObject();

			// update UI list
			var item = $$(ids.fields).getItem(fieldId);
			item.selected = item.selected ? 0 : 1;
			$$(ids.fields).updateItem(fieldId, item);

			// add a field to the form
			if (item.selected) {
				var fieldView = currView.addFieldToForm(item);
				fieldView.once('destroyed', () => this.propertyEditorPopulate(App, ids, currView));
			}
			// remove field in the form
			else {
				var formView = currView.parentFormComponent();
				var fieldView = formView.fieldComponents().filter(c => c.settings.fieldId == fieldId)[0];

				if (fieldView)
					fieldView.destroy();

			}

			// trigger a save()
			this.propertyEditorSave(ids, currView);

		};


		// Display rule
		_logic.displayRuleShow = () => {

			var currView = _logic.currentEditObject();

			PopupDisplayRule.setValue(currView.settings.displayRules);
			PopupDisplayRule.show();

		};

		_logic.displayRuleSave = () => {

		};


		// Record rule
		_logic.recordRuleShow = () => {

			var currView = _logic.currentEditObject();
			
			PopupRecordRule.formLoad(currView);
			PopupRecordRule.fromSettings(currView.settings.recordRules);
			PopupRecordRule.show();

// NOTE: Querybuilder v5.2 has a bug where it won't display the [and/or] 
// choosers properly if it hasn't been shown before the .setValue() call.
// so this work around allows us to refresh the display after the .show()
// on the popup.
// When they've fixed the bug, we'll remove this workaround:
PopupRecordRule.qbFixAfterShow();


		};

		_logic.recordRuleSave = (settings) => {

			var currView = _logic.currentEditObject();
			currView.settings.recordRules = settings;

			// trigger a save()
			this.propertyEditorSave(ids, currView);

			// update badge number of rules
			this.populateBadgeNumber(ids, currView);

		};


		// Submit rule
		_logic.submitRuleShow = () => {

			var currView = _logic.currentEditObject();

			PopupSubmitRule.fromSettings(currView.settings.submitRules);
			PopupSubmitRule.show();


		};

		_logic.submitRuleSave = (settings) => {

			var currView = _logic.currentEditObject();
			currView.settings.submitRules = settings;

			// trigger a save()
			this.propertyEditorSave(ids, currView);

			// update badge number of rules
			this.populateBadgeNumber(ids, currView);

		};



		/** Initial rule popups */
		PopupDisplayRule.init({
			onSave: _logic.displayRuleSave
		});

		PopupRecordRule.init({
			onSave: _logic.recordRuleSave
		});

		PopupSubmitRule.init({
			onSave: _logic.submitRuleSave
		});



		return commonUI.concat([
			{
				name: 'datacollection',
				view: 'richselect',
				label: L('ab.components.form.dataSource', "*Data Source"),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: _logic.selectSource
				}
			},
			
			
			{
				view: "fieldset",
				label: L('ab.components.form.formFields', '*Form Fields:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows: [
						{
							name: 'fields',
							view: 'list',
							select: false,
							minHeight: 200,
							template: _logic.listTemplate,
							type: {
								markCheckbox: function (item) {
									return "<span class='check webix_icon fa-" + (item.selected ? "check-" : "") + "square-o'></span>";
								}
							},
							onClick: {
								"check": _logic.check
							}
						}
					]
				}
			},
			{
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.common.showlabel', "*Display Label"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.common.labelPosition', "*Label Position"),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{
						id: 'left',
						value: L('ab.components.common.left', "*Left")
					},
					{
						id: 'top',
						value: L('ab.components.common.top', "*Top")
					}
				]
			},
			{
				name: 'labelWidth',
				view: 'counter',
				label: L('ab.components.common.labelWidth', "*Label Width"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.components.common.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			},
			{
				name: 'clearOnLoad',
				view: 'checkbox',
				label: L('ab.components.form.clearOnLoad', "*Clear on load"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: "fieldset",
				label: L('ab.components.form.rules', '*Rules:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.components.form.submitRules", "*Submit Rules:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonSubmitRules",
									label: L("ab.components.form.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.submitRuleShow();
									}
								}
							]
						},
						{
							cols: [
								{
									view: "label",
									label: L("ab.components.form.displayRules", "*Display Rules:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonDisplayRules",
									label: L("ab.components.form.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.displayRuleShow();
									}
								}
							]
						},
						{
							cols: [
								{
									view: "label",
									label: L("ab.components.form.recordRules", "*Record Rules:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonRecordRules",
									label: L("ab.components.form.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.recordRuleShow();
									}
								}
							]
						}

					]
				}
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var formCom = view.parentFormComponent();
		var dataCollectionId = (formCom.settings.datacollection ? formCom.settings.datacollection : null);
		var SourceSelector = $$(ids.datacollection);

		// Pull data collections to options
		var dcOptions = view.pageRoot().dataCollections().map((dc) => {

			return {
				id: dc.id,
				value: dc.label
			};
		});

		dcOptions.unshift({
			id: null,
			value: '[Select]'
		});
		SourceSelector.define('options', dcOptions);
		SourceSelector.define('value', dataCollectionId);
		SourceSelector.refresh();

		this.propertyUpdateFieldOptions(ids, view, dataCollectionId);


		// update properties when a field component is deleted
		view.views().forEach((v) => {
			if (v instanceof ABViewFormField)
				v.once('destroyed', () => this.propertyEditorPopulate(App, ids, view));
		});

		SourceSelector.enable();
		$$(ids.showLabel).setValue(view.settings.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewFormPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewFormPropertyComponentDefaults.labelWidth);
		$$(ids.height).setValue(view.settings.height || ABViewFormPropertyComponentDefaults.height);
		$$(ids.clearOnLoad).setValue(view.settings.clearOnLoad || ABViewFormPropertyComponentDefaults.clearOnLoad);

		this.propertyUpdateRules(ids, view, dataCollectionId);
		this.populateBadgeNumber(ids, view);

		// when a change is made in the properties the popups need to reflect the change
		this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
		if (!this.updateEventIds[view.id]) {
			this.updateEventIds[view.id] = true;

			view.addListener('properties.updated', () => {
				this.populateBadgeNumber(ids, view);
			});
		}

	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.datacollection = $$(ids.datacollection).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue() || ABViewFormPropertyComponentDefaults.labelPosition;
		view.settings.labelWidth = $$(ids.labelWidth).getValue() || ABViewFormPropertyComponentDefaults.labelWidth;
		view.settings.height = $$(ids.height).getValue();
		view.settings.clearOnLoad = $$(ids.clearOnLoad).getValue();

	}


	/**
	 * @method propertyUpdateFieldOptions
	 * Populate fields of object to select list in property
	 * 
	 * @param {Object} ids 
	 * @param {ABViewForm} view - the current component
	 * @param {string} dcId - id of ABViewDataCollection
	 */
	static propertyUpdateFieldOptions(ids, view, dcId) {

		var formComponent = view.parentFormComponent();
		var existsFields = formComponent.fieldComponents();
		var datacollection = view.pageRoot().dataCollections(dc => dc.id == dcId)[0];
		var object = datacollection ? datacollection.datasource : null;

		// Pull field list
		var fieldOptions = [];
		if (object != null) {

			fieldOptions = object.fields().map((f) => {

				f.selected = existsFields.filter((com) => { return f.id == com.settings.fieldId; }).length > 0;

				return f;

			});
		}

		$$(ids.fields).clearAll();
		$$(ids.fields).parse(fieldOptions);

	}

	static propertyUpdateRules(ids, view, dcId) {

		if (!view) return;

		// Populate values to rules
		var selectedDc = view.dataCollection();
		if (selectedDc) {
			PopupDisplayRule.objectLoad(selectedDc.datasource);
			PopupRecordRule.objectLoad(selectedDc.datasource);
			PopupSubmitRule.objectLoad(selectedDc.datasource);
		}


		// PopupDisplayRule.formLoad(view);
		PopupRecordRule.formLoad(view);
		PopupSubmitRule.formLoad(view);

	}

	static populateBadgeNumber(ids, view) {

		if (!view) return;

		if (view.settings.submitRules) {
			$$(ids.buttonSubmitRules).define('badge', view.settings.submitRules.length || 0);
			$$(ids.buttonSubmitRules).refresh();
		}
		else {
			$$(ids.buttonSubmitRules).define('badge', 0);
			$$(ids.buttonSubmitRules).refresh();
		}

		if (view.settings.displayRules) {
			$$(ids.buttonDisplayRules).define('badge', view.settings.displayRules.length || 0);
			$$(ids.buttonDisplayRules).refresh();
		}
		else {
			$$(ids.buttonDisplayRules).define('badge', 0);
			$$(ids.buttonDisplayRules).refresh();
		}

		if (view.settings.recordRules) {
			$$(ids.buttonRecordRules).define('badge', view.settings.recordRules.length || 0);
			$$(ids.buttonRecordRules).refresh();
		}
		else {
			$$(ids.buttonRecordRules).define('badge', 0);
			$$(ids.buttonRecordRules).refresh();
		}

	}



	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		var viewsToAllow = ['label', 'layout', 'button'],
			allComponents = ABViewManager.allViews();

		return allComponents.filter((c) => {
			return viewsToAllow.indexOf(c.common().key) > -1;
		});
	}


	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewForm_' + this.id;
		this.uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			return App.unique(idBase + '_' + key  + '_' + this.uniqueInstanceID);
		}
		var ids = {
			component: myUnique('_component'),	
			layout: myUnique('_form_layout'),	
		};

		var component = super.component(App);

		// an ABViewForm_ is a collection of rows:
		var _ui = {
			// view: "scrollview",
			// height: this.settings.height || ABViewFormPropertyComponentDefaults.height,
			// body: {
			id: ids.component,
			view: 'form',
			rows: component.ui.rows
			// }
		};


		// make sure each of our child views get .init() called
		var _init = (options) => {
			// register our callbacks:
			if (options) {
				for(var c in _logic.callbacks) {
					_logic.callbacks[c] = options[c] || _logic.callbacks[c];
				}
			}

			component.init(options);

			var Form = $$(ids.component);
			if (Form) {
				webix.extend(Form, webix.ProgressBar);
			}

			// bind a data collection to form component
			var dc = this.dataCollection();
			if (dc) {

				// listen DC events
				this.eventAdd({
					emitter: dc,
					eventName: 'changeCursor',
					listener: _logic.displayData
				});

				// bind the cursor event of the parent DC
				var linkDc = dc.dataCollectionLink;
				if (linkDc) {

					// update the value of link field when data of the parent dc is changed
					this.eventAdd({
						emitter: linkDc,
						eventName: 'changeCursor',
						listener: _logic.displayParentData
					});

				}

			}

		}

		var _logic = this._logic = {
			
			callbacks:{
			
				onSaveData:function(saveData){},
				clearOnLoad:function(){ return false }
			
			},			

			displayData: (data) => {

				// Set default values
				if (data == null) {
					var customFields = this.fieldComponents((comp) => {
						return (comp instanceof ABViewFormCustom) ||
							// rich text
							((comp instanceof ABViewFormTextbox) && comp.settings.type == 'rich')
					});
					customFields.forEach((f) => {

						var field = f.field();
						if (!field) return;

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						var colName = field.columnName;

						// set value to each components
						var rowData = {};
						field.defaultValue(rowData);
						field.setValue($$(comp.ui.id), rowData);

					});
					var normalFields = this.fieldComponents((comp) => ((comp instanceof ABViewFormField) && !(comp instanceof ABViewFormCustom)));
					normalFields.forEach((f) => {

						var field = f.field();
						if (!field) return;

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						if (f.key != "button") {
							var colName = field.columnName;

							// set value to each components
							var values = {};
							field.defaultValue(values);

							if ($$(comp.ui.id) &&
								$$(comp.ui.id).setValue)
								$$(comp.ui.id).setValue((values[colName] == null ? '' : values[colName]));
						}
					});
				}

				// Populate value to custom fields
				else {
					var customFields = this.fieldComponents((comp) => {
						return (comp instanceof ABViewFormCustom) ||
							// rich text
							((comp instanceof ABViewFormTextbox) && comp.settings.type == 'rich')
					});
					customFields.forEach((f) => {

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						// set value to each components
						if (f.field())
							f.field().setValue($$(comp.ui.id), data);
					});
				}
			},

			displayParentData: (data) => {

				var dc = this.dataCollection();
				var currCursor = dc.getCursor();

				// If the cursor is selected, then it will not update value of the parent field
				if (currCursor != null) return;

				var Form = $$(ids.component),
					relationField = dc.fieldLink;

				// Pull a component of relation field
				var relationFieldCom = this.fieldComponents((comp) => {
					if (!(comp instanceof ABViewFormField)) return false;

					return comp.field() && (comp.field().id == relationField.id);
				})[0];

				if (relationFieldCom == null) return;

				var relationFieldView = this.viewComponents[relationFieldCom.id];
				if (relationFieldView == null) return;

				var relationElem = $$(relationFieldView.ui.id),
					relationName = relationField.relationName();

				// pull data of parent's dc
				var formData = {};
				formData[relationName] = data;

				// set data of parent to default value
				relationField.setValue(relationElem, formData);

			}

		};

		var _onShow = () => {

			// call .onShow in the base component
			component.onShow();

			var Form = $$(ids.component);

			var customFields = this.fieldComponents((comp) => {
				return (comp instanceof ABViewFormCustom) ||
					// rich text
					((comp instanceof ABViewFormTextbox) && comp.settings.type == 'rich')
			});
			customFields.forEach((f) => {

				var field = f.field();
				if (!field) return;

				var component = this.viewComponents[f.id];
				if (!component) return;

				// set value to each components
				var rowData = {};
				field.defaultValue(rowData);
				field.setValue($$(component.ui.id), rowData);

			});

			var data = null;
			var dc = this.dataCollection();
			if (dc) {

				if (Form)
					dc.bind(Form);

				// clear current cursor on load
				if (this.settings.clearOnLoad || _logic.callbacks.clearOnLoad() ) {
					dc.setCursor(null);
				}

				data = dc.getCursor();

				// do this for the initial form display so we can see defaults
				_logic.displayData(data);

				// select parent data to default value
				var linkDc = dc.dataCollectionLink;
				if (data == null && linkDc) {

					var parentData = linkDc.getCursor();
					_logic.displayParentData(parentData);
				}
			}
			else {
				// show blank data in the form
				_logic.displayData(null);
			}

			if (Form)
				Form.adjust();

		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _onShow

		}
	}


	/**
	 * @method dataCollection
	 * return ABViewDataCollection of this form
	 * 
	 * @return {ABViewDataCollection}
	 */
	dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.datacollection)[0];
	}


	/**
	 * @method fieldComponents()
	 *
	 * return an array of all the ABViewFormField children
	 *
	 * @param {fn} filter  	a filter fn to return a set of ABViewFormField that this fn
	 *						returns true for.
	 * @return {array} 	array of ABViewFormField
	 */
	fieldComponents(filter) {

		var flattenComponents = (views) => {
			var components = [];

			_.each(views, (comp) => {
				components.push(comp);
				comp._views && (components = _.union(components, flattenComponents(comp._views)))
			});

			return components
		}

		if (this._views && this._views.length > 0) {
			var allComponents = flattenComponents(this._views);

			if (filter == null) {
				filter = (comp) => comp instanceof ABViewFormField;
			}

			return allComponents.filter(filter);
		}
		else {
			return [];
		}
	}

	addFieldToForm(field, yPosition) {

		if (field == null)
			return;

		var fieldComponent = field.formComponent();

		var newView = fieldComponent.newInstance(this.application, this);
		if (newView == null)
			return;

		// set settings to component
		newView.settings = newView.settings || {};
		newView.settings.fieldId = field.id;
		// TODO : Default settings

		if (yPosition != null)
			newView.position.y = yPosition;

		// add a new component
		this._views.push(newView);


		return newView;

	}



	/**
	 * @method saveData
	 * save data in to database
	 * @param formView - webix's form element
	 * 
	 * @return {Promise}
	 */
	saveData(formView) {

		// form validate
		if (formView && formView.validate()) {
			formView.clearValidation();

			// get ABViewDataCollection
			var dc = this.dataCollection();
			if (dc == null) return Promise.resolve();

			// get ABObject
			var obj = dc.datasource;

			// get ABModel
			var model = dc.model;

			// get update data
			var formVals = formView.getValues();

			// get custom values
			var customFields = this.fieldComponents((comp) => comp instanceof ABViewFormCustom);
			customFields.forEach((f) => {

				var vComponent = this.viewComponents[f.id];
				if (vComponent == null) return;

				if (f.field())
					formVals[f.field().columnName] = vComponent.logic.getValue();

			});

			// clear undefined values or empty arrays
			for (var prop in formVals) {
				if (formVals[prop] == null || formVals[prop].length == 0)
					formVals[prop] = '';
			}

			// add default values to hidden fields
			obj.fields().forEach(f => {
				if (formVals[f.columnName] === undefined) {
					f.defaultValue(formVals);
				}
			});

			// Add parent's data collection cursor when a connect field does not show
			var dcLink  = dc.dataCollectionLink;
			if (dcLink && dcLink.getCursor()) {

				var objectLink = dcLink.datasource;

				var connectFields = obj.fields(f => f.key == 'connectObject');
				connectFields.forEach((f) => {

					var formFieldCom = this.fieldComponents((fComp) => {
						return fComp.field && fComp.field().id == f.id; 
					});

					if (objectLink.id == f.settings.linkObject &&
						formFieldCom.length < 1 && // check field does not show
						formVals[f.columnName] === undefined) { 
						formVals[f.columnName] = {
							id: dcLink.getCursor().id
						}
					}

				});

			}

			// validate
			var validator = obj.isValidData(formVals);
			if (validator.pass()) {

				// show progress icon
				if (formView.showProgress)
					formView.showProgress({ type: "icon" });

				// form ready function
				var formReady = (newFormVals) => {

					// when add a new data, then clear form inputs
					if (dc) {
						var currCursor = dc.getCursor();
						if (currCursor == null) {
							dc.setCursor(null);
							formView.clear();
						}
					}
					
					// if there was saved data pass it up to the onSaveData callback
					if (newFormVals) 
						this._logic.callbacks.onSaveData(newFormVals);

					if (formView.hideProgress)
						formView.hideProgress();
				}

				return new Promise(
					(resolve, reject) => {


						// If this object already exists, just .update()
						if (formVals.id) {
							model.update(formVals.id, formVals)
								.catch((err) => {
									formReady();
									reject(err);
								})
								.then((newFormVals) => {

									this.doRecordRules(newFormVals)
									.then(()=>{
// make sure any updates from RecordRules get passed along here.
										this.doSubmitRules(newFormVals);
										formReady(newFormVals);
										resolve(newFormVals);
									})
									.catch((err)=>{
										OP.Error.log('Error processing Record Rules.', {error:err, newFormVals:newFormVals });
// Question:  how do we respond to an error?
// ?? just keep going ??
this.doSubmitRules(newFormVals);
formReady(newFormVals);
resolve(); 	
									})
								});
						}
						// else add new row
						else {
							model.create(formVals)
								.catch((err) => {
									formReady();
									reject(err);
								})
								.then((newFormVals) => {

									this.doRecordRules(newFormVals)
									.then(()=>{

										this.doSubmitRules(newFormVals);
										formReady(newFormVals);
										resolve(newFormVals);
									})
									.catch((err)=>{
										OP.Error.log('Error processing Record Rules.', {error:err, newFormVals:newFormVals });
// Question:  how do we respond to an error?
// ?? just keep going ??
this.doSubmitRules(newFormVals);
formReady(newFormVals);
resolve(); 	
									})
									
								});
						}
					}
				);

			}
			else {

				// error message
				validator.errors.forEach(err => {
					formView.markInvalid(err.name, err.message);
				});

				return Promise.resolve();
			}

		}
		else {
			// TODO : error message

			return Promise.resolve();
		}
	}


	doRecordRules(rowData) {

		var object = this.dataCollection().datasource;

		var RecordRules = new ABRecordRule();
		RecordRules.formLoad(this);
		RecordRules.fromSettings(this.settings.recordRules);
		RecordRules.objectLoad(object);
		
		return RecordRules.process({data:rowData, form:this });

	}

	doSubmitRules(rowData) {

		var object = this.dataCollection().datasource;
		
		var SubmitRules = new ABSubmitRule();
		SubmitRules.formLoad(this);
		SubmitRules.fromSettings(this.settings.submitRules);
		SubmitRules.objectLoad(object);
		
		return SubmitRules.process({data:rowData, form:this });

	}






}
