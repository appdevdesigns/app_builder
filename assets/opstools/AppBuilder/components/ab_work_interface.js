
/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */

import ABApplication from "../classes/ABApplication"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}


var idBase = 'ab_work_interface';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

	}



	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		//scroll: true,
		rows: [
			{
				view: "label",
				label:"interface workspace",
			},
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic
	var _logic = {


		
		/**
		 * @function applicationLoad
		 *
		 * Initialize the Object Workspace with the given ABApplication.
		 *
		 * @param {ABApplication} application 
		 */
		applicationLoad:function(application) {
console.error('TODO: ab_work_interface.applicationLoad()');
		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {


	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		applicationLoad:_logic.applicationLoad,
		show: _logic.show,

		_logic: _logic			// {obj} 	Unit Testing
	}

})
