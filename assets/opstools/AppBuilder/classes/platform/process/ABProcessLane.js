/**
 * ABProcessLane
 * manages a lane in a Process Diagram.
 *
 * Lanes manage users in the system, and provide a way to lookup a SiteUser.
 */
var ABProcessLaneCore = require("../../core/process/ABProcessLaneCore");

module.exports = class ABProcessLane extends ABProcessLaneCore {
    constructor(attributes, process, application) {
        super(attributes, process, application);
    }

    ////
    //// Modeler Instance Methods
    ////

    transferParticipantWhereToMe(id) {
        var myParticipant = this.process.elementForDiagramID(id);
        if (myParticipant) {
            // if I haven't already set my where clause, and my Participant
            // has one, then take it:
            if (!this.where && myParticipant.where) {
                var copyParams = [
                    "where",
                    "useRole",
                    "role",
                    "useAccount",
                    "account"
                ];
                copyParams.forEach((p) => {
                    this[p] = myParticipant[p];
                    myParticipant[p] = null; // ?? do this ??
                });
            }
        }
    }

    /**
     * fromElement()
     * initialize this Lane's values from the given BPMN:Lane
     * @param {BPMNParticipant}
     */
    fromElement(element) {
        this.diagramID = element.id || this.diagramID;

        // on creation, if I have child objects, then move the .where definition
        // from my parent Participant to ME
        if (element.children && element.children.length > 0) {
            if (element.parent && element.parent.type == "bpmn:Participant") {
                this.transferParticipantWhereToMe(element.parent.id);
            }
        } else {
            // this info might just reside in the .parent.children[]
            if (
                element.parent &&
                element.parent.children &&
                element.parent.children.length > 0
            ) {
                element.parent.children.forEach((child) => {
                    if (child.type != "bpmn:Lane") {
                        // if child has lanes
                        if (
                            child.businessObject.lanes &&
                            child.businessObject.lanes.length > 0
                        ) {
                            // if lane is me
                            var myLane = child.businessObject.lanes.find(
                                (l) => {
                                    return l.id == this.diagramID;
                                }
                            );
                            if (myLane) {
                                this.transferParticipantWhereToMe(
                                    element.parent.id
                                );

                                // tell child I'm it's lane:
                                var objChild = this.process.elementForDiagramID(
                                    child.id
                                );
                                if (objChild) {
                                    objChild.setLane(this);
                                }
                            }
                        }
                    }
                });
            }
        }

        this.onChange(element);
    }

    /**
     * onChange()
     * update the current Lane with information that was relevant
     * from the provided BPMN:Lane
     * @param {BPMNParticipant}
     */
    onChange(defElement) {
        /*
        Sample DefElement:
            {
                "labels": [],
                "children": [],
                "id": "Participant_185ljkg",
                "width": 958,
                "height": 240,
                "type": "bpmn:Participant",
                "x": -810,
                "y": -2010,
                "order": {
                    "level": -2
                },
               "businessObject": {
                    "$type": "bpmn:Participant",
                    "id": "Participant_185ljkg",
                    "di": {
                        "$type": "bpmndi:BPMNShape",
                        "bounds": {
                            "$type": "dc:Bounds",
                            "x": -810,
                            "y": -2010,
                            "width": 958,
                            "height": 240
                        },
                        "id": "Participant_185ljkg_di",
                        "isHorizontal": true
                    },
                    "processRef": {
                        "$type": "bpmn:Process",
                        "id": "Process_0x3sul5"
                    }
                }
         */

        // from the BPMI modeler we can gather a label for this:
        if (
            defElement.businessObject.name &&
            defElement.businessObject.name != ""
        ) {
            this.label = defElement.businessObject.name;
        }

        // if I picked up a new task, inform it I am it's lane:
    }
};
