const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_User_Form_Info extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_user_form_info');

		let L = this.Label;

		let ids = {
			form: this.unique('form')
		};

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

				if (this._userDC)
					$$(ids.form).bind(this._userDC);

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

				_logic.busy();

				let vals = $$(ids.form).getValues();

				// TODO
				if (this._userDC) {

					this._userDC.updateItem(vals.id, vals);

				}

				_logic.ready();

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