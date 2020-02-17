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
	 * @param {array} objectIds
	 * 
	 * @return {Promise}
	 */
	static getFilter(username = "", objectIds = []) {

		objectIds = objectIds.map(objId => `'object/${objId}'`);

		return this.query(`
			FOR sUser IN scopeUser
			FOR s IN scope
			FOR sObj IN scopeObject
			FOR r in role
			FOR rScope in roleScope
			FILTER sUser.username == '${username}'
			&& [${objectIds.join(',')}] ANY == sObj._to
			&& sUser._from == r._id
			&& sUser._to == s._id
			&& sObj._from == s._id
			&& rScope._from == r._id
			&& rScope._to == s._id
			RETURN s
		`);

	}

}