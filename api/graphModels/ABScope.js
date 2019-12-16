const ABModelBase = require('./ABModelBase');

module.exports = class ABScope extends ABModelBase {

	static get collectionName() {
		return "scope";
	}

	static get relations() {

		return {

			applications: {
				edgeName: "applicationScope",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			}

		};

	}



}