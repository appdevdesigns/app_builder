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
	dataviewID: null,
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 120,
	height: 0
}

export default class ABViewDetail extends ABViewContainer {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, (defaultValues || ABViewDetailDefaults));

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

		this.settings.labelPosition = this.settings.labelPosition || ABViewDetailPropertyComponentDefaults.labelPosition;

		// convert from "0" => true/false
		this.settings.showLabel = JSON.parse(this.settings.showLabel != null ? this.settings.showLabel : ABViewDetailPropertyComponentDefaults.showLabel);

		// convert from "0" => 0
		this.settings.labelWidth = parseInt(this.settings.labelWidth);
		this.settings.height = parseInt(this.settings.height);

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
				fields.forEach((f, index) => {

					if (!f.selected) {

						var yPosition = (fields.length - index - 1);

						currView.addFieldToView(f, yPosition, ids, App);

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
				currView.addFieldToView(item, null, ids, App);
			}
			// remove field in the form
			else {
				let fieldView = currView.views(c => c.settings.fieldId == fieldId)[0];
				if (fieldView) {
					let remainingViews = currView.views(c => c.settings.fieldId != fieldId);
					currView._views = remainingViews;

					// fieldView.destroy();
				}

			}

			// trigger a save()
			this.propertyEditorSave(ids, currView);

			// // Call REST API to server in ABViewContainer
			// currView.emit('properties.updated', currView);

		};

		return commonUI.concat([
			{
				name: 'dataview',
				view: 'richselect',
				label: L('ab.components.detail.dataSource', "*Data Source"),
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
						return "<span class='check webix_icon fa fa-" + (item.selected ? "check-" : "") + "square-o'></span>";
					}
				},
				onClick: {
					"check": _logic.check
				}
			},
			{
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.common.showlabel', "*Display Label"),
				labelWidth: App.config.labelWidthLarge,
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
				labelWidth: App.config.labelWidthLarge,
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.common.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			}

		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var SourceSelector = $$(ids.dataview);
		var dataviewId = view.settings.dataviewID || null;

		// Pull data views to options
		var dvOptions = view.application.dataviews().map((dc) => {

			return {
				id: dc.id,
				value: dc.label
			};
		});

		SourceSelector.define('options', dvOptions);
		SourceSelector.define('value', dataviewId);
		SourceSelector.refresh();


		this.propertyUpdateFieldOptions(ids, view, dataviewId);

		$$(ids.showLabel).setValue(view.settings.showLabel != null ? view.settings.showLabel : ABViewDetailPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewDetailPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(parseInt(view.settings.labelWidth) || ABViewDetailPropertyComponentDefaults.labelWidth);
		$$(ids.height).setValue( (view.settings.height >= 0) ? view.settings.height : ABViewDetailPropertyComponentDefaults.height);

		// update properties when a field component is deleted
		view.views().forEach((v) => {
			if (v instanceof ABViewDetailComponent)
				v.once('destroyed', () => this.propertyEditorPopulate(App, ids, view));
		});
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataviewID = $$(ids.dataview).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue();
		view.settings.labelWidth = $$(ids.labelWidth).getValue();
		view.settings.height = $$(ids.height).getValue();

	}

	static propertyUpdateFieldOptions(ids, view, dcId) {

		var dataview = view.application.dataviews(dc => dc.id == dcId)[0];
		var object = dataview ? dataview.datasource : null;


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
	* @param {string} idPrefix - define to support in 'Dataview' widget
	*
	* @return {obj } UI component
	*/
	component(App, idPrefix) {

		// get webix.dashboard
		var container = super.component(App, idPrefix);

		var _ui = {
			type: "form",
			borderless: true,
			// height: this.settings.height || ABViewDetailPropertyComponentDefaults.height,
			rows: [
				{
					// view: "scrollview",
					body: container.ui
				}
			]
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {

			// populate .views to webix.dashboard
			container.init(options);

		}

		var _logic = {

			displayData: (rowData) => {

				rowData = rowData || {};

				this.views().forEach((f) => {

					if (f.field) {
						var field = f.field();
						var val;

						if (!field) return;

						// get value of relation when field is a connect field
						switch(field.key) {
							case "connectObject":
								val = field.pullRelationValues(rowData);
								break;
							case "list":
								val = rowData[field.columnName];

								if (field.settings.isMultiple == 0) {
									let myVal = "";

									field.settings.options.forEach(function (options) {
										if (options.id == val)
											myVal = options.text;
									});

									if (field.settings.hasColors) {
										let myHex = "#66666";
										field.settings.options.forEach(function (h) {
											if (h.text == myVal)
												myHex = h.hex;
										});
										myVal = '<span class="selectivity-multiple-selected-item rendered" style="background-color:' + myHex + ' !important;">' + myVal + '</span>';
									}

									val = myVal;
								}
								break;
							case "user":
								val = rowData[field.columnName];

								if (field.settings.isMultiple == 0)
									val = val ? '<span class="selectivity-multiple-selected-item rendered" style="background-color:#eee !important; color: #666 !important; box-shadow: inset 0px 1px 1px #333;"><i style="opacity: 0.6;" class="fa fa-user"></i> ' + val + '</span>' : "";
								break;
							case "file":
								val = rowData[field.columnName];
								break;
							default:
								if (rowData) {
									val = field.format(rowData);
								}
								break;
						}
					}

					// set value to each components
					var vComponent = f.component(App, idPrefix);

					if (vComponent.onShow)
						vComponent.onShow();

					if (vComponent.logic &&
						vComponent.logic.setValue) {
						vComponent.logic.setValue(val);
					}
					
					if (vComponent.logic &&
						vComponent.logic.displayText) {
						vComponent.logic.displayText(rowData);
					}

				});

			}

		};

		var _onShow = () => {

			container.onShow();

			// listen DC events
			let dv = this.dataview;
			if (dv) {

				let currData = dv.getCursor();
				if (currData) {
					_logic.displayData(currData);
				}

				this.eventAdd({
					emitter: dv,
					eventName: 'changeCursor',
					listener: _logic.displayData
				})

			}

		};

		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _onShow
		}
	}



	/**
	* @method componentList
	* return the list of components available on this view to display in the editor.
	*/
	componentList() {
		var viewsToAllow = ['label', 'text'],
			allComponents = ABViewManager.allViews();

		return allComponents.filter((c) => {
			return viewsToAllow.indexOf(c.common().key) > -1;
		});
	}

	clearFieldComponents() {
		this.views().forEach((comp) => {
			comp.destroy();
		});
	}

	addFieldToView(field, yPosition, ids, App) {

		if (field == null)
			return;

		var newView = field.detailComponent().newInstance(this.application, this);
		if (newView == null)
			return;

		// set settings to component
		newView.settings = newView.settings || {};
		newView.settings.fieldId = field.id;

		// keep alias to support Query that contains alias name
		// [alias].[columnName]
		newView.settings.alias = field.alias;

		// TODO : Default settings

		newView.position.y = yPosition;

		// add a new component
		this._views.push(newView);


		// update properties when a sub-view is destroyed
		newView.once('destroyed', () => { ABViewDetail.propertyEditorPopulate(App, ids, this); });

	}

	copyUpdateProperyList() {

		return ['dataviewID'];

	}




}