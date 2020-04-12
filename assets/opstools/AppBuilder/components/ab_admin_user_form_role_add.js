const ABComponent = require("../classes/platform/ABComponent");
const ABRole = require("../classes/platform/ABRole");

module.exports = class AB_Work_Admin_User_Form_Role_Add extends ABComponent {
   constructor(App) {
      super(App, "ab_admin_user_form_role_add");

      let L = this.Label;
      let labels = {
         common: App.labels,
         component: {
            selectRole: L("ab.user.addRole.selectRole", "*Select a role"),
            selectScope: L("ab.user.addRole.selectScope", "*Select a scope"),
            filterRole: L("ab.user.addRole.filterRole", "*Filter roles")
         }
      };

      let ids = {
         popup: this.unique("popup"),
         filter: this.unique("filter"),
         list: this.unique("list"),
         buttonSave: this.unique("buttonSave")
      };

      // Our init() function for setting up our UI
      this.init = (userDC, roleDC) => {
         this._userDC = userDC;
         this._roleDC = roleDC;

         webix.ui(this.ui);

         if ($$(ids.list)) {
            webix.extend($$(ids.list), webix.ProgressBar);
         }
      };

      // our internal business logic
      let _logic = {
         template: (item) => {
            // if (item.type == 'role') {
            // 	return `<span class='fa fa-user-md'></span> ${item.name}`;
            // }
            // else if (item.type == 'scope') {
            // 	return `<span class='fa fa fa-street-view'></span> ${item.name}`;
            // }
            // else {
            // 	return "N/A";
            // }

            return `<span class='fa fa-user-md'></span> ${item.name}`;
         },

         show: () => {
            $$(ids.popup)
               .getHead()
               .define("template", labels.component.selectRole);
            $$(ids.popup)
               .getHead()
               .refresh();
            $$(ids.popup).show();

            _logic.busy();

            $$(ids.list).clearAll();
            $$(ids.buttonSave).disable();

            let currUserId = this._userDC.getCursor();
            let currUser = this._userDC.getItem(currUserId);
            if (!currUser) {
               _logic.ready();
               return;
            }

            ABRole.find()
               .catch((err) => {
                  console.error(err);
                  _logic.ready();
               })
               .then((roles) => {
                  // remove included roles
                  let includedRoleIds = this._roleDC
                     .find({})
                     .map((role) => (role ? role.id : ""))
                     .filter((rId) => rId);
                  // let includedScopeIds = this._roleDC.find({}).map(d => d.scope ? d.scope.id : "").filter(sId => sId);
                  roles = (roles || []).filter(
                     (r) => includedRoleIds.indexOf(r.id) < 0
                  );

                  // pull scopes
                  // let tasks = [];
                  // roles.forEach(r => {

                  // 	if (r._scopes.length < 1) {
                  // 		tasks.push(new Promise((next, err) => {

                  // 			r.scopeLoad()
                  // 				.catch(err)
                  // 				.then(scopes => {
                  // 					r._scopes = scopes || [];
                  // 					next();
                  // 				});

                  // 		}));
                  // 	}

                  // });

                  // Promise.all(tasks)
                  // 	.then(() => {

                  // Convert data to display in list
                  // let listData = [];
                  // roles.forEach(r => {

                  // 	let roleData = {
                  // 		id: r.id,
                  // 		name: r.name,
                  // 		data: [],
                  // 		type: 'role'
                  // 	};

                  // 	r.scopes().forEach(s => {

                  // 		if (includedScopeIds.indexOf(s.id) > -1)
                  // 			return;

                  // 		roleData.data.push({
                  // 			id: s.id,
                  // 			name: s.name,
                  // 			role: r,
                  // 			type: 'scope'
                  // 		})
                  // 	});

                  // 	listData.push(roleData);

                  // });

                  // $$(ids.list).parse(listData || []);

                  $$(ids.list).parse(roles || []);

                  _logic.ready();
                  $$(ids.buttonSave).disable();
               });

            // });
         },

         filter: () => {
            let filterText = ($$(ids.filter).getValue() || "")
               .trim()
               .toLowerCase();
            $$(ids.list).filter(
               (item) =>
                  (item.name || "")
                     .trim()
                     .toLowerCase()
                     .indexOf(filterText) > -1
            );
            $$(ids.list).refresh();
         },

         select: (itemId) => {
            $$(ids.buttonSave).disable();

            let selectedRole = $$(ids.list).getItem(itemId);
            if (!selectedRole) return;

            $$(ids.buttonSave).enable();

            // let selectedItem = $$(ids.list).getItem(itemId);
            // if (!selectedItem) return;

            // if (selectedItem.type == 'scope') {
            // 	$$(ids.buttonSave).enable();
            // }
            // else if (selectedItem.type == 'role') {
            // 	$$(ids.popup).getHead().define("template", labels.component.selectScope);
            // 	$$(ids.popup).getHead().refresh();
            // 	$$(ids.buttonSave).disable();
            // }
         },

         save: () => {
            _logic.busy();

            let userId = this._userDC.getCursor();
            let user = this._userDC.getItem(userId);
            if (!user) return _logic.ready();

            let role = $$(ids.list).getSelectedItem();
            if (!role) return _logic.ready();

            role
               .userAdd(user.username)
               .catch((err) => {
                  console.error(err);
                  _logic.ready();
               })
               .then(() => {
                  // update role list of user
                  if (role) {
                     this._roleDC.add(role);
                  }

                  _logic.ready();
                  $$(ids.popup).hide();
               });
         },

         cancel: () => {
            $$(ids.popup).hide();
         },

         busy: () => {
            if ($$(ids.list) && $$(ids.list).showProgress)
               $$(ids.list).showProgress({ type: "icon" });

            $$(ids.buttonSave).disable();
         },

         ready: () => {
            if ($$(ids.list) && $$(ids.list).hideProgress)
               $$(ids.list).hideProgress();

            $$(ids.buttonSave).enable();
         }
      };

      // Our webix UI definition:
      this.ui = {
         id: ids.popup,
         view: "window",
         head: labels.component.selectRole,
         hidden: true,
         modal: true,
         position: "center",
         height: 450,
         width: 400,
         body: {
            borderless: true,
            rows: [
               // Filter
               {
                  cols: [
                     {
                        view: "icon",
                        icon: "fa fa-filter",
                        align: "left"
                     },
                     {
                        view: "text",
                        id: ids.filter,
                        placeholder: labels.component.filterRole,
                        on: {
                           onTimedKeyPress: () => {
                              _logic.filter();
                           }
                        }
                     }
                  ]
               },

               // List
               {
                  id: ids.list,
                  view: "list",
                  data: [],
                  borderless: true,
                  select: true,
                  template: _logic.template,
                  on: {
                     onItemClick: (item) => {
                        _logic.select(item);
                     }
                  }
               },
               // // List
               // {
               // 	id: ids.list,
               // 	view: 'grouplist',
               // 	data: [],
               // 	borderless: true,
               // 	select: true,
               // 	templateBack: _logic.template,
               // 	template: _logic.template,
               // 	on: {
               // 		onItemClick: (item) => {
               // 			_logic.select(item);
               // 		}
               // 	}
               // },

               // Import & Cancel buttons
               {
                  type: "space",
                  margin: 5,
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        value: labels.common.cancel,
                        css: "ab-cancel-button",
                        autowidth: true,
                        click: () => {
                           _logic.cancel();
                        }
                     },
                     {
                        view: "button",
                        css: "webix_primary",
                        id: ids.buttonSave,
                        value: labels.common.save,
                        autowidth: true,
                        type: "form",
                        click: () => {
                           _logic.save();
                        }
                     }
                  ]
               }
            ]
         }
      };

      //
      // Define our external interface methods:
      //
      this.show = _logic.show;
   }
};
