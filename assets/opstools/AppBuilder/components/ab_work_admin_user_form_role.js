const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_User_Form_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_form_role');

		let L = this.Label;

		let ids = {
			list: this.unique('list')
		};

		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			rows: [
				{ template: `<span class='fa fa-user-md'></span> ${L("ab.admin.userRole", "*Roles")}`, type: "header" },
				{
					view: 'list',
					id: ids.list
				}
			]
		};


		// Our init() function for setting up our UI
		this.init = (userDC) => {

			this._userDC = userDC;

			if ($$(ids.list)) {
				webix.extend($$(ids.list), webix.ProgressBar);

				if (this._userDC)
					$$(ids.list).bind(this._userDC);

			}

		};


		// our internal business logic
		let _logic = {

			applicationLoad: (application) => {

				CurrentApplication = application;

			},

			busy: () => {

				if ($$(ids.list) &&
					$$(ids.list).showProgress)
					$$(ids.list).showProgress({ type: "icon" });

			},

			ready: () => {

				if ($$(ids.list) &&
					$$(ids.list).hideProgress)
					$$(ids.list).hideProgress();

			},

		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;

	}
};