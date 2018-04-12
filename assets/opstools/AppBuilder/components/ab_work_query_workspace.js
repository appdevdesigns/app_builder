
/*
 * ab_work_query_workspace
 *
 * Manage the Query Workspace area.
 *
 */

import ABQueryWorkspaceDesign from "./ab_work_query_workspace_design"
import ABQueryWorkspaceRun from "./ab_work_query_workspace_run"


export default class ABWorkQueryWorkspace extends OP.Component {

    /**
     * @param {object} ??
     */
	constructor(App) {
		super(App, 'ab_work_query_workspace');
		var L = this.Label;

		var labels = {
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
		};

		var QueryDesignComponent = new ABQueryWorkspaceDesign(App);

		// Our webix UI definition:
		this.ui = {
			view: 'multiview',
			id: ids.component,
			rows: [
				QueryDesignComponent.ui
			]
		};

		// Our init() function for setting up our UI
		this.init = function () {

			QueryDesignComponent.init();

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
			 * @function populateObjectWorkspace()
			 *
			 * Initialize the Object Workspace with the provided ABObject.
			 *
			 * @param {ABObject} object     current ABObject instance we are working with.
			 */
			populateQueryWorkspace: function (query) {

				QueryDesignComponent.populateQueryWorkspace(query);

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
