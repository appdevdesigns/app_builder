
steal(
    // List your Controller's dependencies here:
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/ad',
                'appdev/control/control').then(function () {

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.BuildApp.CustomWebixControls', {


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);


                            this.dataSource = this.options.dataSource; // AD.models.Projects;

                            this.initWebixControls();
                        },

                        initWebixControls: function () {
                            // Webix list editable
                            webix.protoUI({
                                name: "editlist"
                            }, webix.EditAbility, webix.ui.list);

                            // Webix datatable filter
                            webix.protoUI({
                                name: "filter_popup",
                                $init: function (config) {
                                    //functions executed on component initialization
                                    this.fieldList = [];
                                    this.combineCondition = 'And';
                                },
                                defaults: {
                                    width: 800,
                                    body: {
                                        view: "form",
                                        autoheight: true,
                                        elements: [{
                                            view: "button", value: "Add a filter", click: function () {
                                                this.getTopParentView().addNewFilter();
                                            }
                                        }]
                                    }
                                },
                                addNewFilter: function () {
                                    var _this = this;
                                    var viewIndex = _this.getBody().getChildViews().length - 1;

                                    _this.getBody().addView({
                                        cols: [
                                            {
                                                view: "combo", value: _this.combineCondition, options: ["And", "Or"], css: 'combine-condition', width: 80, on: {
                                                    "onChange": function (newValue, oldValue) {
                                                        _this.combineCondition = newValue;

                                                        var filterList = $('.combine-condition').webix_combo();

                                                        if ($.isArray(filterList)) {
                                                            filterList.forEach(function (elm) {
                                                                elm.setValue(newValue);
                                                            });
                                                        }
                                                        else {
                                                            filterList.setValue(newValue);
                                                        }

                                                        _this.filter();
                                                    }
                                                }
                                            },
                                            {
                                                view: "combo", options: _this.fieldList, on: {
                                                    "onChange": function (columnId) {
                                                        var columnConfig = _this.dataTable.getColumnConfig(columnId);
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
                                                                    view: "multicombo",
                                                                    options: columnConfig.filter_options
                                                                };
                                                                break;
                                                        }

                                                        var conditionCombo = this.getParentView().getChildViews()[2];
                                                        conditionCombo.define("options", conditionList);
                                                        conditionCombo.refresh();

                                                        this.getParentView().removeView(this.getParentView().getChildViews()[3]);
                                                        this.getParentView().addView(inputView, 3);
                                                        if (columnConfig.filter_type === 'text')
                                                            this.getParentView().getChildViews()[3].attachEvent("onTimedKeyPress", function () { _this.filter(); });
                                                        else
                                                            this.getParentView().getChildViews()[3].attachEvent("onChange", function () { _this.filter(); });

                                                        _this.filter();
                                                    }
                                                }
                                            },
                                            { view: "combo", options: [], width: 155, on: { "onChange": function () { _this.filter(); } } },
                                            {},
                                            {
                                                view: "button", value: "X", width: 30, click: function () {
                                                    this.getFormView().removeView(this.getParentView());
                                                    _this.filter();
                                                }
                                            }
                                        ]
                                    }, viewIndex);
                                },
                                registerDataTable: function (dataTable) {
                                    var _this = this;
                                    _this.dataTable = dataTable;
                                    _this.dataTable.eachColumn(function (columnId) {
                                        var columnConfig = _this.dataTable.getColumnConfig(columnId);
                                        if (columnConfig.filter_type && columnConfig.header && columnConfig.header.length > 0 && columnConfig.header[0].text) {
                                            _this.fieldList.push({
                                                id: columnId,
                                                value: columnConfig.header[0].text
                                            });
                                        }
                                    });

                                    this.addNewFilter();
                                },
                                filter: function () {
                                    var _this = this;

                                    var filterCondition = [];

                                    _this.getChildViews()[0].getChildViews().forEach(function (view, index, viewList) {
                                        if (index < viewList.length - 1) { // Ignore 'Add a filter' button
                                            if (view.getChildViews()[1].getValue() && view.getChildViews()[2].getValue() && view.getChildViews()[3].getValue()) {
                                                filterCondition.push({
                                                    combineCondtion: view.getChildViews()[0].getValue(),
                                                    fieldName: view.getChildViews()[1].getValue(),
                                                    operator: view.getChildViews()[2].getValue(),
                                                    inputValue: view.getChildViews()[3].getValue(),
                                                });
                                            }
                                        }
                                    });

                                    _this.dataTable.filter(function (obj) {
                                        var combineCond = (filterCondition && filterCondition.length > 0 ? filterCondition[0].combineCondtion : 'And');
                                        var isValid = (combineCond === 'And' ? true : false);

                                        filterCondition.forEach(function (cond) {
                                            var condResult;
                                            var objValue = _this.dataTable.getColumnConfig(cond.fieldName).filter_value ? _this.dataTable.getColumnConfig(cond.fieldName).filter_value(obj) : obj[cond.fieldName];

                                            switch (cond.operator) {
                                                // Text filter
                                                case "contains":
                                                    condResult = objValue.trim().toLowerCase().indexOf(cond.inputValue.trim().toLowerCase()) > -1;
                                                    break;
                                                case "doesn't contain":
                                                    condResult = objValue.trim().toLowerCase().indexOf(cond.inputValue.trim().toLowerCase()) < 0;
                                                    break;
                                                case "is":
                                                    condResult = objValue.trim().toLowerCase() == cond.inputValue.trim().toLowerCase();
                                                    break;
                                                case "is not":
                                                    condResult = objValue.trim().toLowerCase() != cond.inputValue.trim().toLowerCase();
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
                                                    condResult = cond.inputValue.toLowerCase().indexOf(objValue.trim().toLowerCase()) > -1;
                                                    break;
                                                case "does not equal":
                                                    condResult = cond.inputValue.toLowerCase().indexOf(objValue.trim().toLowerCase()) < 0;
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

                            // Webix add new datable columns
                            var addFieldComIds = {
                                chooseTypeView: 'ab-new-none',

                                singleTextIcon: 'font',
                                singleTextView: 'ab-new-singleText',
                                singleTextDefault: 'ab-new-singleText-default',

                                longTextIcon: 'align-right',
                                longTextView: 'ab-new-longText',

                                numberIcon: 'slack',
                                numberView: 'ab-new-number',
                                numberAllowDecimal: 'ab-new-number-allow-decimal',
                                numberFormat: 'ab-new-number-format',
                                numberDefault: 'ab-new-number-default',

                                dateIcon: 'calendar',
                                dateView: 'ab-new-date',
                                dateIncludeTime: 'ab-new-date-include-time',

                                booleanIcon: 'check-square-o',
                                booleanView: 'ab-new-boolean',

                                selectListIcon: 'th-list',
                                selectListView: 'ab-new-select-list',
                                selectListOptions: 'ab-new-select-option',
                                selectListNewOption: 'ab-new-select-new',

                                attachmentIcon: 'file',
                                attachmentView: 'ab-new-attachment',

                                headerNameText: 'ab-new-field-name'
                            };
                            webix.protoUI({
                                name: "add_fields_popup",
                                $init: function (config) {
                                },
                                defaults: {
                                    ready: function () {
                                        this.resetState();
                                    },
                                    body: {
                                        width: 380,
                                        rows: [
                                            {
                                                view: "menu",
                                                data: [
                                                    {
                                                        value: "Choose field type...",
                                                        submenu: [
                                                            { view: 'button', value: 'Single line text', icon: addFieldComIds.singleTextIcon, type: 'icon', viewName: addFieldComIds.singleTextView },
                                                            { view: 'button', value: 'Long text', icon: addFieldComIds.longTextIcon, type: 'icon', viewName: addFieldComIds.longTextView },
                                                            { view: 'button', value: 'Number', icon: addFieldComIds.numberIcon, type: 'icon', viewName: addFieldComIds.numberView },
                                                            { view: 'button', value: 'Date', icon: addFieldComIds.dateIcon, type: 'icon', viewName: addFieldComIds.dateView },
                                                            { view: 'button', value: 'Checkbox', icon: addFieldComIds.booleanIcon, type: 'icon', viewName: addFieldComIds.booleanView },
                                                            { view: 'button', value: 'Select list', icon: addFieldComIds.selectListIcon, type: 'icon', viewName: addFieldComIds.selectListView },
                                                            { view: 'button', value: 'Attachment', icon: addFieldComIds.attachmentIcon, type: 'icon', viewName: addFieldComIds.attachmentView },
                                                        ]
                                                    }
                                                ],
                                                on: {
                                                    onMenuItemClick: function (id) {
                                                        var base = this.getTopParentView();
                                                        var selectedMenuItem = this.getMenuItem(id);

                                                        if (selectedMenuItem.viewName) {
                                                            $$(selectedMenuItem.viewName).show();

                                                            var headerNameClass = '.' + addFieldComIds.headerNameText;

                                                            // Set default header name
                                                            if ($(headerNameClass) && $(headerNameClass).length > 0) {
                                                                $(headerNameClass).each(function (index, txtName) {
                                                                    var headerName = $(txtName).webix_text().getValue();
                                                                    if (!headerName || headerName.indexOf('Field ') > -1) {
                                                                        var defaultName = base.getDefaultFieldName();
                                                                        $(txtName).webix_text().setValue(defaultName);
                                                                    }
                                                                });
                                                            }

                                                            this.getTopParentView().selectedType = selectedMenuItem.value;
                                                        }
                                                    }
                                                }
                                            },
                                            { height: 10 },
                                            {
                                                cells: [
                                                    {
                                                        id: addFieldComIds.chooseTypeView,
                                                        rows: [{ view: "label", label: "Choose field type..." }]
                                                    },
                                                    {
                                                        id: addFieldComIds.singleTextView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Single line text".replace('{0}', addFieldComIds.singleTextIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: addFieldComIds.headerNameText, labelWidth: 50 },
                                                            { view: "text", id: addFieldComIds.singleTextDefault, placeholder: "Default text" }
                                                        ]
                                                    },
                                                    {
                                                        id: addFieldComIds.longTextView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Long line text".replace('{0}', addFieldComIds.longTextIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: addFieldComIds.headerNameText, labelWidth: 50 },
                                                            { view: "label", label: "A long text field that can span multiple lines." }
                                                        ]
                                                    },
                                                    {
                                                        id: addFieldComIds.numberView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Number".replace('{0}', addFieldComIds.numberIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: addFieldComIds.headerNameText, labelWidth: 60 },
                                                            {
                                                                view: "combo", id: addFieldComIds.numberFormat, value: "Number", label: 'Format', labelWidth: 60, options: [
                                                                    { format: webix.i18n.numberFormat, value: "Number" },
                                                                    { format: webix.i18n.priceFormat, value: "Price" },
                                                                ]
                                                            },
                                                            { view: "checkbox", id: addFieldComIds.numberAllowDecimal, labelRight: "Allow decimal numbers", labelWidth: 0 },
                                                            { view: "text", id: addFieldComIds.numberDefault, placeholder: "Default number" }
                                                        ]
                                                    },
                                                    {
                                                        id: addFieldComIds.dateView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Date".replace('{0}', addFieldComIds.dateIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: addFieldComIds.headerNameText, labelWidth: 50 },
                                                            { view: "label", label: "Pick one from a calendar." },
                                                            { view: "checkbox", id: addFieldComIds.dateIncludeTime, labelRight: "Include time", labelWidth: 0 },
                                                        ]
                                                    },
                                                    {
                                                        id: addFieldComIds.booleanView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Checkbox".replace('{0}', addFieldComIds.booleanIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: addFieldComIds.headerNameText, labelWidth: 50 },
                                                            { view: "label", label: "A single checkbox that can be checked or unchecked." }
                                                        ]
                                                    },
                                                    {
                                                        id: addFieldComIds.selectListView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Select list".replace('{0}', addFieldComIds.selectListIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: addFieldComIds.headerNameText, labelWidth: 50 },
                                                            { view: "template", template: "Single select allows you to select a single predefined options below from a dropdown.", autoheight: true, borderless: true },
                                                            { view: "label", label: "<b>Options</b>" },
                                                            {
                                                                view: "list",
                                                                id: addFieldComIds.selectListOptions,
                                                                type: {
                                                                    template: "<div style='position: relative;'>#name#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>"
                                                                },
                                                                autoheight: true,
                                                                onClick: {
                                                                    "ab-new-field-remove": function (e, id, trg) {
                                                                        $$(addFieldComIds.selectListOptions).remove(id);
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                cols: [
                                                                    { view: "text", id: addFieldComIds.selectListNewOption },
                                                                    {
                                                                        view: "button", value: "Add", width: 100, click: function () {
                                                                            if ($$(addFieldComIds.selectListNewOption).getValue()) {
                                                                                $$(addFieldComIds.selectListOptions).add({ name: $$(addFieldComIds.selectListNewOption).getValue() });
                                                                                $$(addFieldComIds.selectListNewOption).setValue('');
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: addFieldComIds.attachmentView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Attachment".replace('{0}', addFieldComIds.attachmentIcon) },
                                                            { view: "label", label: "Under construction..." }
                                                        ]
                                                    }
                                                ]
                                            },
                                            { height: 10 },
                                            {
                                                cols: [
                                                    {
                                                        view: "button", label: "Add Column", type: "form", width: 120, click: function () {
                                                            var base = this.getTopParentView();
                                                            var dataTable = base.dataTable;

                                                            if (!dataTable) {
                                                                webix.message({ type: "error", text: "Please register the datatable to add." });
                                                                return;
                                                            }

                                                            var fieldName = '',
                                                                iconHeader = '',
                                                                fieldSettings = {};

                                                            switch (base.selectedType) {
                                                                case 'Single line text':
                                                                    fieldName = base.getFieldName(addFieldComIds.singleTextView);
                                                                    iconHeader = addFieldComIds.singleTextIcon;
                                                                    fieldSettings.editor = 'text';
                                                                    fieldSettings.value = $$(addFieldComIds.singleTextDefault).getValue();
                                                                    break;
                                                                case 'Long text':
                                                                    fieldName = base.getFieldName(addFieldComIds.longTextView);
                                                                    iconHeader = addFieldComIds.longTextIcon;
                                                                    fieldSettings.editor = 'popup';
                                                                    break;
                                                                case 'Number':
                                                                    fieldName = base.getFieldName(addFieldComIds.numberView);
                                                                    iconHeader = addFieldComIds.numberIcon;
                                                                    fieldSettings.editor = 'number';

                                                                    var selectedFormat = $$(addFieldComIds.numberFormat).getList().find(function (format) {
                                                                        return format.value == $$(addFieldComIds.numberFormat).getValue();
                                                                    })[0];
                                                                    fieldSettings.format = selectedFormat.format;

                                                                    break;
                                                                case 'Date':
                                                                    fieldName = base.getFieldName(addFieldComIds.dateView);
                                                                    iconHeader = addFieldComIds.dateIcon;
                                                                    if ($$(addFieldComIds.dateIncludeTime).getValue())
                                                                        fieldSettings.editor = 'datetime';
                                                                    else
                                                                        fieldSettings.editor = 'date';
                                                                    break;
                                                                case 'Checkbox':
                                                                    fieldName = base.getFieldName(addFieldComIds.booleanView);
                                                                    iconHeader = addFieldComIds.booleanIcon;
                                                                    // editor = 'checkbox';
                                                                    fieldSettings.template = "{common.checkbox()}";
                                                                    break;
                                                                case 'Select list':
                                                                    fieldName = base.getFieldName(addFieldComIds.selectListView);
                                                                    iconHeader = addFieldComIds.selectListIcon;

                                                                    if ($$(addFieldComIds.selectListOptions).data.count() > 0) {
                                                                        fieldSettings.editor = 'richselect';
                                                                        fieldSettings.options = [];

                                                                        $$(addFieldComIds.selectListOptions).data.each(function (opt) {
                                                                            fieldSettings.options.push(opt.name);
                                                                        });
                                                                    }
                                                                    else {
                                                                        webix.alert({
                                                                            title: "Option required",
                                                                            ok: "Ok",
                                                                            text: "Enter at least one option."
                                                                        })

                                                                        return;
                                                                    }

                                                                    break;
                                                                case 'Attachment':
                                                                    fieldName = base.getFieldName(addFieldComIds.attachmentView);
                                                                    iconHeader = addFieldComIds.attachmentIcon;
                                                                    alert('Under construction !!');
                                                                    return; // TODO;
                                                            }

                                                            // Add new column
                                                            var columns = webix.toArray(dataTable.config.columns);
                                                            var newColumn = $.extend(fieldSettings, {
                                                                id: "c" + webix.uid(),
                                                                header: "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>".replace('{0}', iconHeader).replace('{1}', fieldName),
                                                                width: 170
                                                            });

                                                            columns.insertAt(newColumn, dataTable.config.columns.length);
                                                            dataTable.refreshColumns();

                                                            base.hide();

                                                            if (base.addColumnEvent) {
                                                                // TODO: Call event (to the server)
                                                            }

                                                            webix.message({ type: "success", text: "<b>{0}</b> is added.".replace("{0}", fieldName) });
                                                        }
                                                    },
                                                    {
                                                        view: "button", value: "Cancel", width: 100, click: function () {
                                                            this.getTopParentView().hide();
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    on: {
                                        onHide: function () {
                                            this.resetState();
                                        }
                                    }
                                },

                                registerDataTable: function (dataTable) {
                                    this.dataTable = dataTable;
                                },

                                registerAddColumnEvent: function (addColumnEvent) {
                                    this.addColumnEvent = addColumnEvent;
                                },

                                resetState: function () {
                                    var _this = this;

                                    $$(addFieldComIds.selectListOptions).clearAll();
                                    $$(addFieldComIds.selectListNewOption).setValue('');
                                    $$("ab-new-none").show();
                                },

                                getDefaultFieldName: function () {
                                    var runningNumber = 1;

                                    if (this.dataTable)
                                        runningNumber = this.dataTable.config.columns.length + 1;

                                    return 'Field ' + runningNumber;
                                },

                                getFieldName: function (viewName) {
                                    var fieldName = $.grep($$(viewName).getChildViews(), function (element, i) {
                                        return $(element.$view).hasClass('ab-new-field-name');
                                    });

                                    if (fieldName && fieldName.length > 0)
                                        return fieldName[0].getValue();
                                    else
                                        return '';
                                }
                            }, webix.ui.popup);

                            // == Datatable editor ==
                            // Number text
                            webix.editors.number = webix.extend({
                                // TODO : Validate number only
                            }, webix.editors.text);

                            // Date & time selector
                            webix.editors.$popup.datetime = {
                                view: "popup", width: 250, height: 250, padding: 0,
                                body: { view: "calendar", icons: true, borderless: true, timepicker: true }
                            };

                            webix.editors.datetime = webix.extend({
                                popupType: "datetime"
                            }, webix.editors.date);

                        }


                    });

                });
        });

    });