var path = require('path');
var uuid = require('uuid/v4');

var ABGraphDB = require(path.join('..', 'services', 'ABGraphDB'));


class ABModelBase {

	constructor(attributes, options) {

		options = options || {};

		// uuid from ._key to .id
		this.id = attributes._key;

		// ignore default properties of ArangoDB
		let ignoreProps = ['_key', '_id', '_rev', '_from', '_to'];

		// copy attributes
		attributes = attributes || {};
		for (let key in attributes) {

			if (ignoreProps.indexOf(key) > -1 &&
				!options.includeDefault)
				continue;

			this[key] = attributes[key];

			// create model instances of relation list
			let relation = this.constructor.relations[key];
			if (relation) {
				(this[key] || []).forEach((item, index) => {
					this[key][index] = new ABModelBase(item);
				});
			}

		}

	}

	save() {
		return this.constructor.upsert(this.id, this);
	}

	destroy() {
		return this.constructor.remove(this.id);
	}

	relate(relation, linkId, values = {}) {

		if (typeof relation == 'string')
			relation = this.constructor._getRelation(relation);

		if (relation == null) {
			ADCore.error.log('.relate: No relation found', { node: linkId });
			return Promise.resolve();
		}

		let fromId = (relation.direction == ABModelBase.relateDirection.OUTBOUND ? this.id : linkId),
			toId = (relation.direction == ABModelBase.relateDirection.OUTBOUND ? linkId : this.id);

		return this.constructor.relate(relation, fromId, toId, values);
	}

	unrelate(relation, linkId = null) {

		if (typeof relation == 'string')
			relation = this.constructor._getRelation(relation);

		if (relation == null) {
			ADCore.error.log('.unrelate: No relation found', { node: linkId });
			return Promise.resolve();
		}

		let fromId = (relation.direction == ABModelBase.relateDirection.OUTBOUND ? this.id : linkId),
			toId = (relation.direction == ABModelBase.relateDirection.OUTBOUND ? linkId : this.id);

		return this.constructor.unrelate(relation, fromId, toId);
	}

	clearRelate(relation) {

		if (typeof relation == 'string')
			relation = this.constructor._getRelation(relation);

		if (relation == null) {
			ADCore.error.log('.clearRelate: No relation found', { node: this });
			return Promise.resolve();
		}

		return this.constructor.clearRelate(relation, this.id);

	}

	static get relations() {

		return {
			// relationName: {
			// 	edgeName: "Name of edge collection",
			// 	linkCollection: "Name of link collection",
			// 	direction: Enum of this.relateDirection
			// }
		};
	}

	// Lifecycle
	static beforeCreate(recordToCreate) { return Promise.resolve(); }
	static afterCreate(newlyCreatedRecord) { return Promise.resolve(); }
	static beforeUpdate(valuesToSet) { return Promise.resolve(); }
	static afterUpdate(updatedRecord) { return Promise.resolve(); }
	static beforeDestroy(id) { return Promise.resolve(); }
	static afterDestroy(destroyedRecord) { return Promise.resolve(); }


