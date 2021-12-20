require("../../data/ABApplication");
let ABApplicationCore = require("../core/ABApplicationCore");
let ABDataCollection = require("./ABDataCollection");
let ABObject = require("./ABObject");
let ABObjectQuery = require("./ABObjectQuery");
let ABMobileApp = require("./ABMobileApp");
let ABViewManager = require("./ABViewManager");
let ABViewPage = require("./views/ABViewPage");

const ABDefinition = require("./ABDefinition");
const ABRole = require("./ABRole");

const ABProcessTaskManager = require("../core/process/ABProcessTaskManager");
const ABProcessParticipant = require("./process/ABProcessParticipant");
const ABProcessLane = require("./process/ABProcessLane");

const ABProcess = require("./ABProcess");

var _AllApplications = [];
var __AllObjects = {
   /* ABObject.id : ABObject */
};
// {obj} : a hash of all ABObjects in our system.

var __AllQueries = {
   /* ABQuery.id : ABObjectQuery */
};
// {obj} : a hash of all ABObjectQueriess in our system.

var __AllDatacollections = {
   /* ABDatacollection.id : ABDataCollection */
};
// {obj} : a hash of all ABDataCollection in our system.

var _AllUserRoles = [];
// an array of {id:, lable:} of the ABRoles the current User has assigned

var dfdReady = null;
var appInfoReady = false;

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

function toArray(DC) {
   var ary = [];

   var id = DC.getFirstId();
   while (id) {
      var element = DC.getItem(id);
      ary.push(element);
      id = DC.getNextId(id);
   }

   return ary;
}

