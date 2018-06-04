
export default class RowFilter extends OP.Component {

	constructor(App, idBase) {

		idBase = idBase || 'ab_row_filter';

		super(App, idBase);

		var L = this.Label;

		var labels = {
			common: (App || {}).labels,
			component: {
				and: L('ab.filter_fields.and', "*And"),
				or: L('ab.filter_fields.or', "*Or"),
				addNewFilter: L('ab.filter_fields.addNewFilter', "*Add a filter"),

				thisObject: L('ab.filter_fields.thisObject', "*This Object"),
				inQuery: L('ab.filter_fields.inQuery', "*In Query"),
				notInQuery: L('ab.filter_fields.notInQuery', "*Not In Query"),
				inQueryField: L('ab.filter_fields.inQueryField', "*By Query Field"),
				notInQueryField: L('ab.filter_fields.notInQueryField', "*Not By Query Field"),
				
				inQueryFieldQueryPlaceholder: L('ab.filter_fields.inQueryFieldQueryPlaceholder', "*Choose a Query"),
				inQueryFieldFieldPlaceholder: L('ab.filter_fields.inQueryFieldFieldPlaceholder', "*Choose a Field"),

				sameAsUser: L('ab.filter_fields.sameAsUser', "*Same As User"),
				notSameAsUser: L('ab.filter_fields.notSameAsUser', "*Not Same As User"),

				containsCondition: L('ab.filter_fields.containsCondition', "*contains"),
				notContainCondition: L('ab.filter_fields.notContainCondition', "*doesn't contain"),
				isCondition: L('ab.filter_fields.isCondition', "*is"),
				isNotCondition: L('ab.filter_fields.isNotCondition', "*is not"),

				beforeCondition: L('ab.filter_fields.beforeCondition', "*is before"),
				afterCondition: L('ab.filter_fields.afterCondition', "*is after"),
				onOrBeforeCondition: L('ab.filter_fields.onOrBeforeCondition', "*is on or before"),
				onOrAfterCondition: L('ab.filter_fields.onOrAfterCondition', "*is on or after"),

				equalCondition: L('ab.filter_fields.equalCondition', ":"),
				notEqualCondition: L('ab.filter_fields.notEqualCondition', "≠"),
				lessThanCondition: L('ab.filter_fields.lessThanCondition', "<"),
				moreThanCondition: L('ab.filter_fields.moreThanCondition', ">"),
				lessThanOrEqualCondition: L('ab.filter_fields.lessThanOrEqualCondition', "≤"),
				moreThanOrEqualCondition: L('ab.filter_fields.moreThanOrEqualCondition', "≥"),

				equalListCondition: L('ab.filter_fields.equalListCondition', "*equals"),
				notEqualListCondition: L('ab.filter_fields.notEqualListCondition', "*does not equal"),

				checkedCondition: L('ab.filter_fields.checkedCondition', "*is checked"),
				notCheckedCondition: L('ab.filter_fields.notCheckedCondition', "*is not checked"),

				isCurrentUserCondition: L('ab.filter_fields.isCurrentUserCondition', "*is current user"),
				isNotCurrentUserCondition: L('ab.filter_fields.isNotCurrentUserCondition', "*is not current user")

			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			filterForm: this.unique(idBase + '_rowFilter_form'),
			addNewFilter: this.unique(idBase + '_rowFilter_addNewFilter'),

			glue: this.unique(idBase + '_rowFilter_glue'),
			field: this.unique(idBase + '_rowFilter_field'),
			rule: this.unique(idBase + '_rowFilter_rule'),
			inputValue: this.unique(idBase + '_rowFilter_inputValue'),

			queryCombo: this.unique(idBase + '_rowFilter_queryCombo'),
			queryFieldCombo: this.unique(idBase + '_rowFilter_queryFieldCombo'),
			queryFieldComboQuery: this.unique(idBase + '_rowFilter_queryFieldComboQuery'),
			queryFieldComboField: this.unique(idBase + '_rowFilter_queryFieldComboField'),

			listOptions: this.unique(idBase + '_rowFilter_listOptions')
		};

		var _Object;
		var _Fields;
		var _QueryFields = [];
		var _settings = {};
		var config_settings = {};
		var batchName; // we need to revert to this default when switching away from a in/by query field
		
		// Default options list to push to all fields
		var queryFieldOptions = [
			{
				value: labels.component.inQueryField,
				id: 'in_query_field'
			},
			{
				value: labels.component.notInQueryField,
				id: 'not_in_query_field'
			}
		];

		// setting up UI
		this.init = (options) => {

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			if (options.showObjectName)
				_settings.showObjectName = options.showObjectName;

		};

		// internal business logic 
		var _logic = this._logic = {

			callbacks: {

				/**
				 * @function onChange
				 * called when we have made changes to the filter field settings
				 * of our Current Object.
				 *
				 * this is meant to alert our parent component to respond to the
				 * change.
				 */
				onChange: function () { }
			},


			/**
			 * @method objectLoad
			 * set object
			 * 
			 * @param object {Object}
			 */
			objectLoad: function (object) {

				_Object = object;
				_Fields = _Object ? _Object.fields(f => f.fieldIsFilterable()) : [];
				_QueryFields = _Object ? _Object.connectFields() : [];

				// insert our 'this object' entry if an Object was given.
				if (_Object) {
					_Fields.unshift({ id: 'this_object', label: _Object.label });
				}

			},

			/**
			 * @method getFieldList 
			 * return field list to render options
			 */
			getFieldList: function () {

				return (_Fields || []).map(f => {

					let label = f.label;

					// include object's name to options
					if (_settings.showObjectName && 
						f.object) {
						label = f.object.label + '.' + f.label;
					}

					return {
						id: f.id,
						value: label
					};
				});

			},

			getFilterUI: () => {
				return {
					id: 'f' + webix.uid(),
					isolate: true,
					cols: [
						{
							// Add / Or
							view: "combo",
							id: ids.glue,
							width: 80,
							value: config_settings.glue,
							options: [
								{
									value: labels.component.and,
									id: "and"
								},
								{
									value: labels.component.or,
									id: "or"
								}
							],
							on: {
								onChange: function (newVal, oldVal) {

									_logic.selectCombineCondition(newVal);

								}
							}
						},
						{
							// Field list
							view: "combo",
							id: ids.field,
							options: _logic.getFieldList(),
							on: {
								onChange: function (columnId) {

									var $viewCond = this.getParentView();
									_logic.selectField(columnId, $viewCond);

								}
							}
						},
						// Comparer
						{
							id: ids.rule,
							width: 175,
							cells: [
								{},
								// Query
								{
									batch: "query",
									view: "combo",
									value: 'in_query',
									options: [
										{
											value: labels.component.sameAsUser,
											id:'same_as_user'
										},
										{
											value: labels.component.notSameAsUser,
											id:'not_same_as_user'
										},
										{
											value: labels.component.inQuery,
											id: 'in_query'
										},
										{
											value: labels.component.notInQuery,
											id: 'not_in_query'
										}
									],
									on: {
										onChange:function( newValue, oldValue) {
											_logic.onChangeSameAsUser(this, newValue, oldValue);
										}
									}

								},

								// Date
								{
									batch: "date",
									view: "combo",
									value: "less",
									options: [
										{
											value: labels.component.beforeCondition,
											id: "less"
										},
										{
											value: labels.component.afterCondition,
											id: "greater"
										},
										{
											value: labels.component.onOrBeforeCondition,
											id: "less_or_equal"
										},
										{
											value: labels.component.onOrAfterCondition,
											id: "greater_or_equal"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function(condition) {
											
											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
											
											_logic.onChange();
											
										}
									}
								},
								// Number
								{
									batch: "number",
									view: "combo",
									value: "equals",
									options: [
										{
											value: labels.component.equalCondition,
											id: "equals"
										},
										{
											value: labels.component.notEqualCondition,
											id: "not_equals"
										},
										{
											value: labels.component.lessThanCondition,
											id: "less"
										},
										{
											value: labels.component.moreThanCondition,
											id: "greater"
										},
										{
											value: labels.component.lessThanOrEqualCondition,
											id: "less_or_equal"
										},
										{
											value: labels.component.moreThanOrEqualCondition,
											id: "greater_or_equal"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function(condition) {
											
											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
											
											_logic.onChange();

										}
									}
								},
								// List
								{
									batch: "list",
									view: "combo",
									value: "equals",
									options: [
										{
											value: labels.component.sameAsUser,
											id:'same_as_user'
										},
										{
											value: labels.component.notSameAsUser,
											id:'not_same_as_user'
										},
										{
											value: labels.component.equalListCondition,
											id: "equals"
										},
										{
											value: labels.component.notEqualListCondition,
											id: "not_equal"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function( newValue, oldValue) {
											_logic.onChangeSameAsUser(this, newValue, oldValue);
										}
									}
								},
								// Boolean
								{
									batch: "boolean",
									view: "combo",
									value: "equals",
									options: [
										{
											value: labels.component.equalListCondition,
											id: "equals"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function(condition) {
											
											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
											
											_logic.onChange();
										}
									}
								},
								// User
								{
									batch: "user",
									view: "combo",
									value: "is_current_user",
									options: [
										{
											value: labels.component.isCurrentUserCondition,
											id: "is_current_user"
										},
										{
											value: labels.component.isNotCurrentUserCondition,
											id: "is_not_current_user"
										},
										{
											value: labels.component.equalListCondition,
											id: "equals"
										},
										{
											value: labels.component.notEqualListCondition,
											id: "not_equal"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function (userCondition) {

											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeUser(userCondition, $viewCond);

											_logic.onChange();

										}
									}
								},
								// String
								{
									batch: "string",
									view: "combo",
									value: "contains",
									options: [
										{
											value: labels.component.containsCondition,
											id: "contains"
										},
										{
											value: labels.component.notContainCondition,
											id: "not_contains"
										},
										{
											value: labels.component.isCondition,
											id: "is"
										},
										{
											value: labels.component.isNotCondition,
											id: "not_equals"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function(condition) {

											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
										
											_logic.onChange();
										}
									}
								},
								// Email
								{
									batch: "email",
									view: "combo",
									value: "contains",
									options: [
										{
											value: labels.component.containsCondition,
											id: "contains"
										},
										{
											value: labels.component.notContainCondition,
											id: "not_contains"
										},
										{
											value: labels.component.isCondition,
											id: "is"
										},
										{
											value: labels.component.isNotCondition,
											id: "not_equals"
										}
									].concat(queryFieldOptions),
									on: {
										onChange: function(condition) {

											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
										
											_logic.onChange();
										}
									}
								},
							]
						},
						// Value
						{
							id: ids.inputValue,
							isolate: true,
							cells: [
								{
									batch: "empty"
								},

								// Query
								{
									id: ids.queryCombo,

									batch: "query",
									view: "combo",
									options: [],
									on: {
										onChange: _logic.onChange
									}

								},

								// Query Field
								{
									id: ids.queryFieldCombo,
									batch: "queryField",
									rows: [
										{
											id: ids.queryFieldComboQuery,
											view: "combo",
											options: [],
											placeholder: labels.component.inQueryFieldQueryPlaceholder,
											on: {
												onChange: function(value) {
													
													var $viewComparer = this.getParentView();
													var $viewCond = $viewComparer.getParentView().getParentView();
													_logic.onChangeQueryFieldCombo(value, $viewCond);

													_logic.onChange();
												}
											}
										},
										{
											id: ids.queryFieldComboField,
											view: "combo",
											options: [],
											placeholder: labels.component.inQueryFieldFieldPlaceholder,
											on: {
												onChange: _logic.onChange
											}
										}
									]

								},

								// Date
								{
									// inputView.format = field.getDateFormat();
									batch: "date",
									view: "datepicker",
									on: {
										onChange: function () {
											_logic.onChange();
										}
									}
								},
								// Number
								{
									batch: "number",
									view: "text",
									validate: webix.rules.isNumber,
									on: {
										onTimedKeyPress: function () {
											_logic.onChange();
										}
									}
								},
								// List
								{
									batch: "list",
									id: ids.listOptions,
									view: "combo",
									options: [],
									on: {
										onChange: function () {
											_logic.onChange();
										}
									}
								},
								// Boolean
								{
									batch: "boolean",
									view: 'checkbox',
									on: {
										onChange: function () {
											_logic.onChange();
										}
									}
								},
								// User
								{
									batch: "user",
									view: "combo",
									options: OP.User.userlist().map((u) => {
										return {
											id: u.username,
											value: u.username
										};
									}),
									on: {
										onChange: function () {
											_logic.onChange();
										}
									}
								},
								// String
								{
									batch: "string",
									view: "text",
									on: {
										onTimedKeyPress: function () {
											_logic.onChange();
										}
									}
								},
								// Email
								{
									batch: "email",
									view: "text",
									on: {
										onTimedKeyPress: function () {
											_logic.onChange();
										}
									}
								}
							]
						},
						{
							view: "button",
							icon: "plus",
							type: "icon",
							width: 30,
							click: function () {
								var $viewForm = this.getFormView();

								var indexView = $viewForm.index(this.getParentView());

								_logic.addNewFilter(indexView + 1);
							}
						},
						{
							view: "button",
							icon: "trash",
							type: "icon",
							width: 30,
							click: function () {

								var $viewCond = this.getParentView();

								_logic.removeNewFilter($viewCond);
							}
						}
					]
				};
			},

			getAddButtonUI: function () {
				return {
					view: "button",
					id: ids.addNewFilter,
					icon: "plus",
					type: "iconButton",
					label: labels.component.addNewFilter,
					click: function () {

						_logic.addNewFilter();

					}
				};
			},

			addNewFilter: function (index, fieldId) {

				var viewId;
				var ui = _logic.getFilterUI();

				var $viewForm = $$(ids.filterForm);
				if ($viewForm) {

					viewId = $viewForm.addView(ui, index);

					_logic.toggleAddNewButton();

					// select a option of field
					if(fieldId)
						_logic.selectField(fieldId, $$(viewId), true);
				}

				return viewId;
			},

			removeNewFilter: function ($viewCond) {

				var $viewForm = $$(ids.filterForm);

				$viewForm.removeView($viewCond);

				_logic.toggleAddNewButton();

				_logic.onChange();

			},

			toggleAddNewButton: function () {

				if (!$$(ids.filterForm)) return;

				// Show "Add new filter" button
				if ($$(ids.filterForm).getChildViews().length < 1) {

					$$(ids.filterForm).hide();
					$$(ids.addNewFilter).show();
				}
				// Hide "Add new filter" button
				else {

					$$(ids.filterForm).show();
					$$(ids.addNewFilter).hide();
				}


			},

			selectCombineCondition: (val, ignoreNotify) => {

				// define combine value to configuration
				config_settings.glue = val;

				// update value of every combine conditions
				var $viewConds = $$(ids.filterForm).getChildViews();
				$viewConds.forEach(v => {
					if (v.$$ && v.$$(ids.glue))
						v.$$(ids.glue).setValue(val);
				});

				if (!ignoreNotify)
					_logic.onChange();

			},

			selectField: function (columnId, $viewCond, ignoreNotify) {

				if (!_Fields) return;

				var field = _Fields.filter(f => f.id == columnId)[0];

				var conditionList = [];
				var inputView = {};

				if (!field) return;

				// switch view
				batchName = field.key;
				if (batchName == 'LongText') batchName = 'string';
				if (field.id == 'this_object') batchName = 'query';	// Special this object query
				var isQueryField = (_QueryFields.filter((f) => { return f.id == field.id; }).length > 0);
				if (isQueryField) {
					// we chose a connectField which is now a Query type
					batchName = 'query';
				}
				$viewCond.$$(ids.rule).showBatch(batchName);
				$viewCond.$$(ids.inputValue).showBatch(batchName);


				// populate the list of Queries for this_object:
				if (field.id == 'this_object') {

					var options = [];
					var Queries = _Object.application.queries((q) => { return q.canFilterObject(_Object); });
					Queries.forEach((q) => {
						options.push({
							id: q.id,
							value: q.label
						})
					})

					$viewCond.$$(ids.inputValue).$$(ids.queryCombo).define("options", options);
					$viewCond.$$(ids.inputValue).$$(ids.queryCombo).refresh();

				}


				// populate the list of Queries for a query field
				if (isQueryField) {

					var options = [];
					var Queries = _Object.application.queries((q) => { return q.canFilterField(field); });
					Queries.forEach((q) => {
						options.push({
							id: q.id,
							value: q.label
						})
					})

					$viewCond.$$(ids.inputValue).$$(ids.queryCombo).define("options", options);
					$viewCond.$$(ids.inputValue).$$(ids.queryCombo).refresh();
				}


				// populate options of list
				if (field.key == 'list') {
					var options = field.settings.options.map(function (x) {
						return {
							id: x.id,
							value: x.text
						}
					});

					$viewCond.$$(ids.inputValue).$$(ids.listOptions).define("options", options);
					$viewCond.$$(ids.inputValue).$$(ids.listOptions).refresh();
				}
				
				var rule = null,
					ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
					$viewComparer = $viewCond.$$(ids.rule).queryView({ id: ruleViewId });
				if ($viewComparer && $viewComparer.getValue) {
					rule = $viewComparer.getValue();
					if (rule == "in_query_field" || rule == "not_in_query_field") {
						// Show the new value inputs
						$viewCond.$$(ids.inputValue).showBatch("queryField");
					}
				}
					
				

				if (!ignoreNotify)
					_logic.onChange();

			},

			onChangeSameAsUser: function($view, newValue, oldValue) {

				var $viewComparer = $view.getParentView();
				var $viewCond = $viewComparer.getParentView();

				if (newValue == 'same_as_user' || newValue == 'not_same_as_user') {
					// clear and disable the value field
					$viewCond.$$(ids.inputValue).showBatch("empty");
					_logic.onChange();
				} else if (newValue == "in_query_field" || newValue == "not_in_query_field") {
					_logic.onChangeRule(newValue, $viewCond);
					_logic.onChange();
				} else {
					$viewCond.$$(ids.inputValue).showBatch("list");
					_logic.onChange();
				}
				
			},

			onChangeUser: function (rule, $viewCond) {

				if (rule == "is_current_user" ||
					rule == "is_not_current_user") {
					$viewCond.$$(ids.inputValue).showBatch("empty");
				} else if (rule == "in_query_field" || rule == "not_in_query_field") {
					_logic.onChangeRule(rule, $viewCond);
				}
				else {
					$viewCond.$$(ids.inputValue).showBatch("user");
				}
			},
			
			onChangeRule: function(rule, $viewCond) {
				if (rule == "not_in_query_field" || rule == "in_query_field") {
					// populate the list of Queries for this_object:
					var options = [];
					// Get all application's queries
					_Object.application.queries((q) => { return q.id != _Object.id; }).forEach((q) => {
						options.push({
							id: q.id,
							value: q.label
						})
					})

					$viewCond.$$(ids.inputValue).$$(ids.queryFieldComboQuery).define("options", options);
					$viewCond.$$(ids.inputValue).$$(ids.queryFieldComboQuery).refresh();
					
					// Show the new value inputs
					$viewCond.$$(ids.inputValue).showBatch("queryField");
				} else {
					// Show the default value inputs
					$viewCond.$$(ids.inputValue).showBatch(batchName);
					_logic.onChange();
				}
				
				// _logic.onChange();
			},
			
			onChangeQueryFieldCombo: function(value, $viewCond) {
				// populate the list of Queries for this_object:
				var options = [];
				// Get all queries fields
				var Query = _Object.application.queries((q) => { return q.id == value; });
				if (Query.length) {
					Query[0].fields( (f) => { return f.key != "connectObject"; } ).forEach((q) => {
						options.push({
							id: q.id,
							value: q.object.label + "." + q.label
						})
					})

					$viewCond.$$(ids.inputValue).$$(ids.queryFieldComboField).define("options", options);
					$viewCond.$$(ids.inputValue).$$(ids.queryFieldComboField).refresh();					
				}

				// _logic.onChange();
			},

			onChange: function () {

				// refresh config settings before notify
				_logic.getValue();

				_logic.callbacks.onChange();

				return false;
			},

			/**
			 * @method getValue
			 * 
			 * @return {JSON} -
			 * {
			 * 		glue: '', // 'and', 'or'
			 *		rules: [
			 *			{
			 *				key:	'column name',
			 *				rule:	'rule',
			 *				value:	'value'
			 *			}
			 *		]
			 * }
			 */
			getValue: () => {

				config_settings = {
					glue: 'and',
					rules: []
				};

				var $viewForm = $$(ids.filterForm);
				if ($viewForm) {
					$viewForm.getChildViews().forEach(($viewCond, index) => {

						if (index == 0) {
							config_settings.glue = $viewCond.$$(ids.glue).getValue();
						}

						var $fieldElem = $viewCond.$$(ids.field);
						if (!$fieldElem) return;

						var fieldId = $fieldElem.getValue();
						if (!fieldId) return;

						var rule = null,
							ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
							$viewComparer = $viewCond.$$(ids.rule).queryView({ id: ruleViewId });
						if ($viewComparer && $viewComparer.getValue)
							rule = $viewComparer.getValue();

						var value = null,
							valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
							$viewConditionValue = $viewCond.$$(ids.inputValue).queryView({ id: valueViewId });
						if ($viewConditionValue && $viewConditionValue.getValue) {
							value = $viewConditionValue.getValue();
						} else if ($viewConditionValue && $viewConditionValue.getChildViews()) {
							var vals = [];
							$viewConditionValue.getChildViews().forEach( element => {
								vals.push($$(element).getValue());
							});
							value = vals.join(":");
						}


						config_settings.rules.push({
							key: fieldId,
							rule: rule,
							value: value
						});

					});
				}

				return _.cloneDeep(config_settings);

			},



			setValue: (settings) => {

				config_settings = settings || {};

				// Redraw form with no elements
				var $viewForm = $$(ids.filterForm);
				if ($viewForm)
					webix.ui([], $viewForm);

				config_settings.rules = config_settings.rules || [];

				// Add "new filter" button
				if (config_settings.rules.length == 0) {
					_logic.toggleAddNewButton();
				}

				config_settings.rules.forEach(f => {

					var viewId = _logic.addNewFilter(),
						$viewCond = $$(viewId);

					if ($viewCond == null) return;

					// "and" "or"
					$viewCond.$$(ids.glue).define('value', config_settings.glue);
					$viewCond.$$(ids.glue).refresh();

					// Select Field
					$viewCond.$$(ids.field).define('value', f.key);
					$viewCond.$$(ids.field).refresh();
					_logic.selectField(f.key, $viewCond, true);

					// Comparer
					var ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
						$viewComparer = $viewCond.$$(ids.rule).queryView({ id: ruleViewId });
					if ($viewComparer && $viewComparer.setValue) {
						$viewComparer.define('value', f.rule);
						$viewComparer.refresh();
					}
					
					if (f.rule == "in_query_field" || f.rule == "not_in_query_field") {
						$viewCond.blockEvent();
						_logic.onChangeRule(f.rule, $viewCond);
						$viewCond.blockEvent();
					}

					// Input
					var valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
						$viewConditionValue = $viewCond.$$(ids.inputValue).queryView({ id: valueViewId });
					if ($viewConditionValue && $viewConditionValue.setValue) {
						$viewConditionValue.define('value', f.value);
						$viewConditionValue.refresh();
					} else if ($viewConditionValue && $viewConditionValue.getChildViews()) {
						var vals = f.value.split(":");
						var index = 0;
						$viewConditionValue.getChildViews().forEach( element => {
							$$(element).blockEvent();
							$$(element).setValue(vals[index]);
							if (index == 0) {
								_logic.onChangeQueryFieldCombo(vals[index], $viewCond);
							}
							$$(element).unblockEvent();
							// $$(element).refresh();
							index++;
						});
					}

					var field = _Fields.filter(col => col.id == f.key)[0];
					if (field && field.key == 'user')
						_logic.onChangeUser(f.rule, $viewCond);

				});

			},


			/**
			 * @method isValid
			 * validate the row data is valid filter condition
			 * 
			 * @param rowData {Object} - data row
			 */
			isValid: (rowData) => {

				// If no conditions, then return true
				if (config_settings == null || config_settings.rules == null || config_settings.rules.length == 0)
					return true;

				var result = (config_settings.glue === "glue" ? true : false);

				config_settings.rules.forEach(filter => {

					if (!filter.key || !filter.rule) return;

					var fieldInfo = _Fields.filter(f => f.id == filter.key)[0];
					if (!fieldInfo) return;

					var condResult;

					var value = rowData[fieldInfo.columnName];

					switch (fieldInfo.key) {
						case "string":
						case "LongText":
						case "email":
							condResult = _logic.textValid(value, filter.rule, filter.value);
							break;
						case "date":
						case "datetime":
							condResult = _logic.dateValid(value, filter.rule, filter.value);
							break;
						case "number":
							condResult = _logic.numberValid(value, filter.rule, filter.value);
							break;
						case "list":
							condResult = _logic.listValid(value, filter.rule, filter.value);
							break;
						case "boolean":
							condResult = _logic.booleanValid(value, filter.rule, filter.value);
							break;
						case "user":
							condResult = _logic.userValid(value, filter.rule, filter.value);
							break;
					}

					if (config_settings.glue === "glue") {
						result = result && condResult;
					} else {
						result = result || condResult;
					}
				});

				return result;

			},

			removeHtmlTags: function (text) {

				var div = document.createElement("div");
				div.innerHTML = text;

				return div.textContent || div.innerText || "";

			},

			textValid: function (value, rule, compareValue) {

				var result = false;

				value = value.trim().toLowerCase();
				compareValue = compareValue.trim().toLowerCase();

				// remove html tags - rich text editor
				value = _logic.removeHtmlTags(value);

				switch (rule) {
					case "contains":
						result = value.indexOf(compareValue) > -1;
						break;
					case "not_contains":
						result = value.indexOf(compareValue) < 0;
						break;
					case "is":
						result = value == compareValue;
						break;
					case "not_equals":
						result = value != compareValue;
						break;
				}

				return result;

			},

			dateValid: function (value, rule, compareValue) {

				var result = false;

				if (!(value instanceof Date))
					value = new Date(value);

				if (!(compareValue instanceof Date))
					compareValue = new Date(compareValue);

				switch (rule) {
					case "less":
						result = value < compareValue;
						break;
					case "greater":
						result = value > compareValue;
						break;
					case "less_or_equal":
						result = value <= compareValue;
						break;
					case "greater_or_equal":
						result = value >= compareValue;
						break;
				}

				return result;

			},

			numberValid: function (value, rule, compareValue) {

				var result = false;

				value = Number(value);
				compareValue = Number(compareValue);

				switch (rule) {
					case "equals":
						result = value == compareValue;
						break;
					case "not_equals":
						result = value != compareValue;
						break;
					case "less":
						result = value < compareValue;
						break;
					case "greater":
						result = value > compareValue;
						break;
					case "less_or_equal":
						result = value <= compareValue;
						break;
					case "greater_or_equal":
						result = value >= compareValue;
						break;
				}

				return result;

			},

			listValid: function (value, rule, compareValue) {

				var result = false;

				compareValue = compareValue.toLowerCase();

				if (!Array.isArray(compareValue))
					compareValue = [compareValue];

				switch (rule) {
					case "equals":
						if (value)
							result = compareValue.indexOf(value) > -1;
						break;
					case "not_equal":
						if (value)
							result = compareValue.indexOf(value) < 0;
						else
							result = true;
						break;
				}

				return result;

			},

			booleanValid: function (value, rule, compareValue) {

				return (value == compareValue);

			},

			userValid: function (value, rule, compareValue) {

				var result = false;

				if (Array.isArray(value))
					value = [value];

				switch (rule) {
					case "is_current_user":
						result = value == OP.User.username();
						break;
					case "is_not_current_user":
						result = value != OP.User.username();
						break;
					case "equals":
						result = value.indexOf(compareValue) > -1;
						break;
					case "not_equal":
						result = value.indexOf(compareValue) < 0;
						break;
				}

				return result;
			}

		};


		// webix UI definition:
		this.ui = {
			rows: [
				{
					view: "form",
					id: ids.filterForm,
					hidden: true,
					elements: []
				},
				_logic.getAddButtonUI()
			]
		};



		// Interface methods for parent component:
		this.objectLoad = _logic.objectLoad;
		this.addNewFilter = _logic.addNewFilter;
		this.getValue = _logic.getValue;
		this.setValue = _logic.setValue;
		this.isValid = _logic.isValid;

	}

}