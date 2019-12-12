const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Scope extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope');

		let L = this.Label;

		let labels = {

			common: App.labels,
			component: {
				// formHeader: L('ab.application.form.header', "*Application Info"),
			}
		}

		let CurrentApplication;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),

		}



		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			rows: [
				{
					view: 'label',
					label: "Admin Scope"
				},
				{
					fillspace: true
				}
			]
		};



		// Our init() function for setting up our UI
		this.init = function () {

			// webix.extend($$(ids.component), webix.ProgressBar);

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

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

			},

			busy: () => {

				if ($$(ids.component) &&
					$$(ids.component).showProgress)
					$$(ids.component).showProgress({ type: "icon" });

			},

			ready: () => {

				if ($$(ids.component) &&
					$$(ids.component).hideProgress)
					$$(ids.component).hideProgress();

			},


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