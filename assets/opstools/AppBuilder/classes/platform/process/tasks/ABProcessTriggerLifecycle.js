// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTriggerLifecycleCore = require("../../../core/process/tasks/ABProcessTriggerLifecycleCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTriggerLifecycle extends ABProcessTriggerLifecycleCore {
   propertyIDs(id) {
      return {
         name: `${id}_name`,
         objList: `${id}_objlist`,
         lifecycleList: `${id}_lifecycleList`
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

      var allObjects = this.application.objectsIncluded();
      var listObj = [];
      allObjects.forEach((obj) => {
         listObj.push({ id: obj.id, value: obj.label });
      });

      var ui = {
         view: "form",
         id: id,
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.task.email.name", "*Name"),
               name: "name",
               value: this.name
            },
            {
               id: ids.objList,
               view: "select",
               label: "Object",
               value: this.objectID,
               options: listObj
            },
            {
               id: ids.lifecycleList,
               view: "select",
               label: "lifecycle",
               value: this.lifecycleKey,
               options: [
                  { id: "added", value: "after Add" },
                  { id: "updated", value: "after Update" },
                  { id: "deleted", value: "after Delete" }
               ]
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
      this.name = $$(ids.name).getValue();
      this.objectID = $$(ids.objList).getValue();
      this.lifecycleKey = $$(ids.lifecycleList).getValue();
      this.triggerKey = `${this.objectID}.${this.lifecycleKey}`;
   }
};
