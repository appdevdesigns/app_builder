steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/ColumnizerHelper.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',
	function (dataFieldsManager, dataCollectionHelper, columnizerHelper, selectivityHelper) {
		var componentIds = {
			editView: 'ab-form-edit-view',
			editForm: 'ab-form-edit-mode',

			title: 'ab-form-title',
			description: 'ab-form-description',
			columns: '#viewId#-columns',

			propertyView: 'ab-form-property-view',
			editTitle: 'ab-form-edit-title',
			editDescription: 'ab-form-edit-description',
			selectObject: 'ab-form-select-object',
			linkedTo: 'ab-form-linked-to',
			linkField: 'ab-form-link-field',
			selectColCount: 'ab-form-select-column-count',
			isSaveVisible: 'ab-form-save-visible',
			afterSave: 'ab-form-save-go-to',
			saveLabel: 'ab-form-save-text',
			saveButton: 'ab-form-save-button-#viewId#',
			isCancelVisible: 'ab-form-cancel-visible',
			cancelLabel: 'ab-form-cancel-text',

			clearOnLoad: 'ab-form-clear-on-load',
			clearOnSave: 'ab-form-clear-on-save',
			whenByGroup: 'ab-from-when-by-group',

			addConnectObjectDataPopup: 'ab-form-connected-data-popup'
		},
			labels = {
				common: {
					saveSuccessMessage: AD.lang.label.getLabel('ab.common.save.success') || "<b>{0}</b> is saved."
				}
			};

		//Constructor
		var formComponent = function (application, rootPageId, viewId, componentId) {
			var data = {},
				events = {}, // { eventName: eventId, ..., eventNameN: eventIdN }
				customEditTimeout = {}; // { colId: timeoutId }

			// Private methods
			function getCurrentModel(setting) {
				var currModel = null;

				if (setting.clearOnLoad != 'yes')
					currModel = data.dataCollection.AB.getCurrModel(rootPageId);

				return currModel;
			}

			function showCustomEdit(column, setting, current_view) {
				if (customEditTimeout[column.id]) clearTimeout(customEditTimeout[column.id]);
				customEditTimeout[column.id] = setTimeout(function () {
					var rowId;

					if (data.dataCollection) {
						var currModel = getCurrentModel(setting),
							rowId = currModel ? currModel.id : null;
					}

					dataFieldsManager.customEdit(application, data.object, column, rowId, current_view);
				}, 50);
			}

			function populateValuesToModelData(modelData, dataCollection, columns) {
				var self = this,
					q = $.Deferred(),
					editValues = $$(self.viewId).getValues(),
					keys = Object.keys(editValues);

				// Populate values to model
				async.eachSeries(columns, function (col, ok) {
					async.waterfall([
						function (next) {
							var childView = getChildView.call(self, col.name);
							if (childView == null) {
								// If link column is hidden, then select cursor item of linked data collection
								if (col.type == 'connectObject') {
									dataCollectionHelper.getDataCollection(application, col.setting.linkObject)
										.fail(next)
										.done(function (linkDC) {
											var colVal;
											var linkedCurrModel = linkDC.AB.getCurrModel(rootPageId);

											if (linkedCurrModel != null) {
												if (col.setting.linkType == 'collection')
													colVal = [linkedCurrModel.id];
												else
													colVal = linkedCurrModel.id;
											}

											next(null, colVal);
										});
								}
								else {
									next(null, null);
								}
							}
							else {
								// Get value in custom data field
								var customVal = dataFieldsManager.getValue(application, null, col, childView.$view, editValues);
								next(null, customVal);
							}

						},
						function (colVal, next) {
							if (colVal != null)
								modelData.attr(col.name, colVal);
							else if (editValues[col.name] != null)
								modelData.attr(col.name, editValues[col.name]);
							else
								modelData.removeAttr(col.name);

							next();
						}
					], ok);

				}, function (err) {
					if (err)
						q.reject(err);
					else
						q.resolve();
				});

				return q;
			}

			function saveModelData(dataCollection, object, columns, setting, linkedToDataCollection) {
				var self = this,
					q = $.Deferred();

				$$(self.viewId).showProgress({ type: "icon" });

				// Group app
				if (linkedToDataCollection && linkedToDataCollection.AB.getCheckedItems().length > 0) {
					var linkField = self.data.columns.filter(function (col) { return col.id == setting.linkField })[0];
					var addTasks = [];

					async.eachSeries(linkedToDataCollection.AB.getCheckedItems(), function (linkRowId) {
						async.series([
							function (next) {
								var modelData = new dataCollection.AD.getModelObject()(); // Create new model data

								populateValuesToModelData.call(self, modelData, dataCollection, columns)
									.fail(next)
									.done(function () { next() });
							},
							function (next) {
								// Set link row id to field
								modelData.attr(linkField.name, linkRowId);

								addTasks.push(function (ok) {
									callSaveModelData.call(self, modelData, dataCollection, true)
										.fail(ok)
										.done(function () { ok(); });
								});
							}
						]);
					}, function (error) {
						if (error) {
							q.reject(error);
						}
						else {
							async.parallel(addTasks, function (err) {
								if (err) q.reject(err);
								else {
									clearForm.call(self, object, columns, dataCollection);

									finishSave.call(self, setting, object, dataCollection);

									q.resolve();
								}
							});
						}
					});

				}
				// Save without link data (Single row)
				else {
					var modelData = getCurrentModel(setting),
						isAdd;

					// Create
					if (modelData === null) {
						modelData = new dataCollection.AD.getModelObject()(); // Create new model data
						isAdd = true;
					}

					async.series([
						function (next) {
							populateValuesToModelData.call(self, modelData, dataCollection, columns)
								.fail(next)
								.done(function () { next(); });
						},
						function (next) {
							callSaveModelData.call(self, modelData, dataCollection, isAdd)
								.fail(next)
								.done(function () { next(); });
						}
					], function (err) {
						if (err) {
							console.error(err);
							$$(self.viewId).hideProgress();
							q.reject(err);
						}
						else {
							finishSave.call(self, setting, object, dataCollection);

							q.resolve();
						}
					});

				}

				return q;
			}

			function callSaveModelData(modelData, dataCollection, isAdd) {
				var q = $.Deferred();

				modelData.save()
					.fail(q.reject)
					.done(function (result) {
						if (result.translate) result.translate();

						// Add to data collection
						if (isAdd)
							dataCollection.AD.__list.push(result);

						// Show success message
						webix.message({
							type: "success",
							text: labels.common.saveSuccessMessage.replace('{0}', result._dataLabel ? result._dataLabel : 'This data')
						});

						q.resolve();
					});

				return q;
			}

			function finishSave(setting, object, dataCollection) {
				var self = this;

				$$(self.viewId).hideProgress();

				if (setting.clearOnSave == 'yes')
					dataCollection.AB.setCurrModel(rootPageId, null);
				else if (dataCollection.AB.getCurrModel(rootPageId) == null) {
					clearForm.call(self, object, self.data.columns, dataCollection);
				}

				if (setting.afterSave && !isNaN(setting.afterSave)) {
					$(self).trigger('changePage', {
						pageId: setting.afterSave
					});
				}
				else {
					$(self).trigger('changePage', {
						previousPage: true
					});
				}
			}

			function showFields(object, columns, rowId, rowData) {
				var self = this;

				if (!columns || columns.length < 1) return;

				// Webix view
				if (rowData) {
					var modelData = rowData.attr ? rowData.attr() : rowData;
					$$(self.viewId).setValues(modelData);
				}
				else
					$$(self.viewId).setValues({});

				// Custom view
				columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					dataFieldsManager.customDisplay(col.fieldName, application, object, col, rowData, rowData ? rowData[col.name] : null, viewId, childView.$view);

					if (childView.config && childView.config.view === 'template') {
						if (childView.customEditEventId) webix.eventRemove(childView.customEditEventId);
						childView.customEditEventId = webix.event(childView.$view, "click", function (e) {
							showCustomEdit(col, col.setting, childView.$view);
						});
					}

					// Set default value
					if ((rowData == null || rowData[col.name] == null) && rowId == null) {
						if (childView.setValue && col.setting.default) {
							var defaultValue = col.setting.default;

							if (col.type == 'date' || col.type == 'datetime')
								defaultValue = new Date(col.setting.default);

							childView.setValue(defaultValue);
						}
						else if (col.fieldName == 'user' && col.setting.defaultCurrentUser == true) {

							// Get current user as default
							AD.comm.service.get({
								url: '/site/user/data'
							})
								.fail(function (err) {
									webix.message(err.message);
								})
								.done(function (data) {
									dataFieldsManager.setValue(col, childView.$view, {
										id: data.user.username,
										text: data.user.username
									});
								});
						}
					}
				});
			}

			function refreshLinkedData() {
				var self = this;

				if (data.linkedToDataCollection) {
					var checkedItems = [];
					data.linkedToDataCollection.AB.getCheckedItems().forEach(function (rowId) {
						var rowData = data.linkedToDataCollection.getItem(rowId);

						checkedItems.push({
							id: rowId,
							text: rowData._dataLabel
						});
					});
					selectivityHelper.renderSelectivity($$(self.viewId).$view, 'ab-component-form-add-group', true);
					selectivityHelper.setData($($$(self.viewId).$view).find('.ab-component-form-add-group'), checkedItems);
				}
			}

			function getChildView(columnName) {
				var childView = columnizerHelper.getColumns($$(componentIds.columns.replace('#viewId#', this.viewId))).find(function (view) {
					return view.config && view.config.name == columnName;
				});

				return childView;
			}

			function setElementHeights(columns, currModel) {
				var self = this;

				if (!columns || columns.length < 1) return;


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

					// Removed as this was overiding the webix container height.
					// childView.define('height', 35); // Default height
					childView.resize();
				});
			}

			function updateSaveButton(id) {
				var dfd = $.Deferred(),
					saveButton = $$(componentIds.saveButton.replace('#viewId', viewId));

				if (saveButton == null) {
					dfd.resolve();
					return dfd;
				}

				if (id == null) {
					saveButton.enable();
					dfd.resolve();
					return dfd;
				}

				dfd.resolve();

				return dfd;
			}

			function clearForm(object, columns, dataCollection) {
				var self = this;

				// Clear form
				$$(self.viewId).setValues({});
				// Clear custom views
				showFields.call(self, object, columns, null, null);
			}

			// Set viewId to public
			this.viewId = viewId;
			this.editViewId = componentIds.editForm;
			this.data = {};

			// Instance functions
			this.render = function (setting, editable, showAll, dataCollection, linkedToDataCollection, currComponent) {
				var self = this,
					q = $.Deferred(),
					elementViews = [],
					header = { rows: [] },
					listOptions = {}; // { columnId: [{}, ..., {}] }

				self.data.columns = [];
				data.setting = setting;
				data.dataCollection = dataCollection;
				data.linkedToDataCollection = linkedToDataCollection;

				setting.visibleFieldIds = setting.visibleFieldIds || [];

				$$(self.viewId).clear();
				$$(self.viewId).clearValidation();

				$$(self.viewId).hide();
				if (!setting.object) {
					q.resolve();
					return q;
				}

				webix.extend($$(self.viewId), webix.ProgressBar);
				$$(self.viewId).showProgress({ type: "icon" });

				// Get object
				data.object = application.objects.filter(function (obj) { return obj.id == setting.object; });
				if (!data.object || data.object.length < 1) return;
				data.object = data.object[0];

				if (events['onAfterCurrModelChange'] == null && data.dataCollection) {
					events['onAfterCurrModelChange'] = data.dataCollection.attachEvent('onAfterCurrModelChange', function (basePageId, rowId) {
						if (basePageId != rootPageId) return;

						async.series([
							function (next) {
								updateSaveButton(rowId).then(function () {
									next();
								}, next);
							},
							function (next) {
								var currModel = getCurrentModel(setting);

								// Show custom display
								showFields.call(self, data.object, self.data.columns, rowId, currModel);

								setElementHeights.call(self, self.data.columns, currModel);

								next();
							}
						]);
					});
				}

				if (events['onCheckItemsChange'] == null && data.linkedToDataCollection) {
					events['onCheckItemsChange'] = data.linkedToDataCollection.attachEvent('onCheckItemsChange', function () {
						refreshLinkedData.call(self);
					});
				}

				if (events['onAfterValidation'] == null && $$(viewId)) {
					$$(viewId).attachEvent('onAfterValidation', function (result, value) {
						if (!result) {
							var colNames = [];
							Object.keys(value).forEach(function (colName) {
								var col = self.data.columns.filter(function (c) { return c.name == colName; })[0];
								if (col) colNames.push(col.label);
							});

							webix.alert({
								title: "Form data is invalid",
								text: "Values of " + colNames.join(', '),
								ok: "Ok"
							});
						}
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

								self.data.columns = result;
								self.data.columns.sort(function (a, b) { return a.weight - b.weight; });

								next();
							});
					},
					// Get list options from database
					function (next) {
						var getOptionsTasks = [];

						self.data.columns.filter(function (col) { return col.setting.editor === 'richselect'; })
							.forEach(function (col) {
								getOptionsTasks.push(function (callback) {
									col.getList()
										.fail(callback)
										.then(function (result) {
											result.forEach(function (r) { if (r.translate) r.translate(); });

											listOptions[col.id] = $.map(result, function (opt, index) {
												return {
													id: opt.id,
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
						async.eachSeries(self.data.columns, function (col, callback) {
							var isVisible = setting.visibleFieldIds.indexOf(col.id.toString()) > -1 || showAll;

							if (!editable && !isVisible) { // Hidden
								callback();
								return;
							}

							var element = {
								name: col.name, // Field name
								labelWidth: 100
							};
							element.label = col.label;

							if (col.type == 'boolean') {
								element.view = 'checkbox';
							}
							else if (col.setting.editor === 'popup') {
								element.view = 'textarea';
							}
							else if (col.setting.editor === 'number') {
								// element.view = 'counter';
								// element.pattern = { mask: "##############", allow: /[0-9]/g }; // Available in webix PRO edition
								element.view = 'text';
								element.required = false;
								element.validate = function (val) { return !isNaN(val * 1); };
								element.attributes = { type: "number" };
								element.value = col.setting.default;
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
							else if (col.setting.editor === 'richtext') {

								var template = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>"
									.replace(/#width#/g, element.labelWidth - 3)
									.replace(/#label#/g, element.label);

								// element.height = 250;
								element.cols = [
									{
										view: 'template',
										minHeight: 45,
										borderless: true,
										template: template,
										width: element.labelWidth + 5
									},
									{
										view: 'template',
										template: "<div class='ab-richtext-data-field'></div>",
										height: 375,
										css: 'richtext-container',
										borderless: true,
									}
								];

								console.log('col.setting.editorId: --> ', col.setting.editorId)

								console.log('element: ---> ', element)

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
							}
							else {
								element.view = col.setting.editor;
							}

							if (editable) { // Show/Hide options
								var isLinkField = setting.linkField && setting.linkField == col.id;

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
											value: isVisible && !isLinkField ? "show" : "hide",
											disabled: isLinkField,
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
						var columnCount = parseInt(setting.colCount, 10) || 1;
						var columnView = columnizerHelper.columnize(elementViews, columnCount);
						columnView.id = componentIds.columns.replace('#viewId#', self.viewId);
						webix.ui([columnView], $$(self.viewId));

						// Title
						if (editable) {
							header.rows.push({
								id: componentIds.title,
								view: 'text',
								placeholder: 'Title',
								css: 'ab-component-header',
								value: currComponent.title || '',
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
						else if (currComponent.title) {
							header.rows.push({
								view: 'label',
								css: 'ab-component-header',
								label: currComponent.title || ''
							});
						}

						// Description
						if (editable) {
							header.rows.push({
								id: componentIds.description,
								view: 'textarea',
								placeholder: 'Description',
								css: 'ab-component-description',
								value: currComponent.description || '',
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
						else if (currComponent.description) {
							header.rows.push({
								view: 'label',
								css: 'ab-component-description',
								label: currComponent.description || ''
							});
						}

						if (linkedToDataCollection) {
							header.rows.push({
								cols: [
									{
										view: 'label',
										label: 'Add to...',
										width: 100
									},
									{
										view: 'template',
										borderless: true,
										template: '<div class="ab-component-form-add-group"></div>'
									}
								]
							});
						}

						$$(self.viewId).addView(header, 0);

						// Show checked items in selectivity
						refreshLinkedData.call(self);

						// Save/Cancel buttons
						var actionButtons = {
							cols: [{}]
						};

						if (setting.saveVisible === 'show') {
							var saveButtonId = componentIds.saveButton.replace('#viewId', self.viewId);

							actionButtons.cols.push({
								id: saveButtonId,
								view: "button",
								type: "form",
								value: setting.saveLabel || "Save",
								width: 90,
								inputWidth: 80,
								disabled: editable,
								click: function () {
									var saveButton = this;

									if (!$$(self.viewId).validate()) return;

									if ($$(saveButton))
										$$(saveButton).disable();

									saveModelData.call(self, dataCollection, data.object, self.data.columns, setting, linkedToDataCollection)
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
								value: setting.cancelLabel || "Cancel",
								width: 90,
								inputWidth: 80,
								disabled: editable,
								click: function () {
									data.dataCollection.AB.setCurrModel(rootPageId, null);

									clearForm.call(self, data.object, self.data.columns, data.dataCollection);

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
						if (dataCollection)
							currData = getCurrentModel(setting);

						// Show data of current select data
						showFields.call(self, data.object, self.data.columns, currData ? currData.id : null, currData);

						next();
					},
					// Enable/Disable save button
					function (next) {
						var cursorId;
						if (dataCollection && dataCollection.AB.getCurrModel() != null) {
							cursorId = dataCollection.AB.getCurrModel().id;
						}
						updateSaveButton(cursorId).then(function () {
							next();
						}, next);
					}
				], function (err) {
					if (err) {
						q.reject();
						return q;
					}

					$$(self.viewId).adjust();
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

			this.populateSettings = function (setting, showAll) {
				var self = this,
					dataCollection,
					linkedToDataCollection;

				var editItem = application.currPage.components.filter(function (c) { return c.id == componentId; })[0];

				async.series([
					// Get data collection
					function (next) {
						dataCollectionHelper.getDataCollection(application, setting.object)
							.fail(function (err) {
								delete setting.object;
								next();
							})
							.done(function (result) {
								dataCollection = result;
								next();
							});
					},
					// Get linked data colllection
					function (next) {
						if (setting.linkedTo && setting.linkedTo !== 'none') {
							dataCollectionHelper.getDataCollection(application, setting.linkedTo)
								.fail(function (err) {
									delete setting.linkedTo;
									next();
								})
								.done(function (result) {
									linkedToDataCollection = result;
									next();
								});
						}
						else {
							next();
						}
					},
					function (next) {
						application.getApplicationPages(application.currPage)
							.fail(function (err) { next(err); })
							.then(function (pages) {

								var afterSave = $$(componentIds.propertyView).getItem(componentIds.afterSave);
								afterSave.options = pages.map(function (p) {
									if (p.translate) p.translate();

									return {
										id: p.id,
										value: p.label
									};
								}).attr();

								afterSave.options.splice(0, 0, {
									id: null,
									value: '[Go To]'
								});

								next();
							});
					},
					// Render form component
					function (next) {
						self.render(setting, true, showAll, dataCollection, linkedToDataCollection)
							.fail(next)
							.done(function () { next(); });
					},
					// Properties
					// Data source - Object
					function (next) {
						if (!application.objects)
							return next();

						// Data source - Object
						var objectList = $$(componentIds.propertyView).getItem(componentIds.selectObject);
						objectList.options = $.map(application.objects, function (o) {
							return {
								id: o.id,
								value: o.label
							};
						});

						// Data source - Linked to
						var linkedObjIds = self.data.columns
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

						next();
					},
					// Misc - Column
					function (next) {
						var colCountOptions = [1, 2, 3];
						var colCountSource = $$(componentIds.propertyView).getItem(componentIds.selectColCount);
						colCountSource.options = $.map(colCountOptions, function (o) {
							return {
								id: o,
								value: o
							};
						});

						next();
					}
				], function (err) {
					if (err) return;

					// Set property values
					var propValues = {};
					propValues[componentIds.editTitle] = editItem ? (editItem.title || '') : '';
					propValues[componentIds.editDescription] = editItem ? (editItem.description || '') : '';
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
				});
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.onDisplay = function () {
				var self = this;

				if (!data.dataCollection) return;

				var currModel = getCurrentModel(data.setting);

				if (data.setting.clearOnLoad === 'yes') {
					clearForm.call(self, data.object, self.data.columns, data.dataCollection);
				}

				setElementHeights.call(self, self.data.columns, currModel);

				self.data.columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					// Set default connect data when add
					if (col.fieldName == 'connectObject' && !currModel) {
						dataCollectionHelper.getDataCollection(application, col.setting.linkObject)
							.then(function (linkedDataCollection) {
								var linkCurrModel = linkedDataCollection.AB.getCurrModel(rootPageId);
								if (!linkCurrModel) return;

								// Get default value of linked data
								var defaultVal = {
									id: linkCurrModel.id,
									text: linkCurrModel._dataLabel,
									objectId: data.setting.object, // ABObject.id
									columnName: col.name,
									rowId: linkCurrModel.id
								};

								dataFieldsManager.setValue(col, childView.$view, defaultVal);
							});
					}
				});

			};

			this.resize = function (width, height) {
				$$(this.viewId).adjust();
			};

		}

		// Static functions
		formComponent.getInfo = function () {
			return {
				name: 'form',
				icon: 'fa-list-alt',
				propertyView: componentIds.propertyView
			};
		};

		formComponent.getView = function () {
			var self = this;

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
						console.log('onAfterEditStop ---- ');
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
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.populateSettings(setting, true);
								break;
						}
					}
				}
			};
		};

		formComponent.resize = function (height) {
			$$(componentIds.editView).define('height', height - 150);
			$$(componentIds.editView).resize();
		};

		return formComponent;

	}
);
