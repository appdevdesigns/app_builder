const ABApplication = require("./ABApplication");
const ABObject = require("./ABObject");

module.exports = class ABObjectSystem extends ABObject {
   constructor(attributes = {}, application) {
      // MOCK ABApplication
      // because it uses .fieldNew, .objectNew etc.
      if (!application) application = new ABApplication({});

      super(attributes, application);
   }

   ///
   /// Instance Methods
   ///

   fromValues(attributes) {
      super.fromValues(attributes);

      this.isSystemObject = true;
   }

   toObj() {
      let result = super.toObj();
      result.isSystemObject = true;

      return result;
   }

   // initFields() {
   //    this._fields = [];
   // }
};
