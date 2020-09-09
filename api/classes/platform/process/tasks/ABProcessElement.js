// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessElementCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessElementCore.js"
));

module.exports = class ABProcessTask extends ABProcessElementCore {
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
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *        the array of ids to store our relevant .ids into
    */
   exportIDs(ids) {
      ids.push(this.id);
   }

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
      //// moved to ABProcessElementCore, and our ABDefinition.save() can take
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

   ////
   //// Process Instance Methods
   ////

   /**
    * onError()
    * perform these actions on an Error.
    * @param {obj} instance  the instance we are working with.
    * @param {Error} error  the error object received.
    */
   onError(instance, error) {
      super.onError(instance, error);

      var text = `ProcessTask Error: ${this.key} : ${error.toString()}`;
      ADCore.error.log(text, { instance: instance, error: error });
   }
};
