
/*
 * AB Choose Form
 *
 * Display the form for creating a new Application.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		formHeader : L('ab.application.form.header', "*Application Info"),
		placeholderName : L('ab.application.form.placeholderName', "*Application name"),
		placeholderDescription : L('ab.application.form.placeholderDescription', "*Application description"),

		sectionPermission : L('ab.application.form.sectionPermission', "*Permission"),
		permissionHeader : L('ab.application.form.headerPermission',  "*Assign one or more roles to set permissions for user to view this app"),
		createNewRole : L('ab.application.form.createNewRoleButton', "*Create a new role to view this app"),
	}
}



OP.Component.extend('ab_choose_form', function(App) {

	labels.common = App.labels.common;

	var id = {
		formComponent: App.unique('ab-app-list-form-view'),
		form: App.unique('ab-app-list-form'),
		appFormPermissionList: App.unique('ab-app-form-permission'),
		appFormCreateRoleButton: App.unique('ab-app-form-create-role'),

		saveButton: App.unique('ab-app-form-button-save')
	}


	var _ui = {
		id: id.formComponent,
		scroll: true,
		rows: [
			{
				view: "toolbar",
				cols: [{ view: "label", label: labels.application.formHeader, fillspace: true }]
			},
			{
				view: "form",
				id: id.form,
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
								id: id.appFormCreateRoleButton,
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
											var appName = $$(id.form).elements["label"].getValue();
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
						id: id.appFormPermissionList,
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
								id: id.saveButton,
								view: "button", label: labels.common.save, type: "form", width: 100, click: function () {
									
// TODO: 
									_logic.buttonSaveDisable();
									if (_logic.formValidate()) {

									// 	if (updateApp) {
									// 		_logic.applicationUpdate();
									// 	} else {
									// 		_logic.applicationCreate();
									// 	}
									}



									

									_logic.formBusy();

									var selectedId = $$(self.webixUiId.appList).getSelectedId();
									var updateApp = self.data.filter(function (d) { return d.id == selectedId })[0];

									if (updateApp) { // Update
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
											$$(self.webixUiId.appListForm).hideProgress();

											if (err) {
												webix.message({
													type: "error",
													text: self.labels.common.updateErrorMessage.replace('{0}', updateApp.attr('label'))
												});

												AD.error.log('App Builder : Error update application data', { error: err });

												saveButton.enable();
												return false;
											}

											$$(self.webixUiId.appListRow).show();

											webix.message({
												type: "success",
												text: self.labels.common.updateSucessMessage.replace('{0}', updateApp.attr('label'))
											});

											saveButton.enable();

										});
									} else { // Create
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

											$$(self.webixUiId.appListRow).show();

											if ($$(self.webixUiId.appList).hideOverlay)
												$$(self.webixUiId.appList).hideOverlay();

											webix.message({
												type: "success",
												text: self.labels.common.createSuccessMessage.replace('{0}', newApp.label)
											});

											saveButton.enable();

										});
									}
								}
							},
							{
								view: "button", value: self.labels.common.cancel, width: 100, click: function () {
									self.resetState();
									$$(self.webixUiId.appListRow).show();
								}
							}
						]
					}
				]
			}
		]
	};




	var _logic = {

		init: function() {
			webix.extend($$(id.form), webix.ProgressBar);
			webix.extend($$(id.appFormPermissionList), webix.ProgressBar);
		},

// TODO:
buttonCreateNewApplication: function() {
	self.resetState();
	self.populateForm();
},


		buttonSaveDisable:function() {
			$$(id.saveButton).disable();
		},


		buttonSaveEnable:function() {
			$$(id.saveButton).enable();
		},

		formBusy: function() {
			$$(id.form).showProgress({ type: 'icon' });
		},

		formReady: function() {
			$$(id.form).hideProgress();
		}

		formValidate:function() {
			if (!$$(id.form).validate()) {
				// TODO : Error message

				_logic.buttonSaveEnable();
				return false;
			}

			var appName = $$(id.appListForm).elements['label'].getValue(),
				appDescription = $$(id.appListForm).elements['description'].getValue();

			if (!inputValidator.validate(appName)) {
				_logic.buttonSaveEnable();
				return false;
			}

			// Prevent duplicate application name
			if (self.data.filter(function (app) { return app.name.trim().toLowerCase() == appName.trim().replace(/ /g, '_').toLowerCase(); }).length > 0) {
				OP.Dialog.Alert({
					title: labels.application.invalidName,
					text: labels.application.duplicateName.replace("#appName#", appName),
					ok: labels.common.ok
				});

				$$(id.form).elements['label'].focus();
				_logic.buttonSaveEnable();
				return false;
			}

			return true;
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

			var editRole = $$(id.appFormPermissionList).find(function (d) { return d.name === _logic.permissionName(oldValue); });

			editRole.forEach(function (r) {
				var editItem = $$(id.appFormPermissionList).getItem(r.id);
				editItem.name = _logic.permissionName(newValue);

				$$(id.appFormPermissionList).updateItem(editItem.id, editItem);
			});
		},


		roleListAddNew: function(appName) {

			// add new role entry
			$$(id.appFormPermissionList).add({
				id: 'newRole',
				name: _logic.permissionName(appName),
				isApplicationRole: true
			}, 0);


			// Select new role
			var selectedIds = $$(id.appFormPermissionList).getSelectedId(true);
			selectedIds.push('newRole');
			$$(id.appFormPermissionList).select(selectedIds);

		},


		roleListRemoveNew: function() {

			// find any roles that are put here from our application form:
			var appRoles = $$(id.appFormPermissionList).find(function (perm) { return perm.isApplicationRole; });
			
			// remove them:
			appRoles.forEach(function (r) {
				$$(id.appFormPermissionList).remove(r.id);
			});
		}


		permisionName: function(appName) {
			return appName  + " Application Role"; 
		}
	}


	return {
		ui: _ui,
		logic: _logic
	}
})