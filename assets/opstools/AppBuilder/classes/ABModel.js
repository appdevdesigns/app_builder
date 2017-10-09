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

import EventEmitter from "events"


function toDC(data) {
	return new webix.DataCollection({
		data: data,
	});
}


export default class ABModel extends EventEmitter {

	constructor(object) {

		super();

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
			if (values.translations) {
				OP.Multilingual.unTranslate(values, values, mlFields);
			}
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.post({
					url: this.modelURL(),
					params: values
				})
					.then((data) => {

						resolve(data);
						// trigger a create event
						this.emit('create', data);
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
						this.emit('delete', id);

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
			newCond.where = cond;
		}

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Service.get({
					url: this.modelURL(),
					params: newCond
				})
					.then((data) => {

						// if this object has some multilingual fields, translate the data:
						var mlFields = this.object.multilingualFields();
						if (mlFields.length) {

							data.data.forEach((d) => {
								OP.Multilingual.translate(d, d, mlFields);
							})
						}

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
			// if (values.translations) { // Comment out it because a new row does not have .translations
			OP.Multilingual.unTranslate(values, values, mlFields);
			// }
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
						resolve(data);
						// trigger a update event
						this.emit('update', values);

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


	dataCollectionNew(data) {
		// get a webix data collection
		var dc = toDC(data || []);

		// Apply this data collection to support multi-selection
		// https://docs.webix.com/api__refs__selectionmodel.html
		webix.extend(dc, webix.SelectionModel);

		// override unused functions of selection model
		dc.addCss = function () { };
		dc.removeCss = function () { };
		dc.render = function () { };

		// events
		this.on('create', (data) => {
			// TODO
		});

		this.on('update', (values) => {
			if(dc.exists(values.id)) {
				dc.updateItem(values.id, values);
			}
		});

		this.on('delete', (id) => {
			if(dc.exists(id)) {
				dc.remove(id);
			}
		});

		return dc;
	}

}
