
/*
 * ab_work_object_workspace_popupFilterDataTable
 *
 * Manage the data table's filters
 *
 */


export default class AB_Work_Object_Workspace_PopupFilterDataTable extends OP.Component {
    
    constructor(App, idBase) {
        super(App, idBase || 'ab_work_object_workspace_popupFilterDataTable');
        
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                and: L('ab.filter_fields.and', "And"),
                or: L('ab.filter_fields.or', "Or"),
                addNewFilter: L('ab.filter_fields.addNewFilter', "Add a filter"),

                containsCondition: L('ab.filter_fields.containsCondition', "contains"),
                notContainCondition: L('ab.filter_fields.notContainCondition', "doesn't contain"),
                isCondition: L('ab.filter_fields.isCondition', "is"),
                isNotCondition: L('ab.filter_fields.isNotCondition', "is not"),

                beforeCondition: L('ab.filter_fields.beforeCondition', "is before"),
                afterCondition: L('ab.filter_fields.afterCondition', "is after"),
                onOrBeforeCondition: L('ab.filter_fields.onOrBeforeCondition', "is on or before"),
                onOrAfterCondition: L('ab.filter_fields.onOrAfterCondition', "is on or after"),

                equalCondition: L('ab.filter_fields.equalCondition', ":"),
                notEqualCondition: L('ab.filter_fields.notEqualCondition', "≠"),
                lessThanCondition: L('ab.filter_fields.lessThanCondition', "<"),
                moreThanCondition: L('ab.filter_fields.moreThanCondition', ">"),
                lessThanOrEqualCondition: L('ab.filter_fields.lessThanOrEqualCondition', "≤"),
                moreThanOrEqualCondition: L('ab.filter_fields.moreThanOrEqualCondition', "≥"),

                equalListCondition: L('ab.filter_fields.equalListCondition', "equals"),
                notEqualListCondition: L('ab.filter_fields.notEqualListCondition', "does not equal"),

                checkedCondition: L('ab.filter_fields.checkedCondition', "is checked"),
                notCheckedCondition: L('ab.filter_fields.notCheckedCondition', "is not checked")
            }
        };
        
        var users = {};
        
        OP.Comm.Service.get({ url: "/appdev-core/siteuser" }).then((data) => {
            var items = data.map(function(item) {
                return {
                    id: item.username,
                    value: item.username
                }
            });
            users = items;
        });

        
        
        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique('component'),
            newfilterbutton: this.unique('new-filter-button'),
            filterform: this.unique('filter-form')
        };
        
        
        // webix UI definition:
        this.ui = {
            view:"popup",
            id: ids.component,
            width: 800,
            // autoheight:true,
            body: {
                view: "form",
                id: ids.filterform,
                elements: [{
                    view: "button", 
                    id: ids.newfilterbutton, 
                    value: labels.component.addNewFilter, 
                    on: {
                        onItemClick: function (id, e, node) {
                            _logic.clickAddNewFilter();
                        }
                    }
                }]
            },
            on: {
                onShow: function () {
                    _logic.onShow();
                }
            }
        };
        

        // setting up UI
        this.init = (options) => {
            // register our callbacks:
            for(var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }

            webix.ui(this.ui);

        };
        
        var CurrentObject = null;
        var CurrentView = null;

        // internal business logic 
        var _logic = this._logic = {
            
            callbacks:{

                /**
                 * @function onChange
                 * called when we have made changes to the hidden field settings
                 * of our Current Object.
                 *
                 * this is meant to alert our parent component to respond to the
                 * change.
                 */
                onChange:function(){}
            },
            
            callChangeEvent: function (objectWorkspace) {
                var filter_popup = $$(ids.component),
                    filter_form = $$(ids.filterform),
                    conditionNumber = 0;

                filter_form.getChildViews().forEach(function (v, index) {
                    if (index >= filter_form.getChildViews().length - 1)
                        return;

                    if (v.getChildViews()[1].getValue() && v.getChildViews()[2].getValue())
                        conditionNumber++;
                });

                // this.getTopParentView().callEvent('onChange', [filter_popup.dataTable.config.id, conditionNumber]);
                if (CurrentView != null) {
                    // alert("saving here");
                    _logic.callbacks.onChange(objectWorkspace);
                } else {
                    _logic.callbacks.onChange();                    
                }
            },            

            clickAddNewFilter: function (filters) {
                var filter_popup = $$(ids.component),
                    filter_form = $$(ids.filterform),
                    viewIndex = filter_form.getChildViews().length - 1,
                    filters = filters;

                filter_form.addView({
                    id: 'f' + webix.uid(),
                    cols: [
                        {
                            // Add / Or
                            view: "combo", 
                            // value: filters.combineCondition, 
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
                            css: 'combine-condition', 
                            width: 80, 
                            on: {
                                "onChange": function (newValue, oldValue) {
                                    filter_popup.combineCondition = newValue;

                                    var filterList = document.getElementsByClassName("combine-condition");
                                    for (var i = 0; i < filterList.length; i++) {
                                        $$(filterList[i]).setValue(newValue);
                                    }

                                    // filter_popup.filter();
                                    _logic.filter();
                                }
                            }
                        },
                        {
                            // Field list
                            view: "combo", 
                            options: _logic.getFieldList(), 
                            // value: filters.fieldName,
                            on: {
                                "onChange": function (columnId) {
                                    var columnConfig;
                                    CurrentObject.fields().forEach(function (f) {
                                        if (columnId == f.columnName) {
                                            columnConfig = f;
                                        }
                                    });
                                    // var columnConfig = filter_popup.dataTable.getColumnConfig(columnId);
                                    var conditionList = [];
                                    var inputView = {};

                                    if (!columnConfig) return;
                                    
                                    switch (columnConfig.key) {
                                        case "date":
                                            conditionList = [
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
                                            ];

                                            inputView = { view: "datepicker" };

                                            inputView.format = columnConfig.getDateFormat();

                                            break;
                                        case "number":
                                            conditionList = [
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
                                            ];

                                            inputView = { view: "text", validate: webix.rules.isNumber };
                                            break;
                                        case "list":
                                            conditionList = [
                                                {
                                                    value: labels.component.equalListCondition,
                                                    id: "equals"
                                                },
                                                {
                                                    value: labels.component.notEqualListCondition,
                                                    id: "does not equal"
                                                }
                                            ];
                                            var options = columnConfig.settings.options.map(function(x) {
                                                return {
                                                    id: x.text,
                                                    value: x.text
                                                }
                                            });
                                            inputView = {
                                                view: "combo",
                                                options: options
                                            };
                                            break;
                                        case "boolean":
                                            conditionList = [
                                                {
                                                    value: labels.component.checkedCondition,
                                                    id: "is checked"
                                                },
                                                {
                                                    value: labels.component.notCheckedCondition,
                                                    id: "is not checked"
                                                }
                                            ];

                                            break;
                                        case "user":
                                            conditionList = [
                                                {
                                                    value: labels.component.equalListCondition,
                                                    id: "equals"
                                                },
                                                {
                                                    value: labels.component.notEqualListCondition,
                                                    id: "does not equal"
                                                }
                                            ];
                                            inputView = {
                                                view: "combo",
                                                options: users
                                            };
                                            break;
                                        default:
                                            conditionList = [
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
                                            ];

                                            inputView = { view: "text" };
                                            break;
                                    }

                                    var filter_item = this.getParentView();
                                    var conditionCombo = filter_item.getChildViews()[2];
                                    conditionCombo.define("options", conditionList);
                                    conditionCombo.refresh();
                                    conditionCombo.setValue();
                                    
                                    var isMultiLingualCheckbox = filter_item.getChildViews()[5];
                                    isMultiLingualCheckbox.setValue(columnConfig.settings.supportMultilingual);

                                    filter_item.removeView(filter_item.getChildViews()[3]);
                                    filter_item.addView(inputView, 3);
                                    if (columnConfig.key === 'boolean') {
                                        // There is not any condition values 
                                    }
                                    else if (columnConfig.key === 'string')
                                        filter_item.getChildViews()[3].attachEvent("onTimedKeyPress", function () { _logic.filter(); });
                                    else
                                        filter_item.getChildViews()[3].attachEvent("onChange", function () { _logic.filter(); });

                                    // filter_popup.filter();
                                    _logic.filter();
                                }
                            }
                        },
                        // Comparer
                        {
                            view: "combo", 
                            options: [], 
                            width: 155, 
                            // value: filters.operator
                            on: {
                                "onChange": function () {
                                    // filter_popup.filter();
                                    _logic.filter();
                                    // _logic.callChangeEvent();
                                }
                            }
                        },
                        // Value
                        {},
                        {
                            view: "button", 
                            icon: "trash", 
                            type: "icon", 
                            width: 30, 
                            click: function () {
                                var filter_item = this.getParentView();
                                filter_form.removeView(filter_item);
                                // filter_popup.filter();
                                _logic.filter();

                                // this.getTopParentView().callChangeEvent();
                                // _logic.callChangeEvent();
                            }
                        },
                        // isMultiLingual
                        {
                            view: "checkbox",
                            value: 1,
                            hidden: true
                        },
                        // currLanguage
                        {
                            view: "text",
                            value: AD.lang.currentLanguage || 'en',
                            hidden: true
                        },
                    ]
                }, viewIndex);
                
                if (filters) {
                    if (typeof filters.combineCondition != "undefined") {
                        var fieldsCombo = filter_form.getChildViews()[viewIndex].getChildViews()[0];
                        $$(fieldsCombo).setValue(filters.combineCondition);
                    }
                    if (typeof filters.fieldName != "undefined") {
                        var fieldName = filter_form.getChildViews()[viewIndex].getChildViews()[1];
                        $$(fieldName).setValue(filters.fieldName);
                    }
                    if (typeof filters.operator != "undefined") {
                        var operator = filter_form.getChildViews()[viewIndex].getChildViews()[2];
                        $$(operator).setValue(filters.operator);
                    }
                    if (typeof filters.inputValue != "undefined") {
                        var inputValue = filter_form.getChildViews()[viewIndex].getChildViews()[3];
                        $$(inputValue).setValue(filters.inputValue);
                    }
                    if (typeof filters.isMultiLingual != "undefined") {
                        var isMultiLingualCheckbox = filter_form.getChildViews()[viewIndex].getChildViews()[5];
                        $$(isMultiLingualCheckbox).setValue(filters.isMultiLingual);
                    }
                    if (typeof filters.languageCode != "undefined") {
                        var languageInput = filter_form.getChildViews()[viewIndex].getChildViews()[6];
                        $$(languageInput).setValue(filters.languageCode);
                    }
                }

                // if (id) {
                //     var fieldsCombo = filter_form.getChildViews()[viewIndex].getChildViews()[1];
                //     fieldsCombo.setValue(id);
                // }

                // this.getTopParentView().callChangeEvent();
                _logic.filter();
            },
            
            columns_setter: function (columns) {
                var filter_popup = $$(ids.component);

                // We can remove it when we can get all column from webix datatable (include hidden fields)
                filter_popup.fieldList = columns;

                _logic.refreshFieldList();
            },

            dataTable_setter: function (dataTable) {
                var filter_popup = $$(ids.component);

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

            filter: function () {

                var filter_popup = $$(ids.component),
                    filter_form = $$(ids.filterform),
                    filterConditions = [];
                    
                filter_form.getChildViews().forEach(function (view, index, viewList) {

                    if (index < viewList.length - 1) { // Ignore 'Add a filter' button
                        if (view.getChildViews()[1].getValue() && view.getChildViews()[2].getValue()) {
                            // var condValue = (view.getChildViews()[3] && view.getChildViews()[3].getValue) ? view.getChildViews()[3].getValue() : ''; // Support none conditon control
                            filterConditions.push({
                                combineCondition: view.getChildViews()[0].getValue(),
                                fieldName: view.getChildViews()[1].getValue(),
                                operator: view.getChildViews()[2].getValue(),
                                inputValue: (view.getChildViews()[3] && view.getChildViews()[3].getValue) ? view.getChildViews()[3].getValue() : '',
                                isMultiLingual: view.getChildViews()[5].getValue(),
                                languageCode: view.getChildViews()[6].getValue()
                            });
                        }
                    }
                });
                
                
                if (CurrentView != null) {
                    CurrentView.settings.objectWorkspace.filterConditions = filterConditions;
                    // _logic.callbacks.onChange(CurrentView.settings.objectWorkspace);
                    _logic.callChangeEvent(CurrentView.settings.objectWorkspace);
                } else {
                    CurrentObject.workspaceFilterConditions = filterConditions;
                    CurrentObject.save()
                    .then(function(){
                        // _logic.callbacks.onChange();
                        _logic.callChangeEvent();
                    })
                    .catch(function(err){
                        OP.Error.log('Error trying to save filterConditions', {error:err, fields:filterConditions });
                    });
                }
                // _logic.callChangeEvent();
            },



            getFieldList: function () {
                var allFields = CurrentObject.fields(),
                    fieldList = [];

                // Get all columns include hidden fields
                allFields.forEach(function (f) {
                    if (f.fieldIsFilterable()) {    
                        fieldList.push({
                            id: f.columnName,
                            value: f.label
                        });
                    }
                });

                return fieldList;
            },
            refreshFieldList: function () {
                var filter_popup = $$(ids.component),
                    filter_form = $$(ids.filterform),
                    childViews = filter_form.getChildViews(),
                    fieldList = _logic.getFieldList(),
                    removeChildViews = [];

                childViews.forEach(function (cView, index) {
                    if (index >= childViews.length - 1) // Ignore 'Add a filter' button
                        return false;

                    var fieldId = cView.getChildViews()[1].getValue();
                    // if ($.grep(fieldList, function (f) { return f.id == fieldId }).length < 1) {
                    if (fieldList.filter(function (f) { return f.id == fieldId })) {
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

                // this.filter();
                _logic.filter();
            },
            
            /**
             * @function objectLoad
             * Ready the Popup according to the current object
             * @param {ABObject} object  the currently selected object.
             */
            objectLoad: function(object, currView) {
                CurrentObject = object;
                if (currView != null) CurrentView = currView;
                // console.log(CurrentObject);
                // console.log(currView);
                // console.log("stuff above");
            },
            
            /**
             * @function onShow
             * Ready the Popup according to the current object each time it is shown (perhaps a field was created or delted)
             */
            onShow: function() {
                var filterform = $$(ids.filterform),
                    filters = CurrentObject.workspaceFilterConditions;

                var childViews = filterform.getChildViews();
                childViews.forEach(function(i, idx, array){
                    if (idx !== array.length - 1){ 
                        filterform.removeView(i);
                    }
                });

                if (filters && filters.length > 0 && filterform.getChildViews().length < 2) {
                    filters.forEach((f) => {
                        _logic.clickAddNewFilter(f);
                    });
                } else if (filterform.getChildViews().length < 2) {
                    _logic.clickAddNewFilter();
                }
            },

            /**
             * @function show()
             *
             * Show this component.
             */
            show:function($view, columnName, options) {
                if (options != null) {
                    $$(ids.component).show($view, options);
                } else {
                    $$(ids.component).show($view);
                }


                if (columnName) {
                    var filters = {
                        combineCondition: "And",
                        fieldName: columnName
                    };

                    var fieldName = $$(ids.filterform).getChildViews()[0].getChildViews()[1];
                    if ($$(fieldName).getValue() == "") {
                        var fieldsCombo = $$(ids.filterform).getChildViews()[0].getChildViews()[0];
                        $$(fieldsCombo).setValue(filters.combineCondition);
                        $$(fieldName).setValue(filters.fieldName);
                    } else {
                        _logic.clickAddNewFilter(filters);
                    }
                }
            }
        };
        
        
        // Expose any globally accessible Actions:
        this.actions({
            
            /**
             * @function populateApplicationForm()
             *
             * Initialze the Form with the values from the provided 
             * ABApplication.
             *
             * If no ABApplication is provided, then show an empty form. 
             * (create operation)
             *
             * @param {ABApplication} Application
             *      [optional] The current ABApplication we are working with.
             */
            // populateApplicationForm: function(Application){
                
            // 	_logic.formReset();
            // 	if (Application) {
            // 		// populate Form here:
            // 		_logic.formPopulate(Application);
            // 	}
            // 	_logic.permissionPopulate(Application);
            // 	_logic.show();
            // }
            
        });
        
        
        // Interface methods for parent component:
        this.objectLoad = _logic.objectLoad;
        this.show = _logic.show;
        
    }
}
