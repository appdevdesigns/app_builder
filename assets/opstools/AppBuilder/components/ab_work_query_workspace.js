
/*
 * ab_work_query_workspace
 *
 * Manage the Query Workspace area.
 *
 */

import ABQueryWorkspaceDesign from "./ab_work_query_workspace_design"
import ABObjectWorkspaceDataTable from "./ab_work_object_workspace"
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
			design: L('ab.query.designMode', "*Design mode"),
			run: L('ab.query.runMode', "*Run mode")
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			toolbar: this.unique('toolbar'),
			modeButton: this.unique('modeButton')
		};

		var QueryDesignComponent = new ABQueryWorkspaceDesign(App, idBase);
		var DataTable = new ABObjectWorkspaceDataTable(App, idBase);

		var currentMode = "design"; // 'design' or 'run'

		// Our webix UI definition:
		this.ui = {
			rows: [
				{
					view: 'toolbar',
					id: ids.toolbar,
					css: "ab-data-toolbar",
					cols: [
						{
							view: 'button',
							id: ids.modeButton,
							label: labels.design,
							icon: "certificate",
							type: "icon",
							width: 140,
							click: function () {
								_logic.changeMode();
							}
						}
					]
				},
				{
					view: 'multiview',
					id: ids.component,
					cells: [
						QueryDesignComponent.ui,
						DataTable.ui
					]
				}
			]
		};

		// Our init() function for setting up our UI
		this.init = function () {

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

				DataTable.applicationLoad(application);

			},


			/**
			 * @function clearWorkspace()
			 *
			 * Clear the query workspace.
			 */
			clearWorkspace: function () {
				CurrentQuery = null;

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

				QueryDesignComponent.populateQueryWorkspace(query);


				DataTable.populateObjectWorkspace(query);
				// DataTable.objectLoad(query);
				// DataTable.refreshHeader();
				// DataTable.refresh();

			},


			changeMode: function () {

				// Run
				if (currentMode == 'design') {
					currentMode = 'run';
					$$(ids.modeButton).define('label', labels.run);

					$$(DataTable.ui.id).show();
				}
				// Design
				else {
					currentMode = 'design';
					$$(ids.modeButton).define('label', labels.design);

					$$(QueryDesignComponent.ui.id).show();
				}

				$$(ids.modeButton).refresh();

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


	}
}
