// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessTask = require(path.join(__dirname, "ABProcessTask.js"));

const ABProcessParticipant = require(path.join(
    __dirname,
    "ABProcessParticipant"
));

var ABProcessTaskEmailDefaults = {
    key: "Email", // unique key to reference this specific Task
    icon: "email", // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
    fields: [
        "to",
        "from",
        "subject",
        "message",
        "toCustom",
        "fromCustom",
        "toUsers",
        "fromUsers"
    ]
};

const cote = require("cote");
const client = new cote.Requester({
    name: "ABProcessTaskEmail > emailer"
});

module.exports = class ABProcessTaskEmail extends ABProcessTask {
    constructor(attributes, process, application) {
        super(attributes, process, application, ABProcessTaskEmailDefaults);

        // listen
    }

    // return the default values for this DataField
    static defaults() {
        return ABProcessTaskEmailDefaults;
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

    laneUserEmails(myLane) {
        return new Promise((resolve, reject) => {
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
                        resolve(emails);
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

    resolveAddresses(instance, field, method, select, custom) {
        return new Promise((resolve, reject) => {
            method = parseInt(method);

            switch (method) {
                case 0:
                    // select by current/next lane

                    var myLane;
                    // if "to" field, we look for Next Lane
                    if (field == "to") {
                        // get next tasks.
                        var tasks = this.nextTasks(instance);

                        // if > 1 task => ERROR
                        if (tasks.length != 1) {
                            var msg =
                                "To field select 'next participant' but there are > 1 tasks";
                            this.log(instance, msg);
                            var Error = new Error(msg);
                            reject(Error);
                            return;
                        }

                        // if task in same lane ERROR
                        if (tasks[0].laneDiagramID == this.laneDiagramID) {
                            var msg =
                                "To field selected 'next participant' but next Task is in SAME lane.";
                            this.log(instance, msg);
                            var Error = new Error(msg);
                            reject(Error);
                            return;
                        }

                        myLane = this.process.elementForDiagramID(
                            tasks[0].laneDiagramID
                        );
                    } else {
                        // else "from" field: get current lane
                        myLane = this.process.elementForDiagramID(
                            this.laneDiagramID
                        );
                    }

                    if (!myLane) {
                        reject("could not find lane");
                    }

                    this.laneUserEmails(myLane)
                        .then((emails) => {
                            var data = {};
                            data[field] = emails;
                            this.stateUpdate(instance, data);
                            resolve();
                        })
                        .catch(reject);

                    break;

                case 1:
                    // specify a role/user account

                    // the logic for the users is handled in the
                    // ABProcessParticipant object.  So let's create a new
                    // object with our config values, and ask it for it's user
                    var tempLane = new ABProcessParticipant(
                        select,
                        this.process,
                        this.application
                    );
                    this.laneUserEmails(tempLane)
                        .then((emails) => {
                            var data = {};
                            data[field] = emails;
                            this.stateUpdate(instance, data);
                            resolve();
                        })
                        .catch(reject);
                    break;

                case 2:
                    // manually enter email(s)
                    var data = {};
                    data[field] = custom.split(",");
                    this.stateUpdate(instance, data);
                    resolve();
                    break;
            }
        });
    }

    resolveToAddresses(instance) {
        return this.resolveAddresses(
            instance,
            "to",
            this.to,
            this.toUsers,
            this.toCustom
        );
    }

    resolveFromAddresses(instance) {
        return this.resolveAddresses(
            instance,
            "from",
            this.from,
            this.fromUsers,
            this.fromCustom
        );
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
            tasks.push(this.resolveToAddresses(instance));
            tasks.push(this.resolveFromAddresses(instance));

            Promise.all(tasks)
                .then(() => {
                    var myState = this.myState(instance);
                    if (!Array.isArray(myState.to)) {
                        myState.to = [myState.to];
                    }
                    if (Array.isArray(myState.from)) {
                        myState.from = myState.from.shift();
                    }
                    var jobData = {
                        email: {
                            to: myState.to,
                            //    .to  {array}|{CSV list} of email addresses

                            from: myState.from,
                            //    .from {string} the From Email

                            subject: myState.subject,
                            //    .subject {string} The subject text of the email

                            html: mystate.message
                            //    .text {string|Buffer|Stream|attachment-like obj} plaintext version of the message
                            //    .html {string|Buffer|Stream|attachment-like obj} HTML version of the email.
                        }
                    };
                    client.send(
                        { type: "notification.email", param: jobData },
                        (err, results) => {
                            debugger;
                            if (err) {
                                // err objects are returned as simple {} not instances of {Error}
                                var error = new Error(
                                    `NotificationEmail responded with an error (${err.code})`
                                );
                                for (var v in err) {
                                    error[v] = err[v];
                                }
                                reject(error);
                                return;
                            }

                            this.stateCompleted(instance);
                            this.log(instance, "Email Sent successfully");
                            resolve(true);
                        }
                    );
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
            subject: this.subject,
            message: this.message
        };

        super.initState(context, myDefaults, val);
    }
};
