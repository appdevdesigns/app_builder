/*
 * ABViewReport
 *
 * An ABView that represents a "Report" in the system.
 * 
 *
 */

import ABViewPage from "./ABViewPage"
import ABViewReportPage from "./ABViewReportPage"
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

	}

	static common() {
		return ABViewDefaults;
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

}