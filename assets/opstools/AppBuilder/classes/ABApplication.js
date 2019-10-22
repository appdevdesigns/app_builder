
// import OP from "OP"
import ABApplicationBase from "./ABApplicationBase"
import "../data/ABApplication"
import ABObject from "./ABObject"
import ABObjectQuery from "./ABObjectQuery"
import ABDataview from "./ABDataview"
import ABMobileApp from "./ABMobileApp"
import ABViewManager from "./ABViewManager"
import ABViewPage from "./views/ABViewPage"
import ABViewReportPage from "./views/ABViewReportPage"
import ABViewReport from "./views/ABViewReport"

var _AllApplications = [];


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function toArray(DC) {

	var ary = [];

	var id = DC.getFirstId();
	while (id) {
		var element = DC.getItem(id);
		ary.push(element);
		id = DC.getNextId(id);
	}

	return ary;
}

export default class ABApplication extends ABApplicationBase {

	constructor(attributes) {
		super(attributes);


		// multilingual fields: label, description
		OP.Multilingual.translate(this, this.json, ABApplication.fieldsMultilingual());

		// instance keeps a link to our Model for .save() and .destroy();
		this.Model = OP.Model.get('opstools.BuildApp.ABApplication');

		// [fix] prevent crash if no model was returned
		// NOTE: this is actually a pretty big error!  What should we do here?
		if (this.Model) this.Model.Models(ABApplication);
	}



	///
	/// Static Methods
	///
	/// Available to the Class level object.  These methods are not dependent
	/// on the instance values of the Application.
	///


	/**
	 * @function allApplications
	 *
	 * return a DataCollection that contains all the ABApplications this user
	 * can see (based upon server side permissions);
	 *
	 * NOTE: this manages the results in the _AllApplications dataCollection
	 * store.  Any future .create(), .destroy(), .updates() modify values in
	 * that collection.
	 *
	 * Any webix ui components synced to that collection will be automatically
	 * updated.
	 *
	 * @return {Promise}
	 */
	static allApplications() {
		return new Promise(
			(resolve, reject) => {

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll()
					.then(function (data) {

						// NOTE: data is already a DataCollection from .findAll()
						_AllApplications = data;

						resolve(data);
					})
					.catch(reject);

			}
		)
	}

	/**
	 * @function applicationInfo
	 * Get id and label of all applications
	 *
	 * @return {Promise}
	 */
	static applicationInfo() {
		return new Promise(
			(resolve, reject) => {

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.staticData.info()
					.then(function (list) {

						let apps = [];

						(list || []).forEach(app => {
							apps.push(new ABApplication(app));
						});

						// if (_AllApplications == null) {
						_AllApplications = new webix.DataCollection({
							data: apps || [],
						});
						// }

						resolve(_AllApplications);
					})
					.catch(reject);

			}
		)
	}


	/**
	 * @function get
	 * Get an application
	 *
	 * @param {uuid} appID
	 * 
	 * @return {Promise}
	 */
	static get(appID) {

		return new Promise((resolve, reject) => {

			var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
			ModelApplication.Models(ABApplication); // set the Models  setting.

			ModelApplication.staticData.get(appID)
				.catch(reject)
				.then(function (app) {

					// resolve(app);
					if (app)
						resolve(new ABApplication(app));
					else
						resolve();

				});
		});

	}


	/**
	 * @function create
	 *
	 * take the initial values and create an instance of ABApplication.
	 *
	 * @return {Promise}
	 */
	static create(values) {
		return new Promise(
			function (resolve, reject) {

				var newApp = {}
				OP.Multilingual.unTranslate(values, newApp, ABApplication.fieldsMultilingual());
				values.json = newApp;
				newApp.name = values.name;

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.create(values)
					.then(function (app) {

						// return an instance of ABApplication
						var App = new ABApplication(app);

						_AllApplications.add(App, 0);
						resolve(App);
					})
					.catch(reject)
			}
		)
	}




	//// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

