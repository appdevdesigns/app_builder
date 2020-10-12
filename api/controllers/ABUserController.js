/**
 * ABUserController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
   // REST API: /app_builder/abuser
   _config: {
      model: "abuser", // all lowercase model name
      // actions: true,
      // shortcuts: true,
      rest: true
   },

   // GET: /app_builder/user/roles
   getRoles: function(req, res) {
      Permissions.getUserRoles(req, true)
         .fail(function(err) {
            res.AD.error(err);
         })
         .then(function(result) {
            res.AD.success(result);
         });

      // let username = req.user.username();

      // ABGraphRole.getRolesByUsername(username)
      // 	.catch(error => {
      // 		res.AD.error(error);
      // 	})
      // 	.then(roles => {

      // 		res.AD.success(roles || []);

      // 	});
   },

   // GET: /app_builder/user/list
   getUserList: function(req, res) {
      ABUser.find(
         {},
         {
            select: ["username", "image_id"]
         }
      )
         .fail(function(err) {
            res.AD.error(err);
         })
         .then(function(result) {
            res.AD.success(result || []);
         });
   },

   // GET: /app_builder/user/:user/roles
   getRoleScopes: function(req, res) {
      let username = req.param("user");

      const ROLE_OBJECT_ID = ABSystemObject.getObjectRoleId();
      const RoleModel = ABObjectCache.get(ROLE_OBJECT_ID);

      let cond = {
         where: {
            glue: "and",
            rules: [
               {
                  key: "users",
                  rule: "contains",
                  value: username
               }
            ]
         }
      };

      RoleModel.queryFind(cond, req.user.data)
         .then((roles) => {
            res.AD.success(roles || []);
         })
         .catch(res.AD.error);
   }
};
