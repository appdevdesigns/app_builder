const convert = require("xml-js");

module.exports = class ABProcessEngineCore {
    constructor(instance, process) {
        this.instance = instance;
        this.process = process;

        if (!this.instance.jsonDefinition) {
            this.instance.jsonDefinition = convert.xml2js(
                this.instance.xmlDefinition,
                { compact: true }
            );
        }
        if (!this.instance.hashDiagramObjects) {
            this.instance.hashDiagramObjects = {
                /*

"SequenceFlow_08vhpcp" : {
        "_type" : "flow",
        "_attributes": {
            "id": "SequenceFlow_08vhpcp",
            "sourceRef": "Task_111mwec",
            "targetRef": "Task_0ohz9ag"
        }
    },

"StartEvent_1" : {
        "_type" : "start",
        "_attributes": {
            "id": "StartEvent_1"
        },
        "bpmn2:outgoing": {
            "_text": "SequenceFlow_00fbxm3"
        }
    }

*/
            };
            var processDefinitions = this.instance.jsonDefinition[
                "bpmn2:definitions"
            ]["bpmn2:process"];
            var typeLookup = [
                { xmlRef: "bpmn2:sequenceFlow", type: "flow" },
                { xmlRef: "bpmn2:startEvent", type: "start" },
                { xmlRef: "bpmn2:task", type: "task" },
                { xmlRef: "bpmn2:sendTask", type: "sendTask" },
                { xmlRef: "bpmn2:userTask", type: "userTask" },
                { xmlRef: "bpmn2:endEvent", type: "end" },
                { xmlRef: "bpmn2:parallelGateway", type: "parallelGateway" }
            ];

            typeLookup.forEach((lookup) => {
                if (processDefinitions[lookup.xmlRef]) {
                    var aryDef = processDefinitions[lookup.xmlRef];
                    if (!Array.isArray(aryDef)) {
                        aryDef = [aryDef];
                    }
                    aryDef.forEach((obj) => {
                        obj["_type"] = lookup.type;
                        this.instance.hashDiagramObjects[
                            obj["_attributes"]["id"]
                        ] = obj;
                    });
                }
            });
        }

        // listen
    }

    /**
     * pendingTasks()
     * execute the current Diagram and return a list of ABProcessTasks
     * that wantToDoSomething().
     * @return {Promise}
     *          resolve([ABProcessTask, ...])
     */
    pendingTasks() {
        return new Promise((resolve, reject) => {
            try {
                var task = this.startTask();
                this.walkGraph([task], (err, listPending) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(listPending);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * startTask()
     * return the initial ABProcessTask that started this process instance.
     * @return {ABProcessTask} or {undefined} if not found.
     */
    startTask() {
        return this.process.elementForDiagramID(
            this.instance.context.startTaskID
        );
    }

    /**
     * walkGraph()
     * recursively step through the list of ABProcessTasks and
     * return the currently active tasks that are not finished().
     * @param {array} list the current list of Tasks to evaluate
     * @param {array} pending (optional) the current list of Tasks that are
     *                not finished.
     * @param {fn} cb node style callback (cb(err, pending)) to receive the
     *                final list.
     * @return {ABProcessTask} or {undefined} if not found.
     */
    walkGraph(list, pending, cb) {
        // make sure pending and cb are properly set
        if (typeof pending == "function") {
            cb = pending;
            pending = [];
        }

        // if we have run out of tasks to evaluate, then return
        if (list.length == 0) {
            cb(null, pending);
        } else {
            var task = list.shift();

            // if the task still wantsToDoSomething() then
            // this task is pending.
            if (task.wantToDoSomething(this.instance)) {
                pending.push(task);
            } else {
                // else, get the next task(s) after this one
                // and check those as well:
                var nextTasks = task.nextTasks(this.instance);
                list = list.concat(nextTasks);
            }
            this.walkGraph(list, pending, cb);
        }
    }
};
