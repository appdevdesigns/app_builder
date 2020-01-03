/*
 * ab_work_object_workspace_monitor
 *
 * Manage the Object Workspace area.
 *
 */

export default class ABWorkProcessWorkspaceMonitor extends OP.Component {
   /**
    * @param {object} App
    * @param {string} idBase
    */
   constructor(App, idBase) {
      idBase = idBase || "ab_work_process_workspace_monitor";

      super(App, idBase);
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            label: L("ab.process.monitor.label", "*Monitor"),
            instances: L("ab.process.monitor.instances", "*Instances"),
            logs: L("ab.process.monitor.logs", "*Logs"),
            actions: L("ab.process.monitor.actions", "*Actions"),
            details: L("ab.process.monitor.details", "*Instance Details"),
            reset: L("ab.process.monitor.reset", "*Reset Instance"),
            delete: L("ab.process.monitor.delete", "*Delete Instance")
         }
      };

      // default settings

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("_component"),
         taskList: this.unique("_taskList"),
         processLogs: this.unique("_processLogs"),
         resetButton: this.unique("_resetButton"),
         deleteButton: this.unique("_deleteButton")
      };

      // Our webix UI definition:
      this.ui = {
         view: "multiview",
         id: ids.component,
         rows: [
            {
               id: "monitor",
               cols: [
                  {
                     rows: [
                        {
                           view: "toolbar",
                           css: "ab-data-toolbar webix_dark",
                           cols: [
                              {
                                 type: "spacer",
                                 width: 15
                              },
                              {
                                 view: "label",
                                 label: labels.component.instances
                              }
                           ]
                        },

                        {
                           view: "list",
                           id: ids.taskList,
                           item: {
                              height: 74,
                              template: function(obj) {
                                 var icon = "fa-clock-o";
                                 var color = "gray";
                                 if (obj.status == "error") {
                                    icon = "fa-times-circle";
                                    color = "red";
                                 }
                                 var total = "";
                                 if (obj.length > 1) {
                                    total +=
                                       "<div style='color: white; background: #657584; border-radius: 9px; font-size: 12px; font-weight: bold; padding: 0 6px; display: inline-block; line-height: 18px; vertical-align: top; margin-left: 5px;'>" +
                                       obj.length +
                                       "</div>";
                                 }
                                 return (
                                    '<div style="float: left; height: 70px; line-height: 70px; margin-right: 10px; color: ' +
                                    color +
                                    ';" class="fa ' +
                                    icon +
                                    ' fa-2x"></div><div style="padding: 5px 0; line-height: 20px"><div style="font-size: 16px; font-weight: 600;">' +
                                    obj.name +
                                    total +
                                    "</div><div>" +
                                    obj.message +
                                    "</div></div>"
                                 );
                              }
                           },
                           select: true,
                           on: {
                              onItemClick: function(id /*, e, node*/) {
                                 // NOTE: had an error where only 4 log entries appeared
                                 // adding the id: to the entries seemed to help.
                                 var logs = [];
                                 $$(ids.taskList)
                                    .getItem(id)
                                    .logs.forEach((l, indx) => {
                                       logs.push({ id: indx, value: l });
                                    });
                                 $$(ids.processLogs).clearAll();
                                 $$(ids.processLogs).parse(logs);
                                 // when you click an instance we need to know if
                                 // we should show the reset button if it is an error
                                 if (
                                    $$(ids.taskList).getItem(id).status ==
                                    "error"
                                 ) {
                                    $$(ids.resetButton).show();
                                 } else {
                                    $$(ids.resetButton).hide();
                                 }
                                 $$(ids.deleteButton).show();
                              }
                           },
                           navigation: true
                        }
                     ]
                  },
                  { view: "resizer", css: "bg_gray", width: 11 },
                  {
                     gravity: 2,
                     rows: [
                        {
                           cols: [
                              {
                                 gravity: 2,
                                 rows: [
                                    {
                                       view: "toolbar",
                                       css: "ab-data-toolbar webix_dark",
                                       cols: [
                                          {
                                             type: "spacer",
                                             width: 15
                                          },
                                          {
                                             view: "label",
                                             label: labels.component.details
                                          }
                                       ]
                                    },
                                    {}
                                 ]
                              },
                              {
                                 view: "resizer",
                                 css: "bg_gray",
                                 width: 11
                              },
                              {
                                 rows: [
                                    {
                                       view: "toolbar",
                                       css: "ab-data-toolbar webix_dark",
                                       cols: [
                                          {
                                             type: "spacer",
                                             width: 15
                                          },
                                          {
                                             view: "label",
                                             label: labels.component.actions
                                          }
                                       ]
                                    },
                                    {
                                       rows: [
                                          {
                                             id: ids.resetButton,
                                             view: "button",
                                             css: "webix_primary",
                                             type: "icon",
                                             icon: "fa fa-refresh",
                                             hidden: true,
                                             label: labels.component.reset,
                                             on: {
                                                onItemClick: (/*id, e, node*/) => {
                                                   var selectedInstance = $$(
                                                      ids.taskList
                                                   ).getSelectedItem();
                                                   if (selectedInstance) {
                                                      _logic.resetInstance(
                                                         selectedInstance
                                                      );
                                                   }
                                                }
                                             }
                                          },
                                          {
                                             id: ids.deleteButton,
                                             view: "button",
                                             css: "webix_danger",
                                             type: "icon",
                                             icon: "fa fa-trash",
                                             hidden: true,
                                             label: labels.component.delete,
                                             on: {
                                                onItemClick: (/*id, e, node*/) => {}
                                             }
                                          },
                                          {}
                                       ]
                                    }
                                 ]
                              }
                           ]
                        },
                        {
                           view: "resizer",
                           css: "bg_gray",
                           height: 11
                        },
                        {
                           rows: [
                              {
                                 view: "toolbar",
                                 css: "ab-data-toolbar webix_dark",
                                 cols: [
                                    {
                                       type: "spacer",
                                       width: 15
                                    },
                                    {
                                       view: "label",
                                       label: labels.component.logs
                                    }
                                 ]
                              },
                              {
                                 id: ids.processLogs,
                                 view: "list",
                                 template:
                                    '<div style="padding: 5px 0; line-height: 20px">#value#</div>'
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      };

      // Our init() function for setting up our UI
      this.init = function() {
         // $$(ids.noSelection).show();
      };

      var CurrentApplication = null;
      var CurrentProcess = null;

      // our internal business logic
      var _logic = {
         ////

         /**
          * @function applicationLoad
          *
          * Initialize the Object Workspace with the given ABApplication.
          *
          * @param {ABApplication} application
          */
         applicationLoad: (application) => {
            CurrentApplication = application;
         },

         /**
          * @function clearWorkspace()
          *
          * Clear the object workspace.
          */
         clearWorkspace: function() {
            // NOTE: to clear a visual glitch when multiple views are updating
            // at one time ... stop the animation on this one:
            $$(ids.noSelection).show(false, false);
         },

         groupBy(list, keyGetter) {
            const map = new Map();
            list.forEach((item) => {
               const key = keyGetter(item);
               const collection = map.get(key);
               if (!collection) {
                  map.set(key, [item]);
               } else {
                  collection.push(item);
               }
            });
            return map;
         },

         loadProcessInstances: function() {
            $$(ids.resetButton).hide();
            $$(ids.deleteButton).hide();
            if (CurrentProcess) {
               return OP.Comm.Socket.get({
                  url: `/app_builder/abprocessinstance`,
                  params: {
                     processID: CurrentProcess.id,
                     status: { "!": "completed" }
                  }
               }).then((allInstances) => {
                  var list = [];

                  allInstances.forEach((inst) => {
                     var mesg = inst.log[inst.log.length - 1];
                     mesg = mesg.split(" : ");
                     list.push({
                        id: inst.id,
                        task: mesg[0] ? mesg[0] : "No Task ID",
                        name: mesg[1] ? mesg[1] : "No Task Name",
                        message: mesg[2] ? mesg[2] : "No Message",
                        logs: inst.log,
                        status: inst.status
                     });
                  });
                  var instances = _logic.groupBy(
                     list,
                     (item) => item.task + item.message
                  );
                  var items = [];
                  instances.forEach((val) => {
                     var ids = [];
                     val.forEach((v) => {
                        ids.push(v.id);
                     });
                     items.push({
                        ids: ids,
                        task: val[0].task,
                        name: val[0].name,
                        message: val[0].message,
                        logs: val[0].logs,
                        status: val[0].status,
                        length: val.length
                     });
                  });
                  return items;
               });
            } else {
               return Promise.resolve([]);
            }
         },

         /**
          * @function populateWorkspace()
          *
          * Initialize the Object Workspace with the provided ABObject.
          *
          * @param {ABObject} object     current ABObject instance we are working with.
          */
         populateWorkspace: function(process) {
            // $$(ids.selectedItem).show();

            CurrentProcess = process;

            $$(ids.processLogs).clearAll();
            $$(ids.taskList).clearAll();
            $$(ids.taskList).parse(_logic.loadProcessInstances());
         },

         /**
          * @function resetInstance()
          *
          * Tell the server to reset a given process instance and try the
          * task again.
          *
          * @param {ProcessInstance} instance
          *        the selected process instance in the list.
          * @return {Promise}
          */
         resetInstance: function(instance) {
            if (CurrentProcess && instance) {
               return OP.Comm.Service.post({
                  url: `/app_builder/abprocessinstance/reset`,
                  params: {
                     instanceID: instance.ids,
                     taskID: instance.task
                  }
               })
                  .then((response) => {
                     // reload the current monitor view for the current process
                     _logic.populateWorkspace(CurrentProcess);
                  })
                  .catch((err) => {
                     var message = "";
                     if (err.message) {
                        message = `(${err.message})`;
                     }
                     OP.Dialog.Alert({
                        title: "Comm Error",
                        text: `Error communicating with server.
${message}`
                     });
                  });
            } else {
               return Promise.resolve();
            }
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();
         },

         loadData: function() {}
      };
      this._logic = _logic;

      //
      // Define our external interface methods:
      //
      this.applicationLoad = this._logic.applicationLoad;
      this.populateWorkspace = this._logic.populateWorkspace;
      this.clearWorkspace = this._logic.clearWorkspace;
   }
}
