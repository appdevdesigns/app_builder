import RowFilter from '../RowFilter'

export default class ABViewFormPropertySubmitRule extends OP.Component {

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
				header: L("ab.component.form.submitRule", "*Submit Rules"),
				addNewRule: L("ab.component.form.addNewRule", "*Add new rule"),

				action: L("ab.component.form.action", "*Action"),
				actionOption1: L("ab.component.form.submitrule.action.message", "*Show a confirmation message"),
				actionOption2: L("ab.component.form.submitrule.action.parentPage", "*Redirect to the parent page"),
				actionOption3: L("ab.component.form.submitrule.action.existsPage", "*Redirect to an existing page"),
				actionOption4: L("ab.component.form.submitrule.action.website", "*Redirect to another website URL"),
				actionOption5: L("ab.component.form.submitrule.action.newPage", "*Redirect to a new child page"),

				when: L("ab.component.form.when", "*When"),
				message: L("ab.component.form.message", "*Message"),
				page: L("ab.component.form.page", "*Page"),
				redirect: L("ab.component.form.redirect", "*Redirect"),
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			rules: this.unique('rules')
		};


		var actionOptions = [
			{ id: "message", value: labels.component.actionOption1 },
			{ id: "parentPage", value: labels.component.actionOption2 },
			{ id: "existsPage", value: labels.component.actionOption3 },
			{ id: "website", value: labels.component.actionOption4 },
			// { id: "newPage", value: labels.component.actionOption5 }
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
		var _pageOptions = [];

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

				_logic.callbacks.onCancel();
				_logic.hide();

			},

			buttonSave: function () {

				var results = [];

				var $viewRules = $$(ids.rules).getChildViews();
				$viewRules.forEach(r => {

					// Action
					var actionSelector = r.queryView({ for: "action" });

					// Value
					var actionInput = r.queryView({ for: "actionValue" });
					var valueViewId = actionInput.getActiveId();
					var actionValue = actionInput.queryView({ id: valueViewId });
					var value;
					if (actionValue && actionValue.getValue)
						value = actionValue.getValue();

					results.push({
						action: actionSelector.getValue(),
						when: r.config.when.getValue(),
						value: value,
					})

				});

				_logic.callbacks.onSave(results);
				_logic.hide();
			},

			callbacks: {
				onCancel: function () { console.warn('NO onCancel()!') },
				onSave: function (rules) { console.warn('NO onSave()!') },
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
				var when = new RowFilter(App, idBase + OP.Util.uuid());
				if (_currentObject)
					when.objectLoad(_currentObject);

				return {
					view: "layout",
					css: "ab-component-form-rule",
					when: when, // Store a instance of when
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
							value: "message",
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
						// Action Options
						{
							for: "actionValue",
							cells: [
								// Show a confirmation message
								{
									view: 'textarea',
									batch: "message",
									label: labels.component.message,
									labelWidth: App.config.labelWidthLarge,
									height: 130
								},
								// Redirect to the parent page
								{
									batch: "parentPage",
									rows: []
								},
								// Redirect to an existing page
								{
									view: 'richselect',
									batch: "existsPage",
									label: labels.component.page,
									labelWidth: App.config.labelWidthLarge,
									options: _pageOptions
								},
								// Redirect to another website URL
								{
									view: 'text',
									batch: "website",
									label: labels.component.redirect,
									labelWidth: App.config.labelWidthLarge
								},
								// Redirect to a new child page
								{
									batch: "newPage"
								}
							]
						}
					]
				}

			},

			addRule: () => {

				var ruleUI = _logic.getRuleUI();

				var viewId = $$(ids.rules).addView(ruleUI);

				// Add a filter to default
				ruleUI.when.addNewFilter();

				return viewId;
			},

			removeRule: (viewRule) => {
				$$(ids.rules).removeView(viewRule);
			},

			selectAction: (action, $viewRule) => {

				// Swtich the view of action option
				$viewRule.queryView({ for: "actionValue" }).showBatch(action);
			},

			hide: function () {
				$$(ids.component).hide();
			},

			show: function () {
				$$(ids.component).show();
			},

			objectLoad: function (object, currView) {
				_currentObject = object;

				if (!_currentObject) return;

				// Pull page list to "Redirect to an existing page"
				_pageOptions = [];

				var addPage = (page, indent) => {
					indent = indent || '';

					_pageOptions.push({ id: page.id, value: indent + page.label });

					page.pages().forEach(function (p) {
						addPage(p, indent + '-');
					})
				};

				addPage(currView.pageRoot(), '');

			},

			setValue: function (rules) {

				$$(ids.rules).reconstruct();

				_rules = rules || [];
				_rules.forEach(r => {

					// Select 'action'
					var $viewRule = $$(_logic.addRule());
					$viewRule.queryView({ for: "action" }).setValue(r.action);

					// Set 'when'
					$viewRule.config.when.setValue(r.when);

					// Define 'value'
					var actionInput = $viewRule.queryView({ for: "actionValue" });
					var valueViewId = actionInput.getActiveId();
					var $viewActionValue = actionInput.queryView({ id: valueViewId });
					if ($viewActionValue && $viewActionValue.setValue)
						$viewActionValue.setValue(r.value);

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