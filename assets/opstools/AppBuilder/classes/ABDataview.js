import ABObject from "./ABObject";
import ABObjectQuery from "./ABObjectQuery";
import RowFilter from "./RowFilter"

var EventEmitter = require('events').EventEmitter;

var DefaultValues = {
	id: "uuid",
	label: "", // label
	object: {}, // json of ABObject
	query: {}, // json of ABObjectQuery
	settings: {
		datasourceID: '', 		// id of ABObject or ABObjectQuery
		linkDataviewID: '',	// id of ABDataview
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

export default class ABDataview extends EventEmitter {

	constructor(attributes, application) {

		super();

		attributes = attributes || {};

		this.application = application;

		this.fromValues(attributes);

		this.__dataCollection = this._dataCollectionNew([]);

		// Set filter value
		this.__filterComponent = new RowFilter();
		this.__filterComponent.objectLoad(this.datasource);
		this.__filterComponent.viewLoad(this);
		this.setFilterConditions(this.settings.objectWorkspace.filterConditions);

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
		OP.Multilingual.translate(this, this, ['label']);

		// if this is being instantiated on a read from the Property UI,
		this.settings.datasourceID = values.settings.datasourceID || DefaultValues.settings.datasourceID;
		this.settings.linkDataviewID = values.settings.linkDataviewID || DefaultValues.settings.linkDataviewID;
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

		OP.Multilingual.unTranslate(this, this, ["label"]);

		return {
			id: this.id,
			settings: _.cloneDeep(this.settings || {}),
			translations: this.translations,
		};

	}

	/**
	* @method save()
	*
	* persist this instance of ABDataview with it's parent
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
			this.application.dataviewSave(this)
				.then(newDataview => {

					if (newDataview &&
						newDataview.id &&
						!this.id)
						this.id = newDataview.id;

					// update data source
					let updateDataview = this.application.dataviews(dv => dv.id == this.id)[0];
					if (updateDataview) {

						if (newDataview.query && newDataview.query[0]) {
							updateDataview.datasource = new ABObjectQuery(newDataview.query[0], this.application);
							this.settings.isQuery = true;
						}
						else if (newDataview.object && newDataview.object[0]) {
							updateDataview.datasource = new ABObject(newDataview.object[0], this.application);
							this.settings.isQuery = false;
						}

					}

					AD.comm.hub.publish('ab.dataview.update', {
						dataviewId: this.id
					});

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
	 * destroy the current instance of ABDataview
	 *
	 * also remove it from our parent application
	 *
	 * @return {Promise}
	 */
	destroy() {
		return this.application.dataviewDestroy(this);
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

		this.__filterComponent.objectLoad(this.datasource);
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
	* @method dataviewLink
	* return a ABDataview that link of this.
	*
	* @return {ABDataview}
	*/
	get dataviewLink() {

		if (!this.application)
			return null;

		return this.application.dataviews(dv => dv.id == this.settings.linkDataviewID)[0];
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

	setCursor(rowId) {

		// If the static cursor is set, then this DC could not set cursor to other rows
		if (this.settings.fixSelect &&
			(this.settings.fixSelect != "_FirstRecordDefault" || this.settings.fixSelect == rowId))
			return;

		let tc = this.__treeCollection;
		if (tc && 
			tc.getCursor() != rowId) {

			// If it is id of tree collection, then find row id of data
			let treeCursor = tc.find({ id: rowId }, true);
			if (treeCursor) {
				tc.setCursor(rowId);

				// change and pass real row id to dc
				rowId = treeCursor._rowId;

			}
			// If it is not id of tree collection, then find/set root of data
			else {
				let treeItem = tc.find({ _rowId: rowId }, true);
				if (treeItem)
					tc.setCursor(treeItem.id);
			}

			// if (tc.getCursor() != rowId)
			// 	tc.setCursor(rowId);

			// // Find deepest child id for data collection
			// let lastRowId = rowId;
			// while (lastRowId) {

			// 	lastRowId = tc.getFirstChildId(lastRowId);
			// 	if (lastRowId)
			// 		rowId = lastRowId;

			// }

		}

		let dc = this.__dataCollection;
		if (dc) {

			if (dc.getCursor() != rowId)
				dc.setCursor(rowId);
			// If set rowId equal current cursor, it will not trigger .onAfterCursorChange event
			else {
				this.emit("changeCursor", this.getCursor());
			}
		}

	}

	getCursor(treeCursor = false) {

		// Cursor of tree collection
		if (treeCursor && this.__treeCollection) {

			let currId = this.__treeCollection.getCursor();
			if (currId) {

				// filter current id for serialize
				this.__treeCollection.filter(item => item.id == currId);

				// pull item with child items
				let currItem = this.__treeCollection.serialize()[0] || null;

				// refresh filter
				this.refreshLinkCursor();

				return currItem;

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
		let dvLink = this.dataviewLink;
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

		this.setStaticCursor();
	}

	setStaticCursor() {

		if (this.settings.fixSelect) {

			// set cursor to the current user
			if (this.settings.fixSelect == "_CurrentUser") {

				var username = OP.User.username();
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

					if (this.__treeCollection)
						this.__treeCollection.setCursor(row.id);
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

				// set a first row to cursor
				var rowId = this.__dataCollection.getFirstId();
				if (rowId) {
					this.__dataCollection.setCursor(rowId);
	
					if (this.__treeCollection)
						this.__treeCollection.setCursor(rowId);
				}
			}
			else {
				this.__dataCollection.setCursor(this.settings.fixSelect);

				if (this.__treeCollection)
					this.__treeCollection.setCursor(this.settings.fixSelect);
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
		AD.comm.hub.subscribe('ab.datacollection.create', (msg, data) => {

			let obj = this.datasource;
			if (!obj)
				return;

			var values = data.data;

			if (obj.id == data.objectId) {

				// normalize data before add to data collection
				var model = obj.model();
				model.normalizeData(values);

				// filter condition before add 
				if (!this.__filterComponent.isValid(values))
					return;

				if (!this.__dataCollection.exists(values.id)) {
					this.__dataCollection.add(values, 0);
					this.emit('create', values);
					// this.__dataCollection.setCursor(rowData.id);
				}

				if (this.__treeCollection &&
					!this.__treeCollection.exists(values.id)) {
					this.parseTreeCollection({
						data: [values]
					});
				}


			}

			// if it is a linked object
			let connectedFields = this.datasource.fields(f =>
				f.key == 'connectObject' &&
				f.datasourceLink &&
				f.datasourceLink.id == data.objectId
			);

			// update relation data
			if (connectedFields && connectedFields.length > 0) {

				// various PK name
				let PK = connectedFields[0].object.PK();
				if (!values.id && PK != 'id')
					values.id = values[PK];

				this.__dataCollection.find({}).forEach(d => {

					let updateItemData = {};

					connectedFields.forEach(f => {

						var updateRelateVal = values[f.fieldLink.relationName()] || {};
						let rowRelateVal = d[f.relationName()] || {};

						// Relate data
						if (Array.isArray(rowRelateVal) &&
							rowRelateVal.filter(v => v == values.id || v.id == values.id).length < 1 &&
							isRelated(updateRelateVal, d.id, PK)) {

							rowRelateVal.push(values);

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

		});

		AD.comm.hub.subscribe('ab.datacollection.update', (msg, data) => {

			let obj = this.datasource;
			if (!obj)
				return;

			// updated values
			var values = data.data;
			if (!values) return;

			// if it is the source object
			if (obj.id == data.objectId) {

				// various PK name
				if (!values.id && obj.PK() != 'id')
					values.id = values[obj.PK()];

				if (this.__dataCollection.exists(values.id)) {

					if (this.__filterComponent.isValid(values)) {
						// normalize data before update data collection
						var model = obj.model();
						model.normalizeData(values);
						this.__dataCollection.updateItem(values.id, values);

						if (this.__treeCollection)
							this.__treeCollection.updateItem(values.id, values)

						this.emit('update', values);

						// If the update item is current cursor, then should tell components to update.
						var currData = this.getCursor();
						if (currData && currData.id == values.id) {
							this.emit("changeCursor", currData);
						}
					} else {
						// If the item is current cursor, then the current cursor should be cleared.
						var currData = this.getCursor();
						if (currData && currData.id == values.id)
							this.emit("changeCursor", null);

						this.__dataCollection.remove(values.id);

						if (this.__treeCollection)
							this.__treeCollection.remove(values.id);

						this.emit('delete', values.id);
					}
				}
				// filter before add new record
				else if (this.__filterComponent.isValid(values)) {

					// this means the updated record was not loaded yet so we are adding it to the top of the grid
					// the placemet will probably change on the next load of the data
					this.__dataCollection.add(values, 0);

					if (this.__treeCollection)
						this.parseTreeCollection({
							data: [values]
						});

					this.emit('create', values);
				}
			}

			// if it is a linked object
			let connectedFields = this.datasource.fields(f =>
				f.key == 'connectObject' &&
				f.datasourceLink &&
				f.datasourceLink.id == data.objectId
			);

			// update relation data
			if (connectedFields && connectedFields.length > 0) {

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

		});

		// We are subscribing to notifications from the server that an item may be stale and needs updating
		// We will improve this later and verify that it needs updating before attempting the update on the client side
		AD.comm.hub.subscribe('ab.datacollection.stale', (msg, data) => {

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

		});

		AD.comm.hub.subscribe('ab.datacollection.delete', (msg, data) => {

			let obj = this.datasource;
			if (!obj)
				return;

			// id of a deleted item
			var deleteId = data.data; // uuid

			// if it is the source object
			if (obj.id == data.objectId &&
				this.__dataCollection.exists(deleteId)) {

				// If the deleted item is current cursor, then the current cursor should be cleared.
				var currData = this.getCursor();
				if (currData && currData[obj.PK()] == deleteId)
					this.emit("changeCursor", null);

				this.__dataCollection.remove(deleteId);

				if (this.__treeCollection)
					this.__treeCollection.remove(deleteId);

				this.emit('delete', deleteId);
			}

			// if it is a linked object
			let connectedFields = obj.fields(f =>
				f.key == 'connectObject' &&
				f.datasourceLink &&
				f.datasourceLink.id == data.objectId
			);

			// update relation data
			if (connectedFields && connectedFields.length > 0) {

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
		let linkDv = this.dataviewLink;
		if (linkDv) {
			this.eventAdd({
				emitter: linkDv,
				eventName: "changeCursor",
				listener: () => { this.refreshLinkCursor(); }
			});
		}

		// load data to initial the data collection
		// this.loadData();

		// if (this.settings.loadAll)
		// 	this.loadData();
		// else
		// 	this.__dataCollection.loadNext(20, 0);

	}

	loadData(start, limit, callback) {

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

		// calculate default value of $height of rows
		var defaultHeight = 0;
		var minHeight = 0;
		var imageFields = obj.fields((f) => f.key == 'image');
		imageFields.forEach(function (f) {
			if (parseInt(f.settings.useHeight) == 1 && parseInt(f.settings.imageHeight) > minHeight) {
				minHeight = parseInt(f.settings.imageHeight) + 20;
			}
		});
		if (minHeight > 0) {
			defaultHeight = minHeight;
		}

		// set query condition
		var cond = {
			where: wheres,
			limit: limit || 20,
			skip: start || 0,
			sort: sorts,
		};

		// remove where if not provided:
		// if (!wheres) {
		// 	delete wheres.where;
		// }

		// load all data
		if (this.settings.loadAll) {
			delete cond.limit;
		}

		return Promise.resolve()
			.then(() => {

				// check data status of link data collection and listen change cursor event
				return new Promise((resolve, reject) => {

					let linkDv = this.dataviewLink;
					if (!linkDv) return resolve();

					switch (linkDv.dataStatus) {

						case linkDv.dataStatusFlag.notInitial:
							linkDv.loadData().catch(reject);
						// no break;

						case linkDv.dataStatusFlag.initializing:

							// wait until the link dc initialized data
							// NOTE: if linked data collections are recursive, then it is infinity looping.
							this.eventAdd({
								emitter: linkDv,
								eventName: "initializedData",
								listener: () => {

									// go next
									resolve();

								}
							});

							break;

						case linkDv.dataStatusFlag.initialized:
							resolve();
							break;

					}

				});

			})
			// load data collection when using "(not_)in_data_collection" as a filter
			.then(() => {
				return new Promise((resolve, reject) => {

					if (wheres == null || wheres.rules == null || !wheres.rules.length)
						return resolve();

					var dcFilters = [];

					wheres.rules.forEach((rule) => {
						// if this collection is filtered by data collections we need to load them in case we need to validate from them later
						if (rule.rule == "in_data_collection" || rule.rule == "not_in_data_collection") {

							dcFilters.push(
								new Promise((next, err) => {

									if (!this.application) return next();

									var dataview = this.application.dataviews(dv => dv.id == rule.value)[0];
									if (!dataview) return next();

									switch (dataview.dataStatus) {

										case dataview.dataStatusFlag.notInitial:
											dataview.loadData().catch(err);
										// no break;

										case dataview.dataStatusFlag.initializing:

											// wait until the link dc initialized data
											// NOTE: if linked data collections are recursive, then it is infinity looping.
											this.eventAdd({
												emitter: dataview,
												eventName: "initializedData",
												listener: () => {

													// go next
													next();

												}
											});

											break;

										case dataview.dataStatusFlag.initialized:
											next();
											break;

									}
								})
							)
						}
					})

					Promise.all(dcFilters).then(() => {
						resolve();
					}).catch(reject);

				});

			})

			// pull data to data collection
			.then(() => {

				return new Promise((resolve, reject) => {

					model.findAll(cond)
						.then((data) => {

							data.data.forEach((d) => {

								// define $height of rows to render in webix elements
								if (d.properties != null && d.properties.height != "undefined" && parseInt(d.properties.height) > 0) {
									d.$height = parseInt(d.properties.height);
								} else if (defaultHeight > 0) {
									d.$height = defaultHeight;
								}

							});

							// store total count
							this.__totalCount = data.total_count;

							// populate data to webix's data collection and the loading cursor is hidden here
							this.__dataCollection.parse(data);

							this.parseTreeCollection(data);

							var linkDv = this.dataviewLink;
							if (linkDv) {

								// filter data by match link data collection
								this.refreshLinkCursor();

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

							if (callback)
								callback();

							resolve();

						})
						.catch(err => {

							this.hideProgressOfComponents();

							if (callback)
								callback(err);

							reject(err);

						});

				});

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
				var isValid = this.__filterComponent.isValid(row);

				// parent dc filter
				var linkDv = this.dataviewLink;
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

		var linkDv = this.dataviewLink;
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

		var dc = this.__dataCollection;

		// prevent bind many times
		if (this.__bindComponentIds.indexOf(component.config.id) > -1 &&
			$$(component.config.id).data &&
			$$(component.config.id).data.find &&
			$$(component.config.id).data.find({}).length > 0)
			return;
		// keep component id to an array
		else
			this.__bindComponentIds.push(component.config.id);

		if (component.config.view == 'datatable' ||
			component.config.view == 'dataview' ||
			component.config.view == 'treetable' ||
			component.config.view == 'kanban') {

			if (dc) {

				var items = dc.count();
				if (items == 0 &&
					(this._dataStatus == this.dataStatusFlag.notInitial ||
						this._dataStatus == this.dataStatusFlag.initializing) &&
					component.showProgress) {
					component.showProgress({ type: "icon" });
				}

				component.define("datafetch", 20);
				component.define("datathrottle", 500);

				// initial data of treetable
				if (component.config.view == 'treetable') {

					if (this.datasource &&
						this.datasource.isGroup &&
						this.__treeCollection) {

						component.define('data', this.__treeCollection);
						component.refresh();
					}
					else {

						// NOTE: tree data does not support dynamic loading when scrolling
						// https://forum.webix.com/discussion/3078/dynamic-loading-in-treetable
						component.parse(dc.find({}));

					}

				}
				else {
					component.data.sync(dc);
				}

				// Implement .onDataRequest for paging loading
				if (!this.settings.loadAll) {

					component.___AD = component.___AD || {};
					// if (component.___AD.onDataRequestEvent) component.detachEvent(component.___AD.onDataRequestEvent);
					if (!component.___AD.onDataRequestEvent) {
						component.___AD.onDataRequestEvent = component.attachEvent("onDataRequest", (start, count) => {

							if (component.showProgress)
								component.showProgress({ type: "icon" });

							// load more data to the data collection
							dc.loadNext(count, start);

							return false;	// <-- prevent the default "onDataRequest"
						});
					}

					// NOTE : treetable should use .parse or TreeCollection
					// https://forum.webix.com/discussion/1694/tree-and-treetable-using-data-from-datacollection
					if (component.config.view == 'treetable' &&
						!this.__treeCollection) {

						component.___AD = component.___AD || {};
						if (!component.___AD.onDcLoadData) {
							component.___AD.onDcLoadData = this.on("loadData", () => {

								component.parse(dc.find({}));

							});
						}

					}

				}


			}
			else {
				component.data.unsync();
			}
		}
		else if (component.bind) {
			if (dc) {
				// Do I need to check if there is any data in the collection before binding?
				component.bind(dc);
			} else {
				component.unbind();
			}

			if (component.refresh)
				component.refresh();

		}

	}

	unbind(component) {

		if (!component)
			return;

		component.detachEvent("onDataRequest");

		if (component.data &&
			component.data.unsync) {
			component.data.unsync();
			component.define('data', []);
		}

		if (component.unbind)
			component.unbind();

		if (component.refresh)
			component.refresh();

		// remove from array
		this.__bindComponentIds = (this.__bindComponentIds || []).filter(id => id != component.config.id);
	}

	hideProgressOfComponents() {

		this.__bindComponentIds.forEach(comId => {

			if ($$(comId) &&
				$$(comId).hideProgress)
				$$(comId).hideProgress();

		});

	}

	removeComponent(comId) {

		// get index
		let index = this.__bindComponentIds.indexOf(comId);

		// delete
		this.__bindComponentIds.splice(index, 1);

	}

	setFilterConditions(filterConditions) {

		if (this.__filterComponent)
			this.__filterComponent.setValue(filterConditions || DefaultValues.settings.objectWorkspace.filterConditions);
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

		// get a webix data collection
		let dc = new webix.DataCollection({
			data: data || [],
		});

		this._extendCollection(dc);

		return dc;
	}

	/**
	 * @method _treeCollectionNew
	 * Get webix.TreeCollection
	 * 
	 * @return {webix.TreeCollection}
	 * 
	 */
	_treeCollectionNew() {

		// get a webix data collection
		let treeStore = new webix.TreeCollection();

		this._extendCollection(treeStore);

		return treeStore;

	}

	_extendCollection(dataStore) {

		// Apply this data collection to support multi-selection
		// https://docs.webix.com/api__refs__selectionmodel.html
		webix.extend(dataStore, webix.SelectionModel);

		dataStore.___AD = dataStore.___AD || {};

		// Implement .onDataRequest for paging loading
		if (!this.settings.loadAll) {

			if (!dataStore.___AD.onDataRequestEvent) {
				dataStore.___AD.onDataRequestEvent = dataStore.attachEvent("onDataRequest", (start, count) => {

					if (start < 0) start = 0;

					// load more data to the data collection
					this.loadData(start, count);

					return false;	// <-- prevent the default "onDataRequest"
				});
			}


			if (!dataStore.___AD.onAfterLoadEvent) {
				dataStore.___AD.onAfterLoadEvent = dataStore.attachEvent("onAfterLoad", () => {

					this.emit("loadData", {});

				});
			}

		}

		// override unused functions of selection model
		dataStore.addCss = function () { };
		dataStore.removeCss = function () { };
		dataStore.render = function () { };

		if (!dataStore.___AD.onAfterLoad) {
			dataStore.___AD.onAfterLoad = dataStore.attachEvent("onAfterLoad", () => {

				this.hideProgressOfComponents();

			});
		}

	}

	parseTreeCollection(data = {}) {

		if (!(this.__datasource instanceof ABObjectQuery) ||
			!this.__datasource.isGroup ||
			!this.__treeCollection)
			return;

		let addRowToTree = (join = {}, row, parentId = null) => {

			let alias = join.alias;
			if (!alias) return;

			// TODO: ABObject.PK()
			let id = row[`${alias}.uuid`] || row[`${alias}.id`];
			if (!id) return;

			// Add parent node
			if (!this.__treeCollection.exists(id)) {

				let treeNode = {};
				treeNode.id = id;
				treeNode._rowId = row.id; // Keep row id for set cursor to data collection

				Object.keys(row).forEach(propName => {

					// Pull value from alias
					if (propName.indexOf(`${alias}.`) == 0) {
						treeNode[propName] = row[propName];
					}

				});

				this.__treeCollection.add(treeNode, null, parentId);
			}

			// Sub-joins
			(join.links || []).forEach(link => {
				addRowToTree(link, row, id);
			});

		};

		// Show loading cursor
		(this.__bindComponentIds || []).forEach(comId => {

			let boundComp = $$(comId);
			if (boundComp &&
				boundComp.showProgress)
				boundComp.showProgress({ type: "icon" });

		});

		(data.data || []).forEach(row => {

			addRowToTree(this.__datasource.joins(), row);

		});

		// Hide loading cursor
		(this.__bindComponentIds || []).forEach(comId => {

			let boundComp = $$(comId);
			if (boundComp &&
				boundComp.hideProgress)
				boundComp.hideProgress();

		})
		

	}

	// Clone

	clone(settings) {
		settings = settings || this.toObj();
		var clonedDataview = new ABDataview(settings, this.application);

		return new Promise((resolve, reject) => {

			// load the data
			clonedDataview.loadData()
				.then(() => {

					// set the cursor
					var cursorID = this.getCursor();

					if (cursorID) {
						// NOTE: webix documentation issue: .getCursor() is supposed to return
						// the .id of the item.  However it seems to be returning the {obj} 
						if (cursorID.id) cursorID = cursorID.id;

						clonedDataview.setCursor(cursorID);
					}

					resolve(clonedDataview);
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