	static isValid(op, values) {

		var validator = OP.Validation.validator();

		// during an ADD operation
		if (op == 'add') {

			// label/name must be unique:
			var arrayApplications = toArray(_AllApplications);

			var nameMatch = values.label.trim().replace(/ /g, '_').toLowerCase();
			var matchingApps = arrayApplications.filter(function (app) {
				return app.name.trim().toLowerCase() == nameMatch;
			})
			if (matchingApps && matchingApps.length > 0) {

				validator.addError('label', L('ab_form_application_duplicate_name', "*Name (#name#) is already in use").replace('#name#', nameMatch))
				// var errors = OP.Form.validationError({
				// 	name:'label',
				// 	message:L('ab_form_application_duplicate_name', "*Name (#name#) is already in use").replace('#name#', nameMatch),
				// }, errors);
			}

		}


		// Check the common validations:
		// TODO:
		// if (!inputValidator.validate(values.label)) {
		// 	_logic.buttonSaveEnable();
		// 	return false;
		// }


		return validator;
	}


	/**
	 * @method objectFromRef
	 * 
	 * @param {string} resolveUrl - resolve url that include application id
	 * @return {Promise}
	 */
	static objectFromRef(resolveUrl) {

		// #/3/_objects/6eb3121b-1208-4c49-ae45-fcf722bd6db1
		var parts = resolveUrl.split('/');

		// get id of application
		var appId = parts.splice(1, 1)[0];

		// pull an application
		var app = _AllApplications.find(function(a) { return a.id == appId; })[0];

		// the url of object that exclude application id
		var objectUrl = parts.join('/');

		return app.urlResolve(objectUrl);
	}




	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 *
	 * @return {Promise}
	 */
	destroy() {
		if (this.id) {
			return this.Model.destroy(this.id)
				.then(() => {
					_AllApplications.remove(this.id);
				});
		}
	}


	/**
	 * @method save()
	 *
	 * persist the current instance of ABApplication to the DB
	 *
	 * Also, keep the values in _AllApplications up to date.
	 *
	 * @return {Promise}
	 */
	save() {

		var values = this.toObj();

		// we already have an .id, so this must be an UPDATE
		if (values.id) {

			return this.Model.update(values.id, values)
				.then(() => {
					_AllApplications.updateItem(values.id, this);
				});

		} else {

			// must be a CREATE:
			return this.Model.create(values)
				.then((data) => {
					this.id = data.id;
					_AllApplications.add(this, 0);
				});
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

		OP.Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());

		return super.toObj();
	}


	/// ABApplication info methods

	/**
	 * @method updateInfo()
	 *
	 * Update label/description of ABApplication
	 *
	 * @param {array} translations	an array of translations
	 *
	 * @return {Promise}
	 */
	updateInfo () {

		var values = this.toObj();
		values.json = values.json || {};
		values.json.translations = values.json.translations || [];

		return this.Model.staticData.updateInfo(this.id, {
			isAdminApp: values.isAdminApp,
			translations: values.json.translations
		});

	}

	/// ABApplication Permission methods


	/**
	 * @method assignPermissions()
	 *
	 * Make sure the current ABApplication permissions match the given
	 * array of permissions.
	 *
	 * @param {array} permItems	an array of role assignments that this
	 * 							ABApplication should match.
	 * @return {Promise}
	 */
	assignPermissions(permItems) {

		return this.Model.staticData.assignPermissions(this.id, permItems);

	}


	/**
	 * @method getPermissions()
	 *
	 * Return an array of role assignments that are currently assigned to this
	 * ABApplication.
	 *
	 * @return {Promise} 	resolve(list) : list {array} Role assignments
	 */
	getPermissions() {

		return this.Model.staticData.getPermissions(this.id);

	}


	/**
	 * @method createPermission()
	 *
	 * Create a Role in the system after the name of the current ABApplication.
	 *
	 * @return {Promise}
	 */
	createPermission() {

		// TODO: need to take created role and store as : .json.applicationRole = role.id

		return this.Model.staticData.createPermission(this.id);

	}


