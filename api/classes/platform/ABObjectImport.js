const path = require('path');

const ABObjectExternal = require(path.join(__dirname, 'ABObjectExternal'));

module.exports = class ABObjectImport extends ABObjectExternal {

	constructor(attributes, application) {
		super(attributes, application);
	}

	///
	/// Migration Services
	///

	dbSchemaName() {

		// FIX: log an error when this.connName not found:
		if (!sails.config.connections[this.connName]) {
			var objData = this.toObj();
			ADCore.error.log('ABObjectImport:dbSchemaName():No connection found for object', { objDef:objData, missingConn:this.connName });
		}
if (!sails.config.connections[this.connName]) {
	console.log("Cant find connection : ", this.connName);
	console.log(sails.config.connections);
}
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

	dbTransTableName(prefixSchema = false) {

		let tableName = this.dbTableName(prefixSchema)
			// WORKAROUND: hris tables 
			// FORMAT: hris_ren_data -> trans table: hris_ren_trans
			.replace("_data", "");

		return "#table#_trans".replace("#table#", tableName);
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

	modelDefaultFields() {

		return {};

	}


	/**
	 * @method requestParams
	 * Parse through the given parameters and return a subset of data that
	 * relates to the fields in this object.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} 
	 */
	requestParams(allParameters) {

		// REPLICATED TABLE is read-only
		var usefulParameters = {};
		return usefulParameters;

	}


	requestRelationParams(allParameters) {

		// REPLICATED TABLE is read-only
		var usefulParameters = {};
		return usefulParameters;

	}

}