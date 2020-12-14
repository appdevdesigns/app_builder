//
// ABViewRuleActionFormRecordRuleUpdateConnected
//
// An action that allows you to update fields on an object that is connected to
// the current object we just Added/Updated
//
//
const ABViewRuleActionObjectUpdater = require("./ABViewRuleActionObjectUpdater");
const ABFieldConnect = require("../../platform/dataFields/ABFieldConnect");
const ObjectQueryBuilder = require("../ABViewQueryBuilderObjectFieldConditions");

module.exports = class ABViewRuleActionFormRecordRuleUpdateConnected extends ABViewRuleActionObjectUpdater {
   constructor(App, idBase, currentForm) {
      super(App, idBase, currentForm);
      var L = function(key, altText) {
         return AD.lang.label.getLabel(key) || altText;
      };

      this.key = "ABViewRuleActionFormRecordRuleUpdateConnected";
      this.label = L(
         "ab.component.ruleaction.updateConnectedRecord",
         "*Update Connected Record"
      );

      this.baseObject = null; // the object the current form is working with.
      // Use this to find our connected fields.

      this.selectedFieldID = null; // the selected field ID in the .baseObject that is
      // used for updating.  This should be one of the connection Fields.

      this.fieldDropList = []; // the list of fields to offer based upon the current .baseObject.

      this.objectQB = null; // the QueryBuilder used for offering conditions based upon our connected Object.
      this.qbCondition = null; // the QB condition entered for selecting which remote object.

      this.labels.component.selectField = L(
         "ab.ruleAction.UpdateConnected.selectField",
         "*Select which connected object to update."
      );
      this.labels.component.remoteCondition = L(
         "ab.ruleAction.UpdateConnected.remoteCondition",
         "*How to choose which object:"
      );
   }

   // field

   /**
    * objectLoad
    * save the current object this Action is associated with.
    * in the case of the UpdateConnected Action, assigning us
    * this object only impacts the queryObject.
    *
    * The Updater form will use another object we select in
    * the form dropdown.
    *
    * @param {object} object
    *
    */
   objectLoad(object) {
      this.queryObjectLoad(object);
      this.baseObject = object;

      // now build our fieldDropList for the select
      var connectionFields = this.connectedFieldList();
      connectionFields.forEach((cf) => {
         this.fieldDropList.push({
            id: cf.id,
            value: cf.label
         });
      });
   }

   /**
    * connectedFieldList
    * return the fields in our .baseObject that are connections to other objects.
    * @return {array} of {ABField}
    */
   connectedFieldList() {
      var connectKey = ABFieldConnect.defaults().key;
      if (this.baseObject && this.baseObject.fields) {
         return this.baseObject.fields((f) => {
            return f.key == connectKey;
         }, true);
      } else {
         return [];
      }
   }

   /**
    * connectedObject
    * return the ABObject associated with the selected connection field.
    * @return {ABObject}
    */
   connectedObject() {
      if (this.selectedFieldID) {
         var selectedField = this.selectedField();
         if (selectedField) {
            return selectedField.datasourceLink;
         }
      }

      return null;
   }

   /**
    * selectedField
    * return the selected {ABField} object.
    * @return {ABField}
    */
   selectedField() {
      return this.connectedFieldList().filter((f) => {
         return f.id == this.selectedFieldID;
      })[0];
   }

   /**
    * valueDisplayComponent
    * Return an ABView to display our values form.
    * @param {string}  idBase  a unique webix id to base our sub components on.
    */
   valueDisplayComponent(idBase) {
      if (this._uiChooser == null) {
         this._uiChooser = this.valueDisplayChooser(idBase);
      }

      return this._uiChooser;
   }

   /**
    * valueDisplayChooser
    * Our Values Display is a Select Box with a choice of connected fields.
    * Once a field is chosen, then we display the Updater form.
    * @param {string}  idBase  a unique webix id to base our sub components on.
    */
   valueDisplayChooser(idBase) {
      var uniqueInstanceID = webix.uid();
      var myUnique = (key) => {
         // return idBase + '_' + key  + '_' + uniqueInstanceID;
         return key + "_" + uniqueInstanceID;
      };

      var ids = {
         component: myUnique("updateConnectedValues"),
         updateForm: myUnique("updateChooser"),
         selectConnectedField: myUnique("updateSelect"),
         updateFieldsForm: myUnique("updateForm")
      };

      var _ui = {
         id: ids.component,
         view: "layout",
         css: "ab-component-form-rule",
         rows: [
            {
               id: ids.selectConnectedField,
               view: "richselect",
               label: this.labels.component.selectField,
               labelWidth: this.App.config.labelWidthXXXLarge,
               value: this.selectedField,
               options: this.fieldDropList,
               on: {
                  onChange: (newVal, oldVal) => {
                     _logic.selectAction(newVal, oldVal);
                  }
               }
            }
         ]
      };

      var init = (valueRules) => {
         valueRules = valueRules || this.valueRules;

         // make sure our currently selected field is selected.
         if (this.selectedFieldID) {
            var select = $$(ids.selectConnectedField);
            if (select) {
               select.setValue(this.selectedFieldID);
            }
         }
      };

      var _logic = (this._logic = {
         addDisplay: (view) => {
            $$(ids.component).addView(view);
         },

         // removePreviousDisplays
         // remove the previous components that reflected the conditions and
         // update values of the previously selected field.
         removePreviousDisplays: () => {
            var allViews = $$(ids.component).getChildViews();
            var cloneAllViews = [];
            allViews.forEach((v) => {
               cloneAllViews.push(v);
            });
            cloneAllViews.forEach((v) => {
               // don't remove the field picker
               if (v.config.id != ids.selectConnectedField) {
                  $$(ids.component).removeView(v);
               }
            });
         },

         selectAction: (newVal, oldVal) => {
            _logic.removePreviousDisplays(); // of the Query Builder and Update form for old selection:

            this.selectedFieldID = newVal;
            var connectedObject = this.connectedObject();

            if (connectedObject) {
               // it is the remote object that we are allowed to Update fields on.
               this.updateObjectLoad(connectedObject);
               ///// NOTE: important to call super.valueDisplayComponent()
               this.updateComponent = super.valueDisplayComponent(
                  ids.updateFieldsForm
               ); // parent obj

               _logic.showQBIfNeeded();

               // create a new blank update form
               _logic.addDisplay(this.updateComponent.ui);
               this.updateComponent.init();
            } else {
               OP.Error.log("!!! No connectedObject found.", {
                  fieldID: this.selectedFieldID
               });
            }
         },

         showQBIfNeeded: () => {
            //// NOTE: we decided to go ahead and display the QB in ALL situations to give
            //// the user the ability to set a condition on the update even if the field
            //// is only a one to one.
            //// If we want to remove the filter in case of a "one" linkType, then put
            //// these conditions back in:

            // var field = this.selectedField();

            // // we don't need the QB if the destination object link type if 'one'.
            // // there will only be one to get back, so no conditions needed.
            // if (field.settings.linkType != 'one') {

            var qbComponent = this.queryBuilderDisplay();

            qbComponent.component(this.App, this.idBase);
            _logic.addDisplay(qbComponent.ui);
            qbComponent.init({});

            // }
         },

         fromSettings: (settings) => {
            // // first time through, be sure to set the connectedObject first
            // this.selectedFieldID = settings.selectedFieldID;
            // var connectedObject = this.connectedObject();

            // this triggers the update of the display, creation of QB,
            $$(ids.selectConnectedField).setValue(settings.selectedFieldID);

            if (this.objectQB) {
               this.objectQB.setValue(this.qbCondition);
            }

            if (this.updateComponent) {
               this.updateComponent.fromSettings(settings);
            }
         },

         toSettings: () => {
            // valueRules = {
            //	fieldOperations:[
            //		{ fieldID:xxx, value:yyyy, type:zzz, op:aaa }
            //	]
            // }
            var settings = { fieldOperations: [] };

            // for each of our formRows, decode the propery {}
            this.formRows.forEach((fr) => {
               var rowSettings = fr.toSettings();
               if (rowSettings) {
                  settings.fieldOperations.push(rowSettings);
               }
            });

            return settings;
         }
      });

      return {
         ui: _ui,
         init: init,
         fromSettings: (settings) => {
            _logic.fromSettings(settings);
         },
         toSettings: () => {
            return _logic.toSettings();
         },
         _logic: _logic
      };
   }

   /**
    * queryBuilderDisplay
    * returns our Query Builder object used in our display.
    * It is called by the .showQBIfNeeded() method.
    * @return {ABViewQueryBuilderObjectFieldConditions}
    */
   queryBuilderDisplay() {
      if (!this.objectQB) {
         this.objectQB = new ObjectQueryBuilder(
            this.labels.component.remoteCondition
         );

         var connObj = this.connectedObject();
         if (connObj) this.objectQB.objectLoad(connObj);
      }
      return this.objectQB;
   }

   /**
    * process
    * gets called when a form is submitted and the data passes the Query Builder Rules.
    * @param {obj} options
    *				options.data : {obj} the key=>value of the data just entered by the form
    *				options.form : {ABViewForm} the Form object that is processing this rule
    * @return {Promise}
    */
   process(options) {
      this._formData = options.data;

      // get connected object
      var connObj = this.connectedObject();
      var model = connObj.model();

      var connectionField = this.selectedField();

      var condition = null; // our lookup condition

      // modifyCondition
      // async fn() to fill out what the condition should be for limiting the remote
      // objects to values in use by the current object.
      // @param {fn} cb  the callback to use when we are finished:
      //					cb(err, )
      var modifyCondition = (cb) => {
         // So, let's get a copy of our current data, with all it's connected items
         // attached.
         var thisModel = this.baseObject.model();
         thisModel
            .findConnected(connectionField.columnName, options.data)
            .then((items) => {
               // if we didn't get any results, then simply return
               // NOTE: this will leave condition == null and cancel this update.
               if (!items || items.length == 0) {
                  cb();
                  return;
               }

               // then use these to limit the connected data of our Action:

               // get all the ids
               var ids = items.map((i) => {
                  return i.id;
               });

               // resulting condition: { id in [listIDs]} AND { QB Condition }
               condition = {
                  glue: "and",
                  rules: [
                     {
                        key: connObj.PK(),
                        rule: "in",
                        value: ids
                     }
                  ]
               };

               // check to make sure qbCondition actually has a condition before adding it
               // to our condition:
               if (Object.keys(this.qbCondition).length > 0) {
                  condition.rules.push(this.qbCondition);
               }

               cb();
            })
            .catch(cb);
      };

      // .process() returns a Promise
      return new Promise((resolve, reject) => {
         // upateIt()
         // updates a given item with our changes.
         // @param {obj} item  the item to update
         // @param {fn}  cb    a callback function when update is complete.
         var updateIt = (item, cb) => {
            let isUpdated = this.processUpdateObject({}, item);
            if (!isUpdated) {
               cb();
            } else {
               model
                  .update(item.id, item)
                  .catch((err) => {
                     OP.Error.log(
                        "!!! ABViewRuleActionFormRecordRuleUpdateConnected.process(): update error:",
                        { error: err, data: options.data }
                     );
                     cb(err);
                  })
                  .then(() => {
                     cb();
                  });
            }
         };

         // now figure out which elements belong to this object
         // done in modifyCondition()
         modifyCondition((err) => {
            if (err) {
               reject(err);
               return;
            }

            if (condition === null) {
               // this is the case where we didn't have the proper data to complete our
               // update.  So let's just fail gracefully, and continue on.

               // QUESTION: is this the right way to handle it?
               resolve();
            } else {
               // get all the entries that match our condition:
               model
                  .findAll({ where: condition })
                  .then((list) => {
                     var done = 0;

                     // list : {data: Array(4), total_count: 4, pos: null, offset: null, limit: null}
                     if (list && list.data) {
                        list = list.data;
                     }

                     // for each entry, update it with our values:
                     list.forEach((item) => {
                        updateIt(item, (err) => {
                           done++;
                           if (done >= list.length) {
                              // now they are all updated, so continue.
                              resolve();
                           }
                        });
                     });

                     // if there were no entries to update -> continue
                     if (list.length == 0) {
                        resolve();
                     }
                  })
                  .catch(reject);
            }
         }); // end modifyCondition()
      }); // end Promise()
   }

   /**
    * fromSettings
    * initialize this Action = require(a given set of setting values.
    * @param {obj} settings  the settings {} returned = require(toSettings()
    */
   fromSettings(settings) {
      settings = settings || {};

      this.selectedFieldID = settings.selectedFieldID || null;
      this.qbCondition = settings.qbCondition || {};

      super.fromSettings(settings);

      // if we have a display component, then populate it:
      if (this._uiChooser) {
         this._logic.fromSettings(settings);
      }
   }

   /**
    * toSettings
    * return an object that represents the current state of this Action
    * @return {obj}
    */
   toSettings() {
      // settings: {
      // 	selectedFieldID: 'guid',
      //  qbCondition: [],
      //	valueRules:{}		// = require(ABViewRuleActionObjectUpdater
      // }

      // let our parent store our QB settings
      var settings = super.toSettings();

      settings.selectedFieldID = this.selectedFieldID;

      var qbCond = null;
      if (this.objectQB) {
         qbCond = this.objectQB.getValue();
         if (Array.isArray(qbCond)) {
            qbCond = qbCond[0];
         }

         // FIX: make sure qbCond root element has a 'glue'
         if (qbCond) {
            qbCond.glue = qbCond.glue || "and";
         }
      }
      settings.qbCondition = qbCond;

      // if we have a display component, then request our details = require(it:
      if (this._uiChooser) {
         settings.valueRules = this._logic.toSettings();
      }

      return settings;
   }

   // NOTE: Querybuilder v5.2 has a bug where it won't display the [and/or]
   // choosers properly if it hasn't been shown before the .setValue() call.
   // so this work around allows us to refresh the display after the .show()
   // on the popup.
   // When they've fixed the bug, we'll remove this workaround:
   qbFixAfterShow() {
      if (this.objectQB) {
         this.objectQB.setValue(this.qbCondition);
      }
   }
};
