var Database = require('arangojs').Database;

var conn;

module.exports = {

	database: () => {

		if (conn != null)
			return conn


		let url = sails.config.appbuilder.graphDB.url,
			databaseName = sails.config.appbuilder.graphDB.databaseName,
			user = sails.config.appbuilder.graphDB.user,
			pass = sails.config.appbuilder.graphDB.pass;

		conn = new Database(url);
		conn.useDatabase(databaseName);
		conn.useBasicAuth(user, pass);

		return conn;

	}

}