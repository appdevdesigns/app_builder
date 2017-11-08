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
	labelWidth: 120
}

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

		// convert from "0" => 0
		this.settings.labelWidth = parseInt(this.settings.labelWidth);

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


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

						_logic.addFieldToForm(f, yPosition);

						// update item to UI list
						f.selected = 1;
						$$(ids.fields).updateItem(f.id, f);
					}

				});

			}

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
				_logic.addFieldToForm(item);
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

		_logic.addFieldToForm = (field, yPosition) => {

			if (field == null)
				return;

			var FormView = _logic.currentEditObject();

			var newView = field.formComponent().newInstance(FormView.application, FormView);
			if (newView == null)
				return;

			// set settings to component
			newView.settings = newView.settings || {};
			newView.settings.fieldId = field.id;
			// TODO : Default settings

			if (yPosition != null)
				newView.position.y = yPosition;

			// add a new component
			FormView._views.push(newView);

			// update properties when a sub-view is destroyed
			newView.once('destroyed', () => { this.propertyEditorPopulate(ids, FormView); });

		}


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
				labelRight: L('ab.components.form.showlabel', "*Display Label"),
				labelWidth: App.config.labelCheckbox
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

		SourceSelector.define('options', dcOptions);
		SourceSelector.define('value', dataCollectionId);
		SourceSelector.refresh();

		this.propertyUpdateFieldOptions(ids, view, dataCollectionId);


		// update properties when a field component is deleted
		view.views().forEach((v) => {
			if (v instanceof ABViewFormField)
				v.once('destroyed', () => this.propertyEditorPopulate(ids, view));
		});

		$$(ids.datacollection).enable();
		$$(ids.showLabel).setValue(view.settings.showLabel || ABViewFormPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewFormPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewFormPropertyComponentDefaults.labelWidth);
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.datacollection = $$(ids.datacollection).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue();
		view.settings.labelWidth = $$(ids.labelWidth).getValue();

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
			view: "scrollview",
			body: {
				id: ids.component,
				view: 'form',
				rows: component.ui.rows
			}
		};


		// make sure each of our child views get .init() called
		var _init = (options) => {

			component.init(options);

			var Form = $$(ids.component);
			webix.extend(Form, webix.ProgressBar);


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

				dc.bind(Form);

				// listen DC events
				dc.removeListener('changeCursor', _logic.displayData)
					.on('changeCursor', _logic.displayData);

				// bind the cursor event of the parent DC
				var linkDc = dc.dataCollectionLink;
				if (linkDc) {

					// update the value of link field when data of the parent dc is changed
					linkDc.removeListener('changeCursor', _logic.displayParentData)
						.on('changeCursor', _logic.displayParentData);

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

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						var colName = f.field().columnName;

						// set value to each components
						var values = {};
						f.field().defaultValue(values);

						if (values[colName] != null)
							f.field().setValue($$(comp.ui.id), values[colName]);
					});
					var normalFields = this.fieldComponents((comp) => !(comp instanceof ABViewFormCustom));
					normalFields.forEach((f) => {

						var comp = this.viewComponents[f.id];
						if (comp == null) return;

						if (f.key != "button") {
							var colName = f.field().columnName;

							// set value to each components
							var values = {};
							f.field().defaultValue(values);

							if (values[colName] != null)
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

						var colName = f.field().columnName;
						var val = data[colName];

						if (f.field().key == "connectObject") {
							val = f.field().pullRelationValues(data);
						}

						// set value to each components
						// if (val != null) {
						f.field().setValue($$(comp.ui.id), val);
						// }
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

				var val = null;

				if (formData[relationName]) {

					// convert to array
					if (relationField.settings.linkType == 'many')
						formData[relationName] = [formData[relationName]];

					val = relationField.pullRelationValues(formData);

				}

				// set data of parent to default value
				relationField.setValue(relationElem, val);

			}

		};

		var _onShow = () => {

			var customFields = this.fieldComponents((comp) => comp instanceof ABViewFormCustom);
			customFields.forEach((f) => {

				var component = this.viewComponents[f.id];
				if (!component) return;

				var colName = f.field().columnName;

				// call .customDisplay again here
				component.onShow();

				// set value to each components
				var values = {};
				f.field().defaultValue(values);

				if (values[colName] != null)
					f.field().setValue($$(component.ui.id), values[colName]);
			});

			var data = null;
			var dc = this.dataCollection();
			if (dc) {
				data = dc.getCursor();

				// select parent data to default value
				var linkDc = dc.dataCollectionLink;
				if (data == null && linkDc) {

					var parentData = linkDc.getCursor();
					_logic.displayParentData(parentData);
				}
			}

			// do this for the initial form display so we can see defaults
			_logic.displayData(data);
			$$(ids.component).adjust();

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

			// clear undefined values
			for (var prop in formVals) {
				if (formVals[prop] == undefined)
					delete formVals[prop];
				else if (formVals[prop] == null)
					formVals[prop] = '';
			}

			// validate
			var validator = obj.isValidData(formVals);
			if (validator.pass()) {

				// show progress icon
				if (formView.showProgress)
					formView.showProgress({ type: "icon" });

				// form ready function
				var formReady = () => {
					if (formView.hideProgress)
						formView.hideProgress();
				}

				return new Promise(
					(resolve, reject) => {

						// update exists row
						if (formVals.id) {
							model.update(formVals.id, formVals)
								.catch((err) => {
									formReady();
									reject(err);
								})
								.then(() => {
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





}