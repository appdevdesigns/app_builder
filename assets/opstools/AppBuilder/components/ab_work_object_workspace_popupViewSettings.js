
/*
 * ab_work_object_workspace_PopupAddView
 *
 * Manage the Sort Fields popup.
 *
 */

import ABFieldList from "../classes/dataFields/ABFieldList";
import ABFieldUser from "../classes/dataFields/ABFieldUser";

import ABObjectWorkspaceViewGrid from "../classes/ABObjectWorkspaceViewGrid";
import ABObjectWorkspaceViewKanban from "../classes/ABObjectWorkspaceViewKanban";

export default class AB_Work_Object_Workspace_PopupAddView extends OP.Component {
    //.extend(idBase, function(App) {

    constructor(App, idBase) {
        idBase = idBase || "ab_work_object_workspace_popupAddView";

        super(App, idBase);
        var L = this.Label;

        var _object;
        var _view;

        var labels = {
            common: App.labels,
            component: {
                name: L("ab.add_view.name", "*Name"),
                type: L("ab.add_view.type", "*Type"),
                vGroup: L("ab.add_view.vGroup", "*Vertical Grouping"),
                hGroup: L("ab.add_view.hGroup", "*Horizontal Grouping"),
                owner: L("ab.add_view.owner", "*Card Owner"),
                namePlaceholder: L(
                    "ab.add_view.name_placeholder",
                    "* Create a name for the view"
                ),
                groupingPlaceholder: L(
                    "ab.add_view.grouping_placeholder",
                    "*Select a field"
                ),
                ownerPlaceholder: L(
                    "ab.add_view.owner_placeholder",
                    "*Select user field"
				),
				noneOption: L("ab.add_view.none_option", "*None"),
            }
        };

        // internal list of Webix IDs to reference our UI components
        var ids = {
            component: this.unique("_popupAddView"),
            form: this.unique("_popupAddViewForm"),
            nameInput: this.unique("_popupAddViewName"),
            typeInput: this.unique("_popupAddViewType"),
            vGroupInput: this.unique("_popupAddViewVGroup"),
            hGroupInput: this.unique("_popupAddViewHGroup"),
            ownerInput: this.unique("_popupAddViewOwner"),
            cancelButton: this.unique("_popupAddViewCancelButton"),
            saveButton: this.unique("_popupAddViewSaveButton")
        };

        // Our webix UI definition:
        var formUI = {
            view: "form",
            id: ids.form,
            visibleBatch: "global",
            rules: {
                hGroup: (value, { vGroup }) => {
                    return !value || value !== vGroup;
                }
            },
            elements: [
                {
                    view: "text",
                    label: labels.component.name,
                    id: ids.nameInput,
                    name: "name",
                    placeholder: labels.component.namePlaceholder,
                    required: true,
                    invalidMessage: labels.common.invalidMessage.required,
                    on: {
                        onChange: function(id) {
                            $$(ids.nameInput).validate();
                        }
                    }
                },
                {
                    view: "richselect",
                    label: labels.component.type,
                    id: ids.typeInput,
                    name: "type",
                    options: [
                        { id: ABObjectWorkspaceViewGrid.type(), value: "Grid" },
                        {
                            id: ABObjectWorkspaceViewKanban.type(),
                            value: "Kanban"
                        }
                    ],
                    value: ABObjectWorkspaceViewGrid.type(),
                    required: true,
                    on: {
                        onChange: function(id) {
                            if (id === ABObjectWorkspaceViewKanban.type()) {
                                $$(ids.form).showBatch("kanban");
                                $$(ids.component).resize();
                            } else {
                                $$(ids.form).showBatch("global");
                                $$(ids.component).resize();
                            }
                        }
                    }
                },
                {
                    view: "richselect",
                    label: `<span class='webix_icon fa fa-columns'></span> ${
                        labels.component.vGroup
                    }`,
                    id: ids.vGroupInput,
                    placeholder: labels.component.groupingPlaceholder,
                    labelWidth: 180,
                    name: "vGroup",
                    required: true,
                    options: [],
                    batch: "kanban",
                    on: {
                        onChange: function(id) {
                            $$(ids.vGroupInput).validate();
                            $$(ids.hGroupInput).validate();
                        }
                    },
                    invalidMessage: labels.common.invalidMessage.required
                },
                {
                    view: "richselect",
                    label: `<span class='webix_icon fa fa-list'></span> ${
                        labels.component.hGroup
                    }`,
                    id: ids.hGroupInput,
                    placeholder: labels.component.groupingPlaceholder,
                    labelWidth: 180,
                    name: "hGroup",
                    required: false,
                    options: [],
                    batch: "kanban",
                    invalidMessage:
                        "Cannot be the same as vertical grouping field",
                    validate: value => {
                        var vGroupValue = $$(ids.vGroupInput).getValue();
                        return !vGroupValue || !value || vGroupValue !== value;
                    },
                    on: {
                        onChange: function(id) {
                            $$(ids.hGroupInput).validate();
                        }
                    }
                },
                {
                    view: "richselect",
                    label: `<span class='webix_icon fa fa-user-circle'></span> ${
                        labels.component.owner
                    }`,
                    placeholder: labels.component.ownerPlaceholder,
                    id: ids.ownerInput,
                    labelWidth: 180,
                    name: "owner",
                    options: [],
                    batch: "kanban"
                },
                {
                    margin: 5,
                    cols: [
                        { fillspace: true },
                        {
                            view: "button",
                            value: labels.common.cancel,
                            css: "ab-cancel-button",
                            autowidth: true,
                            click: function() {
                                _logic.buttonCancel();
                            }
                        },
                        {
                            view: "button",
                            value: labels.common.save,
                            autowidth: true,
                            type: "form",
                            click: function() {
                                _logic.buttonSave();
                            }
                        }
                    ]
                }
            ]
        };

        this.ui = {
            view: "window",
            id: ids.component,
            height: 400,
            width: 400,
            head: "View Settings",
            position: "center",
            body: formUI,
            modal: true,
            on: {
                onShow: function() {
                    _logic.onShow();
                }
            }
        };

        // Our init() function for setting up our UI
        this.init = options => {
            // register our callbacks:
            for (var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }

            webix.ui(this.ui);
        };

        // our internal business logic
        var _logic = (this._logic = {
            callbacks: {
                /**
                 * @function onViewAdded
                 * called when we have added a new workspace view to our Current Object.
                 *
                 * this is meant to alert our parent component to respond to the
                 * change.
                 */
                onViewAdded: function(view) {},

                /**
                 * @function onViewUpdated
                 * called when we have updated a workspace view in our Current Object.
                 *
                 * this is meant to alert our parent component to respond to the
                 * change.
                 */
                onViewUpdated: function(view) {}
            },

            objectLoad: object => {
                _object = object;
            },

            onShow: function() {
                // clear field options in the form
                $$(ids.form).clear();
                $$(ids.form).clearValidation();
				
				if (_view) {
                    $$(ids.nameInput).setValue(_view.name);
                }
                $$(ids.typeInput).setValue(
                    _view ? _view.type : ABObjectWorkspaceViewGrid.type()
                );

				// Utility function to initialize the options for a field select input
                const initSelect = (
                    id,
                    attribute,
					filter = f => f.key === ABFieldList.defaults().key,
					isRequired,
                ) => {
                    var options = _object
                        .fields()
                        .filter(filter)
						.map(({ id, label }) => ({ id, value: label }));
					if (!isRequired && options.length) {
						options.unshift({id: 0, value: labels.component.noneOption});
					}
                    $$(id).define("options", options);
                    if (_view) {
                        if (_view[attribute]) {
                            $$(id).define("value", _view[attribute]);
                        }
                    } else if (options.filter(o => o.id).length === 1) {
						// If there's just one (real) option, default to the first one
                        $$(id).define("value", options[0].id);
                    }
                    $$(id).refresh();
                };

                const groupingFieldFilter = field =>
                    [
                        ABFieldList.defaults().key,
                        ABFieldUser.defaults().key
                    ].includes(field.key);

                initSelect(
                    ids.vGroupInput,
                    "verticalGroupingField",
					groupingFieldFilter,
					true,
                );
                initSelect(
                    ids.hGroupInput,
                    "horizontalGroupingField",
					groupingFieldFilter,
					false,
                );
                initSelect(
                    ids.ownerInput,
                    "ownerField",
					f => f.key === ABFieldUser.defaults().key,
					false,
                );
            },

            /**
             * @function show()
             *
             * Show this component.
             */
            show: function(viewObj) {
                _view = viewObj;
                $$(ids.component).show();
            },

            /**
             * @function hide()
             *
             * hide this component.
             */
            hide: function() {
                $$(ids.component).hide();
            },

            buttonCancel: function() {
                this.hide();
            },

            buttonSave: function() {
                if ($$(ids.form).validate()) {
                    // save the new/updated view
                    var view = {
                        name: $$(ids.nameInput).getValue(),
                        type: $$(ids.typeInput).getValue()
					};

					// Kanban-specific fields
                    if (view.type === ABObjectWorkspaceViewKanban.type()) {
                        view.verticalGroupingField =
                            $$(ids.vGroupInput).getValue() || null;
                        view.horizontalGroupingField =
                            $$(ids.hGroupInput).getValue() || null;
                        view.ownerField = $$(ids.ownerInput).getValue() || null;
                    }
                    if (_view) {
						var viewObj = _object.workspaceViews.updateView(_view, view);
                        this.callbacks.onViewUpdated(viewObj);
                    } else {
						var viewObj = _object.workspaceViews.addView(view);
                        this.callbacks.onViewAdded(viewObj);
                    }
                    this.hide();
                }
            }
        });

        // Expose any globally accessible Actions:
        this.actions({});

        //
        // Define our external interface methods:
        //
        this.objectLoad = _logic.objectLoad;
        this.show = _logic.show;
    }
}
