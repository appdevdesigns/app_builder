/**
 * ABProcessInstance.js
 *
 * @description :: ABProcessInstance manages instances of running ABProcesses
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const uuid = require("uuid/v4");

module.exports = {
    tableName: "appbuilder_processes",

    // connection: 'appdev_default',

    attributes: {
        id: { type: "string", primaryKey: true },

        // the .id of the Process Definition this instance is created
        // from.
        processID: { type: "string" },

        // the xml definition of the process WHEN it was created
        xmlDefinition: { type: "text" },

        // context: the json context values of this process.
        //   this is where a running process stores it's state and
        //   any related data.
        context: "json",

        // status: the current status of the process
        //	created:  DB row initially created, but not yet run
        //  running:  process has started,
        //  waiting:  process is waiting for an event/response
        //  completed: process has successfully completed.
        status: {
            type: "string",
            enum: ["created", "running", "waiting", "completed"],
            defaultsTo: "created"
            // isIn: ["created", "running", "waiting", "completed"]
        },

        // log: the process log: an [ "task.log()", "task.log()" ]
        log: "json"
    },

    beforeValidate: function(values, cb) {
        cb();
    },

    beforeCreate: function(values, cb) {
        if (!values.id) {
            values.id = uuid();
        }

        cb();
    },

    beforeUpdate: function(values, cb) {
        cb();
    },

    afterCreate: function(newRecord, cb) {
        // Cache in .constructor of ABClassObject
        // newRecord.toABClass();

        cb();
    },

    afterUpdate: function(updatedRecord, cb) {
        // Cache in .constructor of ABClassObject
        // updatedRecord.toABClass();

        cb();
    },

    beforeDestroy: function(criteria, cb) {
        cb();
    },

    afterDestroy: function(record, cb) {
        // remove cache
        // ABObjectCache.remove(record.id);

        cb();
    }
};