	static query(aqlCommand, returnArray = true, returnPlain = false) {

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
						let result = (rows || []).map(r => {
							if (returnPlain)
								return r;
							else
								return new this(r);
						});
						next(result);

					}
					// return a Object
					else {
						let result = (rows || [])[0];
						if (result) {
							if (returnPlain)
								next(result);
							else
								next(new this(result));
						}
						else
							next(null);
					}


				});

			});

	}

	/**
	 * @method find
	 * 
	 * @param {Object} options - {
	 * 								where: {},		// https://sailsjs.com/documentation/concepts/models-and-orm/query-language
	 * 								relations: [],	// List of relation name
	 * 								select: [],		// List of property name
	 * 								skip: 0,
	 * 								limit: 20,
	 * 								sort: []		// [{ firstName: 'ASC'}, { lastName: 'DESC'}]
	 * 							}
	 * 
	 * @return {Promise}
	 */
	static find(options = {}) {

		if (options.where == null)
			options.where = {};

		if (options.relations == null)
			options.relations = [];

		if (options.select == null)
			options.select = [];

		if (options.sort == null)
			options.sort = [];

		let aqlFilters = this._aqlFilter(options.where);
		let aqlSort = this._aqlSort(options.sort);
		let aqlPagination = this._aqlPagination(options.skip, options.limit);
		let aqlRelations = this._aqlRelations(options.relations);
		let aqlReturn = this._aqlSelects(options.select);

		return this.query(`
						FOR row IN ${this.collectionName}
						${aqlFilters}
						${aqlSort}
						${aqlPagination}
						RETURN MERGE(${aqlReturn}, ${aqlRelations})
					`);

	}

	/**
	 * @method findOne
	 * 
	 * @param {uuid} id
	 * @param {Object} options - {
	 * 								relations: [],	// List of relation name
	 * 								select: []		// List of property name
	 * 							}
	 * 
	 * @return {Promise}
	 */
	static findOne(id, options = {}) {

		if (options.relations == null)
			options.relations = [];

		if (options.select == null)
			options.select = [];

		let aqlRelations = this._aqlRelations(options.relations);
		let aqlReturn = this._aqlSelects(options.select);

		return this.query(`
						FOR row IN ${this.collectionName}
						FILTER row._key == '${id}'
						LIMIT 1
						RETURN MERGE(${aqlReturn}, ${aqlRelations})
					`, false);

	}

	/**
	 * @method findWithRelation
	 * 
	 * @param {String|Object} relation
	 * @param {uuid} linkId 
	 * @param {Object} options - {
	 * 								where: {},		// https://sailsjs.com/documentation/concepts/models-and-orm/query-language
	 * 								relations: [],	// List of relation name
	 * 								select: []		// List of property name
	 * 								skip: 0,
	 * 								limit: 20,
	 * 								sort: []		// [{ firstName: 'ASC'}, { lastName: 'DESC'}]
	 * 							}
	 *
	 * @return {Object} - A document
	 */
	static findWithRelation(relation, linkId, options = {}) {

		if (options.where == null)
			options.where = {};

		if (options.relations == null)
			options.relations = [];

		if (options.select == null)
			options.select = [];

		if (options.sort == null)
			options.sort = [];

		if (typeof relation == 'string')
			relation = this._getRelation(relation);

		linkId = this._getId(linkId, relation.linkCollection);

		let aqlFilters = this._aqlFilter(options.where);
		let aqlSort = this._aqlSort(options.sort);
		let aqlPagination = this._aqlPagination(options.skip, options.limit);
		let aqlRelations = this._aqlRelations(options.relations);
		let aqlReturn = this._aqlSelects(options.select);

		return this.query(`
						FOR row IN ${this.collectionName}
						FOR join in ${relation.edgeName}
						FILTER join.${relation.direction == this.relateDirection.OUTBOUND ? "_from" : "_to"} == row._id
						&& join.${relation.direction == this.relateDirection.OUTBOUND ? "_to" : "_from"} == '${linkId}'
						${aqlFilters}
						${aqlSort}
						${aqlPagination}
						RETURN MERGE(${aqlReturn}, ${aqlRelations})
					`);

	}

	/**
	 * @function insert
	 * 
	 * @param {Object} values 
	 * @return {Promise} - return a new row
	 */
	static insert(values) {

		if (values._key == null)
			values._key = uuid();

		values = new this(values || {}, {
			includeDefault: true
		});

		let newlyCreatedRecord;

		return Promise.resolve()

			// Before create
			.then(() => this.beforeCreate(values))

			// Creating
			.then(() => {

				return new Promise((next, err) => {

					values = JSON.stringify(values);

					this.query(`
								INSERT ${values} INTO ${this.collectionName}
								RETURN NEW
							`, false)
						.catch(err)
						.then(doc => {
							newlyCreatedRecord = doc;
							next();
						});

				});

			})

			// After create
			.then(() => this.afterCreate(newlyCreatedRecord))

			// Return result
			.then(() => Promise.resolve(newlyCreatedRecord));

	}

	/**
	 * @function update
	 * 
	 * @param {string} id 
	 * @param {Object} updates 
	 * @param {boolean} replace - mark to replace whole json
	 * @return {Promise} - return a row is updated
	 */
	static update(id, updates, replace = false) {

		updates = new this(updates || {});

		let updatedRecord;

		return Promise.resolve()

			// Before update
			.then(() => this.beforeUpdate(updates))

			// Updating
			.then(() => {

				return new Promise((next, err) => {

					updates = JSON.stringify(updates);

					let action = replace ? "REPLACE" : "UPDATE";

					this.query(
						`FOR row IN ${this.collectionName} ` +
						`FILTER row._key == '${id}' ` +
						`${action} row WITH ${updates} IN ${this.collectionName} ` +
						`RETURN NEW`
						, false)
						.catch(err)
						.then(doc => {
							updatedRecord = doc;
							next();
						});

				});

			})

			// After update
			.then(() => this.afterUpdate(updatedRecord))

			// Return result
			.then(() => Promise.resolve(updatedRecord));

	}

	/**
	 * @function upsert
	 * 
	 * @param {string} id 
	 * @param {Object} updates 
	 * @return {Promise} - return a row is created or updated
	 */
	static upsert(id, updates) {

		let addNew = updates.id == null,
			updatedRecord;

		if (addNew)
			updates._key = uuid();
		else
			updates._key = updates.id;

		updates = new this(updates || {}, {
			includeDefault: true
		});

		return Promise.resolve()

			// Before create/update
			.then(() => addNew ? this.beforeCreate(updates) : this.beforeUpdate(updates))

			// Creating/Updating
			.then(() => {

				return new Promise((next, err) => {

					updates = JSON.stringify(updates);

					this.query(
						`UPSERT { _key: '${id}' } ` +
						`INSERT ${updates} ` +
						// `UPDATE ${updates} ` +
						`REPLACE ${updates} ` +
						`IN ${this.collectionName} ` +
						`RETURN NEW`
						, false)
						// RETURN { doc: NEW, type: OLD ? 'insert': 'update' }
						.catch(err)
						.then(doc => {
							updatedRecord = doc;
							next();
						});

				});

			})

			// After create/update
			.then(() => addNew ? this.afterCreate(updatedRecord) : this.afterUpdate(updatedRecord))

			// Return result
			.then(() => Promise.resolve(updatedRecord));


	}

	// static updateSubArray() {

	// 	updates = new this(updates || {});

	// 	let updatedRecord;

	// 	return Promise.resolve()

	// 		// Before update
	// 		.then(() => this.beforeUpdate(updates))

	// 		// Updating
	// 		.then(() => {

	// 			return new Promise((next, err) => {

	// 				updates = JSON.stringify(updates);

	// 				this.query(
	// 					`FOR row IN ${this.collectionName} ` +
	// 					`FILTER row._key == '${rowId}'` +

	// 					`LET alteredList = (` +
	// 					`	FOR sub IN row.${arrayName}` +
	// 					`	LET newItem = (sub.id == '${subId}' ? MERGE(sub, ${updates}) : sub)` +
	// 					`	RETURN newItem` +
	// 					`)` +

	// 					`UPDATE row WITH { ${arrayName}: alteredList } IN ${this.collectionName}`
	// 					, false)
	// 					.catch(err)
	// 					.then(doc => {
	// 						updatedRecord = doc;
	// 						next();
	// 					});

	// 			});

	// 		})

	// 		// After update
	// 		.then(() => this.afterUpdate(updatedRecord))

	// 		// Return result
	// 		.then(() => Promise.resolve(updatedRecord));

	// }

	/**
	 * @function remove
	 * 
	 * @param {string} id 
	 * @return {Promise} - return a removed row
	 */
	static remove(id) {

		let destroyedRecord;

		return Promise.resolve()

			// Before remove
			.then(() => this.beforeDestroy(id))

			// Removing
			.then(() => {

				return new Promise((next, err) => {

					this.query(`
							FOR row IN ${this.collectionName}
							FILTER row._key == '${id}'
							REMOVE row IN ${this.collectionName}
							RETURN OLD
						`, false)
						.catch(err)
						.then(doc => {
							destroyedRecord = doc;
							next();
						});

				});

			})

			// Clear relations
			.then(() => {

				if (destroyedRecord == null)
					return Promise.resolve();

				let tasks = [];

				for (let key in this.relations) {

					let rel = this.relations[key];

					tasks.push(this.clearRelate(rel, destroyedRecord.id));
				}

				return Promise.all(tasks);

			})

			// After remove
			.then(() => this.afterDestroy(destroyedRecord))

			// Return result
			.then(() => Promise.resolve(destroyedRecord));

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
	 * @param {Object} relation - Relation settings
	 * @param {string} fromId - _key of node
	 * @param {string} toId - _key of node
	 * @return {Promise}
	 */
	static relate(relation, fromId, toId, values = {}) {

		// Get _id of documents
		if (relation.direction == this.relateDirection.OUTBOUND) {
			fromId = this._getId(fromId);
			toId = this._getId(toId, relation.linkCollection);
		}
		else {
			fromId = this._getId(fromId, relation.linkCollection);
			toId = this._getId(toId);
		}

		values._from = fromId;
		values._to = toId;

		values = JSON.stringify(values);

		return this.query(`
						UPSERT ${values}
						INSERT ${values}
						UPDATE ${values}
						IN ${relation.edgeName}
					`);

	}

	/**
	 * @function unrelate
	 * 
	 * @param {Object} relation - Relation settings
	 * @param {string} fromId - _key of node
	 * @param {string} toId - _key of node
	 * @return {Promise}
	 */
	static unrelate(relation, fromId = null, toId = null) {

		// Should define either values
		if (!fromId && !toId)
			return Promise.resolve();

		// Get _id of documents
		if (relation.direction == this.relateDirection.OUTBOUND) {
			if (fromId)
				fromId = this._getId(fromId);

			if (toId)
				toId = this._getId(toId, relation.linkCollection);
		}
		else {
			if (fromId)
				fromId = this._getId(fromId, relation.linkCollection);

			if (toId)
				toId = this._getId(toId);
		}

		let condition = "";
		if (fromId && toId) {
			condition = `row._from == '${fromId}' AND row._to == '${toId}'`;
		}
		else if (fromId) {
			condition = `row._from == '${fromId}'`;
		}
		else if (toId) {
			condition = `row._to == '${toId}'`;
		}

		return this.query(`
						FOR row IN ${relation.edgeName}
						FILTER ${condition}
						REMOVE row IN ${relation.edgeName}
					`);

	}

	/**
	 * @function clearRelate
	 * 
	 * @param {Object} relation - Relation settings
	 * @param {string} key - _key of node
	 * @return {Promise}
	 */
	static clearRelate(relation, key) {

		let id = this._getId(key);

		return this.query(`
						FOR row IN ${relation.edgeName}
						FILTER row._from == '${id}'
						OR row._to == '${id}'
						REMOVE row IN ${relation.edgeName}
					`);

	}

	static collection() {

		let db = ABGraphDB.database();

		return db.collection(this.collectionName);

	}


	/** Private methods */
	/**
	 * @method _aqlSelects
	 * 
	 * @param {Array} select - Array of property name (string)
	 * 
	 * @return {string} - AQL select syntax
	 */
	static _aqlSelects(select = []) {

		if (select && select.length > 0) {

			let result = {};

			select.forEach(propName => {

				// json.translations
				if (propName.indexOf('.') > -1) {
					let parentName = propName.split('.')[0];
					let attrName = propName.split('.')[1];
					result[parentName] = result[parentName] || {};
					result[parentName][attrName] = `row.${propName}`;
				}
				else {
					result[propName] = `row.${propName}`;
				}

			});

			// { name: row.name, age: row.age }
			return JSON.stringify(result).replace(/"/g, "");
		}
		else {
			return "row";
		}

	}

	/**
	 * @method _aqlRelations
	 * 
	 * @param {Array} relations - Array of relation name (string)
	 * 
	 * @return {string} - AQL command
	 */
	static _aqlRelations(relations = []) {

		let result = {};

		relations.forEach(relationName => {

			let r = this.relations[relationName];
			if (r == null) return;

			// https://www.arangodb.com/docs/stable/aql/tutorial-traversal.html
			// result[relationName] = `(FOR sub IN 1..1 ${r.direction} row ${r.edgeName} RETURN sub)`;

			// https://www.arangodb.com/docs/stable/aql/examples-join.html
			// NOTE: use join mechanism to get values in edge collection
			result[relationName] =
				`(FOR link IN ${r.edgeName} ` +
				`FILTER link.${r.direction == this.relateDirection.OUTBOUND ? "_from" : "_to"} == row._id ` +

				`FOR sub IN ${r.linkCollection} ` +
				`FILTER sub._id == link.${r.direction == this.relateDirection.OUTBOUND ? "_to" : "_from"} ` +

				`RETURN MERGE(link, sub))`;

		});

		let aql = JSON.stringify(result)
			.replace(/"\(/g, "(")
			.replace(/\)"/g, ")");

		return aql;

	}

	/**
	 * @method _aqlFilter
	 	 * 
	 * @param {Object} where - define parameters as same as https://sailsjs.com/documentation/concepts/models-and-orm/query-language
	 * 
	 * @return {string} - AQL FILTER clause
	 */
	static _aqlFilter(where = {}) {

		let filters = [];

		Object.keys(where).forEach(prop => {

			let whereClause = where[prop];
			if (whereClause == null) return;

			try {
				whereClause = JSON.parse(whereClause);
			}
			catch (err) { }

			// { 'id': "guid" }
			if (typeof whereClause == 'string') {

				// if there are comma, then should be IN condition to an array.
				if (whereClause.indexOf(',') > -1) {
					let val = (whereClause || "").split(',');
					filters.push(`FILTER row.${prop} IN [${(val || []).map(v => `'${v}'`)}]`);
				}
				else if (whereClause == 'isnull') {
					filters.push(`FILTER row.${prop} IN [null, false, 0]`);
				}
				else if (whereClause == 'isnotnull') {
					filters.push(`FILTER row.${prop} NOT IN [null, false, 0]`);
				}
				else {
					filters.push(`FILTER row.${prop} == '${whereClause}'`);
				}

			}
			// { 'age': { ">": 30 } }
			else {
				Object.keys(whereClause).forEach(operate => {

					let val = whereClause[operate];
					if (val == null)
						return;

					switch (operate) {
						case '<':
						case '<=':
						case '>':
						case '>=':
						case '!=':
							filters.push(`FILTER row.${prop} ${operate} '${val}'`);
							break;
						case 'nin':

							if (typeof val == 'string')
								val = (val || "").split(',');

							filters.push(`FILTER row.${prop} NOT IN [${(val || []).map(v => `'${v}'`)}]`);
							break;
						case 'in':

							if (typeof val == 'string')
								val = (val || "").split(',');

							filters.push(`FILTER row.${prop} IN [${(val || []).map(v => `'${v}'`)}]`);
							break;
						case 'contains':
							filters.push(`FILTER CONTAINS(row.${prop}, '${val}')`);
							break;
						case 'startsWith':
							filters.push(`FILTER LIKE(row.${prop}, '${val}%', true)`);
							break;
						case 'endsWith':
							filters.push(`FILTER LIKE(row.${prop}, '%${val}', true)`);
							break;
					}
				});
			}

		});

		return filters.join(' ');

	}


	/**
	 * @method _aqlSort
	 	 * 
	 * @param {Array} sorts - [{ firstName: 'ASC'}, { lastName: 'DESC'}]
	 * 
	 * @return {string} - AQL SORT clause
	 */
	static _aqlSort(sorts = []) {

		let sortClauses = [];

		sorts.forEach(sort => {

			Object.keys(sort || {}).forEach(prop => {

				let direction = sort[prop]; // 'asc' || 'desc'
				if (direction == 'desc')
					direction = "DESC";
				else
					direction = "ASC";

				sortClauses.push(`row.${prop} ${direction}`);

			});
		});

		// SORT row.firstName ASC, row.lastName DESC
		if (sortClauses.length > 0)
			return `SORT ${sortClauses.join(', ')}`;
		else
			return "";
	}

	/**
	 * @method _aqlPagination
	 * 
	 * @param {number} offset
	 * @param {number} count
	 * 
	 * @return {string} - AQL LIMIT clause
	 */
	static _aqlPagination(offset, count) {

		if (offset != null && count != null) {
			return `LIMIT ${offset} ${count}`;
		}
		else if (count != null) {
			return `LIMIT ${count}`;
		}
		else {
			return "";
		}
	}


	/**
	 * @method _getRelation
	 * 
	 * @param {string} relationName - Name of relation
	 * 
	 * @return {Object} - Relation
	 */
	static _getRelation(relationName) {
		return this.relations[relationName];
	}

	/**
	 * @method _getId
	 * return _id format of ArangoDB
	 * 
	 * @param {string} key - key of a document
	 * @param {string} collectionName - [optional]
	 * 
	 * @return {string} - return _id format
	 */
	static _getId(key, collectionName = this.collectionName) {
		return `${collectionName}/${key}`;
	}

}

module.exports = ABModelBase;