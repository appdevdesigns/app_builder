const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_User_Form_Role_Add extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_form_role_add');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				selectRole: L('ab.user.addRole.title', "*Select a role"),
				selectScope: L('ab.user.addRole.title', "*Select a scope")
			}
		};

		let ids = {
			popup: this.unique('popup'),
			list: this.unique('list'),
			buttonSave: this.unique('buttonSave')
		};

		let CurrentApplication;


		// Our init() function for setting up our UI
		this.init = (userDC, roleDC) => {

			this._userDC = userDC;
			this._roleDC = roleDC;

			webix.ui(this.ui);

			if ($$(ids.list)) {
				webix.extend($$(ids.list), webix.ProgressBar);
			}

		};


		// our internal business logic
		let _logic = {

			applicationLoad: (application) => {

				CurrentApplication = application;

			},

			template: (item) => {

				if (item.type == 'role') {
					return `<span class='fa fa-user-md'></span> ${item.name}`;
				}
				else if (item.type == 'scope') {
					return `<span class='fa fa fa-street-view'></span> ${item.name}`;
				}
				else {
					return "N/A";
				}

			},

			show: () => {

				$$(ids.popup).getHead().define("template", labels.component.selectRole);
				$$(ids.popup).getHead().refresh();
				$$(ids.popup).show();

				_logic.busy();

				$$(ids.list).clearAll();
				$$(ids.buttonSave).disable();

				let currUserId = this._userDC.getCursor();
				let currUser = this._userDC.getItem(currUserId);
				if (!currUser) {
					_logic.ready();
					return;
				}


				CurrentApplication.roleLoad()
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// remove included roles
						let includedRoleIds = this._roleDC.find({}).map(d => d.role ? d.role.id : "").filter(rId => rId);
						let includedScopeIds = this._roleDC.find({}).map(d => d.scope ? d.scope.id : "").filter(sId => sId);
						let roles = (CurrentApplication.roles() || []).filter(r => includedRoleIds.indexOf(r.id) < 1);

						// pull scopes
						let tasks = [];
						roles.forEach(r => {

							if (r._scopes.length < 1) {
								tasks.push(new Promise((next, err) => {

									CurrentApplication.scopeOfRole(r.id)
										.catch(err)
										.then(scopes => {
											r._scopes = scopes || [];
											next();
										});

								}));
							}

						});

						Promise.all(tasks)
							.then(() => {

								// Convert data to display in list
								let listData = [];
								roles.forEach(r => {

									let roleData = {
										id: r.id,
										name: r.name,
										data: [],
										type: 'role'
									};

									r.scopes().forEach(s => {

										if (includedScopeIds.indexOf(s.id) > -1)
											return;

										roleData.data.push({
											id: s.id,
											name: s.name,
											roleId: r.id,
											type: 'scope'
										})
									});

									listData.push(roleData);

								});

								$$(ids.list).parse(listData || []);

								_logic.ready();
								$$(ids.buttonSave).disable();

							});


					});

			},

			select: (itemId) => {

				let selectedItem = $$(ids.list).getItem(itemId);
				if (!selectedItem) return;

				if (selectedItem.type == 'scope') {
					$$(ids.buttonSave).enable();
				}
				else if (selectedItem.type == 'role') {
					$$(ids.popup).getHead().define("template", labels.component.selectScope);
					$$(ids.popup).getHead().refresh();
					$$(ids.buttonSave).disable();
				}

			},

			save: () => {

				_logic.busy();

				let userId = this._userDC.getCursor();
				let user = this._userDC.getItem(userId);
				if (!user)
					return _logic.ready();

				let selectedScope = $$(ids.list).getSelectedItem();
				if (!selectedScope)
					return _logic.ready();

				CurrentApplication.scopeAddUser(selectedScope.roleId, selectedScope.id, user.username)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// update role list of user
						let role = CurrentApplication.roles(r => r.id == selectedScope.roleId)[0];
						let scope = role.scopes(s => s.id == selectedScope.id)[0];
						if (role && scope) {
							this._roleDC.add({
								role: role,
								scope: scope
							});
						}

						_logic.ready();
						$$(ids.popup).hide();
					});

			},

			cancel: () => {

				$$(ids.popup).hide();

			},

			busy: () => {

				if ($$(ids.list) &&
					$$(ids.list).showProgress)
					$$(ids.list).showProgress({ type: "icon" });

				$$(ids.buttonSave).disable();

			},

			ready: () => {

				if ($$(ids.list) &&
					$$(ids.list).hideProgress)
					$$(ids.list).hideProgress();

				$$(ids.buttonSave).enable();

			},

		};

		// Our webix UI definition:
		this.ui = {
			id: ids.popup,
			view: "window",
			head: labels.component.selectRole,
			hidden: true,
			modal: true,
			position: "center",
			height: 450,
			width: 400,
			body: {
				borderless: true,
				rows: [
					{
						id: ids.list,
						view: 'grouplist',
						data: [],
						borderless: true,
						select: true,
						templateBack: _logic.template,
						template: _logic.template,
						on: {
							onItemClick: (item) => {
								_logic.select(item);
							}
						}
					},

					// Import & Cancel buttons
					{
						type: "space",
						margin: 5,
						cols: [
							{ fillspace: true },
							{
								view: "button",
								value: labels.common.cancel,
								css: "ab-cancel-button",
								autowidth: true,
								click: () => {
									_logic.cancel();
								}
							},
							{
								view: "button",
								id: ids.buttonSave,
								value: labels.common.save,
								autowidth: true,
								type: "form",
								click: () => {
									_logic.save();
								}
							}
						]
					}
				]
			}
		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}
};