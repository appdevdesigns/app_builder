import ABDataviewProperty from "./ab_work_dataview_workspace_properties"
import ABWorkspaceDatatable from "./ab_work_object_workspace_datatable"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class AB_Work_Dataview_Workspace extends OP.Component {

	constructor(App) {
		let idBase = 'ab_work_dataview_workspace';

		super(App, idBase);

		this.labels = {
			common: App.labels,
			component: {
				selectDataview: L('ab.dataview.selectDataview', "*Select a data view to work with."),
				addNew: L('ab.dataview.addNew', "*Add new data view")
			}
		};

		// internal list of Webix IDs to reference our UI components.
		this.ids = {
			multiview: this.unique('multiview'),
			noSelection: this.unique('noSelection'),
			workspace: this.unique('workspace')
		}

		this.DataTable = new ABWorkspaceDatatable(App, idBase, {
			allowDelete: 0,
			configureHeaders: false,
			detailsView: "",
			editView: "",
			isEditable: 0,
			massUpdate: 0
		});
		this.Property = new ABDataviewProperty(App);

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
		this.populateWorkspace = this._logic.populateWorkspace;
		this.clearWorkspace = this._logic.clearWorkspace;

	}

	get ui() {

		let App = this.App,
			labels = this.labels,
			ids = this.ids;

		// Our webix UI definition:
		return {
			view: 'multiview',
			id: ids.multiview,
			cells: [

				// No selection
				{
					id: ids.noSelection,
					rows: [
						{
							maxHeight: App.config.xxxLargeSpacer,
							hidden: App.config.hideMobile
						},
						{
							view: 'label',
							align: "center",
							height: 200,
							label: "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-table'></div>"
						},
						{
							view: 'label',
							align: "center",
							label: labels.component.selectDataview
						},
						{
							cols: [
								{},
								{
									view: "button",
									label: labels.component.addNew,
									type: "form",
									autowidth: true,
									click: function () {
										App.actions.addNewDataview();
									}
								},
								{}
							]
						},
						{
							maxHeight: App.config.xxxLargeSpacer,
							hidden: App.config.hideMobile
						}
					]
				},

				// Workspace
				{
					id: ids.workspace,
					view: 'layout',
					cols: [
						// Workspace
						this.DataTable.ui,

						{ view: "resizer", css: "bg_gray", width: 11 },

						// Property
						this.Property.ui

					]
				}]
		};

	}

	// Our init() function for setting up our UI
	init() {

		this.DataTable.init({});
		this.Property.init({
			onSave: this._logic.populateWorkspace
		});

		this._logic.populateWorkspace(this._dataview);

	}

	get _logic() {

		return {

			/**
			 * @function applicationLoad
			 * 
			 * @param {ABApplication}
			 */
			applicationLoad: (application) => {

				this._application = application;

				this.Property.applicationLoad(application);

			},

			/**
			 * @function populateWorkspace
			 * 
			 * @param {ABDataview}
			 */
			populateWorkspace: (dataview) => {

				let ids = this.ids;
				let DataTable = this.DataTable;

				this._dataview = dataview;

				let $datatable = $$(DataTable.ui.id);
				// unbind
				$datatable.clearAll();
				$datatable.data.unsync();
				$datatable.unbind();

				if (dataview) {

					$$(ids.workspace).show();

					// get data collection & object
					if (dataview &&
						dataview.datasource) {

						DataTable.objectLoad(dataview.datasource);
						DataTable.refreshHeader();

						// bind a data collection to the display grid
						dataview.unbind($datatable);
						dataview.bind($datatable);

						$datatable.adjust();

						// load data
						if (dataview.dataStatus == dataview.dataStatusFlag.notInitial)
							dataview.loadData();
					}

				}
				else {
					this._logic.clearWorkspace();
				}

				// Property
				this.Property.dataviewLoad(dataview);

			},

			/**
			 * @function clearWorkspace()
			 *
			 * Clear the data view workspace.
			 */
			clearWorkspace: () => {

				this._dataview = null;

				$$(this.ids.noSelection).show();

			}

		};

	}

}