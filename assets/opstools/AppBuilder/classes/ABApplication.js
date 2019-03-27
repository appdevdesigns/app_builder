
// import OP from "OP"
import ABApplicationPlatform from "./platform/ABApplication"
import "../data/ABApplication"
// import ABObject from "./ABObject"
// import ABObjectQuery from "./ABObjectQuery"
// import ABMobileApp from "./ABMobileApp"
// import ABViewManager from "./ABViewManager"
// import ABViewPage from "./views/ABViewPage"
// import ABViewReportPage from "./views/ABViewReportPage"
// import ABFieldManager from "./ABFieldManager"


// var _AllApplications = [];


// function L(key, altText) {
// 	return AD.lang.label.getLabel(key) || altText;
// }

// function toArray(DC) {
// 	var ary = [];

// 	var id = DC.getFirstId();
// 	while (id) {
// 		var element = DC.getItem(id);
// 		ary.push(element);
// 		id = DC.getNextId(id);
// 	}

// 	return ary;
// }

export default class ABApplication extends ABApplicationPlatform {

	constructor(attributes) {
		super(attributes);
	}

}

// export to ABLiveTool
window.ABApplication = ABApplication;
