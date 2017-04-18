

var _restURLs = {
	findAll: 'GET #url#',
	findOne: 'GET #url#/{id}',
	create:  'POST #url#',
	update:  'PUT #url#/{id}',
	destroy: 'DELETE #url#/{id}',
}


var _Models = {};


class OPModel {

	constructor(key, staticData, instanceData) {

		this.key = key;
		this.staticData = staticData;
		this.instanceData = instanceData;
		this.Model = staticData.Model;

		this.url = {};
		for(var r in _restURLs) {
			this.url[r] = staticData[r]
		}

	}

	Models(Model) {
		this.Model = Model;
	}

	findAll(cond ) {
		return new Promise( 
			(resolve, reject) => {

// NOTE: currently reusing AD.Model

				// var Model = AD.Model.get(this.key);
				// Model.findAll(cond)

				var service = this.service('findAll');

				AD.comm.service[service.verb]({ url:service.url, params: cond })
				.fail(reject)
				.done((data) => {

					data = data.data || data;

					// our findAll() should return an array of items.
					if (!Array.isArray(data)) {
						data = [data];
					}


					// return instances of this.Model if provided:
					if (this.Model) {
						var newList = []; // Model.List();
						data.forEach((l) => {
							if (l) {
								newList.push( new this.Model(l) );
							}
						})

						data = newList;
					}


					// convert to a WebixDataCollection:
					var dc = new webix.DataCollection({
						data: data,

						on: {
							onAfterDelete: function(id) {

							}
						}
					});


					dc._toArray = function() {
						var data = [];
						var id = this.getFirstId();
						while(id) {
							data.push(this.getItem(id));
							id = this.getNextId(id);
						}
						return data;
					}



					resolve(dc);

				});
			}
		);
	}

	findOne(cond) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('findOne');

				var nURI = service.url;
                for (var k in cond) {
                    var oURI = nURI;
                    nURI = AD.util.string.replaceAll(nURI, "{" + k + "}", cond[k]);

                    // if there was a change, remove k from cond:
                    if (oURI != nURI) {
                        delete cond[k];
                    }
                }
                service.url = nURI;

				AD.comm.service[service.verb]({ url:service.url, params: cond })
				.fail(reject)
				.done(function(item){
					if (item.translate) item.translate();

					resolve(item.attr?item.attr():item);
				});
			}
		);
	}

	create(attr) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('create');

				AD.comm.service[service.verb]({ url:service.url, params: attr })
				.fail(reject)
				.done(function(item){
					if (item.translate) item.translate();

					resolve(item.attr?item.attr():item);
				});
			}
		);
	}

	update(id, attr) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('update', id);

				AD.comm.service[service.verb]({ url:service.url, params: attr })
				.fail(reject)
				.done(resolve);
			}
		);
	}

	destroy(id) {
		return new Promise( 
			(resolve, reject) => {

				var service = this.service('destroy', id);

				AD.comm.service[service.verb]({ url:service.url, params: {} })
				.fail(reject)
				.done(resolve);
			}
		);
	}


	service(key, id) {
		var parts = this.url[key].split(' ');
		var verb = parts[0].toLowerCase();
		var uri = parts.pop(); 

		if (id) {
			var key = '{id}';
	        uri = AD.util.string.replaceAll(uri, key, id);
	    }

        return {
        	verb:verb,
        	url:uri
        }
	}
}


export default {

	extend:function(key, staticData, instance) {


		//
		// Create the AD.Model from this definition
		//

		if (staticData.restURL) {
			for (var u in _restURLs) {
				staticData[u] = _restURLs[u].replace('#url#', staticData.restURL);
			}
			
		}

		// var alreadyThere = AD.Model.get(key);
		// if (!alreadyThere) {

		// 	AD.Model.Base.extend(key, staticData, instance);
		// 	AD.Model.extend(key, staticData, instance);
		// }
		
		//
		// Now create our OP.Model:
		//
		var curr = nameSpace(_Models, key);
		var modelName = objectName(key);

		curr[modelName] = new OPModel(key, staticData, instance);

	},

	get: function(key) {
		return findObject(_Models, key);
	}
}








            /*
             * @function findObject
             *
             * Return the object specified by the given name space:
             *
             * @param {object} baseObj  The base object to search on
             *                          usually AD.models or AD.models_base
             *
             * @param {string} name   The provided namespace to parse and search for
             *                        The name can be spaced using '.' 
             *                        eg.  'coolTool.Resource1' => AD.models.coolTool.Resource1
             *                             'coolerApp.tool1.Resource1' => AD.models.coolerApp.tool1.Resource1
             *
             * @returns {object}  the object resolved by the namespaced base 
             *                    eg:  findObject(AD.models, 'Resource') => return AD.models.Resource
             *                         findObject(AD.models, 'coolTool.Resource1') => AD.models.coolTool.Resource1
             *
             *                    if an object is not found, null is returned.
             */
            var findObject = function (baseObj, name) {

                // first lets figure out our namespacing:
                var nameList = name.split('.');

                // for each remaining name segments, make sure we have a 
                // namespace container for it:
                var curr = baseObj;
                nameList.forEach(function (name) {

                    if (curr == null) {
                        var whoops = true;
                        console.error('! current name segment is null.  Check your given name to make sure it is properly given: ', name);
                    }
                    if (curr) {
                        if (typeof curr[name] == 'undefined') {
                            curr = null;
                        }
                        if (curr) curr = curr[name];
                    }
                })

                return curr;
            }



            /*
             * @function objectName
             *
             * parse the name and return the name of the object we will create.
             *
             * @param {string} name   The provided namespace to parse 
             *                        The name can be spaced using '.' 
             *
             * @returns {string}  the name of the model object 
             *                    eg:  objectName('Resource') => return 'Resource'
             *                         objectName('coolTool.Resource1') => 'Resource1'
             */
            var objectName = function (name) {

                // first lets figure out our namespacing:
                var nameList = name.split('.');
                var objName = nameList.pop(); // remove the last one.

                return objName;
            }



            /*
             * @function nameSpace
             *
             * Make sure the proper name space is created on the given base.
             *
             * @param {object} baseObj  The base object to create the namespace on
             *                          usually AD.models or AD.models_base
             *
             * @param {string} name   The provided namespace to parse and create
             *                        The name can be spaced using '.' 
             *                        eg.  'coolTool.Resource1' => AD.models.coolTool.Resource1
             *                             'coolerApp.tool1.Resource1' => AD.models.coolerApp.tool1.Resource1
             *
             * @returns {object}  the object that represents the namespaced base 
             *                    that the Model is to be created on.
             *                    eg:  nameSpace(AD.models, 'Resource') => return AD.models
             *                         nameSpace(AD.models, 'coolTool.Resource1') => AD.models.coolTool
             */
            var nameSpace = function (baseObj, name) {

                // first lets figure out our namespacing:
                var nameList = name.split('.');
                var controlName = nameList.pop(); // remove the last one.

                // for each remaining name segments, make sure we have a 
                // namespace container for it:
                var curr = baseObj;
                nameList.forEach(function (name) {

                    if (typeof curr[name] == 'undefined') {
                        curr[name] = {};
                    }
                    curr = curr[name];
                })

                return curr;
            }