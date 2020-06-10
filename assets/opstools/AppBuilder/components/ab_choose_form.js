/*
 * AB Choose Form
 *
 * Display the form for creating a new Application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABApplication = require("../classes/platform/ABApplication");
const ABProcessParticipant = require("../classes/platform/process/ABProcessParticipant.js");

module.exports = class ABChoose extends ABComponent {
   // .extend(idBase, function(App) {

   constructor(App) {
      super(App, "ab_choose_form");

      var L = this.Label; // lazy shortcut

      var labels = {
         common: App.labels,

         component: {
            formHeader: L("ab.application.form.header", "*Application Info"),
            formDescription: L(
               "ab.application.form.formDescription",
               "*Description"
            ),
            formAdminApp: L(
               "ab.application.form.formAdminApp",
               "*Admin Application"
            ),
            placeholderName: L(
               "ab.application.form.placeholderName",
               "*Application name"
            ),
            placeholderDescription: L(
               "ab.application.form.placeholderDescription",
               "*Application description"
            ),

            sectionPermission: L(
               "ab.application.form.sectionPermission",
               "*Permission"
            ),
            permissionHeader: L(
               "ab.application.form.headerPermission",
               "*Who can use this app?"
            ),
            managerHeader: L(
               "ab.application.form.managerHeader",
               "*Who can manage page/tab access for this app?"
            ),
            createNewRole: L(
               "ab.application.form.createNewRoleButton",
               "*Create new role"
            ),

            invalidName: L(
               "ab.application.invalidName",
               "*This application name is invalid"
            ),
            duplicateName: L(
               "ab.application.duplicateName",
               "*Name must be unique."
            ),
            limitName: L(
               "ab.application.limitName",
               "*Name must be less than or equal to 20"
            ),
            enableAccessManagement: L(
               "ab.application.enableAccessManagement",
               "*Enable Page/Tab Access Management"
            )
         }
      };

      var ids = {
         component: this.unique("component"),

         form: this.unique("form"),
         appFormPermissionList: this.unique("permission"),
         appFormCreateRoleButton: this.unique("createRole"),

         saveButton: this.unique("buttonSave"),
         accessManager: this.unique("accessManager"),
         accessManagerToolbar: this.unique("accessManagerToolbar")
      };

      var accessManagerUI = ABProcessParticipant.selectManagersUi(
         "application_amp_",
         {}
      );

      this.ui = {
         id: ids.component,
         responsive: "hide",
         type: "space",
         cols: [
            {
               maxWidth: App.config.appListSpacerColMaxWidth,
               minWidth: App.config.appListSpacerColMinWidth,
               width: App.config.appListSpacerColMaxWidth
            },
            {
               responsiveCell: false,
               rows: [
                  {
                     maxHeight: App.config.appListSpacerRowHeight,
                     hidden: App.config.hideMobile
                  },
                  {
                     view: "toolbar",
                     css: "webix_dark",
                     cols: [
                        {
                           view: "label",
                           label: labels.component.formHeader,
                           fillspace: true
                        }
                     ]
                  },
                  {
                     view: "form",
                     id: ids.form,
                     autoheight: true,
                     margin: 0,
                     rules: {
                        label: (value) => {
                           return 0 < value.length && value.length <= 20;
                        }
                     },
                     elements: [
                        //{ type: "section", template: '<span class="webix_icon fa fa-edit" style="max-width:32px;"></span>Information', margin: 0 },
                        {
                           name: "label",
                           view: "text",
                           label: labels.common.formName,
                           placeholder: labels.component.placeholderName,
                           invalidMessage: labels.component.limitName,
                           labelWidth: 100,
                           on: {
                              onChange: function(newValue, oldValue) {
                                 _logic.permissionRenameRole(
                                    newValue,
                                    oldValue
                                 );
                              }
                           }
                        },
                        { height: App.config.smallSpacer },
                        {
                           name: "description",
                           view: "textarea",
                           label: labels.component.formDescription,
                           labelAlign: "left",
                           labelWidth: 100,
                           placeholder: labels.component.placeholderDescription,
                           height: 100
                        },
                        { height: App.config.smallSpacer },
                        {
                           name: "isAdminApp",
                           view: "checkbox",
                           labelRight: labels.component.formAdminApp,
                           labelWidth: 0
                        },
                        { height: App.config.smallSpacer },
                        {
                           view: "toolbar",
                           css: "ab-toolbar-submenu webix_dark",
                           cols: [
                              {
                                 template: labels.component.permissionHeader,
                                 type: "header",
                                 borderless: true
                              },
                              {},
                              {
                                 view: "checkbox",
                                 id: ids.appFormCreateRoleButton,
                                 align: "right",
                                 labelRight: labels.component.createNewRole,
                                 labelWidth: 0,
                                 width: 150,
                                 on: {
                                    onItemClick: function(id, e) {
                                       _logic.createRoleButtonClick();
                                    }
                                 }
                              }
                           ]
                        },
                        {
                           name: "permissions",
                           id: ids.appFormPermissionList,
                           view: "list",
                           autowidth: true,
                           height: 140,
                           margin: 0,
                           css: "ab-app-form-permission",
                           template: "{common.markCheckbox()} #name#",
                           type: {
                              markCheckbox: function(obj) {
                                 return (
                                    "<span class='check webix_icon fa fa-fw fa-" +
                                    (obj.markCheckbox ? "check-" : "") +
                                    "square-o'></span>"
                                 );
                              }
                           },
                           on: {
                              onItemClick: function(id, e, node) {
                                 _logic.permissionClick(id, e, node);
                              }
                           }
                        },
                        { height: App.config.smallSpacer },
                        {
                           name: "isAccessManaged",
                           view: "checkbox",
                           labelRight: labels.component.enableAccessManagement,
                           labelWidth: 0,
                           on: {
                              onChange: function(newv, oldv) {
                                 if (newv) {
                                    $$(ids.accessManager).show();
                                    $$(ids.accessManagerToolbar).show();
                                 } else {
                                    $$(ids.accessManager).hide();
                                    $$(ids.accessManagerToolbar).hide();
                                 }
                              },
                              onItemClick: function(id, e) {
                                 var enabled = $$(id).getValue();
                                 if (enabled) {
                                    $$(ids.accessManager).show();
                                    $$(ids.accessManagerToolbar).show();
                                 } else {
                                    $$(ids.accessManager).hide();
                                    $$(ids.accessManagerToolbar).hide();
                                 }
                              }
                           }
                        },
                        { height: App.config.smallSpacer },
                        {
                           view: "toolbar",
                           id: ids.accessManagerToolbar,
                           css: "ab-toolbar-submenu webix_dark",
                           hidden:
                              parseInt(this.accessManagement) == 1
                                 ? false
                                 : true,
                           cols: [
                              {
                                 template: labels.component.managerHeader,
                                 type: "header",
                                 borderless: true
                              },
                              {}
                           ]
                        },
                        {
                           id: ids.accessManager,
                           rows: [accessManagerUI],
                           paddingY: 10,
                           hidden:
                              parseInt(this.accessManagement) == 1
                                 ? false
                                 : true
                        },
                        { height: App.config.smallSpacer },
                        {
                           margin: 5,
                           cols: [
                              { fillspace: true },
                              {
                                 view: "button",
                                 value: labels.common.cancel,
                                 width: App.config.buttonWidthSmall,
                                 css: "ab-cancel-button",
                                 click: function() {
                                    _logic.cancel();
                                 }
                              },
                              {
                                 id: ids.saveButton,
                                 view: "button",
                                 css: "webix_primary",
                                 label: labels.common.save,
                                 type: "form",
                                 width: App.config.buttonWidthSmall,
                                 click: function() {
                                    _logic.buttonSaveClick();
                                 } // end click()
                              }
                           ]
                        }
                     ]
                  },
                  {
                     hidden: App.config.hideMobile
                  }
               ]
            },
            {
               maxWidth: App.config.appListSpacerColMaxWidth,
               minWidth: App.config.appListSpacerColMinWidth,
               width: App.config.appListSpacerColMaxWidth
            }
         ]
      };

      const FormFields = [
         "label",
         "description",
         "isAdminApp",
         "isAccessManaged"
      ];

      let Application;

      this.init = function() {
         webix.extend($$(ids.form), webix.ProgressBar);
         webix.extend($$(ids.appFormPermissionList), webix.ProgressBar);
      };

      var _logic = {
         /**
          * @function applicationCreate
          *
          * Step through the process of creating an ABApplication with the
          * current state of the Form.
          *
          * @param {obj} values 	current value hash of the form values.
          */
         applicationCreate: function(values) {
            var newApp = {
               name: values.label,
               label: values.label,
               description: values.description,
               isAdminApp: values.isAdminApp,
               isAccessManaged: values.isAccessManaged,
               accessManagers: values.accessManagers
            };

            async.waterfall(
               [
                  function(cb) {
                     // Create application data
                     ABApplication.create(newApp)
                        .then(function(result) {
                           cb(null, result);
                        })
                        .catch(cb);
                  },
                  function(createdApp, cb) {
                     _logic
                        .permissionSave(createdApp)
                        .then(function() {
                           cb();
                        })
                        .catch(cb);
                  }
               ],
               function(err) {
                  _logic.formReady();

                  if (err) {
                     webix.message({
                        type: "error",
                        text: labels.common.createErrorMessage.replace(
                           "{0}",
                           values.label
                        )
                     });

                     AD.error.log(
                        "App Builder : Error create application data",
                        { error: err }
                     );

                     _logic.buttonSaveEnable();

                     return;
                  }

                  App.actions.transitionApplicationList();

                  webix.message({
                     type: "success",
                     text: labels.common.createSuccessMessage.replace(
                        "{0}",
                        values.label
                     )
                  });

                  _logic.buttonSaveEnable();
               }
            );
         },

         /**
          * @function applicationUpdate
          *
          * Step through the process of updating an ABApplication with the
          * current state of the Form.
          *
          * @param {ABApplication} application
          */
         applicationUpdate: function(Application) {
            var values = _logic.formValues();
            var accessManagers = ABProcessParticipant.stashUsersUi(
               "application_amp_"
            );

            async.waterfall(
               [
                  function(next) {
                     _logic
                        .permissionSave(Application)
                        .then(function(result) {
                           next(null, result);
                        })
                        .catch(next);
                  },
                  function(app_role, next) {
                     // Update application data
                     Application.label = values.label;
                     Application.description = values.description;
                     Application.isAdminApp = values.isAdminApp;
                     Application.isAccessManaged = values.isAccessManaged;
                     Application.accessManagers = accessManagers;

                     if (app_role && app_role.id)
                        Application.role = app_role.id;
                     else Application.role = null;

                     Application.save()
                        .then(function() {
                           next();
                        })
                        .catch(next);
                  }
               ],
               function(err) {
                  _logic.formReady();
                  _logic.buttonSaveEnable();
                  if (err) {
                     webix.message({
                        type: "error",
                        text: labels.common.updateErrorMessage.replace(
                           "{0}",
                           Application.label
                        )
                     });
                     AD.error.log(
                        "App Builder : Error update application data",
                        { error: err }
                     );
                     return false;
                  }

                  App.actions.transitionApplicationList();

                  webix.message({
                     type: "success",
                     text: labels.common.updateSucessMessage.replace(
                        "{0}",
                        Application.label
                     )
                  });
               }
            );
         },

         /**
          * @function buttonSaveClick
          *
          * Process the user clicking on the [Save] button.
          */
         buttonSaveClick: function() {
            _logic.buttonSaveDisable();
            _logic.formBusy();

            // if there is a selected Application, then this is an UPDATE
            // var updateApp = App.actions.getSelectedApplication();
            var updateApp = Application;
            if (updateApp) {
               if (_logic.formValidate("update")) {
                  _logic.applicationUpdate(updateApp);
               }
            } else {
               // else this is a Create
               if (_logic.formValidate("add")) {
                  _logic.applicationCreate(_logic.formValues());
               }
            }
         },

         /**
          * @function buttonSaveDisable
          *
          * Disable the save button.
          */
         buttonSaveDisable: function() {
            $$(ids.saveButton).disable();
         },

         /**
          * @function buttonSaveEnable
          *
          * Re-enable the save button.
          */
         buttonSaveEnable: function() {
            $$(ids.saveButton).enable();
         },

         /**
          * @function cancel
          *
          * Cancel the current Form Operation and return us to the AppList.
          */
         cancel: function() {
            _logic.formReset();
            App.actions.transitionApplicationList();
         },

         /**
          * @function createRoleButtonClick
          *
          * The user clicked the [Create Role] button.  Update the UI and add a
          * unique Application permission to our list.
          */
         createRoleButtonClick: function() {
            if ($$(ids.appFormCreateRoleButton).getValue()) {
               // TODO: if not called from anywhere else, then move the name gathering into .permissionAddNew()
               // Add new app role
               var appName = $$(ids.form).elements["label"].getValue();
               _logic.permissionAddNew(appName);
            } else {
               // Remove app role
               _logic.permissionRemoveNew();
            }
         },

         /**
          * @function formBusy
          *
          * Show the progress indicator to indicate a Form operation is in
          * progress.
          */
         formBusy: function() {
            $$(ids.form).showProgress({ type: "icon" });
         },

         /**
          * @function formPopulate()
          *
          * populate the form values from the given ABApplication
          *
          * @param {ABApplication} application  instance of the ABApplication
          */
         formPopulate: function(application) {
            Application = application;

            var Form = $$(ids.form);

            // Populate data to form
            if (Application) {
               FormFields.forEach(function(f) {
                  if (Form.elements[f]) {
                     Form.elements[f].setValue(Application[f]);
                  }
               });
               var accessManagerUIPop = ABProcessParticipant.selectManagersUi(
                  "application_amp_",
                  Application.accessManagers || {}
               );
               $$(ids.accessManager).removeView(
                  $$(ids.accessManager).getChildViews()[0]
               );
               $$(ids.accessManager).addView(accessManagerUIPop, 0);
            }

            // _logic.permissionPopulate(Application);
         },

         /**
          * @function formReady()
          *
          * remove the busy indicator from the form.
          */
         formReady: function() {
            $$(ids.form).hideProgress();
         },

         /**
          * @function formReset()
          *
          * return the form to an empty state.
          */
         formReset: function() {
            Application = null;

            $$(ids.form).clear();
            $$(ids.form).clearValidation();
            var accessManagerUIReset = ABProcessParticipant.selectManagersUi(
               "application_amp_",
               {}
            );
            $$(ids.accessManager).removeView(
               $$(ids.accessManager).getChildViews()[0]
            );
            $$(ids.accessManager).addView(accessManagerUIReset, 0);
            // $$(self.webixUiids.appFormPermissionList).clearValidation();
            // $$(self.webixUiids.appFormPermissionList).clearAll();
            // $$(self.webixUiids.appFormCreateRoleButton).setValue(0);
         },

         /**
          * @function formValidate()
          *
          * validate the form values.
          *
          * @return {bool}  true if all values pass validation.  false otherwise.
          */
         formValidate: function(op) {
            // op : ['add', 'update', 'destroy']

            var Form = $$(ids.form);
            if (!Form.validate()) {
               // TODO : Error message

               _logic.formReady();
               _logic.buttonSaveEnable();
               return false;
            }

            var validator = ABApplication.isValid(op, Form.getValues());
            if (validator.fail()) {
               validator.updateForm(Form);
               _logic.formReady();
               _logic.buttonSaveEnable();
               return false;
            }

            // var appName = $$(ids.form).elements['label'].getValue(),
            // 	appDescription = $$(ids.form).elements['description'].getValue();

            // if (!inputValidator.validate(appName)) {
            // 	_logic.buttonSaveEnable();
            // 	return false;
            // }

            // // Prevent duplicate application name
            // if (self.data.filter(function (app) { return app.name.trim().toLowerCase() == appName.trim().replace(/ /g, '_').toLowerCase(); }).length > 0) {
            // 	OP.Dialog.Alert({
            // 		title: labels.component.invalidName,
            // 		text: labels.component.duplicateName.replace("#appName#", appName),
            // 		ok: labels.common.ok
            // 	});

            // 	$$(ids.form).elements['label'].focus();
            // 	_logic.buttonSaveEnable();
            // 	return false;
            // }

            return true;
         },

         /**
          * @function formValues()
          *
          * return an object hash of name:value pairs of the current Form.
          *
          * @return {obj}
          */
         formValues: function() {
            // return the current values of the Form elements.
            return $$(ids.form).getValues();
         },

         /**
          * @function permissionAddNew
          *
          * create a new permission entry based upon the current Application.label
          *
          * This not only adds it to our Permission List, but also selects it.
          *
          * @param {string} appName	The Application.label of the current Application
          */
         permissionAddNew: function(appName) {
            // add new role entry
            $$(ids.appFormPermissionList).add(
               {
                  id: "newRole",
                  name: _logic.permissionName(appName),
                  isApplicationRole: true,
                  markCheckbox: 1
               },
               0
            );

            // Select new role
            var selectedIds = $$(ids.appFormPermissionList).getSelectedId(true);
            selectedIds.push("newRole");
            $$(ids.appFormPermissionList).select(selectedIds);
         },

         /**
          * @function permissionClick
          *
          * Process when a permission entry in the list is clicked.
          */
         permissionClick: function(id, e, node) {
            var List = $$(ids.appFormPermissionList);

            var item = List.getItem(id);

            if (List.getItem(id).isApplicationRole) {
               return;
            }

            if (List.isSelected(id)) {
               item.markCheckbox = 0;
               List.unselect(id);
            } else {
               item.markCheckbox = 1;
               var selectedIds = List.getSelectedId();

               if (typeof selectedIds === "string" || !isNaN(selectedIds)) {
                  if (selectedIds) selectedIds = [selectedIds];
                  else selectedIds = [];
               }

               selectedIds.push(id);

               List.select(selectedIds);

               List.updateItem(id, item);
            }
         },

         /**
          * @function permissionName
          *
          * returns a formatted name for a Permission Role based upon the provided Application.label
          *
          * @param {string} appName	the current value of the Application.label
          * @return {string} 	Permission Role Name.
          */
         permissionName: function(appName) {
            return appName + " Application Role";
         },

         /**
          * @function permissionPopulate
          *
          * fill out the Permission list
          *
          * @param {ABApplication} application	the current ABApplication we are editing
          */
         permissionPopulate: function(application) {
            var PermForm = $$(ids.appFormPermissionList);
            // Get user's roles
            PermForm.showProgress({ type: "icon" });
            async.waterfall(
               [
                  function(next) {
                     OP.Comm.Service.get({
                        url: "/app_builder/user/roles"
                     })
                        .catch(next)
                        .then(function(roles) {
                           // scan the roles and determine if any of them have been created
                           // after the current Application.name:
                           var parsedRoles = roles.map((r) => {
                              if (application) {
                                 if (
                                    r.name ==
                                    _logic.permissionName(
                                       application.name.split("_").join(" ")
                                    )
                                 ) {
                                    r.isApplicationRole = true;
                                 }
                              }
                              return r;
                           });
                           next(null, parsedRoles);
                        });
                  },

                  function(available_roles, next) {
                     if (application && application.id) {
                        application
                           .getPermissions()
                           .then(function(selected_role_ids) {
                              next(null, available_roles, selected_role_ids);
                           })
                           .catch(function(err) {
                              next(err);
                           });
                     } else {
                        next(null, available_roles, []);
                     }
                  },
                  function(available_roles, selected_role_ids, next) {
                     // mark the role(s) in available_roles that is tied
                     // this application:
                     if (application && application.role) {
                        available_roles.forEach(function(r) {
                           if (
                              r.id == (application.role.id || application.role)
                           ) {
                              r.isApplicationRole = true;
                              r.markCheckbox = 1;
                           }
                        });
                     }

                     // Sort permission list
                     available_roles.sort(function(a, b) {
                        return a.isApplicationRole === b.isApplicationRole
                           ? 0
                           : a.isApplicationRole
                           ? -1
                           : 1;
                     });

                     // reload list from our available_roles
                     PermForm.clearAll();
                     PermForm.parse(available_roles);

                     // mark which roles have already been selected
                     if (selected_role_ids && selected_role_ids.length > 0) {
                        // Select permissions
                        PermForm.select(selected_role_ids);
                        available_roles.forEach(function(r) {
                           if (selected_role_ids.indexOf(r.id) > -1) {
                              var item = $$(ids.appFormPermissionList).getItem(
                                 r.id
                              );
                              item.markCheckbox = 1;
                              $$(ids.appFormPermissionList).updateItem(
                                 r.id,
                                 item
                              );
                           }
                        });

                        // Select create role application button
                        var markCreateButton =
                           available_roles.filter(function(r) {
                              return r.isApplicationRole;
                           }).length > 0
                              ? 1
                              : 0;
                        $$(ids.appFormCreateRoleButton).setValue(
                           markCreateButton
                        );
                     }

                     next();
                  }
               ],
               function(err) {
                  if (err) {
                     webix.message(err.message);
                  }

                  PermForm.hideProgress();
               }
            );

            // return appName  + " Application Role";
         },

         /**
          * @function permissionRemoveNew()
          *
          * Intended to be called when the USER unselects the option to create a Permission
          * for this Application.
          *
          * We remove any Permission Role created for this Application.
          */
         permissionRemoveNew: function() {
            // find any roles that are put here from our application form:
            var appRoles = $$(ids.appFormPermissionList).find(function(perm) {
               return perm.isApplicationRole;
            });

            // remove them:
            appRoles.forEach(function(r) {
               $$(ids.appFormPermissionList).remove(r.id);
            });
         },

         /*
          * permissionRenameRole
          *
          * When the name of the Appliction changes, change the Name of the Permission as well.
          *
          * @param {string} newValue  the current name of the application
          * @param {string} oldValue  the previous name of the application
          */
         permissionRenameRole: function(newValue, oldValue) {
            var editRole = $$(ids.appFormPermissionList).find(function(d) {
               return d.name === _logic.permissionName(oldValue);
            });

            editRole.forEach(function(r) {
               var editItem = $$(ids.appFormPermissionList).getItem(r.id);
               editItem.name = _logic.permissionName(newValue);

               $$(ids.appFormPermissionList).updateItem(editItem.id, editItem);
            });
         },

         /**
          * @function permissionSave()
          *
          * step through saving the current Permission Settings and associating
          * them with the current Application.
          *
          * @param {ABApplication} App  	The current Application we are working with.
          * @return {Promise}			.resolve( {Permission} ) if one is created for this App
          */
         permissionSave: function(app) {
            //// REFACTOR:
            // this step implies that ab_choose_form understands the intracies of how
            // ABApplication and Permissions work.
            return new Promise((resolve, reject) => {
               var saveRoleTasks = [],
                  appRole = null;

               //// Process the option to create a newRole For this Application:

               // if the button is set
               if ($$(ids.appFormCreateRoleButton).getValue()) {
                  // check to see if we already have a permission that isApplicationRole
                  var selectedPerms = $$(
                     ids.appFormPermissionList
                  ).getSelectedItem(true);
                  selectedPerms = selectedPerms.filter((perm) => {
                     return perm.isApplicationRole;
                  });

                  // if not, then create one:
                  if (selectedPerms.length == 0) {
                     // Create new role for application
                     saveRoleTasks.push(function(cb) {
                        app.createPermission()
                           .then(function(result) {
                              // remember the Role we just created
                              appRole = result;
                              cb();
                           })
                           .catch(cb);
                     });
                  }
               } else {
                  // Delete any existing application roles
                  saveRoleTasks.push(function(cb) {
                     app.deletePermission()
                        .then(function() {
                           cb();
                        })
                        .catch(cb);
                  });
               }

               //// Now process any additional roles:

               // get array of selected permissions that are not our newRole
               var permItems = $$(ids.appFormPermissionList).getSelectedItem(
                  true
               );
               permItems = permItems.filter(function(item) {
                  return item.id !== "newRole";
               }); // Remove new role item

               // Make sure Application is linked to selected permission items:
               saveRoleTasks.push(function(cb) {
                  // ok, so we removed the 'newRole' entry, but we might
                  // have created an entry for it earlier, if so, add in
                  // the created one here:
                  if ($$(ids.appFormCreateRoleButton).getValue() && appRole) {
                     // make sure it isn't already in there:
                     var appRoleItem = permItems.filter(function(item) {
                        return item.id == appRole.id;
                     });
                     if (!appRoleItem || appRoleItem.length < 1) {
                        // if not, add it :
                        permItems.push({
                           id: appRole.id,
                           isApplicationRole: true
                        });
                     }
                  }

                  // Assign Role Permissions
                  app.assignPermissions(permItems)
                     .then(function() {
                        cb();
                     })
                     .catch(cb);
               });

               async.series(saveRoleTasks, function(err, results) {
                  if (err) {
                     reject(err);
                  } else {
                     // we return the instance of the newly created Permission.
                     resolve(appRole);
                  }
               });
            });

            //// REFACTOR QUESTION:
            // why are we updating the app.permissions with this data structure?
            // where is this data structure being used?
            // Earlier we are using another structure (permissionAddNew()) ... how is that related to this?

            // // Final task
            // saveRoleTasks.push(function (cb) {
            // 	// Update store app data
            // 	var applicationData = self.data.filter(function (d) { return d.id == app.id; });
            // 	applicationData.forEach(function (app) {
            // 		app.attr('permissions', $.map(permItems, function (item) {
            // 			return {
            // 				application: app.id,
            // 				permission: item.id,
            // 				isApplicationRole: item.isApplicationRole
            // 			}
            // 		}));
            // 	});

            // 	q.resolve(appRole);
            // 	cb();
            // })
         },

         /**
          * @function show()
          *
          * Show the Form Component.
          */
         show: function() {
            $$(ids.component).show();
         }
      };
      this._logic = _logic;

      this.actions({
         // initiate a request to create a new Application
         transitionApplicationForm: function(application) {
            // if no application is given, then this should be a [create] operation,

            // so clear our AppList
            if ("undefined" == typeof application) {
               App.actions.unselectApplication();
            }

            // now prepare our form:
            _logic.formReset();
            if (application) {
               // populate Form here:
               _logic.formPopulate(application);
            }
            _logic.permissionPopulate(application);
            _logic.show();
         }
      });
   }
};
