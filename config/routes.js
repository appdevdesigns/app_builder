/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    /* Synchronize application */
    'post /app_builder/fullReload/:id': 
        'app_builder/ABApplicationController.fullReload',
        
    'post /app_builder/reloadORM/:id': 
        'app_builder/ABApplicationController.reloadORM',

    'get /app_builder/reloadStatus': 
        'app_builder/ABApplicationController.reloadStatus',
    
    'post /app_builder/prepareObject/:id': 
        'app_builder/ABObjectController.prepare',
    
    'post /app_builder/prepareApp/:id': 
        'app_builder/ABApplicationController.prepare',
    
    'post /app_builder/preparePage/:id': 
        'app_builder/ABPageController.prepare',

    /*  */
    'put /app_builder/object/sortColumns/:id': 
        'app_builder/ABObjectController.sortColumns',

    'put /app_builder/page/sortComponents/:id': 
        'app_builder/ABPageController.sortComponents',

    'put /app_builder/column/:id/width': 
        'app_builder/ABColumnController.saveWidth',
        
    'post /app_builder/column/createColumn':
        'app_builder/ABColumnController.createColumn',
    
    'post /app_builder/column/createLink':
        'app_builder/ABColumnController.createLink',

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
        
    /* Import & Export */
    'get /app_builder/appJSON/:id':
        'app_builder/ABApplicationController.jsonExport',
        
    'post /app_builder/appJSON':
        'app_builder/ABApplicationController.jsonImport',
    
    'get /app_builder/application/:appID/findModels':
        'app_builder/ABApplicationController.findModels',
    
    'post /app_builder/application/:appID/importModel':
        'app_builder/ABApplicationController.importModel',
    
    'get /app_builder/application/findModelAttributes':
        'app_builder/ABApplicationController.findModelAttributes',


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
    // delete url // remove the object dat
    'get /app_builder/model/application/:appID/object/:objID' : 
        'app_builder/ABModelController.find',

    'post /app_builder/model/application/:appID/object/:objID' : 
        'app_builder/ABModelController.create',

    'put /app_builder/model/application/:appID/object/:objID/:id' : 
        'app_builder/ABModelController.update',

    'delete /app_builder/model/application/:appID/object/:objID/:id' : 
        'app_builder/ABModelController.delete',
        

// only for easy development/testing purposes:
'get /app_builder/migrate/application/:appID/object/:objID' : 
    'app_builder/ABMigrationController.createObject',

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

