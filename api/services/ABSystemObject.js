const ABGraphObject = require("../graphModels/ABObject");

const ABRole = require("../systemObjects/role");
const ABScope = require("../systemObjects/scope");

module.exports = {
   initial: () => {
      let systemObjList = [new ABRole(), new ABScope()];

      let tasks = [];

      systemObjList.forEach((obj) => {
         tasks.push(() => ABMigration.createObject(obj)); // Create MySQL table without columns
         tasks.push(
            () =>
               new Promise((next, err) => {
                  // Populate fields
                  obj.initFields();
                  ABObjectCache.cache(obj);
                  next();
               })
         );
         tasks.push(() => ABGraphObject.upsert(obj.id, obj.toObj())); // Save JSON
      });

      // Create Fields
      // NOTE: this is final step to create columns in the tables
      systemObjList.forEach((obj) => {
         tasks.push(() => {
            obj.fields().forEach((f) => {
               tasks.push(ABMigration.createField(f));
            });
         });
      });

      return tasks.reduce((promiseChain, currTask) => {
         return promiseChain.then(currTask);
      }, Promise.resolve([]));
   },

   getObjectRoleId: () => {
      const ROLE_OBJECT_ID = "c33692f3-26b7-4af3-a02e-139fb519296d";
      return ROLE_OBJECT_ID;
   },

   getObjectRole: () => {
      const ROLE_OBJECT_ID = ABSystemObject.getObjectRoleId();

      let obj = ABObjectCache.get(ROLE_OBJECT_ID);
      if (obj) {
         let result = new ABScope(obj.toObj());
         result.initFields();
         return result;
      } else {
         return null;
      }
   },

   getObjectScopeId: () => {
      const SCOPE_OBJECT_ID = "af10e37c-9b3a-4dc6-a52a-85d52320b659";
      return SCOPE_OBJECT_ID;
   },

   getObjectScope: () => {
      const SCOPE_OBJECT_ID = ABSystemObject.getObjectScopeId();

      let obj = ABObjectCache.get(SCOPE_OBJECT_ID);
      if (obj) {
         let result = new ABScope(obj.toObj());
         result.initFields();
         return result;
      } else {
         return null;
      }
   }
};
