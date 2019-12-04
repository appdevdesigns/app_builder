// import ABApplication from "./ABApplication"

var ABMLClass = require("./ABMLClass");

module.exports = class ABProcessCore extends ABMLClass {
    constructor(attributes, application) {
        super(/* ["label"] */);

        this.application = application;

        this.fromValues(attributes);
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
        this.type = attributes.type || "process";
        this.xmlDefinition = attributes.xmlDefinition || null;

        // this.json = attributes.json || null;
        this._tasks = {};
        (attributes.taskIDs || []).forEach((tID) => {
            this._tasks[tID] = this.application.taskNew(tID, this);
        });

        this._participants = {};
        (attributes.participantIDs || []).forEach((pID) => {
            this._participants[pID] = this.application.participantNew(
                pID,
                this
            );
        });

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

        data.taskIDs = [];
        for (var t in this._tasks) {
            data.taskIDs.push(this._tasks[t].id);
        }

        data.participantIDs = [];
        for (var p in this._participants) {
            data.participantIDs.push(this._participants[p].id);
        }

        return data;
    }

    //
    // XML Model
    //

    /**
     * modelDefinition()
     * return the current xml definition for this process
     * @return {string}
     */
    modelDefinition() {
        return this.xmlDefinition;
    }

    /**
     * modelNew()
     * initialze our xml definition to a new state.
     * @return {string}
     */
    modelNew() {
        this.xmlDefinition = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="process-def-${this.id}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
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

        //// TODO: create a default Start Task here??
    }

    /**
     * modelUpdate()
     * update our xml definition from the provided description.
     * @param {string} xml  bpmn2 xml definition from our modeler.
     * @return {string}
     */
    modelUpdate(xml) {
        this.xmlDefinition = xml;
    }

    //
    // Tasks
    //

    /**
     * tasks()
     * return an array of tasks that match the given filter (or all tasks if
     * no filter is provided).
     * @param {fn} fn an iterator that returns true if the provided task should
     *                be returned.
     * @return {[ABProcessTask,...]}
     */
    tasks(fn) {
        if (!fn)
            fn = () => {
                return true;
            };
        var allTasks = Object.keys(this._tasks).map((t) => {
            return this._tasks[t];
        });
        return allTasks.filter(fn);
    }

    /**
     * tasksForDiagramID()
     * return the task(s) that are tied to the given xml diagram ID.
     * @param {string} dID the diagram ID
     * @return {[ABProcessTask,...]}
     */
    tasksForDiagramID(dID) {
        return this.tasks((t) => {
            return t.diagramID == dID;
        });
    }

    /**
     * isTriggeredBy()
     * scan our tasks and see if we have a "trigger" task that responds to
     * the provided key.
     * @param {string} key the trigger key
     * @return {bool}
     */
    isTriggeredBy(key) {
        return this.tasksForTriggerKey(key) != null;
    }

    /**
     * tasksForTriggerKey()
     * return one or more tasks that respond to the given trigger key
     * @param {string} key a trigger key
     * @return {[ABProcessTask,...]}
     */
    tasksForTriggerKey(key) {
        var trigger = this.tasks((t) => {
            return t.type == "trigger" && t.triggerKey == key;
        })[0];
        if (trigger) {
            return trigger;
        } else {
            return null;
        }
    }

    taskRemove(def) {
        delete this._tasks[def.id];
    }

    //
    // Participants
    //

    /**
     * participants()
     * return an array of participants that match the given filter (or all tasks
     * if no filter is provided).
     * @param {fn} fn an iterator that returns true if the provided participants
     *                should be returned.
     * @return {[ABProcessParticipant,...]}
     */
    participants(fn) {
        if (!fn)
            fn = () => {
                return true;
            };
        var all = Object.keys(this._participants).map((p) => {
            return this._participants[p];
        });
        return all.filter(fn);
    }

    /**
     * participantsForDiagramID()
     * return the participant(s) that are tied to the given xml diagram ID.
     * @param {string} dID the diagram ID
     * @return {[ABProcessParticipant,...]}
     */
    participantsForDiagramID(dID) {
        return this.participants((p) => {
            return p.diagramID == dID;
        });
    }
};
