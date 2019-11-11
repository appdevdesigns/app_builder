
/*
 * ab_work_object_workspace_gantt
 *
 * Manage the Object Workspace Gantt area.
 *
 */

const AB_Work_Form = require("./ab_work_object_workspace_formSidePanel");

module.exports = class ABWorkObjectGantt extends OP.Component {

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
				confirmDeleteTaskTitle: L('ab.object.deleteTask.title', "*Remove task"),
				confirmDeleteTaskMessage: L('ab.object.deleteTask.message', "*Do you want to delete this task?")
			}

		};

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			component: this.unique(idBase + '_workspace_gantt_border'),
			gantt: this.unique(idBase + '_workspace_gantt'),
			resizer: this.unique(idBase + '_workspace_gantt_resizer')
		}

		let CurrentObject = null,
			CurrentDataview = null,
			CurrentGanttView = null,
			CurrentStartDateField = null,
			CurrentEndDateField = null,
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
							{ name: "__remove", label: "", width: 40, align: "center", template: () => '<span class="fa fa-trash ab-gantt-remove" style="line-height: 35px;"></span>' }
						];

					},
					ready: function (gantt) {

						_logic.attachEvents();

					}
				},
				{
					id: ids.resizer,
					view: "resizer",
					hidden: true,
					css: "bg_gray", 
					width: 11
				},
				FormSide.ui
			]
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

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
				$$(ids.resizer).hide();

				// Get object's kanban view
				CurrentGanttView = _logic.getCurrentView();
				if (!CurrentGanttView) return;

				// Fields
				CurrentStartDateField = CurrentGanttView.startDateField;
				CurrentEndDateField = CurrentGanttView.endDateField;
				CurrentDurationField = CurrentGanttView.durationField;
				CurrentProgressField = CurrentGanttView.progressField;

				if (!CurrentObject || !CurrentGanttView || !CurrentStartDateField || (!CurrentEndDateField && !CurrentDurationField))
					return;

				// rebuild
				webix.ui(this.ui.cols[0], $$(ids.gantt));
				webix.extend($$(ids.gantt), webix.ProgressBar);

			},


			objectLoad: (object) => {

				CurrentObject = object;

				FormSide.objectLoad(object);

			},

			/**
			 * @method dataviewLoad
			 * 
			 * @param dataview {ABDataview}
			 */
			dataviewLoad: (dataview) => {

				CurrentDataview = dataview;

				if (CurrentDataview.dataStatus == CurrentDataview.dataStatusFlag.initialized) {
					_logic.initData();
				}

				CurrentDataview.on('initializedData', () => {

					if (CurrentObject.currentView().type != "gantt")
						return;

					_logic.initData();

				});

				// real-time update
				CurrentDataview.on('create', vals => {

					if (CurrentObject.currentView().type != "gantt")
						return;

					_logic.updateTaskItem(vals, true);

				});

				CurrentDataview.on('update', vals => {

					if (CurrentObject.currentView().type != "gantt")
						return;

					_logic.updateTaskItem(vals, true);

				});
				CurrentDataview.on('delete', taskId => {

					if (CurrentObject.currentView().type != "gantt")
						return;

					// remove this task in gantt
					let gantt = $$(ids.gantt).getGantt();
					if (gantt && gantt.isTaskExists(taskId))
						gantt.deleteTask(taskId);

				});

				// TODO: pagination
				// https://docs.dhtmlx.com/grid__big_datasets_loading.html
				// if (CurrentDC)
				// 	CurrentDC.bind($$(ids.gantt));
				// else
				// 	$$(ids.gantt).unbind();

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

			initData: () => {

				let gantt = $$(ids.gantt).getGantt();
				if (!gantt) return;

				gantt.clearAll();

				let gantt_data = {
					data: (CurrentDataview.getData() || [])
						.map((d, index) => _logic.convertFormat(gantt, d))
						// .map((d, index) => _logic.convertFormat(gantt, d, index))
				};

				gantt.parse(gantt_data);

				_logic.sort();

			},

			busy: function () {
				if ($$(ids.gantt).showProgress)
					$$(ids.gantt).showProgress({ type: "icon" });
			},

			ready: function () {
				if ($$(ids.gantt).hideProgress)
					$$(ids.gantt).hideProgress();
			},

			attachEvents: () => {

				let gantt = $$(ids.gantt).getGantt();
				if (!gantt) return;

				if (gantt.__onAfterTaskDragEvent == null) {
					gantt.__onAfterTaskDragEvent = gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {

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


				if (gantt.__onTaskClickEvent == null) {
					gantt.__onTaskClickEvent = gantt.attachEvent("onTaskClick", (id, e) => {

						_logic.selectTask(id);
						return true;

					});
				}


				if (gantt.__onTaskRowClick == null) {
					gantt.__onTaskRowClick = gantt.attachEvent("onTaskRowClick", (id, dom) => {

						if (dom.classList.contains('ab-gantt-remove')) {
							_logic.removeTask(id);
						}

					});
				}


			},

			convertFormat: (gantt, data, index) => {

				data = data || {};

				if (!CurrentStartDateField || (!CurrentEndDateField && !CurrentDurationField))
					return data;

				let currDate = new Date();

				data['id'] = data.id;
				// define label
				data['text'] = CurrentObject.displayData(data);
				data['start_date'] = data[CurrentStartDateField.columnName] || currDate;
				data['progress'] = CurrentProgressField ? parseFloat(data[CurrentProgressField.columnName] || 0) : 0;

				if (CurrentEndDateField)
					data['end_date'] = data[CurrentEndDateField.columnName] || currDate;

				if (CurrentDurationField)
					data['duration'] = data[CurrentDurationField.columnName] || 1;

				// Calculate duration
				if (!data['duration'] && data['start_date'] && data['end_date'])
					data['duration'] = gantt.calculateDuration(data['start_date'], data['end_date']);

				// Calculate end date
				if (!data['end_date'] && data['start_date'] && data['duration'])
					data['end_date'] = gantt.calculateEndDate(data['start_date'], data['duration']);


				// Default values
				if (!data['end_date'] && !data['duration']) {
					data['end_date'] = currDate;
					data['duration'] = 1;
				}

				if (index != null)
					data['order'] = index;

				return data;

			},

			selectTask: (rowId) => {

				let gantt = $$(ids.gantt).getGantt();
				let task = gantt.getTask(rowId);

				FormSide.show(task || {});
				$$(ids.resizer).show();

			},

			unselect: () => {

				let gantt = $$(ids.gantt).getGantt();
				gantt.unselectTask();

			},

			addTask: () => {

				_logic.unselect();

				// show the side form
				FormSide.show();
				$$(ids.resizer).show();

			},

			updateTask: (rowId, patch) => {

				_logic.busy();

				CurrentObject.model()
					.update(rowId, patch)
					.then(updatedTask => {

						_logic.updateTaskItem(updatedTask);

						_logic.ready();

					})
					.catch((err) => {

						OP.Error.log('Error saving item:', { error: err });

						_logic.ready();

					});

			},

			updateTaskDate: (rowId) => {

				if (!CurrentGanttView || !CurrentStartDateField || (!CurrentEndDateField && !CurrentDurationField))
					return;

				let task = gantt.getTask(rowId);

				let patch = {};
				patch[CurrentStartDateField.columnName] = task.start_date;

				if (CurrentEndDateField)
					patch[CurrentEndDateField.columnName] = task.end_date;

				if (CurrentDurationField)
					patch[CurrentDurationField.columnName] = task.duration;

				_logic.updateTask(rowId, patch);

			},

			updateTaskProgress: (rowId) => {

				// Get object's kanban view
				let ganttView = _logic.getCurrentView();
				if (!ganttView) return;

				// Fields
				let progressField = ganttView.progressField;
				if (!progressField) return;

				let task = gantt.getTask(rowId);

				let patch = {};
				patch[progressField.columnName] = task.progress || 0;

				_logic.updateTask(rowId, patch);

			},


			updateTaskItem(data, ignoreSelect = false) {

				let gantt = $$(ids.gantt).getGantt();

				// update
				if (data.id && gantt.isTaskExists(data.id)) {

					let task = gantt.getTask(data.id);

					// Changes task's data
					// https://docs.dhtmlx.com/gantt/api__gantt_updatetask.html
					let updatedTask = _logic.convertFormat(gantt, data);
					for (let key in updatedTask) {
						task[key] = updatedTask[key];
					}

					if (data['start_date'] && (data['end_date'] || data['duration'])) { // these fields are required
						gantt.updateTask(data.id);

						// after call .updateTask function. end_date and duration values will be calculated.
						// update these values to display in form properly
						task = gantt.getTask(data.id);

						if (CurrentEndDateField)
							task[CurrentEndDateField.columnName] = task['end_date'];
		
						if (CurrentDurationField)
							task[CurrentDurationField.columnName] = task['duration'];

						gantt.updateTask(data.id);

					}
				}
				// insert
				else {
					let newTask = _logic.convertFormat(gantt, data);

					if (newTask['start_date'] && (newTask['end_date'] || newTask['duration'])) // these fields are required
						gantt.addTask(newTask);

					if (!ignoreSelect) {
						gantt.selectTask(data.id);
						_logic.selectTask(data.id);
					}

				}

				_logic.sort();

				// If form opens, then update form data 
				if (FormSide.isVisible())
					_logic.selectTask(data.id);

			},


			removeTask: (rowId) => {

				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteTaskTitle,
					text: labels.component.confirmDeleteTaskMessage,
					callback: (result) => {
						if (!result) return;

						_logic.busy();

						CurrentObject.model()
							.delete(rowId)
							.then(response => {

								// remove this task in gantt
								let gantt = $$(ids.gantt).getGantt();
								if (gantt && gantt.isTaskExists(rowId)) {
									gantt.deleteTask(rowId);
									FormSide.hide();
								}

								_logic.ready();
							})
							.catch((err) => {

								OP.Error.log('Error deleting item:', { error: err });

								_logic.ready();

								//// TODO: what do we do here?	
							});

					}
				});

			},

			sort: () => {

				if (CurrentObject.workspaceSortFields &&
					CurrentObject.workspaceSortFields.length > 0)
					return;

				let gantt = $$(ids.gantt).getGantt();
				if (!gantt) return;

				// default sort
				let MAX_date = new Date(8640000000000000);
				gantt.sort(function(a, b) {

					let aStartDate = a['start_date'],
						aEndDate = a['end_date'],
						aDuration = a['duration'] || 1,

						bStartDate = b['start_date'],
						bEndDate = b['end_date'],
						bDuration = b['duration'] || 1;

					// if no start date, then be a last item
					if (a[CurrentStartDateField.columnName] == null || b[CurrentStartDateField.columnName] == null) {
						return (a[CurrentStartDateField.columnName] || MAX_date) - (b[CurrentStartDateField.columnName] || MAX_date);
					}
					else if (aStartDate != bStartDate) {
						return aStartDate - bStartDate;
					}
					else if (aEndDate != bEndDate) {
						return aEndDate - bEndDate;
					}
					else if (aDuration != bDuration) {
						return bDuration - aDuration;
					}

				}, false);

			}


		}

		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;
		this.dataviewLoad = _logic.dataviewLoad;
		this.addTask = _logic.addTask;

	}

}