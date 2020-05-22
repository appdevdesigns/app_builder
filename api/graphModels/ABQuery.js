var path = require("path");

const ABClassApplication = require(path.join(
   "..",
   "classes",
   "platform",
   "ABApplication"
));
const ABModelBase = require("./ABModelBase");
const ABObjectQuery = require(path.join(
   "..",
   "classes",
   "platform",
   "ABObjectQuery"
));

module.exports = class ABQuery extends ABModelBase {
   static get collectionName() {
      return "query";
   }

   static get relations() {
      return {
         applications: {
            edgeName: "applicationQuery",
            linkCollection: "application",
            direction: this.relateDirection.INBOUND
         },

         objects: {
            edgeName: "queryObject",
            linkCollection: "object",
            direction: this.relateDirection.OUTBOUND
         },

         dataviews: {
            edgeName: "dataviewQuery",
            linkCollection: "dataview",
            direction: this.relateDirection.INBOUND
         }
      };
   }

   toABClass() {
      // NOTE: Mock ABApplication and pass it into objects
      // because ABObjectCore needs to use .application
      let application = new ABClassApplication({});

      return new ABObjectQuery(this, application);
   }

   static afterCreate(newRecord) {
      // Cache in .constructor of ABClassObject
      newRecord.toABClass();
   }

   static afterUpdate(updatedRecord) {
      // Cache in .constructor of ABClassObject
      updatedRecord.toABClass();

      this.findOne(updatedRecord.id, {
         relations: ["objects"]
      }).then((query) => {
         // Broadcast
         if (query) {
            sails.sockets.broadcast(query.id, "ab.query.update", {
               queryId: query.id,
               data: query
            });
         }
      });
   }
};
