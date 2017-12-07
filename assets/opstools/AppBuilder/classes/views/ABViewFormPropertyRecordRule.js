import RowFilter from '../RowFilter'

export default class ABViewFormPropertyRecordRule extends OP.Component {

	/**
	 * @param {object} App 
	 *      ?what is this?
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {
		super(App, idBase);
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				header: L("ab.component.form.recordRule", "*Record Rules"),
				addNewRule: L("ab.component.form.addNewRule", "*Add new rule"),

				action: L("ab.component.form.action", "*Action"),
				actionOption1: L("ab.component.form.recordrule.action.updateThisRecord", "*Update this record"),
				// actionOption2: L("ab.component.form.recordrule.action.", "*"),
				// actionOption3: L("ab.component.form.recordrule.action.", "*"),
				// actionOption4: L("ab.component.form.recordrule.action.", "*"),
				// actionOption5: L("ab.component.form.recordrule.action.", "*"),

				when: L("ab.component.form.when", "*When"),
				values: L("ab.component.form.values", "*Values"),
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			rules: this.unique('rules'),

			action: this.unique('action'),
			when: this.unique('when'),
			values: this.unique('values')

		};

		var actionOptions = [
			{ id: "updateThisRecord", value: labels.component.actionOption1 }
		];

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
					{ view: "label", label: L("ab.component.form.recordrule", "*Record Rules") }
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

				var $viewRules = $$(ids.rules).getChildViews();
				$viewRules.forEach(r => {

					var $whenContainer = r.$$(ids.when);

					// TODO
					// var valueViewId = r.$$(ids.actionValue).getActiveId();
					// var value = r.$$(ids.actionValue).queryView({ id: valueViewId }).getValue();
					var value = null;

					results.push({
						action: r.$$(ids.action).getValue(),
						when: r.config.when.getValue($whenContainer),
						value: value,
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

				options = options || {};

				// Create "When" UI - Set fields
				var when = new RowFilter(App, idBase);
				if (_currentObject)
					when.fieldsLoad(_currentObject.fields());

				var when_ui = when.ui;
				when_ui.id = ids.when;

				return {
					view: "layout",
					css: "ab-component-form-rule",
					when: when, // Store a instance of when
					isolate: true,
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
							id: ids.action,
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
								when_ui
							]
						},
						// Values
						{
							id: ids.values,
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
										{
											view: 'layout',
											rows: []
										}
									]
								},
							]
						}
					]
				}

			},

			addRule: () => {

				var ruleUI = _logic.getRuleUI();

				var viewId = $$(ids.rules).addView(ruleUI);

				var $whenContainer = $$(viewId).$$(ids.when);

				// Add a filter to default
				ruleUI.when.addNewFilter($whenContainer);

				return viewId;
			},

			removeRule: (viewRule) => {
				$$(ids.rules).removeView(viewRule);
			},

			selectAction: (action, $viewRule) => {

				// Swtich the view of values
				$viewRule.$$(ids.values).showBatch(action);
			},

			hide: function () {
				$$(ids.component).hide();
			},

			show: function () {
				$$(ids.component).show();
			},

			objectLoad: function (object) {
				_currentObject = object;
			},

			setValue: function (rules) {

				$$(ids.rules).reconstruct();

				_rules = rules || [];
				_rules.forEach(r => {

					// Select 'action'
					var $viewRule = $$(_logic.addRule());
					$viewRule.$$(ids.action).setValue(r.action);

					// Set 'when'
					var $viewWhen = $viewRule.$$(ids.when);
					$viewRule.config.when.setValue(r.when, $viewWhen);

					// Define 'value'

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

}