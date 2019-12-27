const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Scope_List extends ABComponent {

	constructor(App) {
		super(App, 'ab_work_admin_scope_list');

		let L = this.Label;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique('component'),
			datatable: this.unique('datatable'),
			search: this.unique('search')
		};

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
							label: `&nbsp;&nbsp;<span class='fa fa-street-view'></span> ${L("ab.scope.title", "*Scopes")}`,
							align: "left"
						},
						{ fillspace: true },
						{
							id: ids.search,
							view: "search",
							on: {
								onChange: (searchText) => {

									_logic.filterScopes(searchText);

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
						{ id: "description", header: "Description", fillspace: true }
					],
					data: [],
					on: {
						onAfterSelect: (selection, preserve) => {

							_logic.selectScope(selection ? selection.id : null);

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
								_logic.createNewScope();
							}
						}
					]
				}
			]
		};

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (scopeDC) => {

			if ($$(ids.datatable))
				webix.extend($$(ids.datatable), webix.ProgressBar);

			this._scopeDC = scopeDC;
			if (this._scopeDC) {

				// Bind to the data collection
				$$(ids.datatable).data.sync(this._scopeDC);

				this._scopeDC.attachEvent("onAfterCursorChange", scopeId => {

					$$(ids.datatable).blockEvent();

					if (scopeId)
						$$(ids.datatable).select(scopeId);
					else
						$$(ids.datatable).unselect();

					$$(ids.datatable).unblockEvent();

				});

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

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				_logic.loadScopeData();

				// Set select item of datatable
				if (this._scopeDC) {
					let cursor = this._scopeDC.getCursor();
					if (cursor)
						$$(ids.datatable).select(cursor.id);
					else
						$$(ids.datatable).unselect();
				}

			},

			loadScopeData: () => {

				if (this._isLoaded)
					return Promise.resolve();

				this._isLoaded = true;

				_logic.busy();

				CurrentApplication.scopeLoad()
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(() => {

						// Parse to the data collection
						if (this._scopeDC) {

							// Remove .application of scope list
							// NOTE: it will cause of variable recursive call
							let scopes = CurrentApplication.scopes().map(d => {
								delete d.application;
								return d;
							});

							this._scopeDC.setCursor(null);
							this._scopeDC.clearAll();
							this._scopeDC.parse(scopes || []);
						}

						_logic.ready();

					});

			},

			filterScopes: (searchText = "") => {

				if (!this._scopeDC)
					return;

				searchText = searchText.toLowerCase();

				this._scopeDC.setCursor(null);
				this._scopeDC.filter(s => (s.name || "").toLowerCase().indexOf(searchText) > -1 || (s.description || "").toLowerCase().indexOf(searchText) > -1);

			},

			selectScope: (scopeId) => {

				if (!this._scopeDC)
					return;

				if (scopeId)
					this._scopeDC.setCursor(scopeId);
				else
					this._scopeDC.setCursor(null);

			},

			createNewScope: () => {

				if (!this._scopeDC)
					return;

				this._scopeDC.setCursor(null);

				// TODO : switch to scope info tab and focus name textbox

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