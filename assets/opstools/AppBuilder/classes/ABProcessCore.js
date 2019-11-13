// import ABApplication from "./ABApplication"

var ABDefinition = require("./ABDefinition");
var ABMLClass = require("./ABMLClass");

module.exports = class ABProcessCore extends ABMLClass {
    constructor(attributes, application) {
        super(/* ["label"] */);

        this.fromValues(attributes);
        this.application = application;
    }

    ///
    /// Static Methods
    ///
    /// Available to the Class level object.  These methods are not dependent
    /// on the instance values of the Application.
    ///

    fromValues(attributes) {
        /*
		{
			id: uuid(),
			name: 'name',
			type: 'xxxxx',
			json: "{json}"
		}
		*/
        this.id = attributes.id;
        this.name = attributes.name || "";
        this.xmlDefinition = attributes.xmlDefinition || null;

        // this.type = attributes.type || "";
        // this.json = attributes.json || null;

        super.fromValues(attributes); // perform translation on this object.
        // NOTE: keep this at the end of .fromValues();

        if (!this.label) {
            this.label = this.name;
        }
    }

    /**
     * @method toObj()
     *
     * properly compile the current state of this ABApplication instance
     * into the values needed for saving to the DB.
     *
     * Most of the instance data is stored in .json field, so be sure to
     * update that from all the current values of our child fields.
     *
     * @return {json}
     */
    toObj() {
        // default label value
        if (!this.label) {
            this.label = this.name;
        }

        // OP.Multilingual.unTranslate(this, this, ["label"]);
        var data = super.toObj();

        var fieldsToSave = ["id", "name", "xmlDefinition"];
        fieldsToSave.forEach((f) => {
            data[f] = this[f];
        });

        return data;
    }

    toDefinition() {
        return new ABDefinition({
            id: this.id,
            name: this.name,
            type: "process",
            json: this.toObj()
        });
    }

    modelDefinition() {
        return this.xmlDefinition;
    }

    modelNew() {
        this.xmlDefinition = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="process-def-${this.id}" targetNamespace="http://bpmn.io/schema/bpmn">
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
    }

    modelUpdate(xml) {
        this.xmlDefinition = xml;
    }
};
