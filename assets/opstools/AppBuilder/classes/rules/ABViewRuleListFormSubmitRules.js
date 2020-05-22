//
// ABViewRuleListFormSubmitRules
//
// A component that is responsible for displaying the specific list of Submit
// Rules for a form.
//
const ABViewRuleList = require("./ABViewRuleList");
const ABViewRule = require("./ABViewRule");

const RoleConfirmMessage = require("./ruleActions/ABViewRuleActionFormSubmitRuleConfirmMessage");
const RuleExistPage = require("./ruleActions/ABViewRuleActionFormSubmitRuleExistPage");
const RuleParentPage = require("./ruleActions/ABViewRuleActionFormSubmitRuleParentPage");
const RuleClosePopup = require("./ruleActions/ABViewRuleActionFormSubmitRuleClosePopup");
const RuleWebsite = require("./ruleActions/ABViewRuleActionFormSubmitRuleWebsite");
const RuleEmail = require("./ruleActions/ABViewRuleActionFormSubmitRuleEmail");

module.exports = class ABViewRuleListFormSubmitRules extends ABViewRuleList {
   /**
    * @param {object} App
    *      ?what is this?
    * @param {string} idBase
    *      Identifier for this component
    */
   constructor() {
      var settings = {
         labels: {
            header: "ab.component.form.submitRule",
            headerDefault: "*Submit Rules"
         }
      };
      super(settings);
      var L = this.Label;
   }

   // must return the actual Rule object.
   getRule() {
      var listActions = [
         new RoleConfirmMessage(
            this.App,
            this.idBase + "_ruleActionConfirmMessage"
         ),
         new RuleExistPage(this.App, this.idBase + "_ruleActionExistPage"),
         new RuleParentPage(this.App, this.idBase + "_ruleActionParentPage"),
         new RuleClosePopup(this.App, this.idBase + "_ruleActionClosePopup"),
         new RuleWebsite(this.App, this.idBase + "_ruleActionWebsite"),
         new RuleEmail(this.App, this.idBase + "_ruleActionEmail")
      ];

      var Rule = new ABViewRule(listActions);
      Rule.objectLoad(this.currentObject);
      Rule.formLoad(this.currentForm);
      return Rule;
   }
};
