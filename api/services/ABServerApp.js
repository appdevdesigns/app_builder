/**
 * ABServerApp
 *
 * A Server side application object that can be used to lookup other
 * AppBuilder resources.
 *
 */
const path = require("path");
const ABClassProcess = require(path.join("..", "classes", "ABProcess.js"));
const ABProcessTaskManager = require(path.join(
    "..",
    "classes",
    "ABProcessTaskManager"
));

var __AllDefinitions = {};

var Log = function(text) {
    console.log("ABServerApp:" + text);
};
module.exports = {
    processes: (fn) => {
        return ABDefinition.find({ type: "process" }).then(
            (listDefinitions) => {
                var listProcesses = [];
                listDefinitions.forEach((def) => {
                    listProcesses.push(
                        new ABClassProcess(def.json, ABServerApp)
                    );
                });

                return listProcesses;
            }
        );
    },

    taskNew: (tID, process) => {
        var taskDef = ABDefinition.definitionForID(tID);
        return ABProcessTaskManager.newTask(taskDef, process, ABServerApp);
    }
};
