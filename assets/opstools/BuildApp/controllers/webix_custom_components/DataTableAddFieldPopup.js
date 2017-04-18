steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	'opstools/BuildApp/controllers/utils/InputValidator.js',
	function (dataFieldsManager, inputValidator) {
		var data = {},
			componentIds = {
				chooseTypeMenu: 'ab-new-type-menu',

				labelNameText: 'ab-new-label-name',

				saveButton: 'ab-new-save-button'
			},
			labels = {
				common: {
					name: AD.lang.label.getLabel('ab.common.name') || 'Name',
					headerName: AD.lang.label.getLabel('ab.common.headerName') || 'Header name',
					ok: AD.lang.label.getLabel('ab.common.ok') || "Ok",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel",
					save: AD.lang.label.getLabel('ab.common.save') || "Save"
				},
				add_fields: {
					chooseType: AD.lang.label.getLabel('ab.add_fields.chooseType') || "Choose field type...",

					label: AD.lang.label.getLabel('ab.add_fields.label') || 'Label',

					addNewField: AD.lang.label.getLabel('ab.add_fields.addNewField') || "Add Column",

					registerTableWarning: AD.lang.label.getLabel('ab.add_fields.registerTableWarning') || "Please register the datatable to add.",

					duplicateFieldTitle: AD.lang.label.getLabel('ab.add_fields.duplicateFieldTitle') || "Your field name is duplicate",
					duplicateFieldDescription: AD.lang.label.getLabel('ab.add_fields.duplicateFieldDescription') || "Please change your column name",

					cannotUpdateFields: AD.lang.label.getLabel('ab.add_fields.cannotUpdateFields') || "Could not update columns",
					waitRestructureObjects: AD.lang.label.getLabel('ab.add_fields.waitRestructureObjects') || "Please wait until restructure objects is complete"
				}
			},
			editDefinitions = dataFieldsManager.getEditDefinitions();

		webix.protoUI({
			name: 'add_fields_popup',
			$init: function (config) {
			},
			defaults: {
				modal: true,
				maxHeight: 420,
				ready: function () {
					this.resetState();
				},
				body: {
					css: 'ab-add-fields-popup',
					borderless: true,
					width: 380,
					paddingX: 17,
					rows: [
						{
							view: "menu",
							id: componentIds.chooseTypeMenu,
							minWidth: 500,
							autowidth: true,
							data: [{
								value: labels.add_fields.chooseType,
								submenu: dataFieldsManager.getFieldMenuList()
							}],
							click: function () {
								var subMenuId = $$(componentIds.chooseTypeMenu).config.data[0].submenu;

								// #HACK Sub-menu popup does not render on initial
								// Force it to render popup by use .getSubMenu()
								if (typeof subMenuId != 'string') {
									$$(componentIds.chooseTypeMenu).getSubMenu($$(componentIds.chooseTypeMenu).config.data[0].id);
									subMenuId = $$(componentIds.chooseTypeMenu).config.data[0].submenu;
								}

								if ($$(subMenuId))
									$$(subMenuId).show();
							},
							on: {
								onMenuItemClick: function (id) {
									var base = this.getTopParentView(),
										selectedMenuItem = this.getMenuItem(id);

									base.showFieldData(selectedMenuItem.fieldName);
								}
							}
						},
						{ height: 10 },
						{ cells: editDefinitions },
						{ height: 10 },
						{
							cols: [
								{
									view: "button", id: componentIds.saveButton, label: labels.add_fields.addNewField, type: "form", width: 120, click: function () {
										var self = this;

										self.disable();

										var base = self.getTopParentView(),
											dataTable = base.dataTable,
											fieldInfo = dataFieldsManager.getSettings(base.fieldName);

										if (!dataTable) {
											webix.message({ type: "error", text: labels.add_fields.registerTableWarning });
											self.enable();
											return;
										}

										if (!fieldInfo) {
											webix.alert({
												title: 'Field info error',
												text: 'System could not get this field information ',
												ok: labels.common.ok
											});
											self.enable();
											return;
										}

										if (!inputValidator.validateFormat(fieldInfo.name)) {
											self.enable();
											return;
										}

										// Validate duplicate field name
										var existsColumn = $.grep(dataTable.config.columns, function (c) { return c.id == fieldInfo.name.replace(/ /g, '_'); });
										if (existsColumn && existsColumn.length > 0 && !data.editFieldId) {
											webix.alert({
												title: labels.add_fields.duplicateFieldTitle,
												text: labels.add_fields.duplicateFieldDescription,
												ok: labels.common.ok
											});
											this.enable();
											return;
										}

										if (fieldInfo.weight == null)
											fieldInfo.weight = dataTable.config.columns.length;

										// Call callback function
										if (base.saveFieldCallback && base.fieldName) {
											base.saveFieldCallback(base.fieldName, fieldInfo)
												.then(function () {
													self.enable();
													base.resetState();
													base.hide();
												});
										}

									}
								},
								{
									view: "button", value: labels.common.cancel, width: 100, click: function () {
										this.getTopParentView().resetState();
										this.getTopParentView().hide();
									}
								}
							]
						}
					]
				},
				on: {
					onBeforeShow: function () {
						this.resetState();
					},
					onShow: function () {
						if (!AD.comm.isServerReady()) {
							this.getTopParentView().hide();

							webix.alert({
								title: labels.add_fields.cannotUpdateFields,
								text: labels.add_fields.waitRestructureObjects,
								ok: labels.common.ok
							});
						}
						else { // Set default field type
							this.showFieldData('string');
						}
					},
					onHide: function () {
						this.resetState();
					}
				}
			},

			registerDataTable: function (dataTable) {
				this.dataTable = dataTable;
			},

			registerSaveFieldEvent: function (saveFieldCallback) {
				this.saveFieldCallback = saveFieldCallback;
			},

			registerCreateNewObjectEvent: function (createNewObjectEvent) {
				this.createNewObjectEvent = createNewObjectEvent;
			},

			showFieldData: function (fieldName) {
				var viewName = dataFieldsManager.getEditViewId(fieldName);

				if (viewName) {
					dataFieldsManager.populateSettings(AD.classes.AppBuilder.currApp, {
						fieldName: fieldName,
						name: this.getDefaultFieldName(), // Set default field name
						label: this.getDefaultFieldName()
					});

					$$(viewName).show();

					// Highlight name in text box
					$('.' + componentIds.labelNameText + ' input[type="text"]').select();

					this.fieldName = fieldName;
				}
			},

			editMode: function (info) {
				this.fieldName = info.fieldName;

				$$(componentIds.chooseTypeMenu).hide();

				$$(componentIds.saveButton).define('label', labels.common.save);
				$$(componentIds.saveButton).refresh();

				data.editFieldId = info.id;

				// Get view name
				var viewName = dataFieldsManager.getEditViewId(info.fieldName);

				// Populate data
				dataFieldsManager.populateSettings(AD.classes.AppBuilder.currApp, info);

				$$(viewName).show();

				// Highlight name in text box
				$('.' + componentIds.labelNameText + ' input[type="text"]').select();
			},

			resetState: function () {
				data.editFieldId = null;

				$$(componentIds.saveButton).define('label', labels.add_fields.addNewField);
				$$(componentIds.saveButton).refresh();
				$$('ab-new-singleText').show(); // Show 'string' data field to default
				$$(componentIds.chooseTypeMenu).show();

				dataFieldsManager.resetState();
			},

			getDefaultFieldName: function () {
				var runningNumber = 1;

				if (this.dataTable)
					runningNumber = this.dataTable.config.columns.length || 1;

				return 'Field ' + runningNumber;
			}

		}, webix.ui.popup);

	}
);