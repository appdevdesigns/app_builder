/*
 * ABViewDetail
 *
 *
 *
 */

import ABViewDetailPanel from "./ABViewDetailPanel"

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

export default class ABViewDetail extends ABViewDetailPanel {

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

		return commonUI.concat([
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

		$$(ids.datacollection).enable();
		$$(ids.showLabel).setValue(view.settings.showLabel || ABViewDetailPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewDetailPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewDetailPropertyComponentDefaults.labelWidth);
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.datacollection = $$(ids.datacollection).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue();
		view.settings.labelWidth = $$(ids.labelWidth).getValue();

	}

	/*
	* @component()
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


		var _ui = {
			id: ids.component,
			view: 'layout',
			rows: this.template.rows || []
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {

			var Detail = $$(ids.component);

			// get a UI component for each of our child views
			this.views().forEach((v) => {

				var subComponent = v.component(App);

				viewComponents[v.id] = subComponent;


				// get element in template
				var elem = Detail.queryView({ viewId: v.id });
				if (elem) {
					// replace component to layout
					webix.ui(subComponent.ui, elem);
				}
				// add component to rows
				else {
					Detail.addView(subComponent.ui);
				}


				// initialize
				subComponent.init();

			})


			// listen DC events
			var dc = this.dataCollection();
			if (dc) {

				dc.removeListener('changeCursor', _logic.displayData)
					.on('changeCursor', _logic.displayData);

			}


			Detail.adjust();

		}

		var _logic = {

			displayData: (data) => {

				this.fieldComponents().forEach((f) => {

					var field = f.field();
					var val;

					// get value of relation when field is a connect field
					if (field.key == "connectObject") {
						val = field.pullRelationValues(data);
					}
					else {
						val = data[field.columnName];
					}


					// set value to each components
					viewComponents[f.id].logic.setValue(val);

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
	 * return ABViewDataCollection of this detail
	 * 
	 * @return {ABViewDataCollection}
	 */
	dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.datacollection)[0];
	}



}