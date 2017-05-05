steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/ColumnizerHelper.js',
	function (dataFieldsManager, dataCollectionHelper, columnizerHelper) {
		var componentIds = {
			editViewLayout: 'ab-view-edit-view',
			editView: 'ab-view-edit-view-detail',

			title: 'ab-view-title',
			description: 'ab-view-description',
			columns: 'ab-view-columns',

			propertyView: 'ab-view-property-view',
			editTitle: 'ab-view-edit-title',
			editDescription: 'ab-view-edit-description',
			selectObject: 'ab-view-select-object',
			selectColumns: 'ab-view-select-columns',
			recordFilter: 'ab-view-record-filter'
		};

		// Instance functions
		var viewComponent = function (application, viewId, componentId) {
			var data = {},
				eventIds = {},
				objectModels = {};

			// Private functions
			function clearViews() {
				if (!this.viewId) return;

				var self = this,
					childViews = $$(this.viewId).getChildViews().slice();

				childViews.forEach(function (child) {
					$$(self.viewId).removeView(child);
				});
			}

			// Return an array the view's column items
			function getColumns() {
				return columnizerHelper.getColumns($$(componentIds.columns));
			}

			function updateData(setting, newData) {
				var self = this,
					currModel = null,
					object = application.objects.filter(function (obj) { return obj.id == setting.object; })[0];

				if (!object) return;

				if (newData)
					currModel = newData;
				else if (data.dataCollection)
					currModel = data.dataCollection.AD.currModel();

				currModel = currModel && currModel.attr ? currModel.attr() : currModel;
				data.currDataId = currModel ? currModel.id : null;

				getColumns().forEach(function (child) {
					if (!child.config.name) return;

					var displayField = child.getChildViews()[1];

					if (currModel == null) {
						// Clear display
						if (displayField.setValue)
							displayField.setValue('');
						else if (displayField.render)
							displayField.render();

						return;
					}

					// There are cases where this happens.  Prevent the error:
					// Question for Pong: is this an acceptable case, or do we need to track down
					// where this is being called without .columns  and fix that?
					if (!data.columns) return;

					var fieldData = currModel[child.config.name],
						column = data.columns.filter(function (col) { return col.name == child.config.name; });

					if (column && column.length > 0) column = column[0];
					else return;

					if (dataFieldsManager.customDisplay(child.config.fieldName, application, object, column, currModel, fieldData, viewId, child.$view, { readOnly: true }))
						return;

					if (column.setting.format && webix.i18n[column.setting.format] && displayField.setValue) {
						if (fieldData) {
							var dateFormat = webix.i18n[column.setting.format](fieldData);
							displayField.setValue(dateFormat);
						}
						else {
							displayField.setValue(fieldData);
						}
					}
					// list data field
					else if (column.fieldName == 'list' && (column.setting.multiSelect == null || column.setting.multiSelect != true)) {
						var selectOpt = column.setting.options.filter(function (opt) { return opt.id == fieldData; })[0];

						if (selectOpt)
							displayField.setValue(selectOpt.value);
						else
							displayField.setValue(fieldData);
					}
					else if (column.setting.editor && displayField.setValue) {
						if (fieldData)
							displayField.setValue(fieldData);
						else
							displayField.setValue('');
					}
				});
			}

			this.viewId = viewId;
			this.editViewId = componentIds.editView;

			this.render = function (setting, editable, showAll, dataCollection) {
				var q = $.Deferred(),
					self = this,
					fields = [],
					header = { rows: [] };

				data.isRendered = true;
				data.dataCollection = dataCollection;

				// Initial events
				if (data.dataCollection) {
					// TEMPORARY FEATURE :
					if (setting.recordFilter != null) {
						data.dataCollection.setCursor(setting.recordFilter)
						data.dataCollection.recordFilter = setting.recordFilter;
					}

					if (eventIds['onAfterCursorChange'] == null) {
						eventIds['onAfterCursorChange'] = data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
							updateData.call(self, setting);
						});
					}

					if (eventIds['onDataUpdate'] == null) {
						eventIds['onDataUpdate'] = data.dataCollection.attachEvent('onDataUpdate', function (id, newData) {
							if (data.currDataId == id)
								updateData.call(self, setting, newData);

							return true;
						});
					}
				}

				setting.visibleFieldIds = setting.visibleFieldIds || [];

				clearViews.call(self);

				if (!setting.object) {
					if (editable && $$(self.viewId).addView) {
						$$(self.viewId).addView({
							view: 'label',
							label: 'Please select an object'
						});
					}

					q.resolve();
					return q;
				}

				if (!setting.columns) {
					if (editable && $$(self.viewId).addView) {
						$$(self.viewId).addView({
							view: 'label',
							label: 'Please select columns'
						});
					}
				}

				webix.extend($$(self.viewId), webix.ProgressBar);
				$$(self.viewId).showProgress({ type: "icon" });

				// Get object list
				var object = application.objects.filter(function (obj) { return obj.id == setting.object; });
				if (!object || object.length < 1) {
					q.resolve();
					return q;
				}

				object = object[0];
				object.getColumns()
					.fail(function (err) {
						// TODO message
						$$(self.viewId).hideProgress();
						next(err);
					})
					.then(function (result) {
						result.forEach(function (col) {
							if (col.translate) col.translate();
						});
						data.columns = result;

						clearViews.call(self);

						var columns = $.map(result, function (col) {
							var isVisible = setting.visibleFieldIds.indexOf(col.id.toString()) > -1 || showAll;
							if (!editable && !isVisible) return; // Hidden

							var displayDataView = null;

							if (col.setting.template) {
								displayDataView = {
									view: 'template',
									dataId: col.id,
									borderless: true,
									template: col.setting.template,
									css: (col.setting.css || '') + ' left'
								};
							}
							else {
								displayDataView = {
									view: 'label',
									dataId: col.id,
									label: '[data]'
								};
							}

							// Display label
							var field = {
								view: 'layout',
								editor: col.setting.editor,
								name: col.name,
								fieldName: col.fieldName,
								fieldType: col.type,
								cols: [
									{
										view: 'label',
										css: 'bold',
										width: 120,
										label: col.label
									},
									displayDataView
								]
							};

							// Show/Hide options
							if (editable) {
								field = {
									css: 'ab-component-view-edit-field',
									cols: [
										{
											dataId: col.id, // Column id
											view: 'segmented',
											margin: 10,
											maxWidth: 120,
											inputWidth: 100,
											inputHeight: 35,
											value: isVisible ? "show" : "hide",
											options: [
												{ id: "show", value: "Show" },
												{ id: "hide", value: "Hide" },
											]
										},
										field
									]
								};
							}

							return field;
						});

						var columnCount = parseInt(setting.columns, 10) || 1;
						var columnView = columnizerHelper.columnize(columns, columnCount);
						columnView.id = componentIds.columns;
						$$(self.viewId).removeView(componentIds.columns);
						$$(self.viewId).addView(columnView);

						// Title
						if (editable) {
							header.rows.push({
								id: componentIds.title,
								view: 'text',
								placeholder: 'Title',
								css: 'ab-component-header',
								value: setting.title || '',
								on: {
									onChange: function (newv, oldv) {
										if (newv != oldv) {
											var propValues = $$(componentIds.propertyView).getValues();
											propValues[componentIds.editTitle] = newv;
											$$(componentIds.propertyView).setValues(propValues);
										}
									}
								}
							});
						}
						else if (setting.title) {
							header.rows.push({
								view: 'label',
								css: 'ab-component-header',
								label: setting.title || ''
							});
						}

						// Description
						if (editable) {
							header.rows.push({
								id: componentIds.description,
								view: 'textarea',
								placeholder: 'Description',
								css: 'ab-component-description',
								value: setting.description || '',
								inputHeight: 60,
								height: 70,
								on: {
									onChange: function (newv, oldv) {
										if (newv != oldv) {
											var propValues = $$(componentIds.propertyView).getValues();
											propValues[componentIds.editDescription] = newv;
											$$(componentIds.propertyView).setValues(propValues);
										}
									}
								}

							});
						}
						else if (setting.description) {
							header.rows.push({
								view: 'label',
								css: 'ab-component-description',
								label: setting.description || ''
							});
						}

						$$(self.viewId).addView(header, 0);

						// Populate data to fields
						updateData.call(self, setting);

						$$(self.viewId).hideProgress();

						// Trigger render event
						$(self).trigger('renderComplete', {});

						q.resolve();
					});

				return q;
			};

			this.getSettings = function () {
				var propertyValues = $$(componentIds.propertyView).getValues(),
					visibleFieldIds = [];

				// From the columns array, generate an array of the ids of all visible columns
				getColumns().forEach(function (column) {
					var visibility = column.getChildViews()[0];
					if (visibility.getValue() === 'show') { // Get visible field
						var columnId = visibility.config.dataId;
						visibleFieldIds.push(columnId);
					}
				});

				var settings = {
					title: propertyValues[componentIds.editTitle],
					description: propertyValues[componentIds.editDescription] || '',
					object: propertyValues[componentIds.selectObject] || '', // ABObject.id
					columns: propertyValues[componentIds.selectColumns] || '',
					visibleFieldIds: visibleFieldIds, // [ABColumn.id]
					recordFilter: propertyValues[componentIds.recordFilter] || ''
				};

				return settings;
			};

			this.populateSettings = function (setting, showAll) {
				var self = this,
					editable = true;

				async.waterfall([
					// Get data collection
					function (next) {
						if (setting && setting.object) {
							dataCollectionHelper.getDataCollection(application, setting.object)
								.fail(function (err) {
									// This object is deleted
									delete setting.object;
									next(null, null);
								})
								.then(function (dataCollection) {
									next(null, dataCollection);
								});
						}
						else {
							next(null, null);
						}
					},
					// Render form component
					function (dataCollection, next) {
						self.render(setting, editable, showAll, dataCollection)
							.fail(next)
							.then(function () {
								next(null, dataCollection);
							});
					},
					// Get row data to show in list
					function (dataCollection, next) {
						if (dataCollection) {
							// Properties
							// Filter - Row
							var rowData = dataCollection.find({});

							var recordFilter = $$(componentIds.propertyView).getItem(componentIds.recordFilter);
							var recordOptions = rowData.map(function (row) {
								return {
									id: row.id,
									value: 'ID: #id# - #label#'.replace('#id#', row.id).replace('#label#', row._dataLabel)
								};
							});

							recordOptions.unshift({
								id: '',
								value: '[None]'
							})

							recordFilter.options = recordOptions;

							next();
						}
						else {
							next();
						}
					}
				]);


				// Get object list
				data.objects = null;
				application.getObjects()
					.fail(function (err) { callback(err); })
					.then(function (result) {
						result.forEach(function (o) {
							if (o.translate)
								o.translate();
						});

						data.objects = result;

						// Properties

						// Data source - Object
						var objSource = $$(componentIds.propertyView).getItem(componentIds.selectObject);
						objSource.options = $.map(data.objects, function (o) {
							return {
								id: o.id,
								value: o.label
							};
						});

						// Data source - Column
						var colOptions = [1, 2, 3],
							colSource = $$(componentIds.propertyView).getItem(componentIds.selectColumns);
						colSource.options = $.map(colOptions, function (o) {
							return {
								id: o,
								value: o
							};
						});

						// Set property values
						var propValues = {};
						propValues[componentIds.editTitle] = setting.title || '';
						propValues[componentIds.editDescription] = setting.description || '';
						propValues[componentIds.selectObject] = setting.object;
						propValues[componentIds.selectColumns] = setting.columns;
						propValues[componentIds.recordFilter] = setting.recordFilter || '';

						$$(componentIds.propertyView).setValues(propValues);
						$$(componentIds.propertyView).refresh();
					});
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.resize = function () {
				$$(this.viewId).adjust();
			};

		};

		// Static functions
		viewComponent.getInfo = function () {
			return {
				name: 'view',
				icon: 'fa-file-text-o',
				propertyView: componentIds.propertyView
			};
		}

		viewComponent.getView = function () {
			return {
				view: "layout",
				autoheight: true,
				rows: []
			};
		};

		viewComponent.getEditView = function () {
			var view = $.extend(true, {}, viewComponent.getView());
			view.id = componentIds.editView;

			var editViewLayout = {
				id: componentIds.editViewLayout,
				view: 'layout',
				padding: 10,
				css: 'ab-scroll-y',
				rows: [
					view
				]
			};

			return editViewLayout;
		};

		viewComponent.getPropertyView = function (componentManager) {
			return {
				view: "property",
				id: componentIds.propertyView,
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
					{ label: "Settings", type: "label" },
					{
						id: componentIds.selectColumns,
						name: 'columns',
						type: 'richselect',
						label: 'Columns',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.value == dataValue; });

							return (selectedData && selectedData.length > 0) ? selectedData[0].value : '[Select]';
						}
					},
					{ label: "Filter", type: "label" },
					{
						id: componentIds.recordFilter,
						name: 'filter',
						type: 'richselect',
						label: 'Row',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });

							if (selectedData && selectedData.length > 0) {
								return selectedData[0].value;
							}
							else {
								return '[None]';
							}
						}
					}
				],
				on: {
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (ignoreUpdate || state.old == state.value) return false;

						var propertyValues = $$(componentIds.propertyView).getValues();

						switch (editor.id) {
							case componentIds.editTitle:
								if ($$(componentIds.title))
									$$(componentIds.title).setValue(propertyValues[componentIds.editTitle]);
								break;
							case componentIds.editDescription:
								console.log('***DESCRIPTION', state, editor, ignoreUpdate);
								if ($$(componentIds.description))
									$$(componentIds.description).setValue(propertyValues[componentIds.editDescription]);
								break;
							case componentIds.selectObject:
								console.log('***SELECT OBJECT', state, editor, ignoreUpdate);
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.populateSettings(setting, true);
								break;
							case componentIds.selectColumns:
								console.log('***SELECT COLUMN', state, editor, ignoreUpdate);
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.populateSettings(setting, true);
								break;
						}
					}
				}
			};
		};

		viewComponent.resize = function (height) {
			$$(componentIds.editViewLayout).define('height', height - 150);
			$$(componentIds.editViewLayout).resize();
		};

		return viewComponent;
	}
);