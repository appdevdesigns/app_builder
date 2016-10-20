steal(
    // List your Controller's dependencies here:
    'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
    function () {
        var data = {},
            componentIds = {
                chooseTypeMenu: 'ab-new-type-menu',
                chooseTypeView: 'ab-new-none',

                headerNameText: 'ab-new-field-name',
                labelNameText: 'ab-new-label-name',

                saveButton: 'ab-new-save-button'
            },
            labels = {
                common: {
                    name: AD.lang.label.getLabel('ab.common.name') || 'Name',
                    headerName: AD.lang.label.getLabel('ab.common.headerName') || 'Header name',
                    ok: AD.lang.label.getLabel('ab.common.ok') || "Ok",
                    cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel",
                    save: AD.lang.label.getLabel('ab.common.save') || "Save"
                },
                add_fields: {
                    chooseType: AD.lang.label.getLabel('ab.add_fields.chooseType') || "Choose field type...",

                    label: AD.lang.label.getLabel('ab.add_fields.label') || 'Label',

                    addNewField: AD.lang.label.getLabel('ab.add_fields.addNewField') || "Add Column",

                    registerTableWarning: AD.lang.label.getLabel('ab.add_fields.registerTableWarning') || "Please register the datatable to add.",

                    invalidFieldTitle: AD.lang.label.getLabel('ab.add_fields.invalidFieldTitle') || "Your field name is invalid format",
                    invalidFieldDescription: AD.lang.label.getLabel('ab.add_fields.invalidFieldDescription') || "System disallow enter special character to field name.",

                    duplicateFieldTitle: AD.lang.label.getLabel('ab.add_fields.duplicateFieldTitle') || "Your field name is duplicate",
                    duplicateFieldDescription: AD.lang.label.getLabel('ab.add_fields.duplicateFieldDescription') || "Please change your column name",

                    cannotUpdateFields: AD.lang.label.getLabel('ab.add_fields.cannotUpdateFields') || "Could not update columns",
                    waitRestructureObjects: AD.lang.label.getLabel('ab.add_fields.waitRestructureObjects') || "Please wait until restructure objects is complete"
                }
            },
            editDefinitions = AD.classes.AppBuilder.DataFields.getEditDefinitions();

        // Insert please select data type view
        editDefinitions.splice(0, 0, {
            id: componentIds.chooseTypeView,
            rows: [
                { view: "label", label: labels.add_fields.chooseType }
            ]
        });

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
                            id: componentIds.chooseTypeMenu,
                            minWidth: 500,
                            autowidth: true,
                            data: [{
                                value: labels.add_fields.chooseType,
                                submenu: AD.classes.AppBuilder.DataFields.getFieldMenuList()
                            }],
                            on: {
                                onMenuItemClick: function (id) {
                                    var base = this.getTopParentView(),
                                        selectedMenuItem = this.getMenuItem(id),
                                        viewName = AD.classes.AppBuilder.DataFields.getEditViewId(selectedMenuItem.fieldName);

                                    if (viewName) {
                                        AD.classes.AppBuilder.DataFields.populateSettings(AD.classes.AppBuilder.currApp, {
                                            fieldName: selectedMenuItem.fieldName,
                                            name: base.getDefaultFieldName(), // Set default field name
                                            label: base.getDefaultFieldName()
                                        });

                                        $$(viewName).show();

                                        // Highlight name in text box
                                        $('.' + componentIds.headerNameText + ' input[type="text"]').select();

                                        this.getTopParentView().fieldName = selectedMenuItem.fieldName;
                                    }
                                }
                            }
                        },
                        { height: 10 },
                        { cells: editDefinitions },
                        { height: 10 },
                        {
                            cols: [
                                {
                                    view: "button", id: componentIds.saveButton, label: labels.add_fields.addNewField, type: "form", width: 120, click: function () {
                                        var base = this.getTopParentView(),
                                            dataTable = base.dataTable,
                                            fieldInfo = AD.classes.AppBuilder.DataFields.getSettings(base.fieldName);

                                        if (!dataTable) {
                                            webix.message({ type: "error", text: labels.add_fields.registerTableWarning });
                                            return;
                                        }

                                        if (!fieldInfo) {
                                            webix.alert({
                                                title: 'Field info error',
                                                text: 'System could not get this field information ',
                                                ok: labels.common.ok
                                            });
                                            return;
                                        }

                                        // Validate format field name
                                        if (!/^[a-zA-Z0-9\s]+$/.test(fieldInfo.name)) {
                                            webix.alert({
                                                title: labels.add_fields.invalidFieldTitle,
                                                text: labels.add_fields.invalidFieldDescription,
                                                ok: labels.common.ok
                                            });
                                            return;
                                        }

                                        // Validate duplicate field name
                                        var existsColumn = $.grep(dataTable.config.columns, function (c) { return c.id == fieldInfo.name.replace(/ /g, '_'); });
                                        if (existsColumn && existsColumn.length > 0 && !data.editFieldId) {
                                            webix.alert({
                                                title: labels.add_fields.duplicateFieldTitle,
                                                text: labels.add_fields.duplicateFieldDescription,
                                                ok: labels.common.ok
                                            });
                                            return;
                                        }

                                        if (!fieldInfo.weight)
                                            fieldInfo.weight = dataTable.config.columns.length;

                                        // Call callback function
                                        if (base.saveFieldCallback && base.fieldName) {
                                            base.saveFieldCallback(fieldInfo)
                                                .then(function () {
                                                    base.resetState();
                                                    base.hide();
                                                });
                                        }

                                    }
                                },
                                {
                                    view: "button", value: labels.common.cancel, width: 100, click: function () {
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
                                title: labels.add_fields.cannotUpdateFields,
                                text: labels.add_fields.waitRestructureObjects,
                                ok: labels.common.ok
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

            editMode: function (info) {
                this.fieldName = info.fieldName;

                $$(componentIds.chooseTypeMenu).hide();

                $$(componentIds.saveButton).define('label', labels.common.save);
                $$(componentIds.saveButton).refresh();

                data.editFieldId = info.id;

                // Get view name
                var viewName = AD.classes.AppBuilder.DataFields.getEditViewId(info.fieldName);

                // Populate data
                AD.classes.AppBuilder.DataFields.populateSettings(AD.classes.AppBuilder.currApp, info);

                $$(viewName).show();

                $('.' + componentIds.headerNameText).webix_text().disable();

                // Highlight name in text box
                $('.' + componentIds.headerNameText + ' input[type="text"]').select();
            },

            resetState: function () {
                data.editFieldId = null;

                $$(componentIds.saveButton).define('label', labels.add_fields.addNewField);
                $$(componentIds.saveButton).refresh();
                $$(componentIds.chooseTypeView).show();
                $$(componentIds.chooseTypeMenu).show();

                AD.classes.AppBuilder.DataFields.resetState();
            },

            getDefaultFieldName: function () {
                var runningNumber = 1;

                if (this.dataTable)
                    runningNumber = this.dataTable.config.columns.length;

                return 'Field ' + runningNumber;
            }

        }, webix.ui.popup);

    }
);