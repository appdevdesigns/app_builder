
/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */


import './ab_choose_list'

OP.Component.extend('ab_choose', function(App) {


	var ids = {
		choose:App.unique('ab_choose')
	}



	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);



	// This component's UI definition:
	// Application multi-views
	var _ui = {
		id: ids.choose,
		autoheight: true,
		cells: [
			AppList.ui,
			// appFormControl
		]
	};



	// This component's Logic definition:
	var _logic = {

		init: function() {

			AppList.logic.init();

		},

		// Expose any globally accessible Actions:
		actions: {

			// initiate a request to create a new Application
			createApplicationRequest:function(){
				AppList.logic.reset();
				// AppForm.logic.reset();
				// switch to the AppForm
			}

		}
	}



	// return the current instance of this component:
	return {
		ui:_ui,
		logic:_logic
	}

});