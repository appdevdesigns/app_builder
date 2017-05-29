
/*
 * ab_work_interface_list_newPage
 *
 * Display the form for creating a new Application.
 *
 */

import "./ab_work_interface_list_newPage_blankPage"
import ABPage from '../classes/views/ABViewPage'


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		addNewPage : L('ab.interface.addNewPage', '*Add a new page'),

		// formHeader: L('ab.application.form.header', "*Application Info"),
		quickPage : L('ab.interface.quickPage', '*Quick Page'),
		blankPage : L('ab.interface.blankPage', '*Blank Page'),

	}
}


var idBase = 'ab_work_interface_list_newPage';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

		selectTab: App.unique(idBase + '_selectTab'),

		tabBlank: App.unique(idBase + '_tabBlank'),
		tabQuick: App.unique(idBase + '_tabQuick'),

		buttonSave: App.unique(idBase + '_buttonSave')

	}


	var BlankPage = OP.Component['ab_work_interface_list_newPage_blankPage'](App);


	// Our webix UI definition:
	var _ui = {
		view: "window",
		id: ids.component,

//// TODO: @James
width: 650,
maxHeight: 500,

		position: "center",
		modal: true,
		head: labels.component.addNewPage,
		body: {
			rows: [
				{
					id: ids.selectTab,
					view: "tabbar",
					multiview: true,
					options: [
						{ id: ids.tabQuick, value: labels.component.quickPage },
						{ id: ids.tabBlank, value: labels.component.blankPage }
					],
					on: {
						onChange: function(newTab, oldTab){
							_logic.tabSwitch(newTab, oldTab);
						}
					}
				},
				{
					cells: [
						BlankPage.ui,
						// QuickPage.ui
					]
				},
				{
					margin: 5,
					cols: [
						{
							view: "button",
							value: labels.common.cancel,
							click: function () { 
								_logic.buttonCancel();  
							}
						},
						{
							id: ids.buttonSave,
							view: "button",
							value: labels.common.add,
// type: "form",
							click: function() {
								_logic.buttonSave();
							} 
						}
					]
				}
			]
		}
	};



	// Our init() function for setting up our UI
	var _init = function(options) {
		// webix.extend($$(ids.form), webix.ProgressBar);

		// we're a popup, so create our own ui
		webix.ui(_ui);

		// register our callbacks:
		for(var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		$$(ids.selectTab).setValue(ids.tabBlank);
		_logic.tabSwitch( ids.tabBlank )
	}


	var CurrentApplication = null;
	var CurrentEditor = null;


	// our internal business logic 
	var _logic = {

		/**
		 * @function applicationLoad()
		 *
		 * Prepare our New Popups with the current Application
		 */
		applicationLoad: function(application) {
			CurrentApplication = application;

			BlankPage.applicationLoad(application);
// QuickPage.applicationLoad(application);
		},


		buttonCancel: function() {
			CurrentEditor.clear();
			_logic.hide();
		},
		
		buttonSave:function(){

			var values = CurrentEditor.values();
			
			// this interface only creates Root Pages, or pages related to 
			var page = null;
			if(values.parent) {
				page = values.parent.newChild(values);
			} else {
				page = CurrentApplication.viewNew(values);
			}

			var validator = page.isValid(values);
			if (validator.fail()) {
				CurrentEditor.errors(validator);
			} else {

				page.save()
				.then(()=>{
					_logic.callbacks.onSave(page);
					CurrentEditor.clear();
					_logic.hide();

					// the CurrentApplication has changed it's values, so 
					// refresh our editors with the curent values:
					_logic.applicationLoad(CurrentApplication);
				})
			}
		},


		callbacks:{
			onSave: function() { console.error('!! no onSave() callback handler! '); }
		},


		/**
		 * @function hide()
		 *
		 * Hide this component.
		 */
		hide:function() {

			$$(ids.component).hide();
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

			$$(ids.component).show();
		},


		/**
		 * @function tabSwitch()
		 *
		 * Switch between the different New Page Editors.
		 */
		tabSwitch: function(newTab, oldTab) {

			if (newTab != oldTab) {

				switch (newTab) {
					case ids.tabQuick:
						CurrentEditor = QuickPage;
						QuickPage.show();
						break;
					case ids.tabBlank:
						CurrentEditor = BlankPage;
						BlankPage.show();
						break;
				}
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
		hide: _logic.hide,
		show: _logic.show,

		_logic: _logic			// {obj} 	Unit Testing
	}

})