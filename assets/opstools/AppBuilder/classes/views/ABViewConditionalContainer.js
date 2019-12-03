/*
 * ABViewConditionalContainer
 *
 * An ABViewConditionalContainer defines a UI menu component.
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABViewManager from "../ABViewManager"
import RowFilter from "../RowFilter"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewPropertyDefaults = {
	dataviewID: null,
	filterConditions: {}
}

var ABViewDefaults = {
	key: 'conditionalcontainer',	// unique key identifier for this ABView
	icon: 'shield',					// icon reference: (without 'fa-' )
	labelKey: 'ab.components.conditionalcontainer' // {string} the multilingual label key for the class label
}

var FilterComponent = null;

export default class ABViewConditionalContainer extends ABViewContainer {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 * @param {obj} defaultValues special sub class defined default values.
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, (defaultValues || ABViewDefaults));

		// the conditional container always has 'If' and 'Else' panels
		if (this.views(v => v instanceof ABViewContainer).length < 2) {

			// 'If' panel
			var ifPanel = ABViewManager.newView({
				key: ABViewContainer.common().key,
				label: 'If',
				settings: {
					removable: false
				}
			}, application, this);
			this._views.push(ifPanel);

			// 'Else' panel
			var elsePanel = ABViewManager.newView({
				key: ABViewContainer.common().key,
				label: 'Else',
				settings: {
					removable: false
				}
			}, application, this);
			this._views.push(elsePanel);

		}

		// Set filter value
		this.__filterComponent = new RowFilter();
		this.populateFilterComponent();
	}

	static common() {
		return ABViewDefaults;
	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		var idBase = 'ABViewConditionalContainerPropertyEditor';

		_logic.changeDataview = (dvId) => {

			var view = _logic.currentEditObject();

			this.populatePopupEditors(ids, view, dvId);

		};

		_logic.showFilterPopup = ($view) => {

			this.filter_popup.show($view, null, { pos: "top" });
		};

		_logic.onFilterChange = () => {

			var view = _logic.currentEditObject();

			var filterValues = FilterComponent.getValue();

			view.settings.filterConditions = filterValues;

			var allComplete = true;
			filterValues.rules.forEach((f) => {

				// if all 3 fields are present, we are good.
				if ((f.key)
					&& (f.rule)
					&& (f.value)) {

					allComplete = allComplete && true;
				} else {

					// else, we found an entry that wasn't complete:
					allComplete = false;
				}
			})

			// only perform the update if a complete row is specified:
			if (allComplete) {

				// we want to call .save() but give webix a chance to properly update it's 
				// select boxes before this call causes them to be removed:
				setTimeout(() => {
					this.propertyEditorSave(ids, view);
				}, 10);

			}

			this.populateBadgeNumber(ids, view);

		};

		FilterComponent = new RowFilter(App, idBase + "_filter");
		FilterComponent.init({
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			onChange: _logic.onFilterChange
		});

		this.filter_popup = webix.ui({
			view: "popup",
			width: 800,
			hidden: true,
			body: FilterComponent.ui
		});


		return commonUI.concat([
			{
				name: 'dataview',
				view: 'richselect',
				label: L('ab.components.conditionalcontainer.dataSource', "*Data Source"),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: function (dvId) {
						_logic.changeDataview(dvId);
					}
				}
			},
			{
				view: "fieldset",
				name: "filter",
				label: L('ab.component.conditionalcontainer.advancedOptions', '*Filter:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.conditionalcontainer.filterData", "*Filter Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonFilter",
									label: L("ab.component.conditionalcontainer.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.showFilterPopup(this.$view);
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

		var dataviewId = (view.settings.dataviewID ? view.settings.dataviewID : null);
		var SourceSelector = $$(ids.dataview);

		// Pull data collections to options
		var dcOptions = view.application.dataviews().map((dv) => {

			return {
				id: dv.id,
				value: dv.label
			};
		});

		dcOptions.unshift({
			id: null,
			value: '[Select]'
		});
		SourceSelector.define('options', dcOptions);
		SourceSelector.define('value', dataviewId);
		SourceSelector.refresh();

		this.populatePopupEditors(ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataviewID = $$(ids.dataview).getValue();

	}

	static populatePopupEditors(ids, view, dataviewId) {

		// pull current data collection
		var dv = view.dataview;

		// specify data collection id
		if (dataviewId) {
			dv = view.application.dataviews(d => d.id == dataviewId)[0];
		}

		if (dv && dv.datasource) {
			FilterComponent.objectLoad(dv.datasource);
			view.__filterComponent.objectLoad(dv.datasource);
		}
		else {
			FilterComponent.objectLoad(null);
			view.__filterComponent.objectLoad(null);
		}

		FilterComponent.setValue(view.settings.filterConditions || ABViewPropertyDefaults.filterConditions);
		view.__filterComponent.setValue(view.settings.filterConditions || ABViewPropertyDefaults.filterConditions);

		this.populateBadgeNumber(ids, view);

	}

	static populateBadgeNumber(ids, view) {

		if (view.settings.filterConditions &&
			view.settings.filterConditions.rules) {
			$$(ids.buttonFilter).define('badge', view.settings.filterConditions.rules.length);
			$$(ids.buttonFilter).refresh();
		}
		else {
			$$(ids.buttonFilter).define('badge', 0);
			$$(ids.buttonFilter).refresh();
		}

	}

	save() {

		// Because conditional container has always IF and ELSE containers, then it should be include them to call save too
		let includeSubViews = true;

		return super.save(includeSubViews);
	}

	/**
	* @method component()
	* return a UI component based upon this view.
	* @param {obj} App 
	* @return {obj} UI component
	*/
	component(App) {

		var idBase = 'ABViewConditionalContainer_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var baseComp = super.component(App);

		var ifComp = this.views()[0].component(App),
			elseComp = this.views()[1].component(App);

		ifComp.ui.batch = 'if';
		elseComp.ui.batch = 'else';

		var _ui = {
			id: ids.component,
			view: "multiview",
			cells: [
				{
					batch: "wait",
					view: 'layout',
					rows: [
						{
							view: 'label',
							label: "Please wait..."
						}
					]
				},
				ifComp.ui,
				elseComp.ui
			]
		};

		var _init = (options) => {

			baseComp.init(options);

			this.populateFilterComponent();

			var dv = this.dataview;
			if (dv) {

				// listen DC events
				this.eventAdd({
					emitter: dv,
					eventName: 'loadData',
					listener: _logic.displayView
				});

				this.eventAdd({
					emitter: dv,
					eventName: 'changeCursor',
					listener: _logic.displayView
				});

			}

			_logic.displayView();

		};

		var _logic = {

			displayView: (currData) => {

				let dv = this.dataview;
				if (dv) {

					if (currData == null) {
						currData = dv.getCursor();
					}

					// show 'waiting' panel
					if (!currData &&
						(dv.dataStatus == dv.dataStatusFlag.notInitial ||
						 dv.dataStatus == dv.dataStatusFlag.initializing)) {
						$$(ids.component).showBatch('wait');
						return;
					}

				}

				var isValid = this.__filterComponent.isValid(currData);
				if (isValid) {
				// if (isValid && currData) {
					$$(ids.component).showBatch('if');
				}
				else {
					$$(ids.component).showBatch('else');
				}

			}

		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: baseComp.onShow
		}

	}

	populateFilterComponent() {

		let dv = this.dataview;
		if (dv && dv.datasource)
			this.__filterComponent.objectLoad(dv.datasource);
		else
			this.__filterComponent.objectLoad(null);

		this.__filterComponent.viewLoad(this);
		this.__filterComponent.setValue(this.settings.filterConditions || ABViewPropertyDefaults.filterConditions);

	}

}