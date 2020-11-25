/**
 * ABDefinitionModel.js
 *
 * @description :: ABDefinitionModel is a generic object definition store.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require("uuid/v4"),
   path = require("path");

// var ABClassObject = require(path.join('..', 'classes', 'ABClassObject'));

var __AllDefinitions = {};

module.exports = {
   tableName: "appbuilder_definition",

   // connection: 'appdev_default',

   attributes: {
      id: { type: "string", primaryKey: true },

      // initial creation label, just for us to help lookup data.
      name: { type: "string" },

      // type of definition:
      //  "object", "field", "process", "task", "application", "view", etc...
      type: { type: "string", required: true },

      // the json description of this definition
      json: "json"

      // applications: {
      // 	collection: 'ABApplication',
      // 	via: 'objects',
      // 	through: 'abapplicationabobject'
      // },

      // queries: {
      // 	collection: 'ABQuery',
      // 	via: 'objects'
      // },

      // _Klass: function () {
      // 	return ABObject;
      // },

      // toABClass: function () {

      // 	// return new ABClassObject(this);
      // 	var obj;

      // 	switch(this.type) {
      // 		case "object":
      // 		default:
      // 			obj = new ABClassObject(this);
      // 			break;
      // 	}

      // 	return obj;
      // },
   },

   beforeValidate: function(values, cb) {
      cb();
   },

   beforeCreate: function(values, cb) {
      if (!values.id) {
         values.id = uuid();
      }

      // make sure embedded .json.id matches our .id
      if (values.json && !values.json.id) {
         values.json.id = values.id;
      }

      ABModelLifecycle.process(`${values.type}.beforeCreate`, values, cb);
   },

   beforeUpdate: function(values, cb) {
      ABModelLifecycle.process(`${values.type}.beforeUpdate`, values, cb);
   },

   afterCreate: function(newRecord, cb) {
      // Cache in .constructor of ABClassObject
      // newRecord.toABClass();

      // make sure our stored Definitions have .json as an {obj}
      if (typeof newRecord.json == "string") {
         try {
            newRecord.json = JSON.parse(newRecord.json);
         } catch (e) {}
      }
      __AllDefinitions[newRecord.id] = newRecord;

      ABModelLifecycle.process(`${newRecord.type}.afterCreate`, newRecord, cb);
   },

   afterUpdate: function(updatedRecord, cb) {
      // Cache in .constructor of ABClassObject
      // updatedRecord.toABClass();

      // make sure our stored Definitions have .json as an {obj}
      if (typeof updatedRecord.json == "string") {
         try {
            updatedRecord.json = JSON.parse(updatedRecord.json);
         } catch (e) {}
      }
      __AllDefinitions[updatedRecord.id] = updatedRecord;

      ABModelLifecycle.process(
         `${updatedRecord.type}.afterUpdate`,
         updatedRecord,
         cb
      );
   },

   beforeDestroy: function(criteria, cb) {
      var record = __AllDefinitions[criteria.where.id];
      if (record) {
         ABModelLifecycle.process(`${record.type}.beforeDestroy`, record, cb);
      } else {
         cb();
      }
   },

   afterDestroy: function(record, cb) {
      // remove my local definition copy:
      delete __AllDefinitions[record.id];

      ABModelLifecycle.process(`${record.type}.afterDestroy`, record, cb);
   },

   refresh: function() {
      return ABDefinitionModel.find({}).then((list) => {
         (list || []).forEach((def) => {
            __AllDefinitions[def.id] = def;
         });
         return list;
      });
   },

   objForID: function(id) {
      return __AllDefinitions[id] || null;
   },

   definitionForID: function(id) {
      var def = ABDefinitionModel.objForID(id);
      if (def) {
         return def.json;
      } else {
         return null;
      }
   },

   definitions: function(fn = () => true) {
      return Object.keys(__AllDefinitions)
         .map((k) => {
            return __AllDefinitions[k];
         })
         .filter(fn)
         .map((d) => {
            return d.json;
         });
   }
};
