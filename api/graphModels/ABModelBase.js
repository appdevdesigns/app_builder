var path = require('path');
var uuid = require('uuid/v4');

var ABGraphDB = require(path.join('..', 'services', 'ABGraphDB'));


class ABModelBase {

	constructor(attributes) {

		if (this.id == null)
			this.id = uuid();

		// ignore default properties of ArangoDB
		// let ignoreProps = ['_key', '_id', '_rev'];
		let ignoreProps = ['_key', '_rev'];

		// copy attributes
		attributes = attributes || {};
		for (let key in attributes) {

			if (ignoreProps.indexOf(key) > -1)
				continue;

			this[key] = attributes[key];
		}

	}

	save() {
		return this.constructor.upsert(this.id, this);
	}

	destroy() {
		return this.constructor.remove(this.id);
	}

	relate(relation, linkNode) {

		let fromId = (ABModelBase.OUTBOUND ? this._id : linkNode._id),
			toId = (ABModelBase.OUTBOUND ? linkNode._id : this._id);

		return this.constructor.relate(relation.edgeName, fromId, toId);
	}

	unrelate(relation, linkNode) {

		let fromId = (ABModelBase.OUTBOUND ? this._id : linkNode._id),
			toId = (ABModelBase.OUTBOUND ? linkNode._id : this._id);

		return this.constructor.unrelate(relation.edgeName, fromId, toId);
	}


	static query(aqlCommand, returnArray = true) {

		return Promise.resolve()

			// Execute AQL command
			.then(() => {

				return new Promise((next, err) => {

					let db = ABGraphDB.database();

					db.query(aqlCommand)
						.catch(err)
						.then(cursor => {

							// pass result
							if (cursor && cursor.all) {
								cursor.all()
									.catch(err)
									.then(rows => {
										next(rows);
									});
							}
							else {
								next(null);
							}

						});

				});

			})

			// Return result
			.then(rows => {

				return new Promise((next, err) => {

					// return an Array
					if (returnArray) {

						// Convert to model
						let result = (rows || []).map(r => new this(r));
						next(result);

					}
					// return a Objct
					else {
						let result = (rows || [])[0];
						if (result)
							next(new this(result));
						else
							next(null);
					}


				});

			});

	}

	/**
	 * @method find
	 * 
	 * @param {Object} cond 
	 * @param {Array} relations 
	 * 
	 * @return {Promise}
	 */
	static find(cond, relations = []) {

		// TODO paging, sorting

		let aqlRelations = this._aqlRelations(relations);

		return this.query(`
						FOR row IN ${this.collectionName}
						RETURN MERGE(row, ${aqlRelations})
					`);

	}

	/**
	 * @method findOne
	 * 
	 * @param {uuid} id
	 * @param {Array} relations 
	 * 
	 * @return {Promise}
	 */
	static findOne(id, relations = []) {

		let aqlRelations = this._aqlRelations(relations);

		return this.query(`
						FOR row IN ${this.collectionName}
						FILTER row.id == '${id}'
						LIMIT 1
						RETURN MERGE(row, ${aqlRelations})
					`, false);

	}

	/**
	 * @function insert
	 * 
	 * @param {Object} values 
	 * @return {Promise} - return a new row
	 */
	static insert(values) {

		values = new this(values || {});
		values = JSON.stringify(values);

		return this.query(`
						INSERT ${values} INTO ${this.collectionName}
						RETURN NEW
					`, false);

	}

	/**
	 * @function update
	 * 
	 * @param {string} id 
	 * @param {Object} updates 
	 * @return {Promise} - return a row is updated
	 */
	static update(id, updates) {

		updates = new this(updates || {});
		updates = JSON.stringify(updates);

		return this.query(`
						FOR row IN ${this.collectionName}
						FILTER row.id == '${id}'
						UPDATE row WITH ${updates} IN ${this.collectionName}
						RETURN NEW
					`, false)

	}

	/**
	 * @function upsert
	 * 
	 * @param {string} id 
	 * @param {Object} updates 
	 * @return {Promise} - return a row is created or updated
	 */
	static upsert(id, updates) {

		updates = new this(updates || {});
		updates = JSON.stringify(updates);

		return this.query(`
						UPSERT { id: '${id}' }
						INSERT ${updates}
						UPDATE ${updates}
						IN ${this.collectionName}
						RETURN NEW
					`, false)

	}

	/**
	 * @function remove
	 * 
	 * @param {string} id 
	 * @return {Promise} - return boolean
	 */
	static remove(id) {

		return this.query(`
						FOR row IN ${this.collectionName}
						FILTER row.id == '${id}'
						REMOVE row IN ${this.collectionName}
					`, false)

	}

	static get relateDirection() {
		return {
			INBOUND: "INBOUND",
			OUTBOUND: "OUTBOUND"
		}
	}

	/**
	 * @function relate
	 * 
	 * @param {string} edgeName - Name of edge collection
	 * @param {string} fromId - _id of node
	 * @param {string} toId - _id of node
	 * @return {Promise}
	 */
	static relate(edgeName, fromId, toId) {

		return this.query(`
						UPSERT { _from: '${fromId}', _to: '${toId}' }
						INSERT { _from: '${fromId}', _to: '${toId}' }
						UPDATE { _from: '${fromId}', _to: '${toId}' }
						IN ${edgeName}
					`, false)

	}

	/**
	 * @function unrelate
	 * 
	 * @param {string} edgeName - Name of edge collection
	 * @param {string} fromId - _id of node
	 * @param {string} toId - _id of node
	 * @return {Promise}
	 */
	static unrelate(edgeName, fromId, toId) {

		return this.query(`
						FOR row IN ${edgeName}
						FILTER row._from == '${fromId}'
						AND row._to == '${toId}'
						REMOVE row IN ${edgeName}
					`, false)

	}

	static collection() {

		let db = ABGraphDB.database();

		return db.collection(this.collectionName);

	}


	/** Private methods */

	/**
	 * @method getAqlRelations
	 * 
	 * @param {Array} relations - Array of relation name (string)
	 * 
	 * @return {string} - AQL command
	 */
	static _aqlRelations(relations = []) {

		let result = {};

		relations.forEach(relationName => {

			let r = this.relations[relationName];

			result[relationName] = `(FOR sub IN 1..1 ${r.direction} row ${r.edgeName} RETURN sub)`;
		});

		let aql = JSON.stringify(result)
			.replace(/"\(/g, "(")
			.replace(/\)"/g, ")");

		return aql;

	}

}

module.exports = ABModelBase;