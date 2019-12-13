/**
 * ABProcessLane
 * manages a lane in a Process Diagram.
 *
 * Lanes manage users in the system, and provide a way to lookup a SiteUser.
 */
const path = require("path");
const ABProcessLaneCore = require(path.join(
    __dirname,
    "..",
    "..",
    "assets",
    "opstools",
    "AppBuilder",
    "classes",
    "ABProcessLaneCore.js"
));

module.exports = class ABProcessLane extends ABProcessLaneCore {
    constructor(attributes, process, application) {
        super(attributes, process, application);
    }

    ////
    //// Modeler Instance Methods
    ////

    //// TODO:
    //// this code should only be in ABProcessParticipant, however until we
    //// pull in CoreV2, we can't reference it properly on the server, so
    //// we copy it here.
    //// AFTER CoreV2 is integrated, remove this to api/classes/ABProcessParticipant

    users() {
        return new Promise((resolve, reject) => {
            var allLookups = [];
            allLookups.push(this.usersForRoles());
            allLookups.push(this.usersForAccounts());

            Promise.all(allLookups)
                .then((results) => {
                    var users = results[0].concat(results[1]);
                    resolve(users);
                })
                .catch(reject);
        });
    }

    usersForAccounts() {
        return new Promise((resolve, reject) => {
            if (!this.useAccount) {
                resolve([]);
                return;
            }
            if (!Array.isArray(this.account)) {
                this.account = [this.account];
            }

            SiteUser.find({ id: this.account })
                .then((listUsers) => {
                    resolve(listUsers);
                })
                .catch(reject);
        });
    }

    usersForRoles() {
        return new Promise((resolve, reject) => {
            if (!this.useRole) {
                resolve([]);
                return;
            }

            if (!Array.isArray(this.role)) {
                this.role = [this.role];
            }

            Permission.find({ role: this.role })
                .then((list) => {
                    var userIDs = {};
                    if (list) {
                        list.forEach((l) => {
                            userIDs[l.user] = l;
                        });
                    }
                    // convert to array of ids
                    userIDs = Object.keys(userIDs);

                    SiteUser.find({ id: userIDs })
                        .then((listUsers) => {
                            resolve(listUsers);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }
};
