// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()

const async = require("async");
const _ = require("lodash");
const path = require("path");
const ABProcessTaskEmailCore = require(path.join(
    __dirname,
    "..",
    "..",
    "..",
    "core",
    "process",
    "tasks",
    "ABProcessTaskEmailCore.js"
));

const ABProcessParticipant = require(path.join(
    __dirname,
    "..",
    "ABProcessParticipant"
));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessTaskEmail";

// const cote = require("cote");
// const client = new cote.Requester({
//     name: "ABProcessTaskEmail > emailer"
// });

module.exports = class ABProcessTaskEmail extends ABProcessTaskEmailCore {
    ////
    //// Process Instance Methods
    ////

    laneUserEmails(allLanes) {
        if (!Array.isArray(allLanes)) {
            allLanes = [allLanes];
        }

        return new Promise((resolve, reject) => {
            var emails = [];
            var missingEmails = [];
            async.each(
                allLanes,
                (myLane, cb) => {
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
                            cb();
                        })
                        .catch(cb);
                },
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (missingEmails.length > 0) {
                        var text = "These Accounts have missing emails: ";
                        text += missingEmails.join(", ");
                        var error = new Error(text);
                        error.accounts = missingEmails;
                        reject(error);
                    } else {
                        resolve(_.uniq(emails));
                    }
                }
            );
        });
    }

    resolveAddresses(instance, field, method, select, custom) {
        return new Promise((resolve, reject) => {
            method = parseInt(method);

            switch (method) {
                case 0:
                    // select by current/next lane

                    var myLanes = [];

                    // if "to" field, we look for Next Lane
                    if (field == "to") {
                        // get next tasks.
                        var tasks = this.nextTasks(instance);

                        // find any tasks that are NOT in my current Lane
                        tasks = tasks.filter((t) => {
                            return t.laneDiagramID != this.laneDiagramID;
                        });

                        // get the lanes associated with these tasks
                        tasks.forEach((t) => {
                            myLanes.push(
                                this.process.elementForDiagramID(
                                    tasks[0].laneDiagramID
                                )
                            );
                        });
                    } else {
                        // else "from" field: get current lane
                        myLanes.push(this.myLane());
                    }

                    if (myLanes.length == 0) {
                        var msg = `[${this.diagramID}].${field} == "${
                            field == "to" ? "Next" : "Current"
                        } Participant", but no lanes found.`;
                        var error = new Error(msg);
                        reject(error);
                        return;
                    }

                    this.laneUserEmails(myLanes)
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

                            html: myState.message
                            //    .text {string|Buffer|Stream|attachment-like obj} plaintext version of the message
                            //    .html {string|Buffer|Stream|attachment-like obj} HTML version of the email.
                        }
                    };

                    reqAB.serviceRequest(
                        "notification_email.email",
                        jobData,
                        (err, results) => {
                            debugger;
                            if (err) {
                                // err objects are returned as simple {} not instances of {Error}
                                var error = new Error(
                                    `NotificationEmail responded with an error (${err.code ||
                                        err.toString()})`
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

                    // client.send(
                    //     {
                    //         type: "notification.email",
                    //         param: jobData
                    //         // __timeout: 1000 * 60 * 2 // 2 min
                    //     },
                    //     (err, results) => {
                    //         debugger;
                    //         if (err) {
                    //             // err objects are returned as simple {} not instances of {Error}
                    //             var error = new Error(
                    //                 `NotificationEmail responded with an error (${err.code ||
                    //                     err.toString()})`
                    //             );
                    //             for (var v in err) {
                    //                 error[v] = err[v];
                    //             }
                    //             reject(error);
                    //             return;
                    //         }

                    //         this.stateCompleted(instance);
                    //         this.log(instance, "Email Sent successfully");
                    //         resolve(true);
                    //     }
                    // );
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    }
};
