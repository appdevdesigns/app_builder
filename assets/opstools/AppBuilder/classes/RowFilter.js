
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
				notCheckedCondition: L('ab.filter_fields.notCheckedCondition', "*is not checked")
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			filterForm: this.unique('filterForm'),

			combineCondition: this.unique('combineCondition'),
			field: this.unique('field'),
			comparer: this.unique('comparer'),
			conditionValue: this.unique('conditionValue'),

			listOptions: this.unique('listOptions')
		};

		// setting up UI
		this.init = (options) => {

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);

		};

		var fields = null;
		var config_settings = {};

		// internal business logic 
		var _logic = this._logic = {

			/**
			 * @method fieldsLoad
			 * set field list
			 * 
			 * @param fieldList {Array} - [ABField1, ..., ABFieldn]
			 */
			fieldsLoad: function (fieldList) {

				fields = fieldList.filter(f => f.fieldIsFilterable());

			},

			/**
			 * @method getFieldList 
			 * return field list to render options
			 */
			getFieldList: function () {

				return (fields || []).map(f => {
					return {
						id: f.id,
						value: f.label
					};
				});

			},

			getFilterUI: function () {
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

									_logic.selectCombineCondition(newVal, this);

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
							id: ids.comparer,
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
							id: ids.conditionValue,
							isolate: true,
							cells: [
								{},
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
							icon: "trash",
							type: "icon",
							width: 30,
							click: function () {
								var $viewCond = this.getParentView();
								this.getFormView().removeView($viewCond);

								_logic.onChange();
							}
						}
					]
				};
			},

			addNewFilter: function ($container) {
				var ui = _logic.getFilterUI();

				var $viewForm = $container.$$(ids.filterForm);

				return $viewForm.addView(ui);
			},

			selectCombineCondition: function (val, $view) {

				// define combine value to configuration
				config_settings.combineCondition = val;

				// update value of every combine conditions
				var $viewConds = $view.getFormView().getChildViews();
				$viewConds.forEach(v => {
					if (v.$$ && v.$$(ids.combineCondition))
						v.$$(ids.combineCondition).setValue(val);
				});

				_logic.onChange();

			},

			selectField: function (columnId, $viewCond) {

				if (!fields) return;

				var field = fields.filter(f => f.id == columnId)[0];

				var conditionList = [];
				var inputView = {};

				if (!field) return;

				// switch view
				var batchName = field.key;
				if (batchName == 'LongText') batchName = 'string';
				$viewCond.$$(ids.comparer).showBatch(batchName);
				$viewCond.$$(ids.conditionValue).showBatch(batchName);

				// populate options of list
				if (field.key == 'list') {
					var options = field.settings.options.map(function (x) {
						return {
							id: x.id,
							value: x.text
						}
					});

					$viewCond.$$(ids.conditionValue).$$(ids.listOptions).define("options", options);
					$viewCond.$$(ids.conditionValue).$$(ids.listOptions).refresh();
				}

				// TODO: multilingual of string
				if (field.key == 'string') {
					// var isMultiLingualCheckbox = filter_item.getChildViews()[5];
					// isMultiLingualCheckbox.setValue(field.settings.supportMultilingual);
				}

				_logic.onChange();

			},

			onChange: function () {

			},

			/**
			 * @method getValue
			 * 
			 * @param $container {Webix elem}
			 * 
			 * @return {JSON} - {
			 * 		combineCondition: 'And'/'Or',
			 * 		filters: [
			 * 			{
			 * 				fieldId: {UUID},
			 * 				comparer: {string},
			 * 				value: {string}
			 * 			}
			 * 		]
			 * }
			 */
			getValue: function ($container) {

				config_settings.filters = [];

				$container.$$(ids.filterForm).getChildViews().forEach($viewCond => {


					var fieldId = $viewCond.$$(ids.field).getValue();
					if (!fieldId) return;

					var comparer = null;
					var comparerViewId = $viewCond.$$(ids.comparer).getActiveId();
					var $viewComparer = $viewCond.$$(ids.comparer).queryView({ id: comparerViewId });
					if ($viewComparer && $viewComparer.getValue)
						comparer = $viewComparer.getValue();

					var value = null;
					var valueViewId = $viewCond.$$(ids.conditionValue).getActiveId();
					var $viewConditionValue = $viewCond.$$(ids.conditionValue).queryView({ id: valueViewId });
					if ($viewConditionValue && $viewConditionValue.getValue)
						value = $viewConditionValue.getValue();


					config_settings.filters.push({
						fieldId: fieldId,
						comparer: comparer,
						value: value
					});


				});

				return config_settings;

			},



			setValue: function (settings, $container) {

				config_settings = settings || {};

				if (!$container) return;

				var $viewForm = $container.$$(ids.filterForm);

				// Rebuild
				$viewForm.getChildViews().forEach(v => {
					$viewForm.removeView(v);
				});

				config_settings.filters = config_settings.filters || [];
				config_settings.filters.forEach(f => {

					var $viewCond = $$(_logic.addNewFilter($container));

					_logic.selectCombineCondition(config_settings.combineCondition, $viewCond);

					$viewCond.$$(ids.field).setValue(f.fieldId);

					var comparerViewId = $viewCond.$$(ids.comparer).getActiveId();
					var $viewComparer = $viewCond.$$(ids.comparer).queryView({ id: comparerViewId });
					if ($viewComparer && $viewComparer.setValue)
						$viewComparer.setValue(f.comparer);

					var valueViewId = $viewCond.$$(ids.conditionValue).getActiveId();
					var $viewConditionValue = $viewCond.$$(ids.conditionValue).queryView({ id: valueViewId });
					if ($viewConditionValue && $viewConditionValue.setValue)
						$viewConditionValue.setValue(f.value);

				});

			},


			/**
			 * @method isValid
			 * validate the row data is valid filter condition
			 * 
			 * @param rowData {Object} - data row
			 */
			isValid: function (rowData) {

				var result = false;

				config_settings.filters.forEach(filter => {

					var fieldInfo = fields.filter(f => f.id == filter.fieldId)[0];
					if (!fieldInfo) return;

					var value = rowData[fieldInfo.columnName];

					switch (fieldInfo.key) {
						case "string":
						case "LongText":
							result = _logic.textValid(value, filter.comparer, filter.value);
							break;
						case "date":
						case "datetime":
							result = _logic.dateValid(value, filter.comparer, filter.value);
							break;
						case "number":
							result = _logic.numberValid(value, filter.comparer, filter.value);
							break;
						case "list":
							result = _logic.listValid(value, filter.comparer, filter.value);
							break;
						case "boolean":
							result = _logic.booleanValid(value, filter.comparer, filter.value);
							break;
						case "user":
							result = _logic.userValid(value, filter.comparer, filter.value);
							break;
					}
				});

				return result;

			},

			textValid: function (value, comparer, compareValue) {

				var result = false;

				value = value.trim().toLowerCase();
				compareValue = compareValue.trim().toLowerCase();

				switch (comparer) {
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

			dateValid: function (value, comparer, compareValue) {

				var result = false;

				if (!(value instanceof Date))
					value = new Date(value);

				if (!(compareValue instanceof Date))
					compareValue = new Date(compareValue);

				switch (comparer) {
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

			numberValid: function (value, comparer, compareValue) {

				var result = false;

				value = Number(value);
				compareValue = Number(compareValue);

				switch (comparer) {
					case labels.filter_fields.equalCondition:
						result = value == compareValue;
						break;
					case labels.filter_fields.notEqualCondition:
						result = value != compareValue;
						break;
					case labels.filter_fields.lessThanCondition:
						result = value < compareValue;
						break;
					case labels.filter_fields.moreThanCondition:
						result = value > compareValue;
						break;
					case labels.filter_fields.lessThanOrEqualCondition:
						result = value <= compareValue;
						break;
					case labels.filter_fields.moreThanOrEqualCondition:
						result = value >= compareValue;
						break;
				}

				return result;

			},

			listValid: function (value, comparer, compareValue) {

				var result = false;

				compareValue = compareValue.toLowerCase();

				if (Array.isArray(compareValue))
					compareValue = [compareValue];

				switch (comparer) {
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

			booleanValid: function (value, comparer, compareValue) {

				var result = false;

				switch (comparer) {
					case "is checked":
						result = (value === true || value === 1);
						break;
					case "is not checked":
						result = !value;
						break;
				}

				return result;

			},

			userValid: function (value, comparer, compareValue) {

				var result = false;

				if (Array.isArray(value))
					value = [value];

				switch (comparer) {
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
			isolate: true,
			rows: [
				{
					view: "form",
					id: ids.filterForm,
					isolate: true,
					elements: []
				},
				{
					view: "button",
					id: ids.newfilterbutton,
					value: labels.component.addNewFilter,
					click: function () {

						_logic.addNewFilter(this.getTopParentView());

					}
				}
			]
		};



		// Interface methods for parent component:
		this.fieldsLoad = _logic.fieldsLoad;
		this.addNewFilter = _logic.addNewFilter;
		this.getValue = _logic.getValue;
		this.setValue = _logic.setValue;
		this.isValid = _logic.isValid;

	}

}