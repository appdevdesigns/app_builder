steal(
    // List your Controller's dependencies here:
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/ad',
                'appdev/control/control').then(function () {

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.BuildApp.DataTableAddFieldPopup', {


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.componentIds = {
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

                            this.initWebixControls();
                        },

                        initWebixControls: function () {
                            var self = this;

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
                                                            { view: 'button', value: 'Single line text', icon: self.componentIds.singleTextIcon, type: 'icon', viewName: self.componentIds.singleTextView },
                                                            { view: 'button', value: 'Long text', icon: self.componentIds.longTextIcon, type: 'icon', viewName: self.componentIds.longTextView },
                                                            { view: 'button', value: 'Number', icon: self.componentIds.numberIcon, type: 'icon', viewName: self.componentIds.numberView },
                                                            { view: 'button', value: 'Date', icon: self.componentIds.dateIcon, type: 'icon', viewName: self.componentIds.dateView },
                                                            { view: 'button', value: 'Checkbox', icon: self.componentIds.booleanIcon, type: 'icon', viewName: self.componentIds.booleanView },
                                                            { view: 'button', value: 'Select list', icon: self.componentIds.selectListIcon, type: 'icon', viewName: self.componentIds.selectListView },
                                                            { view: 'button', value: 'Attachment', icon: self.componentIds.attachmentIcon, type: 'icon', viewName: self.componentIds.attachmentView },
                                                        ]
                                                    }
                                                ],
                                                on: {
                                                    onMenuItemClick: function (id) {
                                                        var base = this.getTopParentView();
                                                        var selectedMenuItem = this.getMenuItem(id);

                                                        if (selectedMenuItem.viewName) {
                                                            $$(selectedMenuItem.viewName).show();

                                                            var headerNameClass = '.' + self.componentIds.headerNameText;

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
                                                        id: self.componentIds.chooseTypeView,
                                                        rows: [{ view: "label", label: "Choose field type..." }]
                                                    },
                                                    {
                                                        id: self.componentIds.singleTextView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Single line text".replace('{0}', self.componentIds.singleTextIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: self.componentIds.headerNameText, labelWidth: 50 },
                                                            { view: "text", id: self.componentIds.singleTextDefault, placeholder: "Default text" }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.longTextView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Long line text".replace('{0}', self.componentIds.longTextIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: self.componentIds.headerNameText, labelWidth: 50 },
                                                            { view: "label", label: "A long text field that can span multiple lines." }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.numberView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Number".replace('{0}', self.componentIds.numberIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: self.componentIds.headerNameText, labelWidth: 60 },
                                                            {
                                                                view: "combo", id: self.componentIds.numberFormat, value: "Number", label: 'Format', labelWidth: 60, options: [
                                                                    { format: webix.i18n.numberFormat, value: "Number" },
                                                                    { format: webix.i18n.priceFormat, value: "Price" },
                                                                ]
                                                            },
                                                            { view: "checkbox", id: self.componentIds.numberAllowDecimal, labelRight: "Allow decimal numbers", labelWidth: 0 },
                                                            { view: "text", id: self.componentIds.numberDefault, placeholder: "Default number" }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.dateView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Date".replace('{0}', self.componentIds.dateIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: self.componentIds.headerNameText, labelWidth: 50 },
                                                            { view: "label", label: "Pick one from a calendar." },
                                                            { view: "checkbox", id: self.componentIds.dateIncludeTime, labelRight: "Include time", labelWidth: 0 },
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.booleanView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Checkbox".replace('{0}', self.componentIds.booleanIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: self.componentIds.headerNameText, labelWidth: 50 },
                                                            { view: "label", label: "A single checkbox that can be checked or unchecked." }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.selectListView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Select list".replace('{0}', self.componentIds.selectListIcon) },
                                                            { view: "text", label: "Name", placeholder: "Header name", css: self.componentIds.headerNameText, labelWidth: 50 },
                                                            { view: "template", template: "Single select allows you to select a single predefined options below from a dropdown.", autoheight: true, borderless: true },
                                                            { view: "label", label: "<b>Options</b>" },
                                                            {
                                                                view: "list",
                                                                id: self.componentIds.selectListOptions,
                                                                type: {
                                                                    template: "<div style='position: relative;'>#name#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>"
                                                                },
                                                                autoheight: true,
                                                                onClick: {
                                                                    "ab-new-field-remove": function (e, id, trg) {
                                                                        $$(self.componentIds.selectListOptions).remove(id);
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                cols: [
                                                                    { view: "text", id: self.componentIds.selectListNewOption },
                                                                    {
                                                                        view: "button", value: "Add", width: 100, click: function () {
                                                                            if ($$(self.componentIds.selectListNewOption).getValue()) {
                                                                                $$(self.componentIds.selectListOptions).add({ name: $$(self.componentIds.selectListNewOption).getValue() });
                                                                                $$(self.componentIds.selectListNewOption).setValue('');
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.attachmentView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>Attachment".replace('{0}', self.componentIds.attachmentIcon) },
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
                                                                fieldType = '',
                                                                fieldSettings = {};

                                                            switch (base.selectedType) {
                                                                case 'Single line text':
                                                                    fieldName = base.getFieldName(self.componentIds.singleTextView);
                                                                    fieldType = 'string';
                                                                    fieldSettings.icon = self.componentIds.singleTextIcon;
                                                                    fieldSettings.editor = 'text';
                                                                    fieldSettings.filter_type = 'text';
                                                                    fieldSettings.value = $$(self.componentIds.singleTextDefault).getValue();
                                                                    break;
                                                                case 'Long text':
                                                                    fieldName = base.getFieldName(self.componentIds.longTextView);
                                                                    fieldType = 'text';
                                                                    fieldSettings.icon = self.componentIds.longTextIcon;
                                                                    fieldSettings.editor = 'popup';
                                                                    fieldSettings.filter_type = 'text';
                                                                    break;
                                                                case 'Number':
                                                                    fieldName = base.getFieldName(self.componentIds.numberView);

                                                                    if ($$(self.componentIds.numberAllowDecimal).getValue())
                                                                        fieldType = 'float';
                                                                    else
                                                                        fieldType = 'integer';

                                                                    fieldSettings.icon = self.componentIds.numberIcon;
                                                                    fieldSettings.editor = 'number';
                                                                    fieldSettings.filter_type = 'number';

                                                                    var selectedFormat = $$(self.componentIds.numberFormat).getList().find(function (format) {
                                                                        return format.value == $$(self.componentIds.numberFormat).getValue();
                                                                    })[0];
                                                                    fieldSettings.format = selectedFormat.format;

                                                                    break;
                                                                case 'Date':
                                                                    fieldName = base.getFieldName(self.componentIds.dateView);
                                                                    fieldSettings.icon = self.componentIds.dateIcon;

                                                                    fieldSettings.filter_type = 'date';
                                                                    if ($$(self.componentIds.dateIncludeTime).getValue()) {
                                                                        fieldType = 'datetime';
                                                                        fieldSettings.editor = 'datetime';
                                                                    }
                                                                    else {
                                                                        fieldType = 'date';
                                                                        fieldSettings.editor = 'date';
                                                                    }
                                                                    break;
                                                                case 'Checkbox':
                                                                    fieldName = base.getFieldName(self.componentIds.booleanView);
                                                                    fieldType = 'boolean';
                                                                    fieldSettings.icon = self.componentIds.booleanIcon;
                                                                    // editor = 'checkbox';
                                                                    fieldSettings.filter_type = 'boolean';
                                                                    fieldSettings.template = "{common.checkbox()}";
                                                                    break;
                                                                case 'Select list':
                                                                    fieldName = base.getFieldName(self.componentIds.selectListView);
                                                                    fieldType = 'string';
                                                                    fieldSettings.icon = self.componentIds.selectListIcon;

                                                                    if ($$(self.componentIds.selectListOptions).data.count() > 0) {
                                                                        fieldSettings.filter_type = 'list';
                                                                        fieldSettings.editor = 'richselect';
                                                                        fieldSettings.filter_options = [];
                                                                        fieldSettings.options = [];

                                                                        $$(self.componentIds.selectListOptions).data.each(function (opt) {
                                                                            fieldSettings.options.push(opt.name);
                                                                            fieldSettings.filter_options.push({ id: opt.name, value: opt.name });
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
                                                                    fieldName = base.getFieldName(self.componentIds.attachmentView);
                                                                    fieldSettings.icon = self.componentIds.attachmentIcon;
                                                                    alert('Under construction !!');
                                                                    return; // TODO;
                                                            }

                                                            if (base.addFieldCallback) {
                                                                var newFieldInfo = {
                                                                    name: fieldName,
                                                                    type: fieldType,
                                                                    setting: fieldSettings
                                                                };

                                                                // Call callback function
                                                                base.addFieldCallback(newFieldInfo);

                                                                base.hide(); // TODO : if fail, then should not hide
                                                            }

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

                                registerAddNewFieldEvent: function (addFieldCallback) {
                                    this.addFieldCallback = addFieldCallback;
                                },

                                resetState: function () {
                                    var _this = this;

                                    $$(self.componentIds.selectListOptions).clearAll();
                                    $$(self.componentIds.selectListNewOption).setValue('');
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
                        }
                    });
                });
        });
    }
);