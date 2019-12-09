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
