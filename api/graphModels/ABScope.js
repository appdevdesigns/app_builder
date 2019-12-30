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

			object: {
				edgeName: "scopeObject",
				linkCollection: "object",
				direction: this.relateDirection.OUTBOUND
			}

		};

	}

}