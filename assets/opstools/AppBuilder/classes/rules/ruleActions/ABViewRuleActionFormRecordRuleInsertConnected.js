//
// ABViewRuleActionFormRecordRuleInsertConnected
//
// An action that allows you to insert a connected object. 
//
//
import ABViewRuleAction from "../ABViewRuleAction"


export default class ABViewRuleActionFormRecordRuleInsertConnected extends ABViewRuleAction {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {

		super(App, idBase);
		var L = this.Label;


		this.key = 'ABViewRuleActionFormRecordRuleInsertConnected';
		this.label = L('ab.component.ruleaction.abviewruleActionFormRecordRuleInsertConnected', '*Insert Connected Object');


		this.currentObject = null;  // the object this Action is tied to.


		// Labels for UI components
		// var labels = this.labels = {
		// 	common: App.labels,
		// 	component: {
		// 		// action: L("ab.component.form.action", "*Action"),
		// 		// when: L("ab.component.form.when", "*When"),
		// 		// values: L("ab.component.form.values", "*Values")
		// 	}
		// };

		// // internal list of Webix IDs to reference our UI components.
		// var ids = this.ids = {
		// 	// each instance must be unique
		// 	component: this.unique(idBase + '_component')+'_'+webix.uid(),	
		// 	// rules: this.unique(idBase + '_rules'),

		// 	// action: this.unique(idBase + '_action'),
		// 	// when: this.unique(idBase + '_when'),

		// 	// values: this.unique(idBase + '_values'),
		// 	// set: this.unique(idBase + '_set')

		// };


		// this.ui = {};


		// // for setting up UI
		// this.init = (options) => {
		// 	// register callbacks:
		// 	for (var c in _logic.callbacks) {
		// 		_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		// 	}
		// };

		// // internal business logic 
		// var _logic = this._logic = {

		// 	callbacks: {
		// 		onDelete: function () { console.warn('NO onDelete()!') },
		// 		onSave: function (field) { console.warn('NO onSave()!') },
		// 	},

		// }

	}


	conditionFields() {
		
		var fieldTypes = ['string', 'number', 'date'];

		var currFields = [];

		// if (this.currentObject) {
		// 	this.currentObject.fields().forEach((f)=>{

		// 		if (fieldTypes.indexOf(f.key) != -1) {
		// 			currFields.push({
		// 				id: f.id,
		// 				value: f.label,
		// 				type: f.key
		// 			});
		// 		}
		// 	})
		// }

		return currFields;

// if (this.currentObject) {
// console.warn(' ... ABView.fields(): ', this.currentObject.fields() );
// }

// return [
//     { id:"fname",   value:"First Name", type:"string" },
//     { id:"lname",   value:"Last Name",  type:"string" },
//     { id:"age",     value:"Age",        type:"number" },
//     { id:"bdate",   value:"Birth Date", type:"date" }
// ];
	}


	// setObject(object) {
	// 	this.currentObject = object;
	// }



}