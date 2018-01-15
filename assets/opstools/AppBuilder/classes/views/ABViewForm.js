/*
 * ABViewForm
 *
 * An ABViewForm is an ABView that allows you to choose an object and create 
 * special form controls for each of the Object's properties.
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABViewFormCustom from "./ABViewFormCustom"
import ABViewFormDatepicker from "./ABViewFormDatepicker"
import ABViewFormField from "./ABViewFormField"
import ABViewManager from "../ABViewManager"
import ABPropertyComponent from "../ABPropertyComponent"

import ABDisplayRule from "./ABViewFormPropertyDisplayRule"
import ABRecordRule from "./ABViewFormPropertyRecordRule"
import ABSubmitRule from "./ABViewFormPropertySubmitRule"

import RowFilter from '../RowFilter'

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
		PopupRecordRule = new ABRecordRule(App, idBase + "_recordrule");
		PopupSubmitRule = new ABSubmitRule(App, idBase + "_submitrule");


		// _logic functions

		_logic.selectSource = (dcId, oldDcId) => {

			// TODO : warning message

			var currView = _logic.currentEditObject();
			var formView = currView.formComponent();

			// remove all old field components
			if (oldDcId != null)
				formView.clearFieldComponents();

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
						newFieldView.once('destroyed', () => this.propertyEditorPopulate(ids, currView));

						// update item to UI list
						f.selected = 1;
						$$(ids.fields).updateItem(f.id, f);
					}

				});

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
				fieldView.once('destroyed', () => this.propertyEditorPopulate(ids, currView));
			}
			// remove field in the form
			else {
				var formView = currView.formComponent();
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

			PopupRecordRule.setValue(currView.settings.recordRules);
			PopupRecordRule.show();

		};

		_logic.recordRuleSave = (settings) => {

			var currView = _logic.currentEditObject();
			currView.settings.recordRules = settings;

			// trigger a save()
			this.propertyEditorSave(ids, currView);

		};


		// Submit rule
		_logic.submitRuleShow = () => {

			var currView = _logic.currentEditObject();

			PopupSubmitRule.setValue(currView.settings.submitRules);
			PopupSubmitRule.show();

		};

		_logic.submitRuleSave = (settings) => {

			var currView = _logic.currentEditObject();
			currView.settings.submitRules = settings;

			// trigger a save()
			this.propertyEditorSave(ids, currView);

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
			},
			{
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.form.showlabel', "*Display Label"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.form.labelPosition', "*Label Position"),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{
						id: 'left',
						value: L('ab.components.form.left', "*Left")
					},
					{
						id: 'top',
						value: L('ab.components.form.top', "*Top")
					}
				]
			},
			{
				name: 'labelWidth',
				view: 'counter',
				label: L('ab.components.form.labelWidth', "*Label Width"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.form.height", "*Height:"),
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
				label: L('ab.component.form.rules', '*Rules:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.form.submitRules", "*Submit Rules:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonSubmitRules",
									label: L("ab.component.form.settings", "*Settings"),
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
									label: L("ab.component.form.displayRules", "*Display Rules:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonDisplayRules",
									label: L("ab.component.form.settings", "*Settings"),
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
									label: L("ab.component.form.recordRules", "*Record Rules:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonRecordRules",
									label: L("ab.component.form.settings", "*Settings"),
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

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var formCom = view.formComponent();
		var dataCollectionId = formCom.settings.datacollection;
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
				v.once('destroyed', () => this.propertyEditorPopulate(ids, view));
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

		var formComponent = view.formComponent();
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

		var idBase = 'ABViewForm_' + this.id,
			ids = {
				component: App.unique(idBase + '_component'),
				layout: App.unique(idBase + '_form_layout'),
			};

		var component = super.component(App);

		this.viewComponents = this.viewComponents || {}; // { fieldId: viewComponent }

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

			component.init(options);

			var Form = $$(ids.component);
			if (Form) {
				webix.extend(Form, webix.ProgressBar);
			}


			// attach all the .UI views:
			var subviews = this.views();
			subviews.forEach((child) => {

				var subComponent = child.component(App);

				this.viewComponents[child.id] = subComponent;

				subComponent.init();

			});


			// bind a data collection to form component
			var dc = this.dataCollection();
			if (dc) {

				// listen DC events
				if (this.changeCursorEventId == null)
					this.changeCursorEventId = dc.on('changeCursor', _logic.displayData);

				// bind the cursor event of the parent DC
				var linkDc = dc.dataCollectionLink;
				if (linkDc) {

					// update the value of link field when data of the parent dc is changed
					if (this.changeParentCursorEventId == null)
						this.changeParentCursorEventId = linkDc.on('changeCursor', _logic.displayParentData);

				}

			}

			_onShow();

		}


		var _logic = {

			displayData: (data) => {

				// Set default values
				if (data == null) {
					var customFields = this.fieldComponents((comp) => comp instanceof ABViewFormCustom);
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

							if (values[colName] != null && $$(comp.ui.id).setValue)
								$$(comp.ui.id).setValue(values[colName]);
						}
					});
				}

				// Populate value to custom fields
				else {
					var customFields = this.fieldComponents((comp) => comp instanceof ABViewFormCustom);
					customFields.forEach((f) => {

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						// set value to each components
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

					return (comp.field().id == relationField.id);
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

			var Form = $$(ids.component);

			var customFields = this.fieldComponents((comp) => comp instanceof ABViewFormCustom);
			customFields.forEach((f) => {

				var field = f.field();
				if (!field) return;

				var component = this.viewComponents[f.id];
				if (!component) return;

				var colName = field.columnName;

				// call .customDisplay again here
				component.onShow();

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
				if (this.settings.clearOnLoad) {
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
	 * @method formComponent()
	 *
	 * return a form component
	 *
	 * @return {ABViewForm}
	 */
	formComponent() {
		var form = null;
		var curr = this;

		while (curr.key != 'form' && !curr.isRoot() && curr.parent) {
			curr = curr.parent;
		}

		if (curr.key == 'form') {
			form = curr;
		}

		return form;
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

	clearFieldComponents() {
		this.fieldComponents().forEach((comp) => {
			comp.destroy();
		});
	}

	addFieldToForm(field, yPosition) {

		if (field == null)
			return;

		var formView = field.formComponent();

		var newView = formView.newInstance(this.application, this);
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

			// validate
			var validator = obj.isValidData(formVals);
			if (validator.pass()) {

				// show progress icon
				if (formView.showProgress)
					formView.showProgress({ type: "icon" });

				// form ready function
				var formReady = () => {

					// when add a new data, then clear form inputs
					if (dc) {
						var currCursor = dc.getCursor();
						if (currCursor == null) {
							formView.clear();
						}
					}

					if (formView.hideProgress)
						formView.hideProgress();
				}

				return new Promise(
					(resolve, reject) => {

						this.doRecordRules(formVals);

						// update exists row
						if (formVals.id) {
							model.update(formVals.id, formVals)
								.catch((err) => {
									formReady();
									reject(err);
								})
								.then(() => {

									this.doSubmitRules(formVals);

									formReady();
									resolve();
								});
						}
						// add new row
						else {
							model.create(formVals)
								.catch((err) => {
									formReady();
									reject(err);
								})
								.then(() => {

									this.doSubmitRules(formVals);

									formReady();
									resolve();
								});
						}
					}
				);

			}
			else {
				// TODO : error message

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

		var recordRules = this.settings.recordRules || [];
		recordRules.forEach(r => {

			var filterer = new RowFilter();
			filterer.objectLoad(object);
			filterer.setValue(r.when);
			var isMatch = filterer.isValid(rowData);

			if (isMatch) {
				switch (r.action) {

					case "updateThisRecord":

						r.values.forEach(updateVal => {

							var fieldInfo = object.fields(f => f.id == updateVal.fieldId)[0];
							if (!fieldInfo) return;

							rowData[fieldInfo.columnName] = updateVal.value;
						});

						break;

				}
			}

		});

	}

	doSubmitRules(rowData) {

		var object = this.dataCollection().datasource;

		var submitRules = this.settings.submitRules || [];
		submitRules.forEach(r => {

			var filterer = new RowFilter();
			filterer.objectLoad(object);
			filterer.setValue(r.when);
			var isMatch = filterer.isValid(rowData);

			if (isMatch) {
				switch (r.action) {

					case "message":
						webix.message({
							text: r.value,
							type: "info"
						});
						break;

					case "parentPage":
						var pageCurrent = this.pageParent();
						var pageParent = pageCurrent.pageParent().id;

						this.changePage(pageParent.id);
						break;

					case "existsPage":
						this.changePage(r.value);
						break;

					case "website":
						window.location.href = "http://" + r.value.replace("http://", "");
						break;
				}
			}


		});

	}





}