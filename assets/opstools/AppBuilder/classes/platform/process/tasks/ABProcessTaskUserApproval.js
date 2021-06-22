// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const ABProcessTaskUserApprovalCore = require("../../../core/process/tasks/ABProcessTaskUserApprovalCore.js");
const ABProcessParticipant = require("../ABProcessParticipant.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskUserApproval extends ABProcessTaskUserApprovalCore {
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
         who: `${id}_who`,
         // from: `${id}_from`,
         // subject: `${id}_subject`,
         // fromUser: `${id}_from_user`,
         toUser: `${id}_to_user`,
         formBuilder: `${id}_formBuilder`,
         modalWindow: `${id}_modalWindow`
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
      var ids = this.propertyIDs(id);

      var toUserUI = ABProcessParticipant.selectUsersUi(
         id + "_who_",
         this.toUsers || {},
         {
            isFieldVisible: true,
            fields: this.objectOfStartElement
               ? this.objectOfStartElement.fields()
               : []
         }
      );

      var whoOptions = [
         // current lane/participant
         {
            id: 0,
            value: L(
               "ab.process.task.email.to.currentParticipant",
               "*Current Participant"
            )
         },
         // manually select User/Role
         {
            id: 1,
            value: L(
               "ab.process.task.email.to.selectRoleUser",
               "*Select Role or User"
            )
         }
      ];

      // if we don't have a lane, then remove the lane option:
      if (!this.laneDiagramID || this.laneDiagramID == "?laneID?") {
         whoOptions.shift();
         this.who = 1;
      }

      // here is how we can find out what possible process data
      // fields are available to this task:
      //   returns an [{ key:'{uuid}', label:"" field:{ABDataField} }, {}, ...]
      // var listDataFields = this.process.processDataFields(this);

      // here is how we can find out what possible process objects
      // are available to this task:
      //   returns an [{ ABObject }, {}, ...]
      // var listDataObjects = this.process.processDataObjects(this);

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
               id: ids.who,
               view: "select",
               label: L("ab.process.task.approval.who", "*Who"),
               name: "who",
               value: this.who,
               options: whoOptions,
               on: {
                  onChange: (val) => {
                     if (parseInt(val) == 1) {
                        $$(ids.toUser).show();
                     } else {
                        $$(ids.toUser).hide();
                     }
                  }
               }
            },
            {
               id: ids.toUser,
               rows: [toUserUI],
               paddingY: 10,
               hidden: parseInt(this.who) == 1 ? false : true
            },
            {
               view: "spacer",
               height: 10
            },
            {
               view: "toolbar",
               type: "clean",
               borderless: true,
               cols: [
                  {
                     view: "label",
                     label: "Data To Approve"
                  },
                  {
                     view: "spacer"
                  },
                  {
                     view: "button",
                     value: "Customize Layout",
                     autowidth: true,
                     click: () => {
                        webix
                           .ui({
                              id: ids.modalWindow,
                              view: "window",
                              position: "center",
                              fullscreen: true,
                              modal: true,
                              head: {
                                 view: "toolbar",
                                 css: "webix_dark",
                                 cols: [
                                    {
                                       view: "spacer",
                                       width: 17
                                    },
                                    {
                                       view: "label",
                                       label: "Customize the approval layout"
                                    },
                                    {
                                       view: "spacer"
                                    },
                                    {
                                       view: "button",
                                       label: "Cancel",
                                       autowidth: true,
                                       click: function() {
                                          $$(ids.modalWindow).close();
                                       }
                                    },
                                    {
                                       view: "button",
                                       css: "webixtype_form",
                                       label: "Save",
                                       autowidth: true,
                                       click: () => {
                                          this.formBuilder = $$(
                                             ids.formBuilder
                                          ).getFormData();
                                          (
                                             this.formBuilder.components || []
                                          ).forEach((component) => {
                                             if (
                                                component._key &&
                                                component.key != component._key
                                             )
                                                component.key = component._key;
                                          });
                                          this.emit("save");
                                          $$(ids.modalWindow).close();
                                       }
                                    },
                                    {
                                       view: "spacer",
                                       width: 17
                                    }
                                 ]
                              },
                              body: {
                                 id: ids.formBuilder,
                                 view: "formiobuilder",
                                 dataFields: this.process.processDataFields(
                                    this
                                 ),
                                 formComponents: this.preProcessFormIOComponents()
                              }
                           })
                           .show();
                     }
                  }
               ]
            },
            {
               view: "layout",
               type: "form",
               rows: [
                  {
                     view: "layout",
                     padding: 20,
                     rows: [
                        {
                           id: ids.formPreview,
                           view: "formiopreview",
                           formComponents: this.preProcessFormIOComponents(),
                           height: 500
                        }
                     ]
                  }
               ]
            }
            // {
            //     view: "label",
            //     label: "Build Custom Message"
            // },
            // {
            //     id: ids.message,
            //     view: "tinymce-editor",
            //     label: L("ab.process.task.email.message", "*Message"),
            //     name: "message",
            //     value: this.message,
            //     borderless: true,
            //     minHeight: 500,
            //     config: {
            //         plugins: [
            //             "advlist autolink lists link image charmap print preview anchor",
            //             "searchreplace visualblocks code fullscreen",
            //             "insertdatetime media table contextmenu paste imagetools wordcount"
            //         ],
            //         toolbar:
            //             "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
            //         init_instance_callback: (editor) => {
            //             editor.on("KeyUp", (event) => {
            //                 // _logic.onChange();
            //             });
            //
            //             editor.on("Change", function(event) {
            //                 // _logic.onChange();
            //             });
            //         }
            //     }
            // }
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
      this.who = this.property(ids.who);
      this.toUsers = ABProcessParticipant.stashUsersUi(id + "_who_");
   }
};
