var path = require('path');

var ABModelBase = require('./ABModelBase');
var ABClassObject = require(path.join('..', 'classes', 'ABClassObject'));
var ABObjectExternal = require(path.join('..', 'classes', 'ABObjectExternal'));
var ABObjectImport = require(path.join('..', 'classes', 'ABObjectImport'));

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
			},

			dataviews: {
				edgeName: "dataviewObject",
				linkCollection: "dataview",
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

		// Broadcast
		sails.sockets.broadcast(updatedRecord.id, "ab.object.update", {
			objectId: updatedRecord.id,
			data: updatedRecord
		});

	}

	static afterDestroy(record) {

		// remove cache
		ABObjectCache.remove(record.id);

	}

	toABClass() {

		if (this.isExternal == true)
			return new ABObjectExternal(this);
		else if (this.isImported == true)
			return new ABObjectImport(this);
		else
			return new ABClassObject(this);

	}


}

module.exports = ABObject;