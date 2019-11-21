/**
 * ABDefinitionController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require("path");

module.exports = {
    // get /process/trigger/:key
    // a signal from a client specifying an event happened.
    trigger: (req, res) => {
        // a MicroService would be started like so:
        // client.send({ type: "file.upload", param: jobData }, (err, results) => {
        //     serviceResponse = results;
        //     next(err);
        // });

        // For now: pass off to our process service:
        var inputs = req.allParams();
        console.log("key:" + inputs.key);
        ABProcess.trigger(inputs.key, inputs).then((count) => {
            res.AD.success({ triggered: count });
        });
    }
};
