import ABPopupSortField from "./ab_work_object_workspace_popupSortFields"
import ABViewTab from "../classes/views/ABViewTab"
import ABViewDetail from "../classes/views/ABViewDetail"
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
			propertyPanel: this.unique('propertyPanel'),

			dataSource: this.unique('dataSource'),
			linkDataview: this.unique('linkDataview'),
			linkField: this.unique('linkField'),
			loadAll: this.unique('loadAll'),
			fixSelect: this.unique('fixSelect'),

			filterPanel: this.unique('filterPanel'),
			sortPanel: this.unique('sortPanel'),

			buttonFilter: this.unique('buttonFilter'),
			buttonSort: this.unique('buttonSort'),
			
			list: this.unique('list')
		};

		this.callbacks = {
			onSave: function (dataview) { }
		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
		this.dataviewLoad = this._logic.dataviewLoad;
		
		/*
		 * _templateListItem
		 *
		 * The Object Row template definition.
		 */
		this._templateListItem = [
			"<div class='ab-page-list-item'>",
				"{common.icon()} <span class='webix_icon fa fa-#typeIcon#'></span> #label# #hasDataView#",
			"</div>"
		].join('');
		
		this.viewList = null;


	}

	get ui() {

		let App = this.App;
		let ids = this.ids;
		let instance = this;

		return {
			width: App.config.columnWidthXLarge,
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
					id: ids.propertyPanel,
					body: {
						padding: 15,
						rows: [
							{
								view: "fieldset",
								label: L('ab.component.datacollection.dataSource', '*Data Source:'),
								labelWidth: App.config.labelWidthLarge,
								body: {
									type: "clean",
									padding: 10,
									rows: [
										{
											id: ids.dataSource,
											view: "richselect",
											name: "dataSource",
											label: L('ab.component.datacollection.source', '*Source:'),
											labelWidth: App.config.labelWidthLarge,
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
											id: ids.linkDataview,
											view: "select",
											name: "linkDataview",
											label: L('ab.component.datacollection.linkDataview', '*Linked To:'),
											labelWidth: App.config.labelWidthLarge,
											options: [],
											hidden: 1,
											on: {
												onChange: (linkedDvId, oldv) => {
													this._logic.initLinkFieldOptions(linkedDvId);
													this._logic.save();
												}
											}
										},
										{
											id: ids.linkField,
											view: "select",
											name: "linkField",
											label: L('ab.component.datacollection.linkedField', '*Linked Field:'),
											labelWidth: App.config.labelWidthLarge,
											options: [],
											hidden: 1,
											on: {
												onChange: (newv, oldv) => {
													this._logic.save();
												}
											}
										}
									]
								}
							},
							{
								view: "fieldset",
								label: L('ab.component.datacollection.advancedOptions', '*Advanced Options:'),
								labelWidth: App.config.labelWidthLarge,
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
													width: App.config.labelWidthLarge,
												},
												{
													id: ids.buttonFilter,
													view: "button",
													name: "buttonFilter",
													label: L("ab.component.datacollection.settings", "*Settings"),
													icon: "fa fa-gear",
													type: "icon",
													badge: 0,
													click: function () {
														instance._logic.showFilterPopup(this.$view);
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
													width: App.config.labelWidthLarge,
												},
												{
													id: ids.buttonSort,
													view: "button",
													name: "buttonSort",
													label: L("ab.component.datacollection.settings", "*Settings"),
													icon: "fa fa-gear",
													type: "icon",
													badge: 0,
													click: function () {
														instance._logic.showSortPopup(this.$view);
													}
												}
											]
										},
										{
											cols: [
												{
													view: "label",
													label: L("ab.component.datacollection.loadAll", "*Load all:"),
													width: App.config.labelWidthLarge,
												},
												{
													id: ids.loadAll,
													view: "checkbox",
													name: "loadAll",
													label: "",
													on: {
														onChange: (newv, oldv) => {
															this._logic.save();
														}
													}
												}
											]
										},
										{
											id: ids.fixSelect,
											view: "select",
											name: "fixSelect",
											label: L('ab.component.datacollection.fixSelect', '*Select:'),
											labelWidth: App.config.labelWidthLarge,
											options: [],
											on: {
												onChange: (newv, oldv) => {
													this._logic.save();
												}
											}
										}
									]
								}
							},
							{
								view: "fieldset",
								label: L('ab.component.datacollection.dataUsed', '*Data used in...'),
								labelWidth: App.config.labelWidthLarge,
								body: {
									view: App.custom.edittree.view,  // "edittree",
									id: ids.list,
									select: true,
									editaction: 'custom',
									editable: true,
									editor: "text",
									editValue: "label",
									borderless: true,
									padding: 0,
									css: "ab-tree-ui",
									minHeight: 300,
									template: (obj, common) => {
										return this._logic.templateListItem(obj, common);
									},
									type: {
										iconGear: "<span class='webix_icon fa fa-cog'></span>"
									},
									on: {
										onAfterSelect: (id) => {
											this._logic.onAfterSelect(id);
										},
									},
								}
							},
							{
								maxHeight: App.config.mediumSpacer,
								height: App.config.mediumSpacer,
								minHeight: App.config.mediumSpacer,
								hidden: App.config.hideMobile
							}
						]
					}
				}
			]

		};
	}

	init(options) {

		options = options || {};

		// register our callbacks:
		for (var c in this.callbacks) {
			this.callbacks[c] = options[c] || this.callbacks[c];
		}
		
		if ($$(this.ids.list)) {
			webix.extend($$(this.ids.list), webix.ProgressBar);
			$$(this.ids.list).adjust();
		}

		if ($$(this.ids.propertyPanel))
			webix.extend($$(this.ids.propertyPanel), webix.ProgressBar);

		this._logic.initPopupEditors();
	}

	get _logic() {

		return {
			
			/**
			 * @function onAfterSelect()
			 *
			 * Perform these actions when a View is selected in the List.
			 */
			onAfterSelect: (id) => {

				var view = $$(this.ids.list).getItem(id);
				setTimeout(() => {
					this.App.actions.tabSwitch('interface');
					this.App.actions.populateInterfaceWorkspace(view);
				}, 50);

			},

			applicationLoad: (application) => {

				this._application = application;

				let ids = this.ids;
				let datasources = [];

				// Objects
				var objects = application.objects().map((obj) => {
					return {
						id: obj.id,
						value: obj.label,
						isQuery: false,
						icon: 'fa fa-database'
					}
				});
				datasources = datasources.concat(objects);

				// Queries
				var queries = application.queries().map((q) => {
					return {
						id: q.id,
						value: q.label,
						isQuery: true,
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
				
				this._logic.listBusy();

				// this so it looks right/indented in a tree view:
				this.viewList = new webix.TreeCollection();

				/**
				 * @method addPage
				 * 
				 * @param {ABView} page 
				 * @param {integer} index 
				 * @param {uuid} parentId 
				 */
				var addPage = (page, index, parentId) => {

					// add to tree collection
					this.viewList.add(page, index, parentId);
					
					// add sub-pages
					if (page instanceof ABViewDetail) {
						return 
					}

					var subPages = (page.pages ? page.pages() : []);
					subPages.forEach((childPage, childIndex)=>{
						addPage(childPage, childIndex, page.id);
					});

					// add non-tab components
					page.views(v => !(v instanceof ABViewTab)).forEach((widgetView, widgetIndex) => {

						var wIndex = (subPages.length + widgetIndex);
						addPage(widgetView, wIndex, page.id);

					});

					// add tabs
					page.views(v => v instanceof ABViewTab).forEach((tab, tabIndex) => {

						// tab views
						tab.views().forEach((tabView, tabViewIndex) => {

							// tab items will be below sub-page items
							var tIndex = (subPages.length + tabIndex + tabViewIndex);

							addPage(tabView, tIndex, page.id);

						});

					});

				}
				this._application.pages().forEach((p, index)=>{
					addPage(p, index);
				})

				// clear our list and display our objects:
				var List = $$(ids.list);
				List.clearAll();
				List.data.unsync();
				List.data.sync(this.viewList);
				List.refresh();
				List.unselectAll();
				
				this._logic.listReady();

			},

			dataviewLoad: (dataview) => {

				let ids = this.ids;

				this._dataview = dataview;

				let settings = {};

				if (dataview) {
					settings = dataview.settings || {};
				}

				// populate link data collection options
				this._logic.initLinkDataviewOptions();

				// populate link fields
				this._logic.initLinkFieldOptions();

				// initial populate of popups
				this._logic.populatePopupEditors();

				this._logic.populateBadgeNumber();

				// populate data items to fix select options
				this._logic.populateFixSelector();
				if (dataview) {
					dataview.removeListener('loadData', this._logic.populateFixSelector);
					dataview.on('loadData', this._logic.populateFixSelector);
				}

				// // if selected soruce is a query, then hide advanced options UI
				// if (settings.isQuery) {
				// 	$$(ids.filterPanel).hide();
				// 	$$(ids.sortPanel).hide();
				// }
				// else {
				// 	$$(ids.filterPanel).show();
				// 	$$(ids.sortPanel).show();
				// }

				$$(ids.dataSource).define('value', settings.datasourceID);
				$$(ids.linkDataview).define('value', settings.linkDataviewID);
				$$(ids.linkField).define('value', settings.linkFieldID);
				$$(ids.loadAll).define('value', settings.loadAll);
				$$(ids.fixSelect).define('value', settings.fixSelect);

				$$(ids.dataSource).refresh();
				$$(ids.linkDataview).refresh();
				$$(ids.linkField).refresh();
				$$(ids.loadAll).refresh();
				$$(ids.fixSelect).refresh();
				$$(ids.list).openAll();

			},

			busy: () => {

				let $propertyPanel = $$(this.ids.propertyPanel);
				if ($propertyPanel &&
					$propertyPanel.showProgress)
					$propertyPanel.showProgress({ type: "icon" });

			},

			ready: () => {

				let $propertyPanel = $$(this.ids.propertyPanel);
				if ($propertyPanel &&
					$propertyPanel.hideProgress)
					$propertyPanel.hideProgress();

			},

			save: () => {

				if (!this._dataview)
					return Promise.resolve();

				this._logic.busy();

				let ids = this.ids;

				this._dataview.settings = this._dataview.settings || {};
				this._dataview.settings.datasourceID = $$(ids.dataSource).getValue();
				this._dataview.settings.linkDataviewID = $$(ids.linkDataview).getValue();
				this._dataview.settings.linkFieldID = $$(ids.linkField).getValue();
				this._dataview.settings.objectWorkspace = {};
				this._dataview.settings.objectWorkspace.filterConditions = this.FilterComponent.getValue();
				this._dataview.settings.objectWorkspace.sortFields = this.PopupSortFieldComponent.getValue();
				this._dataview.settings.loadAll = $$(ids.loadAll).getValue();
				this._dataview.settings.fixSelect = $$(ids.fixSelect).getValue();

				let selectedDS = $$(ids.dataSource).getPopup().getList().getItem(this._dataview.settings.datasourceID);
				if (selectedDS)
					this._dataview.settings.isQuery = selectedDS.isQuery;
				else
					this._dataview.settings.isQuery = false;

				return new Promise((resolve, reject) => {

					this._dataview.save()
						.catch(err => {
							this._logic.ready();
							reject(err);
						})
						.then(() => {

							this._dataview.clearAll();

							this._logic.ready();

							this.callbacks.onSave(this._dataview);

							resolve();

						});

				});

			},

			initLinkDataviewOptions: () => {

				let ids = this.ids;

				// get linked data collection list
				let objSource = this._dataview ? this._dataview.datasource : null;
				if (objSource != null) {
					let linkFields = objSource.connectFields();
					let linkObjectIds = linkFields.map(f => f.settings.linkObject);

					let linkDvOptions = [];

					// pull data collections that are link to object
					let linkDvs = this._application.dataviews(dv => {

						return linkObjectIds.filter(objId => dv.settings.datasourceID == objId).length > 0;

					});

					if (linkDvs && linkDvs.length > 0) {

						// set data collections to options
						linkDvs.forEach((dc) => {
							linkDvOptions.push({
								id: dc.id,
								value: dc.label
							});
						});

						linkDvOptions.unshift({ id: '', value: L('ab.component.datacollection.selectLinkSource', '*Select a link source') });

						$$(ids.linkDataview).show();
						$$(ids.linkDataview).define("options", linkDvOptions);
						$$(ids.linkDataview).define("value", this._dataview ? this._dataview.settings.linkDataviewID : '');
						$$(ids.linkDataview).refresh();
					}
					else {

						// hide options
						$$(ids.linkDataview).hide();
						$$(ids.linkField).hide();
					}

				}
				else {

					// hide options
					$$(ids.linkDataview).hide();
					$$(ids.linkField).hide();
				}

			},

			initLinkFieldOptions: (linkedDvId = null) => {

				let ids = this.ids;

				let linkFieldOptions = [];
				let linkDataview = null;

				// Specify id of linked data view
				if (linkedDvId) {
					linkDataview = this._application.dataviews(dv => dv.id == linkedDvId)[0];
				}
				// Pull from current data view
				else if (this._dataview && this._dataview.dataviewLink) {
					linkDataview = this._dataview.dataviewLink;
				}

				// get fields that link to our ABObject
				if (linkDataview) {

					let object = this._dataview.datasource;
					let linkObject = linkDataview.datasource;
					let relationFields = object.connectFields().filter(link => link.settings.linkObject == (linkObject || {}).id);

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
					linkFieldId = this._dataview.settings.linkFieldID;
				}

				$$(ids.linkField).define("options", linkFieldOptions);
				$$(ids.linkField).define("value", linkFieldId);
				$$(ids.linkField).refresh();

			},

			populatePopupEditors: () => {

				if (this._dataview &&
					this._dataview.datasource) {

					let datasource = this._dataview.datasource;

					// array of filters to apply to the data table
					let filterConditions = {
						glue: 'and',
						rules: []
					};
					let sortConditions = [];
					if (this._dataview.settings.objectWorkspace) {

						if (this._dataview.settings.objectWorkspace.filterConditions)
							filterConditions = this._dataview.settings.objectWorkspace.filterConditions;

						if (this._dataview.settings.objectWorkspace.sortFields)
							sortConditions = this._dataview.settings.objectWorkspace.sortFields;
					}

					// Populate data to popups
					this.FilterComponent.objectLoad(datasource);
					this.FilterComponent.viewLoad(this._dataview);
					this.FilterComponent.setValue(filterConditions);
					this._dataview.refreshFilterConditions(filterConditions);

					this.PopupSortFieldComponent.objectLoad(datasource);
					this.PopupSortFieldComponent.setValue(sortConditions);

				}

			},

			populateBadgeNumber: () => {

				let ids = this.ids;
				let dataview = this._dataview;

				if (dataview &&
					dataview.settings &&
					dataview.settings.objectWorkspace &&
					dataview.settings.objectWorkspace.filterConditions &&
					dataview.settings.objectWorkspace.filterConditions.rules) {
					$$(ids.buttonFilter).define('badge', dataview.settings.objectWorkspace.filterConditions.rules.length);
					$$(ids.buttonFilter).refresh();
				}
				else {
					$$(ids.buttonFilter).define('badge', 0);
					$$(ids.buttonFilter).refresh();
				}

				if (dataview &&
					dataview.settings &&
					dataview.settings.objectWorkspace &&
					dataview.settings.objectWorkspace.sortFields) {
					$$(ids.buttonSort).define('badge', dataview.settings.objectWorkspace.sortFields.length);
					$$(ids.buttonSort).refresh();
				}
				else {
					$$(ids.buttonSort).define('badge', 0);
					$$(ids.buttonSort).refresh();
				}
			},

			populateFixSelector: () => {

				let ids = this.ids;
				let dataItems = [];
				let fixSelect = '';

				if (this._dataview &&
					this._dataview.datasource) {

					let datasource = this._dataview.datasource;

					dataItems = this._dataview.getData().map(item => {
						return {
							id: item.id,
							value: datasource ? datasource.displayData(item) : ""
						}
					});

					// Add a current user option to allow select first row that match the current user
					if (datasource) {
						let userFields = datasource.fields((f) => f.key == 'user');
						if (userFields.length > 0)
							dataItems.unshift({ id: '_CurrentUser', value: L('ab.component.datacollection.currentUser', '[Current User]') });

						// Add a first record option to allow select first row
						dataItems.unshift(
							{ id: '_FirstRecord', value: L('ab.component.datacollection.firstRecord', '[First Record]') },
							{ id: '_FirstRecordDefault', value: L('ab.component.datacollection.firstRecordDefault', '[Default to First Record]') }
						);

					}

					dataItems.unshift({ id: '', value: L('ab.component.datacollection.fixSelect', '*Select fix cursor') });

					fixSelect = this._dataview.settings.fixSelect || '';

				}

				$$(ids.fixSelect).define("options", dataItems);
				$$(ids.fixSelect).define("value", fixSelect);
				$$(ids.fixSelect).refresh();

			},

			initPopupEditors: () => {

				let idBase = 'ABDataviewPropertyEditor';

				this.FilterComponent = new RowFilter(this.App, `${idBase}_filter`);
				this.FilterComponent.init({
					// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
					onChange: this._logic.onFilterChange
				});

				this.filter_popup = webix.ui({
					view: "popup",
					width: 800,
					hidden: true,
					body: this.FilterComponent.ui
				});


				this.PopupSortFieldComponent = new ABPopupSortField(this.App, `${idBase}_sort`);
				this.PopupSortFieldComponent.init({
					// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
					onChange: this._logic.onSortChange
				});

			},

			selectSource: (datasourceID, oldId) => {

				let ids = this.ids;

				let selectedDatasource = $$(ids.dataSource).getList().getItem(datasourceID);
				if (selectedDatasource &&
					selectedDatasource.disabled) {
					// prevents re-calling onChange from itself
					$$(ids.dataSource).blockEvent();
					$$(ids.dataSource).setValue(oldId || "")
					$$(ids.dataSource).unblockEvent();
				}

				let dataview = this._dataview;
				let object;
				let query;

				if (dataview) {
					object = dataview.application.objects(obj => obj.id == datasourceID)[0];
					query = dataview.application.queries(q => q.id == datasourceID)[0];
				}

				if (object) {

					// populate fix selector
					this._logic.populateFixSelector();

					// re-create filter & sort popups
					this._logic.initPopupEditors();

					this._logic.populatePopupEditors();

					// show options
					$$(ids.filterPanel).show();
					$$(ids.sortPanel).show();


				}
				else if (query) {

					// hide options
					$$(ids.filterPanel).hide();
					$$(ids.sortPanel).hide();
				}

				this._logic.save();

			},

			showFilterPopup: ($button) => {
				this.filter_popup.show($button, null, { pos: "top" });
			},

			showSortPopup: ($button) => {
				this.PopupSortFieldComponent.show($button, null, { pos: "top" });
			},

			onFilterChange: () => {

				let dataview = this._dataview;
				if (!dataview) return;

				let filterValues = this.FilterComponent.getValue();

				dataview.settings.objectWorkspace.filterConditions = filterValues;

				var allComplete = true;
				filterValues.rules.forEach((f) => {

					// if all 3 fields are present, we are good.
					if ((f.key)
						&& (f.rule)
						&& (f.value ||
							// these rules do not have input value
							(f.rule == 'is_current_user' ||
								f.rule == 'is_not_current_user' ||
								f.rule == 'contain_current_user' ||
								f.rule == 'not_contain_current_user' ||
								f.rule == 'same_as_user' ||
								f.rule == 'not_same_as_user'))) {
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
						this._logic.save();
					}, 10);

				}
			},

			onSortChange: (sortSettings) => {

				let dataview = this._dataview;
				if (!dataview) return;

				dataview.settings = dataview.settings || {};
				dataview.settings.objectWorkspace = dataview.settings.objectWorkspace || {};
				// store sort settings
				dataview.settings.objectWorkspace.sortFields = sortSettings || [];

				this._logic.save();

			},
			
			/**
			 * @function templateListItem
			 *
			 * Defines the template for each row of our ObjectList.
			 *
			 * @param {obj} obj the current instance of ABObject for the row.
			 * @param {?} common the webix.common icon data structure
			 * @return {string}
			 */
			templateListItem: (item, common) => {

				var template = this._templateListItem;
				
				var hasDataView = "";
				if (item.dataview && this._dataview && this._dataview.id && (item.dataview.id == this._dataview.id)) {
					hasDataView = "<i class='webix_icon hasDataView fa fa-check-circle'></i>";
				}

				template = template.replace("#typeIcon#", item.icon || item.viewIcon())
					.replace('#label#', item.label)
					.replace('{common.icon()}', common.icon(item))
					.replace('#hasDataView#', hasDataView);

				return template;

			},
			
			listBusy: () => {
				let ids = this.ids;
				
				if ($$(ids.list) &&
					$$(ids.list).showProgress)
					$$(ids.list).showProgress({ type: "icon" });
			},


			listReady: () => {
				let ids = this.ids;
				
				if ($$(ids.list) &&
					$$(ids.list).hideProgress)
					$$(ids.list).hideProgress();
			},


		};

	}

}