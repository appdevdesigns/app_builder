var path = require('path');

var ABObject = require(path.join(__dirname, 'ABObject'));

module.exports = class ABObjectImport extends ABObject {


	///
	/// Migration Services
	///

	dbSchemaName() {

		return sails.config.connections[this.connName].database;

	}

	dbTableName(prefixSchema = false) {

		var tableName = this.tableName;

		if (!prefixSchema) return tableName;

		// pull database name
		var schemaName = this.dbSchemaName();

		return "#schema#.#table#"
			.replace("#schema#", schemaName)
			.replace("#table#", tableName);

	}

	/**
	 * @method migrateCreateTable
	 * verify that a table for this object exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateCreate(knex) {

		sails.log.verbose('ABObjectImport.migrateCreate()');

		return Promise.resolve();

	}

	/**
	 * migrateDropTable
	 * remove the table for this object if it exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateDrop(knex) {

		sails.log.verbose('ABObjectImport.migrateDrop()');

		sails.log.silly('.... aborted drop of imported table');
		return Promise.resolve();
	}

}