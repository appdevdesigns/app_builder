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
         fieldValues: `${id}_fieldValues`,

         repeatLayout: `${id}_repeatLayout`,
         repeatMode: `${id}_repeatMode`,
         repeatColumn: `${id}_repeatColumn`
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

      let repeatColumnList = this.objectOfStartElement
         ? this.objectOfStartElement
              .fields((f) => f.key == "connectObject")
              .map((f) => {
                 return {
                    id: f.id,
                    value: f.label
                 };
              })
         : [];

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
         let startElemObj = this.objectOfStartElement;
         let startElemObjFields = startElemObj
            ? getFieldOptions(startElemObj)
            : [];

         // Pull object & fields of previous step
         let prevElemObj = this.objectOfPrevElement;
         let prevElemObjFields = [];
         if (prevElemObj) {
            prevElemObjFields = getFieldOptions(prevElemObj);
         }

         let setOptions = [
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
         ];

         let repeatObjectFields = [];
         let fieldRepeat = this.fieldRepeat;
         if (fieldRepeat && fieldRepeat.datasourceLink) {
            setOptions.push({
               id: 5,
               value: `Set by the instance [${
                  this.fieldRepeat ? this.fieldRepeat.label : ""
               }]`
            });

            repeatObjectFields = getFieldOptions(fieldRepeat.datasourceLink);
         }

         setOptions.push({
            id: 6,
            value: `Set by the paremeter of a Query task`
         });

         // Pull query tasks option list
         let queryTaskOptions = (
            this.process.processDataFields(this) || []
         ).map((item) => {
            return {
               id: item.key,
               value: item.label
            };
         });

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
                           options: setOptions,
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
                              { batch: 4, view: "text" },
                              {
                                 batch: 5,
                                 view: "select",
                                 options: repeatObjectFields
                              },
                              {
                                 batch: 6,
                                 view: "multicombo",
                                 label: "",
                                 options: queryTaskOptions
                              }
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
               id: ids.repeatLayout,
               hidden: true,
               cols: [
                  {
                     id: ids.repeatMode,
                     view: "select",
                     label: L("ab.process.insertRecord.repeatMode", "*Repeat"),
                     value: this.repeatMode,
                     name: "repeatMode",
                     width: 330,
                     options: [
                        {
                           id: "rootData",
                           value: L(
                              "ab.process.insertRecord.repeatConnectRootData",
                              "*For Connection in root data"
                           )
                        }
                     ],
                     on: {
                        onChange: (newVal) => {
                           this.repeatMode = newVal;
                           refreshFieldValues();
                        }
                     }
                  },
                  {
                     id: ids.repeatColumn,
                     view: "select",
                     label: "",
                     value: this.repeatColumn,
                     name: "repeatColumn",
                     options: repeatColumnList,
                     on: {
                        onChange: (newVal) => {
                           this.repeatColumn = newVal;
                           refreshFieldValues();
                        }
                     }
                  }
               ],
               on: {
                  onViewShow: () => {
                     this.propertiesStash(id);
                     refreshFieldValues();
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

      // Show/Hide repeat option UI
      let $$repeatLayout = $$(ids.repeatLayout);
      if ($$repeatLayout) {
         $$repeatLayout.blockEvent();

         this.isRepeat
            ? $$(ids.repeatLayout).show()
            : $$(ids.repeatLayout).hide();

         $$repeatLayout.unblockEvent();
      }

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
         switch (s) {
            case "fieldValues":
               this[s] = this.getFieldValues(id);
               break;
            case "isRepeat":
               // .isRepeat is set in .onChange
               break;
            case "repeatMode":
            case "repeatColumn":
               if (!this.isRepeat) {
                  this[s] = "";
                  break;
               }
            // no break;
            // eslint-disable-next-line no-fallthrough
            default:
               this[s] = this.property(ids[s]);
               break;
         }
      });
   }

   setFieldValues(id) {
      let ids = this.propertyIDs(id);
      let $fieldValues = $$(ids.fieldValues);
      let $fValueItems = $fieldValues.getChildViews() || [];

      this.fieldValues = this.fieldValues || {};

      $fValueItems.forEach(($item) => {
         let fieldId = $item.config.fieldId;
         let fValue = this.fieldValues[fieldId] || {};

         let $setSelector = $item.queryView({ name: "setSelector" });
         $setSelector.setValue(fValue.set);

         let $valuePanel = $item.queryView({ name: "valuePanel" });
         let $valueSelector = $valuePanel.queryView({
            batch: $valuePanel.config.visibleBatch
         });

         if ($valueSelector && $valueSelector.setValue) {
            $valueSelector.setValue(fValue.value);
         }
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
         ) {
            result[fieldId].value = $valueSelector.getValue();
         } else {
            result[fieldId].value = null;
         }
      });

      return result;
   }

   onChange(defElement, id) {
      super.onChange(defElement);

      let loopCharacteristics =
         defElement.loopCharacteristics ||
         defElement.businessObject.loopCharacteristics ||
         {};

      let ids = this.propertyIDs(id),
         $repeatLayout = $$(ids.repeatLayout);
      if (!$repeatLayout) return;

      if (
         loopCharacteristics.$type == "bpmn:MultiInstanceLoopCharacteristics" &&
         loopCharacteristics.isSequential
      ) {
         this.isRepeat = true;
         $repeatLayout.show();
      } else {
         this.isRepeat = false;
         $repeatLayout.hide();
      }
   }
};
