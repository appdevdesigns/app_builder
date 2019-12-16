/**
 * ABProcessParticipant
 * manages the participant lanes in a Process Diagram.
 *
 * Participants manage users in the system (when there are no lanes defined)
 * and provide a way to lookup a SiteUser.
 */
var ABProcessParticipantCore = require("./ABProcessParticipantCore");

let __Roles = null;
let __Users = null;

module.exports = class ABProcessParticipant extends ABProcessParticipantCore {
    constructor(attributes, process, application) {
        super(attributes, process, application);

        // #HACK: temporary implementation until we pull Roles into AppBuilder.
        if (!__Roles) {
            __Roles = [{ id: 0, value: "Select Role" }];
            var Roles = AD.Model.get("opstools.RBAC.PermissionRole");
            Roles.findAll()
                .fail(function(err) {
                    AD.error.log(
                        "ABProcessParticipantCore: Error loading Roles",
                        {
                            error: err
                        }
                    );
                })
                .then(function(list) {
                    // make sure they are all translated.
                    list.forEach(function(l) {
                        l.translate();
                        __Roles.push({ id: l.id, value: l.role_label });
                    });
                });
        }

        // #HACK: temporary implementation until we pull Users into AppBuilder.
        if (!__Users) {
            __Users = [];
            var SiteUser = AD.Model.get("opstools.RBAC.SiteUser");
            SiteUser.findAll()
                .fail(function(err) {
                    AD.error.log(
                        "ABProcessParticipantCore: Error loading SiteUser",
                        {
                            error: err
                        }
                    );
                })
                .then(function(list) {
                    list.forEach(function(l) {
                        __Users.push({ id: l.id, value: l.username });
                    });
                });
        }
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

        if (defElement.children) {
            var laneIDs = [];
            defElement.children.forEach((c) => {
                if (c.type == "bpmn:Lane") {
                    laneIDs.push(c.id);
                }
            });
            this.laneIDs = laneIDs;
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

    static propertyIDs(id) {
        return {
            form: `${id}_form`,
            name: `${id}_name`,
            role: `${id}_role`,
            useRole: `${id}_useRoles`,
            useAccount: `${id}_useAccounts`,
            account: `${id}_account`
        };
    }
    /**
     * propertiesShow()
     * display the properties panel for this Process Element.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesShow(id) {
        var ids = ABProcessParticipant.propertyIDs(id);

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
                        }
                        // { template: "Select Users", type: "section" },
                        // {
                        //     id: id + "_userView",
                        //     cols: [
                        //         {
                        //             view: "checkbox",
                        //             id: ids.useRole,
                        //             labelRight: "by Role",
                        //             value: this.useRole || 0
                        //         },
                        //         {
                        //             id: ids.role,
                        //             view: "select",
                        //             label: "Role",
                        //             value: this.role,
                        //             options: __Roles,
                        //             labelAlign: "left"
                        //         }
                        //     ]
                        // }
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

        // If we don't have any sub lanes, then offer the select user options:
        if (this.laneIDs && this.laneIDs.length == 0) {
            var userUI = ABProcessParticipant.selectUsersUi(id, this.users || {} );
            ui.rows[1].elements.push(userUI);
        }

        webix.ui(ui, $$(id));

        $$(id).show();
    }
    
    static selectUsersUi(id, obj) {
        var ids = ABProcessParticipant.propertyIDs(id);
        return {
            view: "fieldset",
            label: "Select Users",
            body: {
                rows: [
                    {
                        cols: [
                            {
                                view: "checkbox",
                                id: ids.useRole,
                                labelRight: "by Role",
                                labelWidth: 0,
                                width: 120,
                                value: (obj.useRole) ? obj.useRole : 0,
                                click:function(id,event){
                                    if ($$(id).getValue()) {
                                        $$(ids.role).enable();
                                    } else {
                                        $$(ids.role).disable();
                                    }
                                }
                            },
                            {
                                id: ids.role,
                                view: "select",
                                value: (obj.role) ? obj.role : "",
                                disabled: (obj.useRole) ? false : true,
                                options: __Roles,
                                labelAlign: "left"
                            }
                        ]
                    },
                    {
                        cols: [
                            {
                                view: "checkbox",
                                id: ids.useAccount,
                                labelRight: "by Account",
                                labelWidth: 0,
                                width: 120,
                                value: (obj.useAccount) ? obj.useAccount : 0,
                                click:function(id,event){
                                    if ($$(id).getValue()) {
                                        $$(ids.account).enable();
                                    } else {
                                        $$(ids.account).disable();
                                    }
                                }
                            },
                            {
                                id: ids.account,
                                view: "multicombo",
                                value: (obj.account) ? obj.account : 0,
                                disabled: (obj.useAccount) ? false : true,
                                suggest: __Users,
                                labelAlign: "left",
                                placeholder: "Click or type to add user..."
                            }
                        ]
                    }
                ]
            }
        };
    }
    
    static stashUsersUi(id) {
        var obj = {};
        var ids = ABProcessParticipant.propertyIDs(id);

        obj.useRole = $$(ids.useRole).getValue();
        obj.role = $$(ids.role).getValue();

        obj.useAccount = $$(ids.useAccount).getValue();
        obj.account = $$(ids.account).getValue();

        return obj;
    }

    /**
     * propertiesStash()
     * pull our values from our property panel.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesStash(id) {
        var ids = ABProcessParticipant.propertyIDs(id);
        this.name = $$(ids.name).getValue();
        if (this.laneIDs.length == 0) {
            this.users = ABProcessParticipant.stashUsersUi(id);
        } else {
            this.where = null;
        }
    }
};
