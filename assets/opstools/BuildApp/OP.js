
/**
 * @class AD_Client
 * @parent index 4
 *
 * ###Client side global OpsPortal (OP) namespace.
 *
 * This file defines standard functions and calls for OpsPortal
 * objects on the client side.
 */

// Create our OP  Namespace only if it hasn't been created already

//// TODO: how to disable 'use strict'?  or perform this check without an error
//// in 'use strict' ?

// if (!window.OP) {


    window.OP = {};


    // OP.xxxx      These properties hold the defined Class/Controller/Model definitions
    //              for our loaded projects.
    // OP.UI = {};    		// webix UI definitions
    // OP.Logic = {}; 		// logic references for webix application
    OP.Component = {};  // our defined components
	OP.Models = {};     // Models and data access



	// OP.UI.extend = function(key, definition) {
	// 	OP.UI[key] = definition;
	// }

	OP.Component.extend = function(key, fn) {
		OP.Component[key] = function(App){

//// TODO: verify App has proper structure:

			// make an instance of the component.
			var component = fn(App);

			// transfer to App, any actions in the component:
			if (component.logic.actions){
				for(var a in component.logic.actions) {
					App.actions[a] = component.logic.actions[a];
				}
			}

			return component;
		};
	}

	// OP.Logic.extend = function(key, fnLogic) {
	// 	OP.Logic[key] = fnLogic;
	// }
// }