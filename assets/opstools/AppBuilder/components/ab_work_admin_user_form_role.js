const ABComponent = require("../classes/platform/ABComponent");

const ABRoleAdd = require("./ab_work_admin_user_form_role_add");

module.exports = class AB_Work_Admin_User_Form_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_form_role');

		let L = this.Label;

		let ids = {
			datatable: this.unique('datatable')
		};

		let CurrentApplication;

		let RoleAdd = new ABRoleAdd(App);

		this._roleDC = new webix.DataCollection();

		// Our webix UI definition:
		this.ui = {
			rows: [
				{ template: `<span class='fa fa-user-md'></span> ${L("ab.admin.userRole", "*Roles")}`, type: "header" },
				{
					view: 'datatable',
					id: ids.datatable,
					select: false,
					data: [],
					columns: [
						{
							id: "role", header: "Role", width: 150,
							template: item => (item && item.role ? item.role.name : "")
						},
						{
							id: "scope", header: "Scope", fillspace: true,
							template: item => (item && item.scope ? item.scope.name : "")
						},
						// { id: "object", header: "Object", width: 150 },
						{
							id: "remove",
							header: "",
							template: "<div class='remove'>{common.trashIcon()}</div>",
							css: { 'text-align': 'center' },
							width: 40
						}
					],
					onClick: {
						"remove": function (ev, id) {
							_logic.remove(id);
							return false;
						}
					}
				},
				{
					cols: [
						{ fillspace: true },
						{
							view: 'button',
							type: "icon",
							icon: "fa fa-plus",
							label: "Add a role",
							width: 150,
							click: () => {
								RoleAdd.show();
							}
						}
					]
				}
			]
		};


		// Our init() function for setting up our UI
		this.init = (userDC) => {

			this._userDC = userDC;

			if ($$(ids.datatable)) {
				webix.extend($$(ids.datatable), webix.ProgressBar);

				$$(ids.datatable).data.sync(this._roleDC);
			}

			RoleAdd.init(this._userDC, this._roleDC);

		};


		// our internal business logic
		let _logic = {

			applicationLoad: (application) => {

				CurrentApplication = application;
				RoleAdd.applicationLoad(application);

			},

			show: () => {

				_logic.busy();

				if (!this._userDC) {
					_logic.ready();
					return;
				}

				let currUserId = this._userDC.getCursor();
				let currUser = this._userDC.getItem(currUserId);
				if (!currUser) {
					_logic.ready();
					return;
				}

				CurrentApplication.roleScopeOfUser(currUser.username)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(roleScopes => {

						roleScopes = roleScopes || [];

						this._roleDC.clearAll();
						this._roleDC.parse(roleScopes);
						_logic.ready();

					});

			},

			remove: (rowId) => {

				OP.Dialog.Confirm({
					title: L('ab.role.removeTitle', '*Remove this role'),
					message: L('ab.role.removeDescription', '*Do you want to remove this role from user?'),
					callback: (result) => {

						if (!result)
							return;

						_logic.busy();

						let roleScope = this._roleDC.find(s => s.id == rowId)[0];
						if (!roleScope)
							return _logic.ready();

						let scopeId = roleScope.scope ? roleScope.scope.id : "";
						let userId = this._userDC.getCursor();
						let user = this._userDC.getItem(userId);

						if (!scopeId || !user)
							return _logic.ready();

						CurrentApplication.scopeRemoveUser(scopeId, user.username)
							.catch(err => {
								console.error(err);
								_logic.ready();
							})
							.then(() => {

								this._roleDC.remove(rowId);

								_logic.ready();

							});

					}
				})


			},

			busy: () => {

				if ($$(ids.datatable) &&
					$$(ids.datatable).showProgress)
					$$(ids.datatable).showProgress({ type: "icon" });

			},

			ready: () => {

				if ($$(ids.datatable) &&
					$$(ids.datatable).hideProgress)
					$$(ids.datatable).hideProgress();

			},

		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}
};