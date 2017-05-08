
/*
 * AB
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */

// import '../OP/OP'

import './ab_choose'
import './ab_work'

// Import our Custom Components here:
import EditTree from '../webix_custom_components/edittree'
import EditList from '../webix_custom_components/editlist'

import style from "../AppBuilder.css"


OP.Component.extend('ab', function(App) {


	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}


	// setup the common labels for our AppBuilder Application.
	App.labels = {
		add: L('ab.common.add', "*Add"),
		create: L('ab.common.create', "*Create"),
		"delete": L('ab.common.delete', "*Delete"),
		edit: 	  L('ab.common.edit', "*Edit"),
		"export": L('ab.common.export', "*Export"),
		formName: L('ab.common.form.name', "*Name"),
		"import": L('ab.common.import', "*Import"),
		ok: 	  L('ab.common.ok', "*Ok"),

		cancel:   L('ab.common.cancel', "*Cancel"),
		save: 	  L('ab.common.save', "*Save"),

		yes: 	  L('ab.common.yes', "*Yes"),
		no: 	  L('ab.common.no', "*No"),

		createErrorMessage:   L('ab.common.create.error', "*System could not create <b>{0}</b>."),
		createSuccessMessage: L('ab.common.create.success', "*<b>{0}</b> is created."),

		updateErrorMessage:  L('ab.common.update.error', "*System could not update <b>{0}</b>."),
		updateSucessMessage: L('ab.common.update.success', "*<b>{0}</b> is updated."),

		deleteErrorMessage:   L('ab.common.delete.error', "*System could not delete <b>{0}</b>."),
		deleteSuccessMessage: L('ab.common.delete.success', "*<b>{0}</b> is deleted."),


		// Data Field  common Property labels:
		dataFieldHeaderLabel: L('ab.dataField.common.headerLabel', '*Label'),
		dataFieldHeaderLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Header Name'),

		dataFieldColumnName: L('ab.dataField.common.columnName', '*Name'),
		dataFieldColumnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Column Name'),

		dataFieldShowIcon: L('ab.dataField.common.showIcon', '*show icon?')
	}


	// make instances of our Custom Components:
	OP.CustomComponent[EditTree.key](App, 'edittree'); // ->  App.custom.edittree  now exists
	OP.CustomComponent[EditList.key](App, 'editlist'); // ->  App.custom.editlist  now exists




	var ids = {
		component:App.unique('app_builder_root')
	}



	// Define the external components used in this Component:
	var AppChooser = OP.Component['ab_choose'](App);
	var AppWorkspace = OP.Component['ab_work'](App);


	// This component's UI definition:
	// Application multi-views
	var _ui = {
		id: ids.component,
		view:"multiview",
		borderless:true,
		animate: false,
		rows:[
			AppChooser.ui,
			AppWorkspace.ui
		]
	};



	// This component's init() definition:
	var _init = function() {

		AppChooser.init();
		AppWorkspace.init();

		// start off only showing the App Chooser:
		App.actions.transitionApplicationChooser();

		// perform an initial resize adjustment
		$$(ids.component).adjust();
	}


	// Expose any globally accessible Actions:
	var _actions = {

	}

	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions		// {ob}		hash of fn() to expose so other components can access.
	}

});






//// REFACTORING TODOs:
// TODO: AppForm-> Permissions : refresh permission list, remove AppRole permission on Application.delete().
