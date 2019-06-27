var ABModelBase = require('./ABModelBase');

class ABDataview extends ABModelBase {

	static get collectionName() {
		return "dataview";
	}

	static get relations() {

		return {
			applications: {
				edgeName: "applicationDataview",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			},

			object: {
				edgeName: "dataviewObject",
				linkCollection: "object",
				direction: this.relateDirection.OUTBOUND
			},

			query: {
				edgeName: "dataviewQuery",
				linkCollection: "query",
				direction: this.relateDirection.OUTBOUND
			}
		};

	}

}

module.exports = ABDataview;