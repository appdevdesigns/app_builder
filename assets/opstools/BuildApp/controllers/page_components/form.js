steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/ColumnizerHelper.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',

	'opstools/BuildApp/controllers/page_components/form/fields.js',
	'opstools/BuildApp/controllers/page_components/form/submit_rules.js',
	'opstools/BuildApp/controllers/page_components/form/display_rules.js',
	'opstools/BuildApp/controllers/page_components/form/record_rules.js',

	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',
	function (dataFieldsManager, dataCollectionHelper, columnizerHelper, selectivityHelper,
		fields_tab, submit_rules_tab, display_rules_tab, record_rules_tab) {
		var componentIds = {
			editView: 'ab-form-edit-view',
			editForm: 'ab-form-edit-mode',

			title: 'ab-form-title',
			description: 'ab-form-description',
			columns: '#viewId#-columns',

			propertyView: 'ab-form-property-view',

			saveButton: 'ab-form-save-button-#viewId#',

			fieldPropertyView: 'ab-form-fields-property-view',
			editTitle: 'ab-form-edit-title',
			editDescription: 'ab-form-edit-description',

			submitRulesPropertyView: 'ab-form-submit-rules-property-view',
		},
			labels = {
				common: {
					saveSuccessMessage: AD.lang.label.getLabel('ab.common.save.success') || "<b>{0}</b> is saved."
				}
			},
			tabs = {
				fields: new fields_tab(),
				submit_rules: new submit_rules_tab(),
				display_rules: new display_rules_tab(),
				record_rules: new record_rules_tab()
			};


		//Constructor
		var formComponent = function (application, viewId, componentId) {
			var data = {},
				events = {}, // { eventName: eventId, ..., eventNameN: eventIdN }
				customEditTimeout = {}; // { colId: timeoutId }


			// Private methods
			function showCustomEdit(column, current_view) {
				if (customEditTimeout[column.id]) clearTimeout(customEditTimeout[column.id]);
				customEditTimeout[column.id] = setTimeout(function () {
					var rowId;

					if (data.dataCollection) {
						var currModel = data.dataCollection.AD.currModel(),
							rowId = currModel ? currModel.id : null;
					}

					dataFieldsManager.customEdit(application, data.object, column, rowId, current_view);
				}, 50);
			}

			function populateValuesToModelData(modelData, dataCollection, columns) {
				var self = this,
					q = $.Deferred(),
					editValues = $$(self.viewId).getValues(),
					keys = Object.keys(editValues),
					colVal;

				// Populate values to model
				async.each(columns, function (col, ok) {
					async.series([
						function (next) {
							var childView = getChildView.call(self, col.name);
							if (childView == null) {
								// If link column is hidden, then select cursor item of linked data collection
								if (col.type == 'connectObject') {
									dataCollectionHelper.getDataCollection(application, col.setting.linkObject)
										.done(function (linkDC) {
											if (col.setting.linkType == 'collection')
												colVal = [linkDC.getCursor()];
											else
												colVal = linkDC.getCursor();
										});
								}
							}
							else {
								// Get value in custom data field
								colVal = dataFieldsManager.getValue(application, null, col, childView.$view, editValues);
							}

							next();
						},
						function (next) {
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
				if (linkedToDataCollection && linkedToDataCollection.getCheckedItems().length > 0) {
					var linkField = self.data.columns.filter(function (col) { return col.id == setting.linkField })[0];
					var addTasks = [];

					async.eachSeries(linkedToDataCollection.getCheckedItems(), function (linkRowId) {
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
					var modelData = dataCollection.AD.currModel(),
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
							finishSave.call(self, setting, object, dataCollection, modelData);

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

						q.resolve();
					});

				return q;
			}

			function finishSave(setting, object, dataCollection, modelData) {
				var self = this;

				$$(self.viewId).hideProgress();

				if (setting.clearOnSave == 'yes')
					dataCollection.setCursor(null);
				else if (dataCollection.getCursor() == null) {
					clearForm.call(self, object, self.data.columns, dataCollection);
				}

				// Submit rules
				if (setting.submitRules && setting.submitRules.length > 0) {
					setting.submitRules.forEach(function (rule) {
						// Check conditions
						var isCorrect = true;
						if (rule.whens && rule.whens.length > 0) {
							rule.whens.forEach(function (when) {
								if (isCorrect == false) return;

								var column = object.columns.filter(function (col) { return col.id == when.columnId })[0];
								if (column == null) return;

								var val = modelData[column.name].attr ? modelData[column.name].attr() : modelData[column.name];

								switch (when.condition) {
									case 'contains':
										isCorrect = (val.indexOf(when.compareValue) > -1);
										break;
									case 'does not contain':
										isCorrect = (val.indexOf(when.compareValue) < 0);
										break;
									case 'is':
										isCorrect = (val == when.compareValue);
										break;
									case 'is not':
										isCorrect = (val != when.compareValue);
										break;
									case 'starts with':
										isCorrect = val.toString().startsWith(when.compareValue);
										break;
									case 'end with':
										isCorrect = val.toString().endsWith(when.compareValue);
										break;
								}
							});
						}

						// Action rule
						if (isCorrect) {
							switch (rule.action) {
								case "confirm_message":
									var confirmMessage = rule.confirmMessage || labels.common.saveSuccessMessage.replace('{0}', result._dataLabel ? result._dataLabel : 'This data');
									// Show success message
									webix.message({
										type: "success",
										text: confirmMessage
									});
									break;
								case "parent_page":
									// TODO
									break;
								case "exists_page":
									$(self).trigger('changePage', {
										pageId: rule.redirectPageId
									});
									break;
							}
						}

					});

				}

				// if (setting.afterSave && !isNaN(setting.afterSave)) {
				// 	$(self).trigger('changePage', {
				// 		pageId: setting.afterSave
				// 	});
				// }
				// else {
				// 	$(self).trigger('changePage', {
				// 		previousPage: true
				// 	});
				// }
			}

			function showCustomFields(object, columns, rowId, rowData) {
				var self = this;

				if (!columns || columns.length < 1) return;

				// Custom view
				columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					dataFieldsManager.customDisplay(col.fieldName, application, object, col, rowData, rowData ? rowData[col.name] : null, viewId, childView.$view);

					if (childView.config && childView.config.view === 'template') {
						if (childView.customEditEventId) webix.eventRemove(childView.customEditEventId);
						childView.customEditEventId = webix.event(childView.$view, "click", function (e) {
							showCustomEdit(col, childView.$view);
						});
					}
					// Set default value
					else if ((rowData == null || rowData[col.name] == null) && rowId == null && childView.setValue && col.setting.default) {
						var defaultValue = col.setting.default;

						if (col.type == 'date' || col.type == 'datetime')
							defaultValue = new Date(col.setting.default);

						childView.setValue(defaultValue);
					}
				});
			}

			function refreshLinkedData() {
				var self = this;

				if (data.linkedToDataCollection) {
					var checkedItems = [];
					data.linkedToDataCollection.getCheckedItems().forEach(function (rowId) {
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

					childView.define('height', 35); // Default height
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
				showCustomFields.call(self, object, columns, null, null);
			}

			// Set viewId to public
			this.viewId = viewId;
			this.editViewId = componentIds.editForm;
			this.data = {};

			// Instance functions
			this.render = function (setting, editable, showAll, dataCollection, linkedToDataCollection) {
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

				if (events['onAfterCursorChange'] == null && data.dataCollection) {
					events['onAfterCursorChange'] = data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
						async.series([
							function (next) {
								updateSaveButton(id).then(function () {
									next();
								}, next);
							},
							function (next) {
								var currModel = data.dataCollection.AD.currModel();

								// Show custom display
								showCustomFields.call(self, data.object, self.data.columns, id, currModel);

								setElementHeights.call(self, self.data.columns, currModel);

								next();
							}
						])
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
								value: setting.title || '',
								on: {
									onChange: function (newv, oldv) {
										if (newv != oldv) {
											var propValues = $$(componentIds.fieldPropertyView).getValues();
											propValues[componentIds.editTitle] = newv;
											$$(componentIds.fieldPropertyView).setValues(propValues);
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
											var propValues = $$(componentIds.fieldPropertyView).getValues();
											propValues[componentIds.editDescription] = newv;
											$$(componentIds.fieldPropertyView).setValues(propValues);
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
									data.dataCollection.setCursor(null);

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
						if (dataCollection) {
							$$(self.viewId).bind(dataCollection);
							currData = dataCollection.AD.currModel();
						}

						// Show data of current select data
						showCustomFields.call(self, data.object, self.data.columns, currData ? currData.id : null, currData);

						next();
					},
					// Enable/Disable save button
					function (next) {
						var cursorId;
						if (dataCollection && dataCollection.getCursor() != null) {
							cursorId = dataCollection.getCursor();
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
				var settings = {};

				setting = $.extend(
					settings,
					tabs.fields.getSettings(),
					tabs.submit_rules.getSettings());

				return settings;
			};

			this.populateSettings = function (setting, showAll) {
				var self = this,
					dataCollection,
					linkedToDataCollection,
					pages = [];

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
							.then(function (result) {
								result.forEach(function (p) {
									if (p.translate) p.translate();
								});

								pages = result;

								next();
							});
					},
					// Render form component
					function (next) {
						self.render(setting, true, showAll, dataCollection, linkedToDataCollection)
							.fail(next)
							.done(function () { next(); });
					}
				], function (err) {
					if (err) return;

					var additionalData = {
						formInstance: self,
						application: application,
						dataCollection: dataCollection,
						linkedToDataCollection: linkedToDataCollection,
						columns: self.data.columns,
						pages: pages
					};

					// Set property values
					tabs.fields.populateSettings(setting, showAll, additionalData);
					tabs.submit_rules.populateSettings(setting, showAll, additionalData);
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
								var linkCurrModel = linkedDataCollection.AD.currModel();
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
				// $$(this.viewId).adjust();
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
				view: "tabview",
				padding: 5,
				tabbar: {
					on: {
						onAfterRender: function () {
							$$(componentIds.editForm).adjust();
						},
						onChange: function (newv, oldv) {
							switch (this.optionIndex(this.getValue())) {
								case 0: // fields
									$$(componentIds.fieldPropertyView).show();
									break;
								case 1: // submit rules
									$$(componentIds.submitRulesPropertyView).show();
									break;
								case 2: // display rules
									break;
								case 3: // record rules
									break;
							}

							if ($$(newv)) {
								$$(newv).adjust();
							}
						}
					}
				},
				multiview: {
					css: 'ab-scroll-y'
				},
				cells: [
					{
						header: "Fields",
						body: tabs.fields.getEditView(form)
					},
					{
						header: "Submit Rules",
						body: tabs.submit_rules.getEditView()
					},
					{
						header: "Display Rules"
					},
					{
						header: "Record Rules"
					}
				]
			};

			return editView;
		};

		formComponent.getPropertyView = function (componentManager) {
			return {
				id: componentIds.propertyView,
				cells: [
					tabs.fields.getPropertyView(componentManager),
					tabs.submit_rules.getPropertyView(componentManager)
				]
			};
		};

		formComponent.resize = function (height) {
			if ($$(componentIds.editView)) {
				$$(componentIds.editView).define('height', height - 140);
				$$(componentIds.editView).resize();

				$$(componentIds.editView).getMultiview().define('height', height - 200);
				$$(componentIds.editView).getMultiview().resize();
			}

			tabs.fields.resize(height);
			tabs.submit_rules.resize(height);
		};

		return formComponent;

	}
);