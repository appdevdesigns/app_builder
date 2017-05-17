
/*
 * ab_work_object
 *
 * Display the Object Tab UI:
 *
 */


import AB_Work_Object_List from "./ab_work_object_list"
// import "./ab_work_object_workspace"



export default class AB_Work extends OP.Component {   //.extend(idBase, function(App) {


	constructor(App) {
		super(App, 'ab_work_object');

		var L = this.Label;


		var labels = {

			common : App.labels,

			component: {

			}

		}


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

		}


		var ObjectList = new AB_Work_Object_List(App);
// var ObjectWorkspace = OP.Component['ab_work_object_workspace'](App);


		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			autoheight: true,
			margin: 20,
			cols: [
				ObjectList.ui,
				{ view: "resizer"},
				// ObjectWorkspace.ui
{view:'label',label:'ObjectWorkspace.ui'},
			]
		};


		// Our init() function for setting up our UI
		this.init = function() {

// ObjectWorkspace.init();
			ObjectList.init();

		}


		// our internal business logic
		var _logic = {

			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application 
			 */
			applicationLoad: function(application) {
				ObjectList.applicationLoad(application);
// App.actions.clearObjectWorkspace();
			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show:function() {

				$$(ids.component).show();
			}
		}
		this._logic = _logic;



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}
