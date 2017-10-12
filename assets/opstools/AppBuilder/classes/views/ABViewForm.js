/*
 * ABViewForm
 *
 * An ABViewForm is an ABView that allows you to choose an object and create 
 * special form controls for each of the Object's properties.
 *
 */

import ABViewFormPanel from "./ABViewFormPanel"
import ABViewFormCustom from "./ABViewFormCustom"

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
	labelWidth: 80
}

export default class ABViewForm extends ABViewFormPanel {

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

		return commonUI.concat([
			{
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.form.showlabel', "*Display Label")
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.form.labelPosition', "*Label Position"),
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
			}

		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

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
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewForm_' + this.id,
			ids = {
				component: App.unique(idBase + '_component'),
			};


		this.viewComponents = {}; // { viewId: viewComponent }

		// an ABViewForm_ is a collection of rows:
		var _ui = {
			view: "scrollview",
			body: {
				id: ids.component,
				view: 'form',
				elements: this.template.rows || []				
			}
		}

		// make sure each of our child views get .init() called
		var _init = (options) => {

			var Form = $$(ids.component);

			webix.extend(Form, webix.ProgressBar);

			// get a UI component for each of our child views
			this.views().forEach((v) => {

				var subComponent = v.component(App);

				this.viewComponents[v.id] = subComponent;

				// get element in template
				var elem = Form.queryView({ viewId: v.id });
				if (elem) {
					// replace component to layout
					webix.ui(subComponent.ui, elem);
				}
				// add component to rows
				else {
					Form.addView(subComponent.ui);
				}


				// initialize
				subComponent.init();


				// Trigger 'changePage' event to parent
				v.removeListener('changePage', _logic.changePage)
					.on('changePage', _logic.changePage);

			})


			// bind a data collection to form component
			var dc = this.dataCollection();
			if (dc) {
				dc.bind(Form);
			}
			
			// listen DC events
			if (dc) {

				dc.removeListener('changeCursor', _logic.displayData)
					.on('changeCursor', _logic.displayData);

			}


			Form.adjust();
		}

		var _logic = {

			changePage: (pageId) => {
				this.changePage(pageId);
			},
			
			displayData: (data) => {

				var customFields = this.fieldComponents((comp) => comp instanceof ABViewFormCustom);
				customFields.forEach((f) => {

					var colName = f.field().columnName;
					var val = data[colName];					

					if (f.field().key == "connectObject") {
						val = f.field().pullRelationValues(data);
					}

					// set value to each components
					if (val != null) {
						f.field().setValue($$(this.viewComponents[f.id].ui.id), val);						
					} else {
						// var default =
						var values = {};
						f.field().defaultValue(values);
						var columnName = colName;
						if ( typeof values[columnName] != "undefined" )
							f.field().setValue($$(this.viewComponents[f.id].ui.id), values[columnName]);
					}
				});

				var normalFields = this.fieldComponents((comp) => !(comp instanceof ABViewFormCustom));
				normalFields.forEach((f) => {

					if (f.key != "button") {
						var colName = f.field().columnName;
						var val = data[colName];
						
						console.log(colName);
						console.log(val);
						
						// set value to each components
						if (val == null || val == "") {
							var values = {};
							f.field().defaultValue(values);
							var columnName = colName;
							console.log(values);
							if ( typeof values[columnName] != "undefined" )
								f.field().setValue($$(this.viewComponents[f.id].ui.id), values[columnName]);
						}
					} 
				});


			}

		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic
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