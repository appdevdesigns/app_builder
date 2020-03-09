/*
 * ABQLRowUpdate
 *
 * An ABQLRow Update allows you to update the values on the current
 * Row of data.
 *
 */

const ABQL = require("./ABQL.js");
const ABQLRow = require("./ABQLRow.js");

var ParameterDefinitions = [
    {
        type: "objectValues",
        name: "values"
    }
];

class ABQLRowUpdate extends ABQL {
    constructor(attributes, prevOP, task, application) {
        super(attributes, ParameterDefinitions, prevOP, task, application);

        // #Hack! : when an Operation provides the same .NextQlOps that it
        // was defined in, we can't require it again ==> circular dependency.
        // so we manually set it here from the operation that created us:
        this.constructor.NextQLOps = prevOP.constructor.NextQLOps;
    }

    ///
    /// Instance Methods
    ///
}

ABQLRowUpdate.key = "update";
ABQLRowUpdate.label = "update record";
ABQLRowUpdate.uiIndentNext = 20;
ABQLRowUpdate.NextQLOps = [];

module.exports = ABQLRowUpdate;
