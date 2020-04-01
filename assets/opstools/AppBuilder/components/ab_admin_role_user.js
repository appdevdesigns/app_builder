const ABComponent = require("../classes/platform/ABComponent");

const ABUserAdd = require("./ab_admin_role_user_add");

module.exports = class AB_Work_Admin_Role_User extends ABComponent {
    constructor(App) {
        super(App, "ab_admin_role_user");

        let L = this.Label;
        let labels = {
            common: App.labels,
            component: {
                confirmRemoveUserTitle: L(
                    "ab.role.remove.user.title",
                    "*Remove an user"
                ),
                confirmRemoveUserMessage: L(
                    "ab.role.remove.user.message",
                    "*Do you want to remove this user from the role ?"
                )
            }
        };

        let UserAdd = new ABUserAdd(App);

        this._userDC = new webix.DataCollection();

        // internal list of Webix IDs to reference our UI components.
        let ids = {
            datatable: this.unique("datatable"),
            addUser: this.unique("addUser")
        };

        // Our webix UI definition:
        this.ui = {
            id: ids.component,
            view: "layout",
            rows: [
                {
                    id: ids.datatable,
                    view: "datatable",
                    columns: [
                        {
                            id: "username",
                            header: '<span class="fa fa-user"></span> Username',
                            fillspace: true,
                            template: function(user) {
                                return user ? user.value : "";
                            }
                        },
                        // {
                        // 	id: "scope", header: '<span class="fa fa-street-view"></span> Scope', fillspace: true,
                        // 	template: function (scopeUser) {
                        // 		return scopeUser.scope ? scopeUser.scope.name : "";
                        // 	},
                        // },
                        {
                            id: "remove",
                            header: "",
                            width: 40,
                            template:
                                "<div class='remove'>{common.trashIcon()}</div>",
                            css: { "text-align": "center" }
                        }
                    ],
                    onClick: {
                        remove: (event, data, target) => {
                            _logic.removeUser(data.row);
                        }
                    }
                },
                {
                    cols: [
                        { fillspace: true },
                        {
                            id: ids.addUser,
                            view: "button",
                            css: "webix_primary",
                            type: "icon",
                            icon: "fa fa-plus",
                            label: "Add a user",
                            width: 130,
                            click: () => {
                                UserAdd.show();
                            }
                        }
                    ]
                }
            ]
        };

        // Our init() function for setting up our UI
        this.init = (roleDC) => {
            this._roleDC = roleDC;
            if (this._roleDC) {
                this._roleDC.attachEvent("onAfterCursorChange", (roleId) => {
                    _logic.onShow();
                });
            }

            if ($$(ids.datatable))
                webix.extend($$(ids.datatable), webix.ProgressBar);

            $$(ids.datatable).data.sync(this._userDC);

            UserAdd.init(roleDC, this._userDC);
        };

        let _logic = {
            getRole: () => {
                if (this._roleDC == null) return;

                let roleId = this._roleDC.getCursor();
                if (!roleId) return;

                let role = this._roleDC.getItem(roleId);
                return role;
            },

            onShow: () => {
                this._userDC.clearAll();

                let role = _logic.getRole();
                if (!role) {
                    $$(ids.addUser).disable();
                    return;
                } else {
                    $$(ids.addUser).enable();
                }

                // Parse to the data collection
                if (this._userDC) {
                    _logic.busy();

                    role.getUsers()
                        .catch((err) => {
                            console.error(err);
                            _logic.ready();
                        })
                        .then((usernames) => {
                            this._userDC.parse(usernames);
                            _logic.ready();
                        });
                }
            },

            removeUser: (rowId) => {
                let role = _logic.getRole();
                if (!role) return;

                OP.Dialog.Confirm({
                    title: labels.component.confirmRemoveUserTitle,
                    message: labels.component.confirmRemoveUserMessage,
                    callback: (isOK) => {
                        if (isOK) {
                            _logic.busy();

                            let user = this._userDC.getItem(rowId);
                            let role = _logic.getRole();
                            if (!user || !role) {
                                _logic.ready();
                                return;
                            }

                            let username = user.value;

                            role.userRemove(username)
                                .catch((err) => {
                                    console.error(err);
                                    _logic.ready();
                                })
                                .then(() => {
                                    if (
                                        $$(ids.datatable) &&
                                        $$(ids.datatable).clearSelection
                                    )
                                        $$(ids.datatable).clearSelection();

                                    this._userDC.remove(rowId);

                                    _logic.ready();
                                });
                        }
                    }
                });
            },

            ready: () => {
                if ($$(ids.datatable) && $$(ids.datatable).hideProgress)
                    $$(ids.datatable).hideProgress();
            },

            busy: () => {
                if ($$(ids.datatable) && $$(ids.datatable).showProgress)
                    $$(ids.datatable).showProgress({ type: "icon" });
            }
        };

        this._logic = _logic;

        //
        // Define our external interface methods:
        //
        this.onShow = _logic.onShow;
    }
};
