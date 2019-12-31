/*
 * ab_work_object_workspace_monitor
 *
 * Manage the Object Workspace area.
 *
 */

export default class ABWorkProcessWorkspaceMonitor extends OP.Component {
    /**
     * @param {object} App
     * @param {string} idBase
     */
    constructor(App, idBase) {
        idBase = idBase || "ab_work_process_workspace_monitor";

        super(App, idBase);
        var L = this.Label;

        var labels = {
            common: App.labels,
            component: {
                label: L("ab.process.monitor.label", "*Monitor"),
                tasks:  L("ab.process.monitor.tasks", "*Tasks"),
                logs:  L("ab.process.monitor.logs", "*Logs"),
                actions: L("ab.process.monitor.actions", "*Actions"),
                details: L("ab.process.monitor.details", "*Instance Details"),
            }
        };

        // default settings

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique("_component"),
            taskList: this.unique("_taskList"),
            processLogs: this.unique("_processLogs")
        };

        // Our webix UI definition:
        this.ui = {
            view: "multiview",
            id: ids.component,
            rows: [
                {
                    id: "monitor",
                    cols: [
                        {
                            rows: [
                                {
                					view: 'toolbar',
                					css: 'ab-data-toolbar webix_dark',
                					cols: [
                                        {
                                            type: 'spacer',
                                            width: 15
                                        },
                						{
                							view: 'label',
                							label: labels.component.tasks
                						}
                					]
                				},
                                {
                                    view: "list",
                                    id: ids.taskList,
                                    item: {
                                        height: 74,
                                        template: function(obj) {
                                            var icon = "fa-clock-o";
                                            var color = "gray";
                                            if (obj.status == "error") {
                                                icon = "fa-times-circle";
                                                color = "red";
                                            }
                                            return "<div style=\"float: left; height: 70px; line-height: 70px; margin-right: 10px; color: "+color+";\" class=\"fa "+icon+" fa-2x\"></div><div style=\"padding: 5px 0; line-height: 20px\"><div style=\"font-size: 16px; font-weight: 600;\">"+obj.name+"</div><div>"+obj.message+"</div></div>"
                                        }
                                    },
                                    on: {
                                        onItemClick: function(id, e, node){
                                            $$(ids.taskList).clearCss("webix_selected");
                                            $$(ids.taskList).addCss(id, "webix_selected");
                                            var logs = $$(ids.taskList).getItem(id).logs;
                                            $$(ids.processLogs).clearAll();
                                            $$(ids.processLogs).parse(logs);
                                        }
                                    },
                                    navigation: true
                                }
                            ]
        				},
                        { view: "resizer", css: "bg_gray", width: 11},
                        {
                            gravity: 2,
                            rows: [
                                {
                                    cols: [
                                        {
                                            gravity: 2,
                                            rows: [
                                                {
                                                    view: 'toolbar',
                                                    css: 'ab-data-toolbar webix_dark',
                                                    cols: [
                                                        {
                                                            type: 'spacer',
                                                            width: 15
                                                        },
                                                        {
                                                            view: 'label',
                                                            label: labels.component.details
                                                        }
                                                    ]
                                                },
                                                {}
                                            ]
                                        },
                                        {
                                            view: "resizer",
                                            css: "bg_gray",
                                            width: 11
                                        },
                                        {
                                            rows: [
                                                {
                                                    view: 'toolbar',
                                                    css: 'ab-data-toolbar webix_dark',
                                                    cols: [
                                                        {
                                                            type: 'spacer',
                                                            width: 15
                                                        },
                                                        {
                                                            view: 'label',
                                                            label: labels.component.actions
                                                        }
                                                    ]
                                                },
                                                {}
                                            ]
                                        }
                                    ]
                                },
                                {
                                    view: "resizer",
                                    css: "bg_gray",
                                    height: 11
                                },
                                {
                                    view: 'toolbar',
                                    css: 'ab-data-toolbar webix_dark',
                                    cols: [
                                        {
                                            type: 'spacer',
                                            width: 15
                                        },
                                        {
                                            view: 'label',
                                            label: labels.component.logs
                                        }
                                    ]
                                },
                                {
                                    id: ids.processLogs,
                        			view: "list",
                                    template: "<div style=\"padding: 5px 0; line-height: 20px\">#value#</div>"
                        		}
                            ]
                        }
                    ]
                }
            ]
        };

        // Our init() function for setting up our UI
        this.init = function() {
            // $$(ids.noSelection).show();
        };

        var CurrentApplication = null;
        var CurrentProcess = null;

        // our internal business logic
        var _logic = {
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
            },

            loadProcessInstances: function() {
                if (CurrentProcess) {
                    return OP.Comm.Socket.get({
                        url: `/app_builder/abprocessinstance`,
                        params: {
                            processID: CurrentProcess.id,
                            status: { "!": "completed" }
                        }
                    }).then((allInstances) => {
                        var list = [];
                        allInstances.forEach((inst)=>{
                            var mesg = inst.log[inst.log.length-1];
                            mesg = mesg.split(" : ");
                            list.push({
                                task: mesg[0] ? mesg[0] : "No Task ID",
                                name: mesg[1] ? mesg[1] : "No Task Name",
                                message: mesg[2] ? mesg[2] : "No Message",
                                logs: inst.log,
                                status: inst.status
                            })
                        });
                        return list;
                    });
                } else {
                    return Promise.resolve([]);
                }
            },

            /**
             * @function populateWorkspace()
             *
             * Initialize the Object Workspace with the provided ABObject.
             *
             * @param {ABObject} object     current ABObject instance we are working with.
             */
            populateWorkspace: function(process) {
                // $$(ids.selectedItem).show();

                CurrentProcess = process;

                $$(ids.taskList).clearAll();
                $$(ids.taskList).parse(this._logic.loadProcessInstances());
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
