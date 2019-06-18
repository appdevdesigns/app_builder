var path = require('path');

var ABModelBase = require('./ABModelBase');
var ABClassObject = require(path.join('..', 'classes', 'ABClassObject'));

class ABObject extends ABModelBase {

	static get collectionName() {
		return "object";
	}

	static get relations() {

		return {
			applications: {
				edgeName: "applicationObject",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			},

			queries: {
				edgeName: "queryObject",
				linkCollection: "query",
				direction: this.relateDirection.INBOUND
			}
		};

	}

	static afterCreate(newRecord) {

		// Cache in .constructor of ABClassObject
		newRecord.toABClass();

	}

	static afterUpdate(updatedRecord) {

		// Cache in .constructor of ABClassObject
		updatedRecord.toABClass();

	}

	static afterDestroy(record) {

		// remove cache
		ABObjectCache.remove(record.id);

	}

	toABClass() {

		return new ABClassObject(this);

	}


}

module.exports = ABObject;