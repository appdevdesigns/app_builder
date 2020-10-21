const InsertRecordTaskCore = require("../../../core/process/tasks/ABProcessTaskServiceInsertRecordCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class InsertRecordTask extends InsertRecordTaskCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         objectID: `${id}_objectID`,
         fieldValues: `${id}_fieldValues`
      };
   }

   /**
    * @method propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      let ids = this.propertyIDs(id);
      let objectList = this.application.objects().map((o) => {
         return { id: o.id, value: o.label || o.name };
      });

      let getFieldOptions = (object) => {
         let result = [];
         result.push({
            id: "PK",
            value: "[Primary Key]"
         });

         object.fields().forEach((f) => {
            // Populate fields of linked data source
            if (f.key == "connectObject") {
               let linkDS = f.datasourceLink;
               if (linkDS) {
                  result.push({
                     id: `${f.id}|PK`,
                     value: `${f.label} -> [Primary Key]`
                  });

                  linkDS.fields().forEach((linkF) => {
                     result.push({
                        id: `${f.id}|${linkF.id}`,
                        value: `${f.label} -> ${linkF.label}`
                     });
                  });
               }
            } else {
               result.push({
                  id: f.id,
                  value: f.label
               });
            }
         });

         return result;
      };

      let refreshFieldValues = (objectID) => {
         let $fieldValues = $$(ids.fieldValues);
         if (!$fieldValues) return;

         // clear form
         webix.ui([], $fieldValues);

         let object = this.application.objects(
            (o) => o.id == (objectID || this.objectID)
         )[0];
         if (!object) return;

         // Pull object & fields of start step
         let startElemObj;
         let startElemObjFields = [];
         let startElem = this.startElement;
         if (startElem) {
            startElemObj = this.application.objects(
               (o) => o.id == startElem.objectID
            )[0];

            if (startElemObj) {
               startElemObjFields = getFieldOptions(startElemObj);
            }
         }

         // Pull object & fields of previous step
         let prevElemObj;
         let prevElemObjFields = [];
         let prevElem = this.process.connectionPreviousTask(this)[0];
         if (prevElem) {
            prevElemObj = this.application.objects(
               (o) => o.id == prevElem.objectID
            )[0];

            if (prevElemObj) {
               prevElemObjFields = getFieldOptions(prevElemObj);
            }
         }

         // field options to the form
         object.fields().forEach((f) => {
            $fieldValues.addView({
               fieldId: f.id,
               view: "layout",
               cols: [
                  {
                     rows: [
                        {
                           view: "label",
                           label: f.label,
                           width: 100
                        },
                        { fillspace: true }
                     ]
                  },
                  {
                     rows: [
                        {
                           name: "setSelector",
                           view: "select",
                           options: [
                              { id: 0, value: "Not Set" },
                              { id: 1, value: "Set by custom value" },
                              {
                                 id: 2,
                                 value: `Set by the root data [${
                                    startElemObj ? startElemObj.label : ""
                                 }]`
                              },
                              {
                                 id: 3,
                                 value: `Set by previous step data [${
                                    prevElemObj ? prevElemObj.label : ""
                                 }]`
                              },
                              { id: 4, value: "Set by formula format" }
                           ],
                           on: {
                              onChange: function(newVal, oldVal) {
                                 let $parent = this.getParentView();
                                 let $valuePanel = $parent.queryView({
                                    name: "valuePanel"
                                 });
                                 $valuePanel.showBatch(newVal);
                              }
                           }
                        },
                        {
                           name: "valuePanel",
                           view: "multiview",
                           visibleBatch: 0,
                           cols: [
                              { batch: 0, fillspace: true },
                              { batch: 1, view: "text" },
                              {
                                 batch: 2,
                                 view: "select",
                                 options: startElemObjFields
                              },
                              {
                                 batch: 3,
                                 view: "select",
                                 options: prevElemObjFields
                              },
                              { batch: 4, view: "text" }
                           ]
                        }
                     ]
                  }
               ]
            });
         });

         this.setFieldValues(id);
      };

      let ui = {
         id: id,
         view: "form",
         elementsConfig: {
            labelWidth: 120
         },
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.element.name", "*Name"),
               name: "name",
               value: this.name
            },
            {
               id: ids.objectID,
               view: "select",
               label: L("ab.process.insertRecord.object", "*Object"),
               value: this.objectID,
               name: "objectID",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectID = newVal;
                     refreshFieldValues(newVal);
                  }
               }
            },
            {
               view: "fieldset",
               label: "Values",
               body: {
                  id: ids.fieldValues,
                  view: "form",
                  borderless: true,
                  elements: []
               }
            }
         ]
      };

      webix.ui(ui, $$(id));

      $$(id).show();

      refreshFieldValues();
   }

   /**
    * @method propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      let ids = this.propertyIDs(id);
      this.name = this.property(ids.name);

      // TIP: keep the .settings entries == ids[s] keys and this will
      // remain simple:
      this.defaults.settings.forEach((s) => {
         if (s === "fieldValues") {
            this[s] = this.getFieldValues(id);
         } else {
            this[s] = this.property(ids[s]);
         }
      });
   }

   setFieldValues(id) {
      let ids = this.propertyIDs(id);
      let $fieldValues = $$(ids.fieldValues);
      let $fValueItems = $fieldValues.getChildViews() || [];

      $fValueItems.forEach(($item) => {
         let fieldId = $item.config.fieldId;
         let fValue = this.fieldValues[fieldId] || {};

         let $setSelector = $item.queryView({ name: "setSelector" });
         $setSelector.setValue(fValue.set);

         let $valuePanel = $item.queryView({ name: "valuePanel" });
         let $valueSelector = $valuePanel.queryView({
            batch: $valuePanel.config.visibleBatch
         });
         if ($valueSelector && $valueSelector.setValue)
            $valueSelector.setValue(fValue.value);
      });
   }

   getFieldValues(id) {
      let result = {};
      let ids = this.propertyIDs(id);
      let $fieldValues = $$(ids.fieldValues);
      let $fValueItems = $fieldValues.getChildViews() || [];

      $fValueItems.forEach(($item) => {
         let fieldId = $item.config.fieldId;
         result[fieldId] = {};

         let $setSelector = $item.queryView({ name: "setSelector" });
         result[fieldId].set = $setSelector.getValue();

         let $valuePanel = $item.queryView({ name: "valuePanel" });
         let $valueSelector = $valuePanel.queryView({
            batch: $valuePanel.config.visibleBatch
         });
         if (
            $valueSelector &&
            $valueSelector.getValue &&
            $valueSelector.getValue()
         )
            result[fieldId].value = $valueSelector.getValue();
         else result[fieldId].value = null;
      });

      return result;
   }
};
