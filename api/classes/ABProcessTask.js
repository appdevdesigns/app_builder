// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessTaskCore = require(path.join(
    __dirname,
    "..",
    "..",
    "assets",
    "opstools",
    "AppBuilder",
    "classes",
    "processTasks",
    "ABProcessTaskCore.js"
));

module.exports = class ABProcessTask extends ABProcessTaskCore {
    constructor(attributes, process, application, defaultValues) {
        super(attributes, process, application, defaultValues);

        // listen
    }

    ///
    /// Static Methods
    ///
    /// Available to the Class level object.  These methods are not dependent
    /// on the instance values of the Application.
    ///

    /**
     * @method save()
     *
     * persist this instance of ABObject with it's parent ABApplication
     *
     *
     * @return {Promise}
     *						.resolve( {this} )
     */
    save() {
        ////
        //// TODO: once our core conversion is complete, this .save() can be
        //// moved to ABProcessTaskCore, and our ABDefinition.save() can take
        //// care of the proper method to save depending on the current Platform.
        ////
        // return this.toDefinition()
        //     .save()
        //     .then((data) => {
        //         // if I didn't have an .id then this was a create()
        //         // and I need to update my data with the generated .id

        //         if (!this.id) {
        //             this.id = data.id;
        //         }
        //     });

        //// Until then:
        var def = this.toDefinition().toObj();
        if (def.id) {
            // here ABDefinition is our sails.model()
            return ABDefinition.update(def.id, def);
        } else {
            return ABDefinition.create(def).then((data) => {
                this.id = data.id;
                return this.process.save();
            });
        }
    }

    isValid() {
        /*
        var validator = OP.Validation.validator();

        // label/name must be unique:
        var isNameUnique =
            this.application.processes((o) => {
                return o.name.toLowerCase() == this.name.toLowerCase();
            }).length == 0;
        if (!isNameUnique) {
            validator.addError(
                "name",
                L(
                    "ab.validation.object.name.unique",
                    `Process name must be unique ("${this.name}"" already used in this Application)`
                )
            );
        }

        return validator;
        */

        var isValid =
            this.application.processes((o) => {
                return o.name.toLowerCase() == this.name.toLowerCase();
            }).length == 0;
        return isValid;
    }
};
