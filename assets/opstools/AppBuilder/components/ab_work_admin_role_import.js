const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_Import extends ABComponent {

	constructor(App) {

		let idBase = 'ab_work_admin_role_import';

		super(App, idBase);

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				importRole: L('ab.role.import.title', "*Import exists role")
			}
		};


		let CurrentApplication;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			popup: this.unique('popup'),
			filter: this.unique('filter'),
			list: this.unique('list'),
			buttonImport: this.unique('buttonImport')
		};

		// Our webix UI definition:
		this.ui = {
			id: ids.popup,
			view: "window",
			head: labels.component.importRole,
			hidden: true,
			modal: true,
			position: "center",
			height: 500,
			width: 350,
			body: {
				borderless: true,
				rows: [
					// Filter
					{
						cols: [
							{ view: 'icon', icon: 'fa fa-filter', align: 'left' },
							{
								view: 'text',
								id: ids.filter,
								on: {
									onTimedKeyPress: () => {
										_logic.filter();
									}
								}
							}
						]
					},

					// List
					{
						id: ids.list,
						view: 'list',
						data: [],
						borderless: true,
						select: true,
						template: "#name#"
					},

					// Import & Cancel buttons
					{
						margin: 5,
						cols: [
							{ fillspace: true },
							{
								view: "button",
								value: labels.common.cancel,
								css: "ab-cancel-button",
								autowidth: true,
								click: () => {
									_logic.cancel();
								}
							},
							{
								view: "button",
								id: ids.buttonImport,
								value: labels.common.import,
								autowidth: true,
								type: "form",
								click: () => {
									_logic.save();
								}
							}
						]
					}
				]
			}
		};

		// Our init() function for setting up our UI
		this.init = function (roleDC) {

			this._roleDC = roleDC;

			webix.ui(this.ui);

			if ($$(ids.list))
				webix.extend($$(ids.list), webix.ProgressBar);

		}

		let _logic = {

			applicationLoad: function (application) {

				CurrentApplication = application;

			},

			show: () => {

				if ($$(ids.popup)) {
					$$(ids.popup).show();

					$$(ids.list).clearAll();

					_logic.busy();

					CurrentApplication.roleFind()
						.catch(err => {
							console.error(err);
							_logic.ready();
						})
						.then(roles => {

							roles = (roles || []).filter(otherRole => CurrentApplication.roles(r => r.id == otherRole.id).length < 1);

							// refresh role list
							$$(ids.list).parse(roles);

							_logic.ready();

						});

				}


			},

			filter: () => {
				let filterText = $$(ids.filter).getValue();
				$$(ids.list).filter('#name#', filterText);
			},

			busy: () => {

				if ($$(ids.list) &&
					$$(ids.list).showProgress)
					$$(ids.list).showProgress({ type: "icon" });

				$$(ids.buttonImport).disable();

			},

			ready: () => {

				if ($$(ids.list) &&
					$$(ids.list).hideProgress)
					$$(ids.list).hideProgress();

				$$(ids.buttonImport).enable();

			},

			hide: () => {

				if ($$(ids.popup))
					$$(ids.popup).hide();
			},

			cancel: () => {

				_logic.hide();

			},

			save: () => {

				let roleId = $$(ids.list).getSelectedId();
				if (!roleId) return;

				_logic.busy();

				CurrentApplication.roleImport(roleId)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// update list
						if (this._roleDC) {
							let importedRole = $$(ids.list).getSelectedItem();
							this._roleDC.add(importedRole);
						}

						_logic.ready();
						_logic.hide();

					})


			}

		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;
	}

};