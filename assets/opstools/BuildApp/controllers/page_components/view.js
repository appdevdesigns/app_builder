steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	function (dataCollectionHelper, selectivityHelper) {
		var componentIds = {
			editViewLayout: 'ab-view-edit-view',
			editView: 'ab-view-edit-view-detail',

			title: 'ab-view-title',
			description: 'ab-view-description',

			propertyView: 'ab-view-property-view',
			editTitle: 'ab-view-edit-title',
			editDescription: 'ab-view-edit-description',
			selectObject: 'ab-view-select-object'
		};

		// Instance functions
		var viewComponent = function (application, viewId, componentId) {
			var data = {},
				events = {},
				objectModels = {};

			// Private functions
			function clearViews() {
				if (!this.viewId) return;

				var self = this,
					childViews = $$(this.viewId).getChildViews().slice();

				childViews.forEach(function (child) {
					$$(self.viewId).removeView(child.config.id);
				});
			};

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
					data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
						self.updateData();
					});
					data.dataCollection.attachEvent('onDataUpdate', function (id, newData) {
						if (data.currDataId == id)
							self.updateData(newData);

						return true;
					});
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
					.then(function (columns) {
						clearViews.call(self);
						columns.forEach(function (col) {
							if (col.translate) col.translate();

							var isVisible = setting.visibleFieldIds.indexOf(col.id.toString()) > -1 || showAll;
							if (!editable && !isVisible) return; // Hidden

							// dataFieldsManager.customDisplay

							var displayDataView = null;

							// TODO: display data field template
							if (col.setting.editor === 'selectivity') {
								displayDataView = {
									view: 'template',
									dataId: col.id,
									borderless: true,
									template: '<div class="ab-component-view-selectivity"></div>'
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
								fieldName: col.name,
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

							if (editable) { // Show/Hide options
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

							$$(self.viewId).addView(field);
						});

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
						self.updateData();

						$$(self.viewId).hideProgress();

						// Trigger render event
						if (events.render)
							events.render();

						q.resolve();
					});

				return q;
			};

			this.getSettings = function () {
				var propertyValues = $$(componentIds.propertyView).getValues(),
					visibleFieldIds = [];

				// Find visibleFieldIds
				$$(componentIds.editView).getChildViews().forEach(function (child) {
					if (child.config.css === 'ab-component-view-edit-field') { // Get fields
						if (child.getChildViews()[0].getValue() === 'show') { // Get visible field
							var columnId = child.getChildViews()[0].config.dataId;
							visibleFieldIds.push(columnId);
						}
					}
				});

				var settings = {
					title: propertyValues[componentIds.editTitle],
					description: propertyValues[componentIds.editDescription] || '',
					object: propertyValues[componentIds.selectObject] || '',
					visibleFieldIds: visibleFieldIds
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
								.fail(next)
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
								next(null);
							});
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

						// Set property values
						var propValues = {};
						propValues[componentIds.editTitle] = setting.title || '';
						propValues[componentIds.editDescription] = setting.description || '';
						propValues[componentIds.selectObject] = setting.object;

						$$(componentIds.propertyView).setValues(propValues);
						$$(componentIds.propertyView).refresh();
					});
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.onRender = function (renderFn) {
				events.render = renderFn;
			};

			this.updateData = function (newData) {
				var self = this,
					currModel = newData ? newData : data.dataCollection.AD.currModel();

				if (currModel) {
					currModel = currModel.attr ? currModel.attr() : currModel;

					data.currDataId = currModel.id;

					$$(self.viewId).getChildViews().forEach(function (child) {
						var displayField = child.getChildViews()[1],
							labelValue = currModel ? currModel[child.config.fieldName] : '';

						if (child.config.editor === 'selectivity') {
							selectivityHelper.renderSelectivity($$(self.viewId), 'ab-component-view-selectivity', true);

							var selectivityItem = $(child.$view).find('.ab-component-view-selectivity');
							if (labelValue) {
								selectivityHelper.setData(selectivityItem, labelValue.map(function (d) {
									return {
										id: d.id,
										text: d.dataLabel
									};
								}));
							}
							else {
								selectivityHelper.setData(selectivityItem, []);
							}
						}
						else if (child.config.editor === 'date' || child.config.editor === 'datetime') {
							if (labelValue) {
								var dateValue = (labelValue instanceof Date) ? labelValue : new Date(labelValue),
									dateFormat = webix.i18n.dateFormatStr(dateValue);
								displayField.setValue(dateFormat);
							}
							else {
								displayField.setValue(labelValue);
							}
						}
						else if (child.config.editor) {
							if (labelValue)
								displayField.setValue(labelValue);
							else
								displayField.setValue('');
						}
					});
				}
			};
		};

		// Static functions
		viewComponent.getInfo = function () {
			return {
				name: 'view',
				icon: 'fa-file-text-o'
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
					}
				],
				on: {
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (ignoreUpdate || state.old == state.value) return false;

						var propertyValues = $$(componentIds.propertyView).getValues();

						switch (editor.id) {
							case componentIds.editTitle:
								$$(componentIds.title).setValue(propertyValues[componentIds.editTitle]);
								break;
							case componentIds.editDescription:
								$$(componentIds.description).setValue(propertyValues[componentIds.editDescription]);
								break;
							case componentIds.selectObject:
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.populateSettings(setting, true);
								break;
						}
					}
				}
			};
		};

		viewComponent.editStop = function () {
			$$(componentIds.propertyView).editStop();
		};

		viewComponent.resize = function (height) {
			$$(componentIds.editViewLayout).define('height', height - 150);
			$$(componentIds.editViewLayout).resize();
		};

		return viewComponent;
	}
);