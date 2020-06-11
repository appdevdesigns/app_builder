/*
 * custom_timepicker
 *
 * Create a custom webix component.
 *
 */

module.exports = class ABCustomTimePicker {
   //.extend(ComponentKey, function(App, componentKey ) {

   get key() {
      return "timepicker";
   }

   constructor(App) {
      // App 	{obj}	our application instance object.
      // componentKey {string}	the destination key in App.custom[componentKey] for the instance of this component:

      // super(App, key);

      var L = App.Label;

      var labels = {
         common: App.labels,

         component: {}
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: App.unique(this.key)
      };

      // Our webix UI definition:
      var _ui = {
         name: App.unique("custom_timepicker") // keep this unique for this App instance.
      };
      this.view = this.key;

      // our internal business logic
      var _logic = {};
      this._logic = _logic;

      // Tell Webix to create an INSTANCE of our custom component:
      webix.editors.$popup.time = {
         view: "popup",
         body: {
            view: "calendar",
            width: 220,
            height: 200,
            type: "time"
         }
      };

      webix.editors.time = webix.extend(
         {
            popupType: "time"
         },
         webix.editors.date
      );
   }
};
