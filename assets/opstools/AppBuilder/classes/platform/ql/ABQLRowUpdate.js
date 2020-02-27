/*
 * ABQLRowUpdate
 *
 * An ABQLRow Update allows you to update the values on the current
 * Row of data.
 *
 */

const ABQL = require("./ABQL.js");
const ABQLRow = require("./ABQLRow.js");

class ABQLRowUpdate extends ABQL {
    constructor(attributes, prevOP, task, application) {
        super(attributes, [], prevOP, task, application);
    }

    ///
    /// Instance Methods
    ///

    /**
     * @method paramsFromQuery()
     * take the given queryString value and see if it matches our
     * possible parameter values.
     * we update ._suggestions based upon the current param state.
     * @param {string} queryString
     */
    paramsFromQuery(queryString) {
        this._suggestions = ".first()";
    }
}

ABQLRowUpdate.key = "update";
ABQLRowUpdate.option = ".update({values})";
ABQLRowUpdate.option_begin = ".update(";
ABQLRowUpdate.regEx = /\.update\((.*?\})\)/;
ABQLRowUpdate.NextQLOps = ABQLRow;

module.exports = ABQLRowUpdate;
