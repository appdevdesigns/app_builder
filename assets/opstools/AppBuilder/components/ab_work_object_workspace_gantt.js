
/*
 * ab_work_object_workspace_gantt
 *
 * Manage the Object Workspace Gantt area.
 *
 */

export default class ABWorkObjectGantt extends OP.Component {

	/**
	 * 
	 * @param {*} App 
	 * @param {*} idBase 
	 */
	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_gantt';
		super(App, idBase);

		var L = this.Label;
		var labels = {
			common: App.labels,
			component: {
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique(idBase + '_workspace_gantt_border'),
			gantt: this.unique(idBase + '_workspace_gantt'),
		}

		var CurrentObject = null;	// current ABObject being displayed

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			view: "dhx-gantt",
			cdn: "/js/webix/components/gantt",
			init: function (gantt) {

				gantt.config.drag_links = false;
				gantt.config.details_on_create = false;
				gantt.config.details_on_dblclick = false;
				gantt.config.columns = [
					{ name: "text", label: "Task name", tree: true, width: '*' },
					{ name: "start_date", label: "Start time", align: "center" },
					{ name: "duration", label: "Duration", align: "center" }
					// { name: "add", label: "" }
				];

			},
			ready: function (gantt) {

				_logic.loadData();

			}
		};


		// Our init() function for setting up our UI
		this.init = (options) => {
		};


		// our internal business logic
		var _logic = this._logic = {

			/**
			 * @function hide()
			 *
			 * hide this component.
			 */
			hide: function () {
				$$(ids.component).hide();
			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: () => {

				$$(ids.component).show();

				if (!CurrentObject) return;

				// Get object's kanban view
				let ganttView = CurrentObject.workspaceViews.getCurrentView();
				if (!ganttView || ganttView.type != "gantt") return;

				// Fields
				let startDateField = ganttView.getStartDateField();
				let durationField = ganttView.getDurationField();
				if (!startDateField || !durationField) return;

				// rebuild
				webix.ui(this.ui, $$(ids.component));
				webix.extend($$(ids.component), webix.ProgressBar);

			},


			objectLoad: (object) => {

				CurrentObject = object;
			},

			getCurrentView: () => {

				// Get object's kanban view
				let ganttView = CurrentObject.workspaceViews.getCurrentView();
				if (!ganttView || ganttView.type != "gantt") return;

			},

			busy: function () {
				if ($$(ids.component).showProgress)
					$$(ids.component).showProgress({ type: "icon" });
			},

			ready: function () {
				if ($$(ids.component).hideProgress)
					$$(ids.component).hideProgress();
			},

			loadData: function () {

				let gantt = $$(ids.component).getGantt();

				gantt.clearAll();

				// Get object's kanban view
				let ganttView = CurrentObject.workspaceViews.getCurrentView();
				if (!ganttView || ganttView.type != "gantt") return;

				// Fields
				let startDateField = ganttView.getStartDateField();
				let durationField = ganttView.getDurationField();
				if (!startDateField || !durationField) return;

				_logic.busy();

				// Set the Model object with a condition / skip / limit, then
				// use it to load the DataTable:
				//// NOTE: this should take advantage of Webix dynamic data loading on
				//// larger data sets.
				var wheres = { glue: "and", rules: [] };
				if (CurrentObject.workspaceFilterConditions &&
					CurrentObject.workspaceFilterConditions.rules &&
					CurrentObject.workspaceFilterConditions.rules.length > 0) {
					wheres = _.cloneDeep(CurrentObject.workspaceFilterConditions);
				}

				var sorts = {};
				if (CurrentObject.workspaceSortFields &&
					CurrentObject.workspaceSortFields.length > 0) {
					sorts = CurrentObject.workspaceSortFields;
				}

				// Start date should have data
				wheres.rules.push({
					key: startDateField.id,
					rule: "greater",
					value: new Date(-8640000000000000) // minimal date
				});

				// Duration should more than 0
				wheres.rules.push({
					key: durationField.id,
					rule: "greater",
					value: 0
				});


				// WORKAROUND: load all data for now
				CurrentObject.model()
					.findAll({
						where: wheres,
						sort: sorts,
					})
					.then((data) => {

						let gantt_data = {
							data: (data.data || []).map(d => {

								let result = {};

								// define label
								result['text'] = CurrentObject.displayData(d);
								result['start_date'] = d[startDateField.columnName];
								result['duration'] = d[durationField.columnName] || 0;
								result['progress'] = 0.6 || 0;

								return result;
							})
						}

						gantt.parse(gantt_data);

						_logic.ready();

					});

			}

		}

		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;
		this.refresh = _logic.loadData;

	}

}