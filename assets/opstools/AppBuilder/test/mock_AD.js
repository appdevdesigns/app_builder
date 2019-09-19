var AD = AD || {};

AD.util = {
	// AD.util.uuid
	uuid: function () {
		return webix.uid();
	},
	// AD.util.string.replaceAll
	string: {
		replaceAll: function (origString, replaceThis, withThis) {
			var re = new RegExp(AD.util.string.quoteRegExp(replaceThis), "g");
			return origString.replace(re, withThis);
		}
	}
};

AD.op = {
	// AD.op.Dialog
	Dialog: {
		Alert: function (opts) { },
		Confirm: function (opts) { },
		ConfirmDelete: function (opts) { }
	}
};


// default success responses:
var comm_responses = {
	"GET /site/user/data" : { user:{ username:'test' } }
}

// default error responses:
var comm_errors = {}



function _request(o, cb) {

	var key = o.method.toUpperCase() + ' ' + o.url;

	// NOTE: phantomjs doesn't currently fully support ES6 syntax. :(  
	// return new Promise((resolve, reject) => {
	// 	resolve(comm_responses[o.url]);
	// });

	return new Promise( function(resolve, reject) {

		// if our request key is found in errors then reject()
		if (comm_errors[key]) {
			reject(comm_errors[key]);
		} else {

			// else resolve()
			resolve(comm_responses[key]);
		}
	});
	
}

AD.comm = {
	// AD.comm.service
	service: {

		get: function (options, cb) {
		    options['method'] = 'GET';
		    return _request(options, cb);
		},
		post: function (options, cb) {
		    options['method'] = 'POST';
		    return _request(options, cb);
		},
		put: function (options, cb) {
		    options['method'] = 'PUT';
		    return _request(options, cb);
		}
	},

	hub: {
		subscribe: function(eventName, cb) {
		}
	},


	// AD.comm.mockURL(method, url, value, success);
	//
	// For testing, create a mock url capability, to set a 
	// value that should be returned for a url.
	// @param {string} method  the HTTP verb for the request
	// @param {string} url     the url reference
	// @param {mixed}  value   the value to return.
	// @param {bool}   success is this a successful response?
	//							true: make sure result is resolved()
	//							false: make sure result is reject()
	//
	mockURL: function(method, url, value, success) {

		if (typeof success == 'undefined') {
			success = true;
		}
		var key = method.toUpperCase() + ' ' + url;

		if (success) {
			comm_responses[key] = value;
		} else {
			comm_errors[key] = value;
		}
		
	}
};

AD.comm.service['delete'] = function (options, cb) {
    options['method'] = 'DELETE';
    return _request(options, cb);
};



AD.error = {
	// AD.error.log
	log: function (message, data) {
	}
};


AD.lang = {
	// AD.lang.currentLanguage
	currentLanguage: 'en',
	// AD.lang.label.getLabel
	label: {
		getLabel: function (key) {
			return "Label of " + key;
		}
	}
};

AD.Control = {
	// AD.Control.OpsTool.extend
	OpsTool: {
		extend: function (name, staticDef, instanceDef) {
			return {};
		}
	}
}

module.exports = AD;