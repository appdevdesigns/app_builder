const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_User extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_role_user');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				confirmRemoveUserTitle: L('ab.role.remove.user.title', "*Remove an user"),
				confirmRemoveUserMessage: L('ab.role.remove.user.message', "*Do you want to remove this user from the role ?")
			}
		};

		const ABUser = OP.Model.get('opstools.BuildApp.ABUser');

		this._userDC = new webix.DataCollection();

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			datatable: this.unique('datatable')
		};

		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			id: ids.datatable,
			view: 'datatable',
			columns: [
				{
					id: "status",
					header: "",
					width: 30,
					template: function (usr) {
						return "<div class='fa fa-user'></div>";
						// if (usr && (usr.permission || []).length == 0) {
						// 	return "<div class='fa fa-user' style='opacity: 0.45; color: gray;'></div>";
						// } else {
						// 	return "<div class='fa fa-user'></div>";
						// }
					},
					css: { "text-align": "center" }
				},
				{ id: "username", header: "Username", fillspace: true },
				{
					id: "remove", header: "", width: 40,
					template: "<div class='remove'>{common.trashIcon()}</div>",
					css: { 'text-align': 'center' },
				}
			],
			onClick: {
				"remove": (event, data, target) => {
					_logic.removeUser(data.row);
				}
			}
		};

		// Our init() function for setting up our UI
		this.init = (roleDC) => {

			this._roleDC = roleDC;
			if (this._roleDC) {
				this._roleDC.attachEvent("onAfterCursorChange", roleId => {
					_logic.onShow();
				});
			}

			if ($$(ids.datatable))
				webix.extend($$(ids.datatable), webix.ProgressBar);

			$$(ids.datatable).data.sync(this._userDC);

		}

		let _logic = {

			applicationLoad: (application) => {
				CurrentApplication = application;
			},

			getRole: () => {

				if (this._roleDC == null)
					return;

				let roleId = this._roleDC.getCursor();
				if (!roleId) return;

				let role = this._roleDC.getItem(roleId);
				return role;

			},

			onShow: () => {

				this._userDC.clearAll();

				let role = _logic.getRole();
				if (!role) return;

				// Parse to the data collection
				if (this._userDC)
					this._userDC.parse((role.usernames || []).map(u => {
						return {
							id: u,
							username: u
						};
					}));

			},

			removeUser: (username) => {

				let role = _logic.getRole();
				if (!role) return;

				OP.Dialog.Confirm({
					title: labels.component.confirmRemoveUserTitle,
					message: labels.component.confirmRemoveUserMessage,
					callback: (isOK) => {

						if (isOK) {

							_logic.busy();

							role.usernames = (role.usernames || []).filter(u => u != username);

							CurrentApplication.roleSave(role)
								.catch(err => {
									console.error(err);
									_logic.ready();
								})
								.then(() => {

									$$(ids.list).unselect();

									this._userDC.remove(username);

									_logic.ready();
								});

						}
					}
				});

			},

			ready: () => {

				if ($$(ids.datatable) &&
					$$(ids.datatable).hideProgress)
					$$(ids.datatable).hideProgress();

			},

			busy: () => {

				if ($$(ids.datatable) &&
					$$(ids.datatable).showProgress)
					$$(ids.datatable).showProgress({ type: "icon" });

			},

		};

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.onShow = _logic.onShow;
	}

};