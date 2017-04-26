steal(
    'opstools/BuildApp/controllers/utils/FilterHelper.js',
    function (filterHelper) {
        var labels = {
            filter_fields: {
                and: AD.lang.label.getLabel('ab.filter_fields.and') || "And",
                or: AD.lang.label.getLabel('ab.filter_fields.or') || "Or",
                addNewFilter: AD.lang.label.getLabel('ab.filter_fields.addNewFilter') || "Add a filter",
            }
        };

        webix.protoUI({
            name: "filter_popup",
            $init: function (config) {
                //functions executed on component initialization
                this.combineCondition = labels.filter_fields.and;
            },
            defaults: {
                width: 800,
                body: {
                    view: "form",
                    autoheight: true,
                    elements: [{
                        view: "button", id: webix.uid() + '-new-filter-button', value: labels.filter_fields.addNewFilter, click: function () {
                            this.getTopParentView().addNewFilter();
                        }
                    }]
                },
                on: {
                    onShow: function () {
                        var filter_popup = this,
                            filter_form = filter_popup.getChildViews()[0];
                        if (filter_form.getChildViews().length < 2)
                            filter_popup.addNewFilter();
                    }
                }
            },

            dataTable_setter: function (dataTable) {
                var filter_popup = this;

                if (filter_popup.dataTable && filter_popup.dataTable.config.id == dataTable.config.id) return;

                // Reset form
                var filter_form = filter_popup.getChildViews()[0];
                filter_form.clear();
                filter_form.clearValidation();

                filter_popup.dataTable = dataTable;

                // Get all filter conditions to remove
                var cViews = [];
                var childViews = filter_form.getChildViews();
                for (var i = 0; i < childViews.length; i++) {
                    if (i >= childViews.length - 1) // Ignore 'Add a filter' button
                        break;

                    cViews.push(childViews[i]);
                }

                // Remove all filter conditions
                cViews.forEach(function (v) {
                    filter_form.removeView(v);
                });
            },

            columns_setter: function (columns) {
                var filter_popup = this;

                // We can remove it when we can get all column from webix datatable (include hidden fields)
                filter_popup.fieldList = columns;

                filter_popup.refreshFieldList();
            },


            addNewFilter: function (fieldId) {
                var filter_popup = this,
                    filter_form = filter_popup.getChildViews()[0],
                    viewIndex = filter_form.getChildViews().length - 1;

                filter_form.addView({
                    id: 'f' + webix.uid(),
                    cols: [
                        {
                            // Add / Or
                            view: "combo", value: filter_popup.combineCondition, options: [labels.filter_fields.and, labels.filter_fields.or], css: 'combine-condition', width: 80, on: {
                                "onChange": function (newValue, oldValue) {
                                    filter_popup.combineCondition = newValue;

                                    var filterList = $('.combine-condition').webix_combo();

                                    if ($.isArray(filterList)) {
                                        filterList.forEach(function (elm) {
                                            elm.setValue(newValue);
                                        });
                                    }
                                    else {
                                        filterList.setValue(newValue);
                                    }

                                    filter_popup.filter();
                                }
                            }
                        },
                        {
                            // Field list
                            view: "combo", options: filter_popup.getFieldList(), on: {
                                "onChange": function (columnId) {
                                    var columnConfig = filter_popup.dataTable.getColumnConfig(columnId);
                                    var conditionList = [];
                                    var inputView = {};

                                    if (!columnConfig) return;

                                    var selectList = [];
                                    if (columnConfig.collection) {
                                        selectList = columnConfig.collection.config.data;
                                    }

                                    conditionList = filterHelper.getConditionList(columnConfig.filter_type);
                                    inputView = filterHelper.getComparerView(columnConfig.filter_type, columnConfig.format, selectList);

                                    var filter_item = this.getParentView();
                                    var conditionCombo = filter_item.getChildViews()[2];
                                    conditionCombo.define("options", conditionList);
                                    conditionCombo.refresh();
                                    conditionCombo.setValue()

                                    filter_item.removeView(filter_item.getChildViews()[3]);
                                    filter_item.addView(inputView, 3);
                                    if (columnConfig.filter_type === 'boolean') {
                                        // There is not any condition values 
                                    }
                                    else if (columnConfig.filter_type === 'text' || columnConfig.filter_type === 'multiselect')
                                        filter_item.getChildViews()[3].attachEvent("onTimedKeyPress", function () { filter_popup.filter(); });
                                    else
                                        filter_item.getChildViews()[3].attachEvent("onChange", function () { filter_popup.filter(); });

                                    filter_popup.filter();
                                }
                            }
                        },
                        // Comparer
                        {
                            view: "combo", options: [], width: 155, on: {
                                "onChange": function () {
                                    filter_popup.filter();
                                    filter_popup.callChangeEvent();
                                }
                            }
                        },
                        // Value
                        {},
                        {
                            view: "button", icon: "trash", type: "icon", width: 30, click: function () {
                                var filter_item = this.getParentView();
                                filter_form.removeView(filter_item);
                                filter_popup.filter();

                                this.getTopParentView().callChangeEvent();
                            }
                        }
                    ]
                }, viewIndex);

                if (fieldId) {
                    var fieldsCombo = filter_form.getChildViews()[viewIndex].getChildViews()[1];
                    fieldsCombo.setValue(fieldId);
                }

                this.getTopParentView().callChangeEvent();
            },

            getFieldList: function () {
                var filter_popup = this,
                    fieldList = [];

                // Get all columns include hidden fields
                if (filter_popup.fieldList) {
                    filter_popup.fieldList.forEach(function (f) {
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
                var filter_popup = this,
                    filter_form = filter_popup.getChildViews()[0],
                    childViews = filter_form.getChildViews(),
                    fieldList = this.getFieldList(),
                    removeChildViews = [];

                childViews.forEach(function (cView, index) {
                    if (index >= childViews.length - 1) // Ignore 'Add a filter' button
                        return false;

                    var fieldId = cView.getChildViews()[1].getValue();
                    if ($.grep(fieldList, function (f) { return f.id == fieldId }).length < 1) {
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
                    filter_form.removeView(cView);
                });

                this.filter();
            },
            filter: function () {

                var filter_popup = this,
                    filter_form = filter_popup.getChildViews()[0],
                    filterCondition = [];

                filter_form.getChildViews().forEach(function (view, index, viewList) {

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

                if (filter_popup.dataTable) {
                    filter_popup.dataTable.custom_filters = filter_popup.dataTable.custom_filters || {};
                    filter_popup.dataTable.custom_filters['filter_popup'] = function (obj) {
                        var combineCond = (filterCondition && filterCondition.length > 0 ? filterCondition[0].combineCondtion : labels.filter_fields.and);
                        var isValid = (combineCond === labels.filter_fields.and ? true : false);

                        filterCondition.forEach(function (cond) {
                            var condResult;
                            var objValue = filter_popup.dataTable.getColumnConfig(cond.fieldName).filter_value ? filter_popup.dataTable.getColumnConfig(cond.fieldName).filter_value(obj) : obj[cond.fieldName];

                            // Empty value
                            if (!objValue) {
                                if (cond.inputValue) {
                                    isValid = (combineCond === labels.filter_fields.and ? false : true);
                                }

                                return;
                            }

                            if ($.isArray(objValue))
                                objValue = $.map(objValue, function (o) { return o.text; }).join(' ');

                            if (objValue.trim)
                                objValue = objValue.trim().toLowerCase();

                            condResult = filterHelper.filter(cond.operator, objValue, cond.inputValue);

                            if (combineCond === labels.filter_fields.and) {
                                isValid = isValid && condResult;
                            }
                            else {
                                isValid = isValid || condResult;
                            }
                        });

                        return isValid;
                    };

                    // Refresh webix data table
                    filter_popup.dataTable.refresh();
                }
            },

            callChangeEvent: function () {
                var filter_popup = this,
                    filter_form = filter_popup.getChildViews()[0],
                    conditionNumber = 0;

                filter_form.getChildViews().forEach(function (v, index) {
                    if (index >= filter_form.getChildViews().length - 1)
                        return;

                    if (v.getChildViews()[1].getValue() && v.getChildViews()[2].getValue())
                        conditionNumber++;
                });

                this.getTopParentView().callEvent('onChange', [filter_popup.dataTable.config.id, conditionNumber]);
            }
        }, webix.ui.popup);


        // Create instance of popup
        if ($$('ab-filter-popup') == null) {
            webix.ui({
                id: 'ab-filter-popup',
                view: 'filter_popup'
            }).hide();
        }


    }
);