const ABComponent = require("../classes/platform/ABComponent");

const ABScopeForm = require("./ab_work_admin_role_scope_form");

module.exports = class AB_Work_Admin_Role_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_role_scope');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {

				confirmDeleteScopeTitle: L('ab.scope.deleteRow.title', "*Remove this scope"),
				confirmDeleteScopeMessage: L('ab.scope.deleteRow.message', "*Do you want to remove this scope ?"),

			}
		};

		let ScopeForm = new ABScopeForm(App);

		this._scopeDC = new webix.DataCollection();

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			datatable: this.unique('datatable')
		};

		let CurrentApplication;

		// Our webix UI definition:
		this.ui = {
			view: 'layout',
			rows: [
				{
					id: ids.datatable,
					view: 'datatable',
					columns: [
						{
							id: "name",
							header: "Scope",
							fillspace: true
						},
						{
							id: "object",
							header: "Object",
							width: 300
						},
						{
							id: "trash",
							header: "",
							template: "<div class='trash'>{common.trashIcon()}</div>",
							css: { 'text-align': 'center' },
							width: 40
						}
					],
					onClick: {
						"remove": (event, data, target) => {
							_logic.removeScope(data.row);
						}
					}
				},
				{
					cols: [
						{ fillspace: true },
						{
							view: 'button',
							type: "icon",
							icon: "fa fa-download",
							label: "Import scope",
							click: () => {

							}
						},
						{
							view: 'button',
							type: "icon",
							icon: "fa fa-plus",
							label: "Create new scope",
							click: () => {
								ScopeForm.show();
							}
						}
					]
				}
			]
		};

		// Our init() function for setting up our UI
		this.init = (roleDC) => {

			if ($$(ids.datatable)) {
				$$(ids.datatable).data.sync(this._scopeDC);

				webix.extend($$(ids.datatable), webix.ProgressBar);
			}

			this._roleDC = roleDC;
			if (this._roleDC) {
				this._roleDC.attachEvent("onAfterCursorChange", roleId => {
					_logic.onShow();
				});
			}

			ScopeForm.init(this._roleDC, this._scopeDC);

		};

		let _logic = {

			applicationLoad: (application) => {
				CurrentApplication = application;
				ScopeForm.applicationLoad(application);
			},

			busy: () => {

				if ($$(ids.datatable) &&
					$$(ids.datatable).showProgress)
					$$(ids.datatable).showProgress({ type: "icon" });

			},

			ready: () => {

				if ($$(ids.datatable) &&
					$$(ids.datatable).hideProgress)
					$$(ids.datatable).hideProgress();

			},

			removeScope: (scopeId) => {

				let DataTable = $$(ids.datatable);

				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteScopeTitle,
					text: labels.component.confirmDeleteScopeMessage,
					callback: (isOK) => {

						if (isOK) {
							// CurrentObject.model()
							// 	.delete(id.row)
							// 	.then((response) => {

							// 		if (response.numRows > 0) {
							// 			DataTable.remove(id);
							// 			DataTable.clearSelection();
							// 		} else {

							// 			OP.Dialog.Alert({
							// 				text: 'No rows were effected.  This does not seem right.'
							// 			})

							// 		}
							// 	})
							// 	.catch((err) => {

							// 		OP.Error.log('Error deleting item:', { error: err });

							// 		//// TODO: what do we do here?	
							// 	});
						}

						DataTable.clearSelection();
						return true;
					}
				});

			},

			onShow: () => {

				this._scopeDC.clearAll();

				if (this._roleDC == null)
					return;

				let roleId = this._roleDC.getCursor();
				if (!roleId) return;

				_logic.busy();

				CurrentApplication.scopeOfRole(roleId)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(scopes => {

						this._scopeDC.parse(scopes || []);

						_logic.ready();
					})

			}

		};

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.onShow = _logic.onShow;

	}

};