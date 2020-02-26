
const path = require("path");
const ABProcessTaskServiceQueryCore = require(path.join(
    __dirname,
    "..",
    "..",
    "..",
    "core",
    "process",
    "tasks",
    "ABProcessTaskServiceQueryCore.js"
));

const ABProcessParticipant = require(path.join(
    __dirname,
    "..",
    "ABProcessParticipant"
));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessTaskServiceQuery";

module.exports = class ABProcessTaskServiceQuery extends ABProcessTaskServiceQueryCore {
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
            var myState = this.myState(instance);


            var msg = "ABProcessTaskServiceQuery not implemented yet.";
            var badCallError = new Error(msg);
            console.error(msg);
            reject(badCallError);
            return;

            // send a job to another micro service
            // var jobData = {};
            // reqAB.serviceRequest(
            //     "microservice.task",
            //     jobData,
            //     (err, results) => {
                   
            //         if (err) {
            //             // err objects are returned as simple {} not instances of {Error}
            //             var error = new Error(
            //                 `Microservice responded with an error (${err.code ||
            //                     err.toString()})`
            //             );
            //             for (var v in err) {
            //                 error[v] = err[v];
            //             }
            //             reject(error);
            //             return;
            //         }


            //         if (results.yourWorkIsDone) {
            //             this.log(instance, "Process Task completed successfully");
            //             var data = {
            //                 yourStateValue: result.importantValue,
            //                 anotherValue: result.anotherValue
            //             };
            //             this.stateUpdate(instance, data);
            //             this.stateCompleted(instance);
            //             resolve(true);
            //         } else {
            //             // still pending:
            //             resolve(false);
            //         }
            //     }
            // );

        });
    }

};
