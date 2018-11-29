
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
					cols: [{
						header: "Backlog",
						body: {
							view: "kanbanlist",
							status: "new"
						}
					},
					{
						header: "In Progress",
						body: {
							view: "kanbanlist",
							status: "work"
						}
					},
					{
						header: "Testing",
						body: {
							view: "kanbanlist",
							status: "test"
						}
					},
					{
						header: "Done",
						body: {
							view: "kanbanlist",
							status: "done"
						}
					}
					],
					userList: true,
					editor: true,
					user: users,
					tags: [],
					data: [
						{ id: 1, status: "new", text: "Task 1", tags: "webix,docs", comments: [{ text: "Comment 1" }, { text: "Comment 2" }] },
						{ id: 2, status: "work", text: "Task 2", color: "#FE0E0E", tags: "webix", votes: 1, personId: 4 },
						{ id: 3, status: "work", text: "Task 3", tags: "webix,docs", comments: [{ text: "Comment 1" }], personId: 6 },
						{ id: 4, status: "test", text: "Task 4 pending", tags: "webix 2.5", votes: 1, personId: 5 },
						{ id: 5, status: "new", text: "Task 5", tags: "webix,docs", votes: 3 },
						{ id: 6, status: "new", text: "Task 6", tags: "webix,kanban", comments: [{ text: "Comment 1" }, { text: "Comment 2" }], personId: 2 },
						{ id: 7, status: "work", text: "Task 7", tags: "webix", votes: 2, personId: 7, image: "image001.jpg" },
						{ id: 8, status: "work", text: "Task 8", tags: "webix", comments: [{ text: "Comment 1" }, { text: "Comment 2" }], votes: 5, personId: 4 },
						{ id: 9, status: "work", text: "Task 9", tags: "webix", votes: 1, personId: 2 },
						{ id: 10, status: "work", text: "Task 10", tags: "webix", comments: [{ text: "Comment 1" }, { text: "Comment 2" }, { text: "Comment 3" }], votes: 10, personId: 1 },
						{ id: 11, status: "work", text: "Task 11", tags: "webix 2.5", votes: 3, personId: 8 },
						{ id: 12, status: "done", text: "Task 12", votes: 2, personId: 8, image: "image002.jpg" },
						{ id: 13, status: "ready", text: "Task 14", personId: 8 }
					]
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
			},

			objectLoad:function(object) {

				CurrentObject = object;

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


