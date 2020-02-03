/**
 * ABProcessController
 *
 * @description :: Server-side logic for managing our process apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessController.userInbox";

const async = require("async");

module.exports = {
    // get /process/inbox
    // retrieve the list of a users inbox notifications:
    userInbox: (req, res) => {
        var User = req.AD.user();
        var user = User.userModel.id;
        var roles = [];
        var inboxItems = null;

        async.series(
            [
                (done) => {
                    // lookup User's Roles:
                    Permission.find({ user })
                        .then((list) => {
                            if (list && list.length > 0) {
                                list.forEach((perm) => {
                                    console.log("user perm:", perm);
                                    roles.push(perm.role);
                                });
                            }
                            done();
                        })
                        .catch(done);
                },
                (done) => {
                    var jobData = {
                        roles,
                        users: [user]
                    };
                    reqAB.serviceRequest(
                        "process_manager.inbox.find",
                        jobData,
                        (err, results) => {
                            inboxItems = results;
                            done(err);
                        }
                    );
                }
            ],
            (err) => {
                if (err) {
                    console.error(
                        "Error gathering inbox items: " + err.toString()
                    );
                    res.AD.error(err);
                    return;
                }
                res.AD.success(inboxItems);
            }
        );
    }
};
