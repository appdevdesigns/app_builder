
/*
 * ab_work_object_workspace_kanban
 *
 * Manage the Object Workspace KanBan area.
 *
 */



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
			slideOutEditor: this.unique(idBase + '_slideOutEditor'),
		}

		var users = OP.User.userlist().map(u => {
			return {
				id: u.username,
				value: u.username
			};
		});

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			cols: [
				{
					id: ids.kanban,
					view: "kanban",
					cols: [],
					userList: true,
					editor: true,
					user: users,
					tags: [],
					data: []
				},
				{
					id: ids.resizer,
					view: "resizer",
					borderless: true,
				},
				{
					id: ids.slideOutEditor,
					width: 300,
					rows: [{
						cols: [{},
						{
							view: "icon",
							icon: "wxi-close",
							align: "right",
							click: function (id) {
								$$(ids.resizer).hide();
								$$(ids.slideOutEditor).hide();
							}
						}
						]
					},
					{
						view: "form",
						borderless: true,
						scroll: true,
						elements: [{
							view: "text",
							value: 'Field value',
							label: "Field Name1",
							labelPosition: "top"
						},
						{
							view: "textarea",
							height: 200,
							label: "Field Name",
							labelPosition: "top",
							value: "Field value"
						},
						{
							view: "textarea",
							height: 200,
							label: "Field Name",
							labelPosition: "top",
							value: "Field value"
						},
						{
							view: "textarea",
							height: 200,
							label: "Field Name",
							labelPosition: "top",
							value: "Field value"
						},
						]
					},
					{
						padding: 5,
						margin: 5,
						borderless: true,
						cols: [{
							view: "button",
							value: "Cancel"
						},
						{
							view: "button",
							value: "Save",
							type: "form"
						},
						]
					}
					]
				}
			]
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			webix.extend($$(ids.kanban), webix.ProgressBar);

		}



		var CurrentObject = null;		// current ABObject being displayed


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
				let verticalField = kanbanView.getVerticalGroupingField();
				if (!verticalField) return;

				// Option format -  { id: "1543563751920", text: "Normal", hex: "#4CAF50" }
				let verticalOptions = (verticalField.settings.options || []).map(opt => {

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


				_logic.loadData(verticalField);

			},

			objectLoad: function (object) {

				CurrentObject = object;

			},

			loadData: function (verticalField) {

				if (!CurrentObject)
					return;

				// Show loading cursor
				if ($$(ids.kanban).showProgress)
					$$(ids.kanban).showProgress({ type: "icon" });

				// WORKAROUND: load all data for now
				CurrentObject.model().findAll({})
					.then((data) => {

						$$(ids.kanban).parse(data.data.map(d => {
							return {
								id: d.id,
								text: CurrentObject.displayData(d),
								status: d[verticalField.columnName]
							};
						}));

						if ($$(ids.kanban).hideProgress)
							$$(ids.kanban).hideProgress();
					});

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