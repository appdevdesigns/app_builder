//
// ABViewRuleActionFormSubmitRuleConfirmMessage
//
//
//
const ABViewRuleAction = require("../ABViewRuleAction");

module.exports = class ABViewRuleActionFormSubmitRuleConfirmMessage extends ABViewRuleAction {
   /**
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    */
   constructor(App, idBase) {
      super();
      var L = function(key, altText) {
         return AD.lang.label.getLabel(key) || altText;
      };

      this.App = App;
      this.key = "ABViewRuleActionFormSubmitRuleConfirmMessage";
      this.label = L(
         "ab.component.ruleaction.abviewruleActionFormSubmitRuleConfirmMessage",
         "*Show a confirmation message"
      );

      this.currentObject = null; // the object this Action is tied to.

      this.formRows = []; // keep track of the Value Components being set
      // [
      //		{ fieldId: xxx, value:yyy, type:key['string', 'number', 'date',...]}
      // ]

      // Labels for UI components
      var labels = (this.labels = {
         // common: App.labels,
         component: {
            message: L("ab.ruleAction.confirmMessage.message", "*Message")
            // set: L("ab.component.form.set", "*Set"),
            // to: L("ab.component.form.to", "*To"),
         }
      });
   }

   // conditionFields() {
   //    var fieldTypes = ["string", "number", "date", "formula", "calculate"];

   //    var currFields = [];

   //    if (this.currentObject) {
   //       this.currentObject.fields().forEach((f) => {
   //          if (fieldTypes.indexOf(f.key) != -1) {
   //             // NOTE: the .id value must match the obj[.id]  in the data set
   //             // so if your object data looks like:
   //             // 	{
   //             //		name_first:'Neo',
   //             //		name_last: 'The One'
   //             //  },
   //             // then the ids should be:
   //             // { id:'name_first', value:'xxx', type:'string' }
   //             currFields.push({
   //                id: f.columnName,
   //                value: f.label,
   //                type: f.key
   //             });
   //          }
   //       });
   //    }

   //    return currFields;
   // }

   // valueDisplayComponent
   // Return an ABView to display our values form.
   //
   valueDisplayComponent(idBase) {
      var ids = {
         message: idBase + "_message"
      };

      this._ui = {
         ui: {
            id: ids.message,
            view: "textarea",
            // label: this.labels.component.message,
            // labelWidth: this.App.config.labelWidthLarge,
            height: 130
         },

         init: () => {},

         _logic: _logic,

         fromSettings: (valueRules) => {
            _logic.fromSettings(valueRules);
         },
         toSettings: () => {
            return _logic.toSettings();
         }
      };

      var _logic = {
         fromSettings: (valueRules) => {
            valueRules = valueRules || {};

            $$(ids.message).setValue(valueRules.message || "");
         },

         toSettings: () => {
            // return the confirm message
            return {
               message: $$(ids.message).getValue() || ""
            };
         }
      };

      return this._ui;
   }

   // process
   // gets called when a form is submitted and the data passes the Query Builder Rules.
   // @param {obj} options
   process(options) {
      return new Promise((resolve, reject) => {
         var confirmMessage = this.valueRules.message || "";

         webix.message({
            text: confirmMessage,
            type: "info"
         });

         resolve();
      });
   }

   // fromSettings
   // initialize this Action from a given set of setting values.
   // @param {obj}  settings
   fromSettings(settings) {
      settings = settings || {};
      super.fromSettings(settings); // let the parent handle the QB

      // if we have a display component, then populate it:
      if (this._ui) {
         // now we handle our valueRules:{} object settings.
         // pass the settings off to our DisplayList component:
         this._ui.fromSettings(settings.valueRules);
      }
   }

   // toSettings
   // return an object that represents the current state of this Action
   // @return {obj}
   toSettings() {
      // settings: {
      //	message:''
      // }

      // let our parent store our QB settings
      var settings = super.toSettings();

      settings.valueRules = this._ui.toSettings();

      return settings;
   }
};
