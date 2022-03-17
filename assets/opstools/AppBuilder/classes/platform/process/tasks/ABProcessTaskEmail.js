// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTaskEmailCore = require("../../../core/process/tasks/ABProcessTaskEmailCore.js");
const ABProcessParticipant = require("../ABProcessParticipant.js");
const ABFieldUser = require("../../dataFields/ABFieldUser.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskEmail extends ABProcessTaskEmailCore {
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
         to: `${id}_to`,
         from: `${id}_from`,
         subject: `${id}_subject`,
         fromUser: `${id}_from_user`,
         toUser: `${id}_to_user`,
         message: `${id}_message`,
         toCustom: `${id}_to_custom`,
         fromCustom: `${id}_from_custom`
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

      var toUserUI = ABProcessParticipant.selectUsersUi(
         id + "_to_",
         this.toUsers || {},
         {
            isFieldVisible: true,
            fields: this.process
               .processDataFields(this)
               .filter((f) => f.field && f.field instanceof ABFieldUser)
         }
      );
      var fromUserUI = ABProcessParticipant.selectUsersUi(
         id + "_from_",
         this.fromUsers || {},
         {
            isFieldVisible: true,
            fields: this.process
               .processDataFields(this)
               .filter((f) => f.field && f.field instanceof ABFieldUser)
         }
      );

      var ui = {
         id: id,
         view: "form",
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.task.email.name", "*Name"),
               name: "name",
               value: this.name
            },
            {
               id: ids.to,
               view: "select",
               label: L("ab.process.task.email.to", "*To"),
               name: "to",
               value: this.to,
               options: [
                  {
                     id: 0,
                     value: L(
                        "ab.process.task.email.to.nextParticipant",
                        "*Next Participant"
                     )
                  },
                  {
                     id: 1,
                     value: L(
                        "ab.process.task.email.to.selectRoleUser",
                        "*Select Role or User"
                     )
                  },
                  {
                     id: 2,
                     value: L("ab.process.task.email.to.custom", "*Custom")
                  }
               ],
               on: {
                  onChange: (val) => {
                     if (parseInt(val) == 1) {
                        $$(ids.toUser).show();
                        $$(ids.toCustom).hide();
                     } else if (parseInt(val) == 2) {
                        $$(ids.toUser).hide();
                        $$(ids.toCustom).show();
                     } else {
                        $$(ids.toUser).hide();
                        $$(ids.toCustom).hide();
                     }
                  }
               }
            },
            {
               id: ids.toUser,
               rows: [toUserUI],
               paddingY: 10,
               hidden: parseInt(this.to) == 1 ? false : true
            },
            {
               id: ids.toCustom,
               view: "text",
               label: L("ab.process.task.email.toCustom", "*Email"),
               placeholder: L(
                  "ab.process.task.email.toCustom",
                  "*Type email address here..."
               ),
               name: "toCustom",
               value: this.toCustom,
               hidden: parseInt(this.to) == 2 ? false : true
            },
            {
               id: ids.from,
               view: "select",
               label: L("ab.process.task.email.from", "*From"),
               name: "from",
               value: this.from,
               options: [
                  {
                     id: 0,
                     value: L(
                        "ab.process.task.email.to.nextParticipant",
                        "*Current Participant"
                     )
                  },
                  {
                     id: 1,
                     value: L(
                        "ab.process.task.email.to.selectRoleUser",
                        "*Select Role or User"
                     )
                  },
                  {
                     id: 2,
                     value: L("ab.process.task.email.to.custom", "*Custom")
                  }
               ],
               on: {
                  onChange: (val) => {
                     if (parseInt(val) == 1) {
                        $$(ids.fromUser).show();
                        $$(ids.fromCustom).hide();
                     } else if (parseInt(val) == 2) {
                        $$(ids.fromUser).hide();
                        $$(ids.fromCustom).show();
                     } else {
                        $$(ids.fromUser).hide();
                        $$(ids.fromCustom).hide();
                     }
                  }
               }
            },
            {
               id: ids.fromUser,
               rows: [fromUserUI],
               paddingY: 10,
               hidden: parseInt(this.from) == 1 ? false : true
            },
            {
               id: ids.fromCustom,
               view: "text",
               label: L("ab.process.task.email.fromCustom", "*Email"),
               placeholder: L(
                  "ab.process.task.email.fromCustomPlace",
                  "*Type email address here..."
               ),
               name: "fromCustom",
               value: this.fromCustom,
               hidden: parseInt(this.from) == 2 ? false : true
            },
            {
               id: ids.subject,
               view: "text",
               label: L("ab.process.task.email.subject", "*Subject"),
               name: "subject",
               value: this.subject
            },
            {
               view: "spacer",
               height: 10
            },
            {
               id: ids.message,
               view: "tinymce-editor",
               label: L("ab.process.task.email.message", "*Message"),
               name: "message",
               value: this.message,
               borderless: true,
               minHeight: 500,
               config: {
                  plugins: [
                     "advlist autolink lists link image charmap print preview anchor",
                     "searchreplace visualblocks code fullscreen",
                     "insertdatetime media table contextmenu paste imagetools wordcount"
                  ],
                  toolbar:
                     "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                  init_instance_callback: (editor) => {
                     editor.on("KeyUp", (event) => {
                        // _logic.onChange();
                     });

                     editor.on("Change", function(event) {
                        // _logic.onChange();
                     });
                  }
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
      this.to = this.property(ids.to);
      this.from = this.property(ids.from);
      this.subject = this.property(ids.subject);
      this.message = this.property(ids.message);
      this.toCustom = this.property(ids.toCustom);
      this.fromCustom = this.property(ids.fromCustom);
      this.toUsers = ABProcessParticipant.stashUsersUi(id + "_to_");
      this.fromUsers = ABProcessParticipant.stashUsersUi(id + "_from_");
   }
};
