
/*
 * ab_work
 *
 * Display the component for working with an ABApplication.
 *
 */

// import ABApplication from "../classes/ABApplication"
import AB_Work_Object from "./ab_work_object"
import AB_Work_Interface from "./ab_work_interface"



export default class AB_Work extends OP.Component {  // ('ab_work', function(App) {


	constructor(App) {
		super(App, 'ab_work');

		var L = this.Label;


		var labels = {

			common : App.labels,

			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),
				backToApplication: L('ab.application.backToApplication', "*Back to Applications page"),
				synchronize: L('ab.application.synchronize', "*Synchronize"),
				objectTitle: L('ab.object.title', "*Objects"),
				interfaceTitle: L('ab.interface.title', "*Interface")
			}
		}



		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component:  	this.unique('component'),
			toolBar:  		this.unique('toolbar'),
			buttonSync:  	this.unique('button_sync'),
			labelAppName:  	this.unique('label_appname'),
			tabbar:  		this.unique('tabbar'),
			tab_object: 	this.unique('tab_object'),
			tab_interface: 	this.unique('tab_interface'),
			workspace: 		this.unique('workspace'),
		}


		var AppObjectWorkspace = new AB_Work_Object(App);
		var AppInterfaceWorkspace = new AB_Work_Interface(App);



		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			rows: [
				{
					view: "toolbar",
					id: ids.toolBar,
					autowidth: true,
					cols: [
						{
							view: "button",
							label: labels.component.backToApplication,
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
						// 	label: labels.component.synchronize,
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
				// 			value: labels.component.objectTitle,
				// 			width: App.config.tabWidthMedium
				// 		},
				// 		{
				// 			id: ids.tab_interface,
				// 			value: labels.component.interfaceTitle,
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
									fitBiggest: true,
									options: [
										{
											id: ids.tab_object,
											value: labels.component.objectTitle,
											width: App.config.tabWidthMedium
										},
										{
											id: ids.tab_interface,
											value: labels.component.interfaceTitle,
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
		this.init = function() {

			AppObjectWorkspace.init();
			AppInterfaceWorkspace.init();

//// TODO: keep track of the last workspace in application.workspace.lastWorkspace on every
//// tab switch, then use that value here to show you which tab to display on loading.
//// don't save application each time the tab workspace changes.  just make the setting 
//// and then when they update anything in those workspace editors, this get's updated.

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

						// $$(ids.buttonSync).show();
						AppObjectWorkspace.show();
						break;

					// Interface Workspace Tab
					case ids.tab_interface:

						// $$(ids.buttonSync).hide();
						AppInterfaceWorkspace.show();
						break;
				}

			}
		}
		this._logic = _logic;



		this.actions({

			/**
			 * @function transitionWorkspace
			 *
			 * Switch the UI to view the App Workspace screen.
			 *
			 * @param {ABApplication} application
			 */
			transitionWorkspace:function(application){

				_logic.applicationInit(application);
				AppObjectWorkspace.applicationLoad(application);
				AppInterfaceWorkspace.applicationLoad(application);


				_logic.show();	
			}

		})


	}

}
