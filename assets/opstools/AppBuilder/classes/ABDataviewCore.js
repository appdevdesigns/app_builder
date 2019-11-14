const ABObject = require("./ABObject");
const ABObjectQuery = require("./ABObjectQuery");
const RowFilter = require("./RowFilter");

var EventEmitter = require('events').EventEmitter;

var DefaultValues = {
	id: "uuid",
	label: "", // label
	object: {}, // json of ABObject
	query: {}, // json of ABObjectQuery
	settings: {
		datasourceID: '', 		// id of ABObject or ABObjectQuery
		linkDatacollectionID: '',	// id of ABDatacollection
		linkFieldID: '',		// id of ABField
		objectWorkspace: {
			filterConditions: { // array of filters to apply to the data table
				glue: 'and',
				rules: []
			},
			sortFields: [] // array of columns with their sort configurations
		},
		loadAll: false,
		isQuery: false, // if true it is a query, otherwise it is a object.

		fixSelect: "", // _CurrentUser, _FirstRecord, _FirstRecordDefault or row id

		syncType: 1, // 1 (Server), 2 (Client)
	}
};

module.exports = class ABDatacollection extends EventEmitter {

	constructor(attributes, application) {

		super();

		attributes = attributes || {};

		this.application = application;

		this.fromValues(attributes);

		this.__dataCollection = this._dataCollectionNew([]);

		// Set filter value
		this.refreshFilterConditions();

		this.__bindComponentIds = [];

		// refresh a data collection
		// this.init();

		// mark data status does not be initialized
		this._dataStatus = this.dataStatusFlag.notInitial;

	}

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		this.id = values.id;

		values.settings = values.settings || {};
		this.settings = this.settings || {};

		// label
		this.translations = values.translations || [];
		this.label = values.label;


		// if this is being instantiated on a read from the Property UI,
		this.settings.datasourceID = values.settings.datasourceID || DefaultValues.settings.datasourceID;
		this.settings.linkDatacollectionID = values.settings.linkDatacollectionID || DefaultValues.settings.linkDatacollectionID;
		this.settings.linkFieldID = values.settings.linkFieldID || DefaultValues.settings.linkFieldID;
		this.settings.objectWorkspace = values.settings.objectWorkspace || {
			filterConditions: DefaultValues.settings.objectWorkspace.filterConditions,
			sortFields: DefaultValues.settings.objectWorkspace.sortFields
		};
		this.settings.fixSelect = values.settings.fixSelect;

		// Convert to boolean
		this.settings.loadAll = JSON.parse(values.settings.loadAll || DefaultValues.settings.loadAll);
		this.settings.isQuery = JSON.parse(values.settings.isQuery || DefaultValues.settings.isQuery);

		// Convert to number
		this.settings.syncType = parseInt(values.settings.syncType || DefaultValues.settings.syncType);

		// Populate data source: ABObject or ABObjectQuery
		if (values.query && values.query[0]) {
			this.__datasource = new ABObjectQuery(values.query[0], this.application);
			this.settings.isQuery = true;

			if (this.__datasource.isGroup) {
				if (!this.__treeCollection)
					this.__treeCollection = this._treeCollectionNew();

				this.__isGroup = true;
			}
		}
		else if (values.object && values.object[0]) {
			this.__datasource = new ABObject(values.object[0], this.application);
			this.settings.isQuery = false;
		}

	}

	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to
	 * update that from all the current values of our child fields.
	 *
	 * @return {json}
	 */
	toObj() {

		// OP.Multilingual.unTranslate(this, this, ["label"]);
		return {
			id: this.id,
			settings: _.cloneDeep(this.settings || {}),
			translations: this.translations,
		};

	}

	/**
	* @method save()
	*
	* persist this instance of ABDatacollection with it's parent
	*
	*
	* @return {Promise}
	*			.resolve( {this} )
	*/
	save() {

		if (!this.id) {

			// this.id = OP.Util.uuid();	// setup default .id
			this.label = this.label || this.name;
		}

		return new Promise((resolve, reject) => {
			this.application.datacollectionSave(this)
				.then(newDC => {

					if (newDC &&
						newDC.id &&
						!this.id)
						this.id = newDC.id;

					// update data source
					let updateDC = this.application.datacollections(dc => dc.id == this.id)[0];
					if (updateDC) {

						if (newDC.query && newDC.query[0]) {
							updateDC.datasource = new ABObjectQuery(newDC.query[0], this.application);
							this.settings.isQuery = true;
						}
						else if (newDC.object && newDC.object[0]) {
							updateDC.datasource = new ABObject(newDC.object[0], this.application);
							this.settings.isQuery = false;
						}

					}

					// AD.comm.hub.publish('ab.datacollection.update', {
					// 	datacollectionId: this.id
					// });

					resolve(this);
				})
				.catch(function (err) {
					reject(err);
				});
		});

	}

	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABDatacollection
	 *
	 * also remove it from our parent application
	 *
	 * @return {Promise}
	 */
	destroy() {
		return this.application.datacollectionDestroy(this);
	}

	/**
	* @property datasource
	* return a object of this component.
	*
	* @return {ABObject|ABObjectQuery}
	*/
	get datasource() {
		return this.__datasource;
	}

	/**
	 * @property datasource
	 * set a object to data collection
	 * 
	 * @param {ABObject|ABObjectQuery} object
	 */
	set datasource(object) {

		this.__datasource = object;

		this.refreshFilterConditions();
	}

	/**
	* @property sourceType
	* return type of source.
	*
	* @return {string} - 'object' or 'query'
	*/
	get sourceType() {

		return this.settings.isQuery ? 'query' : 'object';

	}

	/**
	* @method datacollectionLink
	* return a ABDatacollection that link of this.
	*
	* @return {ABDatacollection}
	*/
	get datacollectionLink() {

		if (!this.application)
			return null;

		return this.application.datacollections(dc => dc.id == this.settings.linkDatacollectionID)[0];
	}

	/**
	* @method fieldLink
	* return a ABFieldConnect field that link of this.
	*
	* @return {ABFieldConnect}
	*/
	get fieldLink() {

		let object = this.datasource;
		if (!object) return null;

		return object.fields((f) => f.id == this.settings.linkFieldID)[0];
	}

	/**
	 * @property model
	 * return a source model
	 * 
	 * @return ABModel
	 */
	get model() {
		let object = this.datasource;

		return object ? object.model() : null;
	}

	get dataStatusFlag() {
		return {
			notInitial: 0,
			initializing: 1,
			initialized: 2
		};
	}

	get dataStatus() {

		return this._dataStatus;

	}


	///
	/// Cursor
	///

	setCursor(itemId) {

		// If the static cursor is set, then this DC could not set cursor to other rows
		if (this.settings.fixSelect &&
			(this.settings.fixSelect != "_FirstRecordDefault" || this.settings.fixSelect == itemId))
			return;

		if (this.__treeCollection) {
			// set cursor of tree collection
			this.setCursorTree(itemId);

			// pull current row id
			let currTreeId = this.__treeCollection.getCursor();
			if (currTreeId) {
				let currTreeItem = this.__treeCollection.getItem(currTreeId);
				if (currTreeItem)
					itemId = currTreeItem._itemId;
			}
		}

		let dc = this.__dataCollection;
		if (dc) {

			if (dc.getCursor() != itemId) {
				if (dc.exists(itemId) || itemId == null)
					dc.setCursor(itemId);
			}
			// If set rowId equal current cursor, it will not trigger .onAfterCursorChange event
			else {
				this.emit("changeCursor", this.getCursor());
			}
		}

	}

	/**
	 * 
	 * @param {string|number} itemId - Id of item or Id of row data
	 */
	setCursorTree(itemId) {

		let tc = this.__treeCollection;
		if (tc &&
			tc.getCursor() != itemId) {

			// If it is id of tree collection, then find row id of data
			let treeCursor = tc.find({ id: itemId }, true);
			if (treeCursor) {
				tc.setCursor(itemId);
			}
			// If it is not id of tree collection, then find/set root of data
			else {
				let treeItem = tc.find({ _itemId: itemId, $parent: 0 }, true);
				if (treeItem)
					tc.setCursor(treeItem.id);
			}
		}

	}

	getCursor(treeCursor = false) {

		// Cursor of tree collection
		if (treeCursor && this.__treeCollection) {

			let currId = this.__treeCollection.getCursor();
			if (currId) {

				let currItem = this.__treeCollection.getItem(currId);

				// filter current id for serialize
				this.__treeCollection.filter(item => item._itemId == currItem._itemId);

				// pull item with child items
				let currItemAndChilds = this.__treeCollection.serialize()[0] || null;

				// refresh filter
				this.refreshLinkCursor();

				return currItemAndChilds;

			}
		}

		let dc = this.__dataCollection;
		if (dc == null) return null;

		let currId = dc.getCursor();
		let currItem = dc.getItem(currId);

		return currItem;

	}

	getFirstRecord() {

		var dc = this.__dataCollection;
		if (dc == null) return null;

		var currId = dc.getFirstId();
		var currItem = dc.getItem(currId);

		return currItem;

	}

	getNextRecord(record) {

		var dc = this.__dataCollection;
		if (dc == null) return null;

		var currId = dc.getNextId(record.id);
		var currItem = dc.getItem(currId);

		return currItem;

	}

	/**
	 * @method refreshLinkCursor
	 * filter data in data view by match id of link data view
	 * 
	 */
	refreshLinkCursor() {

		let linkCursor;
		let dvLink = this.datacollectionLink;
		if (dvLink) {
			linkCursor = dvLink.getCursor();
		}

		let filterData = (rowData) => {

			// if link dc cursor is null, then show all data
			if (linkCursor == null)
				return true;
			else
				return this.isParentFilterValid(rowData);

		};

		if (this.__dataCollection)
			this.__dataCollection.filter(filterData);

		if (this.__treeCollection)
			this.__treeCollection.filter(filterData);

	}

	setStaticCursor() {

		if (this.settings.fixSelect) {

			// set cursor to the current user
			if (this.settings.fixSelect == "_CurrentUser") {

				var username = this.currentUserUsername();
				var userFields = this.datasource.fields((f) => f.key == "user");

				// find a row that contains the current user
				var row = this.__dataCollection.find((r) => {

					var found = false;

					userFields.forEach((f) => {

						if (found || r[f.columnName] == null) return;

						if (r[f.columnName].filter) { // Array - isMultiple
							found = r[f.colName].filter((data) => data.id == username).length > 0;
						}
						else if (r[f.columnName] == username) {
							found = true;
						}

					});

					return found;

				}, true);

				// set a first row of current user to cursor
				if (row) {
					this.__dataCollection.setCursor(row.id);

					this.setCursorTree(row.id);
				}
			}
			else if (this.settings.fixSelect == "_FirstRecord" || this.settings.fixSelect == "_FirstRecordDefault") {
				// // find a row that contains the current user
				// var row = this.__dataCollection.find((r) => {

				// 	var found = false;
				// 	if (!found) {
				// 		found = true;
				// 		return true; // just give us the first record
				// 	}

				// }, true);

				// // set a first row of current user to cursor
				// if (row)
				// 	this.__dataCollection.setCursor(row.id);

				let currRowId = this.__dataCollection.getCursor();
				if (!currRowId) {

					// set a first row to cursor
					let rowId = this.__dataCollection.getFirstId();
					if (rowId) {
						this.__dataCollection.setCursor(rowId);

						this.setCursorTree(rowId);
					}

				}
			}
			else {
				this.__dataCollection.setCursor(this.settings.fixSelect);

				this.setCursorTree(this.settings.fixSelect);
			}

		}

	}


	///
	/// Data
	///

	init() {

		// prevent initialize many times
		if (this.initialized) return;
		this.initialized = true;

		if (!this.__dataCollection.___AD.onAfterCursorChange) {
			this.__dataCollection.___AD.onAfterCursorChange = this.__dataCollection.attachEvent("onAfterCursorChange", () => {
debugger;
				var currData = this.getCursor();

				this.emit("changeCursor", currData);

			});
		}

		// relate data functions
		let isRelated = (relateData, rowId, PK = 'id') => {

			if (Array.isArray(relateData)) {
				return relateData.filter(v => (v[PK] || v) == rowId).length > 0;
			}
			else {
				return relateData && (relateData[PK] || relateData) == rowId;
			}

		};

		// events
		this.on('ab.datacollection.create', (msg, data) => {
debugger;
			let obj = this.datasource;
			if (!obj) return;

			if (!data || !data.data) return;

			let needAdd = false;
			let updatedVals = [];

			Promise.resolve()
				.then(() => {

					return new Promise((next, bad) => {

						// Query
						if (obj instanceof ABObjectQuery) {

							let objList = obj.objects(o => o.id == data.objectId) || [];

							needAdd = objList.length > 0;

							if (!needAdd)
								return next();

							let where = {
								glue: "or",
								rules: []
							};

							objList.forEach(o => {

								let newDataId = data.data[`${o.PK()}`];
								if (!newDataId) return;

								where.rules.push({
									key: `${o.alias}.${o.PK()}`,
									rule: "equals",
									value: newDataId
								});

							});

							obj.model().findAll({
								where: where
							})
								.catch(bad)
								.then(newQueryData => {

									updatedVals = newQueryData.data || [];
									updatedVals.forEach(v => {
										delete v.id;
									});

									next();

								});

						}
						// Object
						else {
							needAdd = obj.id == data.objectId;
							updatedVals = [data.data];
							next();
						}

					});

				})
				.then(() => {

					if (needAdd) {

						// normalize data before add to data collection
						var model = obj.model();
						model.normalizeData(updatedVals);


						(updatedVals || []).forEach(updatedV => {

							// filter condition before add 
							if (!this.isValidData(updatedV))
								return;

							if (!this.__dataCollection.exists(updatedV[`${obj.PK()}`])) {
								this.__dataCollection.add(updatedV, 0);
								this.emit('create', updatedV);
								// this.__dataCollection.setCursor(rowData.id);
							}

						});

						if (this.__treeCollection // && this.__treeCollection.exists(updatedVals.id)
						) {

							this.parseTreeCollection({
								data: updatedVals
							});
						}


					}

					// ABObject only
					if (!(obj instanceof ABObjectQuery)) {

						// if it is a linked object
						let connectedFields = this.datasource.fields(f =>
							f.key == 'connectObject' &&
							f.datasourceLink &&
							f.datasourceLink.id == data.objectId
						);

						// It should always be only one item for ABObject
						updatedVals = updatedVals[0];

						// update relation data
						if (updatedVals &&
							connectedFields &&
							connectedFields.length > 0) {

							// various PK name
							let PK = connectedFields[0].object.PK();
							if (!updatedVals.id && PK != 'id')
								updatedVals.id = updatedVals[PK];

							this.__dataCollection.find({}).forEach(d => {

								let updateItemData = {};

								connectedFields.forEach(f => {

									var updateRelateVal = updatedVals[f.fieldLink.relationName()] || {};
									let rowRelateVal = d[f.relationName()] || {};

									// Relate data
									if (Array.isArray(rowRelateVal) &&
										rowRelateVal.filter(v => v == updatedVals.id || v.id == updatedVals.id).length < 1 &&
										isRelated(updateRelateVal, d.id, PK)) {

										rowRelateVal.push(updatedVals);

										updateItemData[f.relationName()] = rowRelateVal;
										updateItemData[f.columnName] = updateItemData[f.relationName()].map(v => v.id || v);
									}
									else if (!Array.isArray(rowRelateVal) &&
										(rowRelateVal != updatedVals.id || rowRelateVal.id != updatedVals.id) &&
										isRelated(updateRelateVal, d.id, PK)) {

										updateItemData[f.relationName()] = updatedVals;
										updateItemData[f.columnName] = updatedVals.id || updatedVals;
									}

								});

								// If this item needs to update
								if (Object.keys(updateItemData).length > 0) {
									this.__dataCollection.updateItem(d.id, updateItemData);

									if (this.__treeCollection)
										this.__treeCollection.updateItem(d.id, updateItemData);

									this.emit('update', this.__dataCollection.getItem(d.id));
								}

							});

						}
					}

					// filter link data collection's cursor
					this.refreshLinkCursor();
					this.setStaticCursor();

				});

		});

		this.on('ab.datacollection.update', (msg, data) => {
debugger;
			let obj = this.datasource;
			if (!obj) return;

			// updated values
			let values = data.data;
			if (!values) return;

			let needUpdate = false;
			let isExists = false;
			let updatedIds = [];
			let updatedTreeIds = [];
			let updatedVals = {};

			// Query
			if (obj instanceof ABObjectQuery) {
				let objList = obj.objects(o => o.id == data.objectId) || [];
				needUpdate = (objList.length > 0);
				if (needUpdate) {

					(objList || []).forEach(o => {

						updatedIds = updatedIds.concat(this.__dataCollection.find(item => {
							return item[`${o.alias}.${o.PK()}`] == (values[o.PK()] || values.id);
						}).map(o => o.id) || []);

						// grouped queries
						if (this.__treeCollection) {
							updatedTreeIds = updatedTreeIds.concat(this.__treeCollection.find(item => {
								return item[`${o.alias}.${o.PK()}`] == (values[o.PK()] || values.id);
							}).map(o => o.id) || []);
						}
					});

					isExists = updatedIds.length > 0;

					updatedVals = this._queryUpdateData(objList, values);

				}
			}
			// Object
			else {
				needUpdate = (obj.id == data.objectId);
				if (needUpdate) {

					// various PK name
					if (!values.id && obj.PK() != 'id')
						values.id = values[obj.PK()];

					updatedIds.push(values.id);

					isExists = this.__dataCollection.exists(values.id);
					updatedVals = values;
				}
			}

			// if it is the source object
			if (needUpdate) {

				if (isExists) {

					if (this.isValidData(updatedVals)) {
						// normalize data before update data collection
						var model = obj.model();
						model.normalizeData(updatedVals);

						updatedIds = _.uniq(updatedIds);
						updatedIds.forEach(itemId => {
							this.__dataCollection.updateItem(itemId, updatedVals);
						});

						if (this.__treeCollection) {
							// update data in tree
							updatedTreeIds = _.uniq(updatedTreeIds);
							updatedTreeIds.forEach(itemId => {
								this.__treeCollection.updateItem(itemId, updatedVals);
							});
						}

						this.emit('update', updatedVals);

						// If the update item is current cursor, then should tell components to update.
						var currData = this.getCursor();
						if (currData && currData.id == updatedVals.id) {
							this.emit("changeCursor", currData);
						}
					}
					else if (updatedVals.id) {
						// If the item is current cursor, then the current cursor should be cleared.
						var currData = this.getCursor();
						if (currData && currData.id == updatedVals.id)
							this.emit("changeCursor", null);

						this.__dataCollection.remove(updatedVals.id);

						// TODO: update tree list
						// if (this.__treeCollection) {
						// 	this.__treeCollection.remove(updatedVals.id);
						// }

						this.emit('delete', updatedVals.id);
					}
				}
				// filter before add new record
				else if (this.isValidData(updatedVals)) {

					// this means the updated record was not loaded yet so we are adding it to the top of the grid
					// the placemet will probably change on the next load of the data
					this.__dataCollection.add(updatedVals, 0);

					if (this.__treeCollection)
						this.parseTreeCollection({
							data: [updatedVals]
						});

					this.emit('create', updatedVals);
				}
			}

			// if it is a linked object
			let connectedFields = obj.fields(f =>
				f.key == 'connectObject' &&
				f.datasourceLink &&
				f.datasourceLink.id == data.objectId
			);

			// update relation data
			if (obj instanceof ABObject &&
				connectedFields &&
				connectedFields.length > 0) {

				// various PK name
				let PK = connectedFields[0].object.PK();
				if (!values.id && PK != 'id')
					values.id = values[PK];

				this.__dataCollection.find({}).forEach(d => {

					let updateItemData = {};

					connectedFields.forEach(f => {

						let updateRelateVal = values[f.fieldLink.relationName()] || {};
						let rowRelateVal = d[f.relationName()] || {};

						// Unrelate data
						if (Array.isArray(rowRelateVal) &&
							rowRelateVal.filter(v => v == values.id || v.id == values.id).length > 0 &&
							!isRelated(updateRelateVal, d.id, PK)) {

							updateItemData[f.relationName()] = rowRelateVal.filter(v => (v.id || v) != values.id);
							updateItemData[f.columnName] = updateItemData[f.relationName()].map(v => v.id || v);
						}
						else if (!Array.isArray(rowRelateVal) &&
							(rowRelateVal == values.id || rowRelateVal.id == values.id) &&
							!isRelated(updateRelateVal, d.id, PK)) {

							updateItemData[f.relationName()] = null;
							updateItemData[f.columnName] = null;
						}

						// Relate data or Update
						if (Array.isArray(rowRelateVal) && isRelated(updateRelateVal, d.id, PK)) {

							// update relate data
							if (rowRelateVal.filter(v => v == values.id || v.id == values.id).length > 0) {
								rowRelateVal.forEach((v, index) => {

									if (v == values.id || v.id == values.id)
										rowRelateVal[index] = values;

								});
							}
							// add new relate
							else {
								rowRelateVal.push(values);
							}

							updateItemData[f.relationName()] = rowRelateVal;
							updateItemData[f.columnName] = updateItemData[f.relationName()].map(v => v.id || v);
						}
						else if (!Array.isArray(rowRelateVal) &&
							(rowRelateVal != values.id || rowRelateVal.id != values.id) &&
							isRelated(updateRelateVal, d.id, PK)) {

							updateItemData[f.relationName()] = values;
							updateItemData[f.columnName] = values.id || values;
						}


					});

					// If this item needs to update
					if (Object.keys(updateItemData).length > 0) {
						this.__dataCollection.updateItem(d.id, updateItemData);

						if (this.__treeCollection)
							this.__treeCollection.updateItem(d.id, updateItemData);

						this.emit('update', this.__dataCollection.getItem(d.id));
					}

				});

			}


			// filter link data collection's cursor
			this.refreshLinkCursor();
			this.setStaticCursor();

		});

		// We are subscribing to notifications from the server that an item may be stale and needs updating
		// We will improve this later and verify that it needs updating before attempting the update on the client side
		this.on('ab.datacollection.stale', (msg, data) => {
debugger;
			// if we don't have a datasource or model, there is nothing we can do here:
			// Verify the datasource has the object we are listening for if not just stop here
			if (!this.datasource || !this.model || this.datasource.id != data.objectId) {
				return;
			}



			// updated values
			var values = data.data;

			// use the Object's defined Primary Key:
			var PK = this.model.object.PK();
			if (!values[PK]) {
				PK = 'id';
			}

			if (values) {

				if (this.__dataCollection.exists(values[PK])) {
					var cond = { where: {} };
					cond.where[PK] = values[PK];
					// this data collection has the record so we need to query the server to find out what it's latest data is so we can update all instances
					this.model.staleRefresh(cond).then((res) => {

						// check to make sure there is data to work with
						if (Array.isArray(res.data) && res.data.length) {
							// tell the webix data collection to update using their API with the row id (values.id) and content (res.data[0]) 
							if (this.__dataCollection.exists(values[PK])) {
								this.__dataCollection.updateItem(values[PK], res.data[0]);
							}

							// If the update item is current cursor, then should tell components to update.
							var currData = this.getCursor();
							if (currData && currData[PK] == values[PK]) {
								this.emit("changeCursor", currData);
							}
						} else {
							// If there is no data in the object then it was deleted...lets clean things up
							// If the deleted item is current cursor, then the current cursor should be cleared.
							var currId = this.getCursor();
							if (currId == values[PK])
								this.emit("changeCursor", null);

							this.__dataCollection.remove(values[PK]);
							this.emit('delete', values[PK]);
						}
					});

				}
			}

			// filter link data collection's cursor
			this.refreshLinkCursor();
			this.setStaticCursor();

		});

		this.on('ab.datacollection.delete', (msg, data) => {
debugger;
			let obj = this.datasource;
			if (!obj) return;

			let deleteId = data.data;
			let needDelete = false;
			let deletedIds = [];
			let deletedTreeIds = []

			// Query
			if (obj instanceof ABObjectQuery) {
				let objList = obj.objects(o => o.id == data.objectId) || [];
				needDelete = (objList.length > 0);
				if (needDelete) {

					(objList || []).forEach(o => {

						deletedIds = this.__dataCollection.find(item => {
							return item[`${o.alias}.${o.PK()}`] == deleteId;
						}).map(o => o.id) || [];

						// grouped queries
						if (this.__treeCollection) {
							deletedTreeIds = this.__treeCollection.find(item => {
								return item[`${o.alias}.${o.PK()}`] == deleteId;
							}).map(o => o.id) || [];
						}
					});

				}
			}
			// Object
			else {
				needDelete = (obj.id == data.objectId);
				if (needDelete) {
					deletedIds.push(deleteId);
				}
			}

			// if it is the source object
			if (needDelete) {

				// If the deleted item is current cursor, then the current cursor should be cleared.
				var currData = this.getCursor();

				deletedIds.forEach(delId => {

					if (currData && currData[obj.PK()] == delId)
						this.emit("changeCursor", null);

					if (this.__dataCollection.exists(delId))
						this.__dataCollection.remove(delId);
				});

				if (this.__treeCollection) {
					deletedTreeIds.forEach(delId => {
						if (this.__treeCollection.exists(delId))
							this.__treeCollection.remove(delId);
					})
				}

				if (deletedIds[0])
					this.emit('delete', deletedIds[0]);
			}

			// if it is a linked object
			let connectedFields = obj.fields(f =>
				f.key == 'connectObject' &&
				f.datasourceLink &&
				f.datasourceLink.id == data.objectId
			);

			// update relation data
			if (obj instanceof ABObject &&
				deletedIds[0] &&
				connectedFields &&
				connectedFields.length > 0) {

				this.__dataCollection.find({}).forEach(d => {

					let updateRelateVals = {};

					connectedFields.forEach(f => {

						let relateVal = d[f.relationName()];
						if (relateVal == null) return;

						if (Array.isArray(relateVal) &&
							relateVal.filter(v => v == deleteId || v.id == deleteId).length > 0) {

							updateRelateVals[f.relationName()] = relateVal.filter(v => (v.id || v) != deleteId);
							updateRelateVals[f.columnName] = updateRelateVals[f.relationName()].map(v => v.id || v);
						}
						else if (relateVal == deleteId || relateVal.id == deleteId) {
							updateRelateVals[f.relationName()] = null;
							updateRelateVals[f.columnName] = null;
						}

					});

					// If this item needs to update
					if (Object.keys(updateRelateVals).length > 0) {

						this.__dataCollection.updateItem(d.id, updateRelateVals);

						if (this.__treeCollection)
							this.__treeCollection.updateItem(d.id, updateRelateVals);


						this.emit('update', this.__dataCollection.getItem(d.id));
					}

				});

			}

		});


		// add listeners when cursor of link data collection is changed
		let linkDv = this.datacollectionLink;
		if (linkDv) {
			this.eventAdd({
				emitter: linkDv,
				eventName: "changeCursor",
				listener: () => {
					this.refreshLinkCursor();
					this.setStaticCursor();
				}
			});
		}

	}

	loadData( start, limit ) {

		// mark data status is initializing
		if (this._dataStatus == this.dataStatusFlag.notInitial) {
			this._dataStatus = this.dataStatusFlag.initializing;
			this.emit("initializingData", {});
		}

		var obj = this.datasource;
		if (obj == null) {
			this._dataStatus = this.dataStatusFlag.initialized;
			return Promise.resolve([]);
		}

		var model = obj.model();
		if (model == null) {
			this._dataStatus = this.dataStatusFlag.initialized;
			return Promise.resolve([]);
		}

		var sorts = this.settings.objectWorkspace.sortFields || [];

		// pull filter conditions
		var wheres = this.settings.objectWorkspace.filterConditions || null;

		// set query condition
		var cond = {
			where: wheres,
			// limit: limit || 20,
			skip: start || 0,
			sort: sorts,
		};

        //// NOTE: we no longer set a default limit on loadData() but
        //// require the platform.loadData() to pass in a default limit.
        if (limit) {
            cond.limit = limit;
        }

		// if settings specify loadAll, then remove the limit
		if (this.settings.loadAll) {
			delete cond.limit;
		}

		/*
         * waitForDataCollectionToInitialize()
         * there are certain situations where this datacollection shouldn't
         * load until another one has loaded.  In those cases, the fn()
         * will wait for the required datacollection to emit "initializedData"
         * before continuing on.
         * @param {ABViewDataCollection} DC
         * 		  the DC this datacollection depends on.
         * @returns {Promise}
         */
        var waitForDataCollectionToInitialize = (DC) => {
            return new Promise((resolve, reject) => {
                switch (DC.dataStatus) {
                    // if that DC hasn't started initializing yet, start it!
                    case DC.dataStatusFlag.notInitial:
                        DC.loadData().catch(reject);
                    // no break;

                    // once in the process of initializing
                    case DC.dataStatusFlag.initializing:
                        // listen for "initializedData" event from the DC
                        // then we can continue.
                        this.eventAdd({
                            emitter: DC,
                            eventName: "initializedData",
                            listener: () => {
                                // go next
                                resolve();
                            }
                        });
                        break;

                    // if it is already initialized, we can continue:
                    case DC.dataStatusFlag.initialized:
                        resolve();
                        break;

                    // just in case, if the status is not known, just continue
                    default:
                        resolve();
                        break;
                }
            });
        };

		return Promise.resolve()
            //
            // Step 1: make sure any DataCollections we are linked to are
            // initialized first.  Then proceed with our initialization.
            //
            .then(() => {
                // If we are linked to another datacollection then wait for it
                let linkDc = this.datacollectionLink;
                if (!linkDc) return Promise.resolve();

                return waitForDataCollectionToInitialize(linkDc);
            })
            //
            // Step 2: if we have any filter rules that depend on other DataCollections,
            // then wait for them to be initialized first.
            // eg: "(not_)in_data_collection" rule filters
            .then(() => {
                return new Promise((resolve, reject) => {
                    if (
                        wheres == null ||
                        wheres.rules == null ||
                        !wheres.rules.length
                    )
                        return resolve();

                    var dcFilters = [];

                    wheres.rules.forEach((rule) => {
                        // if this collection is filtered by data collections we need to load them in case we need to validate from them later
                        if (
                            rule.rule == "in_data_collection" ||
                            rule.rule == "not_in_data_collection"
                        ) {
                            var dv = this.application.datacollections(
                                (dc) => dc.id == rule.value
                            )[0];
                            if (dv) {
                                dcFilters.push(
                                    waitForDataCollectionToInitialize(dv)
                                );
                            }
                        }
                    });

                    Promise.all(dcFilters)
                        .then(() => {
                            resolve();
                        })
                        .catch(reject);
                });
            })

			// pull data to data collection
			.then(() => {

				return new Promise((resolve, reject) => {

                    // we will keep track of the resolve, reject for this
                    // operation.
                    // the actual resolve() should happen in the 
                    // .processIncomingData() after the  data is processed.
                    this._pendingLoadDataResolve = {
                        resolve: resolve,
                        reject: reject
                    };
//// Core Migration Note:
//// the ABViewDataCollectionCore now manages data in a different way:
//// local data  vs  Remote Data
//// this will need to be updated to reflect that management:
//// (and also explains why we refactored things into .processIncomingData())
					model.findAll(cond)
						.then((data) => {

							this.processIncomingData(data);
							
////
//// LEFT OFF: debugging ABDatacollectionCore : why UI isn't updated after
//// data loads?
////  -->  check the .init() for messing with onAfterChange ...

							// resolve();

						})
						.catch(err => {
							reject(err);
						});

				});

			});

	}

    /**
     * processIncomingData()
     * is called from loadData() once the data is returned.  This method
     * allows the platform to make adjustments to the data based upon any
     * platform defined criteria.
     * @param {obj} data  the data as it was returned from the Server
     *        which should be in following format:
     *        {
     *          status: "success", // or "error"
     *          data:[ {ABObjectData}, {ABObjectData}, ...]
     *        }
     */
    processIncomingData(data) {
        return Promise.resolve().then(() => {

            // store total count
            this.__totalCount = data.total_count;

            // load the data into our actual dataCollection
            this.__dataCollection.parse(data);

            this.parseTreeCollection(data);

            // if we are linked, then refresh our cursor
            var linkDv = this.datacollectionLink;
            if (linkDv) {

                // filter data by match link data collection
                this.refreshLinkCursor();
                this.setStaticCursor();

            }
            else {

                // set static cursor
                this.setStaticCursor();

            }

            // mark initialized data
            if (this._dataStatus != this.dataStatusFlag.initialized) {
                this._dataStatus = this.dataStatusFlag.initialized;
                this.emit("initializedData", {});
            }

			// If dc set load all, then it will not trigger .loadData in dc at .onAfterLoad event
			if (this.settings.loadAll) {
				this.emit("loadData", {});
			}

            if (this._pendingLoadDataResolve) {
                this._pendingLoadDataResolve.resolve();

                // after we call .resolve() stop tracking this:
                this._pendingLoadDataResolve = null;
            }
        });
    }

	reloadData() {
		this.__dataCollection.clearAll();

		if (this.__treeCollection)
			this.__treeCollection.clearAll();

		return this.loadData(null, null, null);
	}

	getData(filter) {

		var dc = this.__dataCollection;
		if (dc) {

			return dc.find(row => {

				// data collection filter
				var isValid = this.isValidData(row);

				// parent dc filter
				var linkDv = this.datacollectionLink;
				if (isValid && linkDv) {
					isValid = this.isParentFilterValid(row);
				}

				// addition filter
				if (isValid && filter) {
					isValid = filter(row);
				}

				return isValid;
			});
		}
		else {
			return [];
		}

	}

	isParentFilterValid(rowData) {

		// data is empty
		if (rowData == null) return null;

		var linkDv = this.datacollectionLink;
		if (linkDv == null) return true;

		var fieldLink = this.fieldLink;
		if (fieldLink == null) return true;

		// the parent's cursor is not set.
		var linkCursor = linkDv.getCursor();
		if (linkCursor == null) return false;

		var linkVal = rowData[fieldLink.relationName()];
		if (linkVal == null) {

			// try to get relation value(id) again
			if (rowData[fieldLink.columnName]) {
				linkVal = rowData[fieldLink.columnName];
			}
			else {
				return false;
			}
		}

		// array - 1:M , M:N
		if (linkVal.filter) {
			return linkVal.filter(val => (val.id || val) == linkCursor.id).length > 0;
		}
		else {
			return (linkVal.id || linkVal) == linkCursor.id;
		}
	}

	clearAll() {
		if (this.__dataCollection)
			this.__dataCollection.clearAll();

		if (this.__treeCollection)
			this.__treeCollection.clearAll();

		this._dataStatus = this.dataStatusFlag.notInitial;
	}

	get totalCount() {
		return this.__totalCount || 0;
	}

	get dataStatusFlag() {
		return {
			notInitial: 0,
			initializing: 1,
			initialized: 2
		};
	}

	get dataStatus() {

		return this._dataStatus;

	}


	///
	/// Components
	///

	/**
	 * @method bind
	 * 
	 * 
	 * @param {Object} component - a webix element instance
	*/
	bind(component) {
		console.error("Platform.ABDataCollection.bind() Not implemented");
	}
	

	unbind(component) {
		console.error("Platform.ABDataCollection.unbind() Not implemented");
	}



	removeComponent(comId) {

		// get index
		let index = this.__bindComponentIds.indexOf(comId);

		// delete
		this.__bindComponentIds.splice(index, 1);

	}

	refreshFilterConditions(wheres = null) {

		// Set filter of data source
		if (this.__filterDatasource == null)
			this.__filterDatasource = new RowFilter();

		this.__filterDatasource.objectLoad(this.datasource);
		this.__filterDatasource.viewLoad(this);

		if (this.datasource) {

			let filterConditions;

			// Query
			if (this.datasource instanceof ABObjectQuery) {
				filterConditions = this.datasource.where;
			}
			// Object
			else if (this.datasource instanceof ABObject) {

				let currentView = this.datasource.currentView();
				if (currentView && currentView.filterConditions)
					filterConditions = currentView.filterConditions;

			}

			if (filterConditions)
				this.__filterDatasource.setValue(filterConditions);
			else
				this.__filterDatasource.setValue({});
		}
		else
			this.__filterDatasource.setValue(DefaultValues.settings.objectWorkspace.filterConditions);

		// Set filter of data view
		if (this.__filterDatacollection == null)
			this.__filterDatacollection = new RowFilter();

		this.__filterDatacollection.objectLoad(this.datasource);
		this.__filterDatacollection.viewLoad(this);

		if (wheres)
			this.settings.objectWorkspace.filterConditions = wheres;

		if (this.settings &&
			this.settings.objectWorkspace &&
			this.settings.objectWorkspace.filterConditions) {
			this.__filterDatacollection.setValue(this.settings.objectWorkspace.filterConditions);
		}
		else {
			this.__filterDatacollection.setValue(DefaultValues.settings.objectWorkspace.filterConditions);
		}

	}

	get isGroup() {
		return this.__isGroup || false;
	}


	///
	/// Sync type
	///

	get syncTypeFlag() {
		return {
			server: 1,
			client: 2
		};
	}

	get syncType() {
		return this.settings.syncType || DefaultValues.syncType;
	}


	/** Private methods */

	/**
	 * @method _dataCollectionNew
	 * Get webix.DataCollection
	 * 
	 * @return {webix.DataCollection}
	 * 
	 * @param {Array} data - initial data
	 */
	_dataCollectionNew(data) {

		console.error("the platform.ABDataCollection._dataCollectionNew() is expected to return a proper DataCollection!");
		return null;

	}

	/**
	 * @method _treeCollectionNew
	 * Get webix.TreeCollection
	 * 
	 * @return {webix.TreeCollection}
	 * 
	 */
	_treeCollectionNew() {

		console.error("the platform.ABDataCollection._treeCollectionNew() is expected to return a proper TreeCollection!");
		return null;

	}

	parseTreeCollection(data = {}) {
		console.error("Platform.ABDataCollection.parseTreeCollection() missing!");

	}
	// parseTreeCollection(data = {}) {

	// 	if (!(this.__datasource instanceof ABObjectQuery) ||
	// 		!this.__datasource.isGroup ||
	// 		!this.__treeCollection)
	// 		return;

	// 	let addRowToTree = (join = {}, parentAlias = null) => {

	// 		let alias = join.alias;

	// 		(data.data || []).forEach(row => {

	// 			let dataId = row[`${alias}.uuid`] || row[`${alias}.id`];
	// 			if (!dataId) return;

	// 			// find parent nodes
	// 			let parentItemIds = [];
	// 			let parentId = row[`${parentAlias}.uuid`] || row[`${parentAlias}.id`];
	// 			if (parentId) {
	// 				parentItemIds = this.__treeCollection
	// 					.find(item => item._alias == parentAlias && item._dataId == parentId)
	// 					.map(item => item.id);
	// 			}

	// 			// check exists
	// 			let exists = this.__treeCollection.find(item => {
	// 				return item._alias == alias &&
	// 					item._dataId == dataId &&
	// 					(parentItemIds.length == 0 || parentItemIds.indexOf(item.$parent) > -1);
	// 			}, true);
	// 			if (exists) return;

	// 			let treeNode = {};
	// 			treeNode._alias = alias;
	// 			treeNode._dataId = dataId;
	// 			treeNode._itemId = row.id; // Keep row id for set cursor to data collection

	// 			Object.keys(row).forEach(propName => {

	// 				// Pull value from alias
	// 				if (propName.indexOf(`${alias}.`) == 0) {
	// 					treeNode[propName] = row[propName];
	// 				}

	// 			});

	// 			if (row.translations)
	// 				treeNode.translations = row.translations;

	// 			// child nodes
	// 			if (parentItemIds.length > 0)
	// 				parentItemIds.forEach(parentItemId => {
	// 					this.__treeCollection.add(treeNode, null, parentItemId);
	// 				});
	// 			// root node
	// 			else
	// 				this.__treeCollection.add(treeNode, null);

	// 		});

	// 		// Sub-joins
	// 		(join.links || []).forEach(link => {
	// 			addRowToTree(link, alias);
	// 		});

	// 	};

	// 	// Show loading cursor
	// 	(this.__bindComponentIds || []).forEach(comId => {

	// 		let boundComp = $$(comId);
	// 		if (boundComp &&
	// 			boundComp.showProgress)
	// 			boundComp.showProgress({ type: "icon" });

	// 	});

	// 	addRowToTree(this.__datasource.joins());


	// 	// Hide loading cursor
	// 	(this.__bindComponentIds || []).forEach(comId => {

	// 		let boundComp = $$(comId);
	// 		if (boundComp &&
	// 			boundComp.hideProgress)
	// 			boundComp.hideProgress();

	// 	})
	// }

	// /**
	//  * @method _queryUpdateData
	//  * 
	//  * @param {Array} objList - List of ABObject
	//  * @param {Object} values 
	//  */
	// _queryUpdateData(objList, values) {

	// 	let updatedVals = {};

	// 	// Add alias to properties of update data
	// 	Object.keys(values).forEach(key => {
	// 		objList.forEach(oItem => {

	// 			let alias = oItem.alias;

	// 			updatedVals[`${alias}.${key}`] = values[key];

	// 			// Add alias to properties of .translations
	// 			if (key == 'translations' &&
	// 				values['translations'] &&
	// 				values['translations'].length) {

	// 				updatedVals.translations = [];

	// 				values['translations'].forEach(tran => {

	// 					let updatedTran = {};

	// 					Object.keys(tran).forEach(tranKey => {

	// 						if (tranKey == "language_code")
	// 							updatedTran["language_code"] = tran["language_code"];
	// 						else
	// 							updatedTran[`${alias}.${tranKey}`] = tran[tranKey];

	// 					});

	// 					updatedVals.translations.push(updatedTran);

	// 				});
	// 			}

	// 		});
	// 	});

	// 	return updatedVals;

	// }

	isValidData(rowData) {

		let result = true;

		if (this.__filterDatasource)
			result = result && this.__filterDatasource.isValid(rowData);

		if (this.__filterDatacollection)
			result = result && this.__filterDatacollection.isValid(rowData);

		return result;

	}

	// Clone

	clone(settings) {
		settings = settings || this.toObj();
		var clonedDatacollection = new ABDatacollection(settings, this.application);

		return new Promise((resolve, reject) => {

			// load the data
			clonedDatacollection.loadData()
				.then(() => {

					// set the cursor
					var cursorID = this.getCursor();

					if (cursorID) {
						// NOTE: webix documentation issue: .getCursor() is supposed to return
						// the .id of the item.  However it seems to be returning the {obj} 
						if (cursorID.id) cursorID = cursorID.id;

						clonedDatacollection.setCursor(cursorID);
					}

					resolve(clonedDatacollection);
				})
				.catch(reject);
		})
	}

	filteredClone(filters) {
		var obj = this.toObj();

		// check to see that filters are set (this is sometimes helpful to select the first record without doing so at the data collection level)
		if (typeof filters != "undefined") {
			obj.settings.objectWorkspace.filterConditions = { glue: 'and', rules: [obj.settings.objectWorkspace.filterConditions, filters] }
		}

		return this.clone(obj); // new ABViewDataCollection(settings, this.application, this.parent);

	}


	//
	// Event handles
	//

	/**
	 * @method eventAdd()
	 *
	 * 
	 *
	 * @param {object} evt - {
	 * 							emitter: object,
	 * 							eventName: string,
	 * 							listener: function
	 * 						}
	 */
	eventAdd(evt) {

		if (!evt ||
			!evt.emitter ||
			!evt.listener)
			return;

		this.__events = this.__events || [];

		let exists = this.__events.find(e => {
			return e.emitter == evt.emitter &&
				e.eventName == evt.eventName;
			// && e.listener == evt.listener;
		});

		if (!exists || exists.length < 1) {

			// add to array
			this.__events.push({
				emitter: evt.emitter,
				eventName: evt.eventName,
				listener: evt.listener
			});

			// listening this event
			evt.emitter.on(evt.eventName, evt.listener);
		}

	}


	/**
	 * @method eventClear()
	 * unsubscribe all events.
	 * should do it before destroy a component
	 *
	 */
	eventClear() {

		if (this.__events &&
			this.__events.length > 0) {
			this.__events.forEach(e => {
				e.emitter.removeListener(e.eventName, e.listener);
			});
		}

	}

}