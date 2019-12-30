const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_User extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_role_user');

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
			]
		};

		// Our init() function for setting up our UI
		this.init = (roleDC) => {

			this._roleDC = roleDC;

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

						_logic.ready();

						this._isLoaded = true;

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