//
// ABViewRuleList
//
// A UI component that is responsible for displaying a list of current "Rules" 
// for a given purpose.  Some examples are the 
//		Form -> Submit Rules, 
//		Form -> Display Rules
// 		Form -> Record Rules.
//

// ABViewRuleList is the parent object that manages displaying the common popup,
// list, adding a rule, removing rules, etc...
//
// It is intending to be subclassed by a Specific List object that will load
// up a given set of Actions for their list.
//
// When using it in the AppBuilder Interface Builder, this object provides:
// 	var PopupRecordList = new ABViewRuleList(App, idBase);
//  PopupRecordList.fromSettings(CurrentObjectDefinition.rules); // populates List with current settings defined in CurrentObjectDefinition
//  PopupRecordList.init({ onSave:()=>{}})	// displays the popup for IB
//  CurrentObjectDefinition.rules = PopupRecordList.toSettings(); // save the settings to store in json config
//
// When using on a live running App:
//  PopupRecordList = new ABViewRuleList(App, idBase);
//  PopupRecordList.fromSettings();
//	
//  onFormSubmit(data) {
//		// note: this automatically validates and runs each rule:
//		PopupRecordList.process({data:data, view:{ current ABViewForm object }})
//		.then()
//		.catch();
//  }


//// LEFT OFF HERE:
//// create ABViewRuleActionFormRecordRuleUpdate()


export default class ABViewRuleList extends OP.Component {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase, childSettings) {
		super(App, idBase);
		var L = this.Label;


		this.listRules = [];
		this.currentObject = null;

		// ensure required values:
		childSettings = childSettings || {};
		childSettings.labels = childSettings.labels || {};
		childSettings.labels.header = childSettings.labels.header || 'ab.component.form.ruleList';
		childSettings.labels.headerDefault = childSettings.labels.headerDefault || '*Rule List';


		var labels = this.labels = {
			common: App.labels,
			component: {
				header: L(childSettings.labels.header, childSettings.labels.headerDefault),	
				addNewRule: L("ab.component.form.addNewRule", "*Add new rule"),
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique(idBase + '_component'),
			rules: this.unique(idBase + '_rules'),

			action: this.unique(idBase + '_action'),
			when: this.unique(idBase + '_when'),

			values: this.unique(idBase + '_values'),
			set: this.unique(idBase + '_set')

		};

		// webix UI definition:
		this.ui = {
			view: "window",
			id: ids.component,
			modal: true,
			position: "center",
			resize: true,
			width: 700,
			height: 450,
			css: 'ab-main-container',
			head: {
				view: "toolbar",
				cols: [
					{ view: "label", label: labels.component.header }
				]
			},
			body: {
				rows: [
					{
						view: "scrollview",
						scroll: true,
						body: {
							view: "layout",
							id: ids.rules,
							margin: 20,
							rows: []
						}
					},
					{
						css: { 'background-color': '#fff' },
						cols: [
							{
								view: "button",
								icon: "plus",
								type: "iconButton",
								label: labels.component.addNewRule,
								width: 150,
								click: function () {
									_logic.addRule();
								}
							},
							{ fillspace: true }
						]
					},
					{
						css: { 'background-color': '#fff' },
						cols: [
							{ fillspace: true },
							{
								view: "button",
								name: "cancel",
								value: labels.common.cancel,
								css: "ab-cancel-button",
								autowidth: true,
								click: function () {
									_logic.buttonCancel();
								}
							},
							{
								view: "button",
								name: "save",
								label: labels.common.save,
								type: "form",
								autowidth: true,
								click: function () {
									_logic.buttonSave();
								}
							}
						]
					}
				]
			}
		};

		var _currentObject = null;
		var _rules = [];

		// for setting up UI
		this.init = (options) => {
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);
		};



