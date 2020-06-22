const AccountingFPCloseCore = require("../../../core/process/tasks/ABProcessTaskServiceAccountingFPCloseCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AccountingFPClose extends AccountingFPCloseCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         processFPValue: `${id}_processFPValue`,
         objectFP: `${id}_objectFP`,
         objectGL: `${id}_objectGL`,
         fieldFPStart: `${id}fieldFPStart`,
         fieldFPOpen: `${id}fieldFPOpen`,
         fieldGLStarting: `${id}_fieldGLStarting`,
         fieldGLRunning: `${id}_fieldGLRunning`,
         fieldGLAccount: `${id}_fieldGLAccount`,
         fieldGLRc: `${id}_fieldGLRc`
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      var ids = this.propertyIDs(id);

      var processValues = [{ id: 0, value: "Select a Process Value" }];
      var processDataFields = this.process.processDataFields(this);
      (processDataFields || []).forEach((row) => {
         processValues.push({ id: row.key, value: row.label });
      });

      var objectList = this.application.objects().map((o) => {
         return { id: o.id, value: o.label || o.name, object: o };
      });
      objectList.unshift({
         id: 0,
         value: L("ab.process.accounting.selectObject", "*Select an Object")
      });

      let getFieldOptions = (objID) => {
         let fields = [
            {
               id: 0,
               value: L("ab.process.accounting.selectField", "*Select a Field")
            }
         ];

         if (objID) {
            var entry = objectList.find((o) => o.id == objID);
            if (entry && entry.object) {
               entry.object.fields().forEach((f) => {
                  fields.push({ id: f.id, value: f.label, field: f });
               });
            }
         }
         return fields;
      };

      let updateFPFields = (fpFields) => {
         [ids.fieldFPStart, ids.fieldFPOpen].forEach((fieldGLElem) => {
            $$(fieldGLElem).define("options", fpFields);
            $$(fieldGLElem).refresh();
         });
      };

      let updateGLFields = (glFields) => {
         [ids.fieldGLRunning, ids.fieldGLAccount, ids.fieldGLRc].forEach(
            (fieldGLElem) => {
               $$(fieldGLElem).define("options", glFields);
               $$(fieldGLElem).refresh();
            }
         );
      };

      let fpFields = getFieldOptions(this.objectFP);
      let glFields = getFieldOptions(this.objectGL);

      var ui = {
         id: id,
         view: "form",
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.element.name", "*Name"),
               name: "name",
               value: this.name
            },
            {
               id: ids.processFPValue,
               view: "select",
               label: L(
                  "ab.process.accounting.processFPValue",
                  "*Process Fiscal Period Value"
               ),
               value: this.processFPValue,
               name: "processFPValue",
               options: processValues
            },
            {
               id: ids.objectFP,
               view: "select",
               label: L("ab.process.accounting.objectFP", "*FP Object"),
               value: this.objectFP,
               name: "objectFP",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of batchFields
                        fpFields = getFieldOptions(newVal);
                        // rebuild the associated list of Fields to pick
                        updateFPFields(fpFields);
                     }
                  }
               }
            },
            {
               id: ids.objectGL,
               view: "select",
               label: L("ab.process.accounting.objectGL", "*GL Object"),
               value: this.objectGL,
               name: "objectGL",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of batchFields
                        glFields = getFieldOptions(newVal);
                        // rebuild the associated list of Fields to pick
                        updateGLFields(glFields);
                     }
                  }
               }
            },
            {
               id: ids.fieldFPStart,
               view: "select",
               label: L("ab.process.accounting.fieldFPStart", "*FP -> Start"),
               value: this.fieldFPStart,
               name: "fieldFPStart",
               options: fpFields
            },
            {
               id: ids.fieldFPOpen,
               view: "select",
               label: L("ab.process.accounting.fieldFPOpen", "*FP -> Open"),
               value: this.fieldFPOpen,
               name: "fieldFPOpen",
               options: fpFields
            },
            {
               id: ids.fieldGLStarting,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLStarting",
                  "*GL -> Starting BL"
               ),
               value: this.fieldGLStarting,
               name: "fieldGLStarting",
               options: glFields
            },
            {
               id: ids.fieldGLRunning,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLRunning",
                  "*GL -> Running BL"
               ),
               value: this.fieldGLRunning,
               name: "fieldGLRunning",
               options: glFields
            },
            {
               id: ids.fieldGLAccount,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLAccount",
                  "*GL -> Account"
               ),
               value: this.fieldGLAccount,
               name: "fieldGLAccount",
               options: glFields
            },
            {
               id: ids.fieldGLRc,
               view: "select",
               label: L("ab.process.accounting.fieldGLRc", "*GL -> RC"),
               value: this.fieldGLRc,
               name: "fieldGLRc",
               options: glFields
            }
         ]
      };

      webix.ui(ui, $$(id));

      $$(id).show();
   }

   /**
    * propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      var ids = this.propertyIDs(id);
      this.name = this.property(ids.name);

      // TIP: keep the .settings entries == ids[s] keys and this will
      // remain simple:
      this.defaults.settings.forEach((s) => {
         this[s] = this.property(ids[s]);
      });
   }
};
