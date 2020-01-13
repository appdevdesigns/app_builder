const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_User_Form_Info extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_form_info');

		let L = this.Label;

		let ids = {
			form: this.unique('form')
		};

		let ABUser = OP.Model.get('opstools.BuildApp.ABUser');
		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			rows: [
				{ template: `<span class='fa fa-user'></span> ${L("ab.admin.userInfo", "*User Info")}`, type: "header" },
				{
					id: ids.form,
					view: 'form',
					padding: 24,
					elementsConfig: { labelAlign: "right", labelWidth: 100 },
					rows: [
						{
							view: "text",
							name: "id",
							label: "ID",
							placeholder: "Enter ID"
						},
						{
							view: "text",
							name: "guid",
							label: "GUID",
							placeholder: "Enter GUID"
						},
						{
							view: "text",
							name: "username",
							label: "Username",
							placeholder: "Enter username"
						},
						{
							view: "text",
							name: "password",
							type: "password",
							label: "Password",
							placeholder: "Enter password"
						},
						{
							view: "text",
							name: "email",
							type: "email",
							label: "Email",
							placeholder: "Enter email"
						},
						{
							view: "checkbox",
							name: "isActive",
							label: "Is Active"
						},
						{
							view: "counter",
							type: "number",
							name: "failedLogins",
							label: "Failed logins"
						},
						{
							cols: [
								{ fillspace: true },
								{
									view: 'button',
									autowidth: true,
									value: L("ab.common.cancel", "*Cancel"),
									click: () => {

										_logic.cancel();

									}
								},
								{
									view: "button",
									type: "form",
									autowidth: true,
									value: L("ab.common.save", "*Save"),
									click: () => {

										_logic.save();

									}
								}
							]
						}

					]
				}
			]
		};

		// Our init() function for setting up our UI
		this.init = (userDC) => {

			this._userDC = userDC;

			if ($$(ids.form)) {
				webix.extend($$(ids.form), webix.ProgressBar);

				if (this._userDC) {
					this._userDC.attachEvent("onAfterCursorChange", (currId) => {

						let currUser = this._userDC.getItem(currId);
						if (currUser)
							$$(ids.form).setValues({
								id: currUser.id,
								guid: currUser.guid,
								username: currUser.username,
								password: currUser.password,
								email: currUser.email,
								isActive: currUser.isActive,
								failedLogins: currUser.failedLogins
							});
						else
							$$(ids.form).setValues({});
					});
				}
				// $$(ids.form).bind(this._userDC);

			}

		}

		// our internal business logic
		let _logic = {

			applicationLoad: (application) => {

				CurrentApplication = application;

			},

			cancel: () => {

				if (this._userDC)
					this._userDC.setCursor(null);

			},

			save: () => {

				if (!this._userDC)
					return;

				_logic.busy();

				let currUserId = this._userDC.getCursor();
				let vals = $$(ids.form).getValues();

				// clear 'null' value
				for (let key in vals) {
					if (vals[key] == null)
						delete vals[key];
				}

				if (!vals['password'])
					delete vals['password'];

				ABUser.update(currUserId, vals)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						this._userDC.updateItem(currUserId, data);

						_logic.ready();
					});

			},

			busy: () => {

				if ($$(ids.form) &&
					$$(ids.form).showProgress)
					$$(ids.form).showProgress({ type: "icon" });

			},

			ready: () => {

				if ($$(ids.form) &&
					$$(ids.form).hideProgress)
					$$(ids.form).hideProgress();

			},

		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;

	}

};