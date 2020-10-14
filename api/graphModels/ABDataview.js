const ABModelBase = require("./ABModelBase");
const ABGraphQuery = require("./ABQuery");
const ABClassApplication = require("../classes/platform/ABApplication");
const ABDataCollection = require("../classes/platform/ABDataCollection");

class ABDataview extends ABModelBase {
   static get collectionName() {
      return "dataview";
   }

   static get relations() {
      return {
         applications: {
            edgeName: "applicationDataview",
            linkCollection: "application",
            direction: this.relateDirection.INBOUND
         },

         object: {
            edgeName: "dataviewObject",
            linkCollection: "object",
            direction: this.relateDirection.OUTBOUND
         },

         query: {
            edgeName: "dataviewQuery",
            linkCollection: "query",
            direction: this.relateDirection.OUTBOUND
         }
      };
   }

   /**
    * @method pullQueryDatasource
    *
    * @return {Promise}
    */
   pullQueryDatasource() {
      return new Promise((resolve, reject) => {
         this.settings = this.settings || {};

         let isQuery = JSON.parse(this.settings.isQuery || false);
         if (isQuery && (!this.query || !this.query[0])) {
            let queryID = this.settings.datasourceID;
            if (!queryID) return resolve(this);

            // Data source is query
            ABGraphQuery.findOne(queryID, {
               relations: ["objects"]
            })
               .catch(reject)
               .then((q) => {
                  if (q) this.query = [q];

                  resolve(this);
               });
         } else {
            // Data source is object
            return resolve(this);
         }
      });
   }

   toABClass(application) {
      // Mock ABApplication
      if (application == null) application = new ABClassApplication({});

      return new ABDataCollection(this, application);
   }
}

module.exports = ABDataview;
