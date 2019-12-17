const ABComponent = require("../classes/platform/ABComponent");

const ABAdminFormInfo = require("./ab_work_admin_user_form_info");
const ABAdminFormScope = require("app_builder/assets/opstools/AppBuilder/components/ab_work_admin_user_form_scope");

module.exports = class AB_Work_Admin_User_Form extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_form');

		let L = this.Label;

		let FormInfo = new ABAdminFormInfo(App);
		let FormScope = new ABAdminFormScope(App);

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component')
		};

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			rows: [
				{
					borderless: true,
					type: "space",
					cols: [
						FormInfo.ui,
						FormScope.ui
					]
				},
				{
					fillspace: true
				}
			]
		};

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (userDC) => {

			this._userDC = userDC;

			FormInfo.init(userDC);
			FormScope.init(userDC);

		}

		// our internal business logic
		let _logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application 
			 */
			applicationLoad: function (application) {

				CurrentApplication = application;

				FormInfo.applicationLoad(application);
				FormScope.applicationLoad(application);

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				FormScope.show();

			}
		}

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}
};