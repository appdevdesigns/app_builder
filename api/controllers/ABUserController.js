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

      getRoles({ username, userdata: req.user.data })
         .catch(res.AD.error)
         .then((roles) => {
            res.AD.success(roles || []);
         });
   },

   // GET: /app_builder/user/myscopes
   getMyScopes: function(req, res) {
      const ROLE_OBJECT_ID = ABSystemObject.getObjectRoleId();
      const SCOPE_OBJECT_ID = ABSystemObject.getObjectScopeId();
      const RoleModel = ABObjectCache.get(ROLE_OBJECT_ID);
      const ScopeModel = ABObjectCache.get(SCOPE_OBJECT_ID);

      let username = req.user.data.username;

      Promise.resolve()
         .then(() => getRoles({ username, userdata: req.user.data }))
         .then((roles) => {
            let connectedField = ScopeModel.fields(
               (f) => (f.settings || {}).linkObject == ROLE_OBJECT_ID
            )[0];

            return ScopeModel.queryFind(
               {
                  where: {
                     glue: "and",
                     rules: [
                        {
                           key: connectedField.id,
                           rule: "contains",
                           value: (roles || []).map((r) => r[RoleModel.PK()])
                        }
                     ]
                  }
               },
               req.user.data
            );
         })
         .then((scopes) => {
            res.AD.success(scopes || []);
         })
         .catch(res.AD.error);
   }
};

function getRoles({ username, userdata }) {
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

   return RoleModel.queryFind(cond, userdata);
}
