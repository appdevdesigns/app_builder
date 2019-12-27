const ABModelBase = require('./ABModelBase');

module.exports = class ABRole extends ABModelBase {

	static get collectionName() {
		return "role";
	}

	static get relations() {

		return {

			applications: {
				edgeName: "applicationRole",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			},

			scopes: {
				edgeName: "roleScope",
				linkCollection: "role",
				direction: this.relateDirection.OUTBOUND
			}

		};

	}

	static getRolesByUsername(username) {

		return ABRole.query(
			`FOR row IN role
			FILTER row.usernames ANY == '${username}'
			RETURN row`);

	}

}