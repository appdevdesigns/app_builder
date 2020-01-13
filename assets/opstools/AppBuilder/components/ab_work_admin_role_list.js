const ABComponent = require("../classes/platform/ABComponent");

const ABAdminRoleImport = require("./ab_work_admin_role_import");

module.exports = class AB_Work_Admin_Role_List extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_role_list');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				confirmDeleteTitle: L('ab.role.delete.title', "*Delete role"),
				confirmDeleteMessage: L('ab.role.delete.message', "*Do you want to remove this role ?")
			}
		};

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),
			datatable: this.unique('datatable'),
			search: this.unique('search')
		};

		let RoleImport = new ABAdminRoleImport(App);

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			type: "space",
			borderless: true,
			rows: [
				{
					view: "toolbar",
					id: "myToolbar",
					cols: [
						{
							view: "label",
							label: `&nbsp;&nbsp;<span class='fa fa-user-md'></span> ${L("ab.role.title", "*Roles")}`,
							align: "left"
						},
						{ fillspace: true },
						{
							id: ids.search,
							view: "search",
							on: {
								onChange: (searchText) => {

									_logic.filterRoles(searchText);

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
						{ id: "name", header: "Name", width: 200 },
						{ id: "description", header: "Description", fillspace: true },
						{
							id: "exclude", header: "", width: 40,
							template: (obj, common, value) => {
								return '<div class="exclude"><span class="webix_icon fa fa-reply"></span></div>';
							},
							css: { 'text-align': 'center' }
						},
						{
							id: "remove", header: "", width: 40,
							template: "<div class='remove'>{common.trashIcon()}</div>",
							css: { 'text-align': 'center' },
						}
					],
					data: [],
					on: {
						onAfterSelect: (selection, preserve) => {

							_logic.selectRole(selection ? selection.id : null);

						}
					},
					onClick: {
						"exclude": (event, data, target) => {
							_logic.exclude(data.row);
						},
						"remove": (event, data, target) => {
							_logic.remove(data.row);
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
							label: "Import role",
							click: () => {
								RoleImport.show();
							}
						},
						{
							view: 'button',
							type: "icon",
							icon: "fa fa-plus",
							label: "Create new role",
							click: () => {
								_logic.createNewRole();
							}
						}
					]
				}
			]
		};

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (roleDC) => {

			if ($$(ids.datatable))
				webix.extend($$(ids.datatable), webix.ProgressBar);

			this._roleDC = roleDC;
			if (this._roleDC) {

				// Bind to the data collection
				$$(ids.datatable).data.sync(this._roleDC);

				this._roleDC.attachEvent("onAfterCursorChange", roleId => {

					$$(ids.datatable).blockEvent();

					if (roleId)
						$$(ids.datatable).select(roleId);
					else
						$$(ids.datatable).unselect();

					$$(ids.datatable).unblockEvent();

				});

				RoleImport.init(this._roleDC);

			}
			else {
				$$(ids.datatable).data.unsync();
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
				RoleImport.applicationLoad(application);

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				_logic.loadRoleData();

				// Set select item of datatable
				if (this._roleDC) {
					let roleId = this._roleDC.getCursor();
					if (roleId)
						$$(ids.datatable).select(roleId);
					else
						$$(ids.datatable).unselect();
				}

			},

			loadRoleData: () => {

				if (this._isLoaded)
					return Promise.resolve();

				this._isLoaded = true;

				_logic.busy();

				CurrentApplication.roleLoad()
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// Parse to the data collection
						if (this._roleDC) {

							let roles = CurrentApplication.roles();

							this._roleDC.setCursor(null);
							this._roleDC.clearAll();
							this._roleDC.parse(roles || []);
						}

						_logic.ready();

					});

			},

			filterRoles: (searchText = "") => {

				if (!this._roleDC)
					return;

				searchText = searchText.toLowerCase();

				this._roleDC.setCursor(null);
				this._roleDC.filter(s => (s.name || "").toLowerCase().indexOf(searchText) > -1 || (s.description || "").toLowerCase().indexOf(searchText) > -1);

			},

			selectRole: (roleId) => {

				if (!this._roleDC)
					return;

				if (roleId)
					this._roleDC.setCursor(roleId);
				else
					this._roleDC.setCursor(null);

			},

			createNewRole: () => {

				if (!this._roleDC)
					return;

				this._roleDC.setCursor(null);

				// TODO : switch to role info tab and focus name textbox

			},

			exclude: (roleId) => {

				_logic.busy();

				CurrentApplication.roleExclude(roleId)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {
						this._roleDC.remove(roleId);
						_logic.ready();
					})

			},

			remove: (roleId) => {

				let role = this._roleDC.getItem(roleId);
				if (!role) return;

				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteTitle,
					message: labels.component.confirmDeleteMessage,
					callback: (isOK) => {

						if (isOK) {

							_logic.busy();

							CurrentApplication.roleDestroy(role)
								.catch(err => {
									console.error(err);
									_logic.ready();
								})
								.then(() => {
									this._roleDC.remove(roleId);
									_logic.ready();
								});

						}
					}
				});
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


		}
		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}
};