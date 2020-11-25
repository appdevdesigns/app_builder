module.exports = {
   /**
    * GET /app_builder/external/connections
    *
    * Get the list of DB connection names
    */
   findDatabaseNames: (req, res) => {
      var connectionNames = ABExternal.getConnectionList();

      res.AD.success(connectionNames);
   },

   /**
    * GET /app_builder/external/application/:appID
    *
    * Get the list of MySql table names
    */
   findTableNames: (req, res) => {
      var appID = req.param("appID");
      var connName = req.param("connection");

      ABExternal.getTableList(appID, connName)
         .then((result) => {
            res.AD.success(result);
         })
         .catch((err) => {
            console.error(err);
            res.AD.error(err);
         });
   },

   /**
    * GET /app_builder/external/model/:tableName/columns
    *
    * Get the list of column info
    */
   findColumns: (req, res) => {
      var tableName = req.param("tableName");
      var connName = req.param("connection");

      ABExternal.getColumns(tableName, connName)
         .then((result) => {
            res.AD.success(result);
         })
         .catch((err) => {
            console.error(err);
            res.AD.error(err);
         });
   },

   /**
    * POST /app_builder/external/application/:appID/model/:tableName
    *
    * Import a table into the application
    */
   importTable: (req, res) => {
      var appID = req.param("appID"),
         tableName = req.param("tableName"),
         connName = req.param("connection"),
         columnList = req.body.columns || [];

      ABExternal.tableToObject(appID, tableName, columnList, connName)
         .then(function(definitionList) {
            res.AD.success(definitionList);
         })
         .catch(function(err) {
            ADCore.error.log("ABExternal.importTable() failed:", {
               error: err,
               tableName: tableName
            });
            res.AD.error(err, 500);
         });
   }
};
