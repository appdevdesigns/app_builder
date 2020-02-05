const ABComponent = require("../classes/platform/ABComponent");

const ABAdminRoleList = require("./ab_admin_role_list");
const ABAdminRoleForm = require("./ab_admin_role_form");
const ABAdminRoleScope = require("./ab_admin_role_scope");
const ABAdminRoleUser = require("./ab_admin_role_user");

module.exports = class AB_Work_Admin_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_admin_role');

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
			info: this.unique('info'),
			tabview: this.unique('tabview')
		}



		// Our webix UI definition:
		let uiScope = RoleScope.ui;
		let uiUser = RoleUser.ui;
		this.ui = {
			id: ids.component,
			type: "space",
			cols: [
				RoleList.ui,
				{
					id: ids.tabview,
					view: "tabview",
					cells: [
						{
							header: "<span class='webix_icon fa fa-user-md'></span> Info",
							body: {
								id: ids.info,
								borderless: true,
								rows: [
									RoleForm.ui
								]
							}
						},
						{
							header: "<span class='webix_icon fa fa-street-view'></span> Scopes",
							body: uiScope
						},
						{
							header: "<span class='webix_icon fa fa-users'></span> Users",
							body: uiUser
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

				roleDC.setCursor(null);
				roleDC.clearAll();

				RoleList.applicationLoad(application);
				RoleForm.applicationLoad(application);
				RoleScope.applicationLoad(application);
				RoleUser.applicationLoad(application);

			},

			switchTab: function (name) {

				let tabview = $$(ids.tabview);
				let tabbar = tabview.getTabbar();

				switch (name) {
					case "info":
						tabbar.setValue(ids.info);
						RoleForm.focusName();
						break;
					case "scope":
						tabbar.setValue(uiScope.id);
						break;
					case "user":
						tabbar.setValue(uiUser.id);
						break;
				}

			},

			roleSave: (vals) => {

				let currRoleId = roleDC.getCursor();
				let currRole = roleDC.getItem(currRoleId);

				// Add new
				let isAdded = false;
				if (!currRole) {
					currRole = CurrentApplication.roleNew(vals);
					isAdded = true;
				}
				// Update
				else {
					for (let key in vals) {
						if (vals[key] != undefined)
							currRole[key] = vals[key];
					}
					isAdded = false;
				}

				return new Promise((resolve, reject) => {

					CurrentApplication.roleSave(currRole)
						.catch(reject)
						.then(data => {

							if (isAdded) {
								currRole.id = data.id;
								roleDC.setCursor(null);
								roleDC.add(currRole);
								roleDC.setCursor(currRole.id);
							}
							else
								roleDC.updateItem(currRoleId, data);

							resolve();
						});

				});

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

			roleSwitchTab: _logic.switchTab,
			roleSave: _logic.roleSave

		});



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}