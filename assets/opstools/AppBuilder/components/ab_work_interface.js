
/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */

import AB_Work_Interface_List from "./ab_work_interface_list"
import AB_Work_Interface_Workspace from "./ab_work_interface_workspace"

export default class AB_Work_Interface extends OP.Component {  


	constructor(App) {
		super(App, 'ab_work_interface');

		var L = this.Label;


		var labels = {

			common : App.labels,

			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),

			}
		}


		var ViewList = new AB_Work_Interface_List(App);
		var ViewWorkspace = new AB_Work_Interface_Workspace(App);


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

		}



		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			cols: [
				ViewList.ui,
				{ view: "resizer", width: 11},
				ViewWorkspace.ui
			]
		};



		// Our init() function for setting up our UI
		this.init = function() {
			// webix.extend($$(ids.form), webix.ProgressBar);
			ViewList.init();
			ViewWorkspace.init();

		}


		// our internal business logic
		var _logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application 
			 */
			applicationLoad:function(application) {

				App.actions.clearInterfaceWorkspace();
				ViewList.applicationLoad(application);

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show:function() {

				$$(ids.component).show();
			}
		}
		this._logic = _logic;


		this.actions({

		});



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}
