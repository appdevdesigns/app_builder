/*
 * numbertext
 *
 * Create a custom webix component.
 *
 */

module.exports = class ABCustomNumberText {
   get key() {
      return "numbertext";
   }

   constructor(App) {
      // App 	{obj}	our application instance object.
      // key {string}	the destination key in App.custom[componentKey] for the instance of this component:

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
         name: this.key,

         defaults: {
            css: "webix_el_text"
         },

         // override this function to return number value type
         $getValue: function() {
            var val = this.getInputNode().value;
            if (val) return JSON.parse(val);
            // Convert to number
            else return "";
         }
      };
      this.view = this.key;

      // our internal business logic
      var _logic = {};
      this._logic = _logic;

      // Tell Webix to create an INSTANCE of our custom component:
      webix.protoUI(_ui, webix.ui.text);
   }
};
