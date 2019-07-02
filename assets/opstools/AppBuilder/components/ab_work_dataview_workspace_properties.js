import ABPopupSortField from "./ab_work_object_workspace_popupSortFields"
import RowFilter from "../classes/RowFilter"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class AB_Work_Dataview_Workspace_Properties extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_dataview_workspace_properties');

		this.App = App;

		this.labels = {
			common: App.labels,
			component: {
				properties: L('ab.dataview.properties', "*Properties"),
			}
		};

		this.ids = {
			dataSource: this.unique('dataSource'),
			linkDataSource: this.unique('linkDataSource'),
			linkField: this.unique('linkField'),
			loadAll: this.unique('loadAll'),
			fixSelect: this.unique('fixSelect'),

			filterPanel: this.unique('filterPanel'),
			sortPanel: this.unique('sortPanel')
		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
		this.dataviewLoad = this._logic.dataviewLoad;

	}

	get ui() {

		let ids = this.ids;

		return {
			view: 'layout',
			width: 350,
			rows: [
				{
					view: 'toolbar',
					css: 'ab-data-toolbar webix_dark',
					cols: [
						{
							view: 'label',
							label: this.labels.component.properties
						}
					]
				},
				{
					view: "scrollview",
					body: {
						view: 'layout',
						padding: 5,
						rows: [

							{
								view: "fieldset",
								label: L('ab.component.datacollection.dataSource', '*Data Source:'),
								labelWidth: this.App.config.labelWidthLarge,
								body: {
									type: "clean",
									padding: 10,
									rows: [
										{
											id: ids.dataSource,
											view: "richselect",
											name: "dataSource",
											label: L('ab.component.datacollection.source', '*Source:'),
											labelWidth: this.App.config.labelWidthLarge,
											options: {
												data: []
											},
											on: {
												onChange: (newv, oldv) => {
													if (newv == oldv) return;

													this._logic.selectSource(newv, oldv);
												}
											}
										},
										// link to another data collection
										{
											id: ids.linkDataSource,
											view: "select",
											name: "linkDataSource",
											label: L('ab.component.datacollection.linkDataSource', '*Linked To:'),
											labelWidth: this.App.config.labelWidthLarge,
											options: [],
											hidden: 1
										},
										{
											id: ids.linkField,
											view: "select",
											name: "linkField",
											label: L('ab.component.datacollection.linkedField', '*Linked Field:'),
											labelWidth: this.App.config.labelWidthLarge,
											options: [],
											hidden: 1
										}
									]
								}
							},
							{
								view: "fieldset",
								name: "advancedOption",
								label: L('ab.component.datacollection.advancedOptions', '*Advanced Options:'),
								labelWidth: this.App.config.labelWidthLarge,
								body: {
									type: "clean",
									padding: 10,
									rows: [
										{
											id: ids.filterPanel,
											name: "filterPanel",
											cols: [
												{
													view: "label",
													label: L("ab.component.datacollection.filterData", "*Filter Data:"),
													width: this.App.config.labelWidthLarge,
												},
												{
													view: "button",
													name: "buttonFilter",
													label: L("ab.component.datacollection.settings", "*Settings"),
													icon: "fa fa-gear",
													type: "icon",
													badge: 0,
													click: function () {
														_logic.showFilterPopup(this.$view);
													}
												}
											]
										},
										{
											id: ids.sortPanel,
											name: "sortPanel",
											cols: [
												{
													view: "label",
													label: L("ab.component.datacollection.sortData", "*Sort Data:"),
													width: this.App.config.labelWidthLarge,
												},
												{
													view: "button",
													name: "buttonSort",
													label: L("ab.component.datacollection.settings", "*Settings"),
													icon: "fa fa-gear",
													type: "icon",
													badge: 0,
													click: function () {
														_logic.showSortPopup(this.$view);
													}
												}
											]
										},
										{
											cols: [
												{
													view: "label",
													label: L("ab.component.datacollection.loadAll", "*Load all:"),
													width: this.App.config.labelWidthLarge,
												},
												{
													id: ids.loadAll,
													view: "checkbox",
													name: "loadAll",
													label: ""
												}
											]
										},
										{
											id: ids.fixSelect,
											view: "select",
											name: "fixSelect",
											label: L('ab.component.datacollection.fixSelect', '*Select:'),
											labelWidth: this.App.config.labelWidthLarge,
											options: []
										}
									]
								}
							}

						]
					}
				}
			]

		};
	}

	init() {

	}

	get _logic() {

		return {

			applicationLoad: (application) => {

				this._application = application;

				let ids = this.ids;
				let datasources = [];

				// Objects
				var objects = application.objects().map((obj) => {
					return {
						id: obj.id,
						value: obj.label,
						icon: 'fa fa-database'
					}
				});
				datasources = datasources.concat(objects);

				// Queries
				var queries = application.queries().map((q) => {
					return {
						id: q.id,
						value: q.label,
						icon: 'fa fa-filter',
						disabled: q.isDisabled()
					}
				});
				datasources = datasources.concat(queries);

				datasources.unshift({ id: '', value: L('ab.dataview.selectSource', '*Select a source') });

				$$(ids.dataSource).define("options", {
					body: {
						scheme: {
							$init: function (obj) {
								if (obj.disabled)
									obj.$css = "disabled";
							}
						},
						data: datasources
					}
				});

				$$(ids.dataSource).refresh();

			},

			dataviewLoad: (dataview) => {

				let ids = this.ids;

				this._dataview = dataview;

				let settings = {};

				if (dataview) {
					settings = dataview.settings || {};
				}

				// populate link data collection options
				this._logic.initLinkDataCollectionOptions();

				// populate link fields
				this._logic.initLinkFieldOptions();

				// // initial populate of popups
				// this._logic.populatePopupEditors(view);

				// this._logic.populateBadgeNumber(ids, view);

				// // populate data items to fix select options
				// let object = dataview.datasource;
				// this._logic.populateFixSelector(ids, view, object);

				// if selected soruce is a query, then hide advanced options UI
				if (settings.isQuery) {
					$$(ids.filterPanel).hide();
					$$(ids.sortPanel).hide();
				}
				else {
					$$(ids.filterPanel).show();
					$$(ids.sortPanel).show();
				}

				$$(ids.dataSource).setValue(settings.datasourceID);
				$$(ids.linkDataSource).setValue(settings.linkDatasourceID);
				$$(ids.linkField).setValue(settings.linkFieldID);
				$$(ids.loadAll).setValue(settings.loadAll);
				$$(ids.fixSelect).setValue(settings.fixSelect);

			},

			initLinkDataCollectionOptions: (settings) => {

				let ids = this.ids;

				// get linked data collection list
				let objSource = this._dataview ? this._dataview.datasource : null;
				if (objSource != null) {
					let linkFields = objSource.connectFields();
					let linkObjectIds = linkFields.map((f) => f.settings.linkObject);

					let linkDcOptions = [];

					// pull data collections that are link to object
					let linkDcs = this._application.dataviews(dv => {

						return linkObjectIds.filter((objId) => dv.settings.object == objId).length > 0;

					});

					if (linkDcs && linkDcs.length > 0) {

						// set data collections to options
						linkDcs.forEach((dc) => {
							linkDcOptions.push({
								id: dc.id,
								value: dc.label
							});
						});

						linkDcOptions.unshift({ id: '', value: L('ab.component.datacollection.selectLinkSource', '*Select a link source') });

						$$(ids.linkDataSource).show();
						$$(ids.linkDataSource).define("options", linkDcOptions);
						$$(ids.linkDataSource).refresh();
						$$(ids.linkDataSource).setValue(this._dataview ? this._dataview.settings.linkDataCollection : '');
					}
					else {

						// hide options
						$$(ids.linkDataSource).hide();
						$$(ids.linkField).hide();
					}

				}
				else {

					// hide options
					$$(ids.linkDataSource).hide();
					$$(ids.linkField).hide();
				}

			},

			initLinkFieldOptions: () => {

				let ids = this.ids;

				let linkFieldOptions = [];

				// get fields that link to our ABObject
				if (this._dataview &&
					this._dataview.datasourceLink) {

					let object = this._dataview.datasource;
					let linkObject = this._dataview.datasourceLink;
					let relationFields = object.connectFields().filter(link => link.settings.linkObject == linkObject.id);

					// pull fields to options
					relationFields.forEach((f) => {
						linkFieldOptions.push({
							id: f.id,
							value: f.label
						});
					});
				}

				if (linkFieldOptions.length > 0)
					$$(ids.linkField).show();
				else
					$$(ids.linkField).hide();

				let linkFieldId = linkFieldOptions[0] ? linkFieldOptions[0].id : '';
				if (this._dataview &&
					this._dataview.settings) {
					linkFieldId = this._dataview.settings.linkField;
				}

				$$(ids.linkField).define("options", linkFieldOptions);
				$$(ids.linkField).refresh();
				$$(ids.linkField).setValue(linkFieldId);

			},

			selectSource: (datasourceID) => {

			}

		};

	}

}