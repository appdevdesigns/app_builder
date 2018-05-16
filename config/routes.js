/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    /* Application Objects */
    'put /app_builder/application/:appID/object':
        'app_builder/ABApplicationController.objectSave',

    'delete /app_builder/application/:appID/object/:id':
        'app_builder/ABApplicationController.objectDestroy',

    /* Application Pages */
    'put /app_builder/application/:appID/page':    
        'app_builder/ABApplicationController.pageSave',

    'delete /app_builder/application/:appID/page':
        'app_builder/ABApplicationController.pageDestroy',

    /* Application Queries */
    'put /app_builder/application/:appID/query':
        'app_builder/ABApplicationController.querySave',

    'delete /app_builder/application/:appID/query/:id':
        'app_builder/ABApplicationController.queryDestroy',

    /* Application permissions */
    'get /app_builder/user/roles':
        'app_builder/ABUserController.getRoles',

    'get /app_builder/:id/role':
        'app_builder/ABRoleController.getRoles',

    'post /app_builder/:id/role':
        'app_builder/ABRoleController.createRole',

    'delete /app_builder/:id/role':
        'app_builder/ABRoleController.deleteRole',

    'put /app_builder/:id/role/assign':
        'app_builder/ABRoleController.assignRole',
        
    /* Application page permissions */
    'get /app_builder/page/:action_key/role': 
        'app_builder/ABApplicationController.getPageRoles',
    'delete /app_builder/page/:action_key/role': 
        'app_builder/ABApplicationController.deletePageRoles',
    'put /app_builder/page/:action_key/role': 
        'app_builder/ABApplicationController.addPageRoles',

        
    /* Import & Export */
    'get /app_builder/appJSON/:id':
        'app_builder/ABApplicationController.jsonExport',
        
    'post /app_builder/appJSON':
        'app_builder/ABApplicationController.jsonImport',
    
    'get /app_builder/application/:appID/findModels':
        'app_builder/ABApplicationController.findModels',
    
    'post /app_builder/application/:appID/importModel':
        'app_builder/ABApplicationController.importModel',
    

    /* Migration Services */
    // app_builder/migrate/application/:appID/object/:objID
    // app_builder/migrate/application/:appID/object/:objID/field/:fieldID
    // post url   // create the object/field table info
    // put  url   // update the object/field table info
    // delete url // remove the object/field table info
    'post /app_builder/migrate/application/:appID/object/:objID' : 
        'app_builder/ABMigrationController.createObject',

    'delete /app_builder/migrate/application/:appID/object/:objID' : 
        'app_builder/ABMigrationController.dropObject',

    'post /app_builder/migrate/application/:appID/object/:objID/field/:fieldID' : 
        'app_builder/ABMigrationController.createField',

    'delete /app_builder/migrate/application/:appID/object/:objID/field/:fieldID' : 
        'app_builder/ABMigrationController.dropField',


    /* Model Services */
    // app_builder/model/application/:appID/object/:objID
    // get  url   // find   the object data
    // post url   // create the object data
    // put  url   // update the object data
    // delete url // remove the object data
    // put  url   // refresh object model
    'get /app_builder/model/application/:appID/object/:objID' : 
        'app_builder/ABModelController.find',

    'post /app_builder/model/application/:appID/object/:objID' : 
        'app_builder/ABModelController.create',

    'put /app_builder/model/application/:appID/object/:objID/:id' : 
        'app_builder/ABModelController.update',

    'delete /app_builder/model/application/:appID/object/:objID/:id' : 
        'app_builder/ABModelController.delete',

    'put /app_builder/model/application/:appID/refreshobject/:objID' : 
        'app_builder/ABModelController.refresh',
        

    /* Import External models */
    'get /app_builder/external/connections' : 
        'app_builder/ABExternalController.findDatabaseNames',

    'get /app_builder/external/application/:appID' : 
        'app_builder/ABExternalController.findTableNames',

    'get /app_builder/external/model/:tableName/columns' : 
        'app_builder/ABExternalController.findColumns',

    'post /app_builder/external/application/:appID/model/:tableName' : 
        'app_builder/ABExternalController.importTable',


// only for easy development/testing purposes:
'get /app_builder/migrate/application/:appID/object/:objID' : 
    'app_builder/ABMigrationController.createObject',

    // Email
    'post /app_builder/email' : 
        'app_builder/ABEmailController.send',




    /* Relay Settings */

    'get /app_builder/relay/users':
        'app_builder/ABRelayController.users',

    'get /app_builder/relay/uninitializedusers':
        'app_builder/ABRelayController.uninitializedUsers',

    'post /app_builder/relay/initialize':
        'app_builder/ABRelayController.initialize',

    'post /app_builder/relay/publishusers':
        'app_builder/ABRelayController.publishusers',

    'post /app_builder/QR/sendEmail':
        'app_builder/ABMobileQRController.sendEmail',

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

