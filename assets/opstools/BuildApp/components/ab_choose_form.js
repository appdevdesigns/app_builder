
//// LEFT OFF HERE:
// refactor ids
// 

var _ui = {
	id: self.webixUiId.appListFormView,
	scroll: true,
	rows: [
		{
			view: "toolbar",
			cols: [{ view: "label", label: self.labels.application.formHeader, fillspace: true }]
		},
		{
			view: "form",
			id: self.webixUiId.appListForm,
			autoheight: true,
			margin: 0,
			elements: [
				{ type: "section", template: '<span class="webix_icon fa-edit" style="max-width:32px;"></span>Information', margin: 0 },
				{
					name: "label",
					view: "text",
					label: self.labels.common.formName,
					required: true,
					placeholder: self.labels.application.placeholderName,
					labelWidth: 100,
					on: {
						onChange: function (newValue, oldValue) {
							var editRole = $$(self.webixUiId.appFormPermissionList).find(function (d) { return d.name === oldValue + ' Application Role'; });

							editRole.forEach(function (r) {
								var editItem = $$(self.webixUiId.appFormPermissionList).getItem(r.id);
								editItem.name = newValue + ' Application Role';

								$$(self.webixUiId.appFormPermissionList).updateItem(editItem.id, editItem);
							});
						}
					}
				},
				{ name: "description", view: "textarea", label: self.labels.common.formDescription, placeholder: self.labels.application.placeholderDescription, labelWidth: 100, height: 100 },
				{ type: "section", template: '<span class="webix_icon fa-lock" style="max-width:32px;"></span>Permission' },
				{
					view: "toolbar",
					cols: [
						{
							template: "Assign one or more roles to set permissions for user to view this app",
							type: 'header',
							borderless: true
						},
						{
							view: "toggle",
							id: self.webixUiId.appFormCreateRoleButton,
							type: "iconButton",
							width: 300,
							align: "right",
							offIcon: "square-o",
							onIcon: "check-square-o",
							label: "Create a new role to view this app",
							on: {
								onItemClick: function (id, e) {
									if (this.getValue()) {// Add new app role
										var newRoleName = $$(self.webixUiId.appListForm).elements["label"].getValue() + ' Application Role';
										$$(self.webixUiId.appFormPermissionList).add({
											id: 'newRole',
											name: newRoleName,
											isApplicationRole: true
										}, 0);

										// Select new role
										var selectedIds = $$(self.webixUiId.appFormPermissionList).getSelectedId(true);
										selectedIds.push('newRole');
										$$(self.webixUiId.appFormPermissionList).select(selectedIds);
									}
									else { // Remove app role
										var appRoles = $$(self.webixUiId.appFormPermissionList).find(function (perm) { return perm.isApplicationRole; });
										appRoles.forEach(function (r) {
											$$(self.webixUiId.appFormPermissionList).remove(r.id);
										});
									}
								}
							}
						}
					]
				},
				{
					name: "permissions",
					id: self.webixUiId.appFormPermissionList,
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
							view: "button", label: self.labels.common.save, type: "form", width: 100, click: function () {
								var saveButton = this;
								saveButton.disable();

								if (!$$(self.webixUiId.appListForm).validate()) {
									// TODO : Error message

									saveButton.enable();
									return false;
								}

								var appName = $$(self.webixUiId.appListForm).elements['label'].getValue(),
									appDescription = $$(self.webixUiId.appListForm).elements['description'].getValue();

								if (!inputValidator.validate(appName)) {
									saveButton.enable();
									return false;
								}

								// Prevent duplicate application name
								if (self.data.filter(function (app) { return app.name.trim().toLowerCase() == appName.trim().replace(/ /g, '_').toLowerCase(); }).length > 0) {
									webix.alert({
										title: self.labels.application.invalidName,
										text: self.labels.application.duplicateName.replace("#appName#", appName),
										ok: self.labels.common.ok
									});

									$$(self.webixUiId.appListForm).elements['label'].focus();
									saveButton.enable();
									return false;
								}

								$$(self.webixUiId.appListForm).showProgress({ type: 'icon' });

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
										$$(self.webixUiId.appListForm).hideProgress();

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
OP.UI.extend('ab_choose_form', _ui);





var _logic = {

	init: function() {
		webix.extend($$(self.webixUiId.appListForm), webix.ProgressBar);
		webix.extend($$(self.webixUiId.appFormPermissionList), webix.ProgressBar);
	},

	buttonCreateNewApplication: function() {
		self.resetState();
		self.populateForm();
	},

	loadData:function(){

		console.log('... should load application data now.')
	}
}
OP.Logic.extend('ab_choose_form', _logic);


