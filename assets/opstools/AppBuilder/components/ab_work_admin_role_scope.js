const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_Role extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_role_role');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {

				confirmDeleteRoleTitle: L('ab.role.deleteRow.title', "*Remove role"),
				confirmDeleteRoleMessage: L('ab.role.deleteRow.message', "*Do you want to remove this role ?"),

			}
		};

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
							header: "Role",
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
					on: {
						onItemClick: (roleId, e, node) => {

							if (e.target.className.indexOf('trash') > -1) {
								_logic.removeRole(roleId);
							}

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
							}
						}
					]
				}
			]
		};

		// Our init() function for setting up our UI
		this.init = (roleDC) => {
		};

		let _logic = {

			applicationLoad: (application) => {
				CurrentApplication = application;
			},

			removeRole: (roleId) => {

				let DataTable = $$(ids.datatable);

				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteRoleTitle,
					text: labels.component.confirmDeleteRoleMessage,
					callback: (result) => {

						if (result) {
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