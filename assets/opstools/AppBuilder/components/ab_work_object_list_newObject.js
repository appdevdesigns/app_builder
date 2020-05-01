/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Object.  This Popup will manage several
 * different sub components for gathering Object data for saving.
 *
 * The sub components will gather the data for the object and do basic form
 * validations on their interface.
 *
 * when ready, the sub component will call onSave(values, cb)  to allow this
 * component to manage the actual final object validation, and saving to this
 * application.  On success, cb(null) will be called.  on error cb(err) will
 * be called.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABBlankObject = require("./ab_work_object_list_newObject_blank");
const ABCsvObject = require("./ab_work_object_list_newObject_csv");
const ABImportObject = require("./ab_work_object_list_newObject_import");
const ABImportExternal = require("./ab_work_object_list_newObject_external");

module.exports = class AB_Work_Object_List_NewObject extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App) {
      super(App, "ab_work_object_list_newObject");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            addNew: L("ab.object.addNew", "*Add new object")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),
         tab: this.unique("tab")
      };

      var selectNew = true;
      var callback = null;

      var BlankTab = new ABBlankObject(App);
      var CsvTab = new ABCsvObject(App);
      var ImportTab = new ABImportObject(App);
      var ExternalTab = new ABImportExternal(App);

      // Our webix UI definition:
      this.ui = {
         view: "window",
         id: ids.component,
         // width: 400,
         position: "center",
         modal: true,
         head: labels.component.addNew,
         selectNewObject: true,
         body: {
            view: "tabview",
            id: ids.tab,
            cells: [BlankTab.ui, CsvTab.ui, ImportTab.ui, ExternalTab.ui],
            tabbar: {
               on: {
                  onAfterTabClick: (id) => {
                     _logic.switchTab(id);
                  }
               }
            }
         },
         on: {
            onBeforeShow: () => {
               var id = $$(ids.tab).getValue();
               _logic.switchTab(id);
            }
         }
      };

      // Our init() function for setting up our UI
      this.init = (options) => {
         webix.ui(this.ui);
         webix.extend($$(ids.component), webix.ProgressBar);

         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         var ourCBs = {
            onCancel: _logic.hide,
            onSave: _logic.save,
            onDone: _logic.done,
            onBusyStart: _logic.showBusy,
            onBusyEnd: _logic.hideBusy
         };

         BlankTab.init(ourCBs);
         CsvTab.init(ourCBs);
         ImportTab.init(ourCBs);
         ExternalTab.init(ourCBs);
      };

      // our internal business logic
      var _logic = (this._logic = {
         /**
          * @function applicationLoad()
          *
          * prepare ourself with the current application
          */
         applicationLoad: function(application) {
            // _logic.show();
            currentApplication = application; // remember our current Application.
         },

         callbacks: {
            onDone: function() {}
         },

         /**
          * @function hide()
          *
          * remove the busy indicator from the form.
          */
         hide: function() {
            if ($$(ids.component)) $$(ids.component).hide();
         },

         /**
          * Show the busy indicator
          */
         showBusy: () => {
            if ($$(ids.component)) {
               $$(ids.component).showProgress();
            }
         },

         /**
          * Hide the busy indicator
          */
         hideBusy: () => {
            if ($$(ids.component)) {
               $$(ids.component).hideProgress();
            }
         },

         /**
          * Finished saving, so hide the popup and clean up.
          * @param {object} obj
          */
         done: (obj) => {
            _logic.hideBusy();
            _logic.hide(); // hide our popup
            _logic.callbacks.onDone(null, obj, selectNew, callback); // tell parent component we're done
         },

         /**
          * @function save
          *
          * take the data gathered by our child creation tabs, and
          * add it to our current application.
          *
          * @param {obj} values  key=>value hash of model values.
          * @param {fn}  cb 		node style callback to indicate success/failure
          * 						return Promise
          */
         save: function(values, cb) {
            // must have an application set.
            if (!currentApplication) {
               OP.Dialog.Alert({
                  title: "Shoot!",
                  test: "No Application Set!  Why?"
               });
               cb(true); // there was an error.
               return false;
            }

            // create a new (unsaved) instance of our object:
            var newObject = currentApplication.objectNew(values);

            // have newObject validate it's values.
            var validator = newObject.isValid();
            if (validator.fail()) {
               cb(validator); // tell current Tab component the errors
               return false; // stop here.
            }

            // show progress
            _logic.showBusy();

            // if we get here, save the new Object
            newObject
               .save()
               .then(function(obj) {
                  // successfully done:
                  cb(null, obj) // tell current tab component save successful
                     .then(() => _logic.done(obj))
                     .catch((err) => {
                        console.error(err);
                     });
               })
               .catch(function(err) {
                  // hide progress
                  _logic.hideBusy();

                  // an error happend during the server side creation.
                  // so remove this object from the current object list of
                  // the currentApplication.
                  currentApplication.objectRemove(newObject).then(() => {
                     // tell current Tab component there was an error
                     cb(err).catch((err) => {});
                  });
               });
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function(shouldSelectNew, callbackFunction) {
            if (shouldSelectNew != null) {
               selectNew = shouldSelectNew;
               callback = callbackFunction;
            }
            if ($$(ids.component)) $$(ids.component).show();
         },

         switchTab: function(tabId) {
            if (tabId == BlankTab.ui.body.id) {
               if (BlankTab.onShow) BlankTab.onShow(currentApplication);
            } else if (tabId == CsvTab.ui.body.id) {
               if (CsvTab.onShow) CsvTab.onShow(currentApplication);
            } else if (tabId == ImportTab.ui.body.id) {
               if (ImportTab.onShow) ImportTab.onShow(currentApplication);
            } else if (tabId == ExternalTab.ui.body.id) {
               if (ExternalTab.onShow) ExternalTab.onShow(currentApplication);
            }
         }
      });

      var currentApplication = null;

      // Expose any globally accessible Actions:
      this.actions({});

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.show = _logic.show;
   }
};
