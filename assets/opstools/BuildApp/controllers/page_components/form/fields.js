steal(function () {
	var componentIds = {
		propertyView: 'ab-form-fields-property-view',

		editTitle: 'ab-form-edit-title',
		editDescription: 'ab-form-edit-description',
		selectObject: 'ab-form-select-object',
		linkedTo: 'ab-form-linked-to',
		linkField: 'ab-form-link-field',
		selectColCount: 'ab-form-select-column-count',
		afterSave: 'ab-form-save-go-to',
		isSaveVisible: 'ab-form-save-visible',
		saveLabel: 'ab-form-save-text',
		isCancelVisible: 'ab-form-cancel-visible',
		cancelLabel: 'ab-form-cancel-text',

		clearOnLoad: 'ab-form-clear-on-load',
		clearOnSave: 'ab-form-clear-on-save',
		whenByGroup: 'ab-from-when-by-group',

	};

	var fields_tab = function () {
		var self = this;

		self.getEditView = function (form) {
			return form;
		};

		self.getPropertyView = function (componentManager) {
			return {
				view: "property",
				id: componentIds.propertyView,
				nameWidth: 110,
				elements: [
					{ label: "Header", type: "label" },
					{
						id: componentIds.editTitle,
						name: 'title',
						type: 'text',
						label: 'Title'
					},
					{
						id: componentIds.editDescription,
						name: 'description',
						type: 'text',
						label: 'Description'
					},
					{ label: "Data source", type: "label" },
					{
						id: componentIds.selectObject,
						name: 'object',
						type: 'richselect',
						label: 'Object',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedData && selectedData.length > 0)
								return selectedData[0].value;
							else
								return "[Select]";
						}
					},
					{
						id: componentIds.linkedTo,
						name: 'linkedTo',
						type: 'richselect',
						label: 'Linked to',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedData && selectedData.length > 0)
								return selectedData[0].value;
							else
								return "[none]";
						}
					},
					{
						id: componentIds.linkField,
						name: 'linkField',
						type: 'richselect',
						label: 'Link field',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedData && selectedData.length > 0)
								return selectedData[0].value;
							else
								return "";
						}
					},
					{ label: "Misc", type: "label" },
					{
						id: componentIds.selectColCount,
						name: 'colCount',
						type: 'richselect',
						label: 'Column Count',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedData && selectedData.length > 0)
								return selectedData[0].value;
							else
								return "[Select]";
						}
					},
					{ label: "Actions", type: "label" },
					{
						id: componentIds.isSaveVisible,
						name: 'save',
						type: 'richselect',
						label: 'Save',
						options: [
							{ id: 'show', value: "Yes" },
							{ id: 'hide', value: "No" },
						]
					},
					{
						id: componentIds.afterSave,
						name: 'afterSave',
						type: 'richselect',
						label: 'After save',
						template: function (data, dataValue) {
							var goToPage = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (goToPage && goToPage.length > 0)
								return goToPage[0].value;
							else
								return "[Go To]";
						}
					},
					{
						id: componentIds.saveLabel,
						name: 'saveLabel',
						type: 'text',
						label: 'Save label'
					},
					{
						id: componentIds.isCancelVisible,
						name: 'cancel',
						type: 'richselect',
						label: 'Cancel',
						options: [
							{ id: 'show', value: "Yes" },
							{ id: 'hide', value: "No" },
						]
					},
					{
						id: componentIds.cancelLabel,
						name: 'cancelLabel',
						type: 'text',
						label: 'Cancel label'
					},
					{ label: "Data selection", type: "label" },
					{
						id: componentIds.clearOnLoad,
						name: 'clearOnLoad',
						type: 'richselect',
						label: 'Clear on load',
						options: [
							{ id: 'yes', value: "Yes" },
							{ id: 'no', value: "No" },
						]
					},
					{
						id: componentIds.clearOnSave,
						name: 'clearOnSave',
						type: 'richselect',
						label: 'Clear on save',
						options: [
							{ id: 'yes', value: "Yes" },
							{ id: 'no', value: "No" },
						]
					},
					{
						id: componentIds.whenByGroup,
						name: 'whenByGroup',
						type: 'richselect',
						label: 'When by Group',
						options: [
							{ id: 'add', value: "Add" }
							// ,{ id: 'update', value: "Update" },
						]
					}
				],
				on: {
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (ignoreUpdate || state.old == state.value) return false;

						var viewId = componentIds.editForm,
							propertyValues = $$(componentIds.propertyView).getValues();

						switch (editor.id) {
							case componentIds.editTitle:
								if ($$(componentIds.title))
									$$(componentIds.title).setValue(propertyValues[componentIds.editTitle]);
								break;
							case componentIds.editDescription:
								if ($$(componentIds.description))
									$$(componentIds.description).setValue(propertyValues[componentIds.editDescription]);
								break;
							case componentIds.selectObject:
								propertyValues[componentIds.linkedTo] = null;
							case componentIds.linkedTo:
								var linkedTo = propertyValues[componentIds.linkedTo],
									linkedField = $$(componentIds.propertyView).getItem(componentIds.linkField);

								if (linkedTo && linkedTo != 'none') {
									linkedField.options = componentManager.editInstance.data.columns
										.filter(function (col) { return col.setting.linkObject == linkedTo; })
										.map(function (col) {
											return {
												id: col.id,
												value: col.label
											}
										}).attr();

									propertyValues[componentIds.linkField] = linkedField.options[0].id; // Default selection
								} else {
									linkedField.options = [];
									linkedField.hidden = true;
									propertyValues[componentIds.linkField] = null;
								}
								$$(componentIds.propertyView).setValues(propertyValues);
							case componentIds.linkField:
							case componentIds.selectColCount:
							case componentIds.isSaveVisible:
							case componentIds.isCancelVisible:
								var setting = self.getSettings();
								// TODO populate parameters
								self.populateSettings(setting, true);
								break;
						}
					}
				}
			}
		};

		self.getSettings = function () {
			var propertyValues = $$(componentIds.propertyView).getValues(),
				visibleFieldIds = [];

			// var formValues = $$(componentIds.editForm).getValues();
			// for (var key in formValues) {
			// 	if (formValues[key] === 'show') {
			// 		visibleFieldIds.push(key);
			// 	}
			// }

			var settings = {
				title: propertyValues[componentIds.editTitle],
				description: propertyValues[componentIds.editDescription] || '',
				object: propertyValues[componentIds.selectObject] || '', // ABObject.id
				linkedTo: propertyValues[componentIds.linkedTo] || '', // ABObject.id
				linkField: propertyValues[componentIds.linkField] || '', // ABColumn.id
				colCount: propertyValues[componentIds.selectColCount] || '',
				visibleFieldIds: visibleFieldIds, // [ABColumn.id]
				saveVisible: propertyValues[componentIds.isSaveVisible],
				afterSave: propertyValues[componentIds.afterSave],
				saveLabel: propertyValues[componentIds.saveLabel] || 'Save',
				cancelVisible: propertyValues[componentIds.isCancelVisible],
				cancelLabel: propertyValues[componentIds.cancelLabel] || 'Cancel',
				clearOnLoad: propertyValues[componentIds.clearOnLoad],
				clearOnSave: propertyValues[componentIds.clearOnSave],
				whenByGroup: propertyValues[componentIds.whenByGroup]
			};

			return settings;
		};

		self.populateSettings = function (setting, showAll, application, dataCollection, linkedToDataCollection, columns, pages) {
			if (pages) {
				var afterSave = $$(componentIds.propertyView).getItem(componentIds.afterSave);
				afterSave.options = pages.map(function (p) {
					return {
						id: p.id,
						value: p.label
					};
				}).attr();

				afterSave.options.splice(0, 0, {
					id: null,
					value: '[Go To]'
				});
			}

			// Misc - Column
			var colCountOptions = [1, 2, 3];
			var colCountSource = $$(componentIds.propertyView).getItem(componentIds.selectColCount);
			colCountSource.options = $.map(colCountOptions, function (o) {
				return {
					id: o,
					value: o
				};
			});

			if (application != null && application.objects != null) {

				// Data source - Object
				var objectList = $$(componentIds.propertyView).getItem(componentIds.selectObject);
				objectList.options = $.map(application.objects, function (o) {
					return {
						id: o.id,
						value: o.label
					};
				});

				// Data source - Linked to
				var linkedObjIds = columns
					.filter(function (col) {
						return col.setting.linkObject != null && col.setting.linkType == 'model' && col.setting.linkViaType == 'collection';
					})
					.map(function (col) { return col.setting.linkObject });

				var linkedObjs = application.objects.filter(function (obj) { return linkedObjIds.indexOf(obj.id.toString()) > -1; });
				var linkedToItem = $$(componentIds.propertyView).getItem(componentIds.linkedTo);

				linkedToItem.options = $.map(linkedObjs, function (o) {
					return {
						id: o.id,
						value: o.label
					};
				});
				linkedToItem.options.splice(0, 0, {
					id: 'none',
					value: '[none]'
				});

				// Data source - Link field
				var linkedFieldItem = $$(componentIds.propertyView).getItem(componentIds.linkField);
				if (setting.linkedTo) {
					linkedFieldItem.options = self.data.columns
						.filter(function (col) { return col.setting.linkObject == setting.linkedTo; })
						.map(function (col) {
							return {
								id: col.id,
								value: col.label
							};
						}).attr();
				}
				else {
					linkedFieldItem.options = [];
				}

				// Set default of link field
				if (linkedFieldItem.options.length > 0 && linkedFieldItem.options.filter(function (opt) { return opt.id == setting.linkField; }).length < 1) {
					setting.linkField = linkedFieldItem.options[0].id;
				}
			}

			// Set property values
			var propValues = {};
			propValues[componentIds.editTitle] = setting.title || '';
			propValues[componentIds.editDescription] = setting.description || '';
			propValues[componentIds.selectObject] = setting.object;
			propValues[componentIds.linkedTo] = setting.linkedTo;
			propValues[componentIds.linkField] = setting.linkField;
			propValues[componentIds.selectColCount] = setting.colCount;
			propValues[componentIds.isSaveVisible] = setting.saveVisible || 'hide';
			propValues[componentIds.afterSave] = setting.afterSave;
			propValues[componentIds.saveLabel] = setting.saveLabel || 'Save';
			propValues[componentIds.isCancelVisible] = setting.cancelVisible || 'hide';
			propValues[componentIds.cancelLabel] = setting.cancelLabel || 'Cancel';
			propValues[componentIds.clearOnLoad] = setting.clearOnLoad || 'no';
			propValues[componentIds.clearOnSave] = setting.clearOnSave || 'no';
			propValues[componentIds.whenByGroup] = setting.whenByGroup || 'add';

			$$(componentIds.propertyView).setValues(propValues);
			$$(componentIds.propertyView).refresh();

		};

		return self;
	}

	return fields_tab;
});