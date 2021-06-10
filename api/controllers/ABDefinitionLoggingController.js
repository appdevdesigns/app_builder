/**
 * ABDefinitionLoggingController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
   _config: {
      model: "abdefinitionlogging", // all lowercase model name
      actions: false,
      shortcuts: false,
      rest: false // This model should not be called from outside
   }
};

/// Create a new table - appbuilder_definition_logs with sails model

/// req.user
/// type /create/update/delete/
///        import stores a file - {local.pathFiles}/import
/// full json

// service. ABDefinitionLogger
