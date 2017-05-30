
/*
 * custom_datetimepicker
 *
 * Create a custom webix component.
 *
 */


var ComponentKey = 'ab_custom_datetimepicker';
export default class ABCustomDateTimePicker extends OP.CustomComponent { //.extend(ComponentKey, function(App, componentKey ) {

	constructor(App, key) {
		// App 	{obj}	our application instance object.
		// componentKey {string}	the destination key in App.custom[componentKey] for the instance of this component:

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
	        name: App.unique("custom_datetimepicker")	// keep this unique for this App instance.
	    };
	    this.view = ComponentKey;




		// our internal business logic 
		var _logic = {

		}
		this._logic = _logic;


		// Tell Webix to create an INSTANCE of our custom component:
		webix.editors.$popup.datetime = {
			view: "popup", width: 250, height: 250, padding: 0,
			body: { view: "calendar", icons: true, borderless: true, timepicker: true }
		};

		webix.editors.datetime = webix.extend({
			popupType: "datetime"
		}, webix.editors.date);

	}

}
