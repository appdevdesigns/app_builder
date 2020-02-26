/*
 * ABQL
 *
 * An ABQL defines a Query Language Operation. A QL Operation
 * is intended to be evaluated at run time and return a value that can be
 * assigned to form value or an object.
 *
 *
 */
const QLFind = require("./ABQLFind.js");

const ABQL = require("./ABQL.js");

var NextQLOps = [QLFind];

class ABQLObject extends ABQL {
    constructor(attributes, task, application) {
        // NOTE: keep this so we can insert the prevOp == null
        super(attributes, null, task, application);
    }

    ///
    /// Instance Methods
    ///

    // fromAttributes(attributes) {
    // 	// set the object value before continuing on to super()
    //     super.fromAttributes(attributes);
    // }

    /// ABApplication data methods

    paramsValid() {
        var foundObj = this.objectLookup();
        this.object = foundObj;
        if (foundObj) return true;
        else return false;
    }

    /**
     * @method paramsFromQuery()
     * take the given queryString value and see if it matches our
     * possible parameter values.
     * we update ._suggestions based upon the current param state.
     * @param {string} queryString
     */
    paramsFromQuery(queryString) {
        // return suggestions for our parameters
        var suggestions = [];
        var objects = this.application.objects((o) => {
            var quotedLabel = `"${o.label}"`;
            return (
                queryString.length == 0 || quotedLabel.indexOf(queryString) == 0
            );
        });
        objects.forEach((o) => {
            suggestions.push(`"${o.label}"`);
        });
        this._suggestions = suggestions.join("\n");
    }
}
ABQLObject.key = "object";
ABQLObject.option = "$O([objectName])";
ABQLObject.option_begin = "$O(";
ABQLObject.regEx = /\$O\(([\w,\d,\s,"]+)\)/;
ABQLObject.NextQLOps = [QLFind];

module.exports = ABQLObject;
