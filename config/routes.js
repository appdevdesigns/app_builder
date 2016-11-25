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

