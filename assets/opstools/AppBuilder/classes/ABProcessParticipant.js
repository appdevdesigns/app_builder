/**
 * ABProcessParticipant
 * manages the participant lanes in a Process Diagram.
 *
 * Participants manage users in the system (when there are no lanes defined)
 * and provide a way to lookup a SiteUser.
 */
var ABProcessParticipantCore = require("./ABProcessParticipantCore");

module.exports = class ABProcessParticipant extends ABProcessParticipantCore {
    constructor(attributes, process, application) {
        super(attributes, process, application);
    }

    ////
    //// Modeler Instance Methods
    ////

    /**
     * fromElement()
     * initialize this Participant's values from the given BPMN:Participant
     * @param {BPMNParticipant}
     */
    fromElement(element) {
        this.diagramID = element.id || this.diagramID;
        this.onChange(element);
    }

    /**
     * onChange()
     * update the current Participant with information that was relevant
     * from the provided BPMN:Participant
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
    }
};
