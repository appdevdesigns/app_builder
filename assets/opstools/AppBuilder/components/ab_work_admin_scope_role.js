const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Scope_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope_role');

		let L = this.Label;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			datatable: this.unique('datatable')
		};

		let CurrentApplication;


		// Our webix UI definition:
		this.ui = {
			fillspace: true
		};

		// Our init() function for setting up our UI
		this.init = (scopeDC) => {
		};

		let _logic = {

			applicationLoad: (application) => {
				CurrentApplication = application;
			},

			onShow: () => {
			}

		};

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.onShow = _logic.onShow;

	}

};