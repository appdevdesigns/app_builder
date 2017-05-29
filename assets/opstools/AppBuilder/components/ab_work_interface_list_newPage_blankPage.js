
/*
 * ab_work_interface_list_newPage_blankPage
 *
 * Display the form for creating a new blank page 
 *
 */

import ABPage from '../classes/views/ABViewPage'

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		parentPage: L('ab.interface.page.parentList', '*Parent Page'),
		placeholderPageName: L('ab.interface.placeholderPageName', '*Page name'),


		rootPage: L('ab.interface.rootPage', '*[Root page]')

	}
}


var idBase = 'ab_work_interface_list_newPage_blankPage';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

		parentList: App.unique(idBase + '_parentList'),
		formName: App.unique(idBase + '_formName')

	}



	// Our webix UI definition:
	var _ui = {
		view: "form",
		id: ids.component,

//// TODO: @James
width: 400,

		elements: [
			{ 
				view: "select", 
				id: ids.parentList, 
				label: labels.component.parentPage, 
				name: "parent", 
				labelWidth: 110, 
				options: [] 
			},
			{ 
				view: "text", 
				id: ids.formName,
				label: labels.common.formName, 
				name: "label", 
				required: true, 
				placeholder: labels.component.placeholderPageName, 
				labelWidth: 110 
			}
		]

	};



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);

	}


	var CurrentApplication = null;

	// our internal business logic 
	var _logic = {

		
		/**
		 * @function applicationLoad()
		 *
		 * Prepare our New Popups with the current Application
		 */
		applicationLoad: function(application) {
			CurrentApplication = application;

			var options = [{ id: '-', value: labels.component.rootPage }];
			application.views((v)=>{ return v.isRoot(); }).forEach(function (page) {
					options.push({ id: page.id, value: page.label });
			});

			$$(ids.parentList).define('options', options);
			$$(ids.parentList).refresh();

		},

		/**
		 * @function clear()
		 *
		 * Clear our form
		 */
		clear:function() {
			$$(ids.component).clearValidation();
			$$(ids.component).clear();
			$$(ids.parentList).setValue('-');
		},



		/**
		 * @function errors()
		 *
		 * show errors on our form:
		 */
		errors: function (validator) {
			validator.updateForm($$(ids.component));
		},


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

				// $$(componentId.addNewForm).clearValidation();
				// $$(componentId.addNewForm).clear();

				// var options = [{ id: '', value: '[Root page]' }];
				// application.pages.each(function (d) {
				// 	if (!d.parent) { // Get only root pages
				// 		options.push({ id: d.id, value: d.label });
				// 	}
				// });

				// $$(componentId.addNewParentList).define('options', options);

				// // Default select parent page
				// if (selectedPage) {
				// 	var selected_page_id = selectedPage.id;

				// 	if (selectedPage.parent)
				// 		selected_page_id = selectedPage.parent.id || selectedPage.parent;

				// 	$$(componentId.addNewParentList).setValue(selected_page_id);
				// }
				// else
				// 	$$(componentId.addNewParentList).setValue('');

				// $$(componentId.addNewParentList).render();


			$$(ids.component).show();
		},


		values:function() {

			var parent = $$(ids.parentList).getValue().trim();
			if (parent == '-') parent = null;

			// convert a parent .id value to the actual object (or undefined if not found)
			if (parent) {
				CurrentApplication.views((v)=>{ return v.id == parent; })[0];
			}

			return {
				parent: parent,
				label: $$(ids.formName).getValue().trim(),
				key: ABPage.defaults().key
			}

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
		applicationLoad: _logic.applicationLoad,
		clear: _logic.clear,
		errors: _logic.errors,
		show: _logic.show,
		values: _logic.values,

		_logic: _logic			// {obj} 	Unit Testing
	}

})