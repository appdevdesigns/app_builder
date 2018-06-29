//
// ABModel
//
// Represents the Data interface for an ABObject data.
//
// 2 ways to use an ABModel to load a DataTable:
// 	Method 1:  
// 	gather all the data externally and send to the DataTable
//		Model.findAll()
//		.then((data)=>{
//			DataTable.parse(data);
//		})
//
// 	Method 2: 
// 	Set the Model object with a condition / skip / limit, then 
// 	use it to load the DataTable:
//		Model.where({})
//		.skip(XX)
//		.limit(XX)
//		.loadInto(DataTable);


/**
 * @method triggerEvent 
 * Publish a event when data in the model is changed
 * 
 * @param {string} action - create, update, delete
 * @param {ABObject} object
 * @param {*} data 
 */
function triggerEvent(action, object, data) {

	// Trigger a event to data collections of application and the live display pages
	AD.comm.hub.publish('ab.datacollection.' + action, {
		objectId: object.id,
		data: data
	});
	
}

// Start listening for server events for object updates and call triggerEvent as the callback
io.socket.on("ab.datacollection.create", function (msg) {
  triggerEvent("create", {id:msg.objectId}, msg.data);
});

io.socket.on("ab.datacollection.delete", function (msg) {
  triggerEvent("delete", {id:msg.objectId}, msg.id);
});

io.socket.on("ab.datacollection.stale", function (msg) {
  triggerEvent("stale", {id:msg.objectId}, msg.data);
});

io.socket.on("ab.datacollection.update", function (msg) {
  triggerEvent("update", {id:msg.objectId}, msg.data);
});


export default class ABModel {

	constructor(object) {

		// link me to my parent ABApplication
		this.object = object;

		this._where = null;
		this._sort = null;
		this._skip = null;
		this._limit = null;
	}



	///
	/// Static Methods
	///
	/// Available to the Class level object.  These methods are not dependent
	/// on the instance values of the Application.
	///



	///
	/// Instance Methods
	///


	// Prepare multilingual fields to be untranslated
	// Before untranslating we need to ensure that values.translations is set.
	prepareMultilingualData(values) {
		
		// if this object has some multilingual fields, translate the data:
		var mlFields = this.object.multilingualFields();
		// if mlFields are inside of the values saved we want to translate otherwise do not because it will reset the translation field and you may loose unchanged translations
		var shouldTranslate = false;
		if (mlFields.length) {
			mlFields.forEach(function(field) {
				if (typeof values[field] != "undefined") {
					shouldTranslate = true;
				}
			});
		}
		if (shouldTranslate) {
			if (values.translations == null || typeof values.translations == "undefined" || values.translations == "") {
				values.translations = [];
			}
			OP.Multilingual.unTranslate(values, values, mlFields);
		}
			
	}


