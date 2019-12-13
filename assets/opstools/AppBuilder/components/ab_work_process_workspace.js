/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

import ABApplication from "../classes/ABApplication";

import AB_Work_Process_Workspace_Model from "./ab_work_process_workspace_model";
import AB_Work_Process_Workspace_Monitor from "./ab_work_process_workspace_monitor";
import AB_Work_Process_Workspace_Test from "./ab_work_process_workspace_test";

export default class ABWorkProcessWorkspace extends OP.Component {
    /**
     * @param {object} App
     * @param {string} idBase
     */
    constructor(App, idBase) {
        idBase = idBase || "ab_work_process_workspace";

        super(App, idBase);
        var L = this.Label;

        var labels = {
            common: App.labels,
            component: {
                addNew: L("ab.process.addNew", "*Add new process"),
                selectProcess: L(
                    "ab.process.selectProcess",
                    "*Select a process to work with."
                ),

                tabModel: L("ab.process.tabModel", "*Model"),
                tabTest: L("ab.process.tabTest", "*Test"),
                tabMonitor: L("ab.process.tabMonitor", "*Monitor")
            }
        };

        // default settings

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique("_component"),

            multiview: this.unique("_multipass"),

            tabbar: this.unique("_tabbar"),
            tabModel: this.unique("_tabModel"),
            tabTest: this.unique("_tabTest"),
            tabMonitor: this.unique("_tabMonitor"),

            noSelection: this.unique("_noSelection"),
            selectedItem: this.unique("_selectedItem")
        };

        var ModelUI = new AB_Work_Process_Workspace_Model(App);
        var MonitorUI = new AB_Work_Process_Workspace_Monitor(App);
        var TestUI = new AB_Work_Process_Workspace_Test(App);

        // Our webix UI definition:
        this.ui = {
            view: "multiview",
            id: ids.component,
            rows: [
                {
                    id: ids.noSelection,
                    rows: [
                        {
                            maxHeight: App.config.xxxLargeSpacer,
                            hidden: App.config.hideMobile
                        },
                        {
                            view: "label",
                            align: "center",
                            height: 200,
                            label:
                                "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-code-fork'></div>"
                        },
                        {
                            view: "label",
                            align: "center",
                            label: labels.component.selectProcess
                        },
                        {
                            cols: [
                                {},
                                {
                                    view: "button",
                                    label: labels.component.addNew,
                                    type: "form",
                                    autowidth: true,
                                    click: function() {
                                        _logic.addNewProcess();
                                    }
                                },
                                {}
                            ]
                        },
                        {
                            maxHeight: App.config.xxxLargeSpacer,
                            hidden: App.config.hideMobile
                        }
                    ]
                },
                {
                    id: ids.selectedItem,
                    type: "wide",
                    paddingY: 0,
                    // css: "ab-data-toolbar",
                    // borderless: true,
                    rows: [
                        {
                            view: "tabbar",
                            id: ids.tabbar,
                            css: "webix_dark",
        					type: "bottom",
        					borderless: false,
        					bottomOffset: 0,
                            // css: "ab-data-toolbar",
                            options: [
                                {
                                    value: labels.component.tabModel,
                                    icon: "fa fa-code-fork",
                                    type: "icon",
                                    id: ids.tabModel,
                                    on: {
                                        click: function() {
                                            _logic.changeTab("model");
                                        }
                                    }
                                },
                                {
                                    value: labels.component.tabTest,
                                    icon: "fa fa-check-square",
                                    type: "icon",
                                    id: ids.tabTest,
                                    on: {
                                        click: function() {
                                            _logic.changeTab("test");
                                        }
                                    }
                                },
                                {
                                    value: labels.component.tabMonitor,
                                    icon: "fa fa-tachometer",
                                    type: "icon",
                                    id: ids.tabMonitor,
                                    on: {
                                        click: function() {
                                            _logic.changeTab("monitor");
                                        }
                                    }
                                }
                            ],
                            on: {
                                onChange: function(newv, oldv) {
                                    if (newv != oldv) {
                                        _logic.changeTab(newv);
                                    }
                                }
                            }
                        },
                        {
                            view: "multiview",
                            id: ids.multiview,
                            cells: [ModelUI.ui, TestUI.ui, MonitorUI.ui]
                        }
                    ]
                }
            ]
        };

        // Our init() function for setting up our UI
        this.init = function() {
            $$(ids.noSelection).show();

            ModelUI.init();
            TestUI.init();
            MonitorUI.init();
        };

        var CurrentApplication = null;
        var CurrentProcess = null;

        // our internal business logic
        var _logic = {
            addNewProcess: () => {
                this.emit("addNew");
            },

            ////

            /**
             * @function applicationLoad
             *
             * Initialize the Object Workspace with the given ABApplication.
             *
             * @param {ABApplication} application
             */
            applicationLoad: (application) => {
                CurrentApplication = application;

                PopupNewDataFieldComponent.applicationLoad(application);

                CurrentDataview.application = CurrentApplication;

                ModelUI.applicationLoad(application);
                TestUI.applicationLoad(application);
                MonitorUI.applicationLoad(application);
            },

            /**
             * @function changeTab
             *
             * receive the command for which tab to display.
             * @param {string} mode  the name/key of which tab to display.
             */
            changeTab: function(tab) {
                // $$(ids.toolbar).show(false, false);

                switch (tab) {
                    case ids.tabModel:
                        $$(ids.multiview).setValue(ModelUI.ui.id);
                        break;

                    case ids.tabTest:
                        $$(ids.multiview).setValue(TestUI.ui.id);
                        break;

                    case ids.tabMonitor:
                        $$(ids.multiview).setValue(MonitorUI.ui.id);
                        break;
                }
            },

            /**
             * @function clearWorkspace()
             *
             * Clear the object workspace.
             */
            clearWorkspace: function() {
                // NOTE: to clear a visual glitch when multiple views are updating
                // at one time ... stop the animation on this one:
                $$(ids.noSelection).show(false, false);

                ModelUI.clearWorkspace();
                TestUI.clearWorkspace();
                MonitorUI.clearWorkspace();
            },

            /**
             * @function populateWorkspace()
             *
             * Initialize the Object Workspace with the provided ABObject.
             *
             * @param {ABObject} object     current ABObject instance we are working with.
             */
            populateWorkspace: function(process) {
                $$(ids.selectedItem).show();

                CurrentProcess = process;

                ModelUI.populateWorkspace(process);
                TestUI.populateWorkspace(process);
                MonitorUI.populateWorkspace(process);
            },

            /**
             * @function show()
             *
             * Show this component.
             */
            show: function() {
                $$(ids.component).show();
            },

            loadData: function() {}
        };
        this._logic = _logic;

        //
        // Define our external interface methods:
        //
        this.applicationLoad = this._logic.applicationLoad;
        this.populateWorkspace = this._logic.populateWorkspace;
        this.clearWorkspace = this._logic.clearWorkspace;
    }
}
