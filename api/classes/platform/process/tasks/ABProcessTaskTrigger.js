// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessTaskTriggerCore = require(path.join(
    __dirname,
    "..",
    "..",
    "..",
    "core",
    "process",
    "tasks",
    "ABProcessTaskTriggerCore.js"
));

module.exports = class ABProcessTaskTrigger extends ABProcessTaskTriggerCore {
    trigger(data) {
        // call my process.newInstance with
        if (!this.process) {
            return;
        }
        var context = this.process.context(data);
        this.initState(context, { triggered: true, status: "completed" });
        context.startTaskID = this.diagramID;

        // modify data in any appropriate way then:
        this.process.instanceNew(context);
    }
};
