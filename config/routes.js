/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    '/app_builder/fullReload': 
        'app_builder/ABApplicationController.fullReload',
        
    '/app_builder/reloadORM': 
        'app_builder/ABApplicationController.reloadORM',
    
    '/app_builder/prepareObject/:id': 
        'app_builder/ABObjectController.prepare',
    
    '/app_builder/prepareApp/:id': 
        'app_builder/ABApplicationController.prepare',
    

    '/app_builder/object/sortColumns/:id': 
        'app_builder/ABObjectController.sortColumns',

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

