const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Scope_User extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope_user');

		let L = this.Label;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			form: this.unique('form')
		};

		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			fillspace: true
		};

		// Our init() function for setting up our UI
		this.init = (scopeDC) => {

			this._scopeDC = scopeDC;

		}

		let _logic = {

			applicationLoad: (application) => {
				CurrentApplication = application;
			}

		};

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
	}

};