/*
 * ab_work_dataview
 *
 *
 */

import AB_Work_Dataview_List from "./ab_work_dataview_list"
import AB_Work_Dataview_Workspace from "./ab_work_dataview_workspace"

export default class AB_Work_Dataview extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_dataview');

		let L = this.Label;
		let labels = {

			common: App.labels,

			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),

			}
		}

		let DataviewList = new AB_Work_Dataview_List(App);
		let DataviewWorkspace = new AB_Work_Dataview_Workspace(App);

		let CurrentApplication;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),

		}

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			cols: [
				DataviewList.ui,
				{ view: "resizer", width: 11 },
				DataviewWorkspace.ui
			]
		};

		// Our init() function for setting up our UI
		this.init = function () {

			DataviewWorkspace.init();
			DataviewList.init({
				onChange: _logic.callbackSelectDataview
			});

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
			applicationLoad: function (application) {

				CurrentApplication = application;

				DataviewWorkspace.clearWorkspace();
				DataviewList.applicationLoad(application);
				DataviewWorkspace.applicationLoad(application);
			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				if (CurrentApplication &&
					(!CurrentApplication.loadedDataview ||
					DataviewList.count() < 1)) {

					DataviewList.busy();

					CurrentApplication.dataviewLoad()
						.then(() => {

							DataviewList.applicationLoad(CurrentApplication);
							DataviewList.ready();

						});
				}

			},

			callbackSelectDataview: function (dataview) {

				if (dataview == null)
					DataviewWorkspace.clearWorkspace();
				else
					DataviewWorkspace.populateWorkspace(dataview);
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