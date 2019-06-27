/**
 *  support get data from objects and queries
 */
function getFieldVal(rowData, columnName) {

	if (!columnName) 
		return null;

	if (columnName.indexOf('.') > -1) {
		let colName = columnName.split('.')[1];
		return rowData[columnName] || rowData[colName];
	}
	else {
		return rowData[columnName];
	}
}


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
				
				sameAsField: L('ab.filter_fields.sameAsFild', "*Same As Field"),
				notSameAsField: L('ab.filter_fields.notSameAsFild', "*Not Field"),

				inDataCollection: L('ab.filter_fields.inDataCollection', "*In Data Collection"),
				notInDataCollection: L('ab.filter_fields.notInDataCollection', "*Not In Data Collection"),

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
			
			fieldMatch: this.unique(idBase + '_rowFilter_fieldMatchCombo'),

			dataCollection: this.unique(idBase + '_rowFilter_dataCollection'),

			listOptions: this.unique(idBase + '_rowFilter_listOptions'),

			datePicker: this.unique(idBase + '_rowFilter_datePicker')
		};

		var _Object;
		var _Fields;
		var _QueryFields = [];
		var _View;
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
		
		var recordRuleOptions = [];
		var recordRuleFieldOptions = [];

		// setting up UI
		this.init = (options) => {

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			if (options.showObjectName)
				_settings.showObjectName = options.showObjectName;
				
			
			if (options.isRecordRule) {
				recordRuleOptions = [
					{
						value: labels.component.sameAsField,
						id: "same_as_field"
					},
					{
						value: labels.component.notSameAsField,
						id: "not_same_as_field"
					}
				];
				recordRuleFieldOptions = options.fieldOptions;
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
			 * @param object {ABObject}
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
			 * @method viewLoad
			 * set view
			 * 
			 * @param view {ABView}
			 */
			viewLoad: function(view) {

				_View = view;

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
						value: label,
						alias: f.alias || undefined // ABObjectQuery
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
											value: labels.component.containsCondition,
											id: "contains"
										},
										{
											value: labels.component.notContainCondition,
											id: "not_contains"
										},
										{
											value: labels.component.isCondition,
											id: "equals"
										},
										{
											value: labels.component.isNotCondition,
											id: "not_equal"
										},
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
										},
										{
											value: labels.component.inDataCollection,
											id: 'in_data_collection'
										},
										{
											value: labels.component.notInDataCollection,
											id: 'not_in_data_collection'
										},
									].concat(recordRuleOptions),
									on: {
										onChange:function( condition, oldValue) {

											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
											_logic.onChange();

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
									].concat(queryFieldOptions).concat(recordRuleOptions),
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
											id: "not_equal"
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
									].concat(queryFieldOptions).concat(recordRuleOptions),
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
									].concat(queryFieldOptions).concat(recordRuleOptions),
									on: {
										onChange: function( condition, oldValue) {

											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
											_logic.onChange();
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
									].concat(queryFieldOptions).concat(recordRuleOptions),
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
									].concat(queryFieldOptions).concat(recordRuleOptions),
									on: {
										onChange: function (condition) {

											var $viewComparer = this.getParentView();
											var $viewCond = $viewComparer.getParentView();
											_logic.onChangeRule(condition, $viewCond);
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
											id: "equals"
										},
										{
											value: labels.component.isNotCondition,
											id: "not_equal"
										}
									].concat(queryFieldOptions).concat(recordRuleOptions),
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
											id: "equals"
										},
										{
											value: labels.component.isNotCondition,
											id: "not_equal"
										}
									].concat(queryFieldOptions).concat(recordRuleOptions),
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
								
								// Field match
								{
									id: ids.fieldMatch,
									batch: "fieldMatch",
									view: "combo",
									options: [],
									on: {
										onChange: _logic.onChange
									}

								},

								// Data collection
								{
									id: ids.dataCollection,
									batch: "dataCollection",
									view: "richselect",
									options: [],
									on: {
										onChange: _logic.onChange
									}

								},


								// Date
								{
									// inputView.format = field.getDateFormat();
									batch: "date",
									id: ids.datePicker,
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
							icon: "fa fa-plus",
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
							icon: "fa fa-trash",
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
					type: "form",
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
				// set format of datepicker
				else if (field.key == 'date') {
					$viewCond.$$(ids.inputValue).$$(ids.datePicker).define("format", field.getFormat());
					$viewCond.$$(ids.inputValue).$$(ids.datePicker).refresh();
				}

				var rule = null,
					ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
					$viewComparer = $viewCond.$$(ids.rule).queryView({ id: ruleViewId });
				if ($viewComparer && $viewComparer.getValue) {
					rule = $viewComparer.getValue();
					if (rule == "in_query_field" || rule == "not_in_query_field") {
						// Show the new value inputs
						$viewCond.$$(ids.inputValue).showBatch("queryField");
					} else if (rule == "same_as_field" || rule == "not_same_as_field") {
						// Show the new value inputs
						$viewCond.$$(ids.inputValue).showBatch("fieldMatch");
					}
				}
					
				

				if (!ignoreNotify)
					_logic.onChange();

			},

			// onChangeList: function(newValue, $viewCond) {

			// 	if (newValue == 'same_as_user' || newValue == 'not_same_as_user') {
			// 		_logic.onChangeRule(newValue, $viewCond);
			// 	} 
			// 	else {
			// 		$viewCond.$$(ids.inputValue).showBatch("list");
			// 		_logic.onChange();
			// 	}
				
			// },

			// onChangeUser: function (rule, $viewCond) {

			// 	if (rule == "is_current_user" ||
			// 		rule == "is_not_current_user") {
			// 		$viewCond.$$(ids.inputValue).showBatch("empty");
			// 	} 
			// 	else if (rule == "in_query_field" ||
			// 				rule == "not_in_query_field" ||
			// 				rule == "same_as_field" ||
			// 				rule == "not_same_as_field") {
			// 		_logic.onChangeRule(rule, $viewCond);
			// 	}
			// 	else {
			// 		$viewCond.$$(ids.inputValue).showBatch("user");
			// 	}
			// },
			
			onChangeRule: (rule, $viewCond) => {

				switch(rule) {
					case 'contains':
					case 'not_contains':
					case 'equals':
					case 'not_equal':
						_logic.onChange();
						break;

					case 'is_current_user':
					case 'is_not_current_user':
					case 'same_as_user':
					case 'not_same_as_user':
						// clear and disable the value field
						$viewCond.$$(ids.inputValue).showBatch("empty");
						_logic.onChange();
						break;

					case 'in_query_field':
					case 'not_in_query_field':
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
						break;

					case 'same_as_field':
					case 'not_same_as_field':
						$viewCond.$$(ids.inputValue).$$(ids.fieldMatch).define("options", recordRuleFieldOptions);
						$viewCond.$$(ids.inputValue).$$(ids.fieldMatch).refresh();
						
						// Show the new value inputs
						$viewCond.$$(ids.inputValue).showBatch("fieldMatch");
						break;

					case 'in_data_collection':
					case 'not_in_data_collection':

						let dcOptions = [];

						// pull data collection list
						if (_View) {

							// get id of the link object
							let linkObjectId,
								columnId = $viewCond.$$(ids.field).getValue();
							if (columnId == 'this_object') {
								linkObjectId = _Object.id;
							}
							else {
								let field = _Object.fields(f => f.id == columnId)[0];
								if (field)
									linkObjectId = field.settings.linkObject;
							}
								
							if (linkObjectId) {

								_View.application
								.dataviews(dv => dv.datasource && dv.datasource.id == linkObjectId)
								.forEach(dc => {

									dcOptions.push({
										id: dc.id,
										value: dc.label
									});	

								});

							}
						}

						$viewCond.$$(ids.inputValue).$$(ids.dataCollection).define("options", dcOptions);
						$viewCond.$$(ids.inputValue).$$(ids.dataCollection).refresh();

						// Show the new value inputs
						$viewCond.$$(ids.inputValue).showBatch("dataCollection");
						break;

					default:
						// Show the default value inputs
						$viewCond.$$(ids.inputValue).showBatch(batchName);
						break;
				}

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

			onChange: () => {

				if (!this.__blockOnChange) {

					// refresh config settings before notify
					_logic.getValue();

					_logic.callbacks.onChange();

				}

				return false;
			},

			blockOnChange: () => {
				this.__blockOnChange = true;
			},

			unblockOnChange: () => {
				this.__blockOnChange = false;
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

						/* field id */
						var fieldId = $fieldElem.getValue();
						if (!fieldId) return;

						/* alias */
						var alias;
						var selectedOpt = $viewCond.$$(ids.field).getPopup().config.body.data.filter(opt => opt.id == fieldId)[0];
						if (selectedOpt)
							alias = selectedOpt.alias || undefined;

						/* rule */
						var rule = null,
							ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
							$viewComparer = $viewCond.$$(ids.rule).queryView({ id: ruleViewId });
						if ($viewComparer && $viewComparer.getValue)
							rule = $viewComparer.getValue();

						/* value */
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

						// Convert date format
						if (value instanceof Date) {
							value = value.toISOString();
						}

						config_settings.rules.push({
							alias: alias || undefined,
							key: fieldId,
							rule: rule,
							value: value
						});

					});
				}

				return config_settings;

			},



			setValue: (settings) => {

				// block .onChange event
				_logic.blockOnChange();

				config_settings = _.cloneDeep(settings || {});

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

					var field = _Fields.filter(col => col.id == f.key)[0];

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
					
					// if (f.rule == "in_query_field" || f.rule == "not_in_query_field" || f.rule == "same_as_field" || f.rule == "not_same_as_field") {
					$viewCond.blockEvent();
					_logic.onChangeRule(f.rule, $viewCond);
					$viewCond.unblockEvent();
					// }

					// Input
					var valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
						$viewConditionValue = $viewCond.$$(ids.inputValue).queryView({ id: valueViewId });
					if ($viewConditionValue && $viewConditionValue.setValue) {

						// convert to Date object
						if (field && field.key == 'date' && f.value) {
							$viewConditionValue.define('value', new Date(f.value));
						}
						else {
							$viewConditionValue.define('value', f.value);
						}

						$viewConditionValue.refresh();
					}
					else if ($viewConditionValue && $viewConditionValue.getChildViews()) {
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

					if (field && field.key == 'user') {
						$viewCond.blockEvent();
						_logic.onChangeRule(f.rule, $viewCond);
						$viewCond.blockEvent();
					}

				});

				// unblock .onChange event
				_logic.unblockOnChange();

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

				if (rowData == null)
					return false;

				var result = (config_settings.glue === "and" ? true : false);

				config_settings.rules.forEach(filter => {

					if (!filter.key || !filter.rule) return;

					var fieldInfo = _Fields.filter(f => f.id == filter.key)[0];
					if (!fieldInfo) return;

					var condResult;
					
					if (typeof fieldInfo.key == "undefined" && fieldInfo.id != "this_object")
						fieldInfo.key = "connectField"; // if you are looking at the parent object it won't have a key to analyze

					switch (fieldInfo.key) {
						case "string":
						case "LongText":
						case "email":
							condResult = _logic.textValid(rowData, fieldInfo.columnName, filter.rule, filter.value);
							break;
						case "date":
						case "datetime":
							condResult = _logic.dateValid(rowData, fieldInfo.columnName, filter.rule, filter.value);
							break;
						case "number":
							condResult = _logic.numberValid(rowData, fieldInfo.columnName, filter.rule, filter.value);
							break;
						case "list":
							condResult = _logic.listValid(rowData, fieldInfo.columnName, filter.rule, filter.value);
							break;
						case "boolean":
							condResult = _logic.booleanValid(rowData, fieldInfo.columnName, filter.rule, filter.value);
							break;
						case "user":
							condResult = _logic.userValid(rowData, fieldInfo.columnName, filter.rule, filter.value);
							break;
						case "connectField":
						case "connectObject":
							condResult = _logic.connectFieldValid(rowData, fieldInfo.relationName(), filter.rule, filter.value);
							break;
					}

					if (config_settings.glue === "and") {
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

			textValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				var value = getFieldVal(rowData, columnName);
				if (value == null)
					value = "";

				value = value.trim().toLowerCase();
				value = _logic.removeHtmlTags(value); // remove html tags - rich text editor

				compareValue = compareValue.trim().toLowerCase().replace(/  +/g, ' ');

				// support "john smith" => "john" OR/AND "smith"
				var compareArray = compareValue.split(' ');

				switch (rule) {
					case "contains":
						compareArray.forEach(val => {
							if (result == false) // OR
								result = value.indexOf(val) > -1;
						});
						break;
					case "not_contains":
						result = true; 
						compareArray.forEach(val => {
							if (result == true) // AND
								result = value.indexOf(val) < 0;
						});
						break;
					case "equals":
						compareArray.forEach(val => {
							if (result == false) // OR
								result = value == val;
						});
						break;
					case "not_equal":
						result = true; 
						compareArray.forEach(val => {
							if (result == true) // AND
								result = value != val;
						});
						break;
					default:
						result = _logic.queryValid(rowData, rule, compareValue);
						break;
				}

				return result;

			},

			dateValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				var value = getFieldVal(rowData, columnName);
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
					default:
						result = _logic.queryValid(rowData, rule, compareValue);
						break;

				}

				return result;

			},

			numberValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				var value = getFieldVal(rowData, columnName);
				value = Number(value);
				compareValue = Number(compareValue);

				switch (rule) {
					case "equals":
						result = value == compareValue;
						break;
					case "not_equal":
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
					default:
						result = _logic.queryValid(rowData, rule, compareValue);
						break;

				}

				return result;

			},

			listValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				var value = getFieldVal(rowData, columnName);

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
					default:
						result = _logic.queryValid(rowData, rule, compareValue);
						break;

				}

				return result;

			},

			booleanValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				var value = getFieldVal(rowData, columnName);

				switch (rule) {
					case "equals":
						result = value == compareValue;
						break;
					default:
						result = _logic.queryValid(rowData, rule, compareValue);
						break;
				}

				return result;

			},

			userValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				var value = getFieldVal(rowData, columnName);

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
					default:
						result = _logic.queryValid(rowData, rule, compareValue);
						break;

				}

				return result;
			},

			queryValid: function(rowData, rule, compareValue) {

				var result = false;

				if (!compareValue)
					return result;

				// queryId:fieldId
				var queryId = compareValue.split(":")[0],
					fieldId = compareValue.split(":")[1];

				// if no query
				var query = _Object.application.queries(q => q.id == queryId)[0];
				if (!query)
					return result;

				// if no field
				var field = query.fields(f => f.id == fieldId)[0];
				if (!field)
					return result;

				let qIdBase = "{idBase}-query-field-{id}".replace("{idBase}", idBase).replace("{id}", query.id),
					inQueryFieldFilter = new RowFilter(App, qIdBase);
				inQueryFieldFilter.objectLoad(query);
				inQueryFieldFilter.setValue(query.workspaceFilterConditions);

				switch (rule) {
					case 'in_query_field':
						result = inQueryFieldFilter.isValid(rowData);
						break;
					case 'not_in_query_field':
						result = !inQueryFieldFilter.isValid(rowData);
						break;
				}

				return result;

			},

			inQueryValid: function(rowData, columnName, rule, compareValue) {

				let result = false;
				
				if (columnName) {
					rowData = rowData[columnName] || {};
				}

				if (!compareValue)
					return result;

				// if no query
				let query = _Object.application.queries(q => q.id == compareValue)[0];
				if (!query)
					return result;

				let qIdBase = "{idBase}-query-{id}".replace("{idBase}", idBase).replace("{id}", query.id),
					inQueryFilter = new RowFilter(App, qIdBase);
				inQueryFilter.objectLoad(query);
				inQueryFilter.setValue(query.workspaceFilterConditions);

				switch (rule) {
					case 'in_query':
						result = inQueryFilter.isValid(rowData);
						break;
					case 'not_in_query':
						result = !inQueryFilter.isValid(rowData);
						break;
				}

				return result;

			},

			dataCollectionValid: function (rowData, columnName, rule, compareValue) {

				var result = false;

				if (!compareValue)
					return result;

				if (!_View)
					return result;
					
				if (columnName) {
					rowData = rowData[columnName] || {};
				}

				var dataview = _View.application.dataviews(dv => dv.id == compareValue)[0];
					
				switch (rule) {
					case 'in_data_collection':
						if (!dataview)
							return false;
							
						result = (dataview.getData(d => d.id == rowData.id).length > 0);
						break;
					case 'not_in_data_collection':
						if (!dataview)
							return true;
							
						result = (dataview.getData(d => d.id == rowData.id).length < 1);
						break;
				}
				
				return result;

			},
			
			connectFieldValid: function(rowData, columnName, rule, compareValue) {

				switch (rule) {
					case 'contains':
						return (rowData[columnName].id || rowData[columnName]).toString().indexOf(compareValue) > -1
						break;
					case 'not_contains':
						return (rowData[columnName].id || rowData[columnName]).toString().indexOf(compareValue) == -1;
						break;
					case 'equals':
						return (rowData[columnName].id || rowData[columnName]).toString() == compareValue;
						break;
					case 'not_equal':
						return (rowData[columnName].id || rowData[columnName]).toString() != compareValue;
						break;
					case 'in_query':
					case 'not_in_query':
						return _logic.inQueryValid(rowData, columnName, rule, compareValue);
						break;
					case "is_current_user":
					case "is_not_current_user":
						return _logic.userValid(rowData, columnName, rule, compareValue);
						break;
					case 'in_data_collection':
					case 'not_in_data_collection':
						return _logic.dataCollectionValid(rowData, columnName, rule, compareValue);
						break;
				}
				
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
		this.viewLoad = _logic.viewLoad;
		this.addNewFilter = _logic.addNewFilter;
		this.getValue = _logic.getValue;
		this.setValue = _logic.setValue;
		this.isValid = _logic.isValid;

	}

}