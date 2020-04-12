const ABObjectSystem = require("../classes/platform/ABObjectSystem");

const ABFieldString = require("../classes/platform/dataFields/ABFieldString");
const ABFieldLongText = require("../classes/platform/dataFields/ABFieldLongText");
const ABFieldConnect = require("../classes/platform/dataFields/ABFieldConnect");
const ABFieldUser = require("../classes/platform/dataFields/ABFieldUser");

module.exports = class ABObjectRole extends ABObjectSystem {
   constructor() {
      let attributes = {};
      attributes.id = ABSystemObject.getObjectRoleId();
      attributes.name = "ROLE";
      attributes.tableName = "AB_SYSTEM_ROLE";
      attributes.primaryColumnName = "uuid";

      super(attributes);
   }

   initFields() {
      // add fields
      this._fields = [];

      // scope
      this._fields.push(
         new ABFieldConnect(
            {
               id: "4585d5cb-0eea-461d-a326-61187c88520f",
               label: "Scopes",
               columnName: "scopes",
               settings: {
                  linkObject: ABSystemObject.getObjectScopeId(),
                  linkType: "many",
                  linkViaType: "many",
                  linkColumn: "e3670083-befb-4139-ae40-c375efe8da4e",
                  isSource: 0
               }
            },
            this
         )
      );

      // name
      this._fields.push(
         new ABFieldString(
            {
               label: "Name",
               columnName: "name",
               settings: {
                  supportMultilingual: 1
               }
            },
            this
         )
      );

      // description
      this._fields.push(
         new ABFieldLongText(
            {
               label: "Description",
               columnName: "description",
               settings: {
                  supportMultilingual: 1
               }
            },
            this
         )
      );

      // user
      this._fields.push(
         new ABFieldUser(
            {
               label: "Users",
               columnName: "users",
               settings: {
                  isMultiple: 1,
                  isShowProfileImage: 0
               }
            },
            this
         )
      );
   }
};
