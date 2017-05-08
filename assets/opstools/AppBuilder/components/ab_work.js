
/*
 * ab_work
 *
 * Display the component for working with an ABApplication.
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object"
import "./ab_work_interface"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		backToApplication: L('ab.application.backToApplication', "*Back to Applications page"),
		synchronize: L('ab.application.synchronize', "*Synchronize"),
		objectTitle: L('ab.object.title', "*Objects"),
		interfaceTitle: L('ab.interface.title', "*Interface")
	}
}



OP.Component.extend('ab_work', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_component'),
		toolBar: App.unique('ab_work_toolbar'),
		buttonSync: App.unique('ab_work_button_sync'),
		labelAppName: App.unique('ab_work_label_appname'),
		tabbar: App.unique('ab_work_tabbar'),
		tab_object: App.unique('ab_work_tab_object'),
		tab_interface: App.unique('ab_work_tab_interface'),
		workspace: App.unique('ab_work_workspace'),
	}


	var AppObjectWorkspace = OP.Component['ab_work_object'](App);
	var AppInterfaceWorkspace = OP.Component['ab_work_interface'](App);

	// Our webix UI definition:
	var _ui = {
		id: ids.component,
		rows: [
			{
				view: "toolbar",
				id: ids.toolBar,
				autowidth: true,
				cols: [
					{
						view: "button",
						label: labels.application.backToApplication,
						width: 200,
						type: "icon",
						icon: "arrow-left",
						align: "left",
						click: function () {
							App.actions.transitionApplicationChooser();
						}
					},
					{
						view: "label",
						id: ids.labelAppName,
						align: "center"
					},
					{
						view: "spacer",
						width: 200,
						alrign: "right"
					}
					// {
					// 	id: ids.buttonSync,
					// 	view: "button",
					// 	type: "icon",
					// 	icon: "refresh",
					// 	label: labels.application.synchronize,
					// 	autowidth: true,
					// 	align: "right",
					// 	click: function () {
					// 		_logic.synchronize();
					// 	}
					// }
				]
			},
			//{ height: App.config.mediumSpacer },
			// {
			// 	view:"segmented",
			// 	id: ids.tabbar,
			// 	value: ids.tab_object,
			// 	multiview: true,
			// 	align: "center",
			// 	options:[
			// 		{
			// 			id: ids.tab_object,
			// 			value: labels.application.objectTitle,
			// 			width: App.config.tabWidthMedium
			// 		},
			// 		{
			// 			id: ids.tab_interface,
			// 			value: labels.application.interfaceTitle,
			// 			width: App.config.tabWidthMedium
			// 		}
			// 	],
			// 	on: {
			// 		onChange: function (idNew, idOld) {
			// 			if (idNew != idOld) {
			// 				_logic.tabSwitch(idNew, idOld);
			// 			}
			// 		}
			// 	}
			// },
			{ height: App.config.mediumSpacer },
			{
				cols: [
					{
						width: App.config.mediumSpacer
					},
					{
						rows: [
							{
								view: "tabbar",
								id: ids.tabbar,
								value: ids.tab_object,
								multiview: true,
								options: [
									{
										id: ids.tab_object,
										value: labels.application.objectTitle,
										width: App.config.tabWidthMedium
									},
									{
										id: ids.tab_interface,
										value: labels.application.interfaceTitle,
										width: App.config.tabWidthMedium
									}
								],
								on: {
									onChange: function (idNew, idOld) {
										if (idNew != idOld) {
											_logic.tabSwitch(idNew, idOld);
										}
									}
								}
							},
							{
								id: ids.workspace,
								cells: [
									AppObjectWorkspace.ui,
									AppInterfaceWorkspace.ui
								]
							}
						]
					},
					{
						width: App.config.mediumSpacer
					}
				]
			},
			{ height: App.config.mediumSpacer }
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {

		AppObjectWorkspace.init();
		AppInterfaceWorkspace.init();

		// initialize the Object Workspace to show first.
		_logic.tabSwitch(ids.tab_object);
	}



	// our internal business logic
	var _logic = {


		applicationInit:function(application) {

			// setup Application Label:
			$$(ids.labelAppName).define('label', application.label);
			$$(ids.labelAppName).refresh();

		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},


		/**
		 * @function synchronize
		 *
		 * Kick off the Synchronization process.
		 */
		synchronize:function() {

// self.element.trigger(self.options.synchronizeEvent, {
// 	appID: AD.classes.AppBuilder.currApp.id
// });
//// Question: where should this logic go?  Here or in ab.js ?

console.error('TODO: ab_work.logic.synchronize()!');
		},


		/**
		 * @function tabSwitch
		 *
		 * Every time a tab switch happens, decide which workspace to show.
		 *
		 * @param {string} idTab	the id of the tab that was changed to.
		 * @param {string} idOld	the previous tab id
		 */
		tabSwitch:function(idTab, idOld) {

			switch( idTab ) {

				// Object Workspace Tab
				case ids.tab_object:
					//$$(ids.buttonSync).show();
					App.actions.transitionObjectTab();
					break;

				// Interface Workspace Tab
				case ids.tab_interface:
					// $$(ids.buttonSync).hide();
					App.actions.transitionInterfaceWorkspace();
					break;
			}

		}
	}



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function transitionWorkspace
		 *
		 * Switch the UI to view the App Workspace screen.
		 *
		 * @param {ABApplication} application
		 */
		transitionWorkspace:function(application){

			_logic.applicationInit(application);
			App.actions.initObjectTab(application);
			App.actions.initInterfaceTab(application);

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
