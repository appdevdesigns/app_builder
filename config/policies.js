/**
 * Policy mappings (ACL)
 *
 * Policies are simply Express middleware functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect just one of its actions.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */

// var serviceStack = ADCore.policy.serviceStack([ 'policy1', 'policy2']);

module.exports = {

//    'app_builder/YourController': {
//        method: ['isAuthenticatedService'],
//        auth: [],
//        sync: serviceStack,
//        logout:true
//    }


};
