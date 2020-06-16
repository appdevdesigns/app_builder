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
         objectFP: `${id}_objectFP`
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
                  // onChange(newVal, oldVal) {
                  //    if (newVal != oldVal) {
                  //       // gather new set of batchFields
                  //       batchFields = defaultFields(newVal);
                  //       // rebuild the associated list of Fields to pick
                  //       updateFields(fieldPickersBatch, batchFields);
                  //    }
                  // }
               }
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
