//
// ABViewRuleActionFormRecordRuleInsertConnected
//
// An action that allows you to insert a connected object. 
//
// NOTE: this is very similar to the Update Connected Rule, so we subclass that one and
// modify it to only Insert data.
//
//
import UpdateConnected from "./ABViewRuleActionFormRecordRuleUpdateConnected"


//// LEFT OFF HERE:
// - finish up .process() command
//		- Question: API: ABModelController : does it handle related data on an update/create ? How?



export default class ABViewRuleActionFormRecordRuleInsertConnected extends UpdateConnected {

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


		this.key = 'ABViewRuleActionFormRecordRuleInsertConnected';
		this.label = L('ab.component.ruleaction.insertConnectedObject', '*Insert Connected Object');

	}



	/**
	 * valueDisplayChooser
	 * Our Values Display is a Select Box with a choice of connected fields.
	 * Once a field is chosen, then we display the Updater form.
	 * @param {string}  idBase  a unique webix id to base our sub components on.
	 */
	valueDisplayChooser(idBase) {

		var Component = super.valueDisplayChooser(idBase);

		// in our case, there are no additional QB conditions:
		// so overwrite the .showQBIfNeeded() routine to not show anything:
		Component._logic.showQBIfNeeded = function() {};

		return Component;
	}



	/**
	 * queryBuilderDisplay
	 * override our parent .queryBuilderDisplay to not create a new .objectQB
	 * @return {null} 
	 */
	queryBuilderDisplay() {

		return null;	
	}



	/**
	 * process
	 * gets called when a form is submitted and the data passes the Query Builder Rules.
	 * @param {obj} options
	 *				options.data : {obj} the key=>value of the data just entered by the form
	 *				options.form : {ABViewForm} the Form object that is processing this rule
	 * @return {Promise}
	 */
	process(options) {

		// prepare .valueRules
		this.valueRules = this.valueRules || {};
		this.valueRules.fieldOperations = this.valueRules.fieldOperations || [];

		// get connected object
		var connObj = this.connectedObject();
		var model = connObj.model();

		var connectionField = this.selectedField();

		var condition = null;	// our lookup condition


		// determine our connection type
			// "one" type of connection
				// if my connectionField is the source
					// this field contains the .id of the newly inserted object
					// so create the object,
					// and update this connection field with it's .id

				// else 

					// the new object needs to contain my .id in it's field
					// add my id to the data to store
					// create the object

			// "many" type of connection
				// M:1
				// if linkViaType == one, then the new object needs to contain my .id in it's field
				// same as 1:1,  ! source


				// else

					// M:N



		// perform the update/insert



	}


	/**
	 * toSettings
	 * return an object that represents the current state of this Action
	 * @return {obj} 
	 */
	toSettings() {

		// settings: {
		// 	selectedFieldID: 'guid',
		//	valueRules:{}		// from ABViewRuleActionObjectUpdater
		// }

		// let our parent store our QB settings
		var settings = super.toSettings();

		// we don't use .qpCondition
		delete settings.qbCondition


		return settings;
	}

}