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

                            self.labels.add_fields.connectToObject = AD.lang.label.getLabel('ab.add_fields.connectToObject') || "Connect to Object";
                            self.labels.add_fields.connectToNewObject = AD.lang.label.getLabel('ab.add_fields.connectToNewObject') || "Connect to new Object";
                            self.labels.add_fields.allowConnectMultipleValue = AD.lang.label.getLabel('ab.add_fields.allowConnectMultipleValue') || "Allow connecting to multiple records";
                            self.labels.add_fields.requireConnectedObjectTitle = AD.lang.label.getLabel('ab.add_fields.requireConnectedObjectTitle') || "Object required";
                            self.labels.add_fields.requireConnectedObjectDescription = AD.lang.label.getLabel('ab.add_fields.requireConnectedObjectDescription') || "Please select object to connect.";

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
                            var self = this,
                                editDefinitions = AD.classes.AppBuilder.DataFields.getEditDefinitions();

                            // Insert please select data type view
                            editDefinitions.splice(0, 0, {
                                id: self.componentIds.chooseTypeView,
                                rows: [
                                    { view: "label", label: self.labels.add_fields.chooseType }
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
                                                id: self.componentIds.chooseTypeMenu,
                                                minWidth: 500,
                                                autowidth: true,
                                                data: [{
                                                    value: self.labels.add_fields.chooseType,
                                                    submenu: AD.classes.AppBuilder.DataFields.getFieldMenuList()
                                                }],
                                                on: {
                                                    onMenuItemClick: function (id) {
                                                        var base = this.getTopParentView(),
                                                            selectedMenuItem = this.getMenuItem(id),
                                                            viewName = AD.classes.AppBuilder.DataFields.getEditViewId(selectedMenuItem.fieldName);

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

                                                            this.getTopParentView().fieldName = selectedMenuItem.fieldName;

                                                            // TODO : Move to the data field file
                                                            // Set object name to labels
                                                            // if (viewName == self.componentIds.connectObjectView) {
                                                            //     var currObject = self.data.objectList.filter(function (obj) {
                                                            //         return obj.id == self.data.currObjectId;
                                                            //     })[0];

                                                            // $$(self.componentIds.connectObjectLinkFrom).setValue(currObject.label);
                                                            // $$(self.componentIds.connectObjectLinkFrom2).setValue(currObject.label);
                                                            // }
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
                                                        view: "button", id: self.componentIds.saveButton, label: self.labels.add_fields.addNewField, type: "form", width: 120, click: function () {
                                                            var base = this.getTopParentView(),
                                                                dataTable = base.dataTable;

                                                            if (!dataTable) {
                                                                webix.message({ type: "error", text: self.labels.add_fields.registerTableWarning });
                                                                return;
                                                            }

                                                            // var fieldName = '',
                                                            //     fieldLabel = '',
                                                            //     fieldType = '',
                                                            //     linkTypeTo = null,
                                                            //     linkTypeFrom = null,
                                                            //     linkObject = null,
                                                            //     options = [],
                                                            //     supportMultilingual = null,
                                                            //     fieldSettings = {};

                                                            // switch (base.selectedType) {
                                                            //     case self.labels.add_fields.connectField:
                                                            //         var linkObject = $$(self.componentIds.connectObjectList).getSelectedItem();
                                                            //         if (!linkObject) {
                                                            //             webix.alert({
                                                            //                 title: self.labels.add_fields.requireConnectedObjectTitle,
                                                            //                 ok: self.labels.common.ok,
                                                            //                 text: self.labels.add_fields.requireConnectedObjectDescription
                                                            //             })
                                                            //             return false;
                                                            //         }

                                                            //         fieldName = base.getFieldName(self.componentIds.connectObjectView);
                                                            //         fieldLabel = base.getFieldLabel(self.componentIds.connectObjectView);
                                                            //         fieldType = 'connectObject';
                                                            //         fieldSettings.icon = self.componentIds.connectObjectIcon;
                                                            //         fieldSettings.editor = 'selectivity';
                                                            //         fieldSettings.template = '<div class="connect-data-values"></div>';
                                                            //         fieldSettings.filter_type = 'multiselect';

                                                            //         linkTypeTo = $$(self.componentIds.connectObjectLinkTypeTo).getValue();
                                                            //         linkTypeFrom = $$(self.componentIds.connectObjectLinkTypeFrom).getValue();
                                                            //         linkObject = $$(self.componentIds.connectObjectList).getSelectedId(false);
                                                            //         break;
                                                            // }

                                                            var fieldInfo = AD.classes.AppBuilder.DataFields.getSettings(base.fieldName);

                                                            if (!fieldInfo) {
                                                                webix.alert({
                                                                    title: 'Field info error',
                                                                    text: 'System could not get this field information ',
                                                                    ok: self.labels.common.ok
                                                                });
                                                                return;
                                                            }

                                                            // Validate format field name
                                                            if (!/^[a-zA-Z0-9\s]+$/.test(fieldInfo.name)) {
                                                                webix.alert({
                                                                    title: self.labels.add_fields.invalidFieldTitle,
                                                                    text: self.labels.add_fields.invalidFieldDescription,
                                                                    ok: self.labels.common.ok
                                                                });
                                                                return;
                                                            }

                                                            // Validate duplicate field name
                                                            var existsColumn = $.grep(dataTable.config.columns, function (c) {
                                                                return c.id == fieldInfo.name;
                                                            });

                                                            if (existsColumn && existsColumn.length > 0 && !self.data.editFieldId) {
                                                                webix.alert({
                                                                    title: self.labels.add_fields.duplicateFieldTitle,
                                                                    text: self.labels.add_fields.duplicateFieldDescription,
                                                                    ok: self.labels.common.ok
                                                                });
                                                                return;
                                                            }

                                                            if (self.data.editFieldId) // Update
                                                                fieldInfo.id = self.data.editFieldId;
                                                            else // Insert
                                                                fieldInfo.weight = dataTable.config.columns.length;

                                                            // if (linkTypeTo)
                                                            //     newFieldInfo.linkTypeTo = linkTypeTo

                                                            // if (linkTypeFrom)
                                                            //     newFieldInfo.linkTypeFrom = linkTypeFrom

                                                            // if (linkObject)
                                                            //     newFieldInfo.linkObject = linkObject

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
                                    this.fieldName = data.fieldName;

                                    $$(self.componentIds.chooseTypeMenu).hide();

                                    $$(self.componentIds.saveButton).define('label', self.labels.common.save);
                                    $$(self.componentIds.saveButton).refresh();

                                    self.data.editFieldId = data.id;

                                    // Get view name
                                    var viewName = AD.classes.AppBuilder.DataFields.getEditViewId(data.fieldName);

                                    // Populate data
                                    AD.classes.AppBuilder.DataFields.populateSettings(data);

                                    $$(viewName).show();

                                    // Set field name
                                    $('.' + self.componentIds.headerNameText).each(function (index, txtName) {
                                        $(txtName).webix_text().setValue(data.name.replace(/_/g, ' '));
                                        $(txtName).webix_text().disable();
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

                                    // TODO : Move to the data field file
                                    // // Set enable connect object list to the add new column popup
                                    // var enableConnectObjects = objectList.filter(function (o) {
                                    //     return o.id != self.data.currObjectId;
                                    // });
                                    // $$(self.componentIds.connectObjectList).clearAll();
                                    // $$(self.componentIds.connectObjectList).parse(enableConnectObjects.attr ? enableConnectObjects.attr() : enableConnectObjects);
                                    // $$(self.componentIds.connectObjectList).refresh();
                                },

                                setCurrObjectId: function (objectId) {
                                    self.data.currObjectId = objectId
                                },

                                resetState: function () {
                                    self.data.editFieldId = null;

                                    $$(self.componentIds.saveButton).define('label', self.labels.add_fields.addNewField);
                                    $$(self.componentIds.saveButton).refresh();
                                    $$(self.componentIds.chooseTypeView).show();
                                    $$(self.componentIds.chooseTypeMenu).show();

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

                    });
                });
        });
    }
);