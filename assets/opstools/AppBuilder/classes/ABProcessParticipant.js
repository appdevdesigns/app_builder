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

    /**
     * diagramProperties()
     * return a set of values for the XML shape definition based upon
     * the current values of this objec.
     * @return {json}
     */
    diagramProperties() {
        return {
            name: this.name
        };
    }

    propertyIDs(id) {
        return {
            form: `${id}_form`,
            name: `${id}_name`,
            useRoles: `${id}_useRoles`
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
                { view: "label", label: `${this.type} :` },
                {
                    view: "form",
                    id: ids.form,
                    // width: 300,
                    elements: [
                        {
                            id: ids.name,
                            view: "text",
                            label: "Name",
                            name: "name",
                            value: this.name
                        },
                        { template: "Select Users", type: "section" },
                        {
                            id: id + "_userView",
                            cols: [
                                {
                                    view: "checkbox",
                                    id: ids.useRoles,
                                    labelRight: "by Role",
                                    value: this.useRoles || 0
                                }
                            ]
                        }
                        // {
                        //     margin: 5,
                        //     cols: [
                        //         {
                        //             view: "button",
                        //             value: "Login",
                        //             css: "webix_primary"
                        //         },
                        //         { view: "button", value: "Cancel" }
                        //     ]
                        // }
                    ]
                }
            ]
        };
        /*
        var ui = {
            id: id,
            rows: [
                {
                    id: ids.name,
                    view: "text",
                    label: "Name",
                    name: "name",
                    value: this.name
                },
                {
                    view: "tabview",
                    cells: [
                        {
                            header: "Select Users",
                            body: {
                                id: id + "_userView",
                                cols: [
                                    {
                                        view: "checkbox",
                                        id: ids.useRoles,
                                        labelRight: "by Role",
                                        value: this.useRoles || 0
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
*/

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
        this.useRoles = $$(ids.useRoles).getValue();
    }
};
