const ABComponent = require("../classes/platform/ABComponent");

const ABAdminRoleList = require("./ab_work_admin_role_list");
const ABAdminRoleForm = require("./ab_work_admin_role_form");
const ABAdminRoleScope = require("./ab_work_admin_role_scope");
const ABAdminRoleUser = require("./ab_work_admin_role_user");

module.exports = class AB_Work_Admin_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_role');

		let L = this.Label;

		let labels = {

			common: App.labels,
			component: {
				// formHeader: L('ab.application.form.header', "*Application Info"),
			}
		}

		let CurrentApplication;
		let RoleList = new ABAdminRoleList(App);
		let RoleForm = new ABAdminRoleForm(App);
		let RoleScope = new ABAdminRoleScope(App);
		let RoleUser = new ABAdminRoleUser(App);

		let roleDC = new webix.DataCollection();

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),
			scopes: this.unique('scope'),
			users: this.unique('user')
		}



		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			cols: [
				RoleList.ui,
				{
					view: "tabview",
					cells: [
						{
							header: "<span class='webix_icon fa fa-user-md'></span> Info",
							body: {
								borderless: true,
								rows: [
									RoleForm.ui
								]
							}
						},
						{
							id: ids.scopes,
							header: "<span class='webix_icon fa fa-street-view'></span> Scopes",
							body: RoleScope.ui
						},
						{
							id: ids.users,
							header: "<span class='webix_icon fa fa-users'></span> Users",
							body: RoleUser.ui
						}
					],
					tabbar: {
						on: {
							onAfterTabClick: (id) => {

								switch (id) {
									case RoleScope.ui.id:
										RoleScope.onShow();
										break;
									case RoleUser.ui.id:
										RoleUser.onShow();
										break;
								}

							}
						}
					}
				}
			]
		};



		// Our init() function for setting up our UI
		this.init = function () {

			RoleList.init(roleDC);
			RoleForm.init(roleDC);
			RoleScope.init(roleDC);
			RoleUser.init(roleDC);

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

				RoleList.applicationLoad(application);
				RoleForm.applicationLoad(application);
				RoleScope.applicationLoad(application);
				RoleUser.applicationLoad(application);

			},

			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();
				RoleList.show();

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