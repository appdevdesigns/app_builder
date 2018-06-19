/*
 * ABViewReport
 *
 * An ABView that represents a "Report" in the system.
 * 
 *
 */

import ABViewContainer from "./ABViewContainer"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABPropertyComponentDefaults = {
}

var ABViewDefaults = {
	key: 'reportPanel', // unique key identifier for this ABView
	icon: 'list-alt',  // icon reference: (without 'fa-' )

}

export default class ABViewReportPanel extends ABViewContainer {

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


}