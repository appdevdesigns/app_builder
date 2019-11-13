/*
 * ab_work_object_workspace_model
 *
 * Manage the Object Workspace area.
 *
 */
import BpmnViewer from "bpmn-js";
import BpmnModeler from "bpmn-js/lib/Modeler";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

export default class ABWorkProcessWorkspaceModel extends OP.Component {
    /**
     * @param {object} App
     * @param {string} idBase
     */
    constructor(App, idBase) {
        idBase = idBase || "ab_work_process_workspace_model";

        super(App, idBase);
        var L = this.Label;

        var labels = {
            common: App.labels,

            component: {
                label: L("ab.process.model.label", "*Model"),
                cancel: L("ab.common.cancel", "*Cancel"),
                confirmSave: L("ab.process.model.confirmSave", "*Save?"),
                confirmSaveMessage: L(
                    "ab.process.model.confirmSaveMessage",
                    "*Save your changes to {0}?"
                ),
                errorDisplay: L(
                    "ab.process.model.errorDisplay",
                    "*Error Displaying Process"
                ),
                errorDisplayMessage: L(
                    "ab.process.model.errorDisplayMessage",
                    "*Could not display the process definition for {0}. Do you want to start a blank process?"
                ),
                save: L("ab.common.save", "*Save")
            }
        };

        //// default settings

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            button: this.unique("_button"),
            component: this.unique("_component"),
            modeler: this.unique("_modeler"),
            modelerBroken: this.unique("_modelerBroken"),
            modelerWorking: this.unique("_modelerWorking")
        };

        // Our webix UI definition:
        this.ui = {
            id: ids.component,
            rows: [
                {
                    cols: [
                        {
                            height: 32
                        },
                        {
                            id: ids.button,
                            view: "button",
                            type: "icon",
                            label: labels.component.save,
                            icon: "fa fa-save",
                            autowidth: true,
                            click: () => {
                                _logic.saveProcess(CurrentProcess);
                            }
                        },
                        {
                            height: 32
                        }
                    ]
                },
                {
                    id: ids.modelerWorking,
                    view: "template",
                    // height: 800,
                    template: `<div id="${ids.modeler}" style="width: 100%; height: 100%;"></div>`
                },
                {
                    id: ids.modelerBroken,
                    view: "template",
                    // height: 800,
                    template: `<div  style="width: 100%; height: 100%;"> Big Broken Icon Here </div>`
                }
                // {
                //     maxHeight: App.config.xxxLargeSpacer,
                //     hidden: App.config.hideMobile
                // }
            ]
        };

        var viewer = null;
        var unsavedChanges = false;

        // Our init() function for setting up our UI
        this.init = function() {
            //// NOTE: the webix template isn't created at this point.
            ////   we need to wait until the [process] tab and a Process are
            ////   selected before we are SURE this template exists in the DOM
            // viewer = new BpmnModeler({
            //     container: "#" + ids.modeler
            // });

            $$(ids.button).hide();
            $$(ids.modelerBroken).hide();
            $$(ids.modelerWorking).show();
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

            saveProcess: (_process) => {
                return new Promise((resolve, reject) => {
                    viewer.saveXML({ preamble: true }, (err, xml) => {
                        console.log(".saveXML() done:", err, xml);
                        if (err) {
                            reject(err);
                        }
                        _process.modelUpdate(xml);

                        _process
                            .save()
                            .then(() => {
                                unsavedChanges = false;
                                $$(ids.button).hide();
                                resolve();
                            })
                            .catch(reject);
                    });
                });
            },

            /**
             * @function populateWorkspace()
             *
             * Initialize the Object Workspace with the provided ABObject.
             *
             * @param {ABObject} object     current ABObject instance we are working with.
             */
            populateWorkspace: function(process) {
                // initialize the BPMN Viewer if not already initialized:
                if (!viewer) {
                    $$(ids.modelerBroken).hide();
                    $$(ids.modelerWorking).show();
                    viewer = new BpmnModeler({
                        container: "#" + ids.modeler
                    });

                    // setup our Listeners:

                    // when a change is made, then make the [Save] button ready:
                    viewer.on("commandStack.changed", () => {
                        unsavedChanges = true;
                        $$(ids.button).show();
                    });
                }

                var processSequence = [];

                // if there are unsaved changes in our CurrentProcess
                if (CurrentProcess && unsavedChanges) {
                    // insert a save confirmation step
                    processSequence.push((done) => {
                        OP.Dialog.Confirm({
                            title: labels.component.confirmSave,
                            message: labels.component.confirmSaveMessage.replace(
                                "{0}",
                                CurrentProcess.name
                            ),
                            callback: (isOK) => {
                                if (isOK) {
                                    _logic
                                        .saveProcess(CurrentProcess)
                                        .then(() => {
                                            done();
                                        })
                                        .catch(done);
                                } else {
                                    // then ignore the unsaved changes
                                    unsavedChanges = false;
                                    done();
                                }
                            }
                        });
                    });
                }

                // continue our sequence with loading the new process
                processSequence.push((done) => {
                    CurrentProcess = process;

                    ///////
                    var xml = process.modelDefinition();
                    if (!xml) {
                        process.modelNew();
                        xml = process.modelDefinition();
                    }

                    viewer.clear();
                    viewer.importXML(xml, function(err) {
                        console.log(".importXML(): done. ", err);
                        viewer.get("canvas").zoom("fit-viewport", "auto");
                        done(err);
                    });
                });

                async.series(processSequence, (err) => {
                    if (err) {
                        if (err.toString().indexOf("no diagram to display")) {
                            OP.Dialog.Confirm({
                                title: labels.component.errorDisplay,
                                message: labels.component.errorDisplayMessage.replace(
                                    "{0}",
                                    CurrentProcess.name
                                ),
                                callback: (isOK) => {
                                    if (isOK) {
                                        process.modelNew();
                                        _logic.populateWorkspace(
                                            CurrentProcess
                                        );
                                    } else {
                                        // show the broken Process page
                                        $$(ids.modelerWorking).hide();
                                        $$(ids.modelerBroken).show();
                                        viewer.clear();
                                        viewer.destroy();
                                        viewer = null;
                                    }
                                }
                            });
                        }
                        console.log(err);
                    }

                    $$(ids.modelerBroken).hide();
                    $$(ids.modelerWorking).show();
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
