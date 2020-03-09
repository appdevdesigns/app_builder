/*
 * ABQLRootObject
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

var ParameterDefinitions = [
    {
        type: "objectName",
        name: "name"
    }
];

class ABQLObject extends ABQL {
    constructor(attributes, task, application) {
        // NOTE: keep this so we can insert the prevOp == null
        super(attributes, ParameterDefinitions, null, task, application);
    }

    ///
    /// Instance Methods
    ///
    fromAttributes(attributes) {
        super.fromAttributes(attributes);

        if (!this.object && this.params) {
            var objNameDef = this.parameterDefinitions.find((pDef) => {
                return pDef.type == "objectName";
            });
            if (objNameDef) {
                this.objectID = this.params[objNameDef.name];
                this.object = this.objectLookup(this.objectID);
            }
        }
    }

    toObj() {
        var obj = super.toObj();

        // if we don't have an objectID, but we have an objectName parameter
        // definition then save that as our objectID
        if (!obj.objectID && this.params) {
            var objNameDef = this.parameterDefinitions.find((pDef) => {
                return pDef.type == "objectName";
            });
            if (objNameDef) {
                obj.objectID = this.params[objNameDef.name];
            }
        }
        return obj;
    }

    /*
     * @method paramChanged()
     * respond to an update to the given parameter.
     * NOTE: the value will ALREADY be saved in this.params[pDef.name].
     * @param {obj} pDef
     *        the this.parameterDefinition entry of the parameter that was
     *        changed.
     */
    paramChanged(pDef) {
        if (pDef.name == "name") {
            this.objectID = this.params[pDef.name];
            this.object = this.objectLookup(this.objectID);

            // ?? is this correct?
            // if we already have created a .next operation, and we have
            // just changed our .object, pass that information forward.
            if (this.next) {
                this.next.object = this.object;
            }
        }
    }

    /// ABApplication data methods

    // paramsValid(queryString) {
    //     if (super.paramsValid(queryString)) {
    //         this.object = this.objectLookup(this.params["name"]);
    //         return true;
    //     }
    //     return false;
    // }
}
ABQLObject.key = "object";
ABQLObject.label = "object";
ABQLObject.uiIndentNext = 10;
ABQLObject.NextQLOps = [QLFind];

module.exports = ABQLObject;
