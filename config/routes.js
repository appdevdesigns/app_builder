/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    /* Application Info */
    'get /app_builder/application':
        'app_builder/ABApplicationController.find',

    'get /app_builder/application/info':
        'app_builder/ABApplicationController.applicationInfo',

    'get /app_builder/application/:appID':
        'app_builder/ABApplicationController.findOne',

    'post /app_builder/application':
        'app_builder/ABApplicationController.applicationCreate',

    'put /app_builder/application/:appID':
        'app_builder/ABApplicationController.applicationUpdate',

    'delete /app_builder/application/:appID':
        'app_builder/ABApplicationController.applicationRemove',

    'put /app_builder/application/:appID/info':
        'app_builder/ABApplicationController.applicationSave',

    /* Objects */
    'get /app_builder/application/:appID/object':
        'app_builder/ABObjectController.objectApplication',

    'get /app_builder/object':
        'app_builder/ABObjectController.objectFind',

    'get /app_builder/object/info':
        'app_builder/ABObjectController.objectInfo',

    'get /app_builder/object/:objectId':
        'app_builder/ABObjectController.objectFindOne',

    'put /app_builder/object':
        'app_builder/ABObjectController.objectSave',

    'delete /app_builder/object/:objectId':
        'app_builder/ABObjectController.objectDestroy',

    'put /app_builder/application/:appID/object/:objID':
        'app_builder/ABObjectController.importObject',

    'delete /app_builder/application/:appID/object/:objID':
        'app_builder/ABObjectController.excludeObject',

    /* Application Pages */
    'put /app_builder/application/:appID/page':
        'app_builder/ABApplicationController.pageSave',

    'delete /app_builder/application/:appID/page':
        'app_builder/ABApplicationController.pageDestroy',


    /* Queries */
    'get /app_builder/application/:appID/query':
        'app_builder/ABQueryController.queryApplication',

    'get /app_builder/query':
        'app_builder/ABQueryController.queryFind',

    'get /app_builder/query/info':
        'app_builder/ABQueryController.queryInfo',

    'get /app_builder/query/:queryID':
        'app_builder/ABQueryController.queryFindOne',

    'put /app_builder/query':
        'app_builder/ABQueryController.querySave',

    'delete /app_builder/query/:queryID':
        'app_builder/ABQueryController.queryDestroy',

    'put /app_builder/application/:appID/query/:queryID':
        'app_builder/ABQueryController.importQuery',

    'delete /app_builder/application/:appID/query/:queryID':
        'app_builder/ABQueryController.excludeQuery',


    /* Data views */
    'get /app_builder/application/:appID/dataview':
        'app_builder/ABDataviewController.dataviewApplication',

    'get /app_builder/dataview':
        'app_builder/ABDataviewController.dataviewFind',

    'get /app_builder/dataview/info':
        'app_builder/ABDataviewController.dataviewInfo',

    'get /app_builder/dataview/:dataviewId':
        'app_builder/ABDataviewController.dataviewFindOne',

    'put /app_builder/dataview':
        'app_builder/ABDataviewController.dataviewSave',

    'delete /app_builder/dataview/:dataviewId':
        'app_builder/ABDataviewController.dataviewDestroy',

    'put /app_builder/application/:appID/dataview/:dataviewID':
        'app_builder/ABDataviewController.importDataview',

    'delete /app_builder/application/:appID/dataview/:dataviewID':
        'app_builder/ABDataviewController.excludeDataview',


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

    // 'get /app_builder/application/:appID/findModels':
    //     'app_builder/ABApplicationController.findModels',
    
    // 'post /app_builder/application/:appID/importModel':
    //     'app_builder/ABApplicationController.importModel',

    /* Migration Services */
    // app_builder/migrate/object/:objID
    // app_builder/migrate/object/:objID/field/:fieldID
    // post url   // create the object/field table info
    // put  url   // update the object/field table info
    // delete url // remove the object/field table info
    'post /app_builder/migrate/object/:objID' : 
        'app_builder/ABMigrationController.createObject',

    'delete /app_builder/migrate/object/:objID' : 
        'app_builder/ABMigrationController.dropObject',

    'post /app_builder/migrate/object/:objID/field/:fieldID' : 
        'app_builder/ABMigrationController.createField',

    'put /app_builder/migrate/object/:objID/field/:fieldID' :
        'app_builder/ABMigrationController.updateField',

    'delete /app_builder/migrate/object/:objID/field/:fieldID' :
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

    'put /app_builder/model/application/:appID/object/:objID' :
        'app_builder/ABModelController.upsert',

    'delete /app_builder/model/application/:appID/object/:objID/:id' : 
        'app_builder/ABModelController.delete',

    'put /app_builder/model/application/:appID/refreshobject/:objID' : 
        'app_builder/ABModelController.refresh',

    'get /app_builder/model/application/:appID/count/:objID' : 
        'app_builder/ABModelController.count',


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

    'get /app_builder/application/allmobileapps':
        'app_builder/ABApplicationController.listMobileApps',

    'post /app_builder/QR/sendEmail':
        'app_builder/ABMobileQRController.sendEmail',

    'post /app_builder/QR/adminQRCode':
        'app_builder/ABMobileQRController.adminQRCode',


    'get /app_builder/mobile/:mobileID/apk':
        'app_builder/ABMobileQRController.sendAPK',


    /* Event Specific URLs */

    'post /app_builder/Event/sendConfirmationEmail':
        'app_builder/ABEventController.sendRegistrationConfirmation',

    'get /events/confirm/:regID/:isConfirmed': 
        'app_builder/ABEventController.receiveRegistrationConfirmationResponse',

    'post /app_builder/Event/sendFeeConfirmationEmail':
        'app_builder/ABEventController.sendFeeConfirmation',

    'get /events/feeconfirm/:regID/:isConfirmed': 
        'app_builder/ABEventController.receiveFeeConfirmationResponse',

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

