
/*
 * ab_work_object_workspace_kanban
 *
 * Manage the Object Workspace KanBan area.
 *
 */
import AB_Work_KanbanSide from "./ab_work_object_workspace_kanban_sidePanel"


export default class ABWorkObjectKanBan extends OP.Component {

	/**
	 * 
	 * @param {*} App 
	 * @param {*} idBase 
	 */

	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_kanban';
		super(App, idBase);

		var L = this.Label;
		var labels = {
			common: App.labels,
			component: {
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique(idBase + '_workspace_kanban'),
			kanban: this.unique(idBase + '_kanban'),
			resizer: this.unique(idBase + '_resizer'),
		}

		var users = OP.User.userlist().map(u => {
			return {
				id: u.username,
				value: u.username
			};
		});

		let KanbanSide = new AB_Work_KanbanSide(App, idBase);
		
		let _updatingOwnerRowId;

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			cols: [
				{
					id: ids.kanban,
					view: "kanban",
					cols: [],
					userList: {
						view: 'menu',
						yCount: 8,
						// scroll: false,
						template: '<i class="fa fa-user"></i> #value#',
						width: 150,
						on: {
							onSelectChange: function () {

								if (_updatingOwnerRowId == null) // get this row id from onAvatarClick event
									return;

								let userId = this.getSelectedId(false);

								_logic.updateOwner(_updatingOwnerRowId, userId);
							}
						}
					},
					editor: false, // we use side bar
					users: users,
					tags: [],
					data: [],
					on: {
						onListAfterSelect: (itemId, list) => {
							if (itemId)
								KanbanSide.show();
							else
								KanbanSide.hide();
						},
						onAfterStatusChange: (rowId, status, list) => {

							_logic.updateStatus(rowId, status);

						},
						onAvatarClick: function (rowId, ev, node, list) {

							// keep this row id for update owner data in .userList
							_updatingOwnerRowId = rowId;

						}
					}
				},
				{
					id: ids.resizer,
					view: "resizer",
					borderless: true,
				},
				KanbanSide.ui
			]
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			webix.extend($$(ids.kanban), webix.ProgressBar);

			KanbanSide.init({
				onClose: _logic.unselect
			})

		}



		var CurrentObject = null;		// current ABObject being displayed
		var CurrentVerticalField = null;
		var CurrentOwnerField = null;


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
			show: function () {

				$$(ids.component).show();

				if (!CurrentObject) return;

				// Get object's kanban view
				let kanbanView = CurrentObject.workspaceViews.getCurrentView();
				if (!kanbanView || kanbanView.type != "kanban") return;

				// Get vertical grouping field and populate to kanban list
				// NOTE: this field should be the select list type
				CurrentVerticalField = kanbanView.getVerticalGroupingField();
				if (!CurrentVerticalField) return;

				// Option format -  { id: "1543563751920", text: "Normal", hex: "#4CAF50" }
				let verticalOptions = (CurrentVerticalField.settings.options || []).map(opt => {

					return {
						header: opt.text,
						body: {
							view: "kanbanlist",
							status: opt.id
						}
					};
				});

				// Rebuild kanban that contains options
				// NOTE: webix kanban does not support dynamic vertical list
				webix.ui(verticalOptions, $$(ids.kanban));
				$$(ids.kanban).reconstruct();

				let horizontalField = kanbanView.getHorizontalGroupingField();

				CurrentOwnerField = kanbanView.getOwnerField();

				_logic.loadData();

			},

			objectLoad: function (object) {

				CurrentObject = object;

			},

			loadData: function () {

				if (!CurrentObject || !CurrentVerticalField)
					return;

				// Show loading cursor
				if ($$(ids.kanban).showProgress)
					$$(ids.kanban).showProgress({ type: "icon" });

				// WORKAROUND: load all data for now
				CurrentObject.model().findAll({})
					.then((data) => {

						$$(ids.kanban).parse(data.data.map(d => {

							// Convert data to kanban data format
							let result = {
								id: d.id,
								text: CurrentObject.displayData(d)
							};

							if (CurrentVerticalField)
								result.status = d[CurrentVerticalField.columnName];

							if (CurrentOwnerField)
								result.personId = d[CurrentOwnerField.columnName];

							return result;
						}));

						if ($$(ids.kanban).hideProgress)
							$$(ids.kanban).hideProgress();
					});

			},

			updateStatus: function (rowId, status) {

				if (!CurrentVerticalField) return;

				// Show loading cursor
				if ($$(ids.kanban).showProgress)
					$$(ids.kanban).showProgress({ type: "icon" });

				let patch = {};
				patch[CurrentVerticalField.columnName] = status;

				CurrentObject.model()
					.update(rowId, patch)
					.then(() => {

						if ($$(ids.kanban).hideProgress)
							$$(ids.kanban).hideProgress();

					})
					.catch((err) => {

						OP.Error.log('Error saving item:', { error: err });

						if ($$(ids.kanban).hideProgress)
							$$(ids.kanban).hideProgress();

					});

			},

			updateOwner: function (rowId, userId) {

				if (!CurrentOwnerField) return;

				// Show loading cursor
				if ($$(ids.kanban).showProgress)
					$$(ids.kanban).showProgress({ type: "icon" });

				let patch = {};
				patch[CurrentOwnerField.columnName] = userId;

				CurrentObject.model()
					.update(rowId, patch)
					.then(() => {

						if ($$(ids.kanban).hideProgress)
							$$(ids.kanban).hideProgress();

					})
					.catch((err) => {

						OP.Error.log('Error saving item:', { error: err });

						if ($$(ids.kanban).hideProgress)
							$$(ids.kanban).hideProgress();

					});

			},

			unselect: function () {

				// TODO: how to unselect task in kanban
			}


		}



		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;

	}

}