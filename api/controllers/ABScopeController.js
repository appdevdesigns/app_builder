/**
 * ABScopeController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ABModelController = require("./ABModelController");

function getScopeObject() {
   const SCOPE_OBJECT_ID = ABSystemObject.getObjectScopeId();
   return ABObjectCache.get(SCOPE_OBJECT_ID);
}

function getRolesField() {
   let objectScope = getScopeObject();
   if (!objectScope) return null;

   return objectScope.fields((f) => f.columnName == "roles")[0];
}

let ABScopeController = {
   // GET /app_builder/scope
   find: function(req, res) {
      let cond = req.body || {};
      let ScopeModel = ABSystemObject.getObjectScope();

      if (cond.populate == null) cond.populate = true;

      ScopeModel.modelAPI()
         .findAll(cond, req.user.data)
         .then((scopes) => {
            res.AD.success(scopes || []);
         })
         .catch(res.AD.error);
   },

   // GET /app_builder/scope/:id
   findOne: function(req, res) {
      let id = req.param("id");
      let ScopeModel = ABSystemObject.getObjectScope();

      return new Promise((resolve, reject) => {
         ScopeModel.queryFind(
            {
               where: {
                  glue: "and",
                  rules: [
                     {
                        key: ScopeModel.PK(),
                        rule: "equals",
                        value: id
                     }
                  ]
               },
               limit: 1,
               populate: true
            },
            req.user.data
         )
            .then((scope = []) => {
               if (res) res.AD.success(scope[0]);

               resolve(scope[0]);
            })
            .catch((err) => {
               if (res) res.AD.error(err);

               reject(err);
            });
      });
   },

   // GET /app_builder/scope/:id/roles
   scopeRole: function(req, res) {
      let scopeId = req.param("id");

      let RoleModel = ABSystemObject.getObjectRole();

      let connectedField = RoleModel.fields(
         (f) =>
            (f.settings || {}).linkObject == ABSystemObject.getObjectScopeId()
      )[0];
      if (!connectedField) {
         res.AD.success([]);
         return Promise.resolve([]);
      }

      let where = {
         glue: "and",
         rules: [
            {
               key: connectedField.id,
               rule: "equals",
               value: scopeId
            }
         ]
      };

      return RoleModel.modelAPI().findAll(
         {
            where: where
         },
         req.user.data
      );
   },

   // PUT /app_builder/scope
   save: function(req, res) {
      let roleID = req.query.roleID;
      if (roleID) req.body.roles = [roleID];

      req.params["objID"] = ABSystemObject.getObjectScopeId();

      if (!req.body.id) return ABModelController.create(req, res);
      else return ABModelController.update(req, res);
   },

   // DELETE /app_builder/scope/:id'
   destroy: function(req, res) {
      req.params["objID"] = ABSystemObject.getObjectScopeId();

      return ABModelController.delete(req, res);
   },

   // PUT /app_builder/role/:roleID/scope/:id'
   import: function(req, res) {
      let scopeObjectId = ABSystemObject.getObjectScopeId();
      req.params["objID"] = scopeObjectId;
      let roleID = req.param("roleID");

      Promise.resolve()
         // Pull the scope
         .then(() => ABScopeController.findOne(req))

         // Update roles data
         .then(
            (scope) =>
               new Promise((next, err) => {
                  if (!scope) return next();

                  // Get linked role field
                  let fieldRole = getRolesField();
                  if (!fieldRole) return next(scope);

                  // Pull roles
                  let roles = scope[fieldRole.relationName()] || [];
                  let exists = roles.find(
                     (r) => (r.uuid || r.id || r) == roleID
                  );

                  // Add new role
                  if (!exists) {
                     req.body.roles = roles || [];
                     req.body.roles.push(roleID);
                  }

                  next(scope);
               })
         )

         // Save
         .then(
            (scope) =>
               new Promise((next, err) => {
                  if (!scope) {
                     res.AD.success(null);
                     return next();
                  }

                  ABModelController.update(req, res);
                  next();
               })
         );
   },

   // DELETE /app_builder/role/:roleID/scope/:id'
   exclude: function(req, res) {
      let roleID = req.param("roleID");
      req.params["objID"] = ABSystemObject.getObjectScopeId();

      Promise.resolve()
         // Pull the scope
         .then(() => ABScopeController.findOne(req))

         // Update roles data
         .then(
            (scope) =>
               new Promise((next, err) => {
                  if (!scope) return next();

                  // Get linked role field
                  let fieldRole = getRolesField();
                  if (!fieldRole) return next(scope);

                  // Pull roles
                  let roles = scope[fieldRole.relationName()] || [];

                  // Remove role
                  req.body.roles = roles.filter(
                     (r) => (r.uuid || r.id || r) != roleID
                  );

                  next(scope);
               })
         )

         // Save
         .then(
            (scope) =>
               new Promise((next, err) => {
                  if (!scope) {
                     res.AD.success(null);
                     return next();
                  }

                  ABModelController.update(req, res);
                  next();
               })
         );
   }
};

module.exports = ABScopeController;
