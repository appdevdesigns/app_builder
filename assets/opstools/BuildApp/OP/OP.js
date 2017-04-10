
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
			if (!App) {

				App = {

					uuid: webix.uid(),

					/*
					 * actions:
					 * a hash of exposed application methods that are shared among our 
					 * components, so one component can invoke an action that updates 
					 * another component.
					 */
					actions:{
						
					},

					/*
					 * unique()
					 * A function that returns a globally unique Key.
					 * @param {string} key   The key to modify and return.
					 * @return {string} 
					 */
					unique: function(key) { return key+this.uuid; },

					/*
					 * labels
					 * a collection of labels that are common for the Application.
					 */
					labels:{
				
					}

				}
			}

			// make an instance of the component.
			var component = fn(App);

			// transfer to App, any actions in the component:
			if (component.actions){
				for(var a in component.actions) {
					App.actions[a] = component.actions[a];
				}
			}

			return component;
		};
	}




	OP.Dialog = AD.op.Dialog;

	
// }


// import "./model.js"