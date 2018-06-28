
// import OP from "OP"
import ABApplicationBase from "./ABApplicationBase"
import "../data/ABApplication"
import ABObject from "./ABObject"
import ABObjectQuery from "./ABObjectQuery"
import ABViewManager from "./ABViewManager"
import ABViewPage from "./views/ABViewPage"
import ABViewReportPage from "./views/ABViewReportPage"
import ABFieldManager from "./ABFieldManager"


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
	 * @function getApplicationById
	 *
	 *
	 * @return {Promise}
	 */
	static getApplicationById(id) {
		return new Promise(
			(resolve, reject) => {

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll({ id: id })
					.then(function (data) {

						resolve(data.getItem(data.getFirstId()));
					})
					.catch(reject);

			}
		)
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

		return OP.Comm.Service.put({
			url: '/app_builder/application/' + this.id + '/info',
			data: {
				translations: values.json.translations
			}
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
		return OP.Comm.Service.put({
			url: '/app_builder/' + this.id + '/role/assign',
			data: {
				roles: permItems
			}
		});
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
		return OP.Comm.Service.get({ url: '/app_builder/' + this.id + '/role' });
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

		return OP.Comm.Service.post({ url: '/app_builder/' + this.id + '/role' });
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
		
		return OP.Comm.Service.delete({ url: '/app_builder/' + this.id + '/role' });
	}



	///
	/// Objects
	///


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

		return this.Model.staticData.objectDestroy(this.id, object.id)
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

		return this.Model.staticData.objectSave(this.id, object.toObj())
			.then(() => {
				// TODO : Should update _AllApplications in 
			})
			.catch(()=>{
				console.error('!!! error with .ABApplication.objectSave()');
			});
	}


	///
	/// Fields
	/// 


	/**
	 * @method fieldNew()
	 *
	 * return an instance of a new (unsaved) ABField that is tied to this
	 * ABObject.
	 *
	 * NOTE: this new field is not included in our this.fields until a .save()
	 * is performed on the field.
	 *
	 * @param {obj} values  the initial values for this field.  
	 *						{ key:'{string}'} is required 
	 * @param {ABObject} parent  the parent object this field belongs to.
	 * @return {ABField}
	 */
	fieldNew ( values, parent ) {
		// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
		return ABFieldManager.newField( values, parent );
	}


	///
	/// Pages
	///


	/**
	 * @method pages()
	 *
	 * return an array of all the ABViewPages for this ABApplication.
	 *
	 * @param {fn} filter		a filter fn to return a set of ABViewPages that this fn
	 *							returns true for.
	 * @param {boolean} deep	flag to find in sub pages
	 * 
	 * @return {array}			array of ABViewPages
	 */
	pages(filter, deep) {

		var result = [];

		if (!this._pages || this._pages.length < 1)
			return result;

		// find into sub-pages recursively
		if (filter && deep) {

			result = this._pages.filter(filter);

			if (result.length < 1) {
				this._pages.forEach((p) => {
					var subPages = p.pages(filter, deep);
					if (subPages && subPages.length > 0) {
						result = subPages;
					}
				});
			}

		}
		// find root pages
		else {

			filter = filter || function () { return true; };

			result = this._pages.filter(filter);

		}

		return result;

	}



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
			values.key != ABViewReportPage.common().key)
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
	 * @method pageDestroy()
	 *
	 * remove the current ABViewPage from our list of ._pages.
	 *
	 * @param {ABViewPage} page
	 * @return {Promise}
	 */
	pageDestroy(page) {

		// return this.save();

		var resolveUrl = page.urlPointer();

		return this.Model.staticData.pageDestroy(this.id, resolveUrl)
			.then(() => {
				// TODO : Should update _AllApplications in 
			});

	}



	/**
	 * @method pageSave()
	 *
	 * persist the current ABViewPage in our list of ._pages.
	 *
	 * @param {ABViewPage} object
	 * @return {Promise}
	 */
	pageSave(page) {
		// var isIncluded = (this.pages(function (p) { return p.id == page.id }).length > 0);
		// if (!isIncluded) {
		// 	this._pages.push(page);
		// }

		var resolveUrl = page.urlPointer(),
			data = page.toObj();

		// return this.save();
		return this.Model.staticData.pageSave(this.id, resolveUrl, data)
			.then(() => {

				// TODO : Should update _AllApplications in 

				// Trigger a update event to the live display page
				AD.comm.hub.publish('ab.interface.update', {
					rootPage: page.pageRoot()	// instance of the root page
				});

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

		return this.Model.staticData.queryDestroy(this.id, query.id)
			.then(() => {
				// TODO : Should update _AllApplications in 
			});
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

		return this.Model.staticData.querySave(this.id, query.toObj())
			.then(() => {
				// TODO : Should update _AllApplications in 
			})
			.catch(()=>{
				console.error('!!! error with .ABApplication.querySave()');
			});
	}


}

// export to ABLiveTool
window.ABApplication = ABApplication;
