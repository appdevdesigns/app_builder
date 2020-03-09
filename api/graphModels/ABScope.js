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
			}

		};

	}

	/**
	 * @method getFilter
	 * 
	 * @param {Object} - options {
	 * 		username: STRING,
	 * 		objectIds: ARRAY,
	 * 		ignoreQueryId: UUID [optional] - ignore filter rules who has filter to query id
	 * }
	 * 
	 * @return {Promise}
	 */
	static getFilter(options = {}) {

		if (!options.username)
			return Promise.resolve([]);

		options.objectIds = (options.objectIds || []).map(objId => `'object/${objId}'`);

		return new Promise((resolve, reject) => {

			// this.query(`
			// 	FOR sUser IN scopeUser
			// 	FOR s IN scope
			// 	FOR sObj IN scopeObject
			// 	FOR r in role
			// 	FOR rScope in roleScope
			// 	FILTER sUser.username == '${options.username}'
			// 	&& (s.allowAll == true || s.allowAll == '1' || [${options.objectIds.join(',')}] ANY == sObj._to
			// 	&& (s.allowAll == true || s.allowAll == '1' || sObj._from == s._id)
			// 	&& sUser._from == r._id
			// 	&& sUser._to == s._id
			// 	&& rScope._from == r._id
			// 	&& rScope._to == s._id
			// 	RETURN s
			// `)

			this.query(`
				FOR rUser IN roleUser
				FOR s IN scope
				FOR r in role
				FOR rScope in roleScope
				FILTER rUser._from == r._id
				&& rUser._to == 'username/${options.username}'
				&& rScope._from == r._id
				&& rScope._to == s._id
				&& (s.allowAll == true || 
						s.allowAll == '1' || 
						(FOR sObj IN scopeObject FILTER sObj._from == s._id RETURN sObj._to).length > 0
					)
				RETURN s
			`)
				.catch(reject)
				.then(scopes => {

					// remove rules who has filter to query id
					if (options.ignoreQueryId) {
						(scopes || []).forEach(s => {

							if (!s ||
								!s.filter ||
								!s.filter.rules ||
								s.filter.rules.length < 1)
								return;

							s.filter.rules.forEach((r, rIndex) => {

								if (r.rule &&

									(r.rule == "in_query" ||
										r.rule == "not_in_query" ||
										r.rule == "in_query_field" ||
										r.rule == "not_in_query_field") &&

									(r.value || "").indexOf(options.ignoreQueryId) > -1) {

									s.filter.rules.splice(rIndex, 1);
								}

							});

						});
					}

					resolve(scopes);

				});

		});

	}

	hasFilteredQuery(queryId) {

		if (!queryId ||
			!this.filter ||
			!this.filter.rules ||
			this.filter.rules.length < 1)
			return false;

		let result = false;

		this.filter.rules.forEach(r => {

			if (result == true)
				return;

			// has this query in filter
			if (r.rule == "in_query" ||
				r.rule == "not_in_query" ||
				r.rule == "in_query_field" ||
				r.rule == "not_in_query_field") {

				result = (r.value || "").indexOf(queryId) > -1
			}
		});

		return result;

	}

}