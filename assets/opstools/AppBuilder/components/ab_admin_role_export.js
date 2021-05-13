const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_List_Export extends ABComponent {
   constructor(App) {
      super(App, "ab_admin_role_export");

      let L = this.Label;
      let labels = {
         common: App.labels,
         component: {
            exportRole: L(
               "ab.application.form.exportRole",
               "*Export role to a JSON file"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         component: this.unique("component"),
         scopes: this.unique("scopes"),
         users: this.unique("users")
      };

      // our internal business logic
      let _logic = {
         /**
          * @function show()
          *
          * Show this component.
          */
         show: (role) => {
            if (role == null) return;

            this.role = role;

            let $popup = $$(ids.component);
            if ($popup) $popup.show();

            console.log(role);

            _logic.setScopes(role.scopes());
            _logic.setUsers(role);
         },

         /**
          * @function hide()
          *
          * Hide this component.
          */
         hide: function() {
            let $popup = $$(ids.component);
            if ($popup) $popup.hide();
         },

         setScopes: (scopes) => {
            let $scopes = $$(ids.scopes);
            if (!$scopes) return;

            $scopes.clearAll();

            (scopes || []).forEach((s) => (s._isExport = true));

            $scopes.parse(scopes);
            $scopes.refresh();
         },

         itemTemplate: (item, common) => {
            return `${common.markCheckbox(item)} ${item.name}`;
         },

         checkboxTemplate: (item) => {
            return (
               "<span class='check webix_icon fa fa-" +
               (item._isExport ? "check-" : "") +
               "square-o'></span>"
            );
         },

         toggleCheck: (itemId, $list) => {
            if (!$list) return;

            // update UI list
            let item = $list.getItem(itemId);
            item._isExport = item._isExport ? 0 : 1;
            $list.updateItem(itemId, item);
            $list.refresh();
         },

         setUsers: (role) => {
            let $users = $$(ids.users);
            if (!$users) return;

            $users.clearAll();
            $users.showProgress({ type: "icon" });

            role
               .getUsers()
               .catch((err) => {
                  console.error(err);
                  $users.hideProgress();
               })
               .then((usernames) => {
                  let userItems = usernames.map((u) => {
                     return {
                        name: u,
                        _isExport: true
                     };
                  });

                  $users.hideProgress();
                  $users.parse(userItems);
                  $users.refresh();
               });
         },

         export: () => {
            let result = {};

            // Role
            result.role = this.role.toObj();

            // Scopes
            let $scopes = $$(ids.scopes);
            if ($scopes) {
               result.role.scopes = $scopes
                  .find({ _isExport: true })
                  .map((s) => s.toObj());
            }

            // Users
            let $users = $$(ids.users);
            if ($users) {
               result.users = $users
                  .find({ _isExport: true })
                  .map((u) => u.name);
            }

            _logic.downloadJsonFile(result);
            _logic.hide();
         },

         downloadJsonFile: (json) => {
            let dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
               JSON.stringify(json)
            )}`;
            let downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute(
               "download",
               `${this.role.name}.json`
            );
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
         }
      };

      // Our webix UI definition:
      this.ui = {
         view: "window",
         id: ids.component,
         height: 600,
         width: 450,
         hidden: true,
         modal: true,
         position: "center",
         head: {
            view: "toolbar",
            css: "webix_dark",
            cols: [
               {
                  view: "label",
                  label: labels.component.exportRole
               },
               {
                  view: "spacer",
                  fillspace: true
               }
            ]
         },
         body: {
            type: "space",
            borderless: true,
            rows: [
               {
                  view: "accordion",
                  multi: true,
                  rows: [
                     {
                        header: L("ab.application.scopes", "*Scopes"),
                        body: {
                           id: ids.scopes,
                           name: "scopes",
                           view: "list",
                           select: false,
                           minHeight: 200,
                           template: _logic.itemTemplate,
                           type: {
                              markCheckbox: _logic.checkboxTemplate
                           },
                           onClick: {
                              check: (e, itemId) =>
                                 _logic.toggleCheck(itemId, $$(ids.scopes))
                           }
                        }
                     },
                     {
                        header: L("ab.application.users", "*Users"),
                        body: {
                           id: ids.users,
                           name: "users",
                           view: "list",
                           select: false,
                           minHeight: 200,
                           template: _logic.itemTemplate,
                           type: {
                              markCheckbox: _logic.checkboxTemplate
                           },
                           onClick: {
                              check: (e, itemId) =>
                                 _logic.toggleCheck(itemId, $$(ids.users))
                           }
                        }
                     }
                  ]
               },
               {
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        autowidth: true,
                        value: L("ab.common.cancel", "*Cancel"),
                        click: () => {
                           _logic.hide();
                        }
                     },
                     {
                        view: "button",
                        css: "webix_primary",
                        type: "form",
                        autowidth: true,
                        value: L("ab.common.export", "*Export"),
                        click: () => {
                           _logic.export();
                        }
                     }
                  ]
               }
            ]
         }
      };

      // Our init() function for setting up our UI
      this.init = () => {
         webix.ui(this.ui);

         let $users = $$(ids.users);
         if ($users) {
            webix.extend($users, webix.ProgressBar);
         }
      };

      //
      // Define our external interface methods:
      //
      this.show = _logic.show;
   }
};
