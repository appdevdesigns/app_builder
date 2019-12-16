// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTask = require("./ABProcessTask.js");
const ABProcessParticipant = require("../ABProcessParticipant.js");

var ABProcessTaskEmailDefaults = {
    key: "Email", // unique key to reference this specific Task
    icon: "email", // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
    fields: ["to", "from", "subject", "message"]
};

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskEmail extends ABProcessTask {
    constructor(attributes, process, application) {
        attributes.type = attributes.type || "process.task.email";
        super(attributes, process, application, ABProcessTaskEmailDefaults);

        // listen
    }

    // return the default values for this DataField
    static defaults() {
        return ABProcessTaskEmailDefaults;
    }

    static DiagramReplace() {
        return {
            label: "Send Task",
            actionName: "replace-with-send-task",
            className: "bpmn-icon-send",
            target: {
                type: "bpmn:SendTask"
            }
        };
    }

    fromValues(attributes) {
        /*
        {
            id: uuid(),
            name: 'name',
            type: 'xxxxx',
            json: "{json}"
        }
        */
        super.fromValues(attributes);

        ABProcessTaskEmailDefaults.fields.forEach((f) => {
            this[f] = attributes[f];
        });
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

        ABProcessTaskEmailDefaults.fields.forEach((f) => {
            data[f] = this[f];
        });

        return data;
    }

    ////
    //// Process Instance Methods
    ////

    /**
     * do()
     * this method actually performs the action for this task.
     * @param {obj} instance  the instance data of the running process
     * @return {Promise}
     *      resolve(true/false) : true if the task is completed.
     *                            false if task is still waiting
     */
    do(instance) {
        return new Promise((resolve, reject) => {
            // for testing:
            var myState = this.myState(instance);
            myState.status = "completed";
            this.log(instance, "Email Sent successfully");
            resolve(true);
        });
    }

    /**
     * initState()
     * setup this task's initial state variables
     * @param {obj} context  the context data of the process instance
     * @param {obj} val  any values to override the default state
     */
    initState(context, val) {
        var myDefaults = {
            to: "0",
            from: "0",
            subject: "",
            message: "",
            fromUsers: {},
            toUsers: {},
            toCustom: "",
            fromCustom: ""
        };

        super.initState(context, myDefaults, val);
    }

    propertyIDs(id) {
        return {
            name: `${id}_name`,
            to: `${id}_to`,
            from: `${id}_from`,
            subject: `${id}_subject`,
            fromUser: `${id}_from_user`,
            toUser: `${id}_to_user`,
            message: `${id}_message`,
            toCustom: `${id}_to_custom`,
            fromCustom: `${id}_from_custom`
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
        
        var toUserUI = ABProcessParticipant.selectUsersUi(id+"_to_", this.toUsers || {});
        var fromUserUI = ABProcessParticipant.selectUsersUi(id+"_from_", this.fromUsers || {});

        var ui = {
            id: id,
            rows: [
                {
                    id: ids.name,
                    view: "text",
                    label: L("ab.process.task.email.name", "*Name"),
                    name: "name",
                    value: this.name
                },
                {
                    id: ids.to,
                    view: "select",
                    label: L("ab.process.task.email.to", "*To"),
                    name: "to",
                    value: this.to,
                    options: [
                        { id: 0, value: L("ab.process.task.email.to.nextParticipant", "*Next Participant") },
                        { id: 1, value: L("ab.process.task.email.to.selectRoleUser", "*Select Role or User") },
                        { id: 2, value: L("ab.process.task.email.to.custom", "*Custom") }
                    ],
                    on:{
                        'onChange': (val) => { 
                            if (parseInt(val) == 1) {
                                $$(ids.toUser).show();
                                $$(ids.toCustom).hide();
                            } else if (parseInt(val) == 2) {
                                $$(ids.toUser).hide();
                                $$(ids.toCustom).show();
                            } else {
                                $$(ids.toUser).hide();
                                $$(ids.toCustom).hide();
                            }
                        }
                    }
                },
                {
                    id: ids.toUser,
                    rows: [toUserUI],
                    paddingY: 10,
                    hidden: (parseInt(this.to) == 1) ? false : true
                },
                {
                    id: ids.toCustom,
                    view: "text",
                    label: L("ab.process.task.email.toCustom", "*Email"),
                    placeholder: L("ab.process.task.email.toCustom", "*Type email address here..."),
                    name: "toCustom",
                    value: this.toCustom,
                    hidden: (parseInt(this.to) == 2) ? false : true
                },
                {
                    id: ids.from,
                    view: "select",
                    label: L("ab.process.task.email.from", "*From"),
                    name: "from",
                    value: this.from,
                    options: [
                        { id: 0, value: L("ab.process.task.email.to.nextParticipant", "*Current Participant") },
                        { id: 1, value: L("ab.process.task.email.to.selectRoleUser", "*Select Role or User") },
                        { id: 2, value: L("ab.process.task.email.to.custom", "*Custom") }
                    ],
                    on:{
                        'onChange': (val) => { 
                            if (parseInt(val) == 1) {
                                $$(ids.fromUser).show();
                                $$(ids.fromCustom).hide();
                            } else if (parseInt(val) == 2) {
                                $$(ids.fromUser).hide();
                                $$(ids.fromCustom).show();
                            } else {
                                $$(ids.fromUser).hide();
                                $$(ids.fromCustom).hide();
                            }
                        }
                    }
                },
                {
                    id: ids.fromUser,
                    rows: [fromUserUI],
                    paddingY: 10,
                    hidden: (parseInt(this.from) == 1) ? false : true
                },
                {
                    id: ids.fromCustom,
                    view: "text",
                    label: L("ab.process.task.email.fromCustom", "*Email"),
                    placeholder: L("ab.process.task.email.fromCustomPlace", "*Type email address here..."),
                    name: "fromCustom",
                    value: this.fromCustom,
                    hidden: (parseInt(this.from) == 2) ? false : true
                },
                {
                    id: ids.subject,
                    view: "text",
                    label: L("ab.process.task.email.subject", "*Subject"),
                    name: "subject",
                    value: this.subject
                },
                {
                    view: "spacer",
                    height: 10
                },
                {
                    id: ids.message,
                    view: "tinymce-editor",
                    label: L("ab.process.task.email.message", "*Message"),
                    name: "message",
                    value: this.message,
                    borderless: true,
                    minHeight: 500,
                    config: {
                        plugins: [
                            "advlist autolink lists link image charmap print preview anchor",
                            "searchreplace visualblocks code fullscreen",
                            "insertdatetime media table contextmenu paste imagetools wordcount"
                        ],
                        toolbar:
                            "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                        init_instance_callback: (editor) => {
                            editor.on("KeyUp", (event) => {
                                // _logic.onChange();
                            });

                            editor.on("Change", function(event) {
                                // _logic.onChange();
                            });
                        }
                    }
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
        this.to = $$(ids.to).getValue();
        this.from = $$(ids.from).getValue();
        this.subject = $$(ids.subject).getValue();
        this.message = $$(ids.message).getValue();
        this.toCustom = $$(ids.toCustom).getValue();
        this.fromCustom = $$(ids.fromCustom).getValue();
        this.toUsers = ABProcessParticipant.stashUsersUi(id+"_to_");
        this.fromUsers = ABProcessParticipant.stashUsersUi(id+"_from_");
    }
};
