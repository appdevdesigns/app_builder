const _ = require("lodash");
const path = require("path");
const moment = require("moment");
// debugger;
const uuidv4 = require("uuid");

const ABApplicationCore = require(path.join(
   __dirname,
   "..",
   "core",
   "ABApplicationCore.js"
));

const ABDataCollection = require(path.join(__dirname, "ABDataCollection"));
const ABDefinition = require(path.join(__dirname, "ABDefinition"));

const ABClassObject = require(path.join(__dirname, "ABObject"));
const ABClassQuery = require(path.join(__dirname, "ABObjectQuery"));
const ABView = require(path.join(__dirname, "views", "ABView"));
const ABObjectExternal = require(path.join(__dirname, "ABObjectExternal"));
const ABObjectImport = require(path.join(__dirname, "ABObjectImport"));
const ABMobileApp = require(path.join(__dirname, "ABMobileApp"));
const ABProcess = require(path.join(__dirname, "ABProcess"));
const ABProcessParticipant = require(path.join(
   __dirname,
   "process",
   "ABProcessParticipant"
));
const ABProcessLane = require(path.join(__dirname, "process", "ABProcessLane"));
const ABProcessTaskManager = require(path.join(
   __dirname,
   "..",
   "core",
   "process",
   "ABProcessTaskManager"
));

var __AllQueries = {
   /* ABQuery.id : ABObjectQuery */
};
// {obj} : a hash of all ABObjectQueriess in our system.

var __AllDatacollections = {
   /* ABDatacollection.id : ABDataCollection */
};
// {obj} : a hash of all ABDataCollection in our system.

