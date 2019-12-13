// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessTask = require(path.join(__dirname, "ABProcessTask.js"));

var ABProcessTaskEmailDefaults = {
    key: "Email", // unique key to reference this specific Task
    icon: "email" // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
};

module.exports = class ABProcessTaskEmail extends ABProcessTask {
    constructor(attributes, process, application) {
        super(attributes, process, application, ABProcessTaskEmailDefaults);

        // listen
    }

    // return the default values for this DataField
    static defaults() {
        return ABProcessTaskEmailDefaults;
    }

    ////
    //// Process Instance Methods
    ////
    resolveAddresses(instance, field) {
        return new Promise((resolve, reject) => {
            var myLane = this.process.elementForDiagramID(this.laneDiagramID);
            if (!myLane) {
                reject("could not find lane");
            }

            var emails = [];
            var missingEmails = [];
            myLane
                .users()
                .then((list) => {
                    list.forEach((l) => {
                        if (l.email) {
                            emails.push(l.email);
                        } else {
                            missingEmails.push(l.username);
                        }
                    });
                    if (missingEmails.length == 0) {
                        var data = {};
                        data[field] = emails;
                        this.stateUpdate(instance, data);
                        resolve();
                    } else {
                        var text = "These Accounts have missing emails: ";
                        text += missingEmails.join(", ");
                        var error = new Error(text);
                        error.accounts = missingEmails;
                        reject(error);
                    }
                })
                .catch(reject);
        });
    }

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
            var tasks = [];
            tasks.push(this.resolveAddresses(instance, "to"));
            tasks.push(this.resolveAddresses(instance, "from"));

            Promise.all(tasks)
                .then(() => {
                    // for testing:
                    this.stateCompleted(instance);
                    this.log(instance, "Email Sent successfully");
                    resolve(true);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
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
            to: [],
            from: [],
            subject: "",
            message: ""
        };

        super.initState(context, myDefaults, val);
    }
};
