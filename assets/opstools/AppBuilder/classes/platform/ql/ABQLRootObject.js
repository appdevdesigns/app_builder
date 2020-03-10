/*
 * ABQLRootObject
 *
 * An ABQL defines a Query Language Operation. A QL Operation
 * is intended to be evaluated at run time and return a value that can be
 * assigned to form value or an object.
 *
 *
 */

const ABQLRootObjectCore = require("../../core/ql/ABQLRootObjectCore.js");

class ABQLObject extends ABQLRootObjectCore {
    // constructor(attributes, task, application) {
    //     // NOTE: keep this so we can insert the prevOp == null
    //     super(attributes, ParameterDefinitions, null, task, application);
    // }

    ///
    /// Instance Methods
    ///

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
}
ABQLObject.uiIndentNext = 10;

module.exports = ABQLObject;
