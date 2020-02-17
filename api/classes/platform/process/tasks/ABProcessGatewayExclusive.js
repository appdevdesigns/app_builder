const path = require("path");
const ABProcessGatewayExclusiveCore = require(path.join(
    __dirname,
    "..",
    "..",
    "..",
    "core",
    "process",
    "tasks",
    "ABProcessGatewayExclusiveCore.js"
));

const RowFilter = require(path.join(__dirname, "..", "..", "RowFilter.js"));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessGatewayExclusive";

module.exports = class ABProcessGatewayExclusive extends ABProcessGatewayExclusiveCore {
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

            var listDataFields = this.process.processDataFields(this);
            var abFields = listDataFields.map((f) => {
                return f.field;
            });

            var currentProcessValues = {};
            listDataFields.forEach((f) => {
                currentProcessValues[f.key] = this.process.processData(this, [
                    instance,
                    f.key
                ]);
            });

            var chosenPath = null;

            // check to see if one of my conditions are true:
            var myOutgoingConnections = this.process.connectionsOutgoing(
                this.diagramID
            );
            for (var c = 0; c < myOutgoingConnections.length; c++) {
                var conn = myOutgoingConnections[c];

                var condition = this.conditions[conn.id] || {};

                if (condition.filterValue) {
                    var DF = new RowFilter(null, `_filter`);
                    DF.applicationLoad(this.application);
                    DF.fieldsLoad(abFields);
                    DF.setValue(condition.filterValue);

                    if (DF.isValid(currentProcessValues)) {
                        chosenPath = conn.id;
                        break;
                    }
                }
            }

            if (chosenPath) {
                // we have chosen a direction.  So we are done:
                this.log(
                    instance,
                    `chosen path towards ${this.conditions[chosenPath].label ||
                        chosenPath}`
                );
                var data = {
                    chosenPath: chosenPath
                };
                this.stateUpdate(instance, data);
                this.stateCompleted(instance);
                resolve(true);
            } else {
                // no valid path .... this is an error:
                this.log(instance, "no valid path found.");
                var error = new Error(`no valid path found`);
                reject(error);
            }
        });
    }

    /**
     * nextTasks()
     * follow the current instance diagram and return the next task(s)
     * after this task.
     * @param {obj} instance  the current ABProcessInstance
     * @return {array}  [ABProcessTask, ...] or {null} if an error
     */
    nextTasks(instance) {
        // In our case, we only report the nextTasks for the path we have
        // chosen.
        var myState = this.myState(instance);
        if (!myState.chosenPath) {
            // this shouldn't happen
            return null;
        }

        var connection = this.process
            .connectionsOutgoing(this.diagramID)
            .find((c) => {
                return c.id == myState.chosenPath;
            });
        if (!connection) {
            return null;
        }

        var nextTask = this.process.elementForDiagramID(connection.to);
        return [nextTask];
    }
};
