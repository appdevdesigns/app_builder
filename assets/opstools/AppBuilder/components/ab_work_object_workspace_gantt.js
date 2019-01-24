
/*
 * ab_work_object_workspace_gantt
 *
 * Manage the Object Workspace Gantt area.
 *
 */

import AB_Work_Form from "app_builder/assets/opstools/AppBuilder/components/ab_work_object_workspace_formSidePanel"

export default class ABWorkObjectGantt extends OP.Component {

	/**
	 * 
	 * @param {*} App 
	 * @param {*} idBase 
	 */
	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_gantt';
		super(App, idBase);

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
			}
		};

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique(idBase + '_workspace_gantt_border'),
			gantt: this.unique(idBase + '_workspace_gantt'),
		}

		let CurrentObject = null,
			CurrentGanttView = null,
			CurrentStartDateField = null,
			CurrentDurationField = null,
			CurrentProgressField = null;

		let FormSide = new AB_Work_Form(App, idBase + '_gantt_form');

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			cols: [
				{
					id: ids.gantt,
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
				},
				{
					id: ids.resizer,
					view: "resizer",
					borderless: true,
				},
				FormSide.ui
			]
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			setTimeout(() => {

				let gantt = $$(ids.gantt).getGantt();

				if ($$(ids.gantt).__onAfterTaskDragEvent == null) {
					$$(ids.gantt).__onAfterTaskDragEvent = gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {

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


					$$(ids.gantt).__onTaskClickEvent = gantt.attachEvent("onTaskClick", (id, e) => {

						_logic.selectTask(id);
						return true;

					});


				}

			}, 2500);


			FormSide.init({
				onAddData: _logic.updateTaskItem,
				onUpdateData: _logic.updateTaskItem,
				onClose: _logic.unselect
			})

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

				FormSide.hide();

				if (!CurrentObject || !CurrentGanttView || !CurrentStartDateField || !CurrentDurationField)
					return;

				// rebuild
				webix.ui(this.ui.cols[0], $$(ids.gantt));
				webix.extend($$(ids.gantt), webix.ProgressBar);

			},


			objectLoad: (object) => {

				CurrentObject = object;

				FormSide.objectLoad(object);

				// Get object's kanban view
				CurrentGanttView = _logic.getCurrentView();
				if (!CurrentGanttView) return;

				// Fields
				CurrentStartDateField = CurrentGanttView.getStartDateField();
				CurrentDurationField = CurrentGanttView.getDurationField();
				CurrentProgressField = CurrentGanttView.getProgressField();
				
			},

			getCurrentView: () => {

				if (!CurrentObject || !CurrentObject.workspaceViews)
					return null;

				// Get object's kanban view
				let ganttView = CurrentObject.workspaceViews.getCurrentView();
				if (ganttView && ganttView.type == "gantt")
					return ganttView;
				else
					return null;

			},

			busy: function () {
				if ($$(ids.gantt).showProgress)
					$$(ids.gantt).showProgress({ type: "icon" });
			},

			ready: function () {
				if ($$(ids.gantt).hideProgress)
					$$(ids.gantt).hideProgress();
			},

			loadData: () => {

				let gantt = $$(ids.gantt).getGantt();

				gantt.clearAll();

				if (!CurrentGanttView || !CurrentStartDateField || !CurrentDurationField)
					return;

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
					key: CurrentStartDateField.id,
					rule: "greater",
					value: new Date(-8640000000000000) // minimal date
				});

				// Duration should more than 0
				wheres.rules.push({
					key: CurrentDurationField.id,
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
							data: (data.data || []).map((d, index) => {

								return _logic.convertFormat(d, index);

							})
						}

						gantt.parse(gantt_data);

						_logic.ready();

					});

			},

			convertFormat: (data, index) => {

				data = data || {};

				if (!CurrentStartDateField || !CurrentDurationField)
					return data;

				data['id'] = data.id;
				// define label
				data['text'] = CurrentObject.displayData(data);
				data['start_date'] = data[CurrentStartDateField.columnName];
				data['duration'] = data[CurrentDurationField.columnName] || 0;
				data['progress'] = CurrentProgressField ? parseFloat(data[CurrentProgressField.columnName] || 0) : 0;

				if (index != null)
					data['order'] = index;

				return data;

			},

			selectTask: (rowId) => {

				let gantt = $$(ids.gantt).getGantt();
				let task = gantt.getTask(rowId);

				FormSide.show(task || {});

			},

			unselect: () => {

				let gantt = $$(ids.gantt).getGantt();
				gantt.unselectTask();

			},

			addTask: () => {

				_logic.unselect();

				// show the side form
				FormSide.show();

			},

			updateTask: (rowId, patch) => {

				_logic.busy();

				CurrentObject.model()
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

				if (!CurrentGanttView || !CurrentStartDateField || !CurrentDurationField)
					return;

				let task = gantt.getTask(rowId);

				let patch = {};
				patch[CurrentStartDateField.columnName] = task.start_date;
				patch[CurrentDurationField.columnName] = task.duration;

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

			},


			updateTaskItem(data) {

				let gantt = $$(ids.gantt).getGantt();

				// update
				if (data.id && gantt.isTaskExists(data.id)) {

					let task = gantt.getTask(data.id);

					// Changes task's data
					// https://docs.dhtmlx.com/gantt/api__gantt_updatetask.html
					let updatedTask = _logic.convertFormat(data);
					for (let key in updatedTask) {
						task[key] = updatedTask[key];
					}

					gantt.updateTask(data.id);
				}
				// insert
				else {
					let newTask = _logic.convertFormat(data);
					gantt.addTask(newTask);
				}

			},

		}

		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;
		this.addTask = _logic.addTask;
		this.refresh = _logic.loadData;

	}

}