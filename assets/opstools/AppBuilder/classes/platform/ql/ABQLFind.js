/*
 * ABQLFind
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const ABQL = require("./ABQL.js");
const moo = require("moo");
const NextQLOps = require("./ABQLSet.js");

var ParameterDefinitions = [
    {
        type: "objectConditions",
        name: "cond"
    }
];

class ABQLFind extends ABQL {
    constructor(attributes, prevOP, task, application) {
        super(attributes, ParameterDefinitions, prevOP, task, application);
    }

    ///
    /// Instance Methods
    ///
}

ABQLFind.key = "find";
ABQLFind.label = "find";
ABQLFind.uiIndentNext = 10;
ABQLFind.NextQLOps = NextQLOps;

module.exports = ABQLFind;
