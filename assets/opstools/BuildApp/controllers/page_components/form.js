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

			clearOnLoad: 'ab-form-clear-on-load',
			clearOnSave: 'ab-form-clear-on-save',

			addConnectObjectDataPopup: 'ab-form-connected-data-popup'
		},
			labels = {
				common: {
					saveSuccessMessage: AD.lang.label.getLabel('ab.common.save.success') || "<b>{0}</b> is saved."
				}
			};

		//Constructor
		var formComponent = function (application, viewId, componentId) {
			var data = {};

			// Private methods
			function saveModelData(dataCollection, object, columns, setting) {
				var self = this,
					q = $.Deferred(),
					modelData = dataCollection.AD.currModel(),
					isAdd;

				$$(self.viewId).showProgress({ type: "icon" });

				if (modelData === null) { // Create
					modelData = new dataCollection.AD.getModelObject()();
					isAdd = true;
				}

				var editValues = $$(self.viewId).getValues();
				var keys = Object.keys(editValues);

				// Populate values to model
				columns.forEach(function (col) {
					if (col.type == "boolean") {
						modelData.attr(col.name, editValues[col.name] === 1 ? true : false);
					}
					else {
						var childView = getChildView.call(self, col.name);
						if (!childView) return;

						// Get value in custom data field
						var val = dataFieldsManager.getValue(application, null, col, childView.$view);
						if (typeof val != 'undefined' && val != null)
							modelData.attr(col.name, val);
						else if (typeof editValues[col.name] != 'undefined')
							modelData.attr(col.name, editValues[col.name]);
						else
							modelData.removeAttr(col.name);
					}
				});

				modelData.save()
					.fail(function (err) {
						console.error(err);
						$$(self.viewId).hideProgress();
						q.reject(err);
					})
					.then(function (result) {
						$$(self.viewId).hideProgress();

						if (result.translate) result.translate();

						// Add to data collection
						if (isAdd)
							dataCollection.AD.__list.push(result);

						if (setting.clearOnSave == 'yes')
							dataCollection.setCursor(null);

						// Show success message
						webix.message({
							type: "success",
							text: labels.common.saveSuccessMessage.replace('{0}', result._dataLabel ? result._dataLabel : 'This data')
						});

						$(self).trigger('changePage', {
							previousPage: true
						});

						q.resolve();
					});

				return q;
			};

			function showCustomFields(object, columns, rowId, rowData) {
				var self = this;

				if (!columns || columns.length < 1) return;

				// Custom view
				columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					dataFieldsManager.customDisplay(col.fieldName, application, object, col, rowId, rowData ? rowData[col.name] : null, childView.$view);
				});
			}

			function getChildView(columnName) {
				var childView = $$(this.viewId).getChildViews().find(function (view) {
					return view.config && view.config.name == columnName
				});

				return childView;
			}

			function setElementHeights(columns, currModel) {
				var self = this;

				columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					if (currModel) {
						var rowHeight = dataFieldsManager.getRowHeight(col, currModel[col.name]);
						if (rowHeight) {
							childView.define('height', rowHeight);
							childView.resize();
							return;
						}
					}

					childView.define('height', 35); // Default height
					childView.resize();
				});
			}

			function clearForm(object, columns, dataCollection) {
				var self = this;

				// Clear form
				$$(self.viewId).setValues({});
				// Clear custom views
				showCustomFields.call(self, object, columns, null, null);
			}

			// Set viewId to public
			this.viewId = viewId;
			this.editViewId = componentIds.editForm;

			// Instance functions
			this.render = function (setting, editable, showAll, dataCollection) {
				var self = this,
					q = $.Deferred(),
					elementViews = [],
					header = { rows: [] },
					listOptions = {}; // { columnId: [{}, ..., {}] }

				data.setting = setting;
				data.dataCollection = dataCollection;

				setting.visibleFieldIds = setting.visibleFieldIds || [];

				$$(self.viewId).clear();
				$$(self.viewId).clearValidation();

				$$(self.viewId).hide();
				if (!setting.object) return;

				webix.extend($$(self.viewId), webix.ProgressBar);
				$$(self.viewId).showProgress({ type: "icon" });

				// Get object
				data.object = application.objects.filter(function (obj) { return obj.id == setting.object; });
				if (!data.object || data.object.length < 1) return;
				data.object = data.object[0];

				if (data.dataCollection) {
					data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
						var currModel = data.dataCollection.AD.currModel();
						// Show custom display
						showCustomFields.call(self, data.object, data.columns, id, currModel);

						setElementHeights.call(self, data.columns, currModel);
					});
				}

				$$(self.viewId).show();
				async.series([
					// Get columns data
					function (next) {
						data.object.getColumns()
							.fail(next)
							.then(function (result) {
								result.forEach(function (d) {
									if (d.translate) d.translate();
								});

								data.columns = result;
								next();
							});
					},
					// Get list options from database
					function (next) {
						var getOptionsTasks = [];

						data.columns.filter(function (col) { return col.setting.editor === 'richselect'; })
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
						async.eachSeries(data.columns, function (col, callback) {
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
										var rowId;

										if (data.dataCollection) {
											var currModel = data.dataCollection.AD.currModel(),
												rowId = currModel ? currModel.id : null;
										}

										dataFieldsManager.customEdit(application, data.object, col, rowId, current_view.$view);
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
									var saveButton = this;

									if ($$(saveButton))
										$$(saveButton).disable();

									saveModelData.call(self, dataCollection, data.object, data.columns, setting)
										.fail(function (err) {
											console.error(err);

											if ($$(saveButton))
												$$(saveButton).enable();
										})
										.then(function () {
											if ($$(saveButton))
												$$(saveButton).enable();
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
									data.dataCollection.setCursor(null);

									clearForm.call(self, data.object, data.columns, data.dataCollection);

									$(self).trigger('changePage', {
										previousPage: true
									});
								}
							});
						}

						$$(self.viewId).addView(actionButtons);

						$$(self.viewId).refresh();

						var currData;

						// Bind data
						if (dataCollection) {
							$$(self.viewId).bind(dataCollection);
							currData = dataCollection.AD.currModel();
						}

						// Show data of current select data
						showCustomFields.call(self, data.object, data.columns, currData ? currData.id : null, currData);

						next();
					}
				], function (err) {
					if (err) {
						q.reject();
						return;
					}

					$$(self.viewId).hideProgress();

					$(self).trigger('renderComplete', {});

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
					object: propertyValues[componentIds.selectObject] || '', // ABObject.id
					visibleFieldIds: visibleFieldIds, // [ABColumn.id]
					saveVisible: propertyValues[componentIds.isSaveVisible],
					cancelVisible: propertyValues[componentIds.isCancelVisible],
					clearOnLoad: propertyValues[componentIds.clearOnLoad],
					clearOnSave: propertyValues[componentIds.clearOnSave],
				};

				return settings;
			};

			this.populateSettings = function (setting, showAll) {
				var self = this,
					dataCollection;

				async.series([
					// Get data collection
					function (next) {
						dataCollectionHelper.getDataCollection(application, setting.object)
							.fail(function (err) { next(); })
							.then(function (result) {
								dataCollection = result;
								next();
							});
					},
					// Render form component
					function (next) {
						self.render(setting, true, showAll, dataCollection);
					}
				]);


				// Get object list
				var objects = null;
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

						objects = result;

						// Properties

						// Data source - Object
						var objSource = $$(componentIds.propertyView).getItem(componentIds.selectObject);
						objSource.options = $.map(objects, function (o) {
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
						propValues[componentIds.clearOnLoad] = setting.clearOnLoad || 'no';
						propValues[componentIds.clearOnSave] = setting.clearOnSave || 'no';

						$$(componentIds.propertyView).setValues(propValues);
						$$(componentIds.propertyView).refresh();
					});
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.onDisplay = function () {
				var self = this;

				if (!data.dataCollection) return;

				var currModel = data.dataCollection.AD.currModel();

				if (data.setting.clearOnLoad === 'yes') {
					data.dataCollection.setCursor(null);
					clearForm.call(self, data.object, data.columns, data.dataCollection);
				}

				setElementHeights.call(self, data.columns, currModel);

				data.columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					// Set default connect data when add
					if (col.fieldName == 'connectObject') {
						dataCollectionHelper.getDataCollection(application, col.setting.linkObject)
							.then(function (linkedDataCollection) {
								var linkCurrModel = linkedDataCollection.AD.currModel();
								if (!linkCurrModel) return;

								// Get default value of linked data
								var defaultVal = {
									id: linkCurrModel.id,
									text: linkCurrModel._dataLabel
								};

								dataFieldsManager.setValue(col, childView.$view, defaultVal);
							});
					}
				});

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