const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_Scope_Import extends ABComponent {

	constructor(App) {

		let idBase = 'ab_work_admin_role_scope_import';

		super(App, idBase);

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				scopeRole: L('ab.scope.import.title', "*Import exists scope")
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
			head: labels.component.scopeRole,
			hidden: true,
			modal: true,
			position: "center",
			height: 400,
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
						template: "#name# - <span class='fa fa-database'></span> Object"
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
		this.init = function (roleDC, scopeDC) {

			this._roleDC = roleDC;
			this._scopeDC = scopeDC;

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

					CurrentApplication.scopeFind({
						isGlobal: true
					})
						.catch(err => {
							console.error(err);
							_logic.ready();
						})
						.then(scopes => {

							let includedScopes = this._scopeDC.find({});

							scopes = (scopes || []).filter(otherScope => includedScopes.filter(s => s.id == otherScope.id).length < 1);

							// refresh role list
							$$(ids.list).parse(scopes);

							_logic.ready();

						});

				}

			},

			getRole: () => {

				if (!this._roleDC)
					return null;

				let roleId = this._roleDC.getCursor();

				return this._roleDC.getItem(roleId);

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

				let importedScope = $$(ids.list).getSelectedItem();
				if (!importedScope) return;

				_logic.busy();

				let role = _logic.getRole();

				CurrentApplication.scopeImport(importedScope, role)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// update list
						if (this._scopeDC) {
							this._scopeDC.add(importedScope);
						}

						_logic.ready();
						_logic.hide();

					});

			}

		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;
	}

};