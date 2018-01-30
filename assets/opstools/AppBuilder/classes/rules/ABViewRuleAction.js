//
// ABViewRuleAction
//
// A component that manages an individual Action in a Rule. 
//
// Each Action is responsible for figuring out when it can run, and what to do.
//
// Actions are used in the Interface Builder to present the designer an interface
// for defining the a Condition and a set of data necessary to complete the Action:
//
//
//
// In live apps, Actions are used when processing events and determining if an 
// if and what is to be performed:
//
//
//
// An Action needs to save it's current state to an objects settings, and to 
// initialize itself from those settings.
//


export default class ABViewRuleAction extends OP.Component {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {

		super(App, idBase);
		var L = this.Label;


		this.key = 'ABViewRuleAction';
		this.label = L('ab.component.ruleaction.abviewruleAction', '*generic abviewruleaction');

		this.currentObject = null;  // the current ABObject we are associated with.
		

		// Labels for UI components
		var labels = this.labels = {
			common: App.labels,
			component: {
				action: L("ab.component.form.action", "*Action"),
				when: L("ab.component.form.when", "*When"),
				values: L("ab.component.form.values", "*Values")
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = this.ids = {
			// each instance must be unique
			component: this.unique(idBase + '_component')+'_'+webix.uid(),	
			// rules: this.unique(idBase + '_rules'),

			// action: this.unique(idBase + '_action'),
			// when: this.unique(idBase + '_when'),

			// values: this.unique(idBase + '_values'),
			// set: this.unique(idBase + '_set')

		};


		this.ui = {};


		// for setting up UI
		this.init = (options) => {
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}
		};

		// internal business logic 
		var _logic = this._logic = {

			callbacks: {
				onDelete: function () { console.warn('NO onDelete()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},

		}

	}


	// fields()
	// Return the list of fields we are able to update.
	// @return {array} of querybuilder field definitions: 
	//					[
	// 						{ id:"fname",   value:"First Name", type:"string" },
	//					    { id:"lname",   value:"Last Name",  type:"string" },
	//					    { id:"age",     value:"Age",        type:"number" },
	//					    { id:"bdate",   value:"Birth Date", type:"date" }
	//					]
	fields() {
		console.error('!!! ABViewRuleAction.fields() should be overridden by child object.');
		return [];
	}


	// objectLoad
	// save the current object this Action is associated with.
	objectLoad(object) {
		this.currentObject = object;
	}



}