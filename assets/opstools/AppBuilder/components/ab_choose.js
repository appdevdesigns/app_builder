
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
		chooseComponent:App.unique('ab_choose')
	}



	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view:"multiview",
		id: ids.chooseComponent,
		autoheight: true,
		cells: [
			AppList.ui,
			AppForm.ui
		]
	};



	// This component's Init definition:
	var _init = function() {

		AppList.init();
		AppForm.init();
		
	}



	// Expose any globally accessible Actions:
	var _actions = {

		// initiate a request to create a new Application
		transitionApplicationForm:function(Application){
			
			// if no Application is given, then this should be a [create] operation,
			// so clear our AppList
			if ('undefined' == typeof Application) {
				App.actions.unselectApplication();
			}


			App.actions.populateApplicationForm(Application);
		},

		transitionApplicationList:function() {

			$$(ids.chooseComponent).back();
			// AppList.logic.show();
		}

	}



	var _logic = {

	}



	// return the current instance of this component:
	return {
		ui:_ui,
		init:_init,
		actions:_actions,

		_logic:_logic		// Unit Testing
	}

});