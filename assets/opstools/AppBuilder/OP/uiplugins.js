/*
 * OP.UI
 *
 * A set of helpers for managing shared UI plugins across apps.
 *
 */

var _SharedComponents = {}

// TODO: replace this with an instance of EventEmitter()
var _callbacks = { 'new':[] };

export default {

	/**
	 * @function OP.UIPlugin.register
	 *
	 * Register a ui component to be shared among other OPs Portal 
	 * apps.
	 *
	 * @param {string} key a unique key-reference for this object.
	 * @param {obj} obj  The instance of the object being translated
	 */
	register:function(key, obj) {
		_SharedComponents[key] = obj;
		this.trigger('new', obj);
	},


	/**
	 * @function OP.UIPlugin.get
	 *
	 * return a UI plugin.  Since UIPlugins need to be registered in the 
	 * system as other plugins load, this is an asynchronous operation.
	 *
	 * @param {string} key  the unique key of the UI plugin to return
	 * @return {Promise}
	 */
	get: function( key ) {
		return new Promise( 
			(resolve, reject) => {

				// if present, then just resolve and quit.
				if (_SharedComponents[key]) {
					resolve(_SharedComponents[key]);
					return;
				}

				//// get ready to wait for it
				function waitForIt(time, attempt, maxAttempts) {
					if (_SharedComponents[key]) {
						resolve(_SharedComponents[key]);
					} else {

						attempt += 1; 
						if (attempt>maxAttempts) {
							var err = new Error('OP.UIPlugin.get(): couldn\'t find plugin: '+key);
							reject(err);
						} else {

							setTimeout(()=>{
								waitForIt(time+1000, attempt+1, maxAttempts);
							}, time);
						}
						

					}
				}
				waitForIt(10, 0, 25);
			}
		);
		
	},


	list: function() {
		return Object.keys(_SharedComponents); 
	}, 


	on: function(key, cb) {
		if (_callbacks[key]) {
			_callbacks[key].push(cb);
		}
	},

	trigger:function(key, data) {
		if (_callbacks[key]) {
			_callbacks[key].forEach((cb)=>{
				cb(data);
			});
		}
	}
}