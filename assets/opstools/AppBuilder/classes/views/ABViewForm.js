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
import ABViewFormField from "./ABViewFormField"
import ABViewFormTextbox from "./ABViewFormTextbox"

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
	dataviewID: null,
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 120,
	height: 200,
	clearOnLoad: false,
	clearOnSave: false,
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
		this.settings.clearOnSave = JSON.parse(this.settings.clearOnSave != null ? this.settings.clearOnSave : ABViewFormPropertyComponentDefaults.clearOnSave);

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

			_logic.busy();

			let currView = _logic.currentEditObject();
			let formView = currView.parentFormComponent();

			return Promise.resolve()
				.then(() => {
					// remove all old components
					let destroyTasks = [];
					if (oldDcId != null) {
						let oldComps = formView.views();
						oldComps.forEach(child => destroyTasks.push(() => child.destroy()));
					}

					return destroyTasks.reduce((promiseChain, currTask) => {
						return promiseChain.then(currTask);
					}, Promise.resolve([]));
				})
				.then(() => {

					// refresh UI
					formView.emit('properties.updated', currView);

					_logic.busy();

					// Update field options in property
					this.propertyUpdateFieldOptions(ids, currView, dcId);

					// add all fields to editor by default
					if (currView._views.length > 0)
						return Promise.resolve();

					let saveTasks = [];
					let fields = $$(ids.fields).find({});
					fields.reverse();
					fields.forEach((f, index) => {

						if (!f.selected) {

							let yPosition = (fields.length - index - 1);

							// Add new form field
							let newFieldView = currView.addFieldToForm(f, yPosition);
							if (newFieldView)
								newFieldView.once('destroyed', () => this.propertyEditorPopulate(App, ids, currView));

							// Call save API
							saveTasks.push(() => newFieldView.save());

							// update item to UI list
							f.selected = 1;
							$$(ids.fields).updateItem(f.id, f);
						}

					});

					saveTasks.push(() => formView.refreshDefaultButton(ids).save());

					return saveTasks.reduce((promiseChain, currTask) => {
						return promiseChain.then(currTask);
					}, Promise.resolve([]));

				})
				.then(() => {

					// refresh UI
					formView.emit('properties.updated', currView);

					// Update field options in property
					this.propertyUpdateRules(ids, currView, dcId);

					_logic.ready();

					return Promise.resolve();

				});


		};

		_logic.listTemplate = (field, common) => {

			let currView = _logic.currentEditObject();

			// disable in form
			var fieldComponent = field.formComponent();
			if (fieldComponent == null) 
				return "<i class='fa fa-times'></i>  #label# <div class='ab-component-form-fields-component-info'> Disable </div>".replace("#label#", field.label);

			var componentKey = fieldComponent.common().key;
			var formComponent = currView.application.viewAll((v) => v.common().key == componentKey)[0];

			return common.markCheckbox(field) + " #label# <div class='ab-component-form-fields-component-info'> <i class='fa fa-#icon#'></i> #component# </div>"
				.replace("#label#", field.label)
				.replace("#icon#", (formComponent ? formComponent.common().icon : "fw"))
				.replace("#component#", (formComponent ? L(formComponent.common().labelKey, "") : ""));

		};

		_logic.check = (e, fieldId) => {

			let currView = _logic.currentEditObject();
			let formView = currView.parentFormComponent();

			// update UI list
			let item = $$(ids.fields).getItem(fieldId);
			item.selected = item.selected ? 0 : 1;
			$$(ids.fields).updateItem(fieldId, item);

			let doneFn = () => {

				formView.refreshDefaultButton(ids).save()
					.then(() => {

						// refresh UI
						currView.emit('properties.updated', currView);

					});

				// // trigger a save()
				// this.propertyEditorSave(ids, currView);

			};

			// add a field to the form
			if (item.selected) {
				let fieldView = currView.addFieldToForm(item);
				if (fieldView) {
					fieldView.save()
						.then(() => {

							fieldView.once('destroyed', () => this.propertyEditorPopulate(App, ids, currView));

							doneFn();

						});
				}
			}
			// remove field in the form
			else {
				let fieldView = formView.fieldComponents().filter(c => c.settings.fieldId == fieldId)[0];
				if (fieldView) {

					// let remainingViews = formView.views(c => c.settings.fieldId != fieldId);
					// formView._views = remainingViews;

					fieldView.destroy()
						.then(() => {

							doneFn();

						});
				}

			}

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
					padding: 10,
					rows: [
						{
							name: 'fields',
							view: 'list',
							select: false,
							minHeight: 200,
							template: _logic.listTemplate,
							type: {
								markCheckbox: function (item) {
									return "<span class='check webix_icon fa fa-" + (item.selected ? "check-" : "") + "square-o'></span>";
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
				name: 'clearOnSave',
				view: 'checkbox',
				label: L('ab.components.form.clearOnSave', "*Clear on save"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: "fieldset",
				label: L('ab.components.form.rules', '*Rules:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
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
									icon: "fa fa-gear",
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
									icon: "fa fa-gear",
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
									icon: "fa fa-gear",
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

	static propertyEditorPopulate(App, ids, view, logic) {

		super.propertyEditorPopulate(App, ids, view, logic);

		var formCom = view.parentFormComponent();
		var datacollectionId = (formCom.settings.dataviewID ? formCom.settings.dataviewID : null);
		var SourceSelector = $$(ids.datacollection);

		// Pull data collections to options
		var dcOptions = view.application.datacollections(dc => {

			var obj = dc.datasource;

			return dc.sourceType == "object" && obj && !obj.isImported;

		}).map((dc) => {

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
		SourceSelector.define('value', datacollectionId);
		SourceSelector.refresh();

		this.propertyUpdateFieldOptions(ids, view, datacollectionId);


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
		$$(ids.clearOnSave).setValue(view.settings.clearOnSave || ABViewFormPropertyComponentDefaults.clearOnSave);

		this.propertyUpdateRules(ids, view, datacollectionId);
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

		view.settings.dataviewID = $$(ids.datacollection).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue() || ABViewFormPropertyComponentDefaults.labelPosition;
		view.settings.labelWidth = $$(ids.labelWidth).getValue() || ABViewFormPropertyComponentDefaults.labelWidth;
		view.settings.height = $$(ids.height).getValue();
		view.settings.clearOnLoad = $$(ids.clearOnLoad).getValue();
		view.settings.clearOnSave = $$(ids.clearOnSave).getValue();

	}


	/**
	 * @method propertyUpdateFieldOptions
	 * Populate fields of object to select list in property
	 * 
	 * @param {Object} ids 
	 * @param {ABViewForm} view - the current component
	 * @param {string} dcId - id of ABDatacollection
	 */
	static propertyUpdateFieldOptions(ids, view, dcId) {

		var formComponent = view.parentFormComponent();
		var existsFields = formComponent.fieldComponents();
		var datacollection = view.application.datacollections(dc => dc.id == dcId)[0];
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
		var selectedDv = view.datacollection;
		if (selectedDv) {
			PopupDisplayRule.objectLoad(selectedDv.datasource);
			PopupRecordRule.objectLoad(selectedDv.datasource);
			PopupSubmitRule.objectLoad(selectedDv.datasource);
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
			allComponents = this.application.viewAll();

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
			let dv = this.datacollection;
			if (dv) {

				// listen DC events
				this.eventAdd({
					emitter: dv,
					eventName: 'changeCursor',
					listener: _logic.displayData
				});

				// bind the cursor event of the parent DC
				var linkDv = dv.datacollectionLink;
				if (linkDv) {

					// update the value of link field when data of the parent dc is changed
					this.eventAdd({
						emitter: linkDv,
						eventName: 'changeCursor',
						listener: _logic.displayParentData
					});

				}

			}

			// _onShow();

		}

		var _logic = this._logic = {
			
			callbacks:{
			
				onBeforeSaveData:function(){ return true },
				onSaveData:function(saveData){},
				clearOnLoad:function(){ return false }
			
			},

			displayData: (rowData) => {

				var customFields = this.fieldComponents((comp) => {
					return (comp instanceof ABViewFormCustom) ||
						// rich text
						((comp instanceof ABViewFormTextbox) && comp.settings.type == 'rich')
				});

				// Set default values
				if (rowData == null) {
					customFields.forEach((f) => {

						var field = f.field();
						if (!field) return;

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						// var colName = field.columnName;
						if (this._showed)
							comp.onShow();

						// set value to each components
						var defaultRowData = {};
						field.defaultValue(defaultRowData);
						field.setValue($$(comp.ui.id), defaultRowData);

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
					customFields.forEach((f) => {

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						if (this._showed)
							comp.onShow();

						// set value to each components
						if (f.field())
							f.field().setValue($$(comp.ui.id), rowData);
					});
				}
			},

			displayParentData: (rowData) => {

				let dv = this.datacollection;
				var currCursor = dv.getCursor();

				// If the cursor is selected, then it will not update value of the parent field
				if (currCursor != null) return;

				var Form = $$(ids.component),
					relationField = dv.fieldLink;

				if (relationField == null) return;

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
				formData[relationName] = rowData;

				// set data of parent to default value
				relationField.setValue(relationElem, formData);

			}

		};

		var _onShow = (data) => {

			this._showed = true;

			// call .onShow in the base component
			component.onShow();

			var Form = $$(ids.component);

			// var customFields = this.fieldComponents((comp) => {
			// 	return (comp instanceof ABViewFormCustom) ||
			// 		// rich text
			// 		((comp instanceof ABViewFormTextbox) && comp.settings.type == 'rich')
			// });
			// customFields.forEach((f) => {

			// 	var field = f.field();
			// 	if (!field) return;

			// 	var component = this.viewComponents[f.id];
			// 	if (!component) return;

			// 	// set value to each components
			// 	var rowData = {};
			// 	field.defaultValue(rowData);
			// 	field.setValue($$(component.ui.id), rowData);

			// });

			var dc = this.datacollection;
			if (dc) {

				if (Form)
					dc.bind(Form);

				// clear current cursor on load
				// if (this.settings.clearOnLoad || _logic.callbacks.clearOnLoad() ) {
				if (this.settings.clearOnLoad) {
					dc.setCursor(null);
					_logic.displayData(null);
				}

				// pull data of current cursor
				data = dc.getCursor();

				// do this for the initial form display so we can see defaults
				_logic.displayData(data);

				// select parent data to default value
				var linkDv = dc.datacollectionLink;
				if (data == null && linkDv) {

					var parentData = linkDv.getCursor();
					_logic.displayParentData(parentData);
				}
			}
			else {
				// show blank data in the form
				_logic.displayData(data);
			}

			//Focus on first focusable component
			this.focusOnFirst();

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
		if (fieldComponent == null)
			return;

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


	refreshDefaultButton(ids) {

		// If default button is not exists, then skip this
		let exists = this.views(v => !(v instanceof ABViewFormButton) && !v.settings.isDefault).length > 0;
		if (!exists) return;

		// Remove default save button
		this._views = (this._views || []).filter(v => !(v instanceof ABViewFormButton) && !v.settings.isDefault);

		// Add a default button
		var newButton = ABViewFormButton.newInstance(this.application, this);
		newButton.settings.isDefault = true;

		// Set to last item
		if ((this._views.length || 0) > ($$(ids.fields).length || 0))
			newButton.position.y = this._views.length;
		else
			newButton.position.y = $$(ids.fields).length;

		this._views.push(newButton);

		return newButton;

	}

	/**
	 * @method getFormValues
	 * 
	 * @param {webix form} formView 
	 * @param {ABObject} obj
	 * @param {ABDatacollection} dcLink [optional]
	 */
	getFormValues(formView, obj, dcLink) {

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
					formVals[f.columnName] = {};
					formVals[f.columnName][objectLink.PK()] = dcLink.getCursor().id;
				}

			});

		}

		return formVals;

	}


	/**
	 * @method validateData
	 * 
	 * @param {webix form} formView 
	 * @param {ABObject} object
	 * @param {object} formVals
	 * 
	 * @return {boolean} isValid
	 */
	validateData(formView, object, formVals) {

		var isValid = true;

		// validate required fields
		var requiredFields = this.fieldComponents(fComp => fComp.settings.required == true).map(fComp => fComp.field());
		requiredFields.forEach(f => {

			if (!formVals[f.columnName] && 
				formVals[f.columnName] != '0') {

				formView.markInvalid(f.columnName, '*This is a required field.');
				isValid = false;
			}

		});

		// validate data
		var validator;
		if (isValid) {
			validator = object.isValidData(formVals);
			isValid = validator.pass();
		}

		// if data is invalid
		if (!isValid) {

			let saveButton = formView.queryView({ view: 'button', type: "form" });

			// error message
			if (validator && validator.errors && validator.errors.length) {
				validator.errors.forEach(err => {
					formView.markInvalid(err.name, err.message);
				});

				if (saveButton)
					saveButton.disable();
			}
			else {

				if (saveButton)
					saveButton.enable();

			}
		}

		return isValid;
	}

	/**
	 * @method saveData
	 * save data in to database
	 * @param formView - webix's form element
	 * 
	 * @return {Promise}
	 */
	saveData(formView) {

		// call .onBeforeSaveData event
		// if this function returns false, then it will not go on.
		if (!this._logic.callbacks.onBeforeSaveData())
			return Promise.resolve();

		// form validate
		if (!formView || !formView.validate()) {
			// TODO : error message

			return Promise.resolve();
		}

		formView.clearValidation();

		// get ABDatacollection
		var dv = this.datacollection;
		if (dv == null) return Promise.resolve();

		// get ABObject
		var obj = dv.datasource;
		if (obj == null) return Promise.resolve();

		// get ABModel
		var model = dv.model;
		if (model == null) return Promise.resolve();

		// get update data
		var formVals = this.getFormValues(formView, obj, dv.datacollectionLink);

		// validate data
		if (!this.validateData(formView, obj, formVals)) {
			return Promise.resolve();
		}

		// show progress icon
		if (formView.showProgress)
			formView.showProgress({ type: "icon" });

		// form ready function
		var formReady = (newFormVals) => {

			// clear cursor after saving.
			if (dv) {
				if (this.settings.clearOnSave) {
					dv.setCursor(null);
					formView.clear();
				}
				else {

					if (newFormVals &&
						newFormVals.id)
						dv.setCursor(newFormVals.id);

				}
			}
			
			// if there was saved data pass it up to the onSaveData callback
			if (newFormVals) 
				this._logic.callbacks.onSaveData(newFormVals);

			if (formView.hideProgress)
				formView.hideProgress();
		};

		let formError = (err) => {

			let saveButton = formView.queryView({ view: 'button', type: "form" });

			if (err && err.invalidAttributes) {

				// mark error
				for (let attr in err.invalidAttributes) {

					let invalidAttrs = err.invalidAttributes[attr];
					if (invalidAttrs && invalidAttrs[0])
						invalidAttrs = invalidAttrs[0];

					formView.markInvalid(attr, invalidAttrs.message);
				}

			}

			if (saveButton)
				saveButton.enable();

			if (formView.hideProgress)
				formView.hideProgress();

		};

		return new Promise(
			(resolve, reject) => {


				// If this object already exists, just .update()
				if (formVals.id) {
					model.update(formVals.id, formVals)
						.catch((err) => {
							formError(err.data);
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
							formError(err.data);
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


	doRecordRules(rowData) {

		var object = this.datacollection.datasource;

		var RecordRules = new ABRecordRule();
		RecordRules.formLoad(this);
		RecordRules.fromSettings(this.settings.recordRules);
		RecordRules.objectLoad(object);
		
		return RecordRules.process({data:rowData, form:this });

	}

	doSubmitRules(rowData) {

		var object = this.datacollection.datasource;
		
		var SubmitRules = new ABSubmitRule();
		SubmitRules.formLoad(this);
		SubmitRules.fromSettings(this.settings.submitRules);
		SubmitRules.objectLoad(object);
		
		return SubmitRules.process({data:rowData, form:this });

	}



	focusOnFirst() {

		var topPosition = 0;
		var topPositionId = "";
		this.views().forEach((item) => {
			if(item.key == "textbox" || item.key == "numberbox") {
				if (item.position.y == topPosition) {
					topPosition = item.position.y;
					topPositionId = item.id;
				}
			}
		});
		var childComponent = this.viewComponents[topPositionId];
		if(childComponent && $$(childComponent.ui.id)) {
			$$(childComponent.ui.id).focus();
		}

	}

	// Use this function in kanban
	objectLoad(object) {
		this._currentObject = object;
	}



}