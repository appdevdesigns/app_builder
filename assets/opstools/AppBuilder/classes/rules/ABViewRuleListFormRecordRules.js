//
// ABViewRuleListFormRecordRules
//
// A component that is responsible for displaying the specific list of Record
// Rules for a form.
//
const ABViewRuleList = require("./ABViewRuleList");
const ABViewRule = require("./ABViewRule");

const RoleUpdateExisting = require("./ruleActions/ABViewRuleActionFormRecordRuleUpdate");
const RoleInsertConnected = require("./ruleActions/ABViewRuleActionFormRecordRuleInsertConnected");
const RoleUpdateConnected = require("./ruleActions/ABViewRuleActionFormRecordRuleUpdateConnected");
const RoleRemoveConnected = require("./ruleActions/ABViewRuleActionFormRecordRuleRemoveConnected");

module.exports = class ABViewRuleListFormRecordRules extends ABViewRuleList {
   /**
    * @param {object} App
    *      ?what is this?
    * @param {string} idBase
    *      Identifier for this component
    */
   constructor() {
      var settings = {
         labels: {
            header: "ab.components.form.recordRules",
            headerDefault: "*Record Rules"
         }
      };
      super(settings);
      var L = this.Label;
   }

   // must return the actual Rule object.
   getRule() {
      var listActions = [
         new RoleUpdateExisting(
            this.App,
            this.idBase + "_ruleActionUpdate",
            this.currentForm
         ),
         new RoleInsertConnected(
            this.App,
            this.idBase + "_ruleActionInsert",
            this.currentForm
         ),
         new RoleUpdateConnected(
            this.App,
            this.idBase + "_ruleActionUpdateConnected",
            this.currentForm
         ),
         new RoleRemoveConnected(
            this.App,
            this.idBase + "_ruleActionRemoveConnected",
            this.currentForm
         )
      ];

      var Rule = new ABViewRule(listActions);
      if (this.currentObject) {
         Rule.objectLoad(this.currentObject);
      }
      return Rule;
   }
};
