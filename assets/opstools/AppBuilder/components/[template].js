
/*
 * [template]
 *
 * Display the form for creating a new Application.
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


idBase = '[template]';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

	}



	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		scroll: true,
		rows: [
{ view: "label", label:"[template] row", width: 800, align: "right" },	
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
		 * @function populateApplicationForm()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		// populateApplicationForm:function(Application){
			
		// 	_logic.formReset();
		// 	if (Application) {
		// 		// populate Form here:
		// 		_logic.formPopulate(Application);
		// 	}
		// 	_logic.permissionPopulate(Application);
		// 	_logic.show();
		// }

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		show: _logic.show,

		_logic: _logic			// {obj} 	Unit Testing
	}

})