/**
 * This file specifies any system Route permission to protect the apps in this
 * module.
 *
 * To specify a route and a set of permissions, fill out the module.exports {} 
 * with a 'route' and permission setting.
 *
 * For example: 
 * 
 *  'get /route/one' : [ 'actionKey1' ],   
 *		// access to : GET /route/one  requires 'actionKey1' assigned to the 
 *      // requesting user in the Roles and Permissions system.
 *		// NOTE: this does not apply to post, put, or destroy  verbs
 *
 *  '/route/two'     : [ 'actionKey1', 'actionKey2' ]
 *		// any access to /route/two   will require either 'actionKey1' OR 
 *      // 'actionKey2' to be assigned to this user.
 *
 *  '/route'         : [ 'actionKey1', ['actionKey2', 'actionKey3' ]
 *		// any access to /route/*  will require either 'actionKey1'  OR
 *		// ( 'actionKey2' AND 'actionKey3' )
 *
 * Also notice that the order is important.  The first match that happens is 
 * the one that is palced in effect.  So in this case, 
 *		'get /route/two' : will match the 2nd rule above
 *		'put /route/one' : will match the 3rd rule above
 *		'get /route/twomore' : will match the 2nd rule
 *
 */
module.exports = {

    // 'get /route/one' : [ 'action.key.1', ['action.key.2', 'action.key.3']],

};