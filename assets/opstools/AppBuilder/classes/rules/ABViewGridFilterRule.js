
import ObjectQueryBuilder from "./ABViewQueryBuilderObjectFieldConditions"


export default class ABViewGridFilterRule {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor() {

		this.removable = true;					// can I delete this rule?

		this.currentObject = null;				// What ABObject is this associated with
												// NOTE: this is important for Actions.
		this.objectQB = null;					// The QueryBuilder (QB) object 

		this.ruleName = null;

	}


	component(App, idBase) {
		this.App = App;
		this.idBase = idBase;

		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}


		var labels = this.labels = {
			common: App.labels,
			component: {
				ruleName: L("ab.component.grid.ruleNamePlaceholder", "*Rule Name"),
				ruleNamePlaceholder: L("ab.component.grid.ruleNamePlaceholder", "*Name")
			}
		};


		// this is different because multiple instances of this View can be displayed
		// at the same time.  So make each instance Unique:
		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			return idBase + '_' + key  + '_' + uniqueInstanceID;
		}


		// internal list of Webix IDs to reference our UI components.
		var ids = this.ids = {

			// each instance must be unique
			component: myUnique('component'),	
			
			queryBuilder: myUnique('queryBuilder'),  

			ruleName: myUnique('ruleName'),

		};

		this.objectQB.component(this.App, this.idBase);
		this.ui = this._generateUI();


		// for setting up UI
		this.init = (options) => {
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			this.objectQB.init();

		};

		// internal business logic 
		var _logic = this._logic = {

			callbacks: {
				onDelete: function () { console.warn('NO onDelete()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},

		}

	}


	// not intended to be called externally
	_generateUI () {


		return {
			id: this.ids.component,
			view: "layout",
			css: "ab-component-form-rules",
			padding: 20,

			type: "line",
			rows: [
				{
					view: "template",
					css: "ab-component-form-rules-delete",
					template: '<i class="fa fa-trash ab-component-remove"></i>',
					height: 30,
					borderless: true,
					hidddatasourceen: this.removable == false,
					onClick: {
						"ab-component-remove":  (e, id, trg) => {
							this._logic.callbacks.onDelete(this);
						}
					}
				},
				{
					view: "text",
					label: this.labels.component.ruleName,
					placeholder: this.labels.component.ruleNamePlaceholder,
					id: this.ids.ruleName,
					
				},
				
				this.objectQB.ui,


			]
		}
	}


	objectLoad(object) {
		this.currentObject = object;

		if (this.objectQB == null)
			this.objectQB = new ObjectQueryBuilder();

		this.objectQB.objectLoad(object);
		

		// regenerate our UI when a new object is loaded.
		if (this.ids) {
			this.ui = this._generateUI();
		}
	}

	fromSettings (settings) {
		settings = settings || {};

		// if our UI components are present, populate them properly:
		if (this.ids) {

			// Trigger our UI to refresh with this selected Action:
			// NOTE: this also populates the QueryBuilder
			$$(this.ids.ruleName).setValue(settings.ruleName);

			//Prevent from null queryRule
			if (settings.queryRules &&
				settings.queryRules.rules &&
				settings.queryRules.rules[0]) {
				this.objectQB.setValue(settings.queryRules);
			}
		}
	}


	toSettings() {
		var settings = {};

		settings.queryRules = this.objectQB.getValue();
		settings.ruleName = $$(this.ids.ruleName).getValue();

		return settings;
	}

	showQueryBuilderContainer() {
		this.objectQB.showQueryBuilderContainer();
	}

	conditionFields() {

		return this.objectQB.conditionFields();

	}

}
