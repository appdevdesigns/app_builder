const ABViewFormCore = require("../../core/views/ABViewFormCore");
const ABViewFormButton = require("./ABViewFormButton");
const ABViewFormCustom = require("./ABViewFormCustom");
const ABViewFormComponent = require("./ABViewFormComponent");
const ABViewFormTextbox = require("./ABViewFormTextbox");

const ABRecordRule = require("../../rules/ABViewRuleListFormRecordRules");
const ABSubmitRule = require("../../rules/ABViewRuleListFormSubmitRules");

let PopupRecordRule = null;
let PopupSubmitRule = null;

const ABViewFormPropertyComponentDefaults = ABViewFormCore.defaultValues();

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewForm extends ABViewFormCore {
    constructor(values, application, parent, defaultValues) {
        super(values, application, parent, defaultValues);
    }

    /**
     * @method editorComponent
     * return the Editor for this UI component.
     * the editor should display either a "block" view or "preview" of
     * the current layout of the view.
     * @param {string} mode what mode are we in ['block', 'preview']
     * @return {Component}
     */
    editorComponent(App, mode) {
        var comp = super.editorComponent(App, mode);

        // Define height of cell
        comp.ui.rows[0].cellHeight = 75;

        return comp;
    }

    //
    // Property Editor
    //

    static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
        var commonUI = super.propertyEditorDefaultElements(
            App,
            ids,
            _logic,
            ObjectDefaults
        );

        var idBase = "ABViewForm";

        // PopupDisplayRule = new ABDisplayRule(App, idBase + "_displayrule");

        PopupRecordRule = new ABRecordRule();
        PopupRecordRule.component(App, idBase + "_recordrule"); // prepare the UI component.

        PopupSubmitRule = new ABSubmitRule();
        PopupSubmitRule.component(App, idBase + "_submitrule");

        // _logic functions

        _logic.selectSource = (dcId, oldDcId) => {
            // TODO : warning message

            _logic.busy();

            let currView = _logic.currentEditObject();
            let formView = currView.parentFormComponent();

            currView.settings.dataviewID = dcId;

            // clear sub views
            currView._views = [];

            return (
                Promise.resolve()
                    // .then(() => {
                    // 	// remove all old components
                    // 	let destroyTasks = [];
                    // 	if (oldDcId != null) {
                    // 		let oldComps = formView.views();
                    // 		oldComps.forEach(child => destroyTasks.push(() => child.destroy()));
                    // 	}

                    // 	return destroyTasks.reduce((promiseChain, currTask) => {
                    // 		return promiseChain.then(currTask);
                    // 	}, Promise.resolve([]));
                    // })
                    .then(() => {
                        // refresh UI
                        // formView.emit('properties.updated', currView);

                        _logic.busy();

                        // Update field options in property
                        this.propertyUpdateFieldOptions(ids, currView, dcId);

                        // add all fields to editor by default
                        if (currView._views.length > 0)
                            return Promise.resolve();

                        // let saveTasks = [];
                        let fields = $$(ids.fields).find({});
                        fields.reverse();
                        fields.forEach((f, index) => {
                            if (!f.selected) {
                                let yPosition = fields.length - index - 1;

                                // Add new form field
                                let newFieldView = currView.addFieldToForm(
                                    f,
                                    yPosition
                                );
                                if (newFieldView) {
                                    newFieldView.once("destroyed", () =>
                                        this.propertyEditorPopulate(
                                            App,
                                            ids,
                                            currView
                                        )
                                    );

                                    // // Call save API
                                    // saveTasks.push(() => newFieldView.save());
                                }

                                // update item to UI list
                                f.selected = 1;
                                $$(ids.fields).updateItem(f.id, f);
                            }
                        });

                        let defaultButton = formView.refreshDefaultButton(ids);
                        // if (defaultButton)
                        // 	saveTasks.push(() => defaultButton.save());

                        // return saveTasks.reduce((promiseChain, currTask) => {
                        // 	return promiseChain.then(currTask);
                        // }, Promise.resolve([]));

                        return Promise.resolve();
                    })
                    // Saving
                    .then(() => {
                        let includeSubViews = true;
                        return currView.save(includeSubViews);
                    })
                    // Finally
                    .then(() => {
                        // refresh UI
                        formView.emit("properties.updated", currView);

                        // Update field options in property
                        this.propertyUpdateRules(ids, currView, dcId);

                        _logic.ready();

                        return Promise.resolve();
                    })
            );
        };

        _logic.listTemplate = (field, common) => {
            let currView = _logic.currentEditObject();

            // disable in form
            var fieldComponent = field.formComponent();
            if (fieldComponent == null)
                return "<i class='fa fa-times'></i>  #label# <div class='ab-component-form-fields-component-info'> Disable </div>".replace(
                    "#label#",
                    field.label
                );

            var componentKey = fieldComponent.common().key;
            var formComponent = currView.application.viewAll(
                (v) => v.common().key == componentKey
            )[0];

            return (
                common.markCheckbox(field) +
                " #label# <div class='ab-component-form-fields-component-info'> <i class='fa fa-#icon#'></i> #component# </div>"
                    .replace("#label#", field.label)
                    .replace(
                        "#icon#",
                        formComponent ? formComponent.common().icon : "fw"
                    )
                    .replace(
                        "#component#",
                        formComponent
                            ? L(formComponent.common().labelKey, "")
                            : ""
                    )
            );
        };

        _logic.check = (e, fieldId) => {
            let currView = _logic.currentEditObject();
            let formView = currView.parentFormComponent();

            // update UI list
            let item = $$(ids.fields).getItem(fieldId);
            item.selected = item.selected ? 0 : 1;
            $$(ids.fields).updateItem(fieldId, item);

            let doneFn = () => {
                formView
                    .refreshDefaultButton(ids)
                    .save()
                    .then(() => {
                        // refresh UI
                        currView.emit("properties.updated", currView);
                    });

                // // trigger a save()
                // this.propertyEditorSave(ids, currView);
            };

            // add a field to the form
            if (item.selected) {
                let fieldView = currView.addFieldToForm(item);
                if (fieldView) {
                    fieldView.save().then(() => {
                        fieldView.once("destroyed", () =>
                            this.propertyEditorPopulate(App, ids, currView)
                        );

                        doneFn();
                    });
                }
            }
            // remove field in the form
            else {
                let fieldView = formView
                    .fieldComponents()
                    .filter((c) => c.settings.fieldId == fieldId)[0];
                if (fieldView) {
                    // let remainingViews = formView.views(c => c.settings.fieldId != fieldId);
                    // formView._views = remainingViews;

                    fieldView.destroy().then(() => {
                        doneFn();
                    });
                }
            }
        };

        // Display rule
        _logic.displayRuleShow = () => {
            // var currView = _logic.currentEditObject();
            // PopupDisplayRule.setValue(currView.settings.displayRules);
            // PopupDisplayRule.show();
        };

        _logic.displayRuleSave = () => {};

        // Record rule
        _logic.recordRuleShow = () => {
            var currView = _logic.currentEditObject();

            PopupRecordRule.formLoad(currView);
            PopupRecordRule.fromSettings(currView.settings.recordRules);
            PopupRecordRule.show();

            // NOTE: Querybuilder v5.2 has a bug where it won't display the [and/or]
            // choosers properly if it hasn't been shown before the .setValue() call.
            // so this work around allows us to refresh the display after the .show()
            // on the popup.
            // When they've fixed the bug, we'll remove this workaround:
            PopupRecordRule.qbFixAfterShow();
        };

        _logic.recordRuleSave = (settings) => {
            var currView = _logic.currentEditObject();
            currView.settings.recordRules = settings;

            // trigger a save()
            this.propertyEditorSave(ids, currView);

            // update badge number of rules
            this.populateBadgeNumber(ids, currView);
        };

        // Submit rule
        _logic.submitRuleShow = () => {
            var currView = _logic.currentEditObject();

            PopupSubmitRule.fromSettings(currView.settings.submitRules);
            PopupSubmitRule.show();
        };

        _logic.submitRuleSave = (settings) => {
            var currView = _logic.currentEditObject();
            currView.settings.submitRules = settings;

            // trigger a save()
            this.propertyEditorSave(ids, currView);

            // update badge number of rules
            this.populateBadgeNumber(ids, currView);
        };

        /** Initial rule popups */
        // PopupDisplayRule.init({
        // 	onSave: _logic.displayRuleSave
        // });

        PopupRecordRule.init({
            onSave: _logic.recordRuleSave
        });

        PopupSubmitRule.init({
            onSave: _logic.submitRuleSave
        });

        return commonUI.concat([
            {
                name: "datacollection",
                view: "richselect",
                label: L("ab.components.form.dataSource", "*Data Source"),
                labelWidth: App.config.labelWidthLarge,
                skipAutoSave: true,
                on: {
                    onChange: _logic.selectSource
                }
            },

            {
                view: "fieldset",
                label: L("ab.components.form.formFields", "*Form Fields:"),
                labelWidth: App.config.labelWidthLarge,
                body: {
                    type: "clean",
                    padding: 10,
                    rows: [
                        {
                            name: "fields",
                            view: "list",
                            select: false,
                            minHeight: 200,
                            template: _logic.listTemplate,
                            type: {
                                markCheckbox: function(item) {
                                    return (
                                        "<span class='check webix_icon fa fa-" +
                                        (item.selected ? "check-" : "") +
                                        "square-o'></span>"
                                    );
                                }
                            },
                            onClick: {
                                check: _logic.check
                            }
                        }
                    ]
                }
            },
            {
                name: "showLabel",
                view: "checkbox",
                label: L("ab.components.common.showlabel", "*Display Label"),
                labelWidth: App.config.labelWidthLarge
            },
            {
                name: "labelPosition",
                view: "richselect",
                label: L(
                    "ab.components.common.labelPosition",
                    "*Label Position"
                ),
                labelWidth: App.config.labelWidthLarge,
                options: [
                    {
                        id: "left",
                        value: L("ab.components.common.left", "*Left")
                    },
                    {
                        id: "top",
                        value: L("ab.components.common.top", "*Top")
                    }
                ]
            },
            {
                name: "labelWidth",
                view: "counter",
                label: L("ab.components.common.labelWidth", "*Label Width"),
                labelWidth: App.config.labelWidthLarge
            },
            {
                view: "counter",
                name: "height",
                label: L("ab.components.common.height", "*Height:"),
                labelWidth: App.config.labelWidthLarge
            },
            {
                name: "clearOnLoad",
                view: "checkbox",
                label: L("ab.components.form.clearOnLoad", "*Clear on load"),
                labelWidth: App.config.labelWidthLarge
            },
            {
                name: "clearOnSave",
                view: "checkbox",
                label: L("ab.components.form.clearOnSave", "*Clear on save"),
                labelWidth: App.config.labelWidthLarge
            },
            {
                view: "fieldset",
                label: L("ab.components.form.rules", "*Rules:"),
                labelWidth: App.config.labelWidthLarge,
                body: {
                    type: "clean",
                    padding: 10,
                    rows: [
                        {
                            cols: [
                                {
                                    view: "label",
                                    label: L(
                                        "ab.components.form.submitRules",
                                        "*Submit Rules:"
                                    ),
                                    width: App.config.labelWidthLarge
                                },
                                {
                                    view: "button",
                                    css: "webix_primary",
                                    name: "buttonSubmitRules",
                                    label: L(
                                        "ab.components.form.settings",
                                        "*Settings"
                                    ),
                                    icon: "fa fa-gear",
                                    type: "icon",
                                    badge: 0,
                                    click: function() {
                                        _logic.submitRuleShow();
                                    }
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "label",
                                    label: L(
                                        "ab.components.form.displayRules",
                                        "*Display Rules:"
                                    ),
                                    width: App.config.labelWidthLarge
                                },
                                {
                                    view: "button",
                                    name: "buttonDisplayRules",
                                    css: "webix_priamry",
                                    label: L(
                                        "ab.components.form.settings",
                                        "*Settings"
                                    ),
                                    icon: "fa fa-gear",
                                    type: "icon",
                                    badge: 0,
                                    click: function() {
                                        _logic.displayRuleShow();
                                    }
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "label",
                                    label: L(
                                        "ab.components.form.recordRules",
                                        "*Record Rules:"
                                    ),
                                    width: App.config.labelWidthLarge
                                },
                                {
                                    view: "button",
                                    name: "buttonRecordRules",
                                    css: "webix_primary",
                                    label: L(
                                        "ab.components.form.settings",
                                        "*Settings"
                                    ),
                                    icon: "fa fa-gear",
                                    type: "icon",
                                    badge: 0,
                                    click: function() {
                                        _logic.recordRuleShow();
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]);
    }

    static propertyEditorPopulate(App, ids, view, logic) {
        super.propertyEditorPopulate(App, ids, view, logic);

        var formCom = view.parentFormComponent();
        var datacollectionId = formCom.settings.dataviewID
            ? formCom.settings.dataviewID
            : null;
        var SourceSelector = $$(ids.datacollection);

        // Pull data collections to options
        var dcOptions = view.application
            .datacollections((dc) => {
                var obj = dc.datasource;

                return dc.sourceType == "object" && obj && !obj.isImported;
            })
            .map((dc) => {
                return {
                    id: dc.id,
                    value: dc.label
                };
            });

        dcOptions.unshift({
            id: null,
            value: "[Select]"
        });
        SourceSelector.define("options", dcOptions);
        SourceSelector.define("value", datacollectionId);
        SourceSelector.refresh();

        this.propertyUpdateFieldOptions(ids, view, datacollectionId);

        // update properties when a field component is deleted
        view.views().forEach((v) => {
            if (v instanceof ABViewFormComponent)
                v.once("destroyed", () =>
                    this.propertyEditorPopulate(App, ids, view)
                );
        });

        SourceSelector.enable();
        $$(ids.showLabel).setValue(view.settings.showLabel);
        $$(ids.labelPosition).setValue(
            view.settings.labelPosition ||
                ABViewFormPropertyComponentDefaults.labelPosition
        );
        $$(ids.labelWidth).setValue(
            view.settings.labelWidth ||
                ABViewFormPropertyComponentDefaults.labelWidth
        );
        $$(ids.height).setValue(
            view.settings.height || ABViewFormPropertyComponentDefaults.height
        );
        $$(ids.clearOnLoad).setValue(
            view.settings.clearOnLoad ||
                ABViewFormPropertyComponentDefaults.clearOnLoad
        );
        $$(ids.clearOnSave).setValue(
            view.settings.clearOnSave ||
                ABViewFormPropertyComponentDefaults.clearOnSave
        );

        this.propertyUpdateRules(ids, view, datacollectionId);
        this.populateBadgeNumber(ids, view);

        // when a change is made in the properties the popups need to reflect the change
        this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
        if (!this.updateEventIds[view.id]) {
            this.updateEventIds[view.id] = true;

            view.addListener("properties.updated", () => {
                this.populateBadgeNumber(ids, view);
            });
        }
    }

    static propertyEditorValues(ids, view) {
        super.propertyEditorValues(ids, view);

        view.settings.dataviewID = $$(ids.datacollection).getValue();
        view.settings.showLabel = $$(ids.showLabel).getValue();
        view.settings.labelPosition =
            $$(ids.labelPosition).getValue() ||
            ABViewFormPropertyComponentDefaults.labelPosition;
        view.settings.labelWidth =
            $$(ids.labelWidth).getValue() ||
            ABViewFormPropertyComponentDefaults.labelWidth;
        view.settings.height = $$(ids.height).getValue();
        view.settings.clearOnLoad = $$(ids.clearOnLoad).getValue();
        view.settings.clearOnSave = $$(ids.clearOnSave).getValue();
    }

    /**
     * @method propertyUpdateFieldOptions
     * Populate fields of object to select list in property
     *
     * @param {Object} ids
     * @param {ABViewForm} view - the current component
     * @param {string} dcId - id of ABDatacollection
     */
    static propertyUpdateFieldOptions(ids, view, dcId) {
        var formComponent = view.parentFormComponent();
        var existsFields = formComponent.fieldComponents();
        var datacollection = view.application.datacollections(
            (dc) => dc.id == dcId
        )[0];
        var object = datacollection ? datacollection.datasource : null;

        // Pull field list
        var fieldOptions = [];
        if (object != null) {
            fieldOptions = object.fields().map((f) => {
                f.selected =
                    existsFields.filter((com) => {
                        return f.id == com.settings.fieldId;
                    }).length > 0;

                return f;
            });
        }

        $$(ids.fields).clearAll();
        $$(ids.fields).parse(fieldOptions);
    }

    static propertyUpdateRules(ids, view, dcId) {
        if (!view) return;

        // Populate values to rules
        var selectedDv = view.datacollection;
        if (selectedDv) {
            // PopupDisplayRule.objectLoad(selectedDv.datasource);
            PopupRecordRule.objectLoad(selectedDv.datasource);
            PopupSubmitRule.objectLoad(selectedDv.datasource);
        }

        // PopupDisplayRule.formLoad(view);
        PopupRecordRule.formLoad(view);
        PopupSubmitRule.formLoad(view);
    }

    static populateBadgeNumber(ids, view) {
        if (!view) return;

        if (view.settings.submitRules) {
            $$(ids.buttonSubmitRules).define(
                "badge",
                view.settings.submitRules.length || null
            );
            $$(ids.buttonSubmitRules).refresh();
        } else {
            $$(ids.buttonSubmitRules).define("badge", null);
            $$(ids.buttonSubmitRules).refresh();
        }

        if (view.settings.displayRules) {
            $$(ids.buttonDisplayRules).define(
                "badge",
                view.settings.displayRules.length || null
            );
            $$(ids.buttonDisplayRules).refresh();
        } else {
            $$(ids.buttonDisplayRules).define("badge", null);
            $$(ids.buttonDisplayRules).refresh();
        }

        if (view.settings.recordRules) {
            $$(ids.buttonRecordRules).define(
                "badge",
                view.settings.recordRules.length || null
            );
            $$(ids.buttonRecordRules).refresh();
        } else {
            $$(ids.buttonRecordRules).define("badge", null);
            $$(ids.buttonRecordRules).refresh();
        }
    }

    /**
     * @method component()
     * return a UI component based upon this view.
     * @param {obj} App
     * @return {obj} UI component
     */
    component(App) {
        var idBase = "ABViewForm_" + this.id;
        this.uniqueInstanceID = webix.uid();
        var myUnique = (key) => {
            return App.unique(idBase + "_" + key + "_" + this.uniqueInstanceID);
        };
        var ids = {
            component: myUnique("_component"),
            layout: myUnique("_form_layout")
        };

        var component = super.component(App);

        // an ABViewForm_ is a collection of rows:
        var _ui = {
            // view: "scrollview",
            // height: this.settings.height || ABViewFormPropertyComponentDefaults.height,
            // body: {
            id: ids.component,
            view: "form",
            rows: component.ui.rows
            // }
        };

        // make sure each of our child views get .init() called
        var _init = (options) => {
            // register our callbacks:
            if (options) {
                for (var c in _logic.callbacks) {
                    _logic.callbacks[c] = options[c] || _logic.callbacks[c];
                }
            }

            component.init(options);

            var Form = $$(ids.component);
            if (Form) {
                webix.extend(Form, webix.ProgressBar);
            }

            // bind a data collection to form component
            let dc = this.datacollection;
            if (dc) {
                // listen DC events
                this.eventAdd({
                    emitter: dc,
                    eventName: "changeCursor",
                    listener: _logic.displayData
                });

                this.eventAdd({
                    emitter: dc,
                    eventName: "ab.datacollection.update",
                    listener: (msg, data) => {
                        if (!data || !data.objectId) return;

                        let object = dc.datasource;
                        if (!object) return;

                        if (
                            object.id == data.objectId ||
                            object.fields(
                                (f) => f.settings.linkObject == data.objectId
                            ).length > 0
                        ) {
                            let currData = dc.getCursor();
                            if (currData) _logic.displayData(currData);
                        }
                    }
                });

                // bind the cursor event of the parent DC
                var linkDv = dc.datacollectionLink;
                if (linkDv) {
                    // update the value of link field when data of the parent dc is changed
                    this.eventAdd({
                        emitter: linkDv,
                        eventName: "changeCursor",
                        listener: _logic.displayParentData
                    });
                }
            }

            // _onShow();
        };

        var _logic = (this._logic = {
            callbacks: {
                onBeforeSaveData: function() {
                    return true;
                },
                onSaveData: function(saveData) {},
                clearOnLoad: function() {
                    return false;
                }
            },

            displayData: (rowData) => {
                var customFields = this.fieldComponents((comp) => {
                    return (
                        comp instanceof ABViewFormCustom ||
                        // rich text
                        (comp instanceof ABViewFormTextbox &&
                            comp.settings.type == "rich")
                    );
                });

                // Set default values
                if (rowData == null) {
                    customFields.forEach((f) => {
                        var field = f.field();
                        if (!field) return;

                        var comp = this.viewComponents[f.id];
                        if (comp == null) return;

                        // var colName = field.columnName;
                        if (this._showed && comp.onShow) comp.onShow();

                        // set value to each components
                        var defaultRowData = {};
                        field.defaultValue(defaultRowData);
                        field.setValue($$(comp.ui.id), defaultRowData);
                    });
                    var normalFields = this.fieldComponents(
                        (comp) =>
                            comp instanceof ABViewFormComponent &&
                            !(comp instanceof ABViewFormCustom)
                    );
                    normalFields.forEach((f) => {
                        var field = f.field();
                        if (!field) return;

                        var comp = this.viewComponents[f.id];
                        if (comp == null) return;

                        if (f.key != "button") {
                            var colName = field.columnName;

                            // set value to each components
                            var values = {};
                            field.defaultValue(values);

                            if ($$(comp.ui.id) && $$(comp.ui.id).setValue)
                                $$(comp.ui.id).setValue(
                                    values[colName] == null
                                        ? ""
                                        : values[colName]
                                );
                        }
                    });
                }

                // Populate value to custom fields
                else {
                    customFields.forEach((f) => {
                        var comp = this.viewComponents[f.id];
                        if (comp == null) return;

                        if (this._showed && comp.onShow) comp.onShow();

                        // set value to each components
                        if (f.field())
                            f.field().setValue($$(comp.ui.id), rowData);
                    });
                }
            },

            displayParentData: (rowData) => {
                let dv = this.datacollection;
                var currCursor = dv.getCursor();

                // If the cursor is selected, then it will not update value of the parent field
                if (currCursor != null) return;

                var Form = $$(ids.component),
                    relationField = dv.fieldLink;

                if (relationField == null) return;

                // Pull a component of relation field
                var relationFieldCom = this.fieldComponents((comp) => {
                    if (!(comp instanceof ABViewFormComponent)) return false;

                    return comp.field() && comp.field().id == relationField.id;
                })[0];

                if (relationFieldCom == null) return;

                var relationFieldView = this.viewComponents[
                    relationFieldCom.id
                ];
                if (relationFieldView == null) return;

                var relationElem = $$(relationFieldView.ui.id),
                    relationName = relationField.relationName();

                // pull data of parent's dc
                var formData = {};
                formData[relationName] = rowData;

                // set data of parent to default value
                relationField.setValue(relationElem, formData);
            }
        });

        var _onShow = (data) => {
            this._showed = true;

            // call .onShow in the base component
            component.onShow();

            var Form = $$(ids.component);

            // var customFields = this.fieldComponents((comp) => {
            // 	return (comp instanceof ABViewFormCustom) ||
            // 		// rich text
            // 		((comp instanceof ABViewFormTextbox) && comp.settings.type == 'rich')
            // });
            // customFields.forEach((f) => {

            // 	var field = f.field();
            // 	if (!field) return;

            // 	var component = this.viewComponents[f.id];
            // 	if (!component) return;

            // 	// set value to each components
            // 	var rowData = {};
            // 	field.defaultValue(rowData);
            // 	field.setValue($$(component.ui.id), rowData);

            // });

            var dc = this.datacollection;
            if (dc) {
                if (Form) dc.bind(Form);

                // clear current cursor on load
                // if (this.settings.clearOnLoad || _logic.callbacks.clearOnLoad() ) {
                if (this.settings.clearOnLoad) {
                    dc.setCursor(null);
                    _logic.displayData(null);
                }

                // pull data of current cursor
                data = dc.getCursor();

                // do this for the initial form display so we can see defaults
                _logic.displayData(data);

                // select parent data to default value
                var linkDv = dc.datacollectionLink;
                if (data == null && linkDv) {
                    var parentData = linkDv.getCursor();
                    _logic.displayParentData(parentData);
                }
            } else {
                // show blank data in the form
                _logic.displayData(data);
            }

            //Focus on first focusable component
            this.focusOnFirst();

            if (Form) Form.adjust();
        };

        return {
            ui: _ui,
            init: _init,
            logic: _logic,

            onShow: _onShow
        };
    }

    refreshDefaultButton(ids) {
        // If default button is not exists, then skip this
        let defaultButton = this.views(
            (v) => v instanceof ABViewFormButton && v.settings.isDefault
        )[0];

        // Add a default button
        if (defaultButton == null) {
            defaultButton = ABViewFormButton.newInstance(
                this.application,
                this
            );
            defaultButton.settings.isDefault = true;
        }
        // Remove default button from array, then we will add it to be the last item later (.push)
        else {
            this._views = this.views(
                (v) => !(v instanceof ABViewFormButton) && !v.settings.isDefault
            );
        }

        // Calculate position Y of the default button
        let yList = this.views().map((v) => (v.position.y || 0) + 1);
        yList.push(this._views.length || 0);
        yList.push($$(ids.fields).length || 0);
        let posY = Math.max(...yList);

        // Update to be the last item
        defaultButton.position.y = posY;

        // Keep the default button is always the last item of array
        this._views.push(defaultButton);

        return defaultButton;
    }

    /**
     * @method getFormValues
     *
     * @param {webix form} formView
     * @param {ABObject} obj
     * @param {ABDatacollection} dcLink [optional]
     */
    getFormValues(formView, obj, dcLink) {
        // get update data
        var formVals = formView.getValues();

        // get custom values
        var customFields = this.fieldComponents(
            (comp) => comp instanceof ABViewFormCustom
        );
        customFields.forEach((f) => {
            var vComponent = this.viewComponents[f.id];
            if (vComponent == null) return;

            if (f.field())
                formVals[f.field().columnName] = vComponent.logic.getValue();
        });

        // clear undefined values or empty arrays
        for (var prop in formVals) {
            if (formVals[prop] == null || formVals[prop].length == 0)
                formVals[prop] = "";
        }

        // add default values to hidden fields
        obj.fields().forEach((f) => {
            if (formVals[f.columnName] === undefined) {
                f.defaultValue(formVals);
            }
        });

        // Add parent's data collection cursor when a connect field does not show
        if (dcLink && dcLink.getCursor()) {
            var objectLink = dcLink.datasource;

            var connectFields = obj.fields((f) => f.key == "connectObject");
            connectFields.forEach((f) => {
                var formFieldCom = this.fieldComponents((fComp) => {
                    return fComp.field && fComp.field().id == f.id;
                });

                if (
                    objectLink.id == f.settings.linkObject &&
                    formFieldCom.length < 1 && // check field does not show
                    formVals[f.columnName] === undefined
                ) {
                    formVals[f.columnName] = {};
                    formVals[f.columnName][
                        objectLink.PK()
                    ] = dcLink.getCursor().id;
                }
            });
        }

        return formVals;
    }

    /**
     * @method validateData
     *
     * @param {webix form} formView
     * @param {ABObject} object
     * @param {object} formVals
     *
     * @return {boolean} isValid
     */
    validateData(formView, object, formVals) {
        var isValid = true;

        // validate required fields
        var requiredFields = this.fieldComponents(
            (fComp) => fComp.settings.required == true
        ).map((fComp) => fComp.field());
        requiredFields.forEach((f) => {
            if (f && !formVals[f.columnName] && formVals[f.columnName] != "0") {
                formView.markInvalid(
                    f.columnName,
                    "*This is a required field."
                );
                isValid = false;
            }
        });

        // validate data
        var validator;
        if (isValid) {
            validator = object.isValidData(formVals);
            isValid = validator.pass();
        }

        // if data is invalid
        if (!isValid) {
            let saveButton = formView.queryView({
                view: "button",
                type: "form"
            });

            // error message
            if (validator && validator.errors && validator.errors.length) {
                validator.errors.forEach((err) => {
                    formView.markInvalid(err.name, err.message);
                });

                if (saveButton) saveButton.disable();
            } else {
                if (saveButton) saveButton.enable();
            }
        }

        return isValid;
    }

    /**
     * @method saveData
     * save data in to database
     * @param formView - webix's form element
     *
     * @return {Promise}
     */
    saveData(formView) {
        // call .onBeforeSaveData event
        // if this function returns false, then it will not go on.
        if (!this._logic.callbacks.onBeforeSaveData()) return Promise.resolve();

        // form validate
        if (!formView || !formView.validate()) {
            // TODO : error message

            return Promise.resolve();
        }

        formView.clearValidation();

        // get ABDatacollection
        var dv = this.datacollection;
        if (dv == null) return Promise.resolve();

        // get ABObject
        var obj = dv.datasource;
        if (obj == null) return Promise.resolve();

        // get ABModel
        var model = dv.model;
        if (model == null) return Promise.resolve();

        // get update data
        var formVals = this.getFormValues(formView, obj, dv.datacollectionLink);

        // validate data
        if (!this.validateData(formView, obj, formVals)) {
            return Promise.resolve();
        }

        // show progress icon
        if (formView.showProgress) formView.showProgress({ type: "icon" });

        // form ready function
        var formReady = (newFormVals) => {
            // clear cursor after saving.
            if (dv) {
                if (this.settings.clearOnSave) {
                    dv.setCursor(null);
                    formView.clear();
                } else {
                    if (newFormVals && newFormVals.id)
                        dv.setCursor(newFormVals.id);
                }
            }

            if (formView.hideProgress) formView.hideProgress();

            // if there was saved data pass it up to the onSaveData callback
            if (newFormVals) this._logic.callbacks.onSaveData(newFormVals);
        };

        let formError = (err) => {
            let saveButton = formView.queryView({
                view: "button",
                type: "form"
            });

            if (err && err.invalidAttributes) {
                // mark error
                for (let attr in err.invalidAttributes) {
                    let invalidAttrs = err.invalidAttributes[attr];
                    if (invalidAttrs && invalidAttrs[0])
                        invalidAttrs = invalidAttrs[0];

                    formView.markInvalid(attr, invalidAttrs.message);
                }
            }

            if (saveButton) saveButton.enable();

            if (formView.hideProgress) formView.hideProgress();
        };

        return new Promise((resolve, reject) => {
            // If this object already exists, just .update()
            if (formVals.id) {
                model
                    .update(formVals.id, formVals)
                    .catch((err) => {
                        formError(err.data);
                        reject(err);
                    })
                    .then((newFormVals) => {
                        this.doRecordRules(newFormVals)
                            .then(() => {
                                // make sure any updates from RecordRules get passed along here.
                                this.doSubmitRules(newFormVals);
                                formReady(newFormVals);
                                resolve(newFormVals);
                            })
                            .catch((err) => {
                                OP.Error.log("Error processing Record Rules.", {
                                    error: err,
                                    newFormVals: newFormVals
                                });
                                // Question:  how do we respond to an error?
                                // ?? just keep going ??
                                this.doSubmitRules(newFormVals);
                                formReady(newFormVals);
                                resolve();
                            });
                    });
            }
            // else add new row
            else {
                model
                    .create(formVals)
                    .catch((err) => {
                        formError(err.data);
                        reject(err);
                    })
                    .then((newFormVals) => {
                        this.doRecordRules(newFormVals)
                            .then(() => {
                                this.doSubmitRules(newFormVals);
                                formReady(newFormVals);
                                resolve(newFormVals);
                            })
                            .catch((err) => {
                                OP.Error.log("Error processing Record Rules.", {
                                    error: err,
                                    newFormVals: newFormVals
                                });
                                // Question:  how do we respond to an error?
                                // ?? just keep going ??
                                this.doSubmitRules(newFormVals);
                                formReady(newFormVals);
                                resolve();
                            });
                    });
            }
        });
    }

    focusOnFirst() {
        var topPosition = 0;
        var topPositionId = "";
        this.views().forEach((item) => {
            if (item.key == "textbox" || item.key == "numberbox") {
                if (item.position.y == topPosition) {
                    topPosition = item.position.y;
                    topPositionId = item.id;
                }
            }
        });
        var childComponent = this.viewComponents[topPositionId];
        if (childComponent && $$(childComponent.ui.id)) {
            $$(childComponent.ui.id).focus();
        }
    }
};
