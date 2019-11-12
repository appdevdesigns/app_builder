/*
 * ABViewKanban
 *
 * An ABViewKanban defines a UI label display component.
 *
 */
import ABViewWidget from "./ABViewWidget"

import ABWorkspaceKanban from "../../components/ab_work_object_workspace_kanban"
import ABWorkspaceViewKanban from "../ABObjectWorkspaceViewKanban"

import ABViewPropertyLinkPage from "./viewProperties/ABViewPropertyLinkPage"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

let ABViewKanbanPropertyComponentDefaults = {
	dataviewID: "", // uuid of ABDataview
	verticalGroupingField: "", // uuid of ABField
	horizontalGroupingField: "", // uuid of ABField
	ownerField: "", // uuid of ABField
};

let ABViewDefaults = {
	key: 'kanban',			// {string} unique key for this view
	icon: 'columns',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.kanban' // {string} the multilingual label key for the class label
};


export default class ABViewKanban extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		// OP.Multilingual.translate(this, this, ['text']);


	}

	static common() {
		return ABViewDefaults;
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

		var idBase = 'ABViewKanbanEditorComponent';

		var Kanban = this.component(App, idBase);

		return {
			ui: Kanban.ui,
			logic: Kanban.logic,
			onShow: Kanban.onShow,

			init: () => {

				// remove id of the component in caching for refresh .bind of the data collection
				let dv = this.dataview;
				if (dv)
					dv.removeComponent(Kanban.ui.id);

				Kanban.init();
			}
		};

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		let commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		let idBase = 'ABViewKanbanPropertyEditor';

		if (this._kanbanViewComponent == null)
			this._kanbanViewComponent = ABWorkspaceViewKanban.component(App, idBase);

		if (this._linkPageComponent == null)
			this._linkPageComponent = ABViewPropertyLinkPage.propertyComponent(App, idBase + "_gridlinkpage");

		// _logic functions

		_logic.selectSource = (dcId, oldDcId) => {

			var currView = _logic.currentEditObject();

			// Update field options in property
			this.propertyUpdateFieldOptions(ids, currView, dcId);

		};

		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.label.dataSource', '*Kanban Data:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							name: 'dataview',
							view: 'select',
							label: L('ab.components.list.dataSource', "*Data Source"),
							labelWidth: App.config.labelWidthXLarge,
							value: null,
							on: {
								onChange: _logic.selectSource
							}
						},
						{
							name: "vGroup",
							view: "select",
							label: L("ab.add_view.kanban.vGroup", "*Vertical Grouping"),
							placeholder: L("ab.add_view.kanban.grouping_placeholder", "*Select a field"),
							labelWidth: App.config.labelWidthXLarge,
							options: []
						},
						{
							name: "hGroup",
							view: "select",
							label: L("ab.add_view.kanban.hGroup", "*Horizontal Grouping"),
							placeholder: L("ab.add_view.kanban.grouping_placeholder", "*Select a field"),
							labelWidth: App.config.labelWidthXLarge,
							options: []
						},
						{
							name: "owner",
							view: "select",
							label: L("ab.add_view.kanban.owner", "*Card Owner"),
							placeholder: L("ab.add_view.kanban.owner_placeholder", "*Select a user field"),
							labelWidth: App.config.labelWidthXLarge,
							options: []
						}
					]
				}
			},
			this._linkPageComponent.ui
		]);

	}

	/**
	 * @method propertyUpdateFieldOptions
	 * Populate fields of object to select list in property
	 * 
	 * @param {Object} ids 
	 * @param {ABViewForm} view - the current component
	 * @param {string} dvId - id of ABDataview
	 */
	static propertyUpdateFieldOptions(ids, view, dvId) {

		let datacollection = view.application.datacollections(dc => dc.id == dvId)[0];
		let object = datacollection ? datacollection.datasource : null;

		// Refresh options of fields by call ABObjectWorkspaceViewKanban's function
		if (this._kanbanViewComponent) {
			this._kanbanViewComponent.logic.refreshOptions(
				object,
				view ? view.settings : null,
				{
					vGroupInput: $$(ids.vGroup),
					hGroupInput: $$(ids.hGroup),
					ownerInput: $$(ids.owner)
				});
		}


	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		let dataviewId = (view.settings.dataviewID ? view.settings.dataviewID : null);
		let SourceSelector = $$(ids.dataview);

		// Pull data collections to options
		let dcOptions = view.application.datacollections(dc => dc.settings && !dc.settings.isQuery).map((dc) => {
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
		SourceSelector.define('value', dataviewId);
		SourceSelector.refresh();

		this.propertyUpdateFieldOptions(ids, view, dataviewId);

		$$(ids.vGroup).setValue(view.settings.verticalGroupingField);
		$$(ids.hGroup).setValue(view.settings.horizontalGroupingField);
		$$(ids.owner).setValue(view.settings.ownerField);

		this._linkPageComponent.viewLoad(view);
		this._linkPageComponent.setSettings(view.settings);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataviewID = $$(ids.dataview).getValue();
		view.settings.verticalGroupingField = $$(ids.vGroup).getValue() || null;
		view.settings.horizontalGroupingField = $$(ids.hGroup).getValue() || null;
		view.settings.ownerField = $$(ids.owner).getValue() || null;

		// link pages
		let linkSettings = this._linkPageComponent.getSettings();
		for (let key in linkSettings) {
			view.settings[key] = linkSettings[key];
		}

	}

	component(App, idBase) {

		let baseCom = super.component(App);

		idBase = idBase || 'ABViewKanban_' + this.id;

		// let ids = {
		// 	component: App.unique(idBase + '_component')
		// }

		// let labels = {
		// 	common: App.labels
		// };

		let Kanban = new ABWorkspaceKanban(App, idBase);
		let LinkPage = this.linkPageHelper.component(App, idBase + "_kanbanlinkpage");
		let dataview = this.dataview;

		// Show empty data source UI
		let kanbanUI = {
			type: "space",
			rows: [
				{
					view: "label",
					label: "Select an object to load.",
					inputWidth: 200,
					align: "center"
				},
				{}
			]
		};

		if (dataview) {
			kanbanUI = Kanban.ui.cols[0];
		}

		let _init = () => {

			Kanban.init({
				onSelect: _logic.onSelect
			});

			if (dataview) {
				Kanban.dataviewLoad(dataview);

				// set fields
				let fieldSettings = {};
				let object = dataview.datasource;
				if (object) {

					Kanban.objectLoad(object);

					let verticalGrouping = object.fields(f => f.id == this.settings.verticalGroupingField)[0];
					if (verticalGrouping)
						fieldSettings.verticalGrouping = verticalGrouping;

					let horizontalGrouping = object.fields(f => f.id == this.settings.horizontalGroupingField)[0];
					if (horizontalGrouping)
						fieldSettings.horizontalGrouping = horizontalGrouping;

					let ownerField = object.fields(f => f.id == this.settings.ownerField)[0];
					if (ownerField)
						fieldSettings.ownerField = ownerField;
				}

				Kanban.setFields(fieldSettings);

			}

			// link page helper
			LinkPage.init({
				view: this,
				dataview: dataview
			});

		};

		// our internal business logic
		let _logic = {

			onSelect: (itemId) => {

				let page;
				if (this.settings.editPage)
					page = this.settings.editPage;
				else if (this.settings.detailsPage)
					page = this.settings.detailsPage;

				if (!page) return;

				// Pass settings to link page module
				if (LinkPage) {
					LinkPage.changePage(page, itemId);
				}

				super.changePage(page);

			}

		};

		let _onShow = () => {
			baseCom.onShow();

			Kanban.show();
		}

		return {
			ui: kanbanUI,
			init: _init,
			logic: _logic,

			onShow: _onShow
		};


	}

	get linkPageHelper() {

		if (this.__linkPageHelper == null)
			this.__linkPageHelper = new ABViewPropertyLinkPage();

		return this.__linkPageHelper;

	}


}