//
// ABViewRuleActionFormRecordRuleUpdate
//
// An action that allows you to update fields on an object that was currently 
// Added/Updated. 
//
//
const ABViewRuleActionObjectUpdater = require("./ABViewRuleActionObjectUpdater");


module.exports = class ABViewRuleActionFormRecordRuleUpdate extends ABViewRuleActionObjectUpdater {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase, currentForm) {

		super(App, idBase, currentForm);
		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}


		this.key = 'ABViewRuleActionFormRecordRuleUpdate';
		this.label = L('ab.component.ruleaction.updateRecord', '*Update Record');

	}


}