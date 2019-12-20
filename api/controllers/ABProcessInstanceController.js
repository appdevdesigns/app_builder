/**
 * ABProcessInstanceController
 *
 * @description :: Server-side logic for managing Process instances
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require("path");

module.exports = {
    _config: {
        model: "abprocessinstance", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    }
};
