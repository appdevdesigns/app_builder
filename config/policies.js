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

var findStack = ADCore.policy.serviceStack([
   "ABModelNormalize",
   "ABModelConvertSailsCondition",
   "ABModelConvertFilterCondition",

   // after this point:  our where conditions should be in QB format
   "ABModelConvertSameAsUserConditions",
   "ABModelConvertQueryConditions",
   "ABModelConvertQueryFieldConditions",
   "ABModelConvertDataCollectionCondition"
   // 'ABModelConvertFieldKey'
]);

module.exports = {
   "app_builder/ABModelController": {
      find: findStack
   },

   "app_builder/ABMobileQRController": {
      sendAPK: true // no permission checking on APK download.
   },

   "app_builder/ABEventController": {
      receiveRegistrationConfirmationResponse: true, // event confirmation response
      receiveFeeConfirmationResponse: true // event fee confirmation response
   },

   "app_builder/localIncomeExpense": {
      getData: findStack
   },
};
