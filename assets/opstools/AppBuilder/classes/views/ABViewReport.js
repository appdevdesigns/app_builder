/*
 * ABViewReport
 *
 * An ABView that represents a "Report" in the system.
 * 
 *
 */

import ABView from "./ABView"
import ABViewPage from "./ABViewPage"
import ABViewReportPage from "./ABViewReportPage"
import ABViewReportPanel from "./ABViewReportPanel"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABPropertyComponentDefaults = {
}

var ABViewDefaults = {
	key: 'report',	    // unique key identifier for this ABView
	icon: 'file-text',	// icon reference: (without 'fa-' )

}

export default class ABViewReport extends ABViewPage {

	constructor(values, application, parent, defaultValues) {
		super(values, application, parent, (defaultValues || ABViewDefaults));

		// the report always have 'header', 'detail' and 'footer' panels
		if (this.views(v => v instanceof ABViewReportPanel).length < 3) {

			// header
			var header = ABViewManager.newView({
				key: ABViewReportPanel.common().key,
				label: 'Header'
			}, application, this);
			this._views.push(header);

			// detail
			var detail = ABViewManager.newView({
				key: ABViewReportPanel.common().key,
				label: 'Detail'
			}, application, this);
			this._views.push(detail);

			// footer
			var footer = ABViewManager.newView({
				key: ABViewReportPanel.common().key,
				label: 'Footer'
			}, application, this);
			this._views.push(footer);

		}

	}

	static common() {
		return ABViewDefaults;
	}

	///
	/// Instance Methods
	///

	//
	//	Editor Related
	//

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var comp = super.component(App);

		var idBase = 'ABViewReport_' + this.id;
		var ids = {
			printPopup: App.unique(idBase + '_printPopup'),
		};

		var _ui = {
			view: 'layout',
			rows: [
				// print button
				{
					view: 'layout',
					cols: [
						{},
						{
							view: "button",
							type: "iconButton",
							icon: "print",
							label: 'Print',
							align: "right",
							autowidth: true,
							on: {
								onItemClick: function (id, e) {
									comp.logic.popupShow(this.$view);
								}
							}
						}
					]
				},

				// display container
				comp.ui
			]
		};

		var _init = (options) => {

			comp.init(options);

			// WORKAROUND : Where should we define this ??
			// For include html2canvas.js
			webix.codebase = "";
			webix.cdn = "/js/webix";

			webix.ui({
				view: "popup",
				id: ids.printPopup,
				width: 160,
				height: 120,
				select: false,
				body: {
					id: ids.list,
					view: 'list',
					data: [
						{ name: "PNG", icon: "file-image-o" },
						{ name: "Print", icon: "print" }
					],
					template: function (obj, common) {
						return comp.logic.popupItemTemplate(obj, common);
					},
					on: {
						onItemClick: function (id, e, node) {
							var component = this.getItem(id);

							comp.logic.print(component.name);
						}
					}
				}
			});

		}

		comp.logic.popupShow = ($button) => {

			$$(ids.printPopup).show($button);

		};

		comp.logic.popupHide = () => {

			$$(ids.printPopup).hide();

		};

		comp.logic.popupItemTemplate = (obj, common) => {

			return "<div><i class='fa fa-#icon# webix_icon_btn' aria-hidden='true'></i> #name#</div>"
				.replace(/#icon#/g, obj.icon)
				.replace(/#name#/g, obj.name);

		};

		comp.logic.print = (name) => {

			switch (name) {
				case "PNG":
					webix.toPNG($$(comp.ui.id),
						{
							filename: this.label
						})
						.catch(err => {
							OP.Error.log("System could not export PNG", { error: err });
						})
						.fail((err) => {
							OP.Error.log("System could not export PNG", { error: err });
						})
						.then(() => {
							comp.logic.popupHide();
						})
					break;

				case "Print":
					// https://docs.webix.com/desktop__printing.html
					webix.print($$(comp.ui.id));
					comp.logic.popupHide();
					break;

			}

		};

		return {
			ui: _ui,
			init: _init,
			logic: comp.logic,

			onShow: comp.onShow
		}
	}


	componentList(isEdited) {
		return [];
	}


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		return ABView.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

	}

	static propertyEditorPopulate(App, ids, view) {

		return ABView.propertyEditorPopulate(App, ids, view);

	}


	static propertyEditorValues(ids, view) {

		return ABView.propertyEditorValues(ids, view);

	}


	static propertyEditorSave(ids, view) {

		return ABView.propertyEditorSave(ids, view);

	}

}