steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',

	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',
	function (dataFieldsManager, dataCollectionHelper) {
		var componentIds = {
			editView: 'ab-form-edit-view',
			editForm: 'ab-form-edit-mode',

			title: 'ab-form-title',
			description: 'ab-form-description',

			propertyView: 'ab-form-property-view',
			editTitle: 'ab-form-edit-title',
			editDescription: 'ab-form-edit-description',
			selectObject: 'ab-form-select-object',
			isSaveVisible: 'ab-form-save-visible',
			isCancelVisible: 'ab-form-cancel-visible',

			addConnectObjectDataPopup: 'ab-form-connected-data-popup'
		};

		//Constructor
		var formComponent = function (application, viewId, componentId) {
			var events = {},
				data = {};

			// Private methods
			function saveModelData(dataCollection, columns) {
				var self = this,
					q = $.Deferred(),
					modelData = dataCollection.AD.currModel(),
					isAdd;

				$$(self.viewId).showProgress({ type: "icon" });

				if (modelData === null) { // Create
					modelData = new dataCollection.AD.getModelObject()();
					isAdd = true;
				}

				var editValues = $$(self.viewId).getValues(),
					keys = Object.keys(editValues);

				// Populate values to model
				keys.forEach(function (fieldName) {
					if (typeof editValues[fieldName] !== 'undefined' && editValues[fieldName] !== null) {
						var colInfo = columns.filter(function (col) { return col.name === fieldName; })[0];

						if (colInfo) {
							switch (colInfo.type) {
								// TODO : get data
								case "boolean":
									modelData.attr(fieldName, editValues[fieldName] === 1 ? true : false);
									break;
								default:
									modelData.attr(fieldName, editValues[fieldName]);
									break;
							}
						}
						else {
							modelData.attr(fieldName, editValues[fieldName]);
						}
					}
					else
						modelData.removeAttr(fieldName);
				});

				modelData.save()
					.fail(q.reject)
					.then(function (result) {
						$$(self.viewId).hideProgress();

						if (result.translate) result.translate();

						// Add to data collection
						if (isAdd)
							dataCollection.AD.__list.push(result);

						// self.callEvent('save', viewId, {
						// 	returnPage: data.returnPage,
						// 	id: componentId
						// });

						dataCollection.setCursor(null);
						data.returnPage = null;

						// Clear form
						$$(self.viewId).setValues({});
						// TODO : clear customDisplay

						q.resolve();
					});

				return q;
			};


			// Set viewId to public
			this.viewId = viewId;
			this.editViewId = componentIds.editForm;

			// Instance functions
			this.render = function (setting, editable, showAll, dataCollection) {
				var self = this,
					q = $.Deferred(),
					elementViews = [],
					header = { rows: [] },
					listOptions = {}, // { columnId: [{}, ..., {}] }
					columns;

				if (dataCollection) {
					dataCollection.attachEvent('onAfterCursorChange', function (id) {
						// TODO : Update custom display
					});
				}

				setting.visibleFieldIds = setting.visibleFieldIds || [];

				$$(self.viewId).clear();
				$$(self.viewId).clearValidation();

				if (!setting.object) return;

				webix.extend($$(self.viewId), webix.ProgressBar);
				$$(self.viewId).showProgress({ type: "icon" });

				// Get object
				var object = application.objects.filter(function (obj) { return obj.id == setting.object; });
				if (!object || object.length < 1) return;
				application.currObj = object[0];

				async.series([
					// Get columns data
					function (next) {
						application.currObj.getColumns()
							.fail(next)
							.then(function (result) {
								result.forEach(function (d) {
									if (d.translate) d.translate();
								});

								columns = result;
								next();
							});
					},
					// Get list options from database
					function (next) {
						var getOptionsTasks = [];

						columns.filter(function (col) { return col.setting.editor === 'richselect'; })
							.forEach(function (col) {
								getOptionsTasks.push(function (callback) {
									col.getList()
										.fail(callback)
										.then(function (result) {
											result.forEach(function (r) { if (r.translate) r.translate(); });

											listOptions[col.id] = $.map(result, function (opt, index) {
												return {
													dataId: opt.id,
													id: opt.value,
													value: opt.label
												}
											});

											callback();
										});
								});
							});

						async.parallel(getOptionsTasks, next);
					},
					// Add form elements
					function (next) {
						async.eachSeries(columns, function (col, callback) {
							var isVisible = setting.visibleFieldIds.indexOf(col.id.toString()) > -1 || showAll;

							if (!editable && !isVisible) { // Hidden
								callback();
								return;
							}

							var element = {
								name: col.name, // Field name
								labelWidth: 100,
								minWidth: 500
							};
							element.label = col.label;

							if (col.type == 'boolean') {
								element.view = 'checkbox';
							}
							else if (col.setting.template) {
								var template = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>#template#"
									.replace(/#width#/g, element.labelWidth - 3)
									.replace(/#label#/g, element.label)
									.replace(/#template#/g, col.setting.template);

								element.view = 'template';
								element.minHeight = 45;
								element.borderless = true;
								element.template = template;
								element.on = {
									onFocus: function (current_view, prev_view) {
										dataFieldsManager.customEdit(application, col, data, current_view.$view);
									}
								};
							}
							else if (col.setting.editor === 'popup') {
								element.view = 'textarea';
							}
							else if (col.setting.editor === 'number') {
								element.view = 'counter';
							}
							else if (col.setting.editor === 'date') {
								element.view = 'datepicker';
								element.timepicker = false;
							}
							else if (col.setting.editor === 'datetime') {
								element.view = 'datepicker';
								element.timepicker = true;
							}
							else if (col.setting.editor === 'richselect') {
								element.view = 'richselect';
								element.options = listOptions[col.id];
							}
							else {
								element.view = col.setting.editor;
							}

							if (editable) { // Show/Hide options
								element = {
									css: 'ab-form-component-item',
									cols: [
										{
											name: col.id, // Column id
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
										element
									]
								};
							}

							elementViews.push(element);
							callback();
						}, next);
					},
					function (next) {
						// Redraw
						webix.ui(elementViews, $$(self.viewId));

						// Bind data
						if (dataCollection)
							$$(self.viewId).bind(dataCollection);

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

						// Save/Cancel buttons
						var actionButtons = {
							cols: [{}]
						};

						if (setting.saveVisible === 'show') {
							var saveButtonId = self.viewId + '-form-save-button';

							actionButtons.cols.push({
								id: saveButtonId,
								view: "button",
								type: "form",
								value: "Save",
								width: 90,
								inputWidth: 80,
								click: function () {
									if ($$(this))
										$$(this).disable();

									saveModelData.call(self, dataCollection, columns)
										.fail(function (err) {
											console.error(err);

											if ($$(this))
												$$(this).enable();
										})
										.then(function () {
											if ($$(this))
												$$(this).enable();
										});
								}
							});
						}

						if (setting.cancelVisible === 'show') {
							var cancelButtonId = self.viewId + '-form-cancel-button';

							actionButtons.cols.push({
								id: cancelButtonId,
								view: "button",
								value: "Cancel",
								width: 90,
								inputWidth: 80,
								click: function () {
									dataCollection.setCursor(null);

									// self.callEvent('cancel', viewId, {
									// 	returnPage: data.returnPage,
									// 	id: componentId
									// });

									data.returnPage = null;

									// Clear form
									$$(self.viewId).setValues({});
									// TODO : clear customView
								}
							});
						}

						$$(self.viewId).addView(actionButtons);

						$$(self.viewId).refresh();

						// Custom view
						columns.forEach(function (col) {
							var childView = $$(self.viewId).getChildViews().find(function (view) { return view.config && view.config.name == col.name });
							if (!childView) return;

							dataFieldsManager.customDisplay(col.fieldName, data, childView.$view);
						});

						next();
					}
				], function (err) {
					if (err) {
						q.reject();
						return;
					}

					$$(self.viewId).hideProgress();

					// TODO;
					// self.callEvent('renderComplete', viewId);

					data.isRendered = true;
					q.resolve();
				});

				return q;
			};

			this.getSettings = function () {
				var propertyValues = $$(componentIds.propertyView).getValues(),
					visibleFieldIds = [];

				var formValues = $$(componentIds.editForm).getValues();
				for (var key in formValues) {
					if (formValues[key] === 'show') {
						visibleFieldIds.push(key);
					}
				}

				var settings = {
					title: propertyValues[componentIds.editTitle],
					description: propertyValues[componentIds.editDescription] || '',
					object: propertyValues[componentIds.selectObject] || '',
					visibleFieldIds: visibleFieldIds,
					saveVisible: propertyValues[componentIds.isSaveVisible],
					cancelVisible: propertyValues[componentIds.isCancelVisible]
				};

				return settings;
			};

			this.populateSettings = function (setting, showAll) {
				var self = this;

				async.waterfall([
					// Get data collection
					function (next) {
						dataCollectionHelper.getDataCollection(application, setting.object).then(function (dataCollection) {
							next(null, dataCollection);
						});
					},
					// Render form component
					function (dataCollection, next) {
						self.render(setting, true, showAll, dataCollection);
					}
				]);


				// Get object list
				data.objects = null;
				application.getObjects()
					.fail(function (err) {
						// TODO : Error message
						console.error(err)
					})
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
						propValues[componentIds.isSaveVisible] = setting.saveVisible || 'hide';
						propValues[componentIds.isCancelVisible] = setting.cancelVisible || 'hide';
						$$(componentIds.propertyView).setValues(propValues);

						$$(componentIds.propertyView).refresh();
					});
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.onRender = function (renderFn) {
				events.render = renderFn;
			}

			self.setReturnPage = function (viewId, pageId) {
				var data = self.getData(viewId);

				data.returnPage = pageId;
			};

		}

		// Static functions
		formComponent.getInfo = function () {
			return {
				name: 'form',
				icon: 'fa-list-alt'
			};
		};

		formComponent.getView = function () {
			return {
				view: "form",
				autoheight: true,
				elements: []
			};
		};

		formComponent.getEditView = function () {
			var form = $.extend(true, {}, formComponent.getView());
			form.id = componentIds.editForm;

			var editView = {
				id: componentIds.editView,
				view: 'layout',
				padding: 10,
				css: 'ab-scroll-y',
				rows: [
					form
				]
			};

			return editView;
		};

		formComponent.getPropertyView = function (componentManager) {
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
						id: componentIds.isCancelVisible,
						name: 'cancel',
						type: 'richselect',
						label: 'Cancel',
						options: [
							{ id: 'show', value: "Yes" },
							{ id: 'hide', value: "No" },
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
								$$(componentIds.title).setValue(propertyValues[componentIds.editTitle]);
								break;
							case componentIds.editDescription:
								$$(componentIds.description).setValue(propertyValues[componentIds.editDescription]);
								break;
							case componentIds.selectObject:
							case componentIds.isSaveVisible:
							case componentIds.isCancelVisible:
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.populateSettings(setting, true);
								break;
						}
					}
				}
			};
		};

		formComponent.editStop = function () {
			$$(componentIds.propertyView).editStop();
		};

		formComponent.resize = function (height) {
			$$(componentIds.editView).define('height', height - 150);
			$$(componentIds.editView).resize();
		};

		return formComponent;

	}
);