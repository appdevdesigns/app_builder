var path = require('path');

var ABModelBase = require('./ABModelBase');
var ABClassQuery = require(path.join('..', 'classes', 'ABClassQuery'));

class ABQuery extends ABModelBase {

	static get collectionName() {
		return "query";
	}

	static get relations() {

		return {
			applications: {
				edgeName: "applicationQuery",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			},

			objects: {
				edgeName: "queryObject",
				linkCollection: "object",
				direction: this.relateDirection.OUTBOUND
			},

			dataviews: {
				edgeName: "dataviewQuery",
				linkCollection: "dataview",
				direction: this.relateDirection.INBOUND
			}

		};

	}

	toABClass() {

		return new ABClassQuery(this);

	}


}

module.exports = ABQuery;