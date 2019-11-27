// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTask = require("./ABProcessTask.js");

var ABProcessTaskTriggerDefaults = {
    key: "Trigger", // unique key to reference this specific Task
    icon: "key" // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
};

module.exports = class ABProcessTaskTrigger extends ABProcessTask {
    constructor(attributes, process, application) {
        super(attributes, process, application, ABProcessTaskTriggerDefaults);

        // listen
    }

    // return the default values for this DataField
    static defaults() {
        return ABProcessTaskTriggerDefaults;
    }

    fromValues(attributes) {
        super.fromValues(attributes);

        this.triggerKey = attributes.triggerKey || "triggerKey.??";
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
        var data = super.toObj();

        data.triggerKey = this.triggerKey;

        return data;
    }

    // trigger(data) {
    //     // call my process.newInstance with
    //     if (!this.process) {
    //         return;
    //     }
    //     var context = this.process.context(data);
    //     this.initState(context, { triggered: true });

    //     // modify data in any appropriate way then:
    //     this.process.instanceNew(context);
    // }

    /**
     * initState()
     * setup this task's initial state variables
     * @param {obj} context  the context data of the process instance
     * @param {obj} val  any values to override the default state
     */
    // initState(context, val) {
    //     val = val || {};

    //     context.taskState = context.taskState || {};

    //     // don't overwrite your settings if they already exist:
    //     if (!context.taskState[this.id]) {
    //         context.taskState[this.id] = {
    //             initialized: true,
    //             triggered: false
    //         };
    //         for (var v in val) {
    //             context.taskState[this.id][v] = val[v];
    //         }
    //     }
    // }
};
