
/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Application.
 *
 */

import "./ab_work_object_list_newObject_blank"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),
							
	}
}



OP.Component.extend('ab_work_object_list_newObject', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_newObject_component'),

	}


	var BlankTab = OP.Component['ab_work_object_list_newObject_blank'](App);


	// Our webix UI definition:
	var _ui = {
		view: "window",
		id: ids.component,
		width: 400,
		position: "center",
		modal: true,
		head: labels.component.addNew,
		selectNewObject: true,
		on: {
			"onBeforeShow": function () {
				// blankObjectCreator.onInit();
				// importObjectCreator.onInit();
				// importCsvCreator.onInit();
			}
		},
		body: {
			view: "tabview",
			cells: [
				BlankTab.ui,
				// importObjectCreator.getCreateView(),
				// importCsvCreator.getCreateView()
			]
		}
	};



	// Our init() function for setting up our UI
	var _init = function() {
		
		BlankTab.init();
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
		 * @function transitionNewObjectWindow()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		transitionNewObjectWindow:function(){
			
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