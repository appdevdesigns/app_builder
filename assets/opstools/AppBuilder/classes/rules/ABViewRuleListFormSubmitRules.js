//
// ABViewRuleListFormSubmitRules
//
// A component that is responsible for displaying the specific list of Submit
// Rules for a form.
//
import ABViewRuleList from "./ABViewRuleList"
import ABViewRule from "./ABViewRule"

import RoleConfirmMessage from "./ruleActions/ABViewRuleActionFormSubmitRuleConfirmMessage"
import RuleExistPage from "./ruleActions/ABViewRuleActionFormSubmitRuleExistPage"
import RuleParentPage from "./ruleActions/ABViewRuleActionFormSubmitRuleParentPage"
import RuleWebsite from "./ruleActions/ABViewRuleActionFormSubmitRuleWebsite"

export default class ABViewRuleListFormSubmitRules extends ABViewRuleList {

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
		}
		super(settings);
		var L = this.Label;

	}


	// must return the actual Rule object.
	getRule() {

		var listActions = [
			new RoleConfirmMessage(this.App, this.idBase + '_ruleActionConfirmMessage'),
			new RuleExistPage(this.App, this.idBase + '_ruleActionExistPage'),
			new RuleParentPage(this.App, this.idBase + '_ruleActionParentPage'),
			new RuleWebsite(this.App, this.idBase + '_ruleActionWebsite')
		];

		var Rule = new ABViewRule(listActions);
		Rule.objectLoad(this.currentObject);
		return Rule;
	}

}