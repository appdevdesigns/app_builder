module.exports = {


	/**
	 * GET /app_builder/external/application/:appID
	 * 
	 * Get the list of MySql table names
	 */
	findTableNames: (req, res) => {

		var appID = req.param('appID');

		ABExternal.getTableList(appID)
			.catch(res.AD.error)
			.then(result => {
				res.AD.success(result);
			});

	},


	/**
	 * GET /app_builder/external/model/:tableName/columns
	 * 
	 * Get the list of column info
	 */
	findColumns: (req, res) => {

		var tableName = req.param('tableName');
		var connName = req.param('connection');

		ABExternal.getColumns(tableName, connName)
			.catch(res.AD.error)
			.then(result => {
				res.AD.success(result);
			});

	},


	/**
	 * POST /app_builder/external/application/:appID/model/:tableName
	 * 
	 * Import a table into the application
	 */
	importTable: (req, res) => {

		var appID = req.param('appID'),
			tableName = req.param('tableName'),
			connName = req.param('connection'),
			columnList = req.body.columns || [];

		ABExternal.tableToObject(appID, tableName, columnList, connName)
			.then(function (objectList) {

				res.AD.success(objectList);

			})
			.catch(function (err) {

				ADCore.error.log('ABExternal.importTable() failed:', { error: err, tableName: tableName });
				res.AD.error(err, 500);

			});


	}

};