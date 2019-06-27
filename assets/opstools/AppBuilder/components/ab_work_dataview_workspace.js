export default class AB_Work_Dataview_Workspace extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_dataview_workspace');

		// Our webix UI definition:
		this.ui = {
			view: 'layout',
			rows: []
		};

		// Our init() function for setting up our UI
		this.init = function () {
		};

		let _logic = {
			applicationLoad: () => { },
			populateObjectWorkspace: () => { },
			clearObjectWorkspace: () => { }
		};

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
		this.populateObjectWorkspace = this._logic.populateObjectWorkspace;
		this.clearObjectWorkspace = this._logic.clearObjectWorkspace;

	}

}