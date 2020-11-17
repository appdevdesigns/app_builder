const ABObjectSystem = require("../classes/platform/ABObjectSystem");

const ABFieldString = require("../classes/platform/dataFields/ABFieldString");
const ABFieldLongText = require("../classes/platform/dataFields/ABFieldLongText");
const ABFieldConnect = require("../classes/platform/dataFields/ABFieldConnect");
const ABFieldUser = require("../classes/platform/dataFields/ABFieldUser");
const ABFieldJson = require("../classes/platform/dataFields/ABFieldJson");
const ABFieldBoolean = require("../classes/platform/dataFields/ABFieldBoolean");

module.exports = class ABObjectScope extends ABObjectSystem {
   constructor() {
      let attributes = {};
      attributes.id = ABSystemObject.getObjectScopeId();
      attributes.name = "SCOPE";
      attributes.tableName = "AB_SYSTEM_SCOPE";
      attributes.primaryColumnName = "uuid";

      super(attributes);
   }

   initFields() {
      // add fields
      this._fields = [];

      // role
      this._fields.push(
         new ABFieldConnect(
            {
               id: "e3670083-befb-4139-ae40-c375efe8da4e",
               label: "Roles",
               columnName: "roles",
               settings: {
                  linkObject: ABSystemObject.getObjectRoleId(),
                  linkType: "many",
                  linkViaType: "many",
                  linkColumn: "4585d5cb-0eea-461d-a326-61187c88520f",
                  isSource: 1
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

      // created by
      this._fields.push(
         new ABFieldUser(
            {
               label: "Created By",
               columnName: "createdBy",
               settings: {
                  isMultiple: 0,
                  isShowProfileImage: 0,
                  isCurrentUser: 1
               }
            },
            this
         )
      );

      // objectIds
      this._fields.push(
         new ABFieldJson(
            {
               label: "Objects",
               columnName: "objectIds"
            },
            this
         )
      );

      // filter
      this._fields.push(
         new ABFieldJson(
            {
               label: "Filter",
               columnName: "filter"
            },
            this
         )
      );

      // allowAll
      this._fields.push(
         new ABFieldBoolean(
            {
               label: "Allow All",
               columnName: "allowAll"
            },
            this
         )
      );
   }

   // /**
   //  * @method pullScopes
   //  *
   //  * @param {Object} options - {
   //  * 						username: {string},
   //  * 						objectIds: {array},
   //  * 						ignoreQueryId: {uuid}
   //  * 					}
   //  */
   // pullScopes(options = {}) {
   //    return new Promise((resolve, reject) => {
   //       let ABObjectRole = ABObjectCache.get(ABSystemObject.getObjectRoleId());
   //       // let ABObjectScope = ABObjectCache.get(SCOPE_OBJECT_ID);

   //       ABObjectRole.modelAPI()
   //          .findAll({
   //             where: {
   //                glue: "and",
   //                rules: [
   //                   {
   //                      key: "users",
   //                      rule: "contains",
   //                      value: options.username
   //                   }
   //                ]
   //             },
   //             populate: true
   //          })
   //          .catch(reject)
   //          .then((roles) => {
   //             let scopes = [];

   //             (roles || []).forEach((r) => {
   //                // Check user in role
   //                if (
   //                   !(r.users || []).filter(
   //                      (u) => (u.id || u) == options.username
   //                   )[0]
   //                )
   //                   return;

   //                (r.scopes__relation || []).forEach((sData) => {
   //                   if (
   //                      !scopes.filter(
   //                         (s) => (s.id || s.uuid) == (sData.id || sData.uuid)
   //                      )[0]
   //                   )
   //                      scopes.push(sData);
   //                });
   //             });

   //             // remove rules who has filter to query id
   //             if (options.ignoreQueryId) {
   //                (scopes || []).forEach((s) => {
   //                   if (
   //                      !s ||
   //                      !s.filter ||
   //                      !s.filter.rules ||
   //                      s.filter.rules.length < 1
   //                   )
   //                      return;

   //                   s.filter.rules.forEach((r, rIndex) => {
   //                      if (
   //                         r.rule &&
   //                         (r.rule == "in_query" ||
   //                            r.rule == "not_in_query" ||
   //                            r.rule == "in_query_field" ||
   //                            r.rule == "not_in_query_field") &&
   //                         (r.value || "").indexOf(options.ignoreQueryId) > -1
   //                      ) {
   //                         s.filter.rules.splice(rIndex, 1);
   //                      }
   //                   });
   //                });
   //             }

   //             resolve(scopes);
   //          });
   //    });
   // }
};
