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
	constructor() {

		super();
		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}


		this.key = 'ABViewRuleActionFormRecordRuleInsertConnected';
		this.label = L('ab.component.ruleaction.insertConnectedObject', '*Insert Connected Object');


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

	}


	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {

		if (this._ui == null) {
			this._ui = this.valueDisplayList(idBase);
		}

		return this._ui;
	}

	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	// @return {Promise}
	process(options) {

		return new Promise( (resolve, reject) => {
console.log(" Insert Connected Object .... .process() ")
resolve();

		})
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
		//	valueRules:{}
		// }

		// let our parent store our QB settings
		var settings = super.toSettings();

		settings.valueRules = this._ui.toSettings();

		return settings;
	}



}