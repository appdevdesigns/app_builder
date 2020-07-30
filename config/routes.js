/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */

module.exports = {
   /* Scopes */
   "get /app_builder/scope": "app_builder/ABScopeController.find",

   "get /app_builder/scope/:id": "app_builder/ABScopeController.findOne",

   "get /app_builder/scope/:id/roles":
      "app_builder/ABScopeController.scopeRole",

   "put /app_builder/scope": "app_builder/ABScopeController.save",

   "delete /app_builder/scope/:id": "app_builder/ABScopeController.destroy",

   "put /app_builder/role/:roleID/scope/:id":
      "app_builder/ABScopeController.import",

   "delete /app_builder/role/:roleID/scope/:id":
      "app_builder/ABScopeController.exclude",

   /* Users */
   "get /app_builder/user/list": "app_builder/ABUserController.getUserList",

   "get /app_builder/user/:user/roles":
      "app_builder/ABUserController.getRoleScopes",

   /* Roles */
   "get /app_builder/role": "app_builder/ABRoleController.find",

   "get /app_builder/role/:id": "app_builder/ABRoleController.findOne",

   "put /app_builder/role": "app_builder/ABRoleController.save",

   "delete /app_builder/role/:id": "app_builder/ABRoleController.destroy",

   "get /app_builder/role/:id/scope": "app_builder/ABRoleController.roleScope",

   "get /app_builder/role/:id/users": "app_builder/ABRoleController.roleUsers",

   "post /app_builder/role/:id/username/:username":
      "app_builder/ABRoleController.addUser",

   "delete /app_builder/role/:id/username/:username":
      "app_builder/ABRoleController.removeUser",

   /* Application permissions */
   "get /app_builder/user/roles": "app_builder/ABUserController.getRoles",

   "get /app_builder/:id/role": "app_builder/ABRoleController.getRoles",

   "post /app_builder/:id/role": "app_builder/ABRoleController.createRole",

   "delete /app_builder/:id/role": "app_builder/ABRoleController.deleteRole",

   "put /app_builder/:id/role/assign":
      "app_builder/ABRoleController.assignRole",

   /* Application page permissions */
   "get /app_builder/page/:action_key/role":
      "app_builder/ABApplicationController.getPageRoles",
   "delete /app_builder/page/:action_key/role":
      "app_builder/ABApplicationController.deletePageRoles",
   "put /app_builder/page/:action_key/role":
      "app_builder/ABApplicationController.addPageRoles",

   /* Live display */

   /* Import & Export */
   "get /app_builder/appJSON/:id":
      "app_builder/ABApplicationController.jsonExport",

   "post /app_builder/appJSON":
      "app_builder/ABApplicationController.jsonImport",

   /* Migration Services */
   // app_builder/migrate/object/:objID
   // app_builder/migrate/object/:objID/field/:fieldID
   // post url   // create the object/field table info
   // put  url   // update the object/field table info
   // delete url // remove the object/field table info
   "post /app_builder/migrate/object/:objID":
      "app_builder/ABMigrationController.createObject",

   "delete /app_builder/migrate/object/:objID":
      "app_builder/ABMigrationController.dropObject",

   "post /app_builder/migrate/object/:objID/field/:fieldID":
      "app_builder/ABMigrationController.createField",

   "put /app_builder/migrate/object/:objID/field/:fieldID":
      "app_builder/ABMigrationController.updateField",

   "delete /app_builder/migrate/object/:objID/field/:fieldID":
      "app_builder/ABMigrationController.dropField",

   /* Model Services */
   // app_builder/model/application/:appID/object/:objID
   // get  url   // find   the object data
   // post url   // create the object data
   // put  url   // update the object data
   // delete url // remove the object data
   // put  url   // refresh object model
   "get /app_builder/model/application/:appID/object/:objID":
      "app_builder/ABModelController.find",

   "post /app_builder/model/application/:appID/object/:objID":
      "app_builder/ABModelController.create",

   "post /app_builder/model/application/:appID/object/:objID/batch":
      "app_builder/ABModelController.batchCreate",

   "put /app_builder/model/application/:appID/object/:objID/:id":
      "app_builder/ABModelController.update",

   "put /app_builder/model/application/:appID/object/:objID":
      "app_builder/ABModelController.upsert",

   "delete /app_builder/model/application/:appID/object/:objID/:id":
      "app_builder/ABModelController.delete",

   "put /app_builder/model/application/:appID/refreshobject/:objID":
      "app_builder/ABModelController.refresh",

   "get /app_builder/model/application/:appID/count/:objID":
      "app_builder/ABModelController.count",

   /* Import External models */
   "get /app_builder/external/connections":
      "app_builder/ABExternalController.findDatabaseNames",

   "get /app_builder/external/application/:appID":
      "app_builder/ABExternalController.findTableNames",

   "get /app_builder/external/model/:tableName/columns":
      "app_builder/ABExternalController.findColumns",

   "post /app_builder/external/application/:appID/model/:tableName":
      "app_builder/ABExternalController.importTable",

   // only for easy development/testing purposes:
   "get /app_builder/migrate/application/:appID/object/:objID":
      "app_builder/ABMigrationController.createObject",

   // Email
   "post /app_builder/email": "app_builder/ABEmailController.send",

   /* Relay Settings */

   "get /app_builder/relay/users": "app_builder/ABRelayController.users",

   "get /app_builder/relay/uninitializedusers":
      "app_builder/ABRelayController.uninitializedUsers",

   "post /app_builder/relay/initialize":
      "app_builder/ABRelayController.initialize",

   "post /app_builder/relay/publishusers":
      "app_builder/ABRelayController.publishusers",

   "get /app_builder/mobile/apps":
      "app_builder/ABApplicationController.listMobileApps",

   "post /app_builder/QR/sendEmail":
      "app_builder/ABMobileQRController.sendEmail",

   "post /app_builder/QR/adminQRCode":
      "app_builder/ABMobileQRController.adminQRCode",

   "get /app_builder/qr/user-qr-code":
      "app_builder/ABMobileQRController.userQRCode",

   "get /app_builder/mobile/:mobileID/apk":
      "app_builder/ABMobileQRController.sendAPK",

   /* Event Specific URLs */

   "post /app_builder/Event/sendConfirmationEmail":
      "app_builder/ABEventController.sendRegistrationConfirmation",

   "get /events/confirm/:regID/:isConfirmed":
      "app_builder/ABEventController.receiveRegistrationConfirmationResponse",

   "post /app_builder/Event/sendFeeConfirmationEmail":
      "app_builder/ABEventController.sendFeeConfirmation",

   "get /events/feeconfirm/:regID/:isConfirmed":
      "app_builder/ABEventController.receiveFeeConfirmationResponse",

   /* Process Manager Related URLs */
   // these are primarily for testing right now:
   "get /process/trigger/:key": "app_builder/ABTriggerController.trigger",

   // ---> initiates a "trigger" that can spawn a new process
   "post /app_builder/abprocessinstance/reset":
      "app_builder/ABProcessInstanceController.resetInstance",
   // ---> initiates a "reset" on a process instance to retry after an Error

   "get /process/inbox": "app_builder/ABProcessController.userInbox",
   "post /process/inbox/:uuid":
      "app_builder/ABProcessController.userInboxUpdate"

   /*

  '/': {
    view: 'user/signup'
  },
  '/': 'app_builder/PluginController.inbox',
  '/': {
    controller: 'app_builder/PluginController',
    action: 'inbox'
  },
  'post /signup': 'app_builder/PluginController.signup',
  'get /*(^.*)' : 'app_builder/PluginController.profile'

  */
};