	/**
	 * @method deletePermission()
	 *
	 * Remove the Role in the system of the current ABApplication.
	 * (the one created by  .createPermission() )
	 *
	 * @return {Promise}
	 */
	deletePermission() {

		// TODO: need to remove created role from : .json.applicationRole

		return this.Model.staticData.deletePermission(this.id);

	}



	///
	/// Objects
	///


	objectLoad() {

		if (this.loadedObjects)
			return Promise.resolve();

		return new Promise((resolve, reject) => {

			this.Model.staticData.objectLoad(this.id)
				.catch(reject)
				.then(objects => {

					this.loadedObjects = true;

					var newObjects = [];
					(objects || []).forEach((obj) => {
						newObjects.push( this.objectNew(obj) );  
					})
					this._objects = newObjects;

					resolve();

				});

		});

	}


	/**
	 * @method objectNew()
	 *
	 * return an instance of a new (unsaved) ABObject that is tied to this
	 * ABApplication.
	 *
	 * NOTE: this new object is not included in our this.objects until a .save()
	 * is performed on the object.
	 *
	 * @return {ABObject}
	 */
	objectNew(values) {
		return new ABObject(values, this);
	}


	/**
	 * @method objectDestroy()
	 *
	 * remove the current ABObject from our list of ._objects.
	 *
	 * @param {ABObject} object
	 * @return {Promise}
	 */
	objectDestroy(object) {

		var remaininObjects = this.objects(function (o) { return o.id != object.id; })
		this._objects = remaininObjects;

		return this.Model.staticData.objectDestroy(object.id)
			.then(() => {
				// TODO : Should update _AllApplications in 
			});
	}


	/**
	 * @method objectSave()
	 *
	 * persist the current ABObject in our list of ._objects.
	 *
	 * @param {ABObject} object
	 * @return {Promise}
	 */
	objectSave(object) {
		var isIncluded = (this.objects(function (o) { return o.id == object.id }).length > 0);
		if (!isIncluded) {
			this._objects.push(object);
		}

		// update
		return this.Model.staticData.objectSave(this.id, object.toObj());

	}