module.exports = class ABClassApplication extends ABApplicationCore {
   constructor(attributes) {
      super(attributes);
   }

   static applications(fn = () => true) {
      var allDefs = ABDefinition.definitions((f) => {
         return f.type == "application";
      });
      var allApps = [];
      (allDefs || []).forEach((def) => {
         var app = ABClassApplication.applicationForID(def.id);
         if (app) {
            allApps.push(app);
         }
      });

      return allApps;
   }
   static applicationForID(id) {
      var myDef = ABDefinition.definition(id);
      if (myDef) {
         return new ABClassApplication(myDef);
      }
      return null;
   }

   static definitionForID(id) {
      return ABDefinition.definition(id);
   }

   areaKey() {
      return _.kebabCase(`ab-${this.name}`);
   }

   actionKeyName() {
      return `opstools.${this.validAppName()}.view`;
   }

   validAppName() {
      return AppBuilder.rules.toApplicationNameFormat(this.name);
   }

   cloneDeep(value) {
      return _.cloneDeep(value);
   }

   ////
   //// DB Related
   ////

   dbApplicationName() {
      return AppBuilder.rules.toApplicationNameFormat(this.name);
   }

   ///
   /// Definition
   ///

   datacollectionsAll() {
      // On the server, we shouldn't work directly with "datacollections".
      // let's simply return [] for now:
      return [];
      /*
      return ABDefinition.definitions((d)=>d.type == "datacollection").map((d) => {
         return __AllDatacollections[d.id]
            ? __AllDatacollections[d.id]
            : this.datacollectionNew(d);
      });
      */
   }

   datacollectionNew(values) {
      var dc = new ABDataCollection(values, this);
      dc.on("destroyed", () => {
         delete __AllDatacollections[dc.id];
      });
      __AllDatacollections[dc.id] = dc;
      return dc;
   }

   definitionForID(id) {
      return ABDefinition.definition(id);
   }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *         the array of ids to insert any relevant .ids into
    */
   // exportIDs(ids) {
   //    // make sure we don't get into an infinite loop:
   //    if (ids.indexOf(this.id) > -1) return;

   //    ids.push(this.id);

   //    // start with Objects:
   //    this.objectsIncluded().forEach((o) => {
   //       o.exportIDs(ids);
   //    });

   //    // Queries
   //    this.queriesIncluded().forEach((q) => {
   //       q.exportIDs(ids);
   //    });

   //    // Datacollections
   //    // NOTE: currently the server doesn't make instances of DataCollections
   //    // so we manually parse the related info here:
   //    this.datacollectionIDs.forEach((dID) => {
   //       if (ids.indexOf(dID) > -1) return;

   //       var def = this.definitionForID(dID);
   //       if (def) {
   //          ids.push(dID);
   //          if (def.settings.datasourceID) {
   //             var object = this.objects((o) => {
   //                return o.id == def.settings.datasourceID;
   //             })[0];
   //             if (object) {
   //                object.exportIDs(ids);
   //             }
   //          }
   //       }
   //    });

   //    // Processes
   //    this.processes().forEach((p) => {
   //       p.exportIDs(ids);
   //    });

   //    // Pages
   //    // NOTE: currently the server doesn't make instances of ABViews
   //    // so we manually parse the object data here:
   //    var parseView = (view) => {
   //       if (ids.indexOf(view.id) > -1) return;
   //       ids.push(view.id);
   //       (view.pageIDs || []).forEach((pid) => {
   //          var pdef = this.definitionForID(pid);
   //          if (pdef) {
   //             parseView(pdef);
   //          }
   //       });

   //       (view.viewIDs || []).forEach((vid) => {
   //          var vdef = this.definitionForID(vid);
   //          if (vdef) {
   //             parseView(vdef);
   //          }
   //       });
   //    };

   //    var pageIDs = this._pages.map((p) => p.id);
   //    (pageIDs || []).forEach((pid) => {
   //       var pdef = this.definitionForID(pid);
   //       if (pdef) {
   //          parseView(pdef);
   //       }
   //    });

   //    // return only unique entries:
   //    ids = _.uniq(ids);
   // }

   /**
    * @method exportData()
    * export the relevant data from this object necessary for the operation of
    * it's associated application.
    * @param {hash} data
    *        The incoming data structure to add the relevant export data.
    *        .ids {array} the ABDefinition.id of the definitions to export.
    *        .siteObjectConnections {hash} { Obj.id : [ ABField.id] }
    *                A hash of Field.ids for each System Object that need to
    *                reference these importedFields
    *        .roles {hash}  {Role.id: RoleDef }
    *                A Definition of a role related to this Application
    *        .scope {hash} {Scope.id: ScopeDef }
    *               A Definition of a scope related to this Application.
    *               (usually from one of the Roles being included)
    */
   exportData(data) {
      // make sure we don't get into an infinite loop:
      if (data.ids.indexOf(this.id) > -1) return;

      data.ids.push(this.id);

      // start with Objects:
      this.objectsIncluded().forEach((o) => {
         o.exportData(data);
      });

      // Queries
      this.queriesIncluded().forEach((q) => {
         q.exportData(data);
      });

      // Datacollections
      // NOTE: currently the server doesn't make instances of DataCollections
      // so we manually parse the related info here:
      this.datacollectionIDs.forEach((dID) => {
         if (data.ids.indexOf(dID) > -1) return;

         var def = this.definitionForID(dID);
         if (def) {
            data.ids.push(dID);
            if (def.settings.datasourceID) {
               var object = this.objects((o) => {
                  return o.id == def.settings.datasourceID;
               })[0];
               if (object) {
                  object.exportData(data);
               }
            }
         }
      });

      // Processes
      this.processes().forEach((p) => {
         p.exportData(data);
      });

      // Pages
      // NOTE: currently the server doesn't make instances of ABViews
      // so we manually parse the object data here:
      var parseView = (view) => {
         if (data.ids.indexOf(view.id) > -1) return;
         data.ids.push(view.id);

         // store any Roles from our View AccessLevel
         Object.keys(view.accessLevels || {}).forEach((rid) => {
            data.roles[rid] = rid;
         });

         (view.pageIDs || []).forEach((pid) => {
            var pdef = this.definitionForID(pid);
            if (pdef) {
               parseView(pdef);
            }
         });

         (view.viewIDs || []).forEach((vid) => {
            var vdef = this.definitionForID(vid);
            if (vdef) {
               parseView(vdef);
            }
         });
      };

      var pageIDs = this._pages.map((p) => p.id);
      (pageIDs || []).forEach((pid) => {
         var pdef = this.definitionForID(pid);
         if (pdef) {
            parseView(pdef);
         }
      });

      //
      // Add Roles:
      //
      if (!this.isAccessManaged) {
         (this.roleAccess || []).forEach((rid) => {
            data.roles[rid] = rid;
         });
      } else {
         if (this.accessManagers.useRole) {
            (this.accessManagers.role || []).forEach((rid) => {
               data.roles[rid] = rid;
            });
         }
      }
      if (this.isTranslationManaged && this.translationManagers.useRole) {
         (this.translationManagers.role || []).forEach((rid) => {
            data.roles[rid] = rid;
         });
      }

      // return only unique entries:
      data.ids = _.uniq(data.ids);
   }

   ///
   /// Objects
   ///
   objects(filter = () => true) {
      return (ABObjectCache.list() || []).filter(filter);
   }

   objectsAll() {
      if (typeof ABObjectCache != "undefined") {
         return this.objects();
      }
      return [];
   }

   /**
    * @method objectNew()
    *
    * return an instance of a new (unsaved) ABObject that is tied to this
    * ABApplication.
    *
    * NOTE: this new object is not included in our this.objects until a .save()
    * is performed on the object.
    *
    * @return {ABObject}
    */
   objectNew(values) {
      if (values.isExternal == true) return new ABObjectExternal(values, this);
      else if (values.isImported == true)
         return new ABObjectImport(values, this);
      else return new ABClassObject(values, this);
   }

   /**
    * @method viewNew()
    *
    *
    * @return {ABView}
    */
   pageNew(values) {
      return new ABView(values, this);
   }

   processNew(id) {
      var processDef = ABDefinition.definition(id);
      if (processDef) {
         return new ABProcess(processDef, this);
      }
      return null;
   }

   /**
    * @method processElementNew(id)
    *
    * return an instance of a new ABProcessOBJ that is tied to this
    * ABApplication->ABProcess.
    *
    * @param {string} id the ABDefinition.id of the element we are creating
    * @param {ABProcess} process the process this task is a part of.
    * @return {ABProcessTask}
    */
   processElementNew(id, process) {
      var taskDef = ABDefinition.definition(id);
      // var taskDef = ABDefinition.definition(id);
      if (taskDef) {
         switch (taskDef.type) {
            case ABProcessParticipant.defaults().type:
               return new ABProcessParticipant(taskDef, process, this);
               break;

            case ABProcessLane.defaults().type:
               return new ABProcessLane(taskDef, process, this);
               break;

            default:
               // default to a Task
               return ABProcessTaskManager.newTask(taskDef, process, this);
               break;
         }
      }
      return null;
   }

   queriesAll() {
      return ABDefinition.allQueries().map((d) => {
         return __AllQueries[d.id] ? __AllQueries[d.id] : this.queryNew(d);
      });
   }

   queriesClear() {
      __AllQueries = {};
   }

   /**
    * @method queryNew()
    *
    * return an instance of a new (unsaved) ABClassQuery that is tied to this
    * ABApplication.
    *
    * @return {ABClassQuery}
    */
   queryNew(values) {
      var q = new ABClassQuery(values, this);
      __AllQueries[q.id] = q;
      return q;
   }

   /**
    * @method mobileAppNew()
    *
    * return an instance of a new (unsaved) ABMobileApp that is tied to this
    * ABApplication.
    *
    * @return {ABMobileApp}
    */
   mobileAppNew(values) {
      return new ABMobileApp(values, this);
   }

   uuid() {
      return uuidv4();
   }

   /**
    * @method toDate
    *
    * @param {string} dateText
    * @param {Object} options - {
    *                               format: "string",
    *                               ignoreTime: boolean
    *                            }
    * @return {Date}
    */
   toDate(dateText = "", options = {}) {
      if (!dateText) return;

      if (options.ignoreTime) dateText = dateText.replace(/\T.*/, "");

      let result = options.format
         ? moment(dateText, options.format)
         : moment(dateText);

      let supportFormats = [
         "YYYY-MM-DD",
         "YYYY/MM/DD",
         "DD/MM/YYYY",
         "MM/DD/YYYY",
         "DD-MM-YYYY",
         "MM-DD-YYYY"
      ];

      supportFormats.forEach((format) => {
         if (!result || !result.isValid()) result = moment(dateText, format);
      });

      return new Date(result);
   }

   /**
    * @method toDateFormat
    *
    * @param {Date} date
    * @param {Object} options - {
    *                               format: "string",
    *                               localeCode: "string"
    *                            }
    *
    * @return {string}
    */
   toDateFormat(date, options) {
      if (!date) return "";

      let momentObj = moment(date);

      if (options.localeCode) momentObj.locale(options.localeCode);

      return momentObj.format(options.format);
   }

   /**
    * @method subtractDate
    *
    * @param {Date} date
    * @param {number} number
    * @param {string} unit
    *
    * @return {Date}
    */
   subtractDate(date, number, unit) {
      return moment(date)
         .subtract(number, unit)
         .toDate();
   }

   /**
    * @method addDate
    *
    * @param {Date} date
    * @param {number} number
    * @param {string} unit
    *
    * @return {Date}
    */
   addDate(date, number, unit) {
      return moment(date)
         .add(number, unit)
         .toDate();
   }
};
