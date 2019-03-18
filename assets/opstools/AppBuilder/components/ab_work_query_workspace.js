
/*
 * ab_work_query_workspace
 *
 * Manage the Query Workspace area.
 *
 */

import ABQueryWorkspaceDesign from "./ab_work_query_workspace_design"
import ABObjectWorkspace from "./ab_work_object_workspace"
// import ABObjectWorkspaceDataTable from "./ab_work_object_workspace_datatable"


export default class ABWorkQueryWorkspace extends OP.Component {

    /**
     * @param {object} ??
     */
	constructor(App) {
		var idBase = 'ab_work_query_workspace';

		super(App, idBase);

		var L = this.Label;

		var labels = {
			design: L('ab.query.designMode', "*Build Query"),
			addNew: L('ab.query.addNew', "*Add new query"),
			run: L('ab.query.runMode', "*View Query"),
			loadAll: L('ab.query.loadAll', "*Load all"),
			selectQuery: L('ab.query.selectQuery', "*Select a query to work with.")
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			multiview: this.unique('multiview'),
			toolbar: this.unique('toolbar'),
			modeButton: this.unique('modeButton'),
			loadAllButton: this.unique('loadAllButton'),
			noSelection: this.unique('noSelection')
		};

		var settingsDataTable = {
			allowDelete: false,
			isInsertable: false,
			isEditable: false,
			massUpdate: false,
			configureHeaders: true,
			isFieldAddable: false
		};

		var QueryDesignComponent = new ABQueryWorkspaceDesign(App, idBase);
		var DataTable = new ABObjectWorkspace(App, idBase, settingsDataTable);

		var CurrentMode = "design"; // 'design' or 'run'

		// Our webix UI definition:
		this.ui = {
			type: "line",
			id: ids.component,
			rows: [
				{
					view: 'tabbar',
					id: ids.toolbar,
					hidden: true,
					borderless: false,
					bottomOffset: 0,
					// css: "ab-data-toolbar",
					options: [
						{
							value: labels.design,
							icon: "fa fa-sliders",
							type: "icon",
							id: "design",
							on: {
								'click': function () {
									_logic.changeMode('run');
								}								
							}
						},
						{
							value: labels.run,
							icon: "fa fa-table",
							type: "icon",
							id: "run",
							on: {
								'click': function () {
									_logic.changeMode('design');
								}
							}
						}
					],
					on: {
						'onChange': function (newv, oldv) {
							if (newv != oldv) {
								_logic.changeMode(newv);
							}
						}
					}
				},
				{
					view: 'multiview',
					id: ids.multiview,
					cells: [
						{
							id: ids.noSelection,
							rows: [
								{
									maxHeight: App.config.xxxLargeSpacer,
									hidden: App.config.hideMobile
								},
								{
									view:'label',
									align: "center",
									height: 200,
									label: "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-filter'></div>"
								},
								{
									view: 'label',
									align: "center",
									label: labels.selectQuery
								},
								{
									cols: [
										{},
										{
											view: "button",
											label: labels.addNew,
											type: "form",
											autowidth: true,
											click: function() {
												App.actions.addNewQuery(true);
											}
										},
										{}
									]
								},
								{
									maxHeight: App.config.xxxLargeSpacer,
									hidden: App.config.hideMobile
								}
							]
						},
						QueryDesignComponent.ui,
						DataTable.ui
					]
				},
				{
					view: 'button',
					id: ids.loadAllButton,
					label: labels.loadAll,
					type: "form",
					hidden: true,
					click: function () {
						_logic.loadAll();
					}
				}
			]
		};

		// Our init() function for setting up our UI
		this.init = function () {
			
			$$(ids.noSelection).show();

			QueryDesignComponent.init();

			DataTable.init({
				onCheckboxChecked: _logic.callbackCheckboxChecked
			});

		};


		var CurrentApplication = null;
		var CurrentQuery = null;


		// our internal business logic
		var _logic = {

			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application
			 */
			applicationLoad: (application) => {
				CurrentApplication = application;

				QueryDesignComponent.applicationLoad(application);
				DataTable.applicationLoad(application);

			},


			/**
			 * @function clearWorkspace()
			 *
			 * Clear the query workspace.
			 */
			clearWorkspace: function () {
				CurrentQuery = null;
				
				// $$(ids.noSelection).show(false, false);

				QueryDesignComponent.clearWorkspace();

			},


			/**
			 * @function populateQueryWorkspace()
			 *
			 * Initialize the Object Workspace with the provided ABObject.
			 *
			 * @param {ABObject} object     current ABObject instance we are working with.
			 */
			populateQueryWorkspace: function (query) {

				CurrentQuery = query;

				_logic.changeMode(CurrentMode);
				
				// $$(ids.noSelection).show(false, false);

			},
			
			/**
			 * @function resetTabs()
			 *
			 * When a new query is set we need to reset the tabs too
			 *
			 */
			resetTabs: function () {
				$$(ids.toolbar).setValue("design");
			},


			changeMode: function (mode) {
				
				// $$(ids.noSelection).hide(false, false);
				$$(ids.toolbar).show(false, false);

				// Run
				if (mode == 'run') {
					// $$(ids.modeButton).define('label', labels.design);
					// $$(ids.modeButton).define('icon', "fa fa-tasks");
					$$(ids.loadAllButton).show();
					// $$(ids.loadAllButton).refresh();

					DataTable.populateObjectWorkspace(CurrentQuery);

					$$(ids.multiview).setValue(DataTable.ui.id);
				}
				// Design
				else {
					// $$(ids.modeButton).define('label', labels.run);
					// $$(ids.modeButton).define('icon', "fa fa-cubes");
					$$(ids.loadAllButton).hide();
					// $$(ids.loadAllButton).refresh();

					$$(QueryDesignComponent.ui.id).show(true);

					QueryDesignComponent.populateQueryWorkspace(CurrentQuery);

				}
				
				
				// $$(ids.modeButton).refresh();

			},

			loadAll: function() {

				DataTable.loadAll();

			}


		};

		// Expose any globally accessible Actions:
		this.actions({
		});

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.clearWorkspace = _logic.clearWorkspace;
		this.populateQueryWorkspace = _logic.populateQueryWorkspace;
		this.resetTabs = _logic.resetTabs;


	}
}
