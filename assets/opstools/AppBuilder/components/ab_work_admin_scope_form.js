const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Scope_Form extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope_form');

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
		this.init = (scopeDC) => {

			this._scopeDC = scopeDC;

			if ($$(ids.form)) {
				webix.extend($$(ids.form), webix.ProgressBar);

				if (this._scopeDC)
					$$(ids.form).bind(this._scopeDC);

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

				if (this._scopeDC)
					this._scopeDC.setCursor(null);

			},

			save: () => {

				if (!this._scopeDC)
					return;

				_logic.busy();

				let vals = $$(ids.form).getValues();

				let currScopeId = this._scopeDC.getCursor();
				let currScope = this._scopeDC.getItem(currScopeId);

				// Add new
				let isAdded = false;
				if (!currScope) {
					currScope = CurrentApplication.scopeNew(vals);
					isAdded = true;
				}
				else {
					currScope.fromValues(vals);
					isAdded = false;
				}

				CurrentApplication.scopeSave(currScope)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						if (isAdded) {
							currScope.id = data.id;
							this._scopeDC.add(currScope);
							this._scopeDC.setCursor(currScope.id);
						}
						else
							this._scopeDC.updateItem(currScopeId, data);

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