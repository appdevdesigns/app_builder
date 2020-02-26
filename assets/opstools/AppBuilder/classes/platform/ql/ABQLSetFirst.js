/*
 * ABQLSetFirst
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const ABQL = require("./ABQL.js");

class ABQLSetFirst extends ABQL {
    constructor(attributes, prevOP, task, application) {
        super(attributes, prevOP, task, application);
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

ABQLSetFirst.key = "first";
ABQLSetFirst.option = ".first()";
ABQLSetFirst.option_begin = ".first(";
ABQLSetFirst.regEx = /\.first\(\)/;

ABQLSetFirst.NextQLOps = [];

module.exports = ABQLSetFirst;
