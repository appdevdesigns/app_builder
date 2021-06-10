const ABScopeCore = require("../core/ABScopeCore");

const Model = OP.Model.get("opstools.BuildApp.ABRole");

module.exports = class ABScope extends ABScopeCore {
   constructor(values) {
      super(values);

      this.Model = Model;
   }

   fromValues(values = {}) {
      super.fromValues(values);

      // multilingual fields: name, description
      OP.Multilingual.translate(this, this, ["name", "description"]);
   }

   toObj() {
      OP.Multilingual.unTranslate(this, this, ["name", "description"]);

      return super.toObj();
   }

   save(role) {
      return this.id ? this.update(role) : this.create(role);
   }

   create(role) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .scopeCreate(this.toObj(), role ? role.id : null)
            .catch(reject)
            .then((data) => {
               if (data) resolve(new ABScope(data));
               else resolve();
            });
      });
   }

   update(role) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .scopeUpdate(this.toObj(), role ? role.id : null)
            .catch(reject)
            .then((data) => {
               if (data) resolve(new ABScope(data));
               else resolve();
            });
      });
   }

   destroy() {
      return this.Model.staticData.scopeDestroy(this.id);
   }

   static find(cond) {
      return new Promise((resolve, reject) => {
         Model.staticData
            .scopeFind(cond)
            .catch(reject)
            .then((scopes) => {
               var result = [];

               (scopes || []).forEach((s) => {
                  // prevent processing of null values.
                  if (s) {
                     result.push(new ABScope(s));
                  }
               });

               resolve(result);
            });
      });
   }
};
