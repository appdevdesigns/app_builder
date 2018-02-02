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
		var ids = this.ids = {
			component: idBase + '_component',
			rules: idBase + '_rules',

			action: idBase + '_action',
			when: idBase + '_when',

			values: idBase + '_values',
			set: idBase + '_set'

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

			buttonSave: () => {

				var results = this.toSettings();

				_logic.callbacks.onSave(results);
				_logic.hide();
			},

			callbacks: {
				onCancel: function () { console.warn('NO onCancel()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},


			addRule: (settings) => {

				var Rule = this.getRule();
				this.listRules.push(Rule);

				// make sure Rule.ui is created before calling .init()
				var viewId = $$(ids.rules).addView(Rule.ui);

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


				if (settings) {
					Rule.fromSettings(settings);
				}
				

				return viewId;
			},

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
			}

		};



		// Expose any globally accessible Actions:
		this.actions({
		});

		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;
		this.setValue = _logic.setValue;

	}


	// fromSettings
	// Create an initial set of default values based upon our settings object.
	// @param {obj} settings  The settings object we created in .toSettings()
	fromSettings (settings) {
		// settings: [
		//  { rule.settings },
		//  { rule.settings }
		// ]

		// clear any existing Rules:
		this.listRules.forEach((rule)=>{
			$$(this.ids.rules).removeView(rule.ids.component);
		})
		this.listRules = [];


		if (settings) {
			settings.forEach((ruleSettings)=>{
				this._logic.addRule(ruleSettings);
			})
		}
	}


	// toSettings
	// create a settings object to be persisted with the application.
	// @return {array} of rule settings.
	toSettings () {
		var settings = [];
		this.listRules.forEach((r)=>{
			settings.push(r.toSettings());
		})
		return settings;
	}


	getRule () {
		console.error('!!! ABViewRuleList.getRule() should be overridded by a child object.');
		return {};
	}

}