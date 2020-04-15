const ABModelBase = require("./ABModelBase");

module.exports = class ABRole extends ABModelBase {
   static get collectionName() {
      return "role";
   }

   static get relations() {
      return {
         applications: {
            edgeName: "applicationRole",
            linkCollection: "application",
            direction: this.relateDirection.INBOUND
         },

         scopes: {
            edgeName: "roleScope",
            linkCollection: "scope",
            direction: this.relateDirection.OUTBOUND
         },

         users: {
            edgeName: "roleUser",
            direction: this.relateDirection.OUTBOUND
         }
      };
   }
};
