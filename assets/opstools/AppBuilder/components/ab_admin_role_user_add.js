const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Admin_Role_User_Add extends ABComponent {
    constructor(App) {
        super(App, "ab_admin_role_user_add");

        let L = this.Label;
        let labels = {
            common: App.labels,
            component: {
                selectUser: L("ab.role.addUser.title", "*Select a user"),
                selectScope: L("ab.role.addScope.title", "*Select a scope"),

                filterUser: L("ab.role.addUser.filterUser", "*Filter users")
            }
        };

        let ids = {
            popup: this.unique("popup"),
            filter: this.unique("filter"),
            list: this.unique("list"),
            buttonSave: this.unique("buttonSave")
        };

        let CurrentApplication;

        // Our init() function for setting up our UI
        this.init = (roleDC, userDC) => {
            this._roleDC = roleDC;
            this._userDC = userDC;

            webix.ui(this.ui);

            if ($$(ids.list)) {
                webix.extend($$(ids.list), webix.ProgressBar);
            }
        };

        // our internal business logic
        let _logic = {
            applicationLoad: (application) => {
                CurrentApplication = application;
            },

            getRole: () => {
                if (!this._roleDC) return null;

                let roldId = this._roleDC.getCursor();
                if (!roldId) return null;

                return this._roleDC.getItem(roldId);
            },

            show: () => {
                $$(ids.popup)
                    .getHead()
                    .define("template", labels.component.selectUser);
                $$(ids.popup)
                    .getHead()
                    .refresh();
                $$(ids.popup).show();

                _logic.busy();

                $$(ids.list).clearAll();
                $$(ids.buttonSave).disable();

                let role = _logic.getRole();

                Promise.resolve()
                    // .then(() => new Promise((next, err) => {

                    // 	if (role._scopes != null &&
                    // 		role._scopes.length > 0)
                    // 		return next();

                    // 	role.scopeLoad()
                    // 		.catch(err)
                    // 		.then(scopes => {

                    // 			role._scopes = scopes;

                    // 			next();
                    // 		})

                    // }))
                    .then(
                        () =>
                            new Promise((next, err) => {
                                // Convert data to display in list
                                let users = OP.User.userlist();

                                let listData = [];
                                users.forEach((u) => {
                                    let exists = this._userDC.find(
                                        (uItem) => uItem.id == u.username
                                    )[0];
                                    if (exists) return;

                                    let userData = {
                                        id: u.username,
                                        username: u.username
                                        // data: [],
                                        // type: 'user'
                                    };

                                    // (role.scopes() || []).forEach(s => {

                                    // 	if (this._userDC.find(item => item.username == u.username && item.scope && item.scope.id == s.id)[0])
                                    // 		return;

                                    // 	userData.data.push({
                                    // 		scopeId: s.id,
                                    // 		name: s.name,
                                    // 		username: u.username,
                                    // 		type: 'scope'
                                    // 	})
                                    // });

                                    listData.push(userData);
                                });

                                $$(ids.list).parse(listData || []);

                                _logic.ready();
                                $$(ids.buttonSave).disable();

                                _logic.filter();
                            })
                    );
            },

            template: (item) => {
                // if (item.type == 'user') {
                // 	return `<span class='fa fa-user'></span> ${item.name}`;
                // }
                // else if (item.type == 'scope') {
                // 	return `<span class='fa fa fa-street-view'></span> ${item.name}`;
                // }
                // else {
                // 	return "N/A";
                // }
                return `<span class='fa fa-user'></span> ${item.username}`;
            },

            filter: () => {
                let filterText = ($$(ids.filter).getValue() || "")
                    .trim()
                    .toLowerCase();
                $$(ids.list).filter((item) => {
                    return (
                        (item.username || "")
                            .trim()
                            .toLowerCase()
                            .indexOf(filterText) > -1
                    );
                });
                $$(ids.list).refresh();
            },

            select: (itemId) => {
                $$(ids.buttonSave).disable();

                let selectedItem = $$(ids.list).getItem(itemId);
                if (!selectedItem) return;

                // if (selectedItem.type == 'scope') {
                // 	$$(ids.buttonSave).enable();
                // }
                // else if (selectedItem.type == 'user') {
                // 	$$(ids.popup).getHead().define("template", labels.component.selectScope);
                // 	$$(ids.popup).getHead().refresh();
                // 	$$(ids.buttonSave).disable();
                // }

                $$(ids.buttonSave).enable();
            },

            save: () => {
                _logic.busy();

                let role = _logic.getRole();
                if (!role) return _logic.ready();

                let selectedItem = $$(ids.list).getSelectedItem();
                if (!selectedItem) return _logic.ready();

                role.userAdd(selectedItem.username)
                    .catch((err) => {
                        console.error(err);
                        _logic.ready();
                    })
                    .then(() => {
                        // update user list of role
                        // let scope = role.scopes(s => s.id == selectedItem.scopeId)[0];
                        // if (scope) {
                        this._userDC.add({
                            id: selectedItem.username,
                            value: selectedItem.username
                            // scope: scope
                        });
                        // }

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
            head: labels.component.selectUser,
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
                                placeholder: labels.component.filterUser,
                                on: {
                                    onTimedKeyPress: () => {
                                        _logic.filter();
                                    }
                                }
                            }
                        ]
                    },

                    // List
                    // {
                    // 	id: ids.list,
                    // 	view: 'grouplist',
                    // 	data: [],
                    // 	borderless: true,
                    // 	select: true,
                    // 	multiselect: false,
                    // 	templateBack: _logic.template,
                    // 	template: _logic.template,
                    // 	on: {
                    // 		onItemClick: (item) => {
                    // 			_logic.select(item);
                    // 		}
                    // 	}
                    // },
                    {
                        id: ids.list,
                        view: "list",
                        data: [],
                        borderless: true,
                        select: true,
                        multiselect: false,
                        template: _logic.template,
                        on: {
                            onItemClick: (item) => {
                                _logic.select(item);
                            }
                        }
                    },

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
        this.applicationLoad = _logic.applicationLoad;
        this.show = _logic.show;
    }
};
