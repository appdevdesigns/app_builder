
/*
 * AB 
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */

import '../OP/OP'

import './ab_choose'
// import './ab_work'

OP.Component.extend('ab', function(App) {


	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	
	// setup the common labels for our AppBuilder Application.
	App.labels.common = {
		"import": L('ab.common.import', "*Import"),
		edit: 	  L('ab.common.edit', "*Edit"),
		save: 	  L('ab.common.save', "*Save"),
		"delete": L('ab.common.delete', "*Delete"),
		"export": L('ab.common.export', "*Export"),
		ok: 	  L('ab.common.ok', "*Ok"),
		cancel:   L('ab.common.cancel', "*Cancel"),
		yes: 	  L('ab.common.yes', "*Yes"),
		no: 	  L('ab.common.no', "*No"),

		createErrorMessage:   L('ab.common.create.error', "*System could not create <b>{0}</b>."),
		createSuccessMessage: L('ab.common.create.success', "*<b>{0}</b> is created."),

		updateErrorMessage:  L('ab.common.update.error', "*System could not update <b>{0}</b>."),
		updateSucessMessage: L('ab.common.update.success', "*<b>{0}</b> is updated."),

		deleteErrorMessage:   L('ab.common.delete.error', "*System could not delete <b>{0}</b>."),
		deleteSuccessMessage: L('ab.common.delete.success', "*<b>{0}</b> is deleted."),
	}
		


	var ids = {
		appbuilder:App.unique('buld_app_loading_screen')
	}



	// Define the external components used in this Component:
	var AppChooser = OP.Component['ab_choose'](App);
	// var AppWorkspace = OP.Component['ab_work'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		id: ids.appbuilder,
		container:'ab-main-container',
		autoheight:true,
		autowidth:true,
		rows:[
			AppChooser.ui,
			// AppWorkspace.ui
		]
	};



	// This component's Logic definition:
	var _logic = {

		init: function() {

			AppChooser.init();
			// AppWorkspace.init();

			$$(ids.appbuilder).adjust();
		}
		
	}


	// Expose any globally accessible Actions:
	var _actions = {

		// transition to the Appbuilder workspace with given App
		transitionWorkspace:function(App){
console.error('TODO: transitionWorkspace()');			
			
		},

		transitionApplicationChooser:function() {
console.error('TODO: transitionApplicationChooser()');		
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_logic.init,		// {fn} 	init() to setup this component  
		actions:_actions		// {ob}		hash of fn() to expose so other components can access.
	}

});