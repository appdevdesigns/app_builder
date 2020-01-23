// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()

const path = require("path");
const ABProcessTaskUserApprovalCore = require(path.join(
    __dirname,
    "..",
    "..",
    "..",
    "core",
    "process",
    "tasks",
    "ABProcessTaskUserApprovalCore.js"
));

const ABProcessParticipant = require(path.join(
    __dirname,
    "..",
    "ABProcessParticipant"
));

module.exports = class ABProcessTaskUserApproval extends ABProcessTaskUserApprovalCore {
    ////
    //// Process Instance Methods
    ////

    /**
     * do()
     * this method actually performs the action for this task.
     * @param {obj} instance  the instance data of the running process
     * @return {Promise}
     *      resolve(true/false) : true if the task is completed.
     *                            false if task is still waiting
     */
    do(instance) {
        return new Promise((resolve, reject) => {
            // err objects are returned as simple {} not instances of {Error}
            var error = new Error(
                "UserTaskApproval.do() not implemented on the server ."
            );
            reject(error);
            return;
        });
    }
};
