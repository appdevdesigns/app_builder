module.exports = class ABViewProperty {
   constructor() {}

   /**
    * @property default
    * return default settings
    *
    * @return {Object}
    */
   static get default() {
      return {};
   }

   /** == Property == */
   /**
    * @function propertyComponent
    * return the view and logic to display in property panel
    *
    * @return {Object} - {
    * 						ui: webix element,
    * 						init: function,
    * 						logic: object
    * 					}
    */
   static propertyComponent() {
      let ui = {
         view: "template",
         template: "No UI"
      };

      let init = (options) => {
         // register callbacks:
         for (var c in logic.callbacks) {
            logic.callbacks[c] = options[c] || logic.callbacks[c];
         }
      };

      let logic = {
         callbacks: {}
      };

      return {
         ui: ui,
         init: init,
         logic: logic
      };
   }

   fromSettings(settings) {
      this.settings = settings;
   }

   toSettings() {
      return this.settings || {};
   }

   /** == UI == */
   /**
    * @function component
    * return the view and logic to display in display widget
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    *
    * @return {Object} - {
    * 						ui: webix element,
    * 						init: function,
    * 						logic: object
    * 					}
    */
   component(App, idBase) {
      this.App = App;
      this.idBase = idBase;

      let ui = {
         view: "template",
         template: "No UI"
      };

      let init = (options) => {
         // register callbacks:
         for (var c in logic.callbacks) {
            logic.callbacks[c] = options[c] || logic.callbacks[c];
         }
      };

      let logic = {
         callbacks: {}
      };

      return {
         ui: ui,
         init: init,
         logic: logic
      };
   }
};
