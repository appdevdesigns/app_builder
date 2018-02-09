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


export default class ABViewRuleAction {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor() {

		this.key = 'ABViewRuleAction';

		this.queryObject = null;  // the current ABObject we use to create QueryBuilder information.

		this.queryRules = {};	// default set of rules for the Query Builder condition 

		this.valueRules = {};   // the initial Value Rules for this Action
								// The Action Subclass defines what this {} is.
	}


	component(App, idBase) {

		this.App = App;
		this.idBase = idBase;

		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		this.label = L('ab.component.ruleaction.abviewruleAction', '*generic abviewruleaction');


		// Labels for UI components
		var labels = this.labels = {
			common: App.labels,
			component: {
				action: L("ab.component.form.action", "*Action"),
				when: L("ab.component.form.when", "*When"),
				values: L("ab.component.form.values", "*Values")
			}
		};

		function myUnique(key) {
			return App.unique(idBase + '_' + key)
		}

		// internal list of Webix IDs to reference our UI components.
		var ids = this.ids = {
			// each instance must be unique
			component: myUnique('component')+'_'+webix.uid(),	
		};


		this._ui = null;		// internally track our UI Component value Rules


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



	// condition
	// Return the querybuilder setup structure for this Action.
	// @return {array}  of querybuilder setup 
	//					[
	//						{rules},
	//						[fields]
	//					]
	condition () {
		return [ this.conditionRules(), this.conditionFields() ];
	}



	component (App, idBase) {
		this.App = App;
		this.idBase = idBase;
	}


	// stashCondition
	// capture the current set of rules provided by the QB object.
	// This doesn't guarantee these will be saved to the App settings.  
	// Instead it is a temporary stash. Only the selected Action's 
	// values will be persisited to the App settings.
	// @param {obj/Array} rules  The QueryBuilder rule value returned from 
	//							 .getValue()
	//							 note: it is the first entry .getValue()[0]
	// 
	stashCondition(rules) {

		// check to see if they sent us the raw QueryBuilder values and only
		// pull off the rules if they did
		if (Array.isArray(rules)) {
			rules = rules[0];
		}

		// sanity check on glue value: don't update if null or not given.
		if (rules) {

			// sometimes .glue is undefined  so default to 'and'
			if (rules.glue != 'or') rules.glue = 'and';

			this.queryRules = rules;
		}

	}


	// conditionFields()
	// Return the list of fields we are able to update.
	// @return {array} of querybuilder field definitions: 
	//					[
	// 						{ id:"fname",   value:"First Name", type:"string" },
	//					    { id:"lname",   value:"Last Name",  type:"string" },
	//					    { id:"age",     value:"Age",        type:"number" },
	//					    { id:"bdate",   value:"Birth Date", type:"date" }
	//					]
	conditionFields() {
		
		var fieldTypes = ['string', 'number', 'date'];

		var currFields = [];

		if (this.queryObject) {
			this.queryObject.fields().forEach((f)=>{

				if (fieldTypes.indexOf(f.key) != -1) {

					// NOTE: the .id value must match the obj[.id]  in the data set
					// so if your object data looks like:
					// 	{
					//		name_first:'Neo',
					//		name_last: 'The One'
					//  },
					// then the ids should be:
					// { id:'name_first', value:'xxx', type:'string' }
					currFields.push({
						id: f.columnName,
						value: f.label,
						type: f.key
					});
				}
			})
		}

		return currFields;
	}


	// conditionRules()
	// Return the current rule definition object for this Action.
	// @return {obj} 
	conditionRules() {
		return this.queryRules;
	}


	// objectLoad
	// save the current object this Action is associated with.
	objectLoad(object) {
// this.currentObject = object;				// DO WE NEED THIS?
		this.queryObjectLoad(object);
	}


	// objectLoad
	// save the current object this Action is associated with.
	queryObjectLoad(object) {
		this.queryObject = object;
	}


	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	// @return {Promise}
	process(options) {
		console.error('!!! ABViewRuleAction.process() should be overridden by its child class.');
		return new Promise( (resolve, reject) => {
			reject(new Error('ABViewRuleAction.process() should be overridden by its child class.'));
		})
	}

	// valueDisplay
	// create the form to collect the specific data this Action needs to function.
	// @param {string} webixID  the $$(webixID) of the area to insert our display.
	valueDisplay( webixID ) {
		return this.valueDisplayComponent(webixID);
	}


	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {

		return this._ui = {
			ui: {
				template:"ABViewRuleAction.valueDisplayComponent"
			},
			init:(data)=>{
				console.error("!!! ABViewRuleAction.valueDisplayComponent() should be overridden.");
				console.warn(" --> passed in data:", data);
			}
		}
	}


	// fromSettings
	// initialize this Action from a given set of setting values.
	// @param {obj}  settings
	fromSettings(settings) {
		// settings: {
		//	valueRules:{}
		// }
		settings = settings || {};
		this.valueRules = settings.valueRules || {};

	}


	// toSettings
	// return an object that represents the current state of this Action
	// @return {obj}
	toSettings() {
		var settings = {};

		// require the child to insert the valueRules
		return settings;
	}

}