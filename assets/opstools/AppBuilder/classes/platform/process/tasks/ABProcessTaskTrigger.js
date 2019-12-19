// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTask = require("./ABProcessTask.js");

var ABProcessTaskTriggerDefaults = {
    key: "Trigger", // unique key to reference this specific Task
    icon: "key" // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
};

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskTrigger extends ABProcessTask {
    constructor(attributes, process, application) {
        attributes.type = attributes.type || "trigger";
        super(attributes, process, application, ABProcessTaskTriggerDefaults);

        // listen
    }

    // return the default values for this DataField
    static defaults() {
        return ABProcessTaskTriggerDefaults;
    }

    static DiagramReplace() {
        return {
            label: "Signal Start Event",
            actionName: "replace-with-signal-start",
            className: "bpmn-icon-start-event-signal",
            target: {
                type: "bpmn:StartEvent",
                // type: {string} the general bpmn category
                //      "StartEvent", "Task", "EndEvent", "ExclusiveGateway"
                eventDefinitionType: "bpmn:SignalEventDefinition"
            }
        };
    }

    fromValues(attributes) {
        super.fromValues(attributes);

        this.triggerKey = attributes.triggerKey || "triggerKey.??";
    }

    /**
     * @method toObj()
     *
     * properly compile the current state of this ABApplication instance
     * into the values needed for saving to the DB.
     *
     * Most of the instance data is stored in .json field, so be sure to
     * update that from all the current values of our child fields.
     *
     * @return {json}
     */
    toObj() {
        var data = super.toObj();

        data.triggerKey = this.triggerKey;

        return data;
    }

    propertyIDs(id) {
        return {
            name: `${id}_name`
        };
    }

    /**
     * propertiesShow()
     * display the properties panel for this Process Element.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesShow(id) {
        var ids = this.propertyIDs(id);

        var ui = {
            id: id,
            rows: [
                {
                    id: ids.name,
                    view: "text",
                    label: L("ab.process.task.email.name", "*Name"),
                    name: "name",
                    value: this.name
                }
            ]
        };

        webix.ui(ui, $$(id));

        $$(id).show();
    }

    /**
     * propertiesStash()
     * pull our values from our property panel.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesStash(id) {
        var ids = this.propertyIDs(id);
        this.name = $$(ids.name).getValue();
    }
};
