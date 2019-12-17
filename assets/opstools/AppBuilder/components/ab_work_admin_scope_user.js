const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Scope_User extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope_user');

		let L = this.Label;

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
					id: "_include",
					header: "",
					template: "{common.checkbox()}",
					width: 30
				},
				{
					id: "status",
					header: "",
					width: 30,
					template: function (usr) {
						if (usr && (usr.permission || []).length == 0) {
							return "<div class='fa fa-user' style='opacity: 0.45; color: gray;'></div>";
						} else {
							return "<div class='fa fa-user'></div>";
						}
					},
					css: { "text-align": "center" }
				},
				{ id: "username", header: "Username", width: 200 },
				{ id: "email", header: "Email", fillspace: true }
			],
			on: {
				onCheck: (userId, colId, state) => {
					_logic.checkUser(userId, state);
				}
			}
		};

		// Our init() function for setting up our UI
		this.init = (scopeDC) => {

			this._scopeDC = scopeDC;
			if (this._scopeDC) {
				this._scopeDC.attachEvent("onAfterCursorChange", () => {
					_logic.refreshCheckbox();
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

			onShow: () => {

				if (this._isLoaded) {
					_logic.refreshCheckbox();
					return;
				}

				ABUser.findAll()
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						// Parse to the data collection
						if (this._userDC)
							this._userDC.parse(data || []);

						_logic.refreshCheckbox();
						_logic.ready();

						this._isLoaded = true;

					});

			},

			refreshCheckbox: () => {

				let usernames = [];

				// Pull usernames of the scope
				if (this._scopeDC) {
					let currScopeId = this._scopeDC.getCursor();
					let currScope = this._scopeDC.getItem(currScopeId);
					if (currScope) {
						usernames = currScope.usernames || [];
					}
				}

				// Set checkbox of users
				if (this._userDC) {
					this._userDC.find({}).forEach(u => {

						u._include = (usernames.indexOf(u.username) > -1);

						this._userDC.updateItem(u.id, u);

					});
				}

			},

			checkUser: (userId, isChecked) => {

				if (!this._userDC || !this._scopeDC)
					return;

				_logic.busy();

				let currScopeId = this._scopeDC.getCursor();
				let currScope = this._scopeDC.getItem(currScopeId);
				if (!currScope) {
					_logic.ready();
					return;
				}

				// Pull an user
				let user = this._userDC.find({ id: userId })[0];
				if (!user) {
					_logic.ready();
					return;
				}

				if (currScope.usernames.indexOf(user.username) < 0)
					currScope.usernames.push(user.username);

				CurrentApplication.scopeSave(currScope)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {
						_logic.ready();
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