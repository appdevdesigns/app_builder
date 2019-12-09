// import ABApplication from "./ABApplication"

var ABMLClass = require("../ABMLClass");

module.exports = class ABProcessTaskCore extends ABMLClass {
    constructor(attributes, process, application, defaultValues) {
        super(["label"]);

        this.defaults = defaultValues || { key: "core", icon: "core" };

        this.fromValues(attributes);
        this.process = process;
        if (!this.processID) {
            this.processID = process.id;
        }
        this.application = application;

        //// Runtime Values
        //// these are not stored in the Definition, but rather
        //// loaded and used from a running process instance.
        this.state = null;
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
        // ABDefinition Related fields:
        this.id = attributes.id;
        this.name = attributes.name || "";
        this.type = attributes.type || "process.task.unknown";

        // ABProcess related fields:
        this.key = attributes.key || this.defaults.key || "?key?";
        this.processID = attributes.processID || null;
        this.diagramID = attributes.diagramID || "?diagramID?";
        this.laneDiagramID = attributes.laneDiagramID || "?laneID?";
        // laneDiagramID : connects to the parent object that defines any
        //      default User information for the Task.  In our case, it
        //      might be a Participant object, or a Lane object.  by
        //      default, a diagram's Participant obj doesn't define any
        //      lanes, and therefore can provide that info.  Once a lane
        //      is added, however, an object is assigned to it, and the
        //      Lane will provide that info.

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
        if (!this.label && this.name && this.name != "") {
            this.label = this.name;
        }

        // untranslate this object:
        var data = super.toObj();

        var fieldsToSave = [
            "id",
            "name",
            "type",
            "processID",
            "diagramID",
            "laneDiagramID",
            "key"
        ];
        fieldsToSave.forEach((f) => {
            data[f] = this[f];
        });

        return data;
    }

    ////
    //// Process Instance Methods
    ////

    /**
     * initState()
     * setup this task's initial state variables
     * @param {obj} context  the context data of the process instance
     * @param {obj} defaults  any values to include from our child classes
     * @param {obj} val  any values to override the default state
     */
    initState(context, defaults, val) {
        defaults = defaults || {};
        if (!val) {
            val = defaults;
            defaults = {};
        }

        context.taskState = context.taskState || {};

        // don't overwrite your settings if they already exist:
        if (!context.taskState[this.diagramID]) {
            context.taskState[this.diagramID] = {
                initialized: true,
                status: "initialized"
            };
            for (var d in defaults) {
                context.taskState[this.diagramID][d] = defaults[d];
            }
            for (var v in val) {
                context.taskState[this.diagramID][v] = val[v];
            }
        }
    }

    /**
     * log()
     * enter a log in the current process instance
     * @param {obj} instance  the current ABProcessInstance
     * @param {...} ...allArgs the remaining parameters sent to the log
     */
    log(instance, ...allArgs) {
        var text = `${this.diagramID} : ${this.key} : ${allArgs.join(" ")}`;
        instance.log.push(text);
    }

    /**
     * myState()
     * return the current state values for this ABProcessTask
     * @param {obj} instance  the current ABProcessInstance
     * @return {obj}
     */
    myState(instance) {
        return instance.context.taskState[this.diagramID];
    }

    /**
     * nextTasks()
     * follow the current instance diagram and return the next task(s)
     * after this task.
     * @param {obj} instance  the current ABProcessInstance
     * @return {array}  [ABProcessTask, ...]
     */
    nextTasks(instance) {
        var nextTasks = [];

        var myDiagramObj = instance.hashDiagramObjects[this.diagramID];
        if (!myDiagramObj) {
            var error = new Error(
                `Did not find my definition for dID[${this.diagramID}]`
            );
            this.onError(instance, error);
            return [];
        }

        // myDiagramObj :
        // {
        //     "bpmn2:outgoing": [{"_text": "SequenceFlow_00fbxm3"} ...],
        //     "_attributes": {id: "StartEvent_1"},
        //     "_type": "start"
        // }

        // find my possible exits:
        var exitFlows = myDiagramObj["bpmn2:outgoing"];
        if (!exitFlows) {
            var error = new Error(
                `Did not find any outgoing flows for dID[${this.diagramID}]`
            );
            this.onError(instance, error);
            return [];
        }

        if (!Array.isArray(exitFlows)) {
            exitFlows = [exitFlows];
        }

        var tasksFromFlow = (flow) => {
            // follow a flow and grab each of it's exit tasks
            // place them into nextTasks[];

            var flowObj = instance.hashDiagramObjects[flow["_text"]];
            if (!flowObj) return;

            var targetIDs = flowObj["_attributes"]["targetRef"];
            if (!targetIDs) return;

            if (!Array.isArray(targetIDs)) {
                targetIDs = [targetIDs];
            }

            targetIDs.forEach((tid) => {
                var targetTask = this.process.elementForDiagramID(tid);
                if (targetTask) {
                    nextTasks.push(targetTask);
                } else {
                    var error = new Error(
                        `No ProcessTask instance for diagramID[${tid}]`
                    );
                    this.onError(instance, error);
                }
            });
        };

        exitFlows.forEach((f) => {
            tasksFromFlow(f);
        });

        return nextTasks;
    }

    /**
     * onError()
     * perform the following actions (log it) on an error.
     * @param {obj} instance  the current ABProcessInstance
     * @param {Error} error
     */
    onError(instance, error) {
        if (error) {
            var text = `Error: ${error.toString()}`;
            this.log(instance, text);
        }
    }

    /**
     * reset()
     * prepare this task to run again if it was already completed.
     *
     * This might happen in a process where a loop is formed and tasks
     * are repeated until a certain outcome.
     *
     * @param {obj} instance  the current ABProcessInstance
     */
    reset(instance) {
        // a task wants to run me.  Possibly again.
        var myState = this.myState(instance);

        // if I haven't setup my state (why?) then just
        // do that again:
        if (!myState) {
            this.initState(instance.context);
        } else {
            // if I have already "completed" and we are being
            // asked to run again (it's possible)
            if (myState.status == "completed") {
                // remove my current state
                delete instance.context.taskState[this.diagramID];

                // store a new state in the context
                this.initState(instance.context);

                // remember our previous state
                var newState = this.myState(instance);
                newState._prevState = myState;
                this.log(instance, " Reset() called. Running again. ");
            }
        }
    }

    /**
     * stateCompleted()
     * mark this task has having completed.
     * @param {obj} instance  the current ABProcessInstance
     */
    stateCompleted(instance) {
        var myState = this.myState(instance);
        myState.status = "completed";
    }

    /**
     * wantToDoSomething()
     * determine if this task still has something to do.
     * @param {obj} instance  the instance data of the process we are working on
     * @return {bool} true if there is still pending actions
     */
    wantToDoSomething(instance) {
        var state = this.myState(instance);
        if (state) {
            return state.status != "completed";
        } else {
            // my state wasn't defined?
            console.warn(
                "ABProcessTaskCore:wantToDoSomething(): called without having initialized our state first.",
                instance
            );
            // initialize our state and try again
            this.initState(instance.context);
            return this.wantToDoSomething(instance);
        }
    }
};
