
// import OP from "OP"
import ABApplicationBase from "./ABApplicationBase"
import "../data/ABApplication"
import ABObject from "./ABObject"


var _AllApplications = [];


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function toArray(DC) {
	var ary = [];

	var id = DC.getFirstId();
	while(id) {
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


	  	// import all our ABViews



	  	// instance keeps a link to our Model for .save() and .destroy();
	  	this.Model = OP.Model.get('opstools.BuildApp.ABApplication');
	  	this.Model.Models(ABApplication);
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
					.then(function(data){

						// NOTE: data is already a DataCollection from .findAll()
						_AllApplications = data;

						resolve(data);
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
			function(resolve, reject) {

				var newApp = {}
				OP.Multilingual.unTranslate(values, newApp, ABApplication.fieldsMultilingual());
				values.json = newApp;
				newApp.name = values.name;

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.create(values)
				.then(function(app){

					// return an instance of ABApplication
					var App = new ABApplication(app);

					_AllApplications.add(App,0);
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

					validator.addError('label', L('ab_form_application_duplicate_name', "*Name (#name#) is already in use").replace('#name#', nameMatch) )
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
	destroy () {
		if (this.id) {
			return this.Model.destroy(this.id)
				.then(()=>{
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
	save () {

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
	toObj () {

		OP.Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());

		return super.toObj();
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
	assignPermissions (permItems) {
		return new Promise(
			(resolve, reject) => {
				AD.comm.service.put({
					url: '/app_builder/' + this.id + '/role/assign',
					data: {
						roles: permItems
					}
				})
				.fail(reject)
				.done(resolve);
			}
		)
	}


	/**
	 * @method getPermissions()
	 *
	 * Return an array of role assignments that are currently assigned to this
	 * ABApplication.
	 *
	 * @return {Promise} 	resolve(list) : list {array} Role assignments
	 */
	getPermissions () {

		return new Promise(
			(resolve, reject) => {

				AD.comm.service.get({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)
			}
		);
	}


	/**
	 * @method createPermission()
	 *
	 * Create a Role in the system after the name of the current ABApplication.
	 *
	 * @return {Promise}
	 */
	createPermission () {
		return new Promise(
			(resolve, reject) => {

// TODO: need to take created role and store as : .json.applicationRole = role.id

				AD.comm.service.post({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}


	/**
	 * @method deletePermission()
	 *
	 * Remove the Role in the system of the current ABApplication.
	 * (the one created by  .createPermission() )
	 *
	 * @return {Promise}
	 */
	deletePermission () {
		return new Promise(
			(resolve, reject) => {

// TODO: need to remove created role from : .json.applicationRole
				AD.comm.service.delete({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
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
	objectNew( values ) {
		return new ABObject(values, this);
	}


}
