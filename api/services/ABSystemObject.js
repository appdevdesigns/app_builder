const path = require("path");
const ABDefinition = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABDefinition"
));
const ABApplication = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABApplication"
));
const ABObject = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABObject"
));
var GenApplication = null;
// const ABRole = require("../systemObjects/role");
// const ABScope = require("../systemObjects/scope");

const ROLE_OBJECT_ID = "c33692f3-26b7-4af3-a02e-139fb519296d";
const SCOPE_OBJECT_ID = "af10e37c-9b3a-4dc6-a52a-85d52320b659";

module.exports = {
   initial: () => {
      return Promise.resolve();
   },

   getApplication: () => {
      if (!GenApplication) {
         GenApplication = new ABApplication({});
      }
      return GenApplication;
   },

   getObjectRoleId: () => {
      return ROLE_OBJECT_ID;
   },

   getObject: (id) => {
      let obj = ABObjectCache.get(id);
      if (obj) {
         return obj;
      } else {
         var def = ABDefinition.definition(id);
         if (def) {
            return new ABObject(def, GenApplication);
         }
         return null;
      }
   },

   getObjectRole: () => {
      return ABSystemObject.getObject(ROLE_OBJECT_ID);
   },

   getObjectScopeId: () => {
      return SCOPE_OBJECT_ID;
   },

   getObjectScope: () => {
      return ABSystemObject.getObject(SCOPE_OBJECT_ID);
   }
};
