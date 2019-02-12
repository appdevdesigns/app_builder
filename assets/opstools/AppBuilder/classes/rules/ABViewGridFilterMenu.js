
import ABViewGridFilterRule from "./ABViewGridFilterRule"

export default class ABViewGridFilterMenu {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor() {

		this.filterRulesList = [];
		this.currentObject = null;
		this.filterOption = null;
		this.fieldOption = null;
		this.isLoadAll = false;

	}


	/**
	 * @method component
	 * initialize the UI display for this popup editor.
	 * @param {obj} App  The common UI App object shared among our UI components
	 * @param {string} idBase A unique Key used the the base of our unique ids
	 */
	component(App, idBase) {

		this.App = App;
		this.idBase = idBase;

		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		this.currentForm = null;

		var labels = this.labels = {
			common: App.labels,
			component: {
				header: L("ab.component.grid.filterMenu", "*Filter Menu"),	
				addNewFilter: L("ab.components.grid.addNewFilter", "*Add new filter"),
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = this.ids = {
			component: idBase + '_component',
			filterRules: idBase + '_rules',
			filterRulesScrollview: idBase + '_filterRulesScrollview',
			
			filterOptionRadio: idBase + '_filterOptionRadio',
			filterUser: idBase + '_filterUser',
			filterGlobal: idBase + "_filterGlobal",
			filterMenuLayout: idBase + '_filterMenuLayout',

			needLoadAllLabel: idBase + '_needLoadAll',

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
					{ view: "label", label: labels.component.header },
				]
			},
			body: {
				type: "form",
				rows: [
					{
						view: "radio",
						id: ids.filterOptionRadio, 
						value: 0, 
						options:[
							{"id": 0, "value": "Do not Allow User filters"},
							{"id": 1, "value": "Enable User filters"},
							{"id": 2, "value": "Use a filter menu"},
							{"id": 3, "value": "Use a global filter input"}
						],
						vertical: true,
						label: "Filter Option",
						labelWidth: App.config.labelWidthLarge,
						on: {
							'onChange': (newValue, oldValue) => {
								_logic.setFilterOption(newValue);
							}
						}
					},

					{
						view: "radio",
						id: ids.filterGlobal,
						hidden: true,
						vertical: true,
						label: "Show",
						labelWidth: App.config.labelWidthLarge,
						options: [
							{ id: "default", value: "All matching records" },
							{ id: "single", value: "Single records only"}
						]
					},

					{
						view: "radio",
						vertical: true,
						id: ids.filterUser,
						hidden: true,
						value: "toolbar",
						label: "Display",
						labelWidth: App.config.labelWidthLarge,
						options: [
							{ id: "toolbar", value: "Toolbar" },
							{ id: "form", value: "Form"}
						]
					},

					{
						view: "layout",
						id: ids.filterMenuLayout,
						hidden: true,
						rows: [
							{
								css: { 'padding-bottom' : 10 },
								cols: [
									{
										view: "button",
										icon: "plus",
										type: "iconButton",
										label: labels.component.addNewFilter,
										width: 150,
										click: () => {
											this.addFilterRule();
										},
									},
									{
										view: "label",
										label: "*need \"LoadAll\" from datasource",
										css: { 'color' : 'red' },
										id: ids.needLoadAllLabel,
										hidden: true,
									},
									{ fillspace: true }
								]
							},
							{
								view: "scrollview",
								id: ids.filterRulesScrollview,
								scroll: "xy",
								body: {
									view: "layout",
									id: ids.filterRules,
									margin: 20,
									padding: 10,
									rows: []
								}
							},
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
							},
							{ fillspace: true },
						]
					}
				]
			}
		};

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

				this.filterOption = JSON.parse($$(ids.filterOptionRadio).getValue());
				var results = this.toSettings();

