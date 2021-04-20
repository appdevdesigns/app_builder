/**
 * ABProcess
 *
 * Services for our Processes.
 *
 */

var Log = function(text) {
    console.log("ABProcess:" + text);
};
module.exports = {
    /**
     * run
     * find a running ABProcessInstance and signal it to run() again.
     * @param {string[]} instanceID  the uuids of the ABProcessInstances
     * @return {Promise}
     */
    run: function(instanceID) {
        if (!instanceID) {
            return Promise.resolve();
        }

        if (!Array.isArray(instanceID)) {
            instanceID = [instanceID];
        }

        return new Promise((resolve, reject) => {
            let instances = null;
            let processID = null;
            let parentProcess = null;
            async.series(
                [
                    // get the ABProcessInstances that are being reset
                    (done) => {
                        ABProcessInstance.find({ id: instanceID })
                            .then((list) => {
                                if (list) {
                                    instances = list;
                                    list.forEach((instance) => {
                                        processID = instance.processID;
                                    });
                                }
                                done();
                            })
                            .catch(done);
                    },

                    // Find the ABProcess Object for these instances
                    (done) => {
                        if (!processID) {
                            done(
                                new Error(
                                    `unknown Process Instance [${processID}]`
                                )
                            );
                            return;
                        }

                        ABServerApp.processes((p) => {
                            return p.id == processID;
                        })
                            .then((processes) => {
                                if (processes) {
                                    parentProcess = processes[0];
                                }
                                done();
                            })
                            .catch(done);
                    },

                    // tell the ABProcess to reset each Instance:
                    (done) => {
                        if (!parentProcess) {
                            var error = new Error(
                                `couldn't find process [${processID}] for given instances`
                            );
                            done(error);
                            return;
                        }

                        var allRuns = [];
                        instances.forEach((instance) => {
                            allRuns.push(parentProcess.run(instance));
                        });
                        Promise.all(allRuns)
                            .then(() => {
                                done();
                            })
                            .catch(done);
                    }
                ],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                }
            );
        });
    },

    /**
     * reset
     * find a running ABProcessInstance and signal it to reset().
     * @param {string[]} instanceID  the uuids of the ABProcessInstances
     * @param {string} taskID the diagramID of the ABProcessTask to reset
     * @return {Promise}
     */
    reset: function(instanceID, taskID) {
        return new Promise((resolve, reject) => {
            let instances = null;
            let processID = null;
            let parentProcess = null;
            async.series(
                [
                    // get the ABProcessInstances that are being reset
                    (done) => {
                        ABProcessInstance.find({ id: instanceID })
                            .then((list) => {
                                if (list) {
                                    instances = list;
                                    list.forEach((instance) => {
                                        processID = instance.processID;
                                    });
                                }
                                done();
                            })
                            .catch(done);
                    },

                    // Find the ABProcess Object for these instances
                    (done) => {
                        if (!processID) {
                            done(new Error("unknown Process Instance"));
                            return;
                        }

                        ABServerApp.processes((p) => {
                            return p.id == processID;
                        })
                            .then((processes) => {
                                if (processes) {
                                    parentProcess = processes[0];
                                }
                                done();
                            })
                            .catch(done);
                    },

                    // tell the ABProcess to reset each Instance:
                    (done) => {
                        if (!parentProcess) {
                            var error = new Error(
                                `couldn't find process [${processID}] for given instances`
                            );
                            done(error);
                            return;
                        }

                        var allResets = [];
                        instances.forEach((instance) => {
                            allResets.push(
                                parentProcess.instanceReset(instance, taskID)
                            );
                        });
                        Promise.all(allResets)
                            .then(() => {
                                done();
                            })
                            .catch(done);
                    }
                ],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                }
            );
        });
    },

    /**
     * trigger
     * receive a process trigger that could potentially create a new
     * live process.
     * @param {string} appID  the uuid of the Mobile App
     * @return {Promise}  {MobileApp} if found, {undefined} if not.
     */
    trigger: function(key, data) {
        return new Promise((resolve, reject) => {
            Log(`.trigger(): ${key} : ${data}`);

            // triggers define an event that would create a new process.
            var listTriggers = null;

            async.series(
                [
                    // 1) find any defined task that responds to this trigger
                    (done) => {
                        ABProcess.tasksForTrigger(key).then((list) => {
                            listTriggers = list;
                            done();
                        });
                    },

                    // 2) have tasks perform their trigger() operation.
                    (done) => {
                        if (!listTriggers) {
                            done();
                        }
                        listTriggers.forEach((task) => {
                            task.trigger(data);
                        });
                        done();
                    }
                ],
                (err) => {
                    resolve(listTriggers.length);
                }
            );
        });
    },

    processesForTrigger: function(key) {
        return ABServerApp.processes().then((processes) => {
            var foundProcesses = [];
            processes.forEach((process) => {
                if (process.isTriggeredBy(key)) {
                    foundProcesses.push(process);
                }
            });
            return foundProcesses;
        });
    },

    tasksForTrigger: function(key) {
        return ABServerApp.processes().then((processes) => {
            var tasks = [];
            processes.forEach((process) => {
                var task = process.taskForTriggerKey(key);
                if (task) {
                    tasks.push(task);
                }
            });
            return tasks;
        });
    }
};
