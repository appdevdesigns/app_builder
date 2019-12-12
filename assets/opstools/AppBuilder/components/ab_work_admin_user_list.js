const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_User_List extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_list');

		let L = this.Label;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),
			datatable: this.unique('datatable')
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
						{ view: "search" }
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

							if (this._userDC) {

								if (selection && selection.id)
									this._userDC.setCursor(selection.id);
								else
									this._userDC.setCursor(null);

							}
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

				this._userDC.parse([
					{
						"permission": [
							{
								"enabled": true,
								"id": 1,
								"createdAt": "2018-11-27T08:16:56.000Z",
								"updatedAt": "2018-11-27T09:06:28.000Z",
								"user": 1,
								"role": 1
							}
						],
						"guid": "admin",
						"username": "admin",
						"email": null,
						"isActive": 1,
						"lastLogin": "2019-12-11T07:52:03.000Z",
						"failedLogins": 0,
						"languageCode": "en",
						"ren_id": null,
						"sendEmailNotifications": null,
						"image_id": null,
						"id": 1,
						"createdAt": "2018-11-27T08:16:56.000Z",
						"updatedAt": "2019-12-11T07:52:03.000Z"
					},
					{
						"permission": [
							{
								"enabled": true,
								"id": 2,
								"createdAt": "2019-04-22T08:09:21.000Z",
								"updatedAt": "2019-12-11T07:46:39.000Z",
								"user": 2,
								"role": 2
							}
						],
						"guid": "cars",
						"username": "user",
						"email": "user@mail.com",
						"isActive": 1,
						"lastLogin": "2019-10-16T07:34:00.000Z",
						"failedLogins": 0,
						"languageCode": "en",
						"ren_id": null,
						"sendEmailNotifications": 1,
						"image_id": null,
						"id": 2,
						"createdAt": "2019-04-22T08:09:15.000Z",
						"updatedAt": "2019-12-11T07:44:34.000Z"
					}
				]);

				_logic.ready();

			},

			selectUser: () => {

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