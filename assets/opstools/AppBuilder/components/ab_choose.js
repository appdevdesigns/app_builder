/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const AB_Choose_Config = require("./ab_choose_config");
const AB_Choose_List = require("./ab_choose_list");
const AB_Choose_Form = require("./ab_choose_form");

module.exports = class ABChoose extends ABComponent {
   // (idBase, function(App) {

   constructor(App) {
      super(App, "ab_choose");

      var ids = {
         component: this.unique("component")
      };

      // Define the external components used in this Component:
      var AppConfig = new AB_Choose_Config(App);
      var AppList = new AB_Choose_List(App);
      var AppForm = new AB_Choose_Form(App);

      // This component's UI definition:
      // Application multi-views
      this.ui = {
         view: "multiview",
         animate: false,
         id: ids.component,
         cells: [AppList.ui, AppForm.ui, AppConfig.ui]
      };

      // This component's Init definition:
      this.init = function() {
         AppConfig.init();
         AppList.init();
         AppForm.init();

         AppList.on("view.config", () => {
            AppConfig.show();
         });

         AppConfig.on("view.list", () => {
            AppList.show();
         });

         // AppList.show();
      };

      this.actions({
         /**
          * @function transitionApplicationChooser
          *
          * Switch the AppBuilder UI to show the Application Chooser component.
          */
         transitionApplicationChooser: function() {
            $$(ids.component).show();
         }
      });

      var _logic = {
         show: () => {
            AppList.show();
         }
      };

      this._logic = _logic;
      this.show = _logic.show;
   }
};
