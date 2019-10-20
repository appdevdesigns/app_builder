
/*
 * ab_work_process
 *
 * Display the Process Tab UI:
 *
 */


import AB_Work_Process_List from "./ab_work_process_list"
import AB_Work_Process_Workspace from "./ab_work_process_workspace"



export default class AB_Work_Process extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App) {
		super(App, 'ab_work_process');
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {
			}
		}


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

		}


		var ProcessList = new AB_Work_Process_List(App);
		var ProcessWorkspace = new AB_Work_Process_Workspace(App);

		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			margin: 10,
			cols: [
				ProcessList.ui,
				{ view: "resizer"},
				ProcessWorkspace.ui
			]
		};





		// Our init() function for setting up our UI
		this.init = function() {

			ProcessWorkspace.init();
			ProcessList.on("select", ()=>{
				_logic.callbackSelectProcess();
			});
			// ProcessList.init({
			// 	onChange: _logic.callbackSelectProcess
			// });

		}


		// our internal business logic
		var _logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Process Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application
			 */
			applicationLoad: function(application) {

				CurrentApplication = application;

// ProcessWorkspace.clearProcessWorkspace();
				ProcessList.applicationLoad(application);
// ProcessWorkspace.applicationLoad(application);
			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show:function() {

				$$(ids.component).show();

				if (CurrentApplication &&
					(!CurrentApplication.loadedProcesss ||
					ProcessList.count() < 1)) {

					ProcessList.busy();

					CurrentApplication.objectLoad()
						.then(() => {

							ProcessList.applicationLoad(CurrentApplication);
							ProcessList.ready();

						});
				}

			},

			callbackSelectProcess: function(object) {

				if (object == null)
					ProcessWorkspace.clearProcessWorkspace();
				else
					ProcessWorkspace.populateProcessWorkspace(object);
			}

		}
		this._logic = _logic;



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}
