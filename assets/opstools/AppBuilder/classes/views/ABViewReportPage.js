/*
 * ABViewReportPage
 *
 * An ABView that represents a "Report" in the system.
 * 
 *
 */

import ABViewPage from "./ABViewPage"
import ABViewReport from "./ABViewReport"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABPropertyComponentDefaults = {
	type: 'reportPage', // 'page', 'popup' or 'reportPage'
}

var ABViewDefaults = {
	key: 'reportPage',	// unique key identifier for this ABView
	icon: 'file-text-o',	// icon reference: (without 'fa-' )

}

export default class ABViewReportPage extends ABViewPage {

	constructor(values, application, parent, defaultValues) {
		super(values, application, parent, (defaultValues || ABViewDefaults));

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

	uiReportMenu() {

		return {
			view: "list",
			width: 200,
			template: "#label#",
			select: true,
			data: this.pages().map(p => {

				return {
					id: p.id,
					label: p.label
				}

			})
		};

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

		comp.ui = {
			view: 'layout',
			cols: [
				this.uiReportMenu(),
				comp.ui
			]
		};

		var _init = (options) => {

			comp.init(options);

		};


		return {
			ui: comp.ui,
			init: _init,
			logic: comp.logic,

			onShow: comp.onShow
		}

	}



	/*
	* @component()
	* return a UI component based upon this view.
	* @param {obj} App 
	* @return {obj} UI component
	*/
	component(App) {

		var comp = super.component(App);

		var idBase = 'ABViewReportPage_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		};

		// left report menu
		var menu = this.uiReportMenu();
		menu.on = {
			onAfterSelect: function (id) {
				comp.logic.selectReport(id);
			}
		};


		// ui
		var _ui = {
			view: 'layout',
			cols: [
				menu,
				{
					id: ids.component,
					view: 'layout',
					cols: [comp.ui]
				}
			]
		};


		// init
		var _init = (options) => {

			comp.init(options);

		}


		// logic
		comp.logic.selectReport = (reportId) => {

			// clear container UI
			var childViews = $$(ids.component).getChildViews();
			childViews.forEach(v => {
				$$(ids.component).removeView(v);
			});

			var selectedPage = this.pages(p => p.id == reportId)[0];
			if (selectedPage) {

				var reportComponent = selectedPage.component(App);

				// create selected report UI
				$$(ids.component).addView(reportComponent.ui);

				reportComponent.init();
				reportComponent.onShow();

			}

		};


		return {
			ui: _ui,
			init: _init,
			logic: comp.logic,

			onShow: comp.onShow
		}
	}


	///
	/// Pages
	///

	/**
	 * @method pageNew()
	 *
	 * return an instance of a new (unsaved) ABViewReport that is tied to this
	 * ABViewReport.
	 *
	 * NOTE: this new page is not included in our this.pages until a .save()
	 * is performed on the page.
	 *
	 * @return {ABViewReport}
	 */
	pageNew(values) {

		// make sure this is an ABViewReport description
		values.key = ABViewReport.common().key;

		// NOTE: this returns a new ABView component.  
		// when creating a new page, the 3rd param should be null, to signify 
		// the top level component.
		var page = new ABViewManager.newView(values, this.application, null);
		page.parent = this;
		return page;
	}

}