		// internal business logic 
		var _logic = this._logic = {

			buttonCancel: function () {
				$$(ids.component).hide();
			},

			buttonSave: function () {

				var results = [];

				// Pull rules
				var $viewRules = $$(ids.rules).getChildViews();
				$viewRules.forEach(r => {

					results.push({
						action: r.queryView({ for: "action" }).getValue(),
						when: r.config.when.getValue(),
						values: r.config.set.getValue(),
					})

				});

				_logic.callbacks.onSave(results);
				_logic.hide();

			},

			callbacks: {
				onCancel: function () { console.warn('NO onCancel()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},

			/**
			 * @method getRuleUI
			 * get UI of rule view
			 * 
			 * @param options - {
			 *		removable: boolean
			 * }
			 * 	
			 */
			getRuleUI: (options) => {

// in ABViewRuleListFormRecordRules:
// var listActions = [
//		new ABViewRuleActionFormRecordUpdateExisting(),
//		new ABViewRuleActionFormRecordInsertConnected(),
//		new ABViewRuleActionFormRecordUpdateConnected()
// ]
// var Rule = new ABViewRule(App, idBase, listActions);
// return Rule.getUI();
console.error('!!! old ...  getRuleUI()');
return {};
				options = options || {};

				// Create "When" and "Set" UI - Set fields
				var when = new RowFilter(App, idBase);
				var set = new RowUpdater(App, idBase);

				if (_currentObject) {
					when.objectLoad(_currentObject);
					set.objectLoad(_currentObject);
				}

				var set_ui = set.ui;
				set_ui.id = ids.set;
				set_ui.width = 560;


				return {
					view: "layout",
					css: "ab-component-form-rule",
					when: when, // Store a instance of when
					set: set, // Store a instance of set
					width: 680,
					rows: [
						{
							view: "template",
							css: "ab-component-form-rule",
							template: '<i class="fa fa-trash ab-component-remove"></i>',
							height: 30,
							hidden: options.removable == false,
							onClick: {
								"ab-component-remove": function (e, id, trg) {

									var viewRule = this.getParentView();
									_logic.removeRule(viewRule);

								}
							}
						},
						// Action
						{
							view: "richselect",
							for: "action",
							label: labels.component.action,
							labelWidth: App.config.labelWidthLarge,
							value: actionOptions[0].id,
							options: actionOptions,
							on: {
								onChange: function (newVal, oldVal) {
									_logic.selectAction(newVal, this.getParentView());
								}
							}
						},
						// When
						{
							cols: [
								{
									view: 'label',
									css: 'ab-text-bold',
									label: labels.component.when,
									width: App.config.labelWidthLarge
								},
								when.ui
							]
						},
						// Values
						{
							for: "values",
							cells: [
								// Update this record
								{
									view: 'layout',
									batch: actionOptions[0].id,
									cols: [
										{
											view: 'label',
											label: labels.component.values,
											css: 'ab-text-bold',
											width: App.config.labelWidthLarge
										},
										set_ui
									]
								},
							]
						}
					]
				}

			},


			addRule: () => {

				var Rule = this.getRule();
				this.listRules.push(Rule);

				Rule.init({
					onDelete: (deletedRule) => {

						$$(ids.rules).removeView(Rule.ids.component);

						var index = this.listRules.indexOf(deletedRule);
					    if (index !== -1) {
					        this.listRules.splice(index, 1);
					    }
// save()
					}
				});
				var viewId = $$(ids.rules).addView(Rule.ui);

				return viewId;
			},

// removeRule: ($viewRule) => {
// 	$$(ids.rules).removeView($viewRule);
// },

// selectAction: (action, $viewRule) => {

// 	// Swtich the view of values
// 	$viewRule.queryView({ for: "values" }).showBatch(action);
// },

			hide: function () {
				$$(ids.component).hide();
			},

			show: function () {
				$$(ids.component).show();
			},

			objectLoad: function (object) {
				_currentObject = this.currentObject = object;

				// tell each of our rules about our object
				this.listRules.forEach((r)=>{
					r.objectLoad(object);
				})
			},

// convert to fromSettings( configSettings )
setValue: function (rules) {

	$$(ids.rules).reconstruct();

	_rules = rules || [];
	_rules.forEach(r => {

		var $viewRule = $$(_logic.addRule());

		// Select 'action'
		$viewRule.queryView({ for: "action" }).setValue(r.action);

		// Set 'when'
		$viewRule.config.when.setValue(r.when);

		// Define 'value'
		$viewRule.config.set.setValue(r.values);

		$viewRule.adjust();

	});


}

		};



		// Expose any globally accessible Actions:
		this.actions({
		});

		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;
		this.setValue = _logic.setValue;

	}


	getRule () {
		console.error('!!! ABViewRuleList.getRule() should be overridded by a child object.');
		return {};
	}

}