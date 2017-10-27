/*
 * ABViewDetail
 *
 *
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewDetailComponent from "./ABViewDetailComponent"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewDetailDefaults = {
	key: 'detail',		// {string} unique key for this view
	icon: 'file-text-o',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail' // {string} the multilingual label key for the class label
}

var ABViewDetailPropertyComponentDefaults = {
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 80
}

export default class ABViewDetail extends ABViewContainer {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailDefaults);

	}

	static common() {
		return ABViewDetailDefaults;
	}


	///
	/// Instance Methods
	///



	//
	// Property Editor
	// 

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

			// remove all old field components
			if (oldDcId != null)
				currView.clearFieldComponents();

			// Update field options in property
			this.propertyUpdateFieldOptions(ids, currView, dcId);

			// add all fields to editor by default
			if (currView._views.length < 1) {

				var fields = $$(ids.fields).find({});
				fields.reverse();
				fields.forEach((f) => {

					if (!f.selected) {

						_logic.addFieldToView(f);

						// update item to UI list
						f.selected = 1;
						$$(ids.fields).updateItem(f.id, f);
					}

				});

			}

		};

		_logic.listTemplate = (field, common) => {

			return common.markCheckbox(field) + " #label#"
				.replace("#label#", field.label);

		};

		_logic.check = (e, fieldId) => {

			var currView = _logic.currentEditObject();

			// update UI list
			var item = $$(ids.fields).getItem(fieldId);
			item.selected = item.selected ? 0 : 1;
			$$(ids.fields).updateItem(fieldId, item);

			// add a field to the form
			if (item.selected) {
				_logic.addFieldToView(item);
			}
			// remove field in the form
			else {
				var fieldView = currView.views(c => c.settings.fieldId == fieldId)[0];

				if (fieldView)
					fieldView.destroy();

			}

			// trigger a save()
			this.propertyEditorSave(ids, currView);

		};


		_logic.addFieldToView = (field) => {

			if (field == null)
				return;

			var detailView = _logic.currentEditObject();

			var newView = field.detailComponent().newInstance(detailView.application, detailView);
			if (newView == null)
				return;

			// set settings to component
			newView.settings = newView.settings || {};
			newView.settings.fieldId = field.id;
			// TODO : Default settings

			// add a new component
			detailView._views.push(newView);

			// update properties when a sub-view is destroyed
			newView.once('destroyed', () => { this.propertyEditorPopulate(ids, detailView); });

		}

		return commonUI.concat([
			{
				name: 'datacollection',
				view: 'richselect',
				label: L('ab.components.detail.dataSource', "*Data Source"),
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
				label: L('ab.components.detail.showlabel', "*Display Label")
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.detail.labelPosition', "*Label Position"),
				options: [
					{
						id: 'left',
						value: L('ab.components.detail.left', "*Left")
					},
					{
						id: 'top',
						value: L('ab.components.detail.top', "*Top")
					}
				]
			},
			{
				name: 'labelWidth',
				view: 'counter',
				label: L('ab.components.detail.labelWidth', "*Label Width"),
			}

		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var SourceSelector = $$(ids.datacollection);
		var dataCollectionId = view.settings.datacollection;

		// Pull data collections to options
		var dcOptions = view.pageRoot().dataCollections().map((dc) => {

			return {
				id: dc.id,
				value: dc.label
			};
		});

		SourceSelector.define('options', dcOptions);
		SourceSelector.refresh();
		SourceSelector.setValue(dataCollectionId);


		this.propertyUpdateFieldOptions(ids, view, dataCollectionId);

		$$(ids.showLabel).setValue(view.settings.showLabel || ABViewDetailPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewDetailPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewDetailPropertyComponentDefaults.labelWidth);

		// update properties when a field component is deleted
		view.views().forEach((v) => {
			if (v instanceof ABViewDetailComponent)
				v.once('destroyed', () => this.propertyEditorPopulate(ids, view));
		});
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.datacollection = $$(ids.datacollection).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue();
		view.settings.labelWidth = $$(ids.labelWidth).getValue();

	}

	static propertyUpdateFieldOptions(ids, view, dcId) {

		var datacollection = view.pageRoot().dataCollections(dc => dc.id == dcId)[0];
		var object = datacollection ? datacollection.datasource : null;


		// Pull field list
		var fieldOptions = [];
		if (object != null) {
			fieldOptions = object.fields().map((f) => {

				f.selected = view.views((com) => { return f.id == com.settings.fieldId; }).length > 0;

				return f;

			});
		}

		$$(ids.fields).clearAll();
		$$(ids.fields).parse(fieldOptions);

	}

	/**
	* @method component()
	* return a UI component based upon this view.
	* @param {obj } App 
	* @return {obj } UI component
	*/
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = {}; // { viewId: viewComponent }

		var idBase = 'ABViewDetail_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		// get webix.dashboard
		var container = super.component(App);

		var _ui = {
			type: "form",
			borderless: true,
			rows: [
				{
					view: "scrollview",
					body: container.ui					
				}
			]
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {

			// populate .views to webix.dashboard
			container.init(options);


			// listen DC events
			var dc = this.dataCollection();
			if (dc) {

				dc.removeListener('changeCursor', _logic.displayData)
					.on('changeCursor', _logic.displayData);

			}

		}

		var _logic = {

			displayData: (data) => {

				this.views().forEach((f) => {

					var field = f.field();
					var val;

					// get value of relation when field is a connect field
					if (field.key == "connectObject") {
						val = field.pullRelationValues(data);
					}
					else {
						val = data[field.columnName];
					}

					if (field.key == "date") {
						val = field.format(data[field.columnName]);
					}

					if (field.key == "list" && field.settings.isMultiple == 0) {
						let myVal = "";
						let selected = field.settings.options.forEach(function (options) {
							if (options.id == val)
								myVal = options.text;
						});
						
						if (field.settings.hasColors) {
							let myHex = "#66666";
							field.settings.options.forEach(function(h) {
								if (h.text == myVal)
									myHex = h.hex;
							});
							myVal = '<span class="selectivity-multiple-selected-item rendered" style="background-color:'+myHex+' !important;">'+myVal+'</span>';
						}				
						
						val = myVal;
					}

					if (field.key == "number") {
						val = field.getNumberFormat(data[field.columnName]);
					}

					if (field.key == "user" && field.settings.isMultiple == 0 && val != "") {
						if (val == null) {
							val = "";
						} else {
							val = '<span class="selectivity-multiple-selected-item rendered" style="background-color:#eee !important; color: #666 !important; box-shadow: inset 0px 1px 1px #333;"><i style="opacity: 0.6;" class="fa fa-user"></i> '+val+'</span>';
						}
					}

					// set value to each components
					var vComponent = f.component(App);
					vComponent.logic.setValue(val);

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
	* @method componentList
	* return the list of components available on this view to display in the editor.
	*/
	componentList() {
		var viewsToAllow = ['label'],
			allComponents = ABViewManager.allViews();

		return allComponents.filter((c) => {
			return viewsToAllow.indexOf(c.common().key) > -1;
		});
	}



	/**
	 * @method dataCollection
	 * return ABViewDataCollection of this detail
	 * 
	 * @return {ABViewDataCollection}
	 */
	dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.datacollection)[0];
	}


	clearFieldComponents() {
		this.views().forEach((comp) => {
			comp.destroy();
		});
	}




}