//
// ABViewRuleListFormRecordRules
//
// A component that is responsible for displaying the specific list of Record
// Rules for a form.
//
import ABViewRuleList from "./ABViewRuleList"
import ABViewRule from "./ABViewRule"
import ABViewRuleActionFormRecordRuleUpdate from "./ruleActions/ABViewRuleActionFormRecordRuleUpdate"


export default class ABViewRuleListFormRecordRules extends ABViewRuleList {

	/**
	 * @param {object} App 
	 *      ?what is this?
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {

		var settings = {
			labels: {
				header: "ab.component.form.recordRule", 
				headerDefault: "*Record Rules"
			}
		}
		super(App, idBase, settings);
		var L = this.Label;



	}


	// must return the actual Rule object.
	getRule () {

		var listActions = [
			new ABViewRuleActionFormRecordRuleUpdate(this.App, this.idBase+'_ruleActionUpdate')
			// new ABViewRuleActionFormRecordUpdateExisting(),
			// new ABViewRuleActionFormRecordInsertConnected(),
			// new ABViewRuleActionFormRecordUpdateConnected()
		]

		var Rule = new ABViewRule(this.App, this.idBase+'_ruleList', listActions);
		Rule.objectLoad(this.currentObject);
		return Rule;
	}

}