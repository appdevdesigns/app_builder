// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTask = require("./ABProcessTask.js");

var ABProcessTaskEmailDefaults = {
    key: "Email", // unique key to reference this specific Task
    icon: "email" // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
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
            to: "",
            from: "",
            subject: "",
            message: ""
        };

        super.initState(context, myDefaults, val);
    }
    
    propertyIDs(id) {
        return {
            name: `${id}_name`,
            to: `${id}_to`,
            from: `${id}_from`,
            subject: `${id}_subject`,
            message: `${id}_message`
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
                },
                {
                    id: ids.to,
                    view: "text",
                    label: L("ab.process.task.email.to", "*To"),
                    name: "to",
                    value: this.to
                },
                {
                    id: ids.from,
                    view: "text",
                    label: L("ab.process.task.email.from", "*From"),
                    name: "from",
                    value: this.from
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
                    view: 'tinymce-editor',
                    label: L("ab.process.task.email.message", "*Message"),
                    name: "message",
                    value: this.message,
                    borderless: true,
                    config: {
        				plugins: [
        			        "advlist autolink lists link image charmap print preview anchor",
        			        "searchreplace visualblocks code fullscreen",
        			        "insertdatetime media table contextmenu paste imagetools wordcount"
        			    ],
        				toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
        				init_instance_callback: (editor) => {

        					editor.on('KeyUp', (event) => {

        						// _logic.onChange();

        					});

        					editor.on('Change', function (event) {

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
    }
};
