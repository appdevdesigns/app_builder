
/*
 * ab_work_object
 *
 * Display the Object Tab UI:
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object_list"
import "./ab_work_object_workspace"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),

	}
}



OP.Component.extend('ab_work_object', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_component'),

	}

	var ObjectList = OP.Component['ab_work_object_list'](App);
	var ObjectWorkspace = OP.Component['ab_work_object_workspace'](App);


	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		autoheight: true,
		cols: [
			ObjectList.ui,
			{ view: "resizer"},
			ObjectWorkspace.ui
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {

		ObjectWorkspace.init();
		ObjectList.init();

	}



	// our internal business logic
	var _logic = {


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
		 * @function initObjectTab
		 *
		 * Initialize the Object Workspace with the given ABApplication.
		 *
		 * @param {ABApplication} application
		 */
		initObjectTab:function(application) {
			App.actions.populateObjectList(application);
			App.actions.clearObjectWorkspace();
		},


		/**
		 * @function transitionObjectTab
		 *
		 * Display the Object Tab UI
		 */
		transitionObjectTab:function(){
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
