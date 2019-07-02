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

	}

	get ui() {

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
											view: "richselect",
											name: "dataSource",
											label: L('ab.component.datacollection.source', '*Source:'),
											labelWidth: this.App.config.labelWidthLarge,
											options: {
												data: []
											},
											on: {
												onChange: function (newv, oldv) {
													if (newv == oldv) return;

													_logic.selectSource(newv, oldv);
												}
											}
										},
										// link to another data collection
										{
											view: "select",
											name: "linkDataSource",
											label: L('ab.component.datacollection.linkDataSource', '*Linked To:'),
											labelWidth: this.App.config.labelWidthLarge,
											options: [],
											hidden: 1
										},
										{
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
													view: "checkbox",
													name: "loadAll",
													label: ""
												}
											]
										},
										{
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
		};

	}

}