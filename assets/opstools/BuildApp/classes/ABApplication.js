import "../data/ABApplication"


var _AllApplications = [];

export default class ABApplication {

    constructor(attributes) {
    	this.id    = attributes.id;
    	this.name  = attributes.attr('name');
	  	this.label = attributes.attr('label');
	  	this.description = attributes.attr('description');
	  	this.role  = attributes.attr('role');
  	}

  	///
  	/// Static Methods
  	///
	static allApplications() {
		return new Promise( 
			function(resolve, reject) {

				var ModelApplication = AD.Model.get('opstools.BuildApp.ABApplication');

				ModelApplication.findAll()
					.fail(function(err){
						reject(err);
					})
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

	// Permission
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
