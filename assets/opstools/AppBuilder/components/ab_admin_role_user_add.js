const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_User_Add extends ABComponent {
	constructor(App) {
		super(App, 'ab_admin_role_user_add');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				selectUser: L('ab.role.addUser.title', "*Select a user"),
				selectScope: L('ab.role.addScope.title', "*Select a scope")
			}
		};

		let ids = {
			popup: this.unique('popup'),
			list: this.unique('list'),
			buttonSave: this.unique('buttonSave')
		};

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (roleDC, userDC) => {

			this._roleDC = roleDC;
			this._userDC = userDC;

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

			getRole: () => {

				if (!this._roleDC)
					return null;

				let roldId = this._roleDC.getCursor();
				if (!roldId)
					return null;

				return this._roleDC.getItem(roldId);

			},

			show: () => {

				$$(ids.popup).getHead().define("template", labels.component.selectUser);
				$$(ids.popup).getHead().refresh();
				$$(ids.popup).show();

				_logic.busy();

				$$(ids.list).clearAll();
				$$(ids.buttonSave).disable();

				let role = _logic.getRole();

				Promise.resolve()
					.then(() => new Promise((next, err) => {

						if (role._scopes != null &&
							role._scopes.length > 0)
							return next();

						role.scopeLoad()
							.catch(err)
							.then(scopes => {

								role._scopes = scopes;

								next();
							})

					}))
					.then(() => new Promise((next, err) => {

						// Convert data to display in list
						let users = OP.User.userlist();

						let listData = [];
						users.forEach(u => {

							if (this._userDC.find({ username: u.username })[0])
								return;

							let userData = {
								id: u.username,
								name: u.username,
								data: [],
								type: 'user'
							};

							(role.scopes() || []).forEach(s => {

								userData.data.push({
									scopeId: s.id,
									name: s.name,
									username: u.username,
									type: 'scope'
								})
							});

							listData.push(userData);

						});

						$$(ids.list).parse(listData || []);

						_logic.ready();
						$$(ids.buttonSave).disable();

					}));

			},

			template: (item) => {

				if (item.type == 'user') {
					return `<span class='fa fa-user'></span> ${item.name}`;
				}
				else if (item.type == 'scope') {
					return `<span class='fa fa fa-street-view'></span> ${item.name}`;
				}
				else {
					return "N/A";
				}

			},

			select: (itemId) => {

				let selectedItem = $$(ids.list).getItem(itemId);
				if (!selectedItem) return;

				if (selectedItem.type == 'scope') {
					$$(ids.buttonSave).enable();
				}
				else if (selectedItem.type == 'user') {
					$$(ids.popup).getHead().define("template", labels.component.selectScope);
					$$(ids.popup).getHead().refresh();
					$$(ids.buttonSave).disable();
				}

			},

			save: () => {

				_logic.busy();

				let role = _logic.getRole();
				if (!role)
					return _logic.ready();

				let selectedItem = $$(ids.list).getSelectedItem();
				if (!selectedItem)
					return _logic.ready();

				role.userAdd(selectedItem.scopeId, selectedItem.username)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// update user list of role
						let scope = role.scopes(s => s.id == selectedItem.scopeId)[0];
						if (scope) {
							this._userDC.add({
								username: selectedItem.username,
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

			}

		};


		// Our webix UI definition:
		this.ui = {
			id: ids.popup,
			view: "window",
			head: labels.component.selectUser,
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

}