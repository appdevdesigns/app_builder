
/*
 * AB Choose Form
 *
 * Display the form for creating a new Application.
 *
 */

import ABApplication from "../classes/ABApplication"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		formHeader: L('ab.application.form.header', "*Application Info"),
		placeholderName: L('ab.application.form.placeholderName', "*Application name"),
		placeholderDescription: L('ab.application.form.placeholderDescription', "*Application description"),

		sectionPermission: L('ab.application.form.sectionPermission', "*Permission"),
		permissionHeader: L('ab.application.form.headerPermission',  "*Assign one or more roles to set permissions for user to view this app"),
		createNewRole: L('ab.application.form.createNewRoleButton', "*Create a new role to view this app"),

		invalidName: L('ab.application.invalidName', "*This application name is invalid"),
		duplicateName: L('ab.application.duplicateName', "*Name must be unique."),

	}
}



OP.Component.extend('ab_choose_form', function(App) {

	labels.common = App.labels.common;

	var ids = {
		formComponent: App.unique('ab-app-list-form-view'),
		form: App.unique('ab-app-list-form'),
		appFormPermissionList: App.unique('ab-app-form-permission'),
		appFormCreateRoleButton: App.unique('ab-app-form-create-role'),

		saveButton: App.unique('ab-app-form-button-save')
	}


	var _ui = {
		id: ids.formComponent,
		scroll: true,
		rows: [
			{
				view: "toolbar",
				cols: [{ view: "label", label: labels.application.formHeader, fillspace: true }]
			},
			{
				view: "form",
				id: ids.form,
				autoheight: true,
				margin: 0,
				elements: [
					{ type: "section", template: '<span class="webix_icon fa-edit" style="max-width:32px;"></span>Information', margin: 0 },
					{
						name: "label",
						view: "text",
						label: labels.common.formName,
						required: true,
						placeholder: labels.application.placeholderName,
						labelWidth: 100,
						on: {
							onChange: function (newValue, oldValue) {
								_logic.permissionRenameRole(newValue, oldValue);
							}
						}
					},
					{ name: "description", view: "textarea", label: labels.common.formDescription, placeholder: labels.application.placeholderDescription, labelWidth: 100, height: 100 },
					{ type: "section", template: '<span class="webix_icon fa-lock" style="max-width:32px;"></span>'+labels.application.sectionPermission },
					{
						view: "toolbar",
						cols: [
							{
								template: labels.application.permissionHeader, 
								type: 'header',
								borderless: true
							},
							{
								view: "toggle",
								id: ids.appFormCreateRoleButton,
								type: "iconButton",
								width: 300,
								align: "right",
								offIcon: "square-o",
								onIcon: "check-square-o",
								label: labels.application.createNewRole, 
								on: {
									onItemClick: function (id, e) {
										if (this.getValue()) {

// TODO: if not called from anywhere else, then move the name gathering into .permissionAddNew()
											// Add new app role
											var appName = $$(ids.form).elements["label"].getValue();
											_logic.permissionAddNew(appName);

										}
										else { 

											// Remove app role
											_logic.permissionRemoveNew();
											
										}
									}
								}
							}
						]
					},
					{
						name: "permissions",
						id: ids.appFormPermissionList,
						view: "list",
						height: 130,
						autowidth: true,
						borderless: true,
						margin: 0,
						css: "ab-app-form-permission",
						scroll: "y",
						template: "#name#",
						on: {
							onItemClick: function (id, e, node) {
								if (this.getItem(id).isApplicationRole) {
									return;
								}

								if (this.isSelected(id)) {
									this.unselect(id);
								}
								else {
									var selectedIds = this.getSelectedId();

									if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
										if (selectedIds)
											selectedIds = [selectedIds];
										else
											selectedIds = [];
									}

									selectedIds.push(id);

									this.select(selectedIds);
								}
							}
						}
					},
					{ height: 5 },
					{
						margin: 5, cols: [
							{ fillspace: true },
							{
								id: ids.saveButton,
								view: "button", label: labels.common.save, type: "form", width: 100, 
								click: function () {
									
									_logic.buttonSaveDisable();
									_logic.formBusy();

									// if there is a selected Application, then this is an UPDATE
									var updateApp = App.actions.getSelectedApplication();
									if (updateApp) { 

										if (_logic.formValidate('update')) {

											_logic.applicationUpdate(updateApp);

										}
										
									} else { 

										// else this is a Create
										if (_logic.formValidate('add')) {

											_logic.applicationCreate(_logic.formValues());

										}

									}
									
	
								} // end click()
							},
							{
								view: "button", value: labels.common.cancel, width: 100, 
								click: function () {
									_logic.cancel();
								}
							}
						]
					}
				]
			}
		]
	};

	const FormFields = ['label', 'description'];


	var _logic = {

		init: function() {
			webix.extend($$(ids.form), webix.ProgressBar);
			webix.extend($$(ids.appFormPermissionList), webix.ProgressBar);
		},



//// LEFT OFF HERE:
//// filling out applicationCreate() with new ABApplication object format.
// next: 
// [] applicationUpdate()

		applicationCreate: function(values) {

			var newApp = {
				name: values.label,
				label: values.label,
				description: values.description
			};

			async.waterfall([
				function (cb) {
					// Create application data
					ABApplication.create(newApp)
						.then(function (result) {
	
// self.data.push(result);

							cb(null, result);
						})
						.catch(cb);
				},
				function (createdApp, cb) {
					_logic.permissionSave(createdApp)
						.then(function () { cb(); })
						.catch(cb)
				}
			], function (err) {
				_logic.formReady();

				if (err) {
					webix.message({
						type: "error",
						text: labels.common.createErrorMessage.replace('{0}', values.label)
					});

					AD.error.log('App Builder : Error create application data', { error: err });

					_logic.buttonSaveEnable();

					return;
				}

// TODO: alert of a Data Refresh

				App.actions.transitionApplicationList();

// if ($$(self.webixUiids.appList).hideOverlay)
// 	$$(self.webixUiids.appList).hideOverlay();

				webix.message({
					type: "success",
					text: labels.common.createSuccessMessage.replace('{0}', values.label)
				});

				_logic.buttonSaveEnable();

			});
		},

		applicationUpdate: function(Application) {
			var values = _logic.formValues();

			async.waterfall([
				function (next) {
					_logic.permissionSave(Application)
						.then(function (result) { next(null, result); })
						.catch(next);
				},
				function (app_role, next) {
					// Update application data
					Application.label = values.label;
					Application.description = values.description;

					if (app_role && app_role.id)
						updateApp.attr('role', app_role.id);
					else
						updateApp.attr('role', null);

					updateApp.save()
						.fail(function (err) { next(err); })
						.then(function (result) {
							var existApp = self.data.filter(function (item, index, list) {
								return item.id === result.id;
							})[0];

							if (result.translate) result.translate();

							existApp.attr('name', result.name);
							existApp.attr('label', result.label);
							existApp.attr('description', result.description);

							next(null, result.id);
						});
				}
										], function (err) {
											$$(self.webixUiids.appListForm).hideProgress();

											if (err) {
												webix.message({
													type: "error",
													text: self.labels.common.updateErrorMessage.replace('{0}', updateApp.attr('label'))
												});

												AD.error.log('App Builder : Error update application data', { error: err });

												saveButton.enable();
												return false;
											}

											$$(self.webixUiids.appListRow).show();

											webix.message({
												type: "success",
												text: self.labels.common.updateSucessMessage.replace('{0}', updateApp.attr('label'))
											});

											saveButton.enable();

										});
		},


		buttonSaveDisable:function() {
			$$(ids.saveButton).disable();
		},


		buttonSaveEnable:function() {
			$$(ids.saveButton).enable();
		},


		cancel: function() {
									
			_logic.formReset();
			App.actions.transitionApplicationList();
		},

		formBusy: function() {
			$$(ids.form).showProgress({ type: 'icon' });
		},

		formPopulate: function(application) {

			var Form = $$(ids.form);

			// Populate data to form
			if (application) {
				FormFields.forEach(function(f){
					if (Form.elements[f]) {
						Form.elements[f].setValue(application[f]);
					}
				})
			}
			
			// _logic.permissionPopulate(application);

		},

		formReady: function() {
			$$(ids.form).hideProgress();
		},


		formReset: function() {
			$$(ids.form).clear();
			$$(ids.form).clearValidation();
			// $$(self.webixUiids.appFormPermissionList).clearValidation();
			// $$(self.webixUiids.appFormPermissionList).clearAll();
			// $$(self.webixUiids.appFormCreateRoleButton).setValue(0);
		},



		formValidate:function(op) {
			// op : ['add', 'update', 'destroy']

			var Form = $$(ids.form);
			if (!Form.validate()) {
				// TODO : Error message

				_logic.buttonSaveEnable();
				return false;
			}


			var errors = ABApplication.isValid(op, Form.getValues());
			if (errors.length > 0) {
				var hasFocused = false;
				errors.forEach(function(err){
					Form.markInvalid(err.name, labels.application[err.mlKey] || err.defaultText );
					if (!hasFocused && Form.elements[err.name]) {
						Form.elements[err.name].focus();
						hasFocused = true;
					}
				})
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
			// 		title: labels.application.invalidName,
			// 		text: labels.application.duplicateName.replace("#appName#", appName),
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
			$$(ids.appFormPermissionList).add({
				id: 'newRole',
				name: _logic.permissionName(appName),
				isApplicationRole: true
			}, 0);


			// Select new role
			var selectedIds = $$(ids.appFormPermissionList).getSelectedId(true);
			selectedIds.push('newRole');
			$$(ids.appFormPermissionList).select(selectedIds);

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
			return appName  + " Application Role"; 
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
			PermForm.showProgress({ type: 'icon' });
			async.waterfall([
				function (next) {
					AD.comm.service.get({ url: '/app_builder/user/roles' })
						.fail(function (err) { next(err); })
						.done(function (roles) {
							next(null, roles);
						});
				},
				function (available_roles, next) {
					if (application && application.id) {
						application.getPermissions()
							.then(function (selected_role_ids) {
								next(null, available_roles, selected_role_ids);
							})
							.catch(function (err) { next(err); });
					}
					else {
						next(null, available_roles, []);
					}

				},
				function (available_roles, selected_role_ids, next) {
					
					// mark the role(s) in available_roles that is tied 
					// this application:
					if (application && application.role) {
						available_roles.forEach(function (r) {
		
							if (r.id == (application.role.id || application.role))
								r.isApplicationRole = true;
						});
					}

					// Sort permission list
					available_roles.sort(function (a, b) {
						return (a.isApplicationRole === b.isApplicationRole) ? 0 : a.isApplicationRole ? -1 : 1;
					});

					// reload list from our available_roles
					PermForm.clearAll();
					PermForm.parse(available_roles);

					// mark which roles have already been selected
					if (selected_role_ids && selected_role_ids.length > 0) {
						// Select permissions
						PermForm.select(selected_role_ids);

						// Select create role application button
						var markCreateButton = available_roles.filter(function (r) { return r.isApplicationRole; }).length > 0 ? 1 : 0;
						$$(ids.appFormCreateRoleButton).setValue(markCreateButton);
					}

					next();
				}
			], function (err) {
				if (err) {
					webix.message(err.message);
				}

				PermForm.hideProgress();

			});

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
			var appRoles = $$(ids.appFormPermissionList).find(function (perm) { return perm.isApplicationRole; });
			
			// remove them:
			appRoles.forEach(function (r) {
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
		permissionRenameRole:function( newValue, oldValue) {

			var editRole = $$(ids.appFormPermissionList).find(function (d) { return d.name === _logic.permissionName(oldValue); });

			editRole.forEach(function (r) {
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
		permissionSave: function (App) {
//// REFACTOR:
// this step implies that ab_choose_form understands the intracies of how
// ABApplication and Permissions work.  
			return new Promise(
				(resolve, reject) => {

					var saveRoleTasks = []
						appRole;

					//// Process the option to create a newRole For this Application:

					// if the button is set
					if ($$(ids.appFormCreateRoleButton).getValue()) {

						// Create new role for application
						saveRoleTasks.push(function (cb) {
							App.createPermission()
								.then(function (result) {

									// remember the Role we just created
									appRole = result;	
									cb();
								})
								.catch(cb)
						});
					}
					else {
						// Delete any existing application roles
						saveRoleTasks.push(function (cb) {
							App.deletePermission()
								.then(function () { cb(); })
								.catch(cb)
								
						});
					}

					//// Now process any additional roles:

					// get array of selected permissions that are not our newRole
					var permItems = $$(ids.appFormPermissionList).getSelectedItem(true);
					permItems = permItems.filter( function (item) { return item.id !== 'newRole'; }); // Remove new role item


					// Make sure Application is linked to selected permission items:
					saveRoleTasks.push(function (cb) {

						// ok, so we removed the 'newRole' entry, but we might 
						// have created an entry for it earlier, if so, add in  
						// the created one here:
						if ($$(ids.appFormCreateRoleButton).getValue() && appRole) {

							// make sure it isn't already in there:
							var appRoleItem = permItems.filter( function (item) { return item.id == appRole.id; });
							if (!appRoleItem || appRoleItem.length < 1) {

								// if not, add it :
								permItems.push({
									id: appRole.id,
									isApplicationRole: true
								});
							}
						}


						// Assign Role Permissions
						App.assignPermissions(permItems)
							.then(function () { cb(); })
							.catch(cb)
					});



					async.series(saveRoleTasks, function(err, results) {
						if (err) {
							reject(err);
						} else {
							// we return the instance of the newly created Permission.
							resolve(appRole);  
						}
					});
				}
			);


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
		show:function() {
			$$(ids.formComponent).show();
		}
	}







	// Expose any globally accessible Actions:
	var _actions = {

		// initiate a request to create a new Application
		populateApplicationForm:function(Application){
			
			_logic.formReset();
			if (Application) {
				// populate Form here:
				_logic.formPopulate(Application);
			}
			_logic.permissionPopulate(Application);
			_logic.show();
		}

	}


	return {
		ui: _ui,
		init: _logic.init,
		actions:_actions
	}
})