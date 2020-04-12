// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTaskUserCore = require("../../../core/process/tasks/ABProcessTaskUserCore.js");
const ABProcessTaskUserApproval = require("./ABProcessTaskUserApproval.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskUser extends ABProcessTaskUserCore {
   ////
   //// Process Instance Methods
   ////

   /**
    * do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   // do(instance) {
   //     return new Promise((resolve, reject) => {
   //         // for testing:
   //         var myState = this.myState(instance);
   //         myState.status = "completed";
   //         this.log(instance, "Email Sent successfully");
   //         resolve(true);
   //     });
   // }

   /**
    * initState()
    * setup this task's initial state variables
    * @param {obj} context  the context data of the process instance
    * @param {obj} val  any values to override the default state
    */
   // initState(context, val) {
   //     var myDefaults = {
   //         to: "0",
   //         from: "0",
   //         subject: "",
   //         message: "",
   //         fromUsers: {},
   //         toUsers: {},
   //         toCustom: "",
   //         fromCustom: ""
   //     };

   //     super.initState(context, myDefaults, val);
   // }

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         who: `${id}_who`
         // from: `${id}_from`,
         // subject: `${id}_subject`,
         // fromUser: `${id}_from_user`,
         // toUser: `${id}_to_user`,
         // message: `${id}_message`,
         // toCustom: `${id}_to_custom`,
         // fromCustom: `${id}_from_custom`
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      // var ids = this.propertyIDs(id);

      var ui = {
         id: id,
         rows: [
            {
               view: "button",
               label: L(
                  "ab.process.task.user.manual",
                  "*Confirm Off-Line Task"
               ),
               click: () => {
                  console.log("manual clicked");
               }
            },
            {
               view: "button",
               label: L("ab.process.task.user.approval", "*Approval Task"),
               click: () => {
                  this.switchTo("approval", id);
               }
            },
            {
               view: "button",
               label: L("ab.process.task.user.form", "*Form Task"),
               click: () => {
                  console.log("form clicked");
               }
            }
         ]
      };

      webix.ui(ui, $$(id));

      // $$(id).show();
      // $$(id).adjust();
   }

   /**
    * switchTo()
    * replace this object with an instance of one of our child classes:
    * @param {string} classType
    *        a key representing with subObject to create an instance of.
    * @param {string} propertiesID
    *        the webix ui.id container for the properties panel.
    */
   switchTo(classType, propertiesID) {
      // get a copy of my values, but don't pass on .key and .type
      var myValues = this.toObj();
      delete myValues.key;
      delete myValues.type;

      // create an instance of the desired child
      var child = null;
      switch (classType) {
         case "approval":
            child = new ABProcessTaskUserApproval(
               myValues,
               this.process,
               this.application
            );
            break;
      }

      super.switchTo(child, propertiesID);
   }
};
