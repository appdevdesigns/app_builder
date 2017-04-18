
import OP from "../OP/OP"
import "../data/ABApplication"


var _AllApplications = [];

export default class ABApplication {

    constructor(attributes) {
    	this.id    = attributes.id;

    	this.json = attributes.json;

    	this.name  = attributes.name || this.json.name || "";

    	// multilingual fields: label, description
    	OP.Multilingual.translate(this, this.json, ABApplication.fieldsMultilingual());

	  	this.role  = attributes.role;

	  	// instance keeps a link to our Model for .save() and .destroy();
	  	this.Model = OP.Model.get('opstools.BuildApp.ABApplication');
	  	this.Model.Models(ABApplication);
  	}

  	///
  	/// Static Methods
  	///
	static allApplications() {
		return new Promise( 
			(resolve, reject) => {

				var ModelApplication = OP.Model.get('opstools.BuildApp.ABApplication');
				ModelApplication.Models(ABApplication); // set the Models  setting.

				ModelApplication.findAll()
					.then(function(data){
						
						_AllApplications = data;

						resolve(data);
					})
					.catch(reject);

			}
		)

	}


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


//// TODO: 
//// Refactor isValid() to ignore op and not error if duplicateName is own .id

	static isValid(op, values) {

			var errors = [];

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:
				var matchingApps = _AllApplications._toArray().filter(function (app) { 
					return app.name.trim().toLowerCase() == values.label.trim().replace(/ /g, '_').toLowerCase(); 
				})
				if (matchingApps && matchingApps.length > 0) {
					
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


	destroy () {
		if (this.id) {
			return this.Model.destroy(this.id)
				.then(()=>{
					_AllApplications.remove(this.id);
				});
		}
	}

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


	toObj () {

		OP.Multilingual.unTranslate(this, this.json, ABApplication.fieldsMultilingual());
		this.json.name = this.name;

		// for each Object: compile to json

		return {
			id:this.id,
			name:this.name,
			json:this.json,
			role:this.role
		}



	}
}
