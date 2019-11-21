/*
 * ABProcessTaskManager
 *
 * An interface for managing the different ABProcessTasks in AppBuilder.
 *
 */
var path = require("path");

var ABProcessTaskTrigger = require(path.join(
    __dirname,
    "ABProcessTaskTrigger"
));

/*
 * Tasks
 * A name => ABProcessTask  hash of the different ABProcessTask available.
 */
var Tasks = {};
Tasks[ABProcessTaskTrigger.defaults().key] = ABProcessTaskTrigger;

module.exports = {
    /*
     * @function allTasks
     * return all the currently defined ABProcessTasks in an array.
     * @return [{ABProcessTask},...]
     */
    allTasks: function() {
        var tasks = [];
        for (var t in Tasks) {
            tasks.push(Tasks[t]);
        }
        return tasks;
    },

    /*
     * @function newTask
     * return an instance of an ABProcessTask based upon the values.type value.
     * @return {ABProcessTask}
     */
    newTask: function(values, object, application) {
        if (values.key) {
            return new Tasks[values.key](values, object);
        } else {
            //// TODO: what to do here?
        }
    }
};