	/**
	 * @method create
	 * update model values on the server.
	 */
	create(values) {

		this.prepareMultilingualData(values);

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.post({
					url: this.object.urlRest(),
					params: values
				})
					.then((data) => {

						this.normalizeData(data);

						resolve(data);

						// FIX: now with sockets, the triggers are fired from socket updates.
						// trigger a create event
						// triggerEvent('create', this.object, data);

					})
					.catch(reject);

			}
		)

	}


	/**
	 * @method delete
	 * remove this model instance from the server
	 * @param {integer} id  the .id of the instance to remove.
	 * @return {Promise}
	 */
	delete(id) {

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service['delete']({
					url: this.object.urlRestItem(id)
				})
					.then((data) => {
						resolve(data);

						// FIX: now with sockets, the triggers are fired from socket updates.
						// trigger a delete event
						// triggerEvent('delete', this.object, id);

					})
					.catch(reject);

			}
		)

	}


	/**
	 * @method findAll
	 * performs a data find with the provided condition.
	 */
	findAll(cond) {

		cond = cond || {};


// 		// prepare our condition:
// 		var newCond = {};

// 		// if the provided cond looks like our { where:{}, skip:xx, limit:xx } format,
// 		// just use this one.
// 		if (cond.where) {
// 			newCond = cond;
// 		} else {

// 			// else, assume the provided condition is the .where clause.
// 			newCond.where = cond;
// 		}

// /// if this is our depreciated format:
// if (newCond.where.where) {
// 	OP.Error.log('Depreciated Embedded .where condition.');
// }


		return new Promise(
			(resolve, reject) => {

				OP.Comm.Socket.get({
				// OP.Comm.Service.get({
					url: this.object.urlRest(),
					params: cond
					// params: newCond
				})
					.then((data) => {

						this.normalizeData(data.data);

						resolve(data);
					})
					.catch((err) => {

						if (err && err.code) {
							switch(err.code) {
								case "ER_PARSE_ERROR":
									OP.Error.log('AppBuilder:ABModel:findAll(): Parse Error with provided condition', { error: err, condition:cond })
									break;

								default:
									OP.Error.log('AppBuilder:ABModel:findAll(): Unknown Error with provided condition', { error: err, condition:cond })
									break;
							}

						}
						reject(err);
					})

			}
		)

	}


	/**
	 * @method count
	 * count a data find with the provided condition.
	 */
	count(cond) {

		cond = cond || {};

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Socket.get({
				// OP.Comm.Service.get({
					url: this.object.urlRestCount(),
					params: cond
				})
					.then((numberOfRows) => {

						resolve(numberOfRows);

					})
					.catch((err) => {

						OP.Error.log('AppBuilder:ABModel:count(): Parse Error with provided condition', { error: err, condition:cond })

						reject(err);

					})

			}
		)

	}


	/**
	 * @method findConnected
	 * return the connected data associated with an instance of this model.
	 *
	 * to limit the result to only a single connected column:
	 * 		model.findConnected( 'col1', {data})
	 *		then ((data) => {
	 *			// data = [{obj1}, {obj2}, ... {objN}]
	 *		})
	 *
	 * To find >1 connected field data:
	 *		model.findConnected( ['col1', 'col2'], {data} )
	 *		.then((data) =>{
	 *		
	 *			// data = {
	 *			//	   col1 : [{obj1}, {obj2}, ... {objN}],
	 *			//     col2 : [{obj1}, {obj2}, ... {objN}]
	 *			// }
	 *		})
	 *
	 * To find all connected field data:
	 *		model.findConnected( {data} )
	 *		.then((data) =>{
	 *		
	 *			// data = {
	 *			//	   connectedColName1 : [{obj1}, {obj2}, ... {objN}],
	 *			//     connectedColName2 : [{obj1}, {obj2}, ... {objN}],
	 *			//		...
	 *			//     connectedColNameN : [{obj1}, {obj2}, ... {objN}]
	 *			// }
	 *		})

	 * @param {string/array} fields  [optional] an array of connected fields you want to return.
	 * @param {obj} data  the current object instance (data) to lookup
	 * @return {Promise}
	 */
	findConnected(fields, data) {

		if (typeof data == 'undefined') {
			if ((!Array.isArray(fields)) && (typeof fields == 'object')){
				data = fields;
				fields = [];  // return all fields
			}
		}

		if (typeof fields == 'string') {
			fields = [fields];	// convert to an array of values
		}

		return new Promise(
			(resolve, reject) => {

				// sanity checking:
				if (!data.id) {
					// I can't find any connected items, if I can't find this one:
					resolve(null);
					return;
				}

				this.findAll({where:{id:data.id}, includeRelativeData: true })
				.then((results) => {

					if ( !results.data  || (!Array.isArray(results.data)) || (results.data.length == 0)) {
						resolve([]); // no data to return.
						return;
					}


					// work with the first object.
					var myObj = results.data[0];

					// if only 1 field requested, then return that 
					if (fields.length == 1) {

						let data = myObj[fields[0]+'__relation'];
						if (!Array.isArray(data))
							data = [data];

						resolve( data )
						return;
					}

					// if no fields requested, return them all:
					if (fields.length == 0) {
						var allFields = this.object.fields((f)=>{ return f.settings.linkType; });
						allFields.forEach((f)=>{
							fields.push(f.columnName);
						})
					}

					var returnData = {};
					fields.forEach((colName) => {
						returnData[colName] = myObj[colName + '__relation'];
					})

					resolve(returnData);

				})
				.catch((err) =>{
console.error('!!! error with findConnected() attempt:', err);
reject(err);
				});

			}
		)
	}


	/**
	 * @method loadInto
	 * loads the current values into the provided Webix DataTable
	 * @param {DataTable} DT  A Webix component that can dynamically load data.
	 */
	loadInto(DT) {

		// if a limit was applied, then this component should be loading dynamically
		if (this._limit) {

			DT.define('datafetch', this._limit);
			DT.define('datathrottle', 250);  // 250ms???


			// catch the event where data is requested:
			// here we will do our own findAll() so we can persist
			// the provided .where condition.

			// oh yeah, and make sure to remove any existing event handler when we 
			// perform a new .loadInto()
			DT.___AD = DT.___AD || {};
			if (DT.___AD.onDataRequestEvent) {
				DT.detachEvent(DT.___AD.onDataRequestEvent);
			}
			DT.___AD.onDataRequestEvent = DT.attachEvent("onDataRequest", (start, count) => {

				var cond = {
					where: this._where,
					sort: this._sort,
					limit: count,
					skip: start
				}

				if (DT.showProgress)
					DT.showProgress({ type: "icon" });

				this.findAll(cond)
					.then((data) => {
						data.data.forEach((item) => {
							if (item.properties != null && item.properties.height != "undefined" && parseInt(item.properties.height) > 0) {
								item.$height = parseInt(item.properties.height);
							} else if (parseInt(this._where.height) > 0) {
								item.$height = parseInt(this._where.height)
							}
						});
						DT.parse(data);

						if (DT.hideProgress)
							DT.hideProgress();

					})

				return false;	// <-- prevent the default "onDataRequest"
			});


			DT.refresh();
		}


		// else just load it all at once:
		var cond = {};
		if (this._where) cond.where = this._where;
		if (this._sort) cond.sort = this._sort;
		if (this._limit != null) cond.limit = this._limit;
		if (this._skip != null) cond.skip = this._skip;

		if (DT.showProgress)
			DT.showProgress({ type: "icon" });

		this.findAll(cond)
			.then((data) => {
				data.data.forEach((item) => {
					if (item.properties != null && item.properties.height != "undefined" && parseInt(item.properties.height) > 0) {
						item.$height = parseInt(item.properties.height);
					} else if (parseInt(this._where.height) > 0) {
						item.$height = parseInt(this._where.height)
					}
				});
				DT.parse(data);

				if (DT.hideProgress)
					DT.hideProgress();

			})
			.catch((err) => {
				console.error('!!!!!', err);
			})


	}


	/**
	 * @method limit
	 * set the limit value for this set of data
	 * @param {integer} limit  the number or elements to return in this call
	 * @return {ABModel} this object that is chainable.
	 */
	limit(limit) {
		this._limit = limit;
		return this;
	}


	/**
	 * @method skip
	 * set the skip value for this set of data
	 * @param {integer} skip  the number or elements to skip
	 * @return {ABModel} this object that is chainable.
	 */
	skip(skip) {
		this._skip = skip;
		return this;
	}




	/**
	 * @method update
	 * update model values on the server.
	 */
	update(id, values) {

		this.prepareMultilingualData(values);

		// remove empty properties
		for (var key in values) {
			if (values[key] == null)
				delete values[key];
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.put({
					url: this.object.urlRestItem(id),
					params: values
				})
					.then((data) => {

						// .data is an empty object ?? 

						this.normalizeData(data);

						resolve(data);

						// FIX: now with sockets, the triggers are fired from socket updates.
						// trigger a update event
						// triggerEvent('update', this.object, data);

					})
					.catch(reject);

			}
		)

	}



	/**
	 * @method upsert
	 * upsert model values on the server.
	 */
	upsert(values) {
		
		this.prepareMultilingualData(values);

		// remove empty properties
		for (var key in values) {
			if (values[key] == null)
				delete values[key];
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.put({
					url: this.object.urlRest(),
					params: values
				})
					.then((data) => {

						// .data is an empty object ?? 

						this.normalizeData(data);

						resolve(data);

						// FIX: now with sockets, the triggers are fired from socket updates.
						// trigger a update event
						// triggerEvent('update', this.object, data);

					})
					.catch(reject);

			}
		)

	}


	/**
	 * @method where
	 * set the where condition for the data being loaded.
	 * @param {json} cond  the json condition statement.
	 * @return {ABModel} this object that is chainable.
	 */
	where(cond) {
		this._where = cond;
		return this;
	}

	/**
	 * @method where
	 * set the sort condition for the data being loaded.
	 * @param {json} cond  the json condition statement.
	 * @return {ABModel} this object that is chainable.
	 */
	sort(cond) {
		this._sort = cond;
		return this;
	}


	/**
	 * @method refresh
	 * refresh model definition on the server.
	 */
	refresh() {

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.put({
					url: this.object.urlRestRefresh()
				})
					.then(() => {
						resolve();
					})
					.catch(reject);

			}
		)

	}


	normalizeData(data) {

		// convert to array
		if (!(data instanceof Array))
			data = [data];
			
		// find all connected fields
		var connectedFields = this.object.connectFields();

		// if this object has some multilingual fields, translate the data:
		var mlFields = this.object.multilingualFields();
		
		// if this object has some date fields, convert the data to date object:
		var dateFields = this.object.fields(function(f) { return f.key == 'date'; }) || [];
	
		data.forEach((d) => {
			if (d == null) return;

			// various PK name
			if (this.object.PK() != 'id')
				d.id = d[this.object.PK()];

			// loop through data's connected fields
			connectedFields.forEach((c) => {

				// get the relation name so we can change the original object
				var relationName = c.relationName();
				// if there is no data we can exit now
				if (d[relationName] == null) return;

				// if relation data is still a string
				if (typeof d[relationName] == "string") {
					// parse the string into an object
					d[relationName] = JSON.parse(d[relationName]);
				}

				// if the data is an array we need to loop through it
				if (Array.isArray(d[relationName])) {
					d[relationName].forEach((r) => {
						// if translations are present and they are still a string
						if (r.translations && typeof r.translations == "string") {
							// parse the string into an object
							r.translations = JSON.parse(r.translations);
						}
					});
				} else {
					// if the data is not an array it is a single item...check that has translations and it is a string
					if (d[relationName].translations  && typeof d[relationName].translations == "string") {
						// if so parse the string into an object
						d[relationName].translations = JSON.parse(d[relationName].translations);
					}
				}


				// set .id to relation columns
				let objectLink = c.datasourceLink;
				if (objectLink.PK() != 'id' &&
					d[relationName] &&
					!d[relationName].id) {

						// is array
						if (d[relationName].forEach) {
							d[relationName].forEach(subData => {
								subData.id = subData[objectLink.PK()];
							})
						}
						else {
							d[relationName].id = d[relationName][objectLink.PK()];
						}

					}

			});


			if (mlFields.length) {
				OP.Multilingual.translate(d, d, mlFields);
			}


			// convert the data to date object
			dateFields.forEach((date) => {
				if (d && d[date.columnName] != null)
					d[date.columnName] = new Date(d[date.columnName]);
			});


		});

	}

}

