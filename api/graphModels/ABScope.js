const ABModelBase = require('./ABModelBase');

module.exports = class ABScope extends ABModelBase {

	static get collectionName() {
		return "scope";
	}

	static get relations() {

		return {

			roles: {
				edgeName: "roleScope",
				linkCollection: "role",
				direction: this.relateDirection.INBOUND
			},

			objects: {
				edgeName: "scopeObject",
				linkCollection: "object",
				direction: this.relateDirection.OUTBOUND
			},

			users: {
				edgeName: "scopeUser",
				direction: this.relateDirection.OUTBOUND
			}

		};

	}

	/**
	 * @method getFilter
	 * 
	 * @param {string} username
	 * @param {uuid} objectId
	 * 
	 * @return {Promise}
	 */
	static getFilter(username, objectId) {

		return this.query(`
				FOR join IN scopeUser
				FOR s IN scope
				FOR sObj IN scopeObject
				FILTER join._to == 'user/${username}'
				&& join._from == s._id
				&& sObj._to == 'object/${objectId}'
				&& sObj._from == s._id
				RETURN s
		`)

	}

}