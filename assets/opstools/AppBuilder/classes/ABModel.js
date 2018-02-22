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
	modelURL() {
		return '/app_builder/model/application/#appID#/object/#objID#'
			.replace('#appID#', this.object.application.id)
			.replace('#objID#', this.object.id)
	}

	modelURLItem(id) {
		return '/app_builder/model/application/#appID#/object/#objID#/#id#'
			.replace('#appID#', this.object.application.id)
			.replace('#objID#', this.object.id)
			.replace('#id#', id);
	}

	modelURLRefresh() {
		return '/app_builder/model/application/#appID#/refreshobject/#objID#'
			.replace('#appID#', this.object.application.id)
			.replace('#objID#', this.object.id);
	}







	/**
	 * @method create
	 * update model values on the server.
	 */
	create(values) {

		// if this object has some multilingual fields, translate the data:
		var mlFields = this.object.multilingualFields();
		if (mlFields.length) {
			// if (values.translations) {
			OP.Multilingual.unTranslate(values, values, mlFields);
			// }
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.post({
					url: this.modelURL(),
					params: values
				})
					.then((data) => {

						this.normalizeData(data);

						resolve(data);

						// trigger a create event
						triggerEvent('create', this.object, data);

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
					url: this.modelURLItem(id)
				})
					.then((data) => {
						resolve(data);

						// trigger a delete event
						triggerEvent('delete', this.object, id);

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


		// prepare our condition:
		var newCond = {};

		// if the provided cond looks like our { where:{}, skip:xx, limit:xx } format,
		// just use this one.
		if (cond.where) {
			newCond = cond;
		} else {

			// else, assume the provided condition is the .where clause.
			newCond.where = {
				where: [cond]
			};
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Socket.get({
					url: this.modelURL(),
					params: newCond
				})
					.then((data) => {

						this.normalizeData(data.data);

						resolve(data);
					})
					.catch(reject);

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

		// if this object has some multilingual fields, translate the data:
		var mlFields = this.object.multilingualFields();
		if (mlFields.length) {
			if (Object.keys(values).length == 0 || // When a row is empty values, then should create .translations
				values.translations) {
				OP.Multilingual.unTranslate(values, values, mlFields);
			}
		}

		// remove empty properties
		for (var key in values) {
			if (values[key] == null)
				delete values[key];
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.put({
					url: this.modelURLItem(id),
					params: values
				})
					.then((data) => {

						// .data is an empty object ?? 

						this.normalizeData(data);

						resolve(data);

						// trigger a update event
						triggerEvent('update', this.object, data);

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
	 * @method refresh
	 * refresh model definition on the server.
	 */
	refresh() {

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.put({
					url: this.modelURLRefresh()
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

		// if this object has some multilingual fields, translate the data:
		var mlFields = this.object.multilingualFields();
		
		// if this object has some date fields, convert the data to date object:
		var dateFields = this.object.fields(function(f) { return f.key == 'date'; }) || [];
		
		if (mlFields.length > 0 || dateFields.length > 0) {

			data.forEach((d) => {


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

}
