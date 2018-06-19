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
									comp.logic.showPrintPopup(this.$view);
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

		}

		comp.logic.showPrintPopup = ($button) => {

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

	pageParent(filterFn) {

		if (filterFn == null) filterFn = () => true;

		var parentPage = this.parent;

		// if current page is the root page, then return itself.
		if (this.isRoot()) {
			return this;
		}

		while (parentPage && (!(parentPage instanceof ABViewReportPage) || !filterFn(parentPage))) {
			parentPage = parentPage.parent;
		}

		return parentPage;
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