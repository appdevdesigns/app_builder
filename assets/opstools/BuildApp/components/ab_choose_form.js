
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
								_logic.renameApplicationRole(newValue, oldValue);
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

// TODO: if not called from anywhere else, then move the name gathering into .roleListAddNew()
											// Add new app role
											var appName = $$(ids.form).elements["label"].getValue();
											_logic.roleListAddNew(appName);

										}
										else { 

											// Remove app role
											_logic.roleListRemoveNew();
											
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

											_logic.applicationCreate();

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

// TODO:
buttonCreateNewApplication: function() {
	self.resetState();
	self.populateForm();
},

		applicationCreate: function(Application) {

			var newApp = {
				name: appName,
				label: appName,
				description: appDescription
			};

			async.waterfall([
				function (cb) {
					// Create application data
					self.Model.create(newApp)
						.fail(function (err) { cb(err); })
						.then(function (result) {
							if (result.translate) result.translate();

							self.data.push(result);

							cb(null, result);
						});
				},
				function (createdApp, cb) {
					self.savePermissions(createdApp)
						.fail(function (err) { cb(err); })
						.then(function () { cb(); });
				}
			], function (err) {
				_logic.formReady();

				if (err) {
					webix.message({
						type: "error",
						text: self.labels.common.createErrorMessage.replace('{0}', newApp.label)
					});

					AD.error.log('App Builder : Error create application data', { error: err });

					saveButton.enable();

					return;
				}

				$$(self.webixUiids.appListRow).show();

				if ($$(self.webixUiids.appList).hideOverlay)
					$$(self.webixUiids.appList).hideOverlay();

				webix.message({
					type: "success",
					text: self.labels.common.createSuccessMessage.replace('{0}', newApp.label)
				});

				saveButton.enable();

			});
		},

		applicationUpdate: function(Application) {
			async.waterfall([
											function (next) {
												self.savePermissions(updateApp)
													.fail(function (err) { next(err); })
													.then(function (result) { next(null, result); });
											},
											function (app_role, next) {
												// Update application data
												updateApp.attr('label', appName);
												updateApp.attr('description', appDescription);

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

		formPopulate: function(App) {

			var Form = $$(ids.form);

			// Populate data to form
			if (App) {
				FormFields.forEach(function(f){
					if (Form.elements[f]) {
						Form.elements[f].setValue(App[f]);
					}
				})
			}
			

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
					if (App && App.id) {
						App.getPermissions()
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
					// Sort permission list
					if (App && App.role) {
						available_roles.forEach(function (r) {
							var perm = [];

							if (r.id == (App.role.id || App.role))
								r.isApplicationRole = true;
						});
					}
					available_roles.sort(function (a, b) {
						return (a.isApplicationRole === b.isApplicationRole) ? 0 : a.isApplicationRole ? -1 : 1;
					});

					PermForm.clearAll();
					PermForm.parse(available_roles);

					if (selected_role_ids && selected_role_ids.length > 0) {
						// Select permissions
						PermForm.select(selected_role_ids);

						// Select create role application button
						var markCreateButton = available_roles.filter(function (r) { return r.isApplicationRole; }).length > 0 ? 1 : 0;
						$$(ids.appFormCreateRoleButton).setValue(markCreateButton);
					}

					PermForm.hideProgress();
					next();
				}
			], function (err) {
				if (err) {
					webix.message(err.message);
					PermForm.hideProgress();
					return;
				}

			});

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


		formValues: function() {
			// return the current values of the Form elements.
			return $$(ids.form).getValues();

		},


		/*
		 * renameApplicationRole
		 *
		 * When the name of the Appliction changes, change the Name of the Permission as well.
		 *
		 * @param {string} newValue  the current name of the application
		 * @param {string} oldValue  the previous name of the application
		 */
		renameApplicationRole:function( newValue, oldValue) {

			var editRole = $$(ids.appFormPermissionList).find(function (d) { return d.name === _logic.permissionName(oldValue); });

			editRole.forEach(function (r) {
				var editItem = $$(ids.appFormPermissionList).getItem(r.id);
				editItem.name = _logic.permissionName(newValue);

				$$(ids.appFormPermissionList).updateItem(editItem.id, editItem);
			});
		},


		roleListAddNew: function(appName) {

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


		roleListRemoveNew: function() {

			// find any roles that are put here from our application form:
			var appRoles = $$(ids.appFormPermissionList).find(function (perm) { return perm.isApplicationRole; });
			
			// remove them:
			appRoles.forEach(function (r) {
				$$(ids.appFormPermissionList).remove(r.id);
			});
		},


		show:function() {
			$$(ids.formComponent).show();
		},


		permissionName: function(appName) {
			return appName  + " Application Role"; 
		}
	}


	return {
		ui: _ui,
		logic: _logic
	}
})