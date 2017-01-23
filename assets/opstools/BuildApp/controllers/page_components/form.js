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
			var data = {},
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

			function saveModelData(dataCollection, object, columns, setting, linkedToDataCollection) {
				var self = this,
					q = $.Deferred(),
					modelData = dataCollection.AD.currModel(),
					isAdd;

				$$(self.viewId).showProgress({ type: "icon" });

				// Create
				if (modelData === null) {
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
			}

			function showCustomFields(object, columns, rowId, rowData) {
				var self = this;

				if (!columns || columns.length < 1) return;

				// Custom view
				columns.forEach(function (col) {
					var childView = getChildView.call(self, col.name);
					if (!childView) return;

					dataFieldsManager.customDisplay(col.fieldName, application, object, col, rowId, rowData ? rowData[col.name] : null, viewId, childView.$view);

					if (childView.config && childView.config.view === 'template') {

						if (childView.customEditEventId) webix.eventRemove(childView.customEditEventId);
						childView.customEditEventId = webix.event(childView.$view, "click", function (e) {
							showCustomEdit(col, childView.$view);
						});

					}
				});
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

				if (data.dataCollection) {
					data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
						var currModel = data.dataCollection.AD.currModel();
						// Show custom display
						showCustomFields.call(self, data.object, self.data.columns, id, currModel);

						setElementHeights.call(self, self.data.columns, currModel);
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
								element.validate = webix.rules.isNumber;
								element.validateEvent = 'key';
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

						var checkedItemIds = Object.keys(linkedToDataCollection.checkedItems);
						if (linkedToDataCollection && checkedItemIds.length > 0) {
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
						if (linkedToDataCollection && checkedItemIds.length > 0) {
							var checkedItems = [];
							checkedItemIds.forEach(function (rowId) {
								var rowData = linkedToDataCollection.getItem(rowId);

								checkedItems.push({
									id: rowId,
									text: rowData._dataLabel
								});
							});
							selectivityHelper.renderSelectivity($$(self.viewId).$view, 'ab-component-form-add-group', true);
							selectivityHelper.setData($($$(self.viewId).$view).find('.ab-component-form-add-group'), checkedItems);
						}

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
								value: "Cancel",
								width: 90,
								inputWidth: 80,
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
					cancelVisible: propertyValues[componentIds.isCancelVisible],
					clearOnLoad: propertyValues[componentIds.clearOnLoad],
					clearOnSave: propertyValues[componentIds.clearOnSave],
				};

				return settings;
			};

			this.populateSettings = function (setting, showAll) {
				var self = this,
					dataCollection,
					linkedToDataCollection;

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
					// Get linked data colllection
					function (next) {
						if (setting.linkedTo && setting.linkedTo !== 'none') {
							dataCollectionHelper.getDataCollection(application, setting.linkedTo)
								.fail(next)
								.then(function (result) {
									linkedToDataCollection = result;
									next();
								});
						}
						else {
							next();
						}
					},
					// Render form component
					function (next) {
						self.render(setting, true, showAll, dataCollection, linkedToDataCollection)
							.fail(next)
							.then(function () { next(); });
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
				], function () {
					// Set property values
					var propValues = {};
					propValues[componentIds.editTitle] = setting.title || '';
					propValues[componentIds.editDescription] = setting.description || '';
					propValues[componentIds.selectObject] = setting.object;
					propValues[componentIds.linkedTo] = setting.linkedTo;
					propValues[componentIds.linkField] = setting.linkField;
					propValues[componentIds.selectColCount] = setting.colCount;
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