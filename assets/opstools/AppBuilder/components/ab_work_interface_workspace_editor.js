/*
 * ab_work_interface_workspace_editor
 *
 * Display the form for creating a new Application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABComponentMenu = require("./ab_work_interface_workspace_editor_components");
const ABEditorLayout = require("./ab_work_interface_workspace_editor_layout");

module.exports = class AB_Work_Interface_Workspace_Editor extends ABComponent {
    constructor(App) {
        super(App, "ab_work_interface_workspace_editor");
        var L = this.Label;

        var labels = {
            common: App.labels,
            component: {
                editorTipText: L(
                    "ab.interface.editorTipText",
                    '*Check "Preview" to see what your layout will look like, Click "Add Widget" to add new items to the page.'
                ),
                editorTipTitle: L("ab.interface.editorTipTitle", "*Tip"),
                viewModeLayout: L("ab.interface.viewModeLayout", "*Layout"),
                viewModeData: L("ab.interface.viewModeData", "*Data"),
                viewModePreview: L("ab.interface.viewModePreview", "*Preview"),
                editorPlaceholder: L(
                    "ab.interface.editorPlaceholder",
                    "*Drag and drop components to build interface."
                ),

                newDataSource: L(
                    "ab.interface.newDataSource",
                    "*New Data Source"
                )

                // formHeader: L('ab.application.form.header', "*Application Info"),
            }
        };

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique("component"),

            toolbar: this.unique("toolbar"),
            toolbarMap: this.unique("toolbarMap"),
            toolbarViewMode: this.unique("toolbarViewMode"),
            toolbarViewPage: this.unique("toolbarViewPage"),

            layoutView: this.unique("layoutView"),
            dataView: this.unique("dataView"),

            noContent: this.unique("noContent")
        };

        var ComponentMenu = new ABComponentMenu(App);
        var EditorLayout = new ABEditorLayout(App);

        // webix UI definition:
        this.ui = {
            view: "layout",
            id: ids.component,
            borderless: false,
            rows: [
                {
                    view: "toolbar",
                    id: ids.toolbar,
                    css: "ab-data-toolbar webix_dark",
                    cols: [
                        // {
                        //     view: 'label',
                        //     id: ids.toolbarMap,
                        //     label: '[view map]'
                        // },
                        {
                            view: "button",
                            type: "icon",
                            icon: "fa fa-arrow-left",
                            autowidth: true,
                            click: function() {
                                _logic.buttonBack();
                            }
                        },
                        {
                            view: "list",
                            layout: "x",
                            id: ids.toolbarMap,
                            borderless: true,
                            multiselect: false,
                            select: false,
                            scroll: false,
                            padding: 0,
                            css: "ab_breadcrumb",
                            template: function(item) {
                                return (
                                    '<span class="fa fa-chevron-right" aria-hidden="true"></span> ' +
                                    // '<i class="fa fa-#icon#" aria-hidden="true"></i> '.replace('#icon#', item.icon) +
                                    item.label
                                );
                            },
                            on: {
                                onItemClick: function(id, e, node) {
                                    _logic.pageMap(id);
                                }
                            }
                        },
                        {
                            view: "icon",
                            icon: "fa fa-info-circle",
                            tooltip: labels.component.editorTipText,
                            on: {
                                onItemClick: function() {
                                    _logic.infoAlert();
                                }
                            }
                        }
                        // {
                        //     view: 'button',
                        //     id: ids.toolbarButtonSave,
                        //     label: labels.common.save,
                        //     width: 100,
                        //     click: function () {
                        //         _logic.buttonSave();
                        //     }
                        // },
                        // {
                        //     view: 'button',
                        //     id: ids.toolbarButtonCancel,
                        //     label: labels.common.cancel,
                        //     width: 100,
                        //     click: function () {
                        //         _logic.buttonCancel();
                        //     }
                        // }
                    ]
                },
                // {
                //     maxHeight: App.config.xSmallSpacer,
                //     hidden: App.config.hideMobile
                // },
                {
                    view: "layout",
                    type: "space",
                    css: "gray",
                    cols: [
                        {
                            view: "checkbox",
                            id: ids.toolbarViewMode,
                            labelRight: labels.component.viewModePreview,
                            labelWidth: 0,
                            width: 85,
                            on: {
                                onChange: function(newValue, oldValue) {
                                    _logic.viewModeChange(newValue, oldValue);
                                }
                            }
                        },
                        {},
                        ComponentMenu.ui
                    ]
                },
                EditorLayout.ui
            ]
        };

        var CurrentView = null;
        var CurrentViewPart = "layout";
        var CurrentViewMode = 0; // preview mode by default
        var PreviousViews = [];

        // setting up UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);

            //// TODO: save the last CurrentViewMode in the workspace data and use that here:
            $$(ids.toolbarViewMode).setValue(CurrentViewMode);

            EditorLayout.init();

            ComponentMenu.init({
                onAddingWidget: () => {
                    // show loading cursor
                    EditorLayout.busy();
                },
                onAddWidget: () => {
                    // refresh editor page when a widget is added
                    _logic.viewLoad(CurrentView);

                    // hide loading cursor
                    EditorLayout.ready();
                }
            });
        };

        // internal business logic
        var _logic = (this.logic = {
            buttonBack: function() {
                if (PreviousViews.length > 0) {
                    var view = PreviousViews.pop();

                    // reset current view so it doesn't get added.
                    CurrentView = null;

                    // reset view part to 'layout'
                    CurrentViewPart = "layout";

                    App.actions.populateInterfaceWorkspace(view);
                }
                // Switch from 'data' to 'layout' mode
                else if (CurrentViewPart == "data") {
                    // reset view part to 'layout'
                    CurrentViewPart = "layout";

                    App.actions.populateInterfaceWorkspace(CurrentView);
                }
            },

            pageMap: function(pageId) {
                var clickedView = $$(ids.toolbarMap).getItem(pageId);

                // reset view part to 'layout'
                CurrentViewPart = "layout";

                App.actions.populateInterfaceWorkspace(clickedView);
            },

            // buttonCancel:function() {

            // },

            // buttonSave: function() {

            // },

            infoAlert: function() {
                OP.Dialog.Alert({
                    title: labels.component.editorTipTitle,
                    text: labels.component.editorTipText
                });
            },

            /**
             * @function show()
             *
             * Show this component.
             */
            show: function() {
                $$(ids.component).show();
            },

            /*
             * @method viewLoad
             * A new View has been selected for editing, so update
             * our interface with the details for this View.
             * @param {ABView} view  current view instance.
             */
            viewLoad: function(view) {
                // store the current view to return here on [back] button.
                if (CurrentView) {
                    // don't keep storing the same view over and over:
                    if (view && view.id != CurrentView.id) {
                        PreviousViews.push(CurrentView);

                        // TODO: make this a setting?
                        // limit the number of views we store in our list.
                        // ## lets not be memory hogs.
                        if (PreviousViews.length > 50) {
                            PreviousViews.shift();
                        }
                    }
                }

                CurrentView = view;

                // try to make sure we don't continually add up listeners.
                CurrentView.removeListener(
                    "properties.updated",
                    _logic.viewUpdate
                ).once("properties.updated", _logic.viewUpdate);

                // update the toolbar navigation map
                // var mapLabel = view.mapLabel();
                // $$(ids.toolbarMap).define('label', mapLabel);
                $$(ids.toolbarMap).clearAll();
                $$(ids.toolbarMap).parse(view.allParents());
                $$(ids.toolbarMap).refresh();

                EditorLayout.viewLoad(view);
                EditorLayout.show();

                ComponentMenu.viewLoad(view);
                ComponentMenu.show();
            },

            viewModeChange: function(newV, oldV) {
                if (newV == oldV) return;

                if (newV == 1) {
                    newV = "preview";
                } else {
                    newV = "block";
                }
                CurrentViewMode = newV;

                // pass view mode to the 'layout' view
                EditorLayout.viewModeChange(CurrentViewMode);

                if (CurrentView) {
                    this.viewLoad(CurrentView);
                }
            },

            viewUpdate: function() {
                _logic.viewLoad(CurrentView);
            }
        });

        // Interface methods for parent component:
        this.show = _logic.show;
        this.viewLoad = _logic.viewLoad;
    }
};
