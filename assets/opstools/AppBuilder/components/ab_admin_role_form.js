const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_Form extends ABComponent {
    constructor(App) {
        let idBase = "ab_admin_role_form";

        super(App, idBase);

        let L = this.Label;

        // internal list of Webix IDs to reference our UI components.
        let ids = {
            form: this.unique("form"),
            text: this.unique("text"),
            save: this.unique("save")
        };

        // Our webix UI definition:
        this.ui = {
            id: ids.form,
            view: "form",
            // padding: 24,
            elementsConfig: { labelAlign: "right", labelWidth: 100 },
            rows: [
                {
                    id: ids.text,
                    view: "text",
                    name: "name",
                    label: "Name",
                    placeholder: "Enter Name"
                },
                {
                    view: "text",
                    name: "description",
                    label: "Description",
                    placeholder: "Enter Description"
                },
                {
                    cols: [
                        { fillspace: true },
                        {
                            view: "button",
                            autowidth: true,
                            value: L("ab.common.cancel", "*Cancel"),
                            click: () => {
                                _logic.cancel();
                            }
                        },
                        {
                            id: ids.save,
                            view: "button",
                            css: "webix_primary",
                            type: "form",
                            autowidth: true,
                            value: L("ab.common.save", "*Save"),
                            click: () => {
                                _logic.save();
                            }
                        }
                    ]
                },
                {
                    fillspace: true
                }
            ]
        };

        // Our init() function for setting up our UI
        this.init = (roleDC) => {
            this._roleDC = roleDC;

            if ($$(ids.form)) {
                webix.extend($$(ids.form), webix.ProgressBar);

                if (this._roleDC) {
                    this._roleDC.attachEvent(
                        "onAfterCursorChange",
                        (currId) => {
                            let currRole = this._roleDC.getItem(currId);
                            if (currRole) {
                                $$(ids.form).setValues({
                                    name: currRole.name,
                                    description: currRole.description
                                });
                            } else {
                                $$(ids.form).setValues({});
                            }
                        }
                    );
                }
            }
        };

        // our internal business logic
        let _logic = {
            focusName: () => {
                let $text = $$(ids.text);
                if ($text) {
                    $text.focus();

                    let $dom = $text.getInputNode();
                    if ($dom)
                        $dom.setSelectionRange(
                            0,
                            ($text.getValue() || "").length
                        );
                }
            },

            cancel: () => {
                if (this._roleDC) this._roleDC.setCursor(null);
            },

            save: () => {
                _logic.busy();

                let vals = $$(ids.form).getValues() || {};

                App.actions
                    .roleSave(vals)
                    .catch((err) => {
                        console.error(err);
                        _logic.ready();
                    })
                    .then(() => {
                        _logic.ready();
                    });
            },

            busy: () => {
                if ($$(ids.form) && $$(ids.form).showProgress)
                    $$(ids.form).showProgress({ type: "icon" });

                if ($$(ids.save) && $$(ids.save).disable)
                    $$(ids.save).disable();
            },

            ready: () => {
                if ($$(ids.form) && $$(ids.form).hideProgress)
                    $$(ids.form).hideProgress();

                if ($$(ids.save) && $$(ids.save).enable) $$(ids.save).enable();
            }
        };

        this._logic = _logic;

        //
        // Define our external interface methods:
        //
        this.focusName = _logic.focusName;
    }
};
