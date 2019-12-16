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

									this._isLoaded = false;
									_logic.loadScopeData();

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
				}
			]
		};

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (scopeDC) => {

			this._scopeDC = scopeDC;

			if ($$(ids.datatable))
				webix.extend($$(ids.datatable), webix.ProgressBar);

			// Bind to the data collection
			$$(ids.datatable).data.sync(scopeDC);

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

				let cond = {};

				// Search filter
				let searchText = $$(ids.search).getValue();
				if (searchText) {
					cond.where = {
						or: [
							{ name: { contains: searchText } },
							{ description: { contains: searchText } }
						]
					};
				}

				CurrentApplication.scopeFind(cond)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						// Parse to the data collection
						if (this._scopeDC)
							this._scopeDC.parse(data || []);

						_logic.ready();

					});

			},

			selectScope: (userId) => {

				if (!this._scopeDC)
					return;

				if (userId)
					this._scopeDC.setCursor(userId);
				else
					this._scopeDC.setCursor(null);

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