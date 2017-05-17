
/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */


export default class AB_Work extends OP.Component {  


	constructor(App) {
		super(App, 'ab_work_interface');

		var L = this.Label;


		var labels = {

			common : App.labels,

			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),

			}
		}


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

		}



		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			//scroll: true,
			rows: [
				{
					view: "label",
					label:"interface workspace",
				},
			]
		};



		// Our init() function for setting up our UI
		this.init = function() {
			// webix.extend($$(ids.form), webix.ProgressBar);

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
			applicationLoad:function(application) {
console.error('TODO: ab_work_interface.applicationLoad()');
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


		this.actions({

		});



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}
