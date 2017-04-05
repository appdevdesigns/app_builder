import "../data/ABApplication"


export default class ABApplication {

    constructor(attributes) {
    	this.id    = attributes.id;
    	this.name  = attributes.attr('name');
	  	this.label = attributes.attr('label');
	  	this.description = attributes.attr('description');
	  	this.role  = attributes.attr('role');
  	}


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
						
						resolve(new ModelApplication.List(allApplications));
					})

			}
		)

	} 

  // We will look at static and subclassed methods shortly
}
