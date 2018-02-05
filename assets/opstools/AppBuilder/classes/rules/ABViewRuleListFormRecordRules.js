//
// ABViewRuleListFormRecordRules
//
// A component that is responsible for displaying the specific list of Record
// Rules for a form.
//
import ABViewRuleList from "./ABViewRuleList"
import ABViewRule from "./ABViewRule"

import RoleUpdateExisting from "./ruleActions/ABViewRuleActionFormRecordRuleUpdate"
import RoleInsertConnected from "./ruleActions/ABViewRuleActionFormRecordRuleInsertConnected"

export default class ABViewRuleListFormRecordRules extends ABViewRuleList {

	/**
	 * @param {object} App 
	 *      ?what is this?
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor() {

		var settings = {
			labels: {
				header: "ab.component.form.recordRule", 
				headerDefault: "*Record Rules"
			}
		}
		super(settings);
		var L = this.Label;

	}


	// must return the actual Rule object.
	getRule () {

		var listActions = [
			new RoleUpdateExisting(this.App, this.idBase+'_ruleActionUpdate'),
			new RoleInsertConnected(this.App, this.idBase+'_ruleActionInsert')
			// new ABViewRuleActionFormRecordUpdateExisting(),
			// new ABViewRuleActionFormRecordInsertConnected(),
			// new ABViewRuleActionFormRecordUpdateConnected()
		]

		var Rule = new ABViewRule(listActions);
		Rule.objectLoad(this.currentObject);
		return Rule;
	}

}