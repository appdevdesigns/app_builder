
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

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}



OP.Component.extend('ab_work_interface', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_interface_component'),

	}



	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		scroll: true,
		rows: [
{ view: "label", label:"interface workspace", width: 400, align: "right" },				
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		
		// /**
		//  * @function formBusy
		//  *
		//  * Show the progress indicator to indicate a Form operation is in 
		//  * progress.
		//  */
		// formBusy: function() {

		// 	$$(ids.form).showProgress({ type: 'icon' });
		// },


		// /**
		//  * @function formReady()
		//  *
		//  * remove the busy indicator from the form.
		//  */
		// formReady: function() {
		// 	$$(ids.form).hideProgress();
		// },


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

		
		/**
		 * @function initInterfaceTab
		 *
		 * Initialize the Object Workspace with the given ABApplication.
		 *
		 * @param {ABApplication} application 
		 */
		initInterfaceTab:function(application) {
console.error('TODO: ab_work_interface.actions.initInterfaceTab()');
		},


		/**
		 * @function transitionInterfaceWorkspace
		 *
		 * Display the Interface Workspace UI
		 */
		transitionInterfaceWorkspace:function(){
			_logic.show();
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})