// export to ABLiveTool
// window.ABApplication = ABApplication;
module.exports = window.ABApplication = class ABApplication extends ABApplicationCore {
   constructor(attributes) {
      super(attributes);

      // Make sure to listen for "updated" events on our pages so we can tell
      // the UI to refresh:
      this._pages.forEach((p) => {
         p.on("updated", (pu) => {
            if (pu) {
            }
         });
      });

      // instance keeps a link to our Model for .permissions and views;
      this.Model = OP.Model.get("opstools.BuildApp.ABApplication");

      // [fix] prevent crash if no model was returned
      // NOTE: this is actually a pretty big error!  What should we do here?
      if (this.Model) this.Model.Models(ABApplication);
   }

   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   static allCurrentApplications() {
      return new Promise((resolve, reject) => {
         resolve(_AllApplications);
      });
   }

   /**
    * @function applicationInfo
    * Get id and label of all applications
    *
    * @return {Promise}
    */
   static applicationInfo() {
      if (appInfoReady) return Promise.resolve();

      appInfoReady = true;

      return new Promise((resolve, reject) => {
         // NOTE: make sure all ABDefinitions are loaded before
         // pulling our Applications ...
         ABDefinition.loadAll()
            .then((allDefinitions) => {
               let apps = [];
               // debugger;
               let appDefs = allDefinitions.filter((def) => {
                  return def.type == "application";
               });

               appDefs.forEach((app) => {
                  apps.push(new ABApplication(app.json));
               });

               _AllApplications = new webix.DataCollection({
                  data: apps || []
               });

               resolve(_AllApplications);

               if (dfdReady) {
                  dfdReady.__resolve();
               }
            })
            .catch((err) => {
               reject(err);
               if (dfdReady) {
                  dfdReady.__reject(err);
               }
            });
      });
   }

   /**
    * @function initRoles
    * Get roles of current user so we can use them in access level management
    *
    * @return {Promise}
    */
   static initRoles() {
      return ABRole.rolesOfUser(window.OP.User.username())
         .then((list) => {
            _AllUserRoles = [];
            list.forEach(function(l) {
               _AllUserRoles.push({
                  id: l.id,
                  label: l.label
               });
            });
         })
         .catch((err) => {
            AD.error.log("ABLiveTool: Error loading roles of user", {
               error: err
            });
            // keep the error going!
            throw err;
         });
   }

   static isReady() {
      if (!dfdReady) {
         dfdReady = Promise.resolve().then(() => {
            return new Promise((resolve, reject) => {
               setTimeout(() => {
                  dfdReady.__resolve = resolve;
                  dfdReady.__reject = reject;
               }, 0);
            });
         });
      }
      return dfdReady;
   }

   /**
    * @function get
    * Get an application
    *
    * @param {uuid} appID
    *
    * @return {Promise}
    */
   static get(appID) {
      return new Promise((resolve, reject) => {
         var app = _AllApplications.getItem(appID);
         if (app) {
            resolve(app);
         } else {
            app = ABDefinition.definition(appID);
            if (app) resolve(new ABApplication(app));
            else resolve();
         }
      });
   }

   /**
    * @function create
    *
    * take the initial values and create an instance of ABApplication.
    *
    * @return {Promise}
    */
   static create(values) {
      var newApp = new ABApplication(values);
      return newApp.save();
   }

   //// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

   static isValid(op, values) {
      var validator = OP.Validation.validator();

      // during an ADD operation
      if (op == "add") {
         // label/name must be unique:
         var arrayApplications = toArray(_AllApplications);

         var nameMatch = values.label
            .trim()
            .replace(/ /g, "_")
            .toLowerCase();
         var matchingApps = arrayApplications.filter(function(app) {
            return app.name.trim().toLowerCase() == nameMatch;
         });
         if (matchingApps && matchingApps.length > 0) {
            validator.addError(
               "label",
               L(
                  "ab_form_application_duplicate_name",
                  "*Name (#name#) is already in use"
               ).replace("#name#", nameMatch)
            );
            // var errors = OP.Form.validationError({
            // 	name:'label',
            // 	message:L('ab_form_application_duplicate_name', "*Name (#name#) is already in use").replace('#name#', nameMatch),
            // }, errors);
         }
      }

      // Check the common validations:
      // TODO:
      // if (!inputValidator.validate(values.label)) {
      // 	_logic.buttonSaveEnable();
      // 	return false;
      // }

      return validator;
   }

   /**
    * @method objectFromRef
    *
    * @param {string} resolveUrl - resolve url that include application id
    * @return {Promise}
    */
   static objectFromRef(resolveUrl) {
      debugger;
      // #/3/_objects/6eb3121b-1208-4c49-ae45-fcf722bd6db1
      var parts = resolveUrl.split("/");

      // get id of application
      var appId = parts.splice(1, 1)[0];

      // pull an application
      var app = _AllApplications.find(function(a) {
         return a.id == appId;
      })[0];

      // the url of object that exclude application id
      var objectUrl = parts.join("/");

      return app.urlResolve(objectUrl);
   }

   ///
   /// Instance Methods
   ///

   languageDefault() {
      return AD.lang.currentLanguage || super.languageDefault() || "en";
   }

   uuid() {
      return OP.Util.uuid();
   }

   cloneDeep(value) {
      return _.cloneDeep(value);
   }

   userRoles(roles) {
      if (roles) {
         _AllUserRoles = roles;
         return;
      }
      return _AllUserRoles;
   }

   /// ABApplication data methods

   /**
    * @method destroy()
    *
    * destroy the current instance of ABApplication
    *
    * also remove it from our _AllApplications
    *
    * @return {Promise}
    */
   destroy() {
      return Promise.resolve()
         .then(() => {
            // When deleting an ABApplication
            // be sure to remove any of it's ABViewPages as well
            // This cleans out any dangling ABDefinitions and cleans up the
            // OpsPortal Permissions:

            var allPageDeletes = [];
            var allPages = this.pages();
            this._pages = [];
            // doing ._pages = [] prevents any ABApplication updates when
            // a page is .destroy()ed

            allPages.forEach((p) => {
               allPageDeletes.push(p.destroy());
            });
            return Promise.all(allPageDeletes);
         })
         .then(() => {
            return super.destroy();
         })
         .then(() => {
            _AllApplications.remove(this.id);
         });
   }

   /**
    * @method save()
    *
    * persist the current instance of ABApplication to the DB
    *
    * Also, keep the values in _AllApplications up to date.
    *
    * @return {Promise}
    */
   save() {
      return super.save().then(() => {
         var currEntry = _AllApplications.getItem(this.id);
         if (currEntry) {
            _AllApplications.updateItem(this.id, this);
         } else {
            _AllApplications.add(this, 0);
         }
         return this;
      });
   }

   /// ABApplication Permission methods

   /**
    * @method assignPermissions()
    *
    * Make sure the current ABApplication permissions match the given
    * array of permissions.
    *
    * @param {array} permItems	an array of role assignments that this
    * 							ABApplication should match.
    * @return {Promise}
    */
   assignPermissions(permItems) {
      return this.Model.staticData.assignPermissions(this.id, permItems);
   }

   /**
    * @method getPermissions()
    *
    * Return an array of role assignments that are currently assigned to this
    * ABApplication.
    *
    * @return {Promise} 	resolve(list) : list {array} Role assignments
    */
   getPermissions() {
      return this.Model.staticData.getPermissions(this.id);
   }

   /**
    * @method createPermission()
    *
    * Create a Role in the system after the name of the current ABApplication.
    *
    * @return {Promise}
    */
   createPermission() {
      // TODO: need to take created role and store as : .json.applicationRole = role.id

      return this.Model.staticData.createPermission(this.id);
   }

   /**
    * @method deletePermission()
    *
    * Remove the Role in the system of the current ABApplication.
    * (the one created by  .createPermission() )
    *
    * @return {Promise}
    */
   deletePermission() {
      // TODO: need to remove created role from : .json.applicationRole

      return this.Model.staticData.deletePermission(this.id);
   }

   ///
   /// Definition
   ///

   definitionForID(id) {
      return ABDefinition.definition(id);
   }

   ///
   /// Objects
   ///

   objectsAll() {
      return ABDefinition.allObjects().map((d) => {
         return __AllObjects[d.id] ? __AllObjects[d.id] : this.objectNew(d);
      });
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
      var obj = super.objectNew(values);
      obj.on("destroyed", () => {
         delete __AllObjects[obj.id];
      });
      __AllObjects[obj.id] = obj;
      return obj;
   }

   /**
    * @method objectRemove()
    *
    * remove the current ABObject from our list of .objectIDs.
    * NOTE: this method persists the changes to the server.
    * @param {ABObject} object
    * @return {Promise}
    */
   objectRemove(object) {
      var begLen = this.objectIDs.length;
      this.objectIDs = this.objectIDs.filter((id) => {
         return id != object.id;
      });
      // if there was a change then save this.
      if (begLen != this.objectIDs.length) {
         return this.save();
      }
      return Promise.resolve();
   }

   /**
    * @method objectInsert()
    *
    * persist the current ABObject in our list of .objectIDs.
    *
    * @param {ABObject} object
    * @return {Promise}
    */
   objectInsert(object) {
      var isIncluded = this.objectIDs.indexOf(object.id) != -1;
      if (!isIncluded) {
         this.objectIDs.push(object.id);
         // Save our own Info:
         return this.save();
      }
      return Promise.resolve();
   }

   ///
   /// Object Tracks
   ///
   objectTrack(objectId, rowId) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .objectTrack(objectId, rowId)
            .catch(reject)
            .then((data) => {
               resolve(data);
            });
      });
   }

   ///
   /// Fields
   ///

   ///
   /// Pages
   ///

   /**
    * @method pageNew()
    *
    * return an instance of a new (unsaved) ABViewPage that is tied to this
    * ABApplication.
    *
    * NOTE: this new page is not included in our this.pages until a .save()
    * is performed on the page.
    *
    * @return {ABViewPage}
    */
   pageNew(values) {
      // make sure this is an ABViewPage description
      values.key = ABViewPage.common().key;

      return new ABViewManager.newView(values, this, null);
   }

   /**
    * @method pageInsert()
    *
    * persist the current ABViewPage in our list of .pages.
    *
    * @param {ABViewPage} page
    * @return {Promise}
    */
   pageInsert(page) {
      var isIncluded = this._pages.filter((p) => p.id == page.id)[0];
      if (!isIncluded) {
         this._pages.push(page);
         // Save our own Info:
         return this.save();
      }
      return Promise.resolve();
   }

   /**
    * @method pageRemove()
    *
    * remove the current ABViewPage from our list of pages.
    *
    * @param {ABViewPage} page
    * @return {Promise}
    */
   pageRemove(page) {
      var begLen = this._pages.length;
      this._pages = this._pages.filter((p) => {
         return p.id != page.id;
      });
      // if there was a change then save this.
      if (begLen != this._pages.length) {
         return this.save();
      }
      return Promise.resolve();
   }

   /**
    * @method viewNew()
    *
    * return an ABView based upon the given values.
    *
    *
    * @param {obj} values  an object (containing setup info) for the view you
    *						are requesting.
    *						values.key {string}  the unique key for which view
    * @param {ABApplication} application  the current ABApplication instance for
    *						this application.
    * @param {ABView} parent  the ABView that is the parent of this view you are
    * 						requesting.
    * @return {ABView}
    */
   viewNew(values, application, parent) {
      return ABViewManager.newView(values, application, parent);
   }

   /**
    * @method viewAll()
    *
    * return a list of all the views available.
    *
    * @return {array} of ABView objects
    */
   viewAll() {
      return ABViewManager.allViews();
   }

   /**
    * @method urlPage()
    * return the url pointer for pages in this application.
    * @return {string}
    */
   urlPage() {
      return this.urlPointer() + "_pages/";
   }

   ///
   /// Queries
   ///

   queriesAll() {
      return ABDefinition.allQueries().map((d) => {
         return __AllQueries[d.id] ? __AllQueries[d.id] : this.queryNew(d);
      });
   }

   /**
    * @method queryNew()
    *
    * return an instance of a new (unsaved) ABObjectQuery that is tied to this
    * ABApplication.
    *
    * NOTE: this new object is not included in our this.objects until a .save()
    * is performed on the object.
    *
    * @return {ABObjectQuery}
    */
   queryNew(values) {
      var query = new ABObjectQuery(values, this);
      query.on("destroyed", () => {
         delete __AllQueries[query.id];
      });
      __AllQueries[query.id] = query;
      return query;
   }

   /**
    * @method queryRemove()
    *
    * remove the current ABObjectQuery from our list of .queryIDs.
    *
    * @param {ABObject} query
    * @return {Promise}
    */
   queryRemove(query) {
      var begLen = this.queryIDs.length;
      this.queryIDs = this.queryIDs.filter((id) => {
         return id != query.id;
      });
      // if there was a change then save this.
      if (begLen != this.queryIDs.length) {
         return this.save();
      }
      return Promise.resolve();
   }

   /**
    * @method queryInsert()
    *
    * persist the current ABObjectQuery in our list of ._queries.
    *
    * @param {ABObjectQuery} query
    * @return {Promise}
    */
   queryInsert(query) {
      var isIncluded = this.queryIDs.indexOf(query.id) != -1;
      if (!isIncluded) {
         this.queryIDs.push(query.id);
         // Save our own Info:
         return this.save();
      }
      return Promise.resolve();
   }

   datacollectionsAll() {
      return ABDefinition.allDatacollections().map((d) => {
         return __AllDatacollections[d.id]
            ? __AllDatacollections[d.id]
            : this.datacollectionNew(d);
      });
   }

   datacollectionNew(values) {
      var dc = new ABDataCollection(values, this);
      dc.on("destroyed", () => {
         delete __AllDatacollections[dc.id];
      });
      __AllDatacollections[dc.id] = dc;
      return dc;
   }

   /**
    * @method datacollectionInsert()
    * persist the current ABDatacollection in our list of .datacollectionIDs.
    * @param {ABDatacollection} datacollection
    * @return {Promise}
    */
   datacollectionInsert(datacollection) {
      var isIncluded = this.datacollectionIDs.indexOf(datacollection.id) != -1;
      if (!isIncluded) {
         this.datacollectionIDs.push(datacollection.id);
         // Save our own Info:
         return this.save();
      }
      return Promise.resolve();
   }

   /**
    * @method datacollectionRemove()
    *
    * remove the current ABDataCollection from our list of .datacollectionIDs.
    *
    * @param {ABObject} datacollection
    * @return {Promise}
    */
   datacollectionRemove(datacollection) {
      var begLen = this.datacollectionIDs.length;
      this.datacollectionIDs = this.datacollectionIDs.filter((id) => {
         return id != datacollection.id;
      });
      // if there was a change then save this.
      if (begLen != this.datacollectionIDs.length) {
         return this.save();
      }
      return Promise.resolve();
   }

   /**
    * @function livepage
    * Get application who includes data view list
    * This function is used in the live display
    *
    * @param {uuid} appID
    * @param {uuid} pageID
    *
    * @return {Promise}
    */
   static livepage(appID, pageID) {
      return new Promise((resolve, reject) => {
         var appDef = ABDefinition.definition(appID);
         if (appDef) {
            resolve(new ABApplication(appDef));
         } else {
            // If the user does not have access to the AppBuilder we do not preload
            // all definitions...so go ahead and get them now if the appDef is null
            // ABDefinition.loadAll().then((defs) => {

            // loadAll was being called twice instead lets wait until ABApplication
            // isReady() and then get the application definition
            ABApplication.isReady().then(function () {
               appDef = ABDefinition.definition(appID);
               if (appDef) {
                  resolve(new ABApplication(appDef));
               } else {
                  reject(new Error(`Unknown Application [${appID}]`));
               }
            });
         }
      });
   }

   ///
   /// Mobile App
   ///

   /**
    * @method mobileAppNew()
    *
    * return an instance of a new (unsaved) ABMobileApp that is tied to this
    * ABApplication.
    *
    * NOTE: this new app is not included in our this.mobileApp until a .save()
    * is performed on the App.
    *
    * @return {ABMobileApp}
    */
   mobileAppNew(values) {
      return new ABMobileApp(values, this);
   }

   /**
    * @method mobileAppDestroy()
    *
    * remove the current ABMobileApp from our list of ._mobileApps.
    *
    * @param {ABMobileApp} app
    * @return {Promise}
    */
   mobileAppDestroy(app) {
      var remaininApps = this.mobileApps(function(a) {
         return a.id != app.id;
      });
      this._mobileApps = remaininApps;

      return this.Model.staticData
         .mobileAppDestroy(this.id, app.id)
         .then(() => {
            // TODO : Should update _AllApplications in
         });
   }

   /**
    * @method mobileAppSave()
    *
    * persist the current ABOMobileApp in our list of ._mobileApps.
    *
    * @param {ABOMobileApp} app
    * @return {Promise}
    */
   mobileAppSave(app) {
      var isIncluded =
         this.mobileApps(function(a) {
            return a.id == app.id;
         }).length > 0;
      if (!isIncluded) {
         this._mobileApps.push(app);
      }

      return this.Model.staticData
         .mobileAppSave(this.id, app.toObj())
         .then(() => {
            // TODO : Should update _AllApplications in
         })
         .catch(() => {
            console.error("!!! error with .ABApplication.mobileAppSave()");
         });
   }

   ///
   /// Processes
   ///

   /**
    * @method processNew(id)
    *
    * return an instance of a new ABProcess that is tied to this
    * ABApplication.
    *
    * NOTE: this new app is not included in our this.mobileApp until a .save()
    * is performed on the App.
    *
    * @return {ABMobileApp}
    */
   processNew(id) {
      var processDef = ABDefinition.definition(id);
      if (processDef) {
         return new ABProcess(processDef, this);
      }
      return null;
   }

   /**
    * @method processCreate()
    *
    * create a new Process tied to this Application.
    * and update our references to point to this process.
    *
    * @return {Promise}  resolved with an {ABProcess}
    */
   processCreate(json) {
      var newProcess = new ABProcess(json, this);
      return newProcess
         .save()
         .then(() => {
            this.processIDs.push(newProcess.id);
            this._processes.push(newProcess);
            return this.save();
         })
         .then(() => {
            return newProcess;
         });
   }

   /**
    * @method processRemove()
    *
    * update our references to no longer point to this process.
    *
    * NOTE: it doesn't delete the process. Just excludes it from our list.
    *
    * @return {Promise}  resolved with an {}
    */
   processRemove(Process) {
      // remove references to the Process:
      this.processIDs = this.processIDs.filter((pid) => {
         return pid != Process.id;
      });
      this._processes = this._processes.filter((p) => {
         return p.id != Process.id;
      });
      return this.save();
   }

   ///
   /// Process Elements:
   /// All process objects are stored as an internal Element:
   ///

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

   /**
    * @method processElementNewForModelDefinition(def)
    *
    * return an instance of a new ABProcess[OBJ] that is tied to the given
    * BPMI:Element definition.
    *
    * @param {BPMI:Element} element the element definition from our BPMI
    *              modler.
    * @return {ABProcess[OBJ]}
    */
   processElementNewForModelDefinition(element, process) {
      var newElement = null;

      switch (element.type) {
         case "bpmn:Participant":
            newElement = new ABProcessParticipant({}, process, this);
            break;

         case "bpmn:Lane":
            newElement = new ABProcessLane({}, process, this);
            break;

         default:
            var defaultDef = ABProcessTaskManager.definitionForElement(element);
            if (defaultDef) {
               newElement = ABProcessTaskManager.newTask(
                  defaultDef,
                  process,
                  this
               );
            }
            break;
      }

      // now make sure this new Obj pulls any relevant info from the
      // diagram element
      if (newElement) {
         newElement.fromElement(element);
      }
      return newElement;
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
