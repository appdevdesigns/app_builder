/*
 * ab_work_object_workspace_popupFrozenColumns
 *
 * Manage the Frozen Columns popup.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Object_Workspace_PopupFrozenColumns extends ABComponent {
    //.extend(idBase, function(App) {

    constructor(App, idBase) {
        idBase = idBase || "ab_work_object_workspace_popupFrozenColumns";
        super(App, idBase);
        var L = this.Label;

        var labels = {
            common: App.labels,
            component: {
                clearAll: L("ab.frozen_fields.clearAll", "*Clear All"),
                errorHidden: L(
                    "ab.visible_fields.errorHidden",
                    "*Sorry, you cannot freeze a hidden column."
                )
                // hideAll: L('ab.visible_fields.hideAll', "*Hide All"),
            }
        };

        // internal list of Webix IDs to reference our UI components
        var ids = {
            component: this.unique(idBase + "_popupFrozen"),
            list: this.unique(idBase + "_popupFrozen_list")
        };

        // Our webix UI definition:
        this.ui = {
            view: "popup",
            id: ids.component,
            // modal: true,
            // autoheight:true,
            width: 500,
            body: {
                rows: [
                    {
                        view: "list",
                        id: ids.list,
                        width: 250,
                        // autoheight: true,
                        maxHeight: 350,
                        select: false,
                        template:
                            '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle-o ab-frozen-field-icon"></i>&nbsp;</span> #label#',
                        on: {
                            onItemClick: function(id, e, node) {
                                _logic.clickListItem(id, e, node);
                            }
                        }
                    },
                    {
                        view: "button",
                        css: "webix_primary",
                        value: labels.component.clearAll,
                        type: "form",
                        on: {
                            onItemClick: function(id, e, node) {
                                return _logic.clickClearAll();
                            }
                        }
                    }
                ]
            },
            on: {
                onShow: function() {
                    _logic.onShow();
                    _logic.iconsReset();
                }
            }
        };

        // Our init() function for setting up our UI
        this.init = (options) => {
            // register our callbacks:
            for (var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }

            webix.ui(this.ui);
        };

        var CurrentObject = null;
        var CurrentView = null;

        // our internal business logic
        var _logic = (this._logic = {
            callbacks: {
                /**
                 * @function onChange
                 * called when we have made changes to the hidden field settings
                 * of our Current Object.
                 *
                 * this is meant to alert our parent component to respond to the
                 * change.
                 */
                onChange: function() {}
            },

            /**
             * @function clickClearAll
             * the user clicked the [clear all] option.  So show unfreeze all our columns.
             */
            clickClearAll: () => {
                _logic.setValue("");
                _logic.iconsReset();
                _logic.callbacks.onChange(this._setting);
            },

            /**
             * @function clickListItem
             * update the list to show which columns are frozen by showing an icon next to the column name
             */
            clickListItem: (id, e, node) => {
                // update our Object with current frozen column id
                var List = $$(ids.list);
                var recordClicked = List.getItem(id);
                var label = recordClicked.columnName;

                if ((this._hiddenFields || []).indexOf(label) != -1) {
                    OP.Dialog.Alert({
                        text: labels.component.errorHidden
                    });
                    return;
                }

                _logic.setValue(label);
                _logic.iconsReset();
                _logic.callbacks.onChange(this._setting);
            },

            /**
             * @function iconDefault
             * Hide the icon for the given node
             * @param {DOM} node  the html dom node of the element that contains our icon
             */
            iconDefault: function(node) {
                if (node) {
                    node.querySelector(
                        ".ab-frozen-field-icon"
                    ).classList.remove("fa-circle");
                    node.querySelector(".ab-frozen-field-icon").classList.add(
                        "fa-circle-o"
                    );
                }
            },

            /**
             * @function iconFreeze
             * Show the icon for the given node
             * @param {DOM} node  the html dom node of the element that contains our icon
             */
            iconFreeze: function(node) {
                if (node) {
                    node.querySelector(
                        ".ab-frozen-field-icon"
                    ).classList.remove("fa-circle-o");
                    node.querySelector(".ab-frozen-field-icon").classList.add(
                        "fa-circle"
                    );
                }
            },

            /**
             * @function iconsReset
             * Reset the icon displays according to the current values in our Object
             */
            iconsReset: () => {
                var List = $$(ids.list);
                var isFrozen = false;

                // for each item in the List
                var id = List.getFirstId();
                while (id) {
                    var record = List.getItem(id);
                    var label = record.columnName;

                    // find it's HTML Node
                    var node = List.getItemNode(id);

                    if (this._setting == "") {
                        // if there isn't any frozen columns just use the plain icon
                        _logic.iconDefault(node);
                    } else if (isFrozen == false) {
                        // if this item is not the frozen id it is frozen until we reach the frozen id
                        _logic.iconFreeze(node);
                    } else {
                        // else just show default icon
                        _logic.iconDefault(node);
                    }

                    if (this._setting == label) {
                        isFrozen = true;
                    }

                    if ((this._hiddenFields || []).indexOf(label) != -1) {
                        node.style.opacity = 0.4;
                        node.querySelector(
                            ".ab-frozen-field-icon"
                        ).classList.remove("fa-circle");
                        node.querySelector(
                            ".ab-frozen-field-icon"
                        ).classList.remove("fa-circle-o");
                        node.querySelector(
                            ".ab-frozen-field-icon"
                        ).classList.add("fa-eye-slash");
                    } else {
                        node.style.opacity = 1;
                        node.querySelector(
                            ".ab-frozen-field-icon"
                        ).classList.remove("fa-eye-slash");
                    }

                    // next item
                    id = List.getNextId(id);
                }
            },

            /**
             * @function objectLoad
             * Ready the Popup according to the current object
             * @param {ABObject} object  the currently selected object.
             */
            objectLoad: function(object) {
                CurrentObject = object;
            },

            onShow: function() {
                // refresh list
                var allFields = CurrentObject.fields();
                var listFields = [];
                allFields.forEach((f) => {
                    listFields.push({
                        id: f.id,
                        label: f.label,
                        columnName: f.columnName,
                        $css: "hidden_fields_" + f.id
                    });
                });
                $$(ids.list).clearAll();
                $$(ids.list).parse(listFields);
            },

            /**
             * @function show()
             *
             * Show this component.
             * @param {obj} $view  the webix.$view to hover the popup around.
             */
            show: function($view, options) {
                if (options != null) {
                    $$(ids.component).show($view, options);
                } else {
                    $$(ids.component).show($view);
                }
            },

            setValue: (setting) => {
                this._setting = setting;
            },

            getValue: () => {
                return this._setting;
            },

            setHiddenFields: (hidden_fields) => {
                this._hiddenFields = hidden_fields || [];
            }
        });

        // Expose any globally accessible Actions:
        this.actions({});

        //
        // Define our external interface methods:
        //
        this.objectLoad = _logic.objectLoad;
        this.show = _logic.show;

        this.setValue = _logic.setValue;
        this.getValue = _logic.getValue;

        this.setHiddenFields = _logic.setHiddenFields;
    }
};
