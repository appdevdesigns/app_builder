const ABViewFormSelectMultipleCore = require("../../core/views/ABViewFormSelectMultipleCore");

const ABViewFormSelectMultiplePropertyComponentDefaults = ABViewFormSelectMultipleCore.defaultValues();

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormSelectMultiple extends ABViewFormSelectMultipleCore {
    constructor(values, application, parent, defaultValues) {
        super(values, application, parent, defaultValues);
    }

    //
    //	Editor Related
    //

    /**
     * @method editorComponent
     * return the Editor for this UI component.
     * the editor should display either a "block" view or "preview" of
     * the current layout of the view.
     * @param {string} mode what mode are we in ['block', 'preview']
     * @return {Component}
     */
    editorComponent(App, mode) {
        var idBase = "ABViewFormSelectMultipleEditorComponent";
        var ids = {
            component: App.unique(idBase + "_component"),
            options: App.unique(idBase + "_option")
        };

        var selectlist = this.component(App).ui;
        selectlist.id = ids.component;

        var _ui = {
            rows: [selectlist, {}]
        };

        var _init = (options) => {};

        var _logic = {};

        return {
            ui: _ui,
            init: _init,
            logic: _logic
        };
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

        // in addition to the common .label  values, we
        // ask for:
        return commonUI.concat([
            {
                name: "type",
                view: "richselect",
                label: L("ab.component.select.type", "*Type"),
                options: [
                    {
                        id: "multicombo",
                        value: L(
                            "ab.component.selectmultiple.multicombo",
                            "*Multi Combo"
                        )
                    },

                    {
                        id: "checkbox",
                        value: L(
                            "ab.component.selectmultiple.checkboxes",
                            "*Checkboxes"
                        )
                    }
                ]
            }
        ]);
    }

    static propertyEditorPopulate(App, ids, view) {
        super.propertyEditorPopulate(App, ids, view);

        $$(ids.type).setValue(
            view.settings.type ||
                ABViewFormSelectMultiplePropertyComponentDefaults.type
        );
    }

    static propertyEditorValues(ids, view) {
        super.propertyEditorValues(ids, view);

        view.settings.type = $$(ids.type).getValue();
    }

    /*
     * @component()
     * return a UI component based upon this view.
     * @param {obj} App
     * @return {obj} UI component
     */
    component(App) {
        var component = super.component(App);
        var field = this.field();

        var idBase = this.parentFormUniqueID(
            "ABViewFormSelectMultiple_" + this.id + "_f_"
        );
        var ids = {
            component: App.unique(idBase + "_component")
        };

        component.ui.view =
            this.settings.type ||
            ABViewFormSelectMultiplePropertyComponentDefaults.type;

        var options = [];

        if (field && field.key == "user") options = field.getUsers();
        else if (field)
            options = field.settings.options || this.settings.options || [];

        component.ui.id = ids.component;
        component.ui.options = options.map((opt) => {
            return {
                id: opt.id,
                value: opt.text,
                hex: opt.hex
            };
        });

        if (component.ui.view == "multicombo") {
            component.ui.tagMode = false;
            component.ui.css = "hideWebixMulticomboTag";
            component.ui.tagTemplate = function(values) {
                var items = "";
                values.forEach((val) => {
                    var item = $$(ids.component)
                        .getList()
                        .getItem(val);
                    items +=
                        '<li class="webix_multicombo_value" style="line-height:24px; color: white; background: ' +
                        item.hex +
                        ';" optvalue="' +
                        item.id +
                        '"><span>' +
                        item.value +
                        '</span><span class="webix_multicombo_delete" role="button" aria-label="Remove item">x</span></li>';
                });
                return items;
            };
        }

        // radio element could not be empty options
        if (component.ui.view == "checkbox") {
            component.ui.options.push({
                id: "temp",
                value: "Option"
            });
        }

        // make sure each of our child views get .init() called
        component.init = (options) => {};

        return component;
    }
};
