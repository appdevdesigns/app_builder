//
// ABViewRule
//
// A component that manages an individual Rule in a Rule list. 
//
// Each rule can manage a set of given Actions.  For each Rule, one Action
// can be chosen, A condition for when that action is executed, and then 
// inputs for any additional data required by that action.
//
// Rules are used in the Interface Builder to present the designer an interface
// for defining the Action+Condition:
//
//
//
// In live apps, Rules are used when processing events and determining if an 
// action is to be performed:
//
//
//
// A Rule needs to save it's current state to an objects settings, and to 
// initialize itself from those settings.
//


export default class ABViewRule {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(listActions) {



		this.listActions = listActions || []; 	// the list of Actions this Rule manages

		this.actionDropList = [];				// the Webix UI droplist
		this.listActions.forEach((a) => {
			this.actionDropList.push({ id:a.key, value: a.label })
		})

		this.selectedAction = null;				// the currently selected Action.key 
		if (this.actionDropList.length > 0) {
			this.selectedAction = this.actionDropList[0].id;
		}

		this.removable = true;					// can I delete this rule?

		this.currentObject = null;				// What ABObject is this associated with
												// NOTE: this is important for Actions.
	
		this.currentForm = null;
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
				action: L("ab.component.form.action", "*Action"),
				when: L("ab.component.form.when", "*When"),
				values: L("ab.component.form.values", "*Values")
			}
		};


		// this is different because multiple instances of this View can be displayed
		// at the same time.  So make each instance Unique:
		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			// return this.unique(idBase + key ) + '_' + uniqueInstanceID;
			return idBase + '_' + key  + '_' + uniqueInstanceID;
		}


		// internal list of Webix IDs to reference our UI components.
		var ids = this.ids = {

			// each instance must be unique
			component: myUnique('component'),	
			
			queryBuilder: myUnique('queryBuilder'),  

			valueDisplay: myUnique('valueArea'),

		};


		this.ui = this._generateUI();


		// for setting up UI
		this.init = (options) => {
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			// make sure the current Action's value display is initialized:
			var Action = this.currentAction();
			if (Action) {

				Action.component(this.App, this.idBase);
				var comp = Action.valueDisplay(ids.valueDisplay);

				_logic.replaceValueDisplay(comp);
				
				// webix.ui(comp.ui, $$(this.ids.valueDisplay));
				comp.init();
			}

		};

		// internal business logic 
		var _logic = this._logic = {

			callbacks: {
				onDelete: function () { console.warn('NO onDelete()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},


			queryBuilderRules: () => {
				var QB = $$(ids.queryBuilder);
				return QB.getValue();
			},


			replaceValueDisplay:(component) => {

				// remove current content area:
				var $ValueDisplay = $$(this.ids.valueDisplay);
				if (!$ValueDisplay) return;

				var children = $ValueDisplay.getChildViews();
				children.forEach((c)=>{
					$ValueDisplay.removeView(c);
				})

				$ValueDisplay.addView(component.ui);
			},


			selectAction:(newValue, oldVal) => {

				var QB = $$(ids.queryBuilder);

				// bonus:  save current state of previous Action
				var prevAction = this.getAction(oldVal);
				if (prevAction) {
					prevAction.stashCondition(QB.getValue());
				}

				// now switch to the new Action
				this.selectedAction = newValue;
				var currAction = this.currentAction();
				if (currAction) {

					// reset Condition filters.
					QB.setValue(currAction.condition());

					// have Action display it's values form
					currAction.component(this.App, this.idBase);
					var component = currAction.valueDisplay(ids.valueDisplay);
					_logic.replaceValueDisplay(component);
					component.init()
					// currAction.valueDisplay(ids.valueDisplay);
				}

			}

		}

	}


	// not intended to be called externally
	_generateUI () {


		return {
			id: this.ids.component,
			view: "layout",
			css: "ab-component-form-rule",

// this should be a CSS setting: App.config.xxxx
width: 680,
			rows: [
				{
					view: "template",
					css: "ab-component-form-rule",
					template: '<i class="fa fa-trash ab-component-remove"></i>',
					height: 30,
					hidddatasourceen: this.removable == false,
					onClick: {
						"ab-component-remove":  (e, id, trg) => {
							this._logic.callbacks.onDelete(this);
						}
					}
				},
				// Action
				{
					view: "richselect",
					// for: "action",
					label: this.labels.component.action,
					labelWidth: this.App.config.labelWidthLarge,
					value: this.selectedAction,
					options: this.actionDropList,
					on: {
						onChange: (newVal, oldVal) => {
							this._logic.selectAction(newVal, oldVal);
						}
					}
				},
				// When
				{
					cols: [
						{
							view: 'label',
							css: 'ab-text-bold',
							label: this.labels.component.when,
							width: this.App.config.labelWidthLarge
						},
						{
						    view: "querybuilder",
						    id: this.ids.queryBuilder,
						    fields: this.conditionFields()
						}
					]
				},
				// Values
				{
					for: "values",
					cells: [
						{
							view: 'layout',
							cols: [
								{
									view: 'label',
									label: this.labels.component.values,
									css: 'ab-text-bold',
									width: this.App.config.labelWidthLarge
								},
								{
									id: this.ids.valueDisplay,
									view: 'layout',
									rows: [
										{ label: ' ABViewRule: This should be the Set Area', css: 'ab-text-bold', height:30 }
									]
								}
							]
						},
					]
				}
			]
		}
	}


	// return the QueryBuilder fields data for the currently selected Action.
	conditionFields () {

		var fields = [];

		var selectedAction = this.currentAction();
		if (selectedAction) {
			fields = selectedAction.conditionFields();
		}

		return fields;
	}


	currentAction(){
		return  this.getAction(this.selectedAction);
	}

	getAction(key) {
		return this.listActions.filter((a) => {
			return a.key == key;
		})[0];
	}


	objectLoad(object) {
		this.currentObject = object;
		this.listActions.forEach((a) => {
			a.objectLoad(object);
		})

		// regenerate our UI when a new object is loaded.
		if (this.ids) {
			this.ui = this._generateUI();
		}
	}

	
	formLoad(form) {
		this.currentForm = form;
		this.listActions.forEach((a)=>{
			a.formLoad(form);
		})
	}


	// process
	// Take the provided data and process this rule
	// @param {obj} options
	// @return {Promise}
	process(options) {

		var currentAction = this.currentAction();

		var id = "hiddenQB_"+webix.uid();

		// if our data passes the QueryRules then tell Action to process
		var ui = {
			id:id,
			hidden:true,
			view:'querybuilder'
		}
		var hiddenQB = webix.ui(ui);

		hiddenQB.setValue(currentAction.condition());

		var QBHelper = hiddenQB.getFilterHelper();
		var isValid = QBHelper(options.data);

		hiddenQB.destructor();	// remove the QB 
		
		if (isValid) {
			return currentAction.process(options);
		} else {

			// else just resolve and continue on
			return new Promise( (resolve, reject) => {
				resolve();
			})
		}

	}



	fromSettings (settings) {
		settings = settings || {};

		if (settings.selectedAction) {

			// store our Query Rules
			this.selectedAction = settings.selectedAction;
			var selectedAction = this.currentAction();
			selectedAction.stashCondition(settings.queryRules || {} );

			// if our UI components are present, populate them properly:
			if (this.ids) {

				// Trigger our UI to refresh with this selected Action:
				// NOTE: this also populates the QueryBuilder
				this._logic.selectAction(this.selectedAction);
			}

			// now continue with setting up our settings:
			selectedAction.fromSettings(settings.actionSettings);
		}
	}


	toSettings() {
		var settings = {};

		if (this.selectedAction) {
			settings.selectedAction = this.selectedAction;
			settings.queryRules = this._logic.queryBuilderRules();
			settings.actionSettings = this.currentAction().toSettings();
		}
		
		return settings;
	}

}