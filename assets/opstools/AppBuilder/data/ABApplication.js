// Namespacing conventions:
// OP.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
OP.Model.extend(
   "opstools.BuildApp.ABApplication",
   {
      useSockets: true,
      // restURL: '/app_builder/abapplication',
      restURL: "/app_builder/application",

      // ** Permissions

      assignPermissions(appId, permItems) {
         return OP.Comm.Service.put({
            url: `/app_builder/${appId}/role/assign`,
            data: {
               roles: permItems
            }
         });
      },

      getPermissions(appId) {
         return OP.Comm.Socket.get({ url: `/app_builder/${appId}/role` });
      },

      createPermission(appId) {
         return OP.Comm.Service.post({ url: `/app_builder/${appId}/role` });
      },

      deletePermission(appId) {
         return OP.Comm.Service.delete({ url: `/app_builder/${appId}/role` });
      },

      objectTrack: function(
         objectId = "",
         rowId = "",
         levelName = "",
         username = ""
      ) {
         return OP.Comm.Service.get({
            url: `/app_builder/object/${objectId}/track?rowId=${rowId}&levelName=${levelName}&username=${username}`
         });
      },

      // ** Mobile Apps

      /**
       * @method mobileAppSave
       *
       * @param {guid} appId
       * @param {object} app
       * @return {Promise}
       */
      mobileAppSave: function(appId, app) {
         return new Promise((resolve, reject) => {
            OP.Comm.Service.put(
               {
                  url: "/app_builder/application/" + appId + "/mobileApp",
                  data: {
                     data: app
                  }
               },
               function(err, result) {
                  if (err) reject(err);
                  else resolve(result);
               }
            );
         });
      },

      /**
       * @method mobileAppDestroy
       *
       * @param {guid} appId
       * @param {guid} mobileAppID
       * @return {Promise}
       */
      mobileAppDestroy: function(appId, mobileAppID) {
         return new Promise((resolve, reject) => {
            OP.Comm.Service.delete(
               {
                  url:
                     "/app_builder/application/" +
                     appId +
                     "/mobileApp/" +
                     mobileAppID
               },
               function(err, result) {
                  if (err) reject(err);
                  else resolve(result);
               }
            );
         });
      }
   },
   {
      // instance Methods
   }
);
