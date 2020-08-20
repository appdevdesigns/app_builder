const ABIndexCore = require("../core/ABIndexCore");

module.exports = class ABIndex extends ABIndexCore {
   constructor(attributes, object) {
      super(attributes, object);
   }

   /**
    * @method save()
    *
    * persist this instance of ABObject with it's parent ABApplication
    *
    *
    * @return {Promise}
    */
   save() {
      return super
         .save()
         .then(() => this.object.indexSave(this))
         .then(() => this.migrateCreate());
   }

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
      return new Promise((resolve, reject) => {
         if (this.id) {
            this.migrateDrop()
               .then(() => {
                  return super.destroy();
               })
               .then(() => this.object.indexRemove(this))
               .then(resolve)
               .catch(reject);
         } else {
            resolve();
         }
      });
   }

   ///
   /// DB Migrations
   ///

   migrateCreate() {
      let url = `/app_builder/migrate/object/${this.object.id}/index/${this.id}`;

      return OP.Comm.Service.post({
         url: url,
         data: this.toObj()
      });
   }

   migrateDrop() {
      let url = `/app_builder/migrate/object/${this.object.id}/index/${this.id}`;

      return OP.Comm.Service["delete"]({
         url: url
      });
   }
};
