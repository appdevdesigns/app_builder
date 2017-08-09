/*
 * ABViewPage
 *
 * An ABView that represents a "Page" in the system.
 *
 * Pages are 
 *	- allowed to be displayed in the interface list
 *	- return a full list of components that can be added to the view editor
 * 
 *
 */

import ABView from "./ABView"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDefaults = {
	key: 'page',		// unique key identifier for this ABView
	icon: 'file',		// icon reference: (without 'fa-' )

}

export default class ABViewPage extends ABView  {

    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );

    	
  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'viewKey',				// unique key for this View Type
  	// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
  	// 		label:'',					// pulled from translation

	//		settings: {					// unique settings for the type of field
	//		},

	//		translations:[]
  	// 	}
  		

  	}


  	static common() {
  		return ABViewDefaults;
  	}



}
