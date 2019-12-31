const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_Form extends ABComponent {

	constructor(App) {

		let idBase = 'ab_work_admin_role_form';

		super(App, idBase);

		let L = this.Label;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			form: this.unique('form')
		};

		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			id: ids.form,
			view: 'form',
			// padding: 24,
			elementsConfig: { labelAlign: "right", labelWidth: 100 },
			rows: [
				{
					view: "text",
					name: "name",
					label: "Name",
					placeholder: "Enter Name"
				},
				{
					view: "text",
					name: "description",
					label: "Description",
					placeholder: "Enter Description"
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
				},
				{
					fillspace: true
				}
			]
		};

		// Our init() function for setting up our UI
		this.init = (roleDC) => {

			this._roleDC = roleDC;

			if ($$(ids.form)) {
				webix.extend($$(ids.form), webix.ProgressBar);

				if (this._roleDC)
					$$(ids.form).bind(this._roleDC);

			}

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

			cancel: () => {

				if (this._roleDC)
					this._roleDC.setCursor(null);

			},

			save: () => {

				if (!this._roleDC)
					return;

				_logic.busy();

				let vals = $$(ids.form).getValues() || {};

				let currRoleId = this._roleDC.getCursor();
				let currRole = this._roleDC.getItem(currRoleId);

				// Add new
				let isAdded = false;
				if (!currRole) {
					currRole = CurrentApplication.roleNew(vals);
					isAdded = true;
				}
				// Update
				else {
					for (let key in vals) {
						if (vals[key] != undefined)
							currRole[key] = vals[key];
					}
					isAdded = false;
				}

				CurrentApplication.roleSave(currRole)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						if (isAdded) {
							currRole.id = data.id;
							this._roleDC.setCursor(null);
							this._roleDC.add(currRole);
							this._roleDC.setCursor(currRole.id);
						}
						else
							this._roleDC.updateItem(currRoleId, data);

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

		}

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;

	}

};