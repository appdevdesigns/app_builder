
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

var idBase = 'ab_choose';
OP.Component.extend(idBase, function(App) {


	var ids = {
		component:App.unique(idBase + '_component')
	}



	// Define the external components used in this Component:
	var AppList = OP.Component['ab_choose_list'](App);
	var AppForm = OP.Component['ab_choose_form'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		view:"multiview",
		id: ids.component,
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


		/**
		 * @function transitionApplicationChooser
		 *
		 * Switch the AppBuilder UI to show the Application Chooser component.
		 */
		transitionApplicationChooser:function() {
			$$(ids.component).show();	
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