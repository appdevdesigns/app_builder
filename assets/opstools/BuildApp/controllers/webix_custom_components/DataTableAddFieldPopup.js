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

                            this.data = {};
                            this.componentIds = {
                                chooseTypeMenu: 'ab-new-type-menu',
                                chooseTypeView: 'ab-new-none',

                                connectObjectIcon: 'external-link',
                                connectObjectView: 'ab-new-connectObject',
                                connectObjectList: 'ab-new-connectObject-list-item',
                                connectObjectCreateNew: 'ab-new-connectObject-create-new',
                                connectObjectLinkFrom: 'ab-add-field-link-from',
                                connectObjectLinkFrom2: 'ab-add-field-link-from-2',
                                connectObjectLinkTypeTo: 'ab-add-field-link-type-to',
                                connectObjectLinkTypeFrom: 'ab-add-field-link-type-from',
                                connectObjectLinkTo: 'ab-add-field-link-to',
                                connectObjectLinkTo2: 'ab-add-field-link-to-2',

                                singleTextIcon: 'font',
                                singleTextView: 'ab-new-singleText',
                                singleTextDefault: 'ab-new-singleText-default',
                                singleSupportMultilingual: 'ab-new-singleText-support-multilingual',

                                longTextIcon: 'align-right',
                                longTextView: 'ab-new-longText',
                                longSupportMultilingual: 'ab-new-longText-support-multilingual',

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

                                headerNameText: 'ab-new-field-name',
                                labelNameText: 'ab-new-label-name',

                                saveButton: 'ab-new-save-button'
                            };

                            this.initMultilingualLabels();
                            this.initWebixControls();
                        },

                        initMultilingualLabels: function () {
                            var self = this;
                            self.labels = {};
                            self.labels.common = {};
                            self.labels.add_fields = {};

                            self.labels.common.name = AD.lang.label.getLabel('ab.common.name') || 'Name';
                            self.labels.common.headerName = AD.lang.label.getLabel('ab.common.headerName') || 'Header name';
                            self.labels.common.ok = AD.lang.label.getLabel('ab.common.ok') || "Ok";
                            self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
                            self.labels.common.save = AD.lang.label.getLabel('ab.common.save') || "Save";


                            self.labels.add_fields.chooseType = AD.lang.label.getLabel('ab.add_fields.chooseType') || "Choose field type...";

                            self.labels.add_fields.label = AD.lang.label.getLabel('ab.add_fields.label') || 'Label';

                            self.labels.add_fields.connectField = AD.lang.label.getLabel('ab.add_fields.connectField') || "Connect to another record";
                            self.labels.add_fields.stringField = AD.lang.label.getLabel('ab.add_fields.stringField') || "Single line text";
                            self.labels.add_fields.textField = AD.lang.label.getLabel('ab.add_fields.textField') || "Long text";
                            self.labels.add_fields.numberField = AD.lang.label.getLabel('ab.add_fields.numberField') || "Number";
                            self.labels.add_fields.dateField = AD.lang.label.getLabel('ab.add_fields.dateField') || "Date";
                            self.labels.add_fields.booleanField = AD.lang.label.getLabel('ab.add_fields.booleanField') || "Checkbox";
                            self.labels.add_fields.listField = AD.lang.label.getLabel('ab.add_fields.listField') || "Select list";
                            self.labels.add_fields.attachmentField = AD.lang.label.getLabel('ab.add_fields.attachmentField') || "Attachment";

                            self.labels.add_fields.defaultText = AD.lang.label.getLabel('ab.add_fields.defaultText') || 'Default text';
                            self.labels.add_fields.defaultNumber = AD.lang.label.getLabel('ab.add_fields.defaultNumber') || 'Default number';

                            self.labels.add_fields.supportMultilingual = AD.lang.label.getLabel('ab.add_fields.supportMultilingual') || "Support multilingual";

                            self.labels.add_fields.connectToObject = AD.lang.label.getLabel('ab.add_fields.connectToObject') || "Connect to Object";
                            self.labels.add_fields.connectToNewObject = AD.lang.label.getLabel('ab.add_fields.connectToNewObject') || "Connect to new Object";
                            self.labels.add_fields.allowConnectMultipleValue = AD.lang.label.getLabel('ab.add_fields.allowConnectMultipleValue') || "Allow connecting to multiple records";
                            self.labels.add_fields.requireConnectedObjectTitle = AD.lang.label.getLabel('ab.add_fields.requireConnectedObjectTitle') || "Object required";
                            self.labels.add_fields.requireConnectedObjectDescription = AD.lang.label.getLabel('ab.add_fields.requireConnectedObjectDescription') || "Please select object to connect.";

                            self.labels.add_fields.textDescription = AD.lang.label.getLabel('ab.add_fields.textDescription') || "A long text field that can span multiple lines.";

                            self.labels.add_fields.format = AD.lang.label.getLabel('ab.add_fields.format') || "Format";
                            self.labels.add_fields.numberFormat = AD.lang.label.getLabel('ab.add_fields.numberFormat') || "Number";
                            self.labels.add_fields.priceFormat = AD.lang.label.getLabel('ab.add_fields.priceFormat') || "Price";
                            self.labels.add_fields.allowDecimalNumbers = AD.lang.label.getLabel('ab.add_fields.allowDecimalNumbers') || "Allow decimal numbers";

                            self.labels.add_fields.pickDate = AD.lang.label.getLabel('ab.add_fields.pickDate') || "Pick one from a calendar.";
                            self.labels.add_fields.includeTime = AD.lang.label.getLabel('ab.add_fields.includeTime') || "Include time";

                            self.labels.add_fields.booleanDescription = AD.lang.label.getLabel('ab.add_fields.booleanDescription') || "A single checkbox that can be checked or unchecked.";

                            self.labels.add_fields.listDescription = AD.lang.label.getLabel('ab.add_fields.listDescription') || "Single select allows you to select a single predefined options below from a dropdown.";
                            self.labels.add_fields.listOption = AD.lang.label.getLabel('ab.add_fields.listOption') || "Options";
                            self.labels.add_fields.listAddNewOption = AD.lang.label.getLabel('ab.add_fields.listAddNewOption') || "Add new option";
                            self.labels.add_fields.requireListOptionTitle = AD.lang.label.getLabel('ab.add_fields.requireListOptionTitle') || "Option required";
                            self.labels.add_fields.requireListOptionDescription = AD.lang.label.getLabel('ab.add_fields.requireListOptionDescription') || "Enter at least one option.";

                            self.labels.add_fields.addNewField = AD.lang.label.getLabel('ab.add_fields.addNewField') || "Add Column";

                            self.labels.add_fields.registerTableWarning = AD.lang.label.getLabel('ab.add_fields.registerTableWarning') || "Please register the datatable to add.";

                            self.labels.add_fields.invalidFieldTitle = AD.lang.label.getLabel('ab.add_fields.invalidFieldTitle') || "Your field name is invalid format";
                            self.labels.add_fields.invalidFieldDescription = AD.lang.label.getLabel('ab.add_fields.invalidFieldDescription') || "System disallow enter special character to field name.";

                            self.labels.add_fields.duplicateFieldTitle = AD.lang.label.getLabel('ab.add_fields.duplicateFieldTitle') || "Your field name is duplicate";
                            self.labels.add_fields.duplicateFieldDescription = AD.lang.label.getLabel('ab.add_fields.duplicateFieldDescription') || "Please change your field name";

                            self.labels.add_fields.cannotUpdateFields = AD.lang.label.getLabel('ab.add_fields.cannotUpdateFields') || "Could not update columns";
                            self.labels.add_fields.waitRestructureObjects = AD.lang.label.getLabel('ab.add_fields.waitRestructureObjects') || "Please wait until restructure objects is complete";
                        },

                        initWebixControls: function () {
                            var self = this;

                            webix.protoUI({
                                name: 'add_fields_popup',
                                $init: function (config) {
                                },
                                defaults: {
                                    modal: true,
                                    ready: function () {
                                        this.resetState();
                                    },
                                    body: {
                                        width: 380,
                                        rows: [
                                            {
                                                view: "menu",
                                                id: self.componentIds.chooseTypeMenu,
                                                minWidth: 500,
                                                autowidth: true,
                                                data: [
                                                    {
                                                        value: self.labels.add_fields.chooseType,
                                                        submenu: [
                                                            { view: 'button', value: self.labels.add_fields.connectField, fieldType: 'connectedField', icon: self.componentIds.connectObjectIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.stringField, fieldType: 'string', icon: self.componentIds.singleTextIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.textField, fieldType: 'text', icon: self.componentIds.longTextIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.numberField, fieldType: ['float', 'integer'], icon: self.componentIds.numberIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.dateField, fieldType: ['datetime', 'date'], icon: self.componentIds.dateIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.booleanField, fieldType: 'boolean', icon: self.componentIds.booleanIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.listField, fieldType: 'list', icon: self.componentIds.selectListIcon, type: 'icon' },
                                                            { view: 'button', value: self.labels.add_fields.attachmentField, fieldType: 'attachment', icon: self.componentIds.attachmentIcon, type: 'icon' },
                                                        ]
                                                    }
                                                ],
                                                on: {
                                                    onMenuItemClick: function (id) {
                                                        var base = this.getTopParentView(),
                                                            selectedMenuItem = this.getMenuItem(id),
                                                            viewName = base.getViewName(selectedMenuItem.fieldType);

                                                        if (viewName) {
                                                            $$(viewName).show();

                                                            var headerNameClass = '.' + self.componentIds.headerNameText,
                                                                labelNameClass = '.' + self.componentIds.labelNameText;

                                                            // Set default field name
                                                            if ($(headerNameClass) && $(headerNameClass).length > 0) {
                                                                $(headerNameClass).each(function (index, txtName) {
                                                                    var headerName = $(txtName).webix_text().getValue();
                                                                    if (!headerName || headerName.indexOf('Field ') > -1) {
                                                                        var defaultName = base.getDefaultFieldName();
                                                                        $(txtName).webix_text().setValue(defaultName);

                                                                        // Set default label name
                                                                        var labelTexts = $(labelNameClass).webix_text();

                                                                        if (labelTexts && !(labelTexts instanceof Array))
                                                                            labelTexts = [labelTexts];

                                                                        can.each(labelTexts, function (lblText) {
                                                                            lblText.setValue(defaultName);
                                                                        });

                                                                    }
                                                                });
                                                            }

                                                            // Highlight name in text box
                                                            $(headerNameClass + ' input[type="text"]').select();

                                                            this.getTopParentView().selectedType = selectedMenuItem.value;

                                                            // Set object name to labels
                                                            if (viewName == self.componentIds.connectObjectView) {
                                                                var currObject = self.data.objectList.filter(function (obj) {
                                                                    return obj.id == self.data.currObjectId;
                                                                })[0];

                                                                $$(self.componentIds.connectObjectLinkFrom).setValue(currObject.label);
                                                                $$(self.componentIds.connectObjectLinkFrom2).setValue(currObject.label);
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            { height: 10 },
                                            {
                                                cells: [
                                                    {
                                                        id: self.componentIds.chooseTypeView,
                                                        rows: [
                                                            { view: "label", label: self.labels.add_fields.chooseType }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.connectObjectView,
                                                        rows: [
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.connectObjectIcon).replace('{1}', self.labels.add_fields.connectToObject) },
                                                            {
                                                                view: "list",
                                                                id: self.componentIds.connectObjectList,
                                                                select: true,
                                                                height: 140,
                                                                template: "<div class='ab-new-connectObject-list-item'>#label#</div>",
                                                                on: {
                                                                    onAfterSelect: function () {
                                                                        var selectedObjLabel = this.getSelectedItem(false).label;
                                                                        $$(self.componentIds.connectObjectLinkTo).setValue(selectedObjLabel);
                                                                        $$(self.componentIds.connectObjectLinkTo2).setValue(selectedObjLabel);
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                view: 'button',
                                                                id: self.componentIds.connectObjectCreateNew,
                                                                value: self.labels.add_fields.connectToNewObject,
                                                                click: function () {
                                                                    if (this.getTopParentView().createNewObjectEvent)
                                                                        this.getTopParentView().createNewObjectEvent();
                                                                }
                                                            },
                                                            {
                                                                view: 'layout',
                                                                cols: [
                                                                    {
                                                                        id: self.componentIds.connectObjectLinkFrom,
                                                                        view: 'label',
                                                                        width: 110
                                                                    },
                                                                    {
                                                                        id: self.componentIds.connectObjectLinkTypeTo,
                                                                        view: "segmented",
                                                                        value: "collection",
                                                                        width: 165,
                                                                        inputWidth: 160,
                                                                        options: [
                                                                            { id: "collection", value: "Has many" },
                                                                            { id: "model", value: "Belong to" }
                                                                        ]
                                                                    },
                                                                    {
                                                                        id: self.componentIds.connectObjectLinkTo,
                                                                        view: 'label',
                                                                        label: '[Select object]',
                                                                        width: 110
                                                                    },
                                                                ]
                                                            },
                                                            {
                                                                view: 'layout',
                                                                cols: [
                                                                    {
                                                                        id: self.componentIds.connectObjectLinkTo2,
                                                                        view: 'label',
                                                                        label: '[Select object]',
                                                                        width: 110
                                                                    },
                                                                    {
                                                                        id: self.componentIds.connectObjectLinkTypeFrom,
                                                                        view: "segmented",
                                                                        value: "model",
                                                                        width: 165,
                                                                        inputWidth: 160,
                                                                        options: [
                                                                            { id: "collection", value: "Has many" },
                                                                            { id: "model", value: "Belong to" }
                                                                        ]
                                                                    },
                                                                    {
                                                                        id: self.componentIds.connectObjectLinkFrom2,
                                                                        view: 'label',
                                                                        width: 110
                                                                    },
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.singleTextView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.singleTextIcon).replace('{1}', self.labels.add_fields.stringField) },
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            { view: "text", id: self.componentIds.singleTextDefault, placeholder: self.labels.add_fields.defaultText },
                                                            { view: "checkbox", id: self.componentIds.singleSupportMultilingual, labelRight: self.labels.add_fields.supportMultilingual, labelWidth: 0, value: true }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.longTextView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.longTextIcon).replace('{1}', self.labels.add_fields.textField) },
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            { view: "label", label: self.labels.add_fields.textDescription },
                                                            { view: "checkbox", id: self.componentIds.longSupportMultilingual, labelRight: self.labels.add_fields.supportMultilingual, labelWidth: 0, value: true }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.numberView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.numberIcon).replace('{1}', self.labels.add_fields.numberField) },
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            {
                                                                view: "combo", id: self.componentIds.numberFormat, value: self.labels.add_fields.numberFormat, label: self.labels.add_fields.format, labelWidth: 60, options: [
                                                                    { format: 'numberFormat', value: self.labels.add_fields.numberFormat },
                                                                    { format: 'priceFormat', value: self.labels.add_fields.priceFormat },
                                                                ]
                                                            },
                                                            { view: "checkbox", id: self.componentIds.numberAllowDecimal, labelRight: self.labels.add_fields.allowDecimalNumbers, labelWidth: 0 },
                                                            { view: "text", id: self.componentIds.numberDefault, placeholder: self.labels.add_fields.defaultNumber }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.dateView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.dateIcon).replace('{1}', self.labels.add_fields.dateField) },
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            { view: "label", label: self.labels.add_fields.pickDate },
                                                            { view: "checkbox", id: self.componentIds.dateIncludeTime, labelRight: self.labels.add_fields.includeTime, labelWidth: 0 },
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.booleanView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.booleanIcon).replace('{1}', self.labels.add_fields.booleanField) },
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            { view: "label", label: self.labels.add_fields.booleanDescription }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.selectListView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.selectListIcon).replace('{1}', self.labels.add_fields.listField) },
                                                            self.getFieldNameDefinition(),
                                                            self.getLabelDefinition(),
                                                            { view: "template", template: self.labels.add_fields.listDescription, autoheight: true, borderless: true },
                                                            { view: "label", label: "<b>{0}</b>".replace('{0}', self.labels.add_fields.listOption) },
                                                            {
                                                                view: "editlist",
                                                                id: self.componentIds.selectListOptions,
                                                                template: "<div style='position: relative;'>#label#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
                                                                autoheight: true,
                                                                drag: true,
                                                                editable: true,
                                                                editor: "text",
                                                                editValue: "label",
                                                                onClick: {
                                                                    "ab-new-field-remove": function (e, id, trg) {
                                                                        // Store removed id to array
                                                                        if (!id.startsWith('temp_')) {
                                                                            if (!self.data.removedListIds) self.data.removedListIds = [];

                                                                            self.data.removedListIds.push(id);
                                                                        }

                                                                        $$(self.componentIds.selectListOptions).remove(id);
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                view: "button", value: self.labels.add_fields.listAddNewOption, click: function () {
                                                                    var temp_id = 'temp_' + webix.uid();
                                                                    var itemId = $$(self.componentIds.selectListOptions).add({ id: temp_id, dataId: temp_id, label: '' }, $$(self.componentIds.selectListOptions).count());
                                                                    $$(self.componentIds.selectListOptions).edit(itemId);
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: self.componentIds.attachmentView,
                                                        rows: [
                                                            { view: "label", label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', self.componentIds.attachmentIcon).replace('{1}', self.labels.add_fields.attachmentField) },
                                                            { view: "label", label: "Under construction..." }
                                                        ]
                                                    }
                                                ]
                                            },
                                            { height: 10 },
                                            {
                                                cols: [
                                                    {
                                                        view: "button", id: self.componentIds.saveButton, label: self.labels.add_fields.addNewField, type: "form", width: 120, click: function () {
                                                            var base = this.getTopParentView();
                                                            var dataTable = base.dataTable;

                                                            if (!dataTable) {
                                                                webix.message({ type: "error", text: self.labels.add_fields.registerTableWarning });
                                                                return;
                                                            }

                                                            var fieldName = '',
                                                                fieldLabel = '',
                                                                fieldType = '',
                                                                linkTypeTo = null,
                                                                linkTypeFrom = null,
                                                                linkObject = null,
                                                                options = [],
                                                                supportMultilingual = null,
                                                                fieldSettings = {};

                                                            switch (base.selectedType) {
                                                                case self.labels.add_fields.connectField:
                                                                    var linkObject = $$(self.componentIds.connectObjectList).getSelectedItem();
                                                                    if (!linkObject) {
                                                                        webix.alert({
                                                                            title: self.labels.add_fields.requireConnectedObjectTitle,
                                                                            ok: self.labels.common.ok,
                                                                            text: self.labels.add_fields.requireConnectedObjectDescription
                                                                        })
                                                                        return false;
                                                                    }

                                                                    fieldName = base.getFieldName(self.componentIds.connectObjectView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.connectObjectView);
                                                                    fieldType = 'connectedField';
                                                                    fieldSettings.icon = self.componentIds.connectObjectIcon;
                                                                    fieldSettings.editor = 'selectivity';
                                                                    fieldSettings.template = '<div class="connect-data-values"></div>';
                                                                    fieldSettings.filter_type = 'multiselect';

                                                                    linkTypeTo = $$(self.componentIds.connectObjectLinkTypeTo).getValue();
                                                                    linkTypeFrom = $$(self.componentIds.connectObjectLinkTypeFrom).getValue();
                                                                    linkObject = $$(self.componentIds.connectObjectList).getSelectedId(false);
                                                                    break;
                                                                case self.labels.add_fields.stringField:
                                                                    fieldName = base.getFieldName(self.componentIds.singleTextView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.singleTextView);
                                                                    fieldType = 'string';
                                                                    supportMultilingual = $$(self.componentIds.singleSupportMultilingual).getValue();
                                                                    fieldSettings.icon = self.componentIds.singleTextIcon;
                                                                    fieldSettings.editor = 'text';
                                                                    fieldSettings.filter_type = 'text';
                                                                    fieldSettings.value = $$(self.componentIds.singleTextDefault).getValue();
                                                                    break;
                                                                case self.labels.add_fields.textField:
                                                                    fieldName = base.getFieldName(self.componentIds.longTextView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.longTextView);
                                                                    fieldType = 'text';
                                                                    supportMultilingual = $$(self.componentIds.longSupportMultilingual).getValue();
                                                                    fieldSettings.icon = self.componentIds.longTextIcon;
                                                                    fieldSettings.editor = 'popup';
                                                                    fieldSettings.filter_type = 'text';
                                                                    break;
                                                                case self.labels.add_fields.numberField:
                                                                    fieldName = base.getFieldName(self.componentIds.numberView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.numberView);

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
                                                                    fieldSettings.value = $$(self.componentIds.numberDefault).getValue();
                                                                    break;
                                                                case self.labels.add_fields.dateField:
                                                                    fieldName = base.getFieldName(self.componentIds.dateView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.dateView);
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
                                                                case self.labels.add_fields.booleanField:
                                                                    fieldName = base.getFieldName(self.componentIds.booleanView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.booleanView);
                                                                    fieldType = 'boolean';
                                                                    fieldSettings.icon = self.componentIds.booleanIcon;
                                                                    // editor = 'checkbox';
                                                                    fieldSettings.filter_type = 'boolean';
                                                                    fieldSettings.template = "{common.checkbox()}";
                                                                    break;
                                                                case self.labels.add_fields.listField:
                                                                    $$(self.componentIds.selectListOptions).editStop(); // Close edit mode

                                                                    fieldName = base.getFieldName(self.componentIds.selectListView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.selectListView);
                                                                    fieldType = 'string';
                                                                    fieldSettings.icon = self.componentIds.selectListIcon;

                                                                    fieldSettings.filter_type = 'list';
                                                                    fieldSettings.editor = 'richselect';
                                                                    fieldSettings.filter_options = [];

                                                                    $$(self.componentIds.selectListOptions).data.each(function (opt) {
                                                                        fieldSettings.filter_options.push(opt.label);
                                                                        var optId = typeof opt.dataId == 'string' && opt.dataId.startsWith('temp') ? null : opt.dataId;
                                                                        options.push({ dataId: optId, id: opt.label.replace(/ /g, '_'), value: opt.label });
                                                                    });

                                                                    // Filter value is not empty
                                                                    fieldSettings.filter_options = $.grep(fieldSettings.filter_options, function (name) { return name && name.length > 0; });
                                                                    options = $.grep(options, function (opt) { return opt && opt.value && opt.value.length > 0; });

                                                                    if (options.length < 1) {
                                                                        webix.alert({
                                                                            title: self.labels.add_fields.requireListOptionTitle,
                                                                            ok: self.labels.common.ok,
                                                                            text: self.labels.add_fields.requireListOptionDescription
                                                                        })

                                                                        return;
                                                                    }

                                                                    break;
                                                                case self.labels.add_fields.attachmentField:
                                                                    fieldName = base.getFieldName(self.componentIds.attachmentView);
                                                                    fieldLabel = base.getFieldLabel(self.componentIds.attachmentView);
                                                                    fieldSettings.icon = self.componentIds.attachmentIcon;
                                                                    alert('Under construction !!');
                                                                    return; // TODO;
                                                            }

                                                            // Validate format field name
                                                            if (!/^[a-zA-Z0-9\s]+$/.test(fieldName)) {
                                                                webix.alert({
                                                                    title: self.labels.add_fields.invalidFieldTitle,
                                                                    text: self.labels.add_fields.invalidFieldDescription,
                                                                    ok: self.labels.common.ok
                                                                });
                                                                return;
                                                            }

                                                            // Validate duplicate field name
                                                            var existsColumn = $.grep(dataTable.config.columns, function (c) {
                                                                return c.id == fieldName;
                                                            });

                                                            if (existsColumn && existsColumn.length > 0 && !self.data.editFieldId) {
                                                                webix.alert({
                                                                    title: self.labels.add_fields.duplicateFieldTitle,
                                                                    text: self.labels.add_fields.duplicateFieldDescription,
                                                                    ok: self.labels.common.ok
                                                                });
                                                                return;
                                                            }

                                                            var newFieldInfo = {
                                                                name: fieldName,
                                                                label: fieldLabel,
                                                                type: fieldType,
                                                                setting: fieldSettings
                                                            };

                                                            if (self.data.editFieldId) // Update
                                                                newFieldInfo.id = self.data.editFieldId;
                                                            else // Insert
                                                                newFieldInfo.weight = dataTable.config.columns.length;

                                                            if (options != null && options.length > 0)
                                                                newFieldInfo.options = options;

                                                            if (supportMultilingual != null)
                                                                newFieldInfo.supportMultilingual = supportMultilingual;

                                                            if (linkTypeTo)
                                                                newFieldInfo.linkTypeTo = linkTypeTo

                                                            if (linkTypeFrom)
                                                                newFieldInfo.linkTypeFrom = linkTypeFrom

                                                            if (linkObject)
                                                                newFieldInfo.linkObject = linkObject

                                                            // Call callback function
                                                            if (base.saveFieldCallback && base.selectedType) {
                                                                base.saveFieldCallback(newFieldInfo, self.data.removedListIds)
                                                                    .then(function () {
                                                                        base.resetState();
                                                                        base.hide();
                                                                    });
                                                            }

                                                        }
                                                    },
                                                    {
                                                        view: "button", value: self.labels.common.cancel, width: 100, click: function () {
                                                            this.getTopParentView().resetState();
                                                            this.getTopParentView().hide();
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    on: {
                                        onBeforeShow: function () {
                                            this.resetState();
                                        },
                                        onShow: function () {
                                            if (!AD.comm.isServerReady()) {
                                                this.getTopParentView().hide();

                                                webix.alert({
                                                    title: self.labels.add_fields.cannotUpdateFields,
                                                    text: self.labels.add_fields.waitRestructureObjects,
                                                    ok: self.labels.common.ok
                                                });
                                            }
                                        },
                                        onHide: function () {
                                            this.resetState();
                                        }
                                    }
                                },

                                registerDataTable: function (dataTable) {
                                    this.dataTable = dataTable;
                                },

                                registerSaveFieldEvent: function (saveFieldCallback) {
                                    this.saveFieldCallback = saveFieldCallback;
                                },

                                registerCreateNewObjectEvent: function (createNewObjectEvent) {
                                    this.createNewObjectEvent = createNewObjectEvent;
                                },

                                editMode: function (data) {
                                    $$(self.componentIds.chooseTypeMenu).hide();

                                    $$(self.componentIds.saveButton).define('label', self.labels.common.save);
                                    $$(self.componentIds.saveButton).refresh();

                                    self.data.editFieldId = data.id;

                                    // Check and Change type to list
                                    if (data.type === 'string' && data.setting.options && data.setting.options.length > 0) {
                                        data.type = 'list';
                                    }

                                    // Get view name
                                    var viewName = this.getViewName(data.type);

                                    // Populate data
                                    switch (data.type) {
                                        case 'connectedField':
                                            this.selectedType = self.labels.add_fields.connectField;
                                            var currObject = self.data.objectList.filter(function (obj) {
                                                return obj.id == self.data.currObjectId;
                                            })[0],
                                                selectedObject = $$(self.componentIds.connectObjectList).data.find(function (obj) {
                                                    var linkObjId = data.linkObject.id ? data.linkObject.id: data.linkObject;
                                                    return obj.id == linkObjId;
                                                })[0];

                                            $$(self.componentIds.connectObjectList).disable();
                                            $$(self.componentIds.connectObjectList).select(selectedObject.id);
                                            $$(self.componentIds.connectObjectCreateNew).disable();

                                            $$(self.componentIds.connectObjectLinkFrom).setValue(currObject.label);
                                            $$(self.componentIds.connectObjectLinkFrom2).setValue(currObject.label);

                                            $$(self.componentIds.connectObjectLinkTypeTo).setValue(data.linkType);
                                            $$(self.componentIds.connectObjectLinkTypeFrom).setValue(data.setting.linkViaType);
                                            break;
                                        case 'string':
                                            this.selectedType = self.labels.add_fields.stringField;
                                            $$(self.componentIds.singleTextDefault).setValue(data.default);
                                            $$(self.componentIds.singleSupportMultilingual).setValue(data.supportMultilingual);
                                            break;
                                        case 'text':
                                            this.selectedType = self.labels.add_fields.textField;
                                            $$(self.componentIds.longSupportMultilingual).setValue(data.supportMultilingual);
                                            break;
                                        case 'float': // Number
                                        case 'integer':
                                            this.selectedType = self.labels.add_fields.numberField;

                                            $$(self.componentIds.numberAllowDecimal).setValue(data.type == 'float');
                                            $$(self.componentIds.numberAllowDecimal).disable();

                                            var selectedFormat = $$(self.componentIds.numberFormat).getList().find(function (format) {
                                                return format.format == data.setting.format;
                                            });

                                            if (selectedFormat && selectedFormat.length > 0)
                                                $$(self.componentIds.numberFormat).setValue(selectedFormat[0].value);

                                            $$(self.componentIds.numberDefault).setValue(data.default);
                                            break;
                                        case 'datetime': // Date
                                        case 'date':
                                            this.selectedType = self.labels.add_fields.dateField;

                                            $$(self.componentIds.dateIncludeTime).setValue(data.type == 'datetime');
                                            $$(self.componentIds.dateIncludeTime).disable();
                                            break;
                                        case 'boolean':
                                            this.selectedType = self.labels.add_fields.booleanField;
                                            break;
                                        case 'list':
                                            this.selectedType = self.labels.add_fields.listField;
                                            var options = [];
                                            data.setting.options.forEach(function (opt) {
                                                options.push({
                                                    dataId: opt.dataId,
                                                    id: opt.id,
                                                    label: opt.label
                                                });
                                            });
                                            $$(self.componentIds.selectListOptions).parse(options);
                                            $$(self.componentIds.selectListOptions).refresh();
                                            break;
                                    }

                                    $$(viewName).show();

                                    // Set field name
                                    $('.' + self.componentIds.headerNameText).each(function (index, txtName) {
                                        $(txtName).webix_text().setValue(data.name.replace(/_/g, ' '));
                                    });

                                    // Set field label
                                    $('.' + self.componentIds.labelNameText).each(function (index, lblName) {
                                        $(lblName).webix_text().setValue(data.label);
                                    });

                                    // Highlight name in text box
                                    $('.' + self.componentIds.headerNameText + ' input[type="text"]').select();
                                },

                                setObjectList: function (objectList) {
                                    self.data.objectList = objectList;

                                    // Set enable connect object list to the add new column popup
                                    var enableConnectObjects = objectList.filter(function (o) {
                                        return o.id != self.data.currObjectId;
                                    });

                                    $$(self.componentIds.connectObjectList).clearAll();
                                    $$(self.componentIds.connectObjectList).parse(enableConnectObjects.attr ? enableConnectObjects.attr() : enableConnectObjects);
                                    $$(self.componentIds.connectObjectList).refresh();
                                },

                                setCurrObjectId: function (objectId) {
                                    self.data.currObjectId = objectId
                                },

                                resetState: function () {
                                    self.data.editFieldId = null;

                                    self.data.removedListIds = [];

                                    $$(self.componentIds.saveButton).define('label', self.labels.add_fields.addNewField);
                                    $$(self.componentIds.saveButton).refresh();
                                    $$(self.componentIds.chooseTypeView).show();
                                    $$(self.componentIds.chooseTypeMenu).show();
                                    $$(self.componentIds.connectObjectList).unselectAll();
                                    $$(self.componentIds.connectObjectList).enable();
                                    $$(self.componentIds.connectObjectLinkFrom).setValue('');
                                    $$(self.componentIds.connectObjectLinkFrom2).setValue('');
                                    $$(self.componentIds.connectObjectLinkTypeTo).setValue('collection');
                                    $$(self.componentIds.connectObjectLinkTypeFrom).setValue('model');
                                    $$(self.componentIds.connectObjectLinkTo).setValue('[Select object]');
                                    $$(self.componentIds.connectObjectLinkTo2).setValue('[Select object]');
                                    $$(self.componentIds.connectObjectCreateNew).enable();
                                    $$(self.componentIds.selectListOptions).editCancel();
                                    $$(self.componentIds.selectListOptions).unselectAll();
                                    $$(self.componentIds.selectListOptions).clearAll();
                                    $$(self.componentIds.numberFormat).setValue(self.labels.add_fields.numberFormat);
                                    $$(self.componentIds.numberAllowDecimal).setValue(false);
                                    $$(self.componentIds.numberAllowDecimal).enable();
                                    $$(self.componentIds.dateIncludeTime).setValue(false);
                                    $$(self.componentIds.dateIncludeTime).enable();
                                    $('.' + self.componentIds.headerNameText).each(function (index, txtName) {
                                        $(txtName).webix_text().setValue('');
                                    });
                                },

                                getDefaultFieldName: function () {
                                    var runningNumber = 1;

                                    if (this.dataTable)
                                        runningNumber = this.dataTable.config.columns.length;

                                    return 'Field ' + runningNumber;
                                },

                                getFieldName: function (viewName) {
                                    var self = this,
                                        fieldName = $.grep($$(viewName).getChildViews(), function (element, i) {
                                            return $(element.$view).hasClass('ab-new-field-name');
                                        });

                                    if (fieldName && fieldName.length > 0)
                                        return fieldName[0].getValue();
                                    else
                                        return '';
                                },

                                getFieldLabel: function (viewName) {
                                    var self = this,
                                        fieldLabel = $.grep($$(viewName).getChildViews(), function (element, i) {
                                            return $(element.$view).hasClass('ab-new-label-name');
                                        });

                                    if (fieldLabel && fieldLabel.length > 0)
                                        return fieldLabel[0].getValue();
                                    else
                                        return '';
                                },

                                getViewName: function (fieldType) {
                                    if ($.isArray(fieldType)) fieldType = fieldType[0];

                                    switch (fieldType) {
                                        case 'connectedField':
                                            return self.componentIds.connectObjectView;
                                        case 'string':
                                            return self.componentIds.singleTextView;
                                        case 'text':
                                            return self.componentIds.longTextView;
                                        case 'float':
                                        case 'integer':
                                            return self.componentIds.numberView;
                                        case 'datetime':
                                        case 'date':
                                            return self.componentIds.dateView;
                                        case 'boolean':
                                            return self.componentIds.booleanView;
                                        case 'list':
                                            return self.componentIds.selectListView;
                                        case 'attachment':
                                            return self.componentIds.attachmentView;
                                    }
                                }

                            }, webix.ui.popup);
                        },

                        getFieldNameDefinition: function () {
                            var self = this;

                            return {
                                view: "text", label: self.labels.common.name, placeholder: self.labels.common.name, css: self.componentIds.headerNameText, labelWidth: 50, on: {
                                    onChange: function (newValue, oldValue) {
                                        var labelNames = this.getParentView().getChildViews().filter(function (view) {
                                            return view.config.css === self.componentIds.labelNameText;
                                        });

                                        labelNames.forEach(function (labelName) {
                                            if (oldValue == labelName.getValue())
                                                labelName.setValue(newValue);
                                        });
                                    }
                                }
                            };
                        },

                        getLabelDefinition: function () {
                            return {
                                view: "text",
                                label: this.labels.add_fields.label,
                                placeholder: this.labels.common.headerName,
                                css: this.componentIds.labelNameText,
                                labelWidth: 50
                            };
                        }

                    });
                });
        });
    }
);