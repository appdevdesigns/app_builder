steal(
    // List your Controller's dependencies here:
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/ad',
                'appdev/control/control').then(function () {

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.BuildApp.DataTableFilterPopup', {


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.data = {};

                            this.componentIds = {
                                filterPopup: 'ab-filter-popup',
                                filterForm: 'ab-filter-form'
                            };

                            this.initWebixControls();
                        },

                        initWebixControls: function () {
                            var self = this;

                            webix.protoUI({
                                id: self.componentIds.filterPopup,
                                name: "filter_popup",
                                $init: function (config) {
                                    //functions executed on component initialization
                                    self.combineCondition = 'And';
                                },
                                defaults: {
                                    width: 800,
                                    body: {
                                        id: self.componentIds.filterForm,
                                        view: "form",
                                        autoheight: true,
                                        elements: [{
                                            view: "button", value: "Add a filter", click: function () {
                                                this.getTopParentView().addNewFilter();
                                            }
                                        }]
                                    },
                                    on: {
                                        onShow: function () {
                                            if ($$(self.componentIds.filterForm).getChildViews().length < 2)
                                                $$(self.componentIds.filterForm).getTopParentView().addNewFilter();
                                        }
                                    }
                                },
                                addNewFilter: function () {
                                    var viewIndex = $$(self.componentIds.filterForm).getChildViews().length - 1;

                                    $$(self.componentIds.filterForm).addView({
                                        id: 'f' + webix.uid(),
                                        cols: [
                                            {
                                                // Add / Or
                                                view: "combo", value: self.combineCondition, options: ["And", "Or"], css: 'combine-condition', width: 80, on: {
                                                    "onChange": function (newValue, oldValue) {
                                                        self.combineCondition = newValue;

                                                        var filterList = $('.combine-condition').webix_combo();

                                                        if ($.isArray(filterList)) {
                                                            filterList.forEach(function (elm) {
                                                                elm.setValue(newValue);
                                                            });
                                                        }
                                                        else {
                                                            filterList.setValue(newValue);
                                                        }

                                                        $$(self.componentIds.filterPopup).filter();
                                                    }
                                                }
                                            },
                                            {
                                                // Field list
                                                view: "combo", options: $$(self.componentIds.filterPopup).getFieldList(), on: {
                                                    "onChange": function (columnId) {
                                                        var columnConfig = self.dataTable.getColumnConfig(columnId);
                                                        var conditionList = [];
                                                        var inputView = {};

                                                        switch (columnConfig.filter_type) {
                                                            case "text":
                                                                conditionList = [
                                                                    "contains",
                                                                    "doesn't contain",
                                                                    "is",
                                                                    "is not"
                                                                ];

                                                                inputView = { view: "text" };
                                                                break;
                                                            case "date":
                                                                conditionList = [
                                                                    "is before",
                                                                    "is after",
                                                                    "is on or before",
                                                                    "is on or after"
                                                                ];

                                                                inputView = { view: "datepicker" };

                                                                if (columnConfig.format)
                                                                    inputView.format = columnConfig.format;

                                                                break;
                                                            case "number":
                                                                conditionList = [
                                                                    "=",
                                                                    "≠",
                                                                    "<",
                                                                    ">",
                                                                    "≤",
                                                                    "≥"
                                                                ];

                                                                inputView = { view: "text", validate: webix.rules.isNumber };
                                                                break;
                                                            case "list":
                                                                conditionList = [
                                                                    "equals",
                                                                    "does not equal"
                                                                ];

                                                                inputView = {
                                                                    view: "combo",
                                                                    options: columnConfig.filter_options
                                                                };
                                                                break;
                                                            case "boolean":
                                                                conditionList = [
                                                                    "is checked",
                                                                    "is not checked"
                                                                ];

                                                                break;
                                                        }

                                                        var conditionCombo = this.getParentView().getChildViews()[2];
                                                        conditionCombo.define("options", conditionList);
                                                        conditionCombo.refresh();

                                                        this.getParentView().removeView(this.getParentView().getChildViews()[3]);
                                                        this.getParentView().addView(inputView, 3);
                                                        if (columnConfig.filter_type === 'boolean') {
                                                            // There is not any condition values 
                                                        }
                                                        else if (columnConfig.filter_type === 'text')
                                                            this.getParentView().getChildViews()[3].attachEvent("onTimedKeyPress", function () { $$(self.componentIds.filterPopup).filter(); });
                                                        else
                                                            this.getParentView().getChildViews()[3].attachEvent("onChange", function () { $$(self.componentIds.filterPopup).filter(); });

                                                        $$(self.componentIds.filterPopup).filter();
                                                    }
                                                }
                                            },
                                            // Comparer
                                            { view: "combo", options: [], width: 155, on: { "onChange": function () { $$(self.componentIds.filterPopup).filter(); } } },
                                            // Value
                                            {},
                                            {
                                                view: "button", value: "X", width: 30, click: function () {
                                                    $$(self.componentIds.filterForm).removeView(this.getParentView());
                                                    $$(self.componentIds.filterPopup).filter();
                                                }
                                            }
                                        ]
                                    }, viewIndex);
                                },
                                registerDataTable: function (dataTable) {
                                    self.dataTable = dataTable;

                                    // Reset form
                                    $$(self.componentIds.filterForm).clear();
                                    $$(self.componentIds.filterForm).clearValidation();

                                    // Get all filter conditions to remove
                                    var cViews = [];
                                    var childViews = $$(self.componentIds.filterForm).getChildViews();
                                    for (var i = 0; i < childViews.length; i++) {
                                        if (i >= childViews.length - 1) // Ignore 'Add a filter' button
                                            break;

                                        cViews.push(childViews[i]);
                                    }

                                    // Remove all filter conditions
                                    cViews.forEach(function (v) {
                                        $$(self.componentIds.filterForm).removeView(v);
                                    });
                                },
                                setFieldList: function (fieldList) {
                                    // We can remove it when we can get all column from webix datatable (include hidden fields)
                                    self.data.fieldList = fieldList;

                                    this.refreshFieldList();
                                },
                                getFieldList: function () {
                                    var fieldList = [];

                                    // Get all columns include hidden fields
                                    if (self.data.fieldList) {
                                        self.data.fieldList.forEach(function (f) {
                                            if (f.setting.filter_type) {
                                                fieldList.push({
                                                    id: f.name,
                                                    value: f.label
                                                });
                                            }
                                        });
                                    }

                                    return fieldList;
                                },
                                refreshFieldList: function () {
                                    var childViews = $$(self.componentIds.filterForm).getChildViews(),
                                        fieldList = this.getFieldList(),
                                        removeChildViews = [];

                                    childViews.forEach(function (cView, index) {
                                        if (index >= childViews.length - 1) // Ignore 'Add a filter' button
                                            return false;

                                        var fieldId = cView.getChildViews()[1].getValue();
                                        if ($.grep(fieldList, function (f) { f.id == fieldId }).length < 1) {
                                            // Add condition to remove
                                            removeChildViews.push(cView);
                                        }
                                        else {
                                            // Update field list
                                            cView.getChildViews()[1].define('options', fieldList);
                                            cView.getChildViews()[1].refresh();
                                        }
                                    });

                                    // Remove filter conditions
                                    removeChildViews.forEach(function (cView, index) {
                                        $$(self.componentIds.filterForm).removeView(cView);
                                    });
                                },
                                filter: function () {

                                    var filterCondition = [];

                                    $$(self.componentIds.filterForm).getChildViews().forEach(function (view, index, viewList) {

                                        if (index < viewList.length - 1) { // Ignore 'Add a filter' button
                                            var condValue = view.getChildViews()[3] && view.getChildViews()[3].getValue ? view.getChildViews()[3].getValue() : ''; // Support none conditon control
                                            if (view.getChildViews()[1].getValue() && view.getChildViews()[2].getValue()) {
                                                filterCondition.push({
                                                    combineCondtion: view.getChildViews()[0].getValue(),
                                                    fieldName: view.getChildViews()[1].getValue(),
                                                    operator: view.getChildViews()[2].getValue(),
                                                    inputValue: condValue,
                                                });
                                            }
                                        }
                                    });

                                    self.dataTable.filter(function (obj) {
                                        var combineCond = (filterCondition && filterCondition.length > 0 ? filterCondition[0].combineCondtion : 'And');
                                        var isValid = (combineCond === 'And' ? true : false);

                                        filterCondition.forEach(function (cond) {
                                            var condResult;
                                            var objValue = self.dataTable.getColumnConfig(cond.fieldName).filter_value ? self.dataTable.getColumnConfig(cond.fieldName).filter_value(obj) : obj[cond.fieldName];

                                            if (!objValue)
                                                return;

                                            if (objValue.trim)
                                                objValue = objValue.trim().toLowerCase();

                                            switch (cond.operator) {
                                                // Text filter
                                                case "contains":
                                                    condResult = objValue.indexOf(cond.inputValue.trim().toLowerCase()) > -1;
                                                    break;
                                                case "doesn't contain":
                                                    condResult = objValue.indexOf(cond.inputValue.trim().toLowerCase()) < 0;
                                                    break;
                                                case "is":
                                                    condResult = objValue == cond.inputValue.trim().toLowerCase();
                                                    break;
                                                case "is not":
                                                    condResult = objValue != cond.inputValue.trim().toLowerCase();
                                                    break;
                                                // Date filter
                                                case "is before":
                                                    if (!(objValue instanceof Date)) objValue = new Date(objValue);
                                                    condResult = objValue < cond.inputValue;
                                                    break;
                                                case "is after":
                                                    if (!(objValue instanceof Date)) objValue = new Date(objValue);
                                                    condResult = objValue > cond.inputValue;
                                                    break;
                                                case "is on or before":
                                                    if (!(objValue instanceof Date)) objValue = new Date(objValue);
                                                    condResult = objValue <= cond.inputValue;
                                                    break;
                                                case "is on or after":
                                                    if (!(objValue instanceof Date)) objValue = new Date(objValue);
                                                    condResult = objValue >= cond.inputValue;
                                                    break;
                                                // Number filter
                                                case "=":
                                                    condResult = Number(objValue) == Number(cond.inputValue);
                                                    break;
                                                case "≠":
                                                    condResult = Number(objValue) != Number(cond.inputValue);
                                                    break;
                                                case "<":
                                                    condResult = Number(objValue) < Number(cond.inputValue);
                                                    break;
                                                case ">":
                                                    condResult = Number(objValue) > Number(cond.inputValue);
                                                    break;
                                                case "≤":
                                                    condResult = Number(objValue) <= Number(cond.inputValue);
                                                    break;
                                                case "≥":
                                                    condResult = Number(objValue) >= Number(cond.inputValue);
                                                    break;
                                                // List filter
                                                case "equals":
                                                    if (objValue)
                                                        condResult = cond.inputValue.toLowerCase().indexOf(objValue) > -1;
                                                    break;
                                                case "does not equal":
                                                    if (objValue)
                                                        condResult = cond.inputValue.toLowerCase().indexOf(objValue) < 0;
                                                    else
                                                        condResult = true;
                                                    break;
                                                // Boolean/Checkbox filter
                                                case "is checked":
                                                    condResult = (objValue === true || objValue === 1);
                                                    break;
                                                case "is not checked":
                                                    condResult = !objValue;
                                                    break;
                                            }
                                            if (combineCond === 'And') {
                                                isValid = isValid && condResult;
                                            } else {
                                                isValid = isValid || condResult;
                                            }
                                        });

                                        return isValid;
                                    })
                                }
                            }, webix.ui.popup);


                        }
                    });
                });
        });
    }
);