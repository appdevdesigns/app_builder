//
// OP.Comm.Service.*
// 
// Map our old jQuery deferred comm utilities with ES6 promises.
//


var services = {


	// OP.Comm.Service.get(options, cb) => {promise}
	get: function(options, cb) {
		return new Promise( 
			(resolve, reject) => {
				AD.comm.service.get(options,cb)
				.then(resolve, reject);
			}
		);
	},


	// OP.Comm.Service.post(options, cb) => {promise}
	post: function(options, cb) {
		return new Promise( 
			(resolve, reject) => {
				AD.comm.service.post(options,cb)
				.then(resolve, reject);
			}
		);
	},


	// OP.Comm.Service.put(options, cb) => {promise}
	put: function(options, cb) {
		return new Promise( 
			(resolve, reject) => {
				AD.comm.service.put(options,cb)
				.then(resolve, reject);
			}
		);
	}

}


// OP.Comm.Service.delete(options, cb) => {promise}
services['delete'] = function(options, cb) {
	return new Promise( 
		(resolve, reject) => {
			AD.comm.service['delete'](options,cb)
			.then(resolve, reject);
		}
	);
}


export default services;