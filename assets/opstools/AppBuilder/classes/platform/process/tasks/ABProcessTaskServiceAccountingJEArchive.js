const AccountingJEArchiveCore = require("../../../core/process/tasks/ABProcessTaskServiceAccountingJEArchiveCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AccountingJEArchive extends AccountingJEArchiveCore {
   ////
   //// Process Instance Methods
   ////
   propertyIDs(id) {
      return {
         name: `${id}_name`,
         processBatchValue: `${id}_processBatchValue`,
         objectBatch: `${id}_objectBatch`,
         objectJE: `${id}_objectJE`,
         objectJEArchive: `${id}_objectJEArchive`,
         fieldsMatch: `${id}_fieldsMatch`
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      let ids = this.propertyIDs(id);

      let processValues = [{ id: 0, value: "Select a Process Value" }];
      let processDataFields = this.process.processDataFields(this);
      (processDataFields || []).forEach((row) => {
         processValues.push({ id: row.key, value: row.label });
      });

      let objectList = this.application.objects().map((o) => {
         return { id: o.id, value: o.label || o.name, object: o };
      });

      objectList.unshift({
         id: 0,
         value: L("ab.process.accounting.selectObject", "*Select an Object")
      });

      let refreshFieldsMatch = () => {
         let $fieldsMatch = $$(ids.fieldsMatch);
         if (!$fieldsMatch) return;

         // clear form
         webix.ui([], $fieldsMatch);

         let JEObj = this.application.objects((o) => o.id == this.objectJE)[0];
         if (!JEObj) return;

         let JEArchiveObj = this.application.objects(
            (o) => o.id == this.objectJEArchive
         )[0];
         if (!JEArchiveObj) return;

         // create JE acrhive field options to the form
         JEArchiveObj.fields().forEach((f) => {
            let jeFields = [];

            if (f.key == "connectObject") {
               jeFields = JEObj.fields((fJe) => {
                  return (
                     fJe.key == "connectObject" &&
                     fJe.settings &&
                     f.settings &&
                     fJe.settings.linkObject == f.settings.linkObject &&
                     fJe.settings.linkType == f.settings.linkType &&
                     fJe.settings.linkViaType == f.settings.linkViaType &&
                     fJe.settings.isSource == f.settings.isSource &&
                     fJe.settings.isCustomFK == f.settings.isCustomFK
                  );
               });
            } else {
               jeFields = JEObj.fields((fJe) => fJe.key == f.key);
            }

            jeFields = jeFields.map((fJe) => {
               return {
                  id: fJe.id,
                  value: fJe.label
               };
            });

            $fieldsMatch.addView({
               view: "select",
               name: f.id,
               label: f.label,
               options: jeFields
            });
         });

         $fieldsMatch.setValues(this.fieldsMatch || {});
      };

      let ui = {
         id: id,
         view: "form",
         elementsConfig: {
            labelWidth: 180
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
               id: ids.processBatchValue,
               view: "select",
               label: L(
                  "ab.process.accounting.processBatchValue",
                  "*Process Batch Value"
               ),
               value: this.processBatchValue,
               name: "processBatchValue",
               options: processValues
            },
            {
               id: ids.objectBatch,
               view: "select",
               label: L("ab.process.accounting.objectBatch", "*Batch Object"),
               value: this.objectBatch,
               name: "objectBatch",
               options: objectList
            },
            {
               id: ids.objectJE,
               view: "select",
               label: L("ab.process.accounting.objectJE", "*JE Object"),
               value: this.objectJE,
               name: "objectJE",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectJE = newVal;
                     refreshFieldsMatch();
                  }
               }
            },
            {
               id: ids.objectJEArchive,
               view: "select",
               label: L(
                  "ab.process.accounting.objectJEArchive",
                  "*JE Archive Object"
               ),
               value: this.objectJEArchive,
               name: "objectJEArchive",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectJEArchive = newVal;
                     refreshFieldsMatch();
                  }
               }
            },
            {
               view: "fieldset",
               label: "Fields Matching",
               body: {
                  id: ids.fieldsMatch,
                  view: "form",
                  borderless: true,
                  elements: []
               }
            }
         ]
      };

      webix.ui(ui, $$(id));

      $$(id).show();

      refreshFieldsMatch();
   }

   /**
    * propertiesStash()
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
         if (s === "fieldsMatch") {
            this[s] = $$(ids.fieldsMatch).getValues();
         } else {
            this[s] = this.property(ids[s]);
         }
      });
   }
};