				_logic.callbacks.onSave(results);
				_logic.hide();
			},

			callbacks: {
				onCancel: function () { console.warn('NO onCancel()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},


			hide: function () {
				$$(ids.component).hide();
			},

			show: function () {
				$$(ids.component).show();
				if (!this.isLoadAll) {
					$$(ids.needLoadAllLabel).show();
				} 
				else {
					$$(ids.needLoadAllLabel).hide();
				}
			},

			setFilterOption: function (value) {

				switch(JSON.parse(value)) {
					case 1: // Enable User filters
						$$(ids.filterMenuLayout).hide();
						$$(ids.filterGlobal).hide();
						$$(ids.filterUser).show();
						break;
					case 2: // Use a filter menu
						$$(ids.filterUser).hide();
						$$(ids.filterGlobal).hide();
						$$(ids.filterMenuLayout).show();
						break;
					case 3: // Use a filter menu
						$$(ids.filterUser).hide();
						$$(ids.filterMenuLayout).hide();
						$$(ids.filterGlobal).show();
						break;
					default:
						$$(ids.filterUser).hide();
						$$(ids.filterMenuLayout).hide();
						$$(ids.filterGlobal).hide();
						break;
				}
			},

		};


		this.show = _logic.show;
		this.setValue = _logic.setValue;
	}


	/**
	 * @method addFilterRule
	 * Instantiate a new Rule in our list.
	 * @param {obj} settings  The settings object from the Rule we created in .toSettings()
	 */
	addFilterRule(settings) {

		var Rule = this.getRule();
		this.filterRulesList.push(Rule);


		// if we have tried to create our component:
		if (this.ids) {
			
			// if our actually exists, then populate it:
			var RulesUI = $$(this.ids.filterRules);
			if (RulesUI) {

				// make sure Rule.ui is created before calling .init()
				Rule.component(this.App, this.idBase);  // prepare the UI component
				var viewId = RulesUI.addView(Rule.ui);
				Rule.showQueryBuilderContainer();
				Rule.init({
					onDelete: (deletedRule) => {

						$$(this.ids.filterRules).removeView(Rule.ids.component);

						var index = this.filterRulesList.indexOf(deletedRule);
					    if (index !== -1) {
					        this.filterRulesList.splice(index, 1);
					    }
					}
				});
			}
		}

		if (settings) {
			Rule.fromSettings(settings);
		}
	}


	/**
	 * @method fromSettings
	 * Create an initial set of default values based upon our settings object.
	 * @param {obj} settings  The settings object we created in .toSettings()
	 */
	fromSettings (settings) {

		// clear any existing Rules:
		if (this.filterRulesList.length > 0) {
			this.filterRulesList.forEach((rule)=>{
				$$(this.ids.filterRules).removeView(rule.ids.component);
			})
		}
		this.filterRulesList = [];

		if (settings) {
			this.filterOption = JSON.parse(settings.filterOption);
			$$(this.ids.filterOptionRadio).setValue(this.filterOption);

			$$(this.ids.filterUser).setValue(settings.userFilterPosition || "toolbar");
			
			$$(this.ids.filterGlobal).setValue(settings.globalFilterPosition || "default");

			if (settings.queryRules) {
				settings.queryRules.forEach((ruleSettings)=> {
					this.addFilterRule(ruleSettings);
				});
			}
		}
	}


	/**
	 * @method objectLoad
	 * A rule is based upon a Form that was working with an Object.
	 * .objectLoad() is how we specify which object we are working with.
	 * 
	 * @param {ABObject} The object that will be used to evaluate the Rules
	 */
	objectLoad(object) {
		this.currentObject = object;
		this.fieldOption = this.conditionFields();
		this.isLoadAll = object.isLoadAll;

		//tell each of our rules about our object
		this.filterRulesList.forEach((r)=>{
			r.objectLoad(object);
		})
	}

	/**
	 * @method toSettings
	 * create a settings object to be persisted with the application.
	 * @return {array} of rule settings.
	 */
	toSettings () {
		var settings = {};
		settings.filterOption = this.filterOption;
		settings.queryRules = [];

		switch (this.filterOption) {
			case 1: 
				settings.userFilterPosition = $$(this.ids.filterUser).getValue();
				break;
			case 2:
				this.filterRulesList.forEach((r)=>{
					settings.queryRules.push(r.toSettings());
				});
				break;
			case 3:
				settings.globalFilterPosition = $$(this.ids.filterGlobal).getValue();
				break;
		}

		return settings;
	}


	getRule () {
		var FilterRule = new ABViewGridFilterRule();
		FilterRule.objectLoad(this.currentObject);

		return FilterRule;

	}

	conditionFields() {
		
		var fieldTypes = ['string', 'number', 'date'];

		var currFields = [];

		if (this.currentObject) {
			this.currentObject.fields().forEach((f)=>{

				if (fieldTypes.indexOf(f.key) != -1) {

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

}