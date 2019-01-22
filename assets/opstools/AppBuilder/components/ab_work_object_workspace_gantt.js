
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

		this.CurrentObject = null;	// current ABObject being displayed

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
					{ name: "duration", label: "Duration", align: "center" },
					// { name: "__remove", label: "", template: () => '<span class="fa fa-trash"></span>', width: 20 },
					// { name: "add", label: "" }
				];

			},
			ready: function (gantt) {

				_logic.loadData();

			}
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			setTimeout(() => {

				let gantt = $$(ids.component).getGantt();

				if ($$(ids.component).__onAfterTaskDragEvent == null) {
					$$(ids.component).__onAfterTaskDragEvent = gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {

						switch (mode) {
							case "resize":
							case "move":
								_logic.updateTaskDate(id);
								break;
							case "progress":
								_logic.updateTaskProgress(id);
								break;
							case "ignore":
								break;
						}

					});
				}

			}, 2500);

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

				if (!this.CurrentObject) return;

				// Get object's kanban view
				let ganttView = _logic.getCurrentView();
				if (!ganttView) return;

				// Fields
				let startDateField = ganttView.getStartDateField();
				let durationField = ganttView.getDurationField();
				if (!startDateField || !durationField) return;

				// rebuild
				webix.ui(this.ui, $$(ids.component));
				webix.extend($$(ids.component), webix.ProgressBar);

			},


			objectLoad: (object) => {

				this.CurrentObject = object;
			},

			getCurrentView: () => {

				if (!this.CurrentObject || !this.CurrentObject.workspaceViews)
					return null;

				// Get object's kanban view
				let ganttView = this.CurrentObject.workspaceViews.getCurrentView();
				if (ganttView && ganttView.type == "gantt")
					return ganttView;
				else
					return null;

			},

			busy: function () {
				if ($$(ids.component).showProgress)
					$$(ids.component).showProgress({ type: "icon" });
			},

			ready: function () {
				if ($$(ids.component).hideProgress)
					$$(ids.component).hideProgress();
			},

			loadData: () => {

				let gantt = $$(ids.component).getGantt();

				gantt.clearAll();

				// Get object's kanban view
				let ganttView = _logic.getCurrentView();
				if (!ganttView) return;

				// Fields
				let startDateField = ganttView.getStartDateField();
				let durationField = ganttView.getDurationField();
				let progressField = ganttView.getProgressField();
				if (!startDateField || !durationField) return;

				_logic.busy();

				// Set the Model object with a condition / skip / limit, then
				// use it to load the DataTable:
				//// NOTE: this should take advantage of Webix dynamic data loading on
				//// larger data sets.
				var wheres = { glue: "and", rules: [] };
				if (this.CurrentObject.workspaceFilterConditions &&
					this.CurrentObject.workspaceFilterConditions.rules &&
					this.CurrentObject.workspaceFilterConditions.rules.length > 0) {
					wheres = _.cloneDeep(this.CurrentObject.workspaceFilterConditions);
				}

				var sorts = {};
				if (this.CurrentObject.workspaceSortFields &&
					this.CurrentObject.workspaceSortFields.length > 0) {
					sorts = this.CurrentObject.workspaceSortFields;
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
				this.CurrentObject.model()
					.findAll({
						where: wheres,
						sort: sorts,
					})
					.then((data) => {

						let gantt_data = {
							data: (data.data || []).map((d, index) => {

								let result = {};

								result['id'] = d.id;
								// define label
								result['text'] = this.CurrentObject.displayData(d);
								result['start_date'] = d[startDateField.columnName];
								result['duration'] = d[durationField.columnName] || 0;
								result['order'] = index;
								result['progress'] = progressField ? parseFloat(d[progressField.columnName] || 0) : 0;

								return result;
							})
						}

						gantt.parse(gantt_data);

						_logic.ready();

					});

			},

			updateTask: (rowId, patch) => {

				_logic.busy();

				this.CurrentObject.model()
					.update(rowId, patch)
					.then(() => {

						_logic.ready();

					})
					.catch((err) => {

						OP.Error.log('Error saving item:', { error: err });

						_logic.ready();

					});

			},

			updateTaskDate: (rowId) => {

				// Get object's kanban view
				let ganttView = _logic.getCurrentView();
				if (!ganttView) return;

				// Fields
				let startDateField = ganttView.getStartDateField();
				let durationField = ganttView.getDurationField();
				if (!startDateField || !durationField) return;

				let task = gantt.getTask(rowId);

				let patch = {};
				patch[startDateField.columnName] = task.start_date;
				patch[durationField.columnName] = task.duration;

				_logic.updateTask(rowId, patch);

			},

			updateTaskProgress: (rowId) => {

				// Get object's kanban view
				let ganttView = _logic.getCurrentView();
				if (!ganttView) return;

				// Fields
				let progressField = ganttView.getProgressField();
				if (!progressField) return;

				let task = gantt.getTask(rowId);

				let patch = {};
				patch[progressField.columnName] = task.progress || 0;

				_logic.updateTask(rowId, patch);

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