const _ = require("lodash");
const path = require("path");
// debugger;
const uuidv4 = require("uuid");

const ABApplicationCore = require(path.join(
   __dirname,
   "..",
   "core",
   "ABApplicationCore.js"
));

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
    * @return {array}
    *         any relevalt ABDefinition IDs
    */
   exportIDs() {
      var myIDs = [this.id];

      // start with Objects:
      this.objectsIncluded().forEach((o) => {
         myIDs = myIDs.concat(o.exportIDs());
      });

      // Queries
      this.queriesIncluded().forEach((q) => {
         myIDs = myIDs.concat(q.exportIDs());
      });

      // Datacollections
      // NOTE: currently the server doesn't make instances of DataCollections
      // so we manually parse the related info here:
      this.datacollectionIDs.forEach((dID) => {
         var def = this.definitionForID(dID);
         if (def) {
            myIDs.push(dID);
            if (def.settings.datasourceID) {
               var object = this.objects((o) => {
                  return o.id == def.settings.datasourceID;
               })[0];
               if (object) {
                  myIDs = myIDs.concat(object.exportIDs());
               }
            }
         }
      });

      // Processes
      this.processes().forEach((p) => {
         myIDs = myIDs.concat(p.exportIDs());
      });

      // Pages
      // NOTE: currently the server doesn't make instances of ABViews
      // so we manually parse the object data here:
      var parseView = (view) => {
         var ids = [view.id];
         (view.pageIDs || []).forEach((pid) => {
            var pdef = this.definitionForID(pid);
            if (pdef) {
               ids = ids.concat(parseView(pdef));
            }
         });

         (view.viewIDs || []).forEach((vid) => {
            var vdef = this.definitionForID(vid);
            if (vdef) {
               ids = ids.concat(parseView(vdef));
            }
         });

         return ids;
      };

      var pageIDs = this._pages.map((p) => p.id);
      (pageIDs || []).forEach((pid) => {
         var pdef = this.definitionForID(pid);
         if (pdef) {
            myIDs = myIDs.concat(parseView(pdef));
         }
      });

      // return only unique entries:
      return _.uniq(myIDs);
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
};
