var __ObjectPool = {};

module.exports = {

	/**
	 * @function cache
	 * 
	 * @param {ABClassObject} object 
	 */
	cache: function (object) {

		if (object == null)
			return;

		__ObjectPool[object.id] = object;

	},

	/**
	 * @function get
	 * 
	 * @param {uuid} id 
	 * 
	 * @return {ABClassObject}
	 */
	get: function (id) {

		return __ObjectPool[id] || null;

	},

	/**
	 * @function remove
	 * 
	 * @param {uuid} id 
	 */
	remove: function (id) {

		if (id == null)
			return;

		delete __ObjectPool[id];

	},

	/**
	 * @function list
	 * 
	 * @param {function} filter
	 */
	list: function(filter = () => true) {

		let result = [];

		for (let key in (__ObjectPool || {})) {

			let obj = __ObjectPool[key];
			if (filter(obj))
				result.push(obj);

		}

		return result;

	}

}