const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_User_List extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_list');

		let L = this.Label;

		let ABUser = OP.Model.get('opstools.BuildApp.ABUser');

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),
			datatable: this.unique('datatable'),
			search: this.unique('search')
		};

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			rows: [
				{
					view: "toolbar",
					id: "myToolbar",
					cols: [
						{
							view: "label",
							label: `&nbsp;&nbsp;<span class='fa fa-users'></span> ${L("ab.user.title", "*Users")}`,
							align: "left"
						},
						{ fillspace: true },
						{
							id: ids.search,
							view: "search",
							on: {
								onChange: (searchText) => {

									this._isLoaded = false;
									_logic.loadUserData();

								}
							}
						}
					]
				},
				{
					id: ids.datatable,
					view: "datatable",
					select: "row",
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
						{
							id: "isActive", header: "Is active", width: 100,
							template: function (obj) {
								if (obj.isActive) {
									return '<span class="glyphicon glyphicon-ok"></span>';
								} else {
									return '<span class="glyphicon glyphicon-ban-circle"></span>';
								}
							},
							css: { 'text-align': 'center' }
						},
						{ id: "email", header: "Email", fillspace: true }
					],
					data: [],
					on: {
						onAfterSelect: (selection, preserve) => {

							_logic.selectUser(selection ? selection.id : null);

						}
					}
				}
			]
		};

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (userDC) => {

			this._userDC = userDC;

			if ($$(ids.component))
				webix.extend($$(ids.component), webix.ProgressBar);

			// Bind to the data collection
			$$(ids.datatable).data.sync(userDC);

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

				CurrentApplication = application;

				this._isLoaded = false;

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				_logic.loadUserData();

				// Set select item of datatable
				if (this._userDC) {
					let cursor = this._userDC.getCursor();
					if (cursor)
						$$(ids.datatable).select(cursor.id);
					else
						$$(ids.datatable).unselect();
				}

			},

			loadUserData: () => {

				if (this._isLoaded)
					return Promise.resolve();

				this._isLoaded = true;

				_logic.busy();

				let cond = {};

				// Search filter
				let searchText = $$(ids.search).getValue();
				if (searchText) {
					cond.where = {
						or: [
							{ username: { contains: searchText } },
							{ email: { contains: searchText } }
						]
					};
				}

				ABUser.findAll(cond)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						// Parse to the data collection
						if (this._userDC)
							this._userDC.parse(data || []);

						_logic.ready();

					});

			},

			selectUser: (userId) => {

				if (!this._userDC)
					return;

				if (userId)
					this._userDC.setCursor(userId);
				else
					this._userDC.setCursor(null);

			},

			busy: () => {

				if ($$(ids.component) &&
					$$(ids.component).showProgress)
					$$(ids.component).showProgress({ type: "icon" });

			},

			ready: () => {

				if ($$(ids.component) &&
					$$(ids.component).hideProgress)
					$$(ids.component).hideProgress();

			},


		}
		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}
};