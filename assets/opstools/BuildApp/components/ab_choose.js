
/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */


import './ab_choose_list'
import './ab_choose_form'

OP.Component.extend('ab_choose', function(App) {


	var ids = {
		choose:App.unique('ab_choose')
	}

//// LEFT OFF HERE:
// [] implement AppForm
// [] ab_choose_list_menu :> App.actions.editApplication()


	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view:"multiview",
		id: ids.choose,
		autoheight: true,
		cells: [
			AppList.ui,
			AppForm.ui
		]
	};



	// This component's Logic definition:
	var _logic = {

		init: function() {

			AppList.logic.init();
			AppForm.logic.init();
		}
		
	}


	// Expose any globally accessible Actions:
	var _actions = {

		// initiate a request to create a new Application
		transitionApplicationForm:function(App){
			
			AppForm.logic.formReset();
			if (App) {
				// populate Form here:
				AppForm.logic.formPopulate(App);
			} else {

				// this is a create operation and we should
				// clear our AppList
				AppList.logic.reset();
			}
			AppForm.logic.show();
		},

		transitionApplicationList:function() {
			$$(ids.choose).back();
			// AppList.logic.show();
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,
		logic:_logic,
		actions:_actions
	}

});