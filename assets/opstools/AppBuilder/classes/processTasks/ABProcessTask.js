const ABProcessTaskCore = require("./ABProcessTaskCore.js");

module.exports = class ABProcessTask extends ABProcessTaskCore {
    constructor(attributes, process, application, defaultValues) {
        super(attributes, process, application, defaultValues);

        // listen
    }

    /**
     * @method destroy()
     * remove this task definition.
     * @return {Promise}
     */
    destroy() {
        ////
        //// TODO: once our core conversion is complete, this .save() can be
        //// moved to ABProcessTaskCore, and our ABDefinition.save() can take
        //// care of the proper method to save depending on the current Platform.
        ////
        // return this.toDefinition()
        //     .destroy()

        return super.destroy().then(() => {
            return this.process.elementRemove(this);
        });
    }

    isValid() {
        /*
        var validator = OP.Validation.validator();

        // label/name must be unique:
        var isNameUnique =
            this.application.processes((o) => {
                return o.name.toLowerCase() == this.name.toLowerCase();
            }).length == 0;
        if (!isNameUnique) {
            validator.addError(
                "name",
                L(
                    "ab.validation.object.name.unique",
                    `Process name must be unique ("${this.name}"" already used in this Application)`
                )
            );
        }

        return validator;
        */

        // var isValid =
        //     this.application.processes((o) => {
        //         return o.name.toLowerCase() == this.name.toLowerCase();
        //     }).length == 0;
        // return isValid;

        return true;
    }

    ////
    //// Modeler Instance Methods
    ////

    /**
     * fromElement()
     * initialize this Task's values from the given BPMN:Element
     * @param {BPMNElement}
     */
    fromElement(element) {
        this.diagramID = element.id || this.diagramID;
        this.onChange(element);
    }

    /**
     * onChange()
     * update the current Task with information that was relevant
     * from the provided BPMN:Element
     * @param {BPMNElement}
     */
    onChange(defElement) {
        /*
        Sample DefElement:
            {
                "labels": [],
                "children": [],
                "id": "Task_08j07ni",
                "width": 100,
                "height": 80,
                "type": "bpmn:SendTask",
                "x": 20,
                "y": -2130,
                "order": {
                    "level": 5
                },
                "businessObject": {
                    "$type": "bpmn:SendTask",
                    "id": "Task_08j07ni",
                    "name": "ffff",
                    "di": {
                        "$type": "bpmndi:BPMNShape",
                        "bounds": {
                            "$type": "dc:Bounds",
                            "x": 20,
                            "y": -2130,
                            "width": 100,
                            "height": 80
                        },
                        "id": "SendTask_0iidv6o_di"
                    }

                    // Some elements (like EndEvents) have:
                    .eventDefinitions: [
                        {
                            $type: "actual bpmn:ElementType",
                            ...
                        }
                    ]
                },
                "incoming":[],
                "outgoing":[]
            }
         */

        // from the BPMI modeler we can gather a label for this:
        if (defElement.businessObject.name != "") {
            this.label = defElement.businessObject.name;
        }
    }
};
