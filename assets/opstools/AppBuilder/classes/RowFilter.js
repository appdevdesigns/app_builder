
export default class RowFilter extends OP.Component {

	constructor(App, idBase) {

		super(App, idBase);

		var L = this.Label;

		var labels = {
			common: (App || {}).labels,
			component: {
				and: L('ab.filter_fields.and', "*And"),
				or: L('ab.filter_fields.or', "*Or"),
				addNewFilter: L('ab.filter_fields.addNewFilter', "*Add a filter"),

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
			filterForm: this.unique(idBase + '_filterForm'),
			addNewFilter: this.unique(idBase + '_addNewFilter'),

			combineCondition: this.unique('combineCondition'),
			field: this.unique('field'),
			operator: this.unique('operator'),
			inputValue: this.unique('inputValue'),

			listOptions: this.unique('listOptions')
		};

		var _Object;
		var _Fields;
		var config_settings = {};

		// setting up UI
		this.init = (options) => {

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

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

			},

			/**
			 * @method getFieldList 
			 * return field list to render options
			 */
			getFieldList: function () {

				return (_Fields || []).map(f => {
					return {
						id: f.id,
						value: f.label
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
							id: ids.combineCondition,
							width: 80,
							value: config_settings.combineCondition,
							options: [
								{
									value: labels.component.and,
									id: "And"
								},
								{
									value: labels.component.or,
									id: "Or"
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
							id: ids.operator,
							width: 155,
							cells: [
								{},
								// Date
								{
									batch: "date",
									view: "combo",
									options: [
										{
											value: labels.component.beforeCondition,
											id: "is before"
										},
										{
											value: labels.component.afterCondition,
											id: "is after"
										},
										{
											value: labels.component.onOrBeforeCondition,
											id: "is on or before"
										},
										{
											value: labels.component.onOrAfterCondition,
											id: "is on or after"
										}
									],
									on: {
										onChange: _logic.onChange
									}
								},
								// Number
								{
									batch: "number",
									view: "combo",
									options: [
										{
											value: labels.component.equalCondition,
											id: ":"
										},
										{
											value: labels.component.notEqualCondition,
											id: "≠"
										},
										{
											value: labels.component.lessThanCondition,
											id: "<"
										},
										{
											value: labels.component.moreThanCondition,
											id: ">"
										},
										{
											value: labels.component.lessThanOrEqualCondition,
											id: "≤"
										},
										{
											value: labels.component.moreThanOrEqualCondition,
											id: "≥"
										}
									],
									on: {
										onChange: _logic.onChange
									}
								},
								// List
								{
									batch: "list",
									view: "combo",
									options: [
										{
											value: labels.component.equalListCondition,
											id: "equals"
										},
										{
											value: labels.component.notEqualListCondition,
											id: "does not equal"
										}
									],
									on: {
										onChange: _logic.onChange
									}
								},
								// Boolean
								{
									batch: "boolean",
									view: "combo",
									options: [
										{
											value: labels.component.checkedCondition,
											id: "is checked"
										},
										{
											value: labels.component.notCheckedCondition,
											id: "is not checked"
										}
									],
									on: {
										onChange: _logic.onChange
									}
								},
								// User
								{
									batch: "user",
									view: "combo",
									options: [
										{
											value: labels.component.isCurrentUserCondition,
											id: "is current user"
										},
										{
											value: labels.component.isNotCurrentUserCondition,
											id: "is not current user"
										},
										{
											value: labels.component.equalListCondition,
											id: "equals"
										},
										{
											value: labels.component.notEqualListCondition,
											id: "does not equal"
										}
									],
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
									options: [
										{
											value: labels.component.containsCondition,
											id: "contains"
										},
										{
											value: labels.component.notContainCondition,
											id: "doesn't contain"
										},
										{
											value: labels.component.isCondition,
											id: "is"
										},
										{
											value: labels.component.isNotCondition,
											id: "is not"
										}
									],
									on: {
										onChange: _logic.onChange
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
									batch: "boolean"
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

			addNewFilter: function (index) {

				var viewId;
				var ui = _logic.getFilterUI();

				var $viewForm = $$(ids.filterForm);
				if ($viewForm) {

					viewId = $viewForm.addView(ui, index);

					_logic.toggleAddNewButton();
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
				config_settings.combineCondition = val;

				// update value of every combine conditions
				var $viewConds = $$(ids.filterForm).getChildViews();
				$viewConds.forEach(v => {
					if (v.$$ && v.$$(ids.combineCondition))
						v.$$(ids.combineCondition).setValue(val);
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
				var batchName = field.key;
				if (batchName == 'LongText') batchName = 'string';
				$viewCond.$$(ids.operator).showBatch(batchName);
				$viewCond.$$(ids.inputValue).showBatch(batchName);

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

				if (!ignoreNotify)
					_logic.onChange();

			},

			onChangeUser: function (operator, $viewCond) {

				if (operator == "is current user" ||
					operator == "is not current user") {
					$viewCond.$$(ids.inputValue).showBatch("empty");
				}
				else {
					$viewCond.$$(ids.inputValue).showBatch("user");
				}
			},

			onChange: function () {

				// refresh config settings before notify
				_logic.getValue();

				_logic.callbacks.onChange();

			},

			/**
			 * @method getValue
			 * 
			 * @return {JSON} - {
			 * 		combineCondition: 'And'/'Or',
			 * 		filters: [
			 * 			{
			 * 				fieldId: {UUID},
			 * 				operator: {string},
			 * 				inputValue: {string}
			 * 			}
			 * 		]
			 * }
			 */
			getValue: () => {

				config_settings.filters = [];

				var $viewForm = $$(ids.filterForm);
				if ($viewForm) {
					$viewForm.getChildViews().forEach($viewCond => {

						var $fieldElem = $viewCond.$$(ids.field);
						if (!$fieldElem) return;

						var fieldId = $fieldElem.getValue();
						if (!fieldId) return;

						var operator = null,
							operatorViewId = $viewCond.$$(ids.operator).getActiveId(),
							$viewComparer = $viewCond.$$(ids.operator).queryView({ id: operatorViewId });
						if ($viewComparer && $viewComparer.getValue)
							operator = $viewComparer.getValue();

						var value = null,
							valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
							$viewConditionValue = $viewCond.$$(ids.inputValue).queryView({ id: valueViewId });
						if ($viewConditionValue && $viewConditionValue.getValue)
							value = $viewConditionValue.getValue();


						config_settings.filters.push({
							fieldId: fieldId,
							operator: operator,
							inputValue: value
						});

					});
				}

				return config_settings;

			},



			setValue: (settings) => {

				config_settings = settings || {};

				// Redraw form with no elements
				var $viewForm = $$(ids.filterForm);
				if ($viewForm)
					webix.ui([], $viewForm);

				config_settings.filters = config_settings.filters || [];

				// Add "new filter" button
				if (config_settings.filters.length == 0) {
					_logic.toggleAddNewButton();
				}

				config_settings.filters.forEach(f => {

					var viewId = _logic.addNewFilter(),
						$viewCond = $$(viewId);

					if ($viewCond == null) return;

					// "And" "Or"
					$viewCond.$$(ids.combineCondition).define('value', config_settings.combineCondition);
					$viewCond.$$(ids.combineCondition).refresh();

					// Select Field
					$viewCond.$$(ids.field).define('value', f.fieldId);
					$viewCond.$$(ids.field).refresh();
					_logic.selectField(f.fieldId, $viewCond, true);

					// Comparer
					var operatorViewId = $viewCond.$$(ids.operator).getActiveId(),
						$viewComparer = $viewCond.$$(ids.operator).queryView({ id: operatorViewId });
					if ($viewComparer && $viewComparer.setValue) {
						$viewComparer.define('value', f.operator);
						$viewComparer.refresh();
					}

					// Input
					var valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
						$viewConditionValue = $viewCond.$$(ids.inputValue).queryView({ id: valueViewId });
					if ($viewConditionValue && $viewConditionValue.setValue) {
						$viewConditionValue.define('value', f.inputValue);
						$viewConditionValue.refresh();
					}

					var field = _Fields.filter(col => col.id == f.fieldId)[0];
					if (field && field.key == 'user')
						_logic.onChangeUser(f.operator, $viewCond);

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
				if (config_settings == null || config_settings.filters == null || config_settings.filters.length == 0) return true;

				var result = (config_settings.combineCondition === "And" ? true : false);

				config_settings.filters.forEach(filter => {

					if (!filter.fieldId || !filter.operator) return;

					var fieldInfo = _Fields.filter(f => f.id == filter.fieldId)[0];
					if (!fieldInfo) return;

					var condResult;

					var value = rowData[fieldInfo.columnName];

					switch (fieldInfo.key) {
						case "string":
						case "LongText":
							condResult = _logic.textValid(value, filter.operator, filter.inputValue);
							break;
						case "date":
						case "datetime":
							condResult = _logic.dateValid(value, filter.operator, filter.inputValue);
							break;
						case "number":
							condResult = _logic.numberValid(value, filter.operator, filter.inputValue);
							break;
						case "list":
							condResult = _logic.listValid(value, filter.operator, filter.inputValue);
							break;
						case "boolean":
							condResult = _logic.booleanValid(value, filter.operator, filter.inputValue);
							break;
						case "user":
							condResult = _logic.userValid(value, filter.operator, filter.inputValue);
							break;
					}

					if (config_settings.combineCondition === "And") {
						result = result && condResult;
					} else {
						result = result || condResult;
					}
				});

				return result;

			},

			removeHtmlTags: function(text) {

				var div = document.createElement("div");
				div.innerHTML = text;

				return div.textContent || div.innerText || "";

			},

			textValid: function (value, operator, compareValue) {

				var result = false;

				value = value.trim().toLowerCase();
				compareValue = compareValue.trim().toLowerCase();

				// remove html tags - rich text editor
				value = _logic.removeHtmlTags(value);

				switch (operator) {
					case "contains":
						result = value.indexOf(compareValue) > -1;
						break;
					case "doesn't contain":
						result = value.indexOf(compareValue) < 0;
						break;
					case "is":
						result = value == compareValue;
						break;
					case "is not":
						result = value != compareValue;
						break;
				}

				return result;

			},

			dateValid: function (value, operator, compareValue) {

				var result = false;

				if (!(value instanceof Date))
					value = new Date(value);

				if (!(compareValue instanceof Date))
					compareValue = new Date(compareValue);

				switch (operator) {
					case "is before":
						result = value < compareValue;
						break;
					case "is after":
						result = value > compareValue;
						break;
					case "is on or before":
						result = value <= compareValue;
						break;
					case "is on or after":
						result = value >= compareValue;
						break;
				}

				return result;

			},

			numberValid: function (value, operator, compareValue) {

				var result = false;

				value = Number(value);
				compareValue = Number(compareValue);

				switch (operator) {
					case ":":
						result = value == compareValue;
						break;
					case "≠":
						result = value != compareValue;
						break;
					case "<":
						result = value < compareValue;
						break;
					case ">":
						result = value > compareValue;
						break;
					case "≤":
						result = value <= compareValue;
						break;
					case "≥":
						result = value >= compareValue;
						break;
				}

				return result;

			},

			listValid: function (value, operator, compareValue) {

				var result = false;

				compareValue = compareValue.toLowerCase();

				if (!Array.isArray(compareValue))
					compareValue = [compareValue];

				switch (operator) {
					case "equals":
						if (value)
							result = compareValue.indexOf(value) > -1;
						break;
					case "does not equal":
						if (value)
							result = compareValue.indexOf(value) < 0;
						else
							result = true;
						break;
				}

				return result;

			},

			booleanValid: function (value, operator, compareValue) {

				var result = false;

				switch (operator) {
					case "is checked":
						result = (value === true || value === 1);
						break;
					case "is not checked":
						result = !value;
						break;
				}

				return result;

			},

			userValid: function (value, operator, compareValue) {

				var result = false;

				if (Array.isArray(value))
					value = [value];

				switch (operator) {
					case "is current user":
						result = value == OP.User.username();
						break;
					case "is not current user":
						result = value != OP.User.username();
						break;
					case "equals":
						result = value.indexOf(compareValue) > -1;
						break;
					case "does not equal":
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