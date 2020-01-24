const ABProcessElementCore = require("../../../core/process/tasks/ABProcessElementCore.js");

module.exports = class ABProcessElement extends ABProcessElementCore {
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

    findLane(curr, cb) {
        if (!curr) {
            cb(null, null);
            return;
        }

        // if current object has a LANE definition, use that one:
        if (curr.lanes && curr.lanes.length > 0) {
            cb(null, curr.lanes[0]);
        } else if (curr.$type == "bpmn:Participant") {
            // if the current is a Participant, take that one
            cb(null, curr);
        } else {
            // else move upwards and check again:
            curr = curr.$parent;
            this.findLane(curr, cb);
        }
    }

    setLane(Lane) {
        this.laneDiagramID = Lane.diagramID;
    }

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
        if (
            defElement.businessObject.name &&
            defElement.businessObject.name != ""
        ) {
            this.label = defElement.businessObject.name;
        }

        // our lane may have changed:
        var currObj = defElement.businessObject;
        this.findLane(currObj, (err, obj) => {
            if (obj) {
                this.laneDiagramID = obj.id;
            } else {
                // if my parent shape is a Participant, then use that:
                if (
                    defElement.parent &&
                    defElement.parent.type == "bpmn:Participant"
                ) {
                    this.laneDiagramID = defElement.parent.id;
                } else {
                    this.laneDiagramID = null;
                }
            }
        });
    }

    /**
     * diagramProperties()
     * return a set of values for the XML shape definition based upon
     * the current values of this object.
     * @return {json}
     */
    diagramProperties() {
        return {
            name: this.name
        };
    }

    /**
     * propertiesShow()
     * display the properties panel for this Process Element.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesShow(id) {
        var ui = {
            id: id,
            view: "label",
            label: "this task has not implement properties yet..."
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
    propertiesStash(id) {}
};
