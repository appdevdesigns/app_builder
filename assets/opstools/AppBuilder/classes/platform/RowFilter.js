const RowFilterCore = require("../core/RowFilterCore");

module.exports = class RowFilter extends RowFilterCore {
   constructor(App, idBase) {
      idBase = idBase || "ab_row_filter";

      super(App, idBase);

      let L = this.Label;

      let labels = (this.labels = {
         common: (App || {}).labels,
         component: {
            and: L("ab.filter_fields.and", "*And"),
            or: L("ab.filter_fields.or", "*Or"),
            addNewFilter: L("ab.filter_fields.addNewFilter", "*Add a filter"),

            thisObject: L("ab.filter_fields.thisObject", "*This Object"),
            inQuery: L("ab.filter_fields.inQuery", "*In Query"),
            notInQuery: L("ab.filter_fields.notInQuery", "*Not In Query"),
            inQueryField: L("ab.filter_fields.inQueryField", "*By Query Field"),
            notInQueryField: L(
               "ab.filter_fields.notInQueryField",
               "*Not By Query Field"
            ),

            inQueryFieldQueryPlaceholder: L(
               "ab.filter_fields.inQueryFieldQueryPlaceholder",
               "*Choose a Query"
            ),
            inQueryFieldFieldPlaceholder: L(
               "ab.filter_fields.inQueryFieldFieldPlaceholder",
               "*Choose a Field"
            ),

            sameAsUser: L("ab.filter_fields.sameAsUser", "*Same As User"),
            notSameAsUser: L(
               "ab.filter_fields.notSameAsUser",
               "*Not Same As User"
            ),

            sameAsField: L("ab.filter_fields.sameAsFild", "*Same As Field"),
            notSameAsField: L("ab.filter_fields.notSameAsFild", "*Not Field"),

            inDataCollection: L(
               "ab.filter_fields.inDataCollection",
               "*In Data Collection"
            ),
            notInDataCollection: L(
               "ab.filter_fields.notInDataCollection",
               "*Not In Data Collection"
            ),

            containsCondition: L(
               "ab.filter_fields.containsCondition",
               "*contains"
            ),
            notContainCondition: L(
               "ab.filter_fields.notContainCondition",
               "*doesn't contain"
            ),
            isCondition: L("ab.filter_fields.isCondition", "*is"),
            isNotCondition: L("ab.filter_fields.isNotCondition", "*is not"),
            isEmpty: L("ab.filter_fields.isEmptyCondition", "*is empty"),
            isNotEmpty: L(
               "ab.filter_fields.isNotEmptyCondition",
               "*is not empty"
            ),

            beforeCondition: L(
               "ab.filter_fields.beforeCondition",
               "*is before"
            ),
            afterCondition: L("ab.filter_fields.afterCondition", "*is after"),
            onOrBeforeCondition: L(
               "ab.filter_fields.onOrBeforeCondition",
               "*is on or before"
            ),
            onOrAfterCondition: L(
               "ab.filter_fields.onOrAfterCondition",
               "*is on or after"
            ),
            beforeCurrentCondition: L(
               "ab.filter_fields.beforeCurrentCondition",
               "*is before current date"
            ),
            afterCurrentCondition: L(
               "ab.filter_fields.afterCurrentCondition",
               "*is after current date"
            ),
            onOrBeforeCurrentCondition: L(
               "ab.filter_fields.onOrBeforeCurrentCondition",
               "*is on or before current date"
            ),
            onOrAfterCurrentCondition: L(
               "ab.filter_fields.onOrAfterCurrentCondition",
               "*is on or after current date"
            ),
            onLastDaysCondition: L(
               "ab.filter_fields.onLastDaysCondition",
               "*last ... days"
            ),
            onNextDaysCondition: L(
               "ab.filter_fields.onNextDaysCondition",
               "*next ... days"
            ),

            equalCondition: L("ab.filter_fields.equalCondition", ":"),
            notEqualCondition: L("ab.filter_fields.notEqualCondition", "≠"),
            lessThanCondition: L("ab.filter_fields.lessThanCondition", "<"),
            moreThanCondition: L("ab.filter_fields.moreThanCondition", ">"),
            lessThanOrEqualCondition: L(
               "ab.filter_fields.lessThanOrEqualCondition",
               "≤"
            ),
            moreThanOrEqualCondition: L(
               "ab.filter_fields.moreThanOrEqualCondition",
               "≥"
            ),

            equalListCondition: L(
               "ab.filter_fields.equalListCondition",
               "*equals"
            ),
            notEqualListCondition: L(
               "ab.filter_fields.notEqualListCondition",
               "*does not equal"
            ),

            checkedCondition: L(
               "ab.filter_fields.checkedCondition",
               "*is checked"
            ),
            notCheckedCondition: L(
               "ab.filter_fields.notCheckedCondition",
               "*is not checked"
            ),

            isCurrentUserCondition: L(
               "ab.filter_fields.isCurrentUserCondition",
               "*is current user"
            ),
            isNotCurrentUserCondition: L(
               "ab.filter_fields.isNotCurrentUserCondition",
               "*is not current user"
            ),
            containsCurrentUserCondition: L(
               "ab.filter_fields.containsCurrentUserCondition",
               "*contains current user"
            ),
            notContainsCurrentUserCondition: L(
               "ab.filter_fields.notContainsCurrentUserCondition",
               "*does not contain current user"
            )
         }
      });

      // internal list of Webix IDs to reference our UI components.
      let ids = (this.ids = {
         component: this.unique(idBase + "_rowFilter"),
         filterForm: this.unique(idBase + "_rowFilter_form"),
         addNewFilter: this.unique(idBase + "_rowFilter_addNewFilter"),

         glue: this.unique(idBase + "_rowFilter_glue"),
         field: this.unique(idBase + "_rowFilter_field"),
         rule: this.unique(idBase + "_rowFilter_rule"),
         inputValue: this.unique(idBase + "_rowFilter_inputValue"),

         queryCombo: this.unique(idBase + "_rowFilter_queryCombo"),
         queryFieldCombo: this.unique(idBase + "_rowFilter_queryFieldCombo"),
         queryFieldComboQuery: this.unique(
            idBase + "_rowFilter_queryFieldComboQuery"
         ),
         queryFieldComboField: this.unique(
            idBase + "_rowFilter_queryFieldComboField"
         ),
         fieldMatch: this.unique(idBase + "_rowFilter_fieldMatchCombo"),

         dataCollection: this.unique(idBase + "_rowFilter_dataCollection"),

         listOptions: this.unique(idBase + "_rowFilter_listOptions"),

         datePicker: this.unique(idBase + "_rowFilter_datePicker")
      });

      // Set current username
      this.Account.username = OP.User.username();

      var batchName; // we need to revert to this default when switching away from a in/by query field

      // Default options list to push to all fields
      this.queryFieldOptions = [
         {
            value: this.labels.component.inQueryField,
            id: "in_query_field"
         },
         {
            value: this.labels.component.notInQueryField,
            id: "not_in_query_field"
         }
      ];

      this.recordRuleOptions = [];
      this.recordRuleFieldOptions = [];

      let _logic = this._logic || {};

      /**
       * @method getFieldList
       * return field list to render options
       */
      _logic.getFieldList = () => {
         return (this._Fields || []).map((f) => {
            let label = f.label;

            // include object's name to options
            if (this._settings.showObjectName && f.object) {
               label = f.object.label + "." + f.label;
            }

            return {
               id: f.id,
               value: label,
               alias: f.alias || undefined // ABObjectQuery
            };
         });
      };

      _logic.getFilterUI = () => {
         let instance = this;
         let config_settings = this.config_settings || {};
         let labels = this.labels;

         return {
            id: "f" + webix.uid(),
            isolate: true,
            cols: [
               {
                  // Add / Or
                  view: "combo",
                  id: ids.glue,
                  width: 80,
                  value: config_settings.glue || "and",
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
                     onChange: function(newVal, oldVal) {
                        _logic.selectCombineCondition(newVal);
                     }
                  }
               },
               {
                  // Field list
                  view: "combo",
                  id: ids.field,
                  suggest: {
                     on: {
                        onBeforeShow: function() {
                           this.define("width", 400);
                           this.resize();
                        }
                     },
                     data: _logic.getFieldList()
                  },
                  on: {
                     onChange: function(columnId) {
                        var $viewCond = this.getParentView();
                        _logic.selectField(columnId, $viewCond);
                     }
                  }
               },
               // Comparer
               {
                  id: ids.rule,
                  width: 220,
                  cells: [
                     {},
                     // Query
                     {
                        batch: "query",
                        view: "combo",
                        value: "in_query",
                        options: [
                           {
                              value: labels.component.inQuery,
                              id: "in_query"
                           },
                           {
                              value: labels.component.notInQuery,
                              id: "not_in_query"
                           },
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
                              id: "same_as_user"
                           },
                           {
                              value: labels.component.notSameAsUser,
                              id: "not_same_as_user"
                           },
                           {
                              value: labels.component.inDataCollection,
                              id: "in_data_collection"
                           },
                           {
                              value: labels.component.notInDataCollection,
                              id: "not_in_data_collection"
                           }
                        ].concat(instance.recordRuleOptions),
                        on: {
                           onChange: function(condition, oldValue) {
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
                              value: labels.component.equalListCondition,
                              id: "equals"
                           },
                           {
                              value: labels.component.notEqualListCondition,
                              id: "not_equal"
                           },
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
                           },
                           {
                              value: labels.component.beforeCurrentCondition,
                              id: "less_current"
                           },
                           {
                              value: labels.component.afterCurrentCondition,
                              id: "greater_current"
                           },
                           {
                              value:
                                 labels.component.onOrBeforeCurrentCondition,
                              id: "less_or_equal_current"
                           },
                           {
                              value: labels.component.onOrAfterCurrentCondition,
                              id: "greater_or_equal_current"
                           },
                           {
                              value: labels.component.onLastDaysCondition,
                              id: "last_days"
                           },
                           {
                              value: labels.component.onNextDaysCondition,
                              id: "next_days"
                           }
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
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
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
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
                              value: labels.component.equalListCondition,
                              id: "equals"
                           },
                           {
                              value: labels.component.notEqualListCondition,
                              id: "not_equal"
                           },
                           {
                              value: labels.component.sameAsUser,
                              id: "same_as_user"
                           },
                           {
                              value: labels.component.notSameAsUser,
                              id: "not_same_as_user"
                           }
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
                        on: {
                           onChange: function(condition, oldValue) {
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
                           },
                           {
                              value: labels.component.notEqualListCondition,
                              id: "not_equal"
                           }
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
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
                              value:
                                 labels.component.containsCurrentUserCondition,
                              id: "contain_current_user"
                           },
                           {
                              value:
                                 labels.component
                                    .notContainsCurrentUserCondition,
                              id: "not_contain_current_user"
                           },
                           {
                              value: labels.component.equalListCondition,
                              id: "equals"
                           },
                           {
                              value: labels.component.notEqualListCondition,
                              id: "not_equal"
                           }
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
                        on: {
                           onChange: function(condition) {
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
                           },
                           {
                              value: labels.component.isEmpty,
                              id: "is_empty"
                           },
                           {
                              value: labels.component.isNotEmpty,
                              id: "is_not_empty"
                           }
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
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
                        ]
                           .concat(instance.queryFieldOptions)
                           .concat(instance.recordRuleOptions),
                        on: {
                           onChange: function(condition) {
                              var $viewComparer = this.getParentView();
                              var $viewCond = $viewComparer.getParentView();
                              _logic.onChangeRule(condition, $viewCond);
                              _logic.onChange();
                           }
                        }
                     }
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
                              placeholder:
                                 labels.component.inQueryFieldQueryPlaceholder,
                              on: {
                                 onChange: function(value) {
                                    var $viewComparer = this.getParentView();
                                    var $viewCond = $viewComparer
                                       .getParentView()
                                       .getParentView();
                                    _logic.onChangeQueryFieldCombo(
                                       value,
                                       $viewCond
                                    );

                                    _logic.onChange();
                                 }
                              }
                           },
                           {
                              id: ids.queryFieldComboField,
                              view: "combo",
                              options: [],
                              placeholder:
                                 labels.component.inQueryFieldFieldPlaceholder,
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
                           onChange: function() {
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
                           onTimedKeyPress: function() {
                              if (this.validate()) _logic.onChange();
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
                           onChange: function() {
                              _logic.onChange();
                           }
                        }
                     },
                     // Boolean
                     {
                        batch: "boolean",
                        view: "checkbox",
                        on: {
                           onChange: function() {
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
                           onChange: function() {
                              _logic.onChange();
                           }
                        }
                     },
                     // String
                     {
                        batch: "string",
                        view: "text",
                        on: {
                           onTimedKeyPress: function() {
                              _logic.onChange();
                           }
                        }
                     },
                     // Email
                     {
                        batch: "email",
                        view: "text",
                        on: {
                           onTimedKeyPress: function() {
                              _logic.onChange();
                           }
                        }
                     }
                  ]
               },
               {
                  view: "button",
                  css: "webix_primary",
                  icon: "fa fa-plus",
                  type: "icon",
                  autowidth: true,
                  click: function() {
                     var $viewForm = this.getFormView();

                     var indexView = $viewForm.index(this.getParentView());

                     _logic.addNewFilter(indexView + 1);
                  }
               },
               {
                  view: "button",
                  css: "webix_danger",
                  icon: "fa fa-trash",
                  type: "icon",
                  autowidth: true,
                  click: function() {
                     var $viewCond = this.getParentView();

                     _logic.removeNewFilter($viewCond);
                  }
               }
            ]
         };
      };

      _logic.getAddButtonUI = () => {
         return {
            view: "button",
            id: ids.addNewFilter,
            css: "webix_primary",
            type: "form",
            label: labels.component.addNewFilter,
            click: () => {
               _logic.addNewFilter();
            }
         };
      };

      _logic.addNewFilter = (index, fieldId) => {
         var viewId;
         var ui = _logic.getFilterUI();

         var $viewForm = $$(ids.filterForm);
         if ($viewForm) {
            viewId = $viewForm.addView(ui, index);

            _logic.toggleAddNewButton();

            // select a option of field
            if (fieldId) _logic.selectField(fieldId, $$(viewId), true);
         }

         return viewId;
      };

      _logic.removeNewFilter = function($viewCond) {
         var $viewForm = $$(ids.filterForm);

         $viewForm.removeView($viewCond);

         _logic.toggleAddNewButton();

         _logic.onChange();
      };

      _logic.toggleAddNewButton = function() {
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
      };

      _logic.selectCombineCondition = (val, ignoreNotify) => {
         // define combine value to configuration
         this.config_settings.glue = val;

         // update value of every combine conditions
         var $viewConds = $$(ids.filterForm).getChildViews();
         $viewConds.forEach((v) => {
            if (v.$$ && v.$$(ids.glue)) v.$$(ids.glue).setValue(val);
         });

         if (!ignoreNotify) _logic.onChange();
      };

      _logic.selectField = (columnId, $viewCond, ignoreNotify) => {
         if (!this._Fields) return;

         var field = this._Fields.filter((f) => f.id == columnId)[0];
         if (!field) return;

         // switch view
         batchName = field.key;
         if (field.id == "this_object") batchName = "query";
         // Special this object query
         else if (batchName == "LongText" || batchName == "combined")
            batchName = "string";
         else if (field.key == "formula") batchName = "number";
         var isQueryField =
            this._QueryFields.filter((f) => {
               return f.id == field.id;
            }).length > 0;
         if (isQueryField) {
            // we chose a connectField which is now a Query type
            batchName = "query";
         }
         $viewCond.$$(ids.rule).showBatch(batchName);
         $viewCond.$$(ids.inputValue).showBatch(batchName);

         let options = [];
         let Queries = [];

         // populate the list of Queries for this_object:
         if (field.id == "this_object" && this._Object) {
            Queries = this.queries((q) => q.canFilterObject(this._Object));
         }
         // populate the list of Queries for a query field
         else if (isQueryField) {
            Queries = this.queries((q) => {
               return (
                  (this._Object ? this._Object.id : "") != q.id && // Prevent filter looping
                  q.canFilterObject(field.datasourceLink)
               );
            });
         }

         Queries.forEach((q) => {
            options.push({
               id: q.id,
               value: q.label
            });
         });
         $viewCond
            .$$(ids.inputValue)
            .$$(ids.queryCombo)
            .define("options", options);
         $viewCond
            .$$(ids.inputValue)
            .$$(ids.queryCombo)
            .refresh();

         // populate options of list
         if (field.key == "list") {
            let listOptions = field.settings.options.map(function(x) {
               return {
                  id: x.id,
                  value: x.text
               };
            });

            $viewCond
               .$$(ids.inputValue)
               .$$(ids.listOptions)
               .define("options", listOptions);
            $viewCond
               .$$(ids.inputValue)
               .$$(ids.listOptions)
               .refresh();
         }
         // set format of datepicker
         else if (field.key == "date") {
            $viewCond
               .$$(ids.inputValue)
               .$$(ids.datePicker)
               .define("format", field.getFormat());
            $viewCond
               .$$(ids.inputValue)
               .$$(ids.datePicker)
               .refresh();
         }

         var rule = null,
            ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
            $viewComparer = $viewCond
               .$$(ids.rule)
               .queryView({ id: ruleViewId });
         if ($viewComparer && $viewComparer.getList) {
            let defaultOpt = ($viewComparer.getList().config.data || [])[0];
            if (defaultOpt) {
               $viewComparer.setValue(defaultOpt.id);
            }

            // rule = $viewComparer.getValue();
            // if (rule == "in_query_field" || rule == "not_in_query_field") {
            // 	// Show the new value inputs
            // 	$viewCond.$$(ids.inputValue).showBatch("queryField");
            // } else if (rule == "same_as_field" || rule == "not_same_as_field") {
            // 	// Show the new value inputs
            // 	$viewCond.$$(ids.inputValue).showBatch("fieldMatch");
            // }
         }

         if (!ignoreNotify) _logic.onChange();
      };

      _logic.onChangeRule = (rule, $viewCond, notify = false) => {
         switch (rule) {
            case "contains":
            case "not_contains":
            case "equals":
            case "not_equal":
               // For "connect_fields" search by CUSTOM index value
               if (batchName == "query") {
                  $viewCond.$$(ids.inputValue).showBatch("string");
               }
               // If want to call notify or call .onChange(), then pass notify is true.
               // _logic.onChange();
               break;

            case "is_current_user":
            case "is_not_current_user":
            case "contain_current_user":
            case "not_contain_current_user":
            case "same_as_user":
            case "not_same_as_user":
            case "less_current":
            case "greater_current":
            case "less_or_equal_current":
            case "greater_or_equal_current":
            case "is_empty":
            case "is_not_empty":
               // clear and disable the value field
               $viewCond.$$(ids.inputValue).showBatch("empty");
               _logic.onChange();
               break;

            case "last_days":
            case "next_days":
               // Show the number input
               $viewCond.$$(ids.inputValue).showBatch("number");
               break;

            case "in_query_field":
            case "not_in_query_field":
               // populate the list of Queries for this_object:
               var options = [];

               // Get all application's queries
               this.queries(
                  (q) => this._Object == null || q.id != this._Object.id
               ).forEach((q) => {
                  options.push({
                     id: q.id,
                     value: q.label
                  });
               });

               $viewCond
                  .$$(ids.inputValue)
                  .$$(ids.queryFieldComboQuery)
                  .define("options", options);
               $viewCond
                  .$$(ids.inputValue)
                  .$$(ids.queryFieldComboQuery)
                  .refresh();

               // Show the new value inputs
               $viewCond.$$(ids.inputValue).showBatch("queryField");
               break;

            case "same_as_field":
            case "not_same_as_field":
               $viewCond
                  .$$(ids.inputValue)
                  .$$(ids.fieldMatch)
                  .define("options", recordRuleFieldOptions);
               $viewCond
                  .$$(ids.inputValue)
                  .$$(ids.fieldMatch)
                  .refresh();

               // Show the new value inputs
               $viewCond.$$(ids.inputValue).showBatch("fieldMatch");
               break;

            case "in_data_collection":
            case "not_in_data_collection":
               let dcOptions = [];

               // pull data collection list

               // get id of the link object
               let linkObjectId,
                  columnId = $viewCond.$$(ids.field).getValue();
               if (columnId == "this_object" && this._Object) {
                  linkObjectId = this._Object.id;
               } else {
                  let field = this._Fields.filter((f) => f.id == columnId)[0];
                  if (field) linkObjectId = field.settings.linkObject;
               }

               if (this._Application && linkObjectId) {
                  this._Application
                     .datacollections(
                        (dc) =>
                           dc.datasource && dc.datasource.id == linkObjectId
                     )
                     .forEach((dc) => {
                        dcOptions.push({
                           id: dc.id,
                           value: dc.label
                        });
                     });
               }

               $viewCond
                  .$$(ids.inputValue)
                  .$$(ids.dataCollection)
                  .define("options", dcOptions);
               $viewCond
                  .$$(ids.inputValue)
                  .$$(ids.dataCollection)
                  .refresh();

               // Show the new value inputs
               $viewCond.$$(ids.inputValue).showBatch("dataCollection");
               break;

            default:
               // Show the default value inputs
               $viewCond.$$(ids.inputValue).showBatch(batchName);

               if (notify) _logic.onChange();

               break;
         }
      };

      _logic.onChangeQueryFieldCombo = (value, $viewCond) => {
         // populate the list of Queries for this_object:
         let options = [];
         // Get all queries fields
         let Query = this.queries((q) => {
            return q.id == value;
         })[0];
         if (Query) {
            Query.fields((f) => {
               return f.key != "connectObject";
            }).forEach((q) => {
               options.push({
                  id: q.id,
                  value: q.object.label + "." + q.label
               });
            });

            $viewCond
               .$$(ids.inputValue)
               .$$(ids.queryFieldComboField)
               .define("options", options);
            $viewCond
               .$$(ids.inputValue)
               .$$(ids.queryFieldComboField)
               .refresh();
         }

         // _logic.onChange();
      };

      _logic.onChange = () => {
         if (!this.__blockOnChange) {
            // refresh config settings before notify
            _logic.getValue();

            _logic.callbacks.onChange();
         }

         return false;
      };

      _logic.blockOnChange = () => {
         this.__blockOnChange = true;
      };

      _logic.unblockOnChange = () => {
         this.__blockOnChange = false;
      };

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
      _logic.getValue = () => {
         let config_settings = {
            glue: "and",
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
               var selectedOpt = $viewCond
                  .$$(ids.field)
                  .getPopup()
                  .config.body.data.filter((opt) => opt.id == fieldId)[0];
               if (selectedOpt) alias = selectedOpt.alias || undefined;

               /* rule */
               var rule = null,
                  ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
                  $viewComparer = $viewCond
                     .$$(ids.rule)
                     .queryView({ id: ruleViewId });
               if ($viewComparer && $viewComparer.getValue)
                  rule = $viewComparer.getValue();

               /* value */
               var value = null,
                  valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
                  $viewConditionValue = $viewCond
                     .$$(ids.inputValue)
                     .queryView({ id: valueViewId });
               if ($viewConditionValue && $viewConditionValue.getValue) {
                  value = $viewConditionValue.getValue();
               } else if (
                  $viewConditionValue &&
                  $viewConditionValue.getChildViews()
               ) {
                  var vals = [];
                  $viewConditionValue.getChildViews().forEach((element) => {
                     vals.push($$(element).getValue());
                  });
                  value = vals.join(":");
               }

               // Convert date format
               if (value instanceof Date) {
                  let dateField = this._Fields.filter(
                     (f) => f.id == fieldId
                  )[0];
                  if (dateField) {
                     value = dateField.exportValue(value);
                  } else {
                     value = value.toISOString();
                  }
               }

               config_settings.rules.push({
                  alias: alias || undefined,
                  key: fieldId,
                  rule: rule,
                  value: value
               });
            });
         }

         this.config_settings = config_settings;

         return this.config_settings;
      };

      // webix UI definition:
      this.ui = {
         id: ids.component,
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
   }

   // setting up UI
   init(options) {
      super.init(options);

      // register our callbacks:
      for (var c in this._logic.callbacks) {
         this._logic.callbacks[c] = options[c] || this._logic.callbacks[c];
      }

      if (options.showObjectName)
         this._settings.showObjectName = options.showObjectName;

      if (options.isRecordRule) {
         this.recordRuleOptions = [
            {
               value: this.labels.component.sameAsField,
               id: "same_as_field"
            },
            {
               value: this.labels.component.notSameAsField,
               id: "not_same_as_field"
            }
         ];
         this.recordRuleFieldOptions = options.fieldOptions;
      }
   }

   setValue(settings) {
      settings = settings || {};

      super.setValue(settings);

      let ids = this.ids;
      let logic = this._logic;

      // block .onChange event
      logic.blockOnChange();

      let config_settings = _.cloneDeep(settings);
      config_settings.rules = config_settings.rules || [];

      // Redraw form with no elements
      var $viewForm = $$(ids.filterForm);
      if ($viewForm) webix.ui([], $viewForm);

      // Add "new filter" button
      if (config_settings.rules.length == 0) {
         logic.toggleAddNewButton();
      }

      config_settings.rules.forEach((f) => {
         var viewId = logic.addNewFilter(),
            $viewCond = $$(viewId);

         if ($viewCond == null) return;

         var field = this._Fields.filter((col) => col.id == f.key)[0];

         // "and" "or"
         $viewCond.$$(ids.glue).define("value", config_settings.glue);
         $viewCond.$$(ids.glue).refresh();

         // Select Field
         $viewCond.$$(ids.field).define("value", f.key);
         $viewCond.$$(ids.field).refresh();
         logic.selectField(f.key, $viewCond, true);

         // Comparer
         var ruleViewId = $viewCond.$$(ids.rule).getActiveId(),
            $viewComparer = $viewCond
               .$$(ids.rule)
               .queryView({ id: ruleViewId });
         if ($viewComparer && $viewComparer.setValue) {
            $viewComparer.define("value", f.rule);
            $viewComparer.refresh();
         }

         // if (f.rule == "in_query_field" || f.rule == "not_in_query_field" || f.rule == "same_as_field" || f.rule == "not_same_as_field") {
         $viewCond.blockEvent();
         logic.onChangeRule(f.rule, $viewCond);
         $viewCond.unblockEvent();
         // }

         // Input
         var valueViewId = $viewCond.$$(ids.inputValue).getActiveId(),
            $viewConditionValue = $viewCond
               .$$(ids.inputValue)
               .queryView({ id: valueViewId });
         if ($viewConditionValue && $viewConditionValue.setValue) {
            // convert to Date object
            if (
               field &&
               field.key == "date" &&
               f.value &&
               (f.rule == "less" ||
                  f.rule == "greater" ||
                  f.rule == "less_or_equal" ||
                  f.rule == "greater_or_equal")
            ) {
               $viewConditionValue.define("value", new Date(f.value));
            } else {
               $viewConditionValue.define("value", f.value);
            }

            $viewConditionValue.refresh();
         } else if (
            $viewConditionValue &&
            $viewConditionValue.getChildViews()
         ) {
            var vals = f.value.split(":");
            var index = 0;
            $viewConditionValue.getChildViews().forEach((element) => {
               $$(element).blockEvent();
               $$(element).setValue(vals[index]);
               if (index == 0) {
                  logic.onChangeQueryFieldCombo(vals[index], $viewCond);
               }
               $$(element).unblockEvent();
               // $$(element).refresh();
               index++;
            });
         }

         if (field && field.key == "user") {
            $viewCond.blockEvent();
            logic.onChangeRule(f.rule, $viewCond);
            $viewCond.blockEvent();
         }
      });

      // unblock .onChange event
      logic.unblockOnChange();
   }
};

