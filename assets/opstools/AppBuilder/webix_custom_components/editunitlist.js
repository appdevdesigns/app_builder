
/*
 * custom_editunitlist
 *
 * Create a custom webix component.
 *
 */


var ComponentKey = 'ab_custom_editunitlist';
export default class ABCustomEditUnitList extends OP.CustomComponent { // .extend(ComponentKey, function(App, componentKey ) {

	constructor(App, key) {
		// App 	{obj}	our application instance object.
		// key {string}	the destination key in App.custom[componentKey] for the instance of this component:

		super(App, key);

		var L = this.Label;


		var labels = {

			common : App.labels,

			component: {

			}

		}

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: App.unique(ComponentKey),
		}



		// Our webix UI definition:
		var _ui = {
	        name: ComponentKey
	    };
	    this.view = ComponentKey;



	    // our internal business logic 
		var _logic = {

		}
		this._logic = _logic;


		// Tell Webix to create an INSTANCE of our custom component:
	    webix.protoUI(_ui, webix.EditAbility, webix.ui.unitlist);

	}

}