	objectGet(id) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.objectGet(id)
				.catch(reject)
				.then(object => {

					if (object) {
						resolve(this.objectNew(object, this));
					}
					else {
						resolve(null);
					}

				});

		});

	}

	objectFind(cond) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.objectFind(cond)
				.catch(reject)
				.then(objects => {

					if (objects && objects.forEach) {

						let result = [];

						objects.forEach(obj => {

							if (obj)
								result.push(this.objectNew(obj, this));
						});

						resolve(result);

					}
					else {
						resolve(null);
					}

				});

		});

	}

	objectInfo(cond) {

		return this.Model.staticData.objectInfo(cond);

	}

	objectImport(objectId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.objectImport(this.id, objectId)
			.catch(reject)
			.then(newObj => {

				let refreshTasks = [];

				// add connect field to exist objects
				(newObj.fields || []).forEach(f => {

					if (f.key == 'connectObject') {

						let linkObject = this.objects(obj => obj.id == f.settings.linkObject)[0];
						if (linkObject) {
							refreshTasks.push(this.objectRefresh(linkObject.id));
						}

					}

				});

				Promise.all(refreshTasks)
					.catch(reject)
					.then(() => {

						// add to list
						var newObjClass = this.objectNew(newObj);
						this._objects.push(newObjClass);

						resolve(newObjClass);

					});

			});

		});

	}

	objectExclude(objectId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.objectExclude(this.id, objectId)
			.catch(reject)
			.then(() => {

				// exclude object from application
				let remainObjects = this.objects(o => o.id != objectId);
				this._objects = remainObjects;

				// exclude conected fields who link to this object
				this.objects().forEach(obj => {

					let remainFields = obj.fields(f => {

						if (f.key == 'connectObject' &&
							f.settings &&
							f.settings.linkObject == objectId) {
							return false;
						}
						else {
							return true;
						}

					}, true);
					obj._fields = remainFields;

				});


				resolve();

			});

		});

	}

	objectRefresh(objectId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.objectGet(objectId)
			.catch(reject)
			.then(object => {

				this.objects().forEach((obj, index) => {

					if (obj.id == objectId) {
						this._objects[index] = new ABObject(object, this);
					}

				});

				resolve();

			});

		});

	}


	///
	/// Fields
	/// 



	///
	/// Pages
	///

	/**
	 * @method pageNew()
	 *
	 * return an instance of a new (unsaved) ABViewPage that is tied to this
	 * ABApplication.
	 *
	 * NOTE: this new page is not included in our this.pages until a .save()
	 * is performed on the page.
	 *
	 * @return {ABViewPage}
	 */
	pageNew(values) {

		// make sure this is an ABViewPage description
		if (values.key != ABViewPage.common().key &&
			values.key != ABViewReportPage.common().key &&
			values.key != ABViewReport.common().key)
			values.key = ABViewPage.common().key;

		return new ABViewManager.newView(values, this, null);
	}



	/**
	 * @method viewNew()
	 *
	 * return an ABView based upon the given values.
	 *
	 * 
	 * @param {obj} values  an object (containing setup info) for the view you
	 *						are requesting.
	 *						values.key {string}  the unique key for which view
	 * @param {ABApplication} application  the current ABApplication instance for
	 *						this application.
	 * @param {ABView} parent  the ABView that is the parent of this view you are
	 * 						requesting.
	 * @return {ABView}
	 */
	viewNew(values, application, parent) {
		return ABViewManager.newView(values, application, parent);
	}



	/**
	 * @method viewAll()
	 *
	 * return a list of all the views available.
	 *
	 * @return {array} of ABView objects
	 */
	viewAll() {
		return ABViewManager.allViews();
	}



	/**
	 * @method viewDestroy()
	 *
	 * remove the current ABView from our list of ._pages or ._views.
	 *
	 * @param {ABView} view
	 * @return {Promise}
	 */
	viewDestroy(view) {

		// return this.save();

		var resolveUrl = view.urlPointer();

		return this.Model.staticData.viewDestroy(this.id, resolveUrl)
			.then(() => {
				// TODO : Should update _AllApplications in 
			});

	}



	/**
	 * @method viewSave()
	 *
	 * persist the current ABView in our list of ._pages or ._views.
	 *
	 * @param {ABView} view
	 * @param {Boolean} includeSubViews
	 * 
	 * @return {Promise}
	 */
	viewSave(view, includeSubViews = false) {
		// var isIncluded = (this.pages(function (p) { return p.id == page.id }).length > 0);
		// if (!isIncluded) {
		// 	this._pages.push(page);
		// }

		var resolveUrl = view.urlPointer(),
			data = view.toObj();

		// return this.save();
		return this.Model.staticData.viewSave(this.id, resolveUrl, data, includeSubViews)
			.then(() => {

				// TODO : Should update _AllApplications in 

				// Trigger a update event to the live display page
				let rootPage = view.pageRoot();
				if (rootPage) {
					AD.comm.hub.publish('ab.interface.update', {
						rootPageId: rootPage.id
					});
				}

			});

	}


	/**
	 * @method viewReorder()
	 *
	 * save order of ._views.
	 *
	 * @param {ABView} view
	 * @return {Promise}
	 */
	viewReorder(view) {

		let resolveUrl = view.urlPointer(),
			data = (view.views() || []).map(v => {
				return {
					id: v.id,
					position: v.position
				}
			});

		return this.Model.staticData.viewReorder(this.id, resolveUrl, data)
			.then(() => {

				// TODO : Should update _AllApplications in 

				// Trigger a update event to the live display page
				let rootPage = view.pageRoot();
				if (rootPage) {
					AD.comm.hub.publish('ab.interface.update', {
						rootPageId: rootPage.id
					});
				}

			});

	}



	/**
	 * @method urlPage()
	 * return the url pointer for pages in this application.
	 * @return {string} 
	 */
	urlPage() {
		return this.urlPointer() + '_pages/'
	}




	///
	/// Queries
	///

	queryLoad() {

		if (this.loadedQueries)
			return Promise.resolve();

		return new Promise((resolve, reject) => {

			this.Model.staticData.queryLoad(this.id)
				.catch(reject)
				.then(queries => {

					this.loadedQueries = true;

					var newQueries = [];
					(queries || []).forEach((query) => {
						// prevent processing of null values.
						if (query) {
							  newQueries.push( this.queryNew(query) );
						  }
					  })
					this._queries = newQueries;

					resolve();

				});

		});

	}

	queryGet(id) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.queryGet(id)
				.catch(reject)
				.then(query => {

					if (query) {
						resolve(this.queryNew(query, this));
					}
					else {
						resolve(null);
					}

				});

		});

	}

	queryFind(cond) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.queryFind(cond)
				.catch(reject)
				.then(queries => {

					if (queries &&
						queries.forEach) {

						let result = [];

						queries.forEach(q => {
							if (q)
								result.push(this.queryNew(q, this));
						});

						resolve(result);

					}
					else {
						resolve(null);
					}

				});

		});

	}

	queryInfo(cond) {

		return this.Model.staticData.queryInfo(cond);

	}

	/**
	 * @method queryNew()
	 *
	 * return an instance of a new (unsaved) ABObjectQuery that is tied to this
	 * ABApplication.
	 *
	 * NOTE: this new object is not included in our this.objects until a .save()
	 * is performed on the object.
	 *
	 * @return {ABObjectQuery}
	 */
	queryNew(values) {

		return new ABObjectQuery(values, this);
	}


	/**
	 * @method queryDestroy()
	 *
	 * remove the current ABObjectQuery from our list of ._queries.
	 *
	 * @param {ABObject} query
	 * @return {Promise}
	 */
	queryDestroy(query) {

		var remaininQueries = this.queries(function (q) { return q.id != query.id; })
		this._queries = remaininQueries;

		return this.Model.staticData.queryDestroy(query.id);
	}


	/**
	 * @method querySave()
	 *
	 * persist the current ABObjectQuery in our list of ._queries.
	 *
	 * @param {ABObjectQuery} query
	 * @return {Promise}
	 */
	querySave(query) {
		var isIncluded = (this.queries(function (q) { return q.id == query.id }).length > 0);
		if (!isIncluded) {
			this._queries.push(query);
		}

		return this.Model.staticData.querySave(this.id, query.toObj());
	}

	queryImport(queryId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.queryImport(this.id, queryId)
				.catch(reject)
				.then(newQuery => {

					let newQueryClass = this.queryNew(newQuery);

					// add to list
					var isIncluded = (this.queries(q => q.id == newQuery.id).length > 0);
					if (!isIncluded) {
						this._queries.push(newQueryClass);
					}

					resolve(newQueryClass);

				});

		});

	}

	queryExclude(queryId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.queryExclude(this.id, queryId)
				.catch(reject)
				.then(() => {

					// remove query from list
					this._queries = this.queries(q => q.id != queryId);

					resolve();

				});

		});

	}



	///
	/// Data views
	///

	dataviewLoad() {

		if (this.loadedDataview)
			return Promise.resolve();

		return new Promise((resolve, reject) => {

			this.Model.staticData.dataviewLoad(this.id)
				.catch(reject)
				.then(dataviews => {

					this.loadedDataview = true;

					var newDataviews = [];
					(dataviews || []).forEach(dataview => {
						// prevent processing of null values.
						if (dataview) {
							  newDataviews.push( this.dataviewNew(dataview) );
						  }
					  })
					this._dataviews = newDataviews;

					// Initial data views
					this.dataviews().forEach(dataview => {
						if (dataview)
							dataview.init();
					});

					resolve();

				});

		});

	}

	dataviewFind(cond) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.dataviewFind(cond)
				.catch(reject)
				.then(dataviews => {

					var result = [];

					(dataviews || []).forEach(dataview => {
						// prevent processing of null values.
						if (dataview) {
							result.push( this.dataviewNew(dataview, this) );
						}
					})

					resolve(result);

				});

		});

	}

	dataviewInfo(cond) {

		return this.Model.staticData.dataviewInfo(cond);

	}

	dataviewNew(values) {

		return new ABDataview(values, this);
	}


	/**
	 * @method dataviewDestroy()
	 *
	 * remove the current ABDataview from our list of ._dataviews.
	 *
	 * @param {ABDataview} dataview
	 * @return {Promise}
	 */
	dataviewDestroy(dataview) {

		var remaininDataviews = this.dataviews(dView => dView.id != dataview.id)
		this._dataviews = remaininDataviews;

		return this.Model.staticData.dataviewDestroy(dataview.id);
	}


	/**
	 * @method dataviewSave()
	 *
	 * persist the current ABDataview in our list of ._dataviews.
	 *
	 * @param {ABDataview} dataview
	 * @return {Promise}
	 */
	dataviewSave(dataview) {
		var isIncluded = (this.dataviews(dView => dView.id == dataview.id).length > 0);
		if (!isIncluded) {
			this._dataviews.push(dataview);
		}

		return this.Model.staticData.dataviewSave(this.id, dataview.toObj());
	}

	dataviewImport(dataviewId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.dataviewImport(this.id, dataviewId)
				.catch(reject)
				.then(newDataview => {

					let newDataviewClass = this.dataviewNew(newDataview);

					// add to list
					var isIncluded = (this.dataviews(q => q.id == newDataview.id).length > 0);
					if (!isIncluded) {
						this._dataviews.push(newDataviewClass);
					}

					resolve(newDataviewClass);

				});

		});

	}

	dataviewExclude(dataviewId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.dataviewExclude(this.id, dataviewId)
				.catch(reject)
				.then(() => {

					// remove query from list
					this._dataviews = this.dataviews(dView => dView.id != dataviewId);

					resolve();

				});

		});

	}

	/**
	 * @function livepage
	 * Get application who includes data view list
	 * This function is used in the live display
	 *
	 * @param {uuid} appID
	 * @param {uuid} pageID
	 * 
	 * @return {Promise}
	 */
	static livepage(appID, pageID) {

		return new Promise((resolve, reject) => {

			var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
			ModelApplication.Models(ABApplication); // set the Models  setting.

			ModelApplication.staticData.livepage(appID, pageID)
				.catch(reject)
				.then(function (app) {

					if (app)
						resolve(new ABApplication(app));
					else
						resolve();

				});
		});

	}



	///
	/// Mobile App
	///



	/**
	 * @method mobileAppNew()
	 *
	 * return an instance of a new (unsaved) ABMobileApp that is tied to this
	 * ABApplication.
	 *
	 * NOTE: this new app is not included in our this.mobileApp until a .save()
	 * is performed on the App.
	 *
	 * @return {ABMobileApp}
	 */
	mobileAppNew(values) {
		return new ABMobileApp(values, this);
	}


	/**
	 * @method mobileAppDestroy()
	 *
	 * remove the current ABMobileApp from our list of ._mobileApps.
	 *
	 * @param {ABMobileApp} app
	 * @return {Promise}
	 */
	mobileAppDestroy(app) {

		var remaininApps = this.mobileApps(function (a) { return a.id != app.id; })
		this._mobileApps = remaininApps;

		return this.Model.staticData.mobileAppDestroy(this.id, app.id)
			.then(() => {
				// TODO : Should update _AllApplications in 
			});
	}


	/**
	 * @method mobileAppSave()
	 *
	 * persist the current ABOMobileApp in our list of ._mobileApps.
	 *
	 * @param {ABOMobileApp} app
	 * @return {Promise}
	 */
	mobileAppSave(app) {
		var isIncluded = (this.mobileApps(function (a) { return a.id == app.id }).length > 0);
		if (!isIncluded) {
			this._mobileApps.push(app);
		}

		return this.Model.staticData.mobileAppSave(this.id, app.toObj())
			.then(() => {
				// TODO : Should update _AllApplications in 
			})
			.catch(()=>{
				console.error('!!! error with .ABApplication.mobileAppSave()');
			});
	}


}

// export to ABLiveTool
window.ABApplication = ABApplication;
