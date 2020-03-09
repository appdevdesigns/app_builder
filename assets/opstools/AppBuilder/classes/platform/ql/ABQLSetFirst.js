/*
 * ABQLSetFirst
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const ABQL = require("./ABQL.js");
const ABQLRow = require("./ABQLRow.js");

class ABQLSetFirst extends ABQL {
    constructor(attributes, prevOP, task, application) {
        super(attributes, [], prevOP, task, application);
    }

    ///
    /// Instance Methods
    ///
}

ABQLSetFirst.key = "first";
ABQLSetFirst.label = "first";
ABQLSetFirst.uiIndentNext = 20;
ABQLSetFirst.NextQLOps = ABQLRow;

module.exports = ABQLSetFirst;
