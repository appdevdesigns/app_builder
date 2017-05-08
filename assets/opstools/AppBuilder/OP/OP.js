
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
import Form from "./form"
import Multilingual from "./multilingual"
import Model from "./model"
import Util  from "./util"

import Config from "./config/config"

    window.OP = {};


    // OP.xxxx      These properties hold the defined Class/Controller/Model definitions
    //              for our loaded projects.
    // OP.UI = {};    		// webix UI definitions
    // OP.Logic = {}; 		// logic references for webix application
    OP.Component = {};  // our defined components

    OP.CustomComponent = {};  // separate holder for Webix Custom Components



	// OP.UI.extend = function(key, definition) {
	// 	OP.UI[key] = definition;
	// }

	OP.Component.extend = function(key, fn) {
		OP.Component[key] = function(App){

//// TODO: verify App has proper structure:
			if (!App) {
				App = OP.Component._newApp();
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

	OP.Component._newApp = function () {
		return {

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
			 * config
			 * webix configuration settings for our current browser
			 */
			config:Config.config(),

			/*
			 * custom
			 * a collection of custom components for this App Instance.
			 */
			custom:{

			},

			/*
			 * labels
			 * a collection of labels that are common for the Application.
			 */
			labels:{

			},

			/*
			 * unique()
			 * A function that returns a globally unique Key.
			 * @param {string} key   The key to modify and return.
			 * @return {string}
			 */
			unique: function(key) { return key+this.uuid; },

		}
	}


	OP.CustomComponent.extend = function(key, fn) {
		OP.CustomComponent[key] = function(App, key){

			if (!App) {
				App = OP.Component._newApp();
			}

			// make an instance of the component.
			return fn(App, key);
		};
	}


	OP.Dialog = AD.op.Dialog;

	OP.Error = AD.error;

	OP.Form = Form;

	OP.Multilingual = Multilingual;
	OP.Model = Model;


	OP.Util = Util;



	export default OP;
// }


// import "./model.js"
