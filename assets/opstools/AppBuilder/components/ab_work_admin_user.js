const ABComponent = require("../classes/platform/ABComponent");

const ABAdminUserList = require("./ab_work_admin_user_list");
const ABAdminUserForm = require("./ab_work_admin_user_form");

module.exports = class AB_Work_Admin_User extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user');

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component')
		};

		let userDC = new webix.DataCollection();

		let UserList = new ABAdminUserList(App);
		let UserForm = new ABAdminUserForm(App);


		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			view: "multiview",
			cells: [
				UserList.ui,
				UserForm.ui
			]
		};


		// Our init() function for setting up our UI
		this.init = function () {

			UserList.init(userDC);
			UserForm.init(userDC);

			userDC.attachEvent("onAfterCursorChange", (userId) => {

				if (userId)
					UserForm.show();
				else
					UserList.show();

			});

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

				UserList.applicationLoad(application);
				UserForm.applicationLoad(application);

			},

			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				UserList.show();

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