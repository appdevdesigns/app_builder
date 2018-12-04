/*
 * ab_work_object_workspace_kanban_sidePanel
 *
 * Manage the Object Workspace KanBan update data area.
 *
 */

export default class ABWorkObjectKanBan extends OP.Component {

	/**
	 * 
	 * @param {*} App 
	 * @param {*} idBase 
	 */

	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_kanban_sidePanel';
		super(App, idBase);

		var L = this.Label;
		var labels = {
			common: App.labels,
			component: {
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique(idBase + '_workspace_kanban_side')
		};

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			width: 300,
			hidden: true,
			rows: [{
				cols: [{},
				{
					view: "icon",
					icon: "wxi-close",
					align: "right",
					click: function (id) {

						_logic.hide();

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
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}
		};


		// our internal business logic
		var _logic = this._logic = {

			callbacks: {

				/**
				* @function onClose
				*
				*/
				onClose: function () { },
			},


			hide: function () {

				$$(ids.component).hide();

				_logic.callbacks.onClose();

			},

			show: function () {

				$$(ids.component).show();

			}

		};

		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;


	}

}



