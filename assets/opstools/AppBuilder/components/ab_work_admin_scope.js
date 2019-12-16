const ABComponent = require("../classes/platform/ABComponent");

const ABAdminScopeList = require("./ab_work_admin_scope_list");
const ABAdminScopeForm = require("./ab_work_admin_scope_form");
const ABAdminScopeUser = require("./ab_work_admin_scope_user");

module.exports = class AB_Work_Admin_Scope extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope');

		let L = this.Label;

		let labels = {

			common: App.labels,
			component: {
				// formHeader: L('ab.application.form.header', "*Application Info"),
			}
		}

		let CurrentApplication;
		let ScopeList = new ABAdminScopeList(App);
		let ScopeForm = new ABAdminScopeForm(App);
		let ScopeUser = new ABAdminScopeUser(App);

		let scopeDC = new webix.DataCollection();

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),

		}



		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			cols: [
				ScopeList.ui,
				{
					view: "tabview",
					cells: [
						{
							header: "Info",
							body: ScopeForm.ui
						},
						{
							header: "Users",
							body: ScopeUser.ui
						}
					]
				}
			]
		};



		// Our init() function for setting up our UI
		this.init = function () {

			ScopeList.init(scopeDC);
			ScopeForm.init(scopeDC);
			ScopeUser.init(scopeDC);

		}


		// our internal business logic
		var _logic = {

			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application 
			 */
			applicationLoad: function (application) {

				CurrentApplication = application;

				ScopeList.applicationLoad(application);
				ScopeForm.applicationLoad(application);

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				ScopeList.show();

			}

		}
		this._logic = _logic;


		this.actions({

		});



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}