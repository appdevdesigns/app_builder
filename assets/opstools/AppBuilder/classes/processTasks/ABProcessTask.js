const ABProcessTaskCore = require("./ABProcessTaskCore.js");
const ABDefinition = require("../ABDefinition.js");

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

        //// Until then:
        var def = this.toDefinition().toObj();
        if (def.id) {
            // here ABDefinition is our sails.model()
            return ABDefinition.destroy(def.id).then(() => {
                return this.process.taskRemove(def);
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * @method save()
     * persist this instance of ABObject with it's parent ABApplication
     * @return {Promise}
     */
    save() {
        ////
        //// TODO: once our core conversion is complete, this .save() can be
        //// moved to ABProcessTaskCore, and our ABDefinition.save() can take
        //// care of the proper method to save depending on the current Platform.
        ////
        // return this.toDefinition()
        //     .save()
        //     .then((data) => {
        //         // if I didn't have an .id then this was a create()
        //         // and I need to update my data with the generated .id

        //         if (!this.id) {
        //             this.id = data.id;
        //         }
        //     });

        //// Until then:
        var def = this.toDefinition().toObj();
        if (def.id) {
            // here ABDefinition is our sails.model()
            return ABDefinition.update(def.id, def);
        } else {
            return ABDefinition.create(def).then((data) => {
                this.id = data.id;
                return this.process.save();
            });
        }
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
        this.label = defElement.businessObject.name || this.label;
    }
};
