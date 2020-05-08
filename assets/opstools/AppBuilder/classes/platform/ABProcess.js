const ABProcessCore = require("../core/ABProcessCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcess extends ABProcessCore {
   constructor(attributes, application) {
      super(attributes, application);

      // listen
      AD.comm.hub.subscribe("ab.abprocess.update", (msg, data) => {
         if (this.id == data.objectId) this.fromValues(data.data);
      });
   }

   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   // /**
   //  * @method loadAll()
   //  *
   //  * load all the Definitions for The current AppBuilder:
   //  *
   //  * @return {array}
   //  */
   // static loadAll() {
   //     return OP.Comm.Socket.get({
   //         url: `/app_builder/abdefinition`
   //     }).then((allDefinitions) => {
   //         (allDefinitions || []).forEach((def) => {
   //             __AllDefinitions[def.id] = def;
   //         });
   //     });
   // }

   /// ABApplication data methods

   /**
    * @method destroy()
    *
    * destroy the current instance of ABObject
    *
    * also remove it from our parent application
    *
    * @return {Promise}
    */
   destroy() {
      // remove all my Elements
      var allElements = this.elements();
      var allDestroy = [];
      allElements.forEach((e) => {
         allDestroy.push(e.destroy());
      });

      return Promise.all(allDestroy).then(() => {
         // now remove myself
         return new Promise((resolve, reject) => {
            this.toDefinition()
               .destroy()
               // .then(()=>{
               // 	return this.application.processRemove(this)
               // })
               .catch((err) => {
                  reject(err);
               })
               .then(() => {
                  // allow normal processing to contine now:
                  resolve();
               })
               .then(() => {
                  // in the background
                  // remove this reference from ALL Applications that link
                  // to me:
                  this.application.constructor
                     .allCurrentApplications()
                     .then((apps) => {
                        var appsWithProcess = apps.find((a) => {
                           return a.hasProcess(this);
                        });
                        if (appsWithProcess.length > 0) {
                           appsWithProcess.forEach((removeMe) => {
                              console.log(
                                 " ABProcess.destroy():additional Apps:" +
                                    removeMe.label
                              );
                              removeMe.processRemove(this);
                           });
                        }
                     });
               });
         });
      });
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
      // if this is an update:
      // if (this.id) {
      // 	return ABDefinition.update(this.id, this.toDefinition());
      // } else {

      // 	return ABDefinition.create(this.toDefinition());
      // }

      // make sure all our tasks have save()ed.
      var allSaves = [];
      var allTasks = this.elements();
      allTasks.forEach((t) => {
         allSaves.push(t.save());
      });
      return Promise.all(allSaves).then(() => {
         // now we can save our Process definition
         return this.toDefinition()
            .save()
            .then((data) => {
               // if I didn't have an .id then this was a create()
               // and I need to update my data with the generated .id

               if (!this.id) {
                  this.id = data.id;
               }

               // Also, our embedded elements now all have .ids
               // where they might not have before.  So now
               // rebuild our this._elements hash with all id
               var _new = {};
               Object.keys(this._elements).forEach((k) => {
                  _new[this._elements[k].id] = this._elements[k];
               });
               this._elements = _new;
            });
      });
   }

   isValid() {
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
   }

   /**
    * @method elementNewForModelDefinition()
    * create a new process element defined by the given BPMN:Element
    *
    * the BPMN:Element definition comes from the BPMN Modeler when a new
    * diagram element is created.
    *
    * @param {BPMN:Element} element
    *        the BPMN modeler diagram element definition
    * @return {ABProcess[OBJ]}
    */
   elementNewForModelDefinition(element) {
      var task = this.application.processElementNewForModelDefinition(
         element,
         this
      );
      if (task) {
         this.elementAdd(task);
      }
      return task;
   }
};
