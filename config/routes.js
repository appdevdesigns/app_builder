/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    'post /app_builder/fullReload': 
        'app_builder/ABApplicationController.fullReload',
        
    'post /app_builder/reloadORM': 
        'app_builder/ABApplicationController.reloadORM',
    
    'post /app_builder/prepareObject/:id': 
        'app_builder/ABObjectController.prepare',
    
    'post /app_builder/prepareApp/:id': 
        'app_builder/ABApplicationController.prepare',
    
    'post /app_builder/preparePage/:id': 
        'app_builder/ABPageController.prepare',

    'put /app_builder/object/sortColumns/:id': 
        'app_builder/ABObjectController.sortColumns',

    'put /app_builder/page/sortComponents/:id': 
        'app_builder/ABPageController.sortComponents',

    'get /app_builder/user/roles':
        'app_builder/ABUserController.getRoles',

    'get /app_builder/:id/role':
        'app_builder/ABRoleController.getRoles',

    'post /app_builder/:id/role':
        'app_builder/ABRoleController.createRole',

    'delete /app_builder/:id/role':
        'app_builder/ABRoleController.deleteRole',

    'put /app_builder/:id/role/assign':
        'app_builder/ABRoleController.assignRole'

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

