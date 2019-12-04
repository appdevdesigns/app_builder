/*
 * ABProcessTaskManager
 *
 * An interface for managing the different ABProcessTasks in AppBuilder.
 *
 */
var ABProcessTaskEmail = require("./processTasks/ABProcessTaskEmail");
var ABProcessTaskEnd = require("./processTasks/ABProcessTaskEnd");
var ABProcessTaskTrigger = require("./processTasks/ABProcessTaskTrigger");

/*
 * Tasks
 * A name => ABProcessTask  hash of the different ABProcessTask available.
 */
var Tasks = {};
Tasks[ABProcessTaskEmail.defaults().key] = ABProcessTaskEmail;
Tasks[ABProcessTaskEnd.defaults().key] = ABProcessTaskEnd;
Tasks[ABProcessTaskTrigger.defaults().key] = ABProcessTaskTrigger;

/*
 * StartEvents
 * a list of Diagram Replace options for StartEvents:
 */
var START_EVENTS = [];
START_EVENTS.push(ABProcessTaskTrigger.DiagramReplace());

/*
 * Tasks
 * a list of Diagram Replace options for Tasks:
 */
var TASKS = [];
TASKS.push(ABProcessTaskEmail.DiagramReplace());

/*
 * EndEvents
 * a list of Diagram Replace options for EndEvents:
 */
var END_EVENTS = [];
END_EVENTS.push(ABProcessTaskEnd.DiagramReplace());

/*
 * DEFINITIONTYPES
 * a hash of BPMN:Element.type to Default values
 * for each of our Process Objects.
 *
 * NOTE: the key should be the target.eventDefinitionType
 * if it exists, or the .target.type if not.
 */
var DEFINITIONTYPES = {};
DEFINITIONTYPES[
    ABProcessTaskEmail.DiagramReplace().target.type
] = ABProcessTaskEmail.defaults();
DEFINITIONTYPES[
    ABProcessTaskEnd.DiagramReplace().target.eventDefinitionType
] = ABProcessTaskEnd.defaults();
DEFINITIONTYPES[
    ABProcessTaskTrigger.DiagramReplace().target.eventDefinitionType
] = ABProcessTaskTrigger.defaults();

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
    },

    StartEvents: function() {
        return START_EVENTS;
    },

    Tasks: function() {
        return TASKS;
    },

    EndEvents: function() {
        return END_EVENTS;
    },

    definitionForElement: function(element) {
        // pull the key from the embedded .eventDefinition
        // if there is one
        var key = null;
        if (element.businessObject.eventDefinitions) {
            var def = element.businessObject.eventDefinitions[0];
            if (def) {
                key = def.$type;
            }
        }

        // if not, then just use the base .type
        if (!key) {
            key = element.type;
        }

        return DEFINITIONTYPES[key];
    }
};
