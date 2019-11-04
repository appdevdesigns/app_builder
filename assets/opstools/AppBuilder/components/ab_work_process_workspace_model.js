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
                label: L("ab.process.model.label", "*Model")
            }
        };

        //// default settings

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique("_component"),
            modeler: this.unique("_modeler")
        };

        // Our webix UI definition:
        this.ui = {
            id: ids.component,
            rows: [
                {
                    view: "template",
                    // height: 800,
                    template: `<div id="${ids.modeler}" style="width: 100%; height: 100%;"></div>`
                }
                // {
                //     maxHeight: App.config.xxxLargeSpacer,
                //     hidden: App.config.hideMobile
                // }
            ]
        };

        var viewer = null;

        // Our init() function for setting up our UI
        this.init = function() {
            //// NOTE: the webix template isn't created at this point.
            ////   we need to wait until the [process] tab and a Process are
            ////   selected before we are SURE this template exists in the DOM
            // viewer = new BpmnModeler({
            //     container: "#" + ids.modeler
            // });
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

                if (!viewer) {
                    viewer = new BpmnModeler({
                        container: "#" + ids.modeler
                    });
                }
                ///////
                var xml =
                    process.xmlDefinition ||
                    `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

                viewer.importXML(xml, function(err) {
                    console.log(".importXML(): done. ", err);
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
