
import OP from "../OP/OP"
import "../data/ABApplication"


var _AllApplications = [];

export default class ABApplication {

    constructor(attributes) {
    	this.id    = attributes.id;

    	var json = attributes.attr('json');

    	this.name  = json.name || "";

    	OP.Multilingual.translate(this, json, ABApplication.fieldsMultilingual());
	  	// this.label = attributes.attr('label');
	  	// this.description = attributes.attr('description');
	  	this.role  = attributes.attr('role');
  	}

  	///
  	/// Static Methods
  	///
	static allApplications() {
		return new Promise( 
			function(resolve, reject) {

				var ModelApplication = AD.Model.get('opstools.BuildApp.ABApplication');


// goal, to Async pull data from sails,
// auto listen for updates
// return a webix DataCollection
//
// OP.Model.findAll(ModelApplication, cond)
// .then(function(DataCollection){

// })
// .catch(err);

// OP.Model.serverSync(ArrayObjects, ModelApplication)

				ModelApplication.findAll()
					.fail(reject)
					.then(function(data){
						var allApplications = [];

					    data.forEach(function (d) {
							if (d.translate) d.translate();

							if (!d.description) d.attr('description', '');

							// 
							allApplications.push( new ABApplication(d) );
						});
						
						_AllApplications = new ModelApplication.List(allApplications);
						resolve(_AllApplications);
					})

			}
		)

	}


	static create(values) {
		return new Promise(
			function(resolve, reject) {


				var ModelApplication = AD.Model.get('opstools.BuildApp.ABApplication');

				var newApp = {}
				OP.Multilingual.unTranslate(values, newApp, ABApplication.fieldsMultilingual());
				values.json = newApp;
				newApp.name = values.name;

				ModelApplication.create(values)
				.fail(reject)
				.done(function(app){

					// return an instance of ABApplication
					var App = new ABApplication(app);
//// LEFT OFF HERE:
// _AllApplications is a Can.List() that expectes model instances (with .attr() values)
// it will get called to AD.op.webixDataCollection() where the problem happens.
// solve this!
// get returned App to mimic Can.Model() definition
//  -> attr()
//  -> getID()
//  .destroy()
//

					_AllApplications.push(App);
					resolve(App);
				})
			}
		)
	}


	/**
	 * @method fieldsMultilingual()
	 *
	 * return an array of fields that are considered Multilingual labels
	 * 
	 * @return {array} 
	 */
	static fieldsMultilingual() {
		return ['label', 'description'];
	} 


	static isValid(op, values) {

// var appName = $$(id.form).elements['label'].getValue(),
// 				appDescription = $$(id.form).elements['description'].getValue();

			var errors = [];

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:

				if (_AllApplications.filter(function (app) { return app.name.trim().toLowerCase() == values.label.trim().replace(/ /g, '_').toLowerCase(); }).length > 0) {
					
					errors.push({
						name:'label',
						mlKey:'duplicateName',
						defaultText: '**Name must be Unique.'
					})
				}

			}


			// Check the common validations:
// TODO:
// if (!inputValidator.validate(values.label)) {
// 	_logic.buttonSaveEnable();
// 	return false;
// }


			return errors;
	} 



	///
	/// Instance Methods
	///

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

	// Permissions
	getPermissions () {

		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.get({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}

	createPermission () {
		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.post({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}

	deletePermission () {
		return new Promise( 
			(resolve, reject) => {

				AD.comm.service.delete({ url: '/app_builder/' + this.id + '/role' })
				.fail(reject)
				.done(resolve)

			}
		);
	}

}
