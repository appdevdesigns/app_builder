const ABComponent = require("../classes/platform/ABComponent");
const ABRole = require("../classes/platform/ABRole");
const ABFieldUser = require("../classes/platform/dataFields/ABFieldUser");

module.exports = class AB_Work_Admin_Role_Import extends ABComponent {
   constructor(App) {
      let idBase = "ab_admin_role_import";

      super(App, idBase);

      let L = this.Label;
      let labels = {
         common: App.labels,
         component: {
            importRole: L("ab.role.import.title", "*Import a role"),

            selectJsonFile: L(
               "ab.role.import.selectJsonFile",
               "*Choose a JSON file"
            ),

            fileTypeErrorTitle: L(
               "ab.role.import.fileTypeErrorTitle",
               "*This file extension is disallow"
            ),
            fileTypeError: L(
               "ab.role.import.fileTypeError",
               "*Please only upload JSON file"
            ),

            roleInfoTitle: L("ab.role.import.roleInfo", "*Role Info")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         popup: this.unique("popup"),
         uploader: this.unique("uploader"),
         uploadFileList: this.unique("uploadFileList"),

         roleName: this.unique("roleName"),
         roleDescription: this.unique("roleDescription"),
         scopes: this.unique("scopes"),
         users: this.unique("users"),

         progressMessage: this.unique("progressMessage"),

         buttonImport: this.unique("buttonImport")
      };

      let userField = new ABFieldUser({
         settings: {}
      });

      let _logic = {
         show: () => {
            if (!$$(ids.popup)) return;
            $$(ids.popup).show();

            _logic.formClear();

            // open file dialog to upload
            $$(ids.uploader).fileDialog();
         },

         loadJsonFile: () => {
            if (!this._jsonFileInfo) return false;

            if (!_logic.validateFile(this._jsonFileInfo)) {
               webix.alert({
                  title: labels.component.fileTypeErrorTitle,
                  text: labels.component.fileTypeError,
                  ok: labels.common.ok
               });

               return false;
            }

            // read JSON file
            let reader = new FileReader();
            reader.onload = () => {
               try {
                  let importData = JSON.parse(reader.result);

                  this._importData = importData;
                  this._role = importData.role
                     ? new ABRole(importData.role)
                     : null;

                  _logic.formValue();
               } catch (err) {
                  // TODO
               }
            };
            reader.readAsText(this._jsonFileInfo.file);

            return true;
         },

         validateFile(fileInfo) {
            if (!fileInfo || !fileInfo.file || !fileInfo.file.type)
               return false;

            // validate file type
            let extensionType = fileInfo.file.type.toLowerCase();
            if (extensionType == "application/json") {
               return true;
            } else {
               return false;
            }
         },

         removeJsonFile: (fileId) => {
            $$(ids.uploadFileList).remove(fileId);
            _logic.formClear();
            return true;
         },

         formValue: () => {
            _logic.formClear();

            if (!this._importData || !this._importData.role) return;

            let role = this._role;

            // duplicate
            if (this._roleDC && this._roleDC.exists(role.id)) {
               webix.alert({
                  title: "Exists",
                  text: "This role already exists",
                  type: "alert-warning"
               });
               return;
            }

            // role
            $$(ids.roleName).setValue(role.name);
            $$(ids.roleDescription).setValue(role.description);

            // scopes
            let scopeData = role.scopes();
            scopeData.forEach((s) => (s._isImport = true));
            let $scopes = $$(ids.scopes);
            $scopes.clearAll();
            $scopes.parse(scopeData);
            $scopes.refresh();

            // users
            let userData = (this._importData.users || []).map((u) => {
               let isExists =
                  this._userList
                     .map((uItem) => uItem.id || uItem.value || uItem)
                     .filter((uItem) => uItem == u).length > 0;

               return {
                  _isImport: isExists,
                  _isDisabled: !isExists,
                  name: u
               };
            });
            let $users = $$(ids.users);
            $users.clearAll();
            $users.parse(userData);
            $users.refresh();

            if (role) $$(ids.buttonImport).enable();
         },

         formClear: () => {
            $$(ids.roleName).setValue("");
            $$(ids.roleDescription).setValue("");
            $$(ids.scopes).clearAll();
            $$(ids.users).clearAll();
            $$(ids.buttonImport).disable();
            $$(ids.buttonImport).show();
            _logic.progressMessage("");
         },

         itemTemplate: (item, common) => {
            if (item._isDisabled) {
               return `<span style="color: #989898;">${common.disableItem(
                  item
               )} ${item.name}</span>`;
            } else {
               return `${common.status(item)} ${common.markCheckbox(item)} ${
                  item.name
               }`;
            }
         },

         itemStatus: (item) => {
            let result = "";

            switch (item._status) {
               case "in-progress":
                  result =
                     "<span class='fa fa-refresh' style='background-color: #fd964d; padding: 2px;'></span>";
                  break;
               case "pass":
                  result =
                     "<span class='fa fa-check' style='background-color: #3ad230; padding: 2px;'></span>";
                  break;
               case "fail":
                  result =
                     "<span class='fa fa-remove' style='background-color: #f75858; padding: 2px;'></span>";
                  break;
            }

            return result;
         },

         itemErrorTooltip: (item) => {
            return item._err
               ? `This item is duplicate.`
               : // ? `<span class='webix_strong'>${item._err}</span>`
                 "";
         },

         checkboxTemplate: (item) => {
            return (
               "<span class='check webix_icon fa fa-" +
               (item._isImport ? "check-" : "") +
               "square-o'></span>"
            );
         },

         disableTemplate: () => {
            return "<span class='webix_icon fa fa-ban'></span>";
         },

         toggleCheck: (itemId, $list) => {
            if (!$list) return;

            // update UI list
            let item = $list.getItem(itemId);
            item._isImport = item._isImport ? 0 : 1;
            $list.updateItem(itemId, item);
            $list.refresh();
         },

         busy: () => {
            // if ($$(ids.list) && $$(ids.list).showProgress)
            //    $$(ids.list).showProgress({ type: "icon" });

            $$(ids.buttonImport).disable();
         },

         ready: () => {
            // if ($$(ids.list) && $$(ids.list).hideProgress)
            //    $$(ids.list).hideProgress();

            $$(ids.buttonImport).enable();
         },

         progressMessage: (message) => {
            let $progressMessage = $$(ids.progressMessage);
            if (!$progressMessage) return;

            $$(ids.progressMessage).setValue(message);
         },

         hideButton: () => {
            if ($$(ids.buttonImport)) $$(ids.buttonImport).hide();
         },

         hide: () => {
            if ($$(ids.popup)) $$(ids.popup).hide();
         },

         cancel: () => {
            _logic.hide();
         },

         import: () => {
            if (!this._role) return;

            _logic.busy();

            let role = this._role;
            role.name = $$(ids.roleName).getValue();
            role.description = $$(ids.roleDescription).getValue();

            Promise.resolve()
               // Scopes
               .then(() => {
                  _logic.progressMessage("Creating scopes ...");

                  let tasks = [];
                  let $scopes = $$(ids.scopes);
                  let scopes = $$(ids.scopes).find({ _isImport: true });
                  scopes.forEach((s) => {
                     tasks.push(
                        new Promise((resolve) => {
                           $scopes.updateItem(s.id, { _status: "in-progress" });

                           // create a scope
                           s.create()
                              .then(() => {
                                 $scopes.updateItem(s.id, { _status: "pass" });
                                 resolve();
                              })
                              .catch((err) => {
                                 $scopes.updateItem(s.id, {
                                    _status: "fail",
                                    _err: err
                                 });
                                 resolve();
                              });
                        })
                     );
                  });

                  return Promise.all(tasks);
               })
               // Role
               .then(() => {
                  _logic.progressMessage("Creating the role ...");
                  return this._role.create();
               })
               // Users
               .then(() => {
                  _logic.progressMessage("Assigning users to the role ...");
                  let tasks = [];
                  let $users = $$(ids.users);
                  let users = $users.find({ _isImport: true });
                  (users || []).forEach((u) => {
                     tasks.push(
                        () =>
                           new Promise((resolve) => {
                              $users.updateItem(u.id, {
                                 _status: "in-progress"
                              });
                              role
                                 .userAdd(u.name)
                                 .catch((err) => {
                                    $users.updateItem(u.id, {
                                       _status: "fail",
                                       _err: err
                                    });
                                    resolve();
                                 })
                                 .then(() => {
                                    $users.updateItem(u.id, {
                                       _status: "pass"
                                    });
                                    resolve();
                                 });
                           })
                     );
                  });

                  // sequentially
                  return tasks.reduce((promiseChain, currTask) => {
                     return promiseChain.then(currTask);
                  }, Promise.resolve([]));
               })
               // Update UI
               .then(() => {
                  // update role list
                  if (this._roleDC) {
                     this._roleDC.add(this._role);
                  }

                  _logic.progressMessage("");
                  _logic.ready();
                  _logic.hideButton();
               });
         }
      };

      // Our webix UI definition:
      this.ui = {
         id: ids.popup,
         view: "window",
         hidden: true,
         modal: true,
         position: "center",
         width: 500,
         height: 600,
         resize: true,
         head: {
            view: "toolbar",
            css: "webix_dark",
            cols: [
               {
                  view: "label",
                  label: labels.component.importRole
               }
            ]
         },
         body: {
            type: "space",
            borderless: true,
            cols: [
               // File Uploader & Role info
               {
                  type: "form",
                  borderless: true,
                  rows: [
                     // Uploader
                     {
                        id: ids.uploader,
                        view: "uploader",
                        name: "jsonFile",
                        css: "webix_primary",
                        value: labels.component.selectJsonFile,
                        accept: "text/json",
                        multiple: false,
                        autosend: false,
                        link: ids.uploadFileList,
                        on: {
                           onBeforeFileAdd: (fileInfo) => {
                              this._jsonFileInfo = fileInfo;
                              return _logic.loadJsonFile();
                           }
                        }
                     },
                     {
                        id: ids.uploadFileList,
                        name: "uploadedFile",
                        view: "list",
                        type: "uploader",
                        autoheight: true,
                        borderless: true,
                        onClick: {
                           webix_remove_upload: (e, id, trg) => {
                              _logic.removeJsonFile(id);
                           }
                        }
                     },
                     {
                        height: 10
                     },
                     {
                        view: "tabview",
                        tabbar: {
                           height: 50,
                           type: "bottom"
                        },
                        cells: [
                           // Role
                           {
                              header: `<span class='fa fa-user-md'></span> ${L(
                                 "ab.admin.userRole",
                                 "*Roles"
                              )}`,
                              body: {
                                 rows: [
                                    { height: 5 },
                                    {
                                       id: ids.roleName,
                                       view: "text",
                                       label: "Name",
                                       labelWidth: 100
                                    },
                                    {
                                       id: ids.roleDescription,
                                       view: "textarea",
                                       label: "Description",
                                       labelWidth: 100
                                    }
                                 ]
                              }
                           },
                           // Scopes
                           {
                              header: `<span class='fa fa-user-md'></span> ${L(
                                 "ab.admin.scopes",
                                 "*Scopes"
                              )}`,
                              body: {
                                 id: ids.scopes,
                                 name: "scopes",
                                 view: "list",
                                 select: false,
                                 minHeight: 200,
                                 template: _logic.itemTemplate,
                                 type: {
                                    status: _logic.itemStatus,
                                    markCheckbox: _logic.checkboxTemplate
                                 },
                                 tooltip: {
                                    template: _logic.itemErrorTooltip
                                 },
                                 onClick: {
                                    check: (e, itemId) =>
                                       _logic.toggleCheck(
                                          itemId,
                                          $$(ids.scopes)
                                       )
                                 }
                              }
                           },
                           // Users
                           {
                              header: `<span class="fa fa-user"></span> ${L(
                                 "ab.admin.users",
                                 "*Users"
                              )}`,
                              body: {
                                 id: ids.users,
                                 name: "users",
                                 view: "list",
                                 select: false,
                                 minHeight: 200,
                                 template: _logic.itemTemplate,
                                 type: {
                                    status: _logic.itemStatus,
                                    markCheckbox: _logic.checkboxTemplate,
                                    disableItem: _logic.disableTemplate
                                 },
                                 tooltip: {
                                    template: _logic.itemErrorTooltip
                                 },
                                 onClick: {
                                    check: (e, itemId) =>
                                       _logic.toggleCheck(itemId, $$(ids.users))
                                 }
                              }
                           }
                        ]
                     },
                     // Import & Cancel buttons
                     {
                        margin: 5,
                        cols: [
                           {
                              id: ids.progressMessage,
                              view: "label",
                              label: "",
                              align: "left",
                              width: 240,
                              css: {
                                 color: "#9c9595"
                              }
                           },
                           { fillspace: true },
                           {
                              view: "button",
                              value: labels.common.close,
                              css: "ab-cancel-button",
                              autowidth: true,
                              click: () => {
                                 _logic.cancel();
                              }
                           },
                           {
                              view: "button",
                              css: "webix_primary",
                              id: ids.buttonImport,
                              value: labels.common.import,
                              autowidth: true,
                              type: "form",
                              click: () => {
                                 _logic.import();
                              }
                           }
                        ]
                     }
                  ]
               }
            ]
         }
      };

      // Our init() function for setting up our UI
      this.init = function(roleDC) {
         this._roleDC = roleDC;

         webix.ui(this.ui);

         if ($$(ids.list)) webix.extend($$(ids.list), webix.ProgressBar);

         this._userList = userField.getUsers() || [];
      };

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.show = _logic.show;
   }
};
