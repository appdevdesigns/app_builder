
/*
 * ab_work
 *
 * Display the component for working with an ABApplication.
 *
 */

// import ABApplication from "../classes/ABApplication"
import AB_Work_Object from "./ab_work_object"
import AB_Work_Query from "./ab_work_query"
import AB_Work_Interface from "./ab_work_interface"



export default class AB_Work extends OP.Component {  // ('ab_work', function(App) {


	constructor(App, options) {
		super(App, 'ab_work');

		options = options || {};

		var L = this.Label;


		var labels = {

			common : App.labels,

			component: {

				backToApplication: L('ab.application.backToApplication', "*Back to Applications page"),
				collapseMenu: L('ab.application.collapseMenu', "*Collapse Menu"),
				expandMenu: L('ab.application.expandMenu', "*Expand Menu"),
				objectTitle: L('ab.object.title', "*Objects"),
				queryTitle: L('ab.query.title', "*Queries"),
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
			tab_query:      this.unique('tab_query'),
			tab_interface: 	this.unique('tab_interface'),
			workspace: 		this.unique('workspace'),
			collapseMenu: 	this.unique('collapseMenu'),
			expandMenu:		this.unique('expandMenu')
		}


		var AppObjectWorkspace = new AB_Work_Object(App);
		var AppQueryWorkspace = new AB_Work_Query(App);
		var AppInterfaceWorkspace = new AB_Work_Interface(App);

		var sidebarItems = 	[{
			id: ids.tab_object,
			value: labels.component.objectTitle,
			icon: "fa fa-fw fa-database"
		},
		{
			id: ids.tab_query,
			value: labels.component.queryTitle,
			icon: "fa fa-fw fa-filter"
		},
		{
			id: ids.tab_interface,
			value: labels.component.interfaceTitle,
			icon: "fa fa-fw fa-id-card-o"
		}];

		var expandMenu = {
			id: ids.expandMenu, 
			value: labels.component.expandMenu, 
			icon: "fa fa-fw fa-chevron-circle-right"
		};

		var collapseMenu = {
			id: ids.collapseMenu, 
			value: labels.component.collapseMenu, 
			icon: "fa fa-fw fa-chevron-circle-left"
		};
							
		var selectedItem = ids.tab_object;

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			rows: [
				{
					view: "toolbar",
					id: ids.toolBar,
					autowidth: true,
					elements: [
						{
							view: "button",
							label: labels.component.backToApplication,
							autowidth: true,
							align: "left",
							type: "icon",
							icon: "fa fa-arrow-left",
							align: "left",
							hidden: options.IsBackHidden || false, // hide this button in the admin lve page
							click: function () {
								App.actions.transitionApplicationChooser();
							}
						},
						// {
						// 	view: "button", 
						// 	type: "icon", 
						// 	icon: "fa fa-bars",
						// 	width: 37, 
						// 	align: "left", 
						// 	css: "app_button", 
						// 	click: function(){
						// 		$$(ids.tabbar).toggle();
						// 	}
						// },
						{},
						{
							view: "label",
							css: "appTitle",
							id: ids.labelAppName,
							align: "center"
						},
						{}
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
				{
					cols: [
						{
							css: "webix_dark",
							view: "sidebar",
							id: ids.tabbar,
							width: 160,
							data: sidebarItems.concat(collapseMenu),
							on: {
								onAfterSelect: function (id) {
									if (id == ids.collapseMenu) {
										setTimeout(function(){
											$$(ids.tabbar).remove(ids.collapseMenu);
											$$(ids.tabbar).add(expandMenu);
											$$(ids.tabbar).toggle();
											$$(ids.tabbar).select(selectedItem);
											webix.storage.local.put("state", $$(ids.tabbar).getState());
										}, 0);
									} else if (id == ids.expandMenu) {
										setTimeout(function(){
											$$(ids.tabbar).remove(ids.expandMenu);
											$$(ids.tabbar).add(collapseMenu);
											$$(ids.tabbar).toggle();
											$$(ids.tabbar).select(selectedItem);
											webix.storage.local.put("state", $$(ids.tabbar).getState());
										}, 0);
									} else {
										_logic.tabSwitch(id);
										selectedItem = id;
									}
								}
							}
						},
						{
							id: ids.workspace,
							cells: [
								AppObjectWorkspace.ui,
								AppQueryWorkspace.ui,
								AppInterfaceWorkspace.ui
							]
						}
					]
				},
			]
		};



		// Our init() function for setting up our UI
		this.init = function() {

			AppObjectWorkspace.init();
			AppQueryWorkspace.init();
			AppInterfaceWorkspace.init();

//// TODO: keep track of the last workspace in application.workspace.lastWorkspace on every
//// tab switch, then use that value here to show you which tab to display on loading.
//// don't save application each time the tab workspace changes.  just make the setting 
//// and then when they update anything in those workspace editors, this get's updated.

			// initialize the Object Workspace to show first.
			var state = webix.storage.local.get("state");
			if (state) {
				$$(ids.tabbar).setState(state);
				
				if (state.collapsed) {
					setTimeout(function(){
						$$(ids.tabbar).remove(ids.collapseMenu);
						$$(ids.tabbar).add(expandMenu);
					}, 0);
				}
			}

			_logic.tabSwitch(ids.tab_object);
			$$(ids.tabbar).select(ids.tab_object);

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
			 * @function tabSwitch
			 *
			 * Every time a tab switch happens, decide which workspace to show.
			 *
			 * @param {string} idTab	the id of the tab that was changed to.
			 */
			tabSwitch:function(idTab) {

				switch( idTab ) {

					// Object Workspace Tab
					case ids.tab_object:

						// $$(ids.buttonSync).show();
						AppObjectWorkspace.show();
						break;

					// Query Workspace Tab
					case ids.tab_query:

						// $$(ids.buttonSync).show();
						AppQueryWorkspace.show();
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
				AppQueryWorkspace.applicationLoad(application);
				AppInterfaceWorkspace.applicationLoad(application);


				_logic.show();	
			}

		})


	}

}

// export to ABLiveTool
window.ABWorkUI = AB_Work;