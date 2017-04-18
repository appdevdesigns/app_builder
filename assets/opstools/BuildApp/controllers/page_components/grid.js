steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/ObjectDataTable.js',

	'opstools/BuildApp/controllers/webix_custom_components/DynamicDataTable.js',
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/UpdateRecordsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DeleteRecordsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',

	function (dataCollectionHelper) {
		var componentIds = {
			editView: 'ab-grid-edit-view',
			editTitle: 'ab-grid-edit-title',
			editDescription: 'ab-grid-edit-description',
			editDataTable: 'ab-grid-edit-mode',
			editHeader: 'ab-grid-edit-header',

			header: 'ab-grid-header-{id}',
			toolbar: 'ab-grid-toolbar-{id}',

			columnList: 'ab-grid-columns-list',

			propertyView: 'ab-grid-property-view',

			filterFieldsPopup: 'ab-grid-filter-popup',
			sortFieldsPopup: 'ab-grid-sort-popup'
		};

		// Instance functions
		var gridComponent = function (application, viewId, componentId) {
			var data = {},
				events = {}; // { eventName: eventId, ..., eventNameN: eventIdN }

			function getMaxWeight(columns) {
				if (!columns) return 0;

				var weightList = columns.map(function (col) { return col.weight; });
				return Math.max.apply(null, weightList);
			}

			function getObjectDataTable(application, objectId, columns) {
				if (!this.data.objectDataTable) {
					var ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable');

					this.data.objectDataTable = new ObjectDataTable();
					this.data.objectDataTable.setReadOnly(true);
				}


				//// Refactor Note:
				// 
				// Here we are in a Grid Component.  And in many places we access the objects in our application by:
				// application.objects.filter()
				//
				// It is a good assumption that the Grid Component knows it needs to get Objects from the Application
				// object.  
				//
				// However, a Grid Component should not have any understanding of HOW the Application Object is internally
				// storing it's data.
				//
				// Now, if we ever decide to change how the Application object stores it's data, we have broken code 
				// all over the place.
				//
				// Whenever we want to get data that is managed by another Object, we should ask the Object for it:
				// 		application.getObjects(filterFn());   // returns an {array} of objects
				// 		application.getObjectById(objectId);  // return an object directly
				// 
				// 
				var object = application.objects.filter(function (obj) { return obj.id == objectId });
				if (object && object[0]) object = object[0];

				this.data.objectDataTable.registerDataTable(application, object, columns, $$(this.viewId));

				return this.data.objectDataTable;
			};

			function bindColumnList(objectId, selectAll) {
				$$(componentIds.columnList).clearAll();

				if (!this.data.columns || this.data.columns.length < 1) return;

				var columns = this.data.columns.attr().slice(0); // Clone array

				// Select this object at first time
				var visibleColumns = this.data.visibleColumns ? this.data.visibleColumns.slice(0) : [];
				if ($.grep(columns, function (d) { return visibleColumns.indexOf(d.id.toString()) > -1; }).length < 1) {
					visibleColumns = visibleColumns.concat($.map(columns, function (d) { return d.id.toString(); }));
				}

				// Initial checkbox
				columns.forEach(function (d) {
					d.markCheckbox = visibleColumns.filter(function (c) { return c == d.id; }).length > 0;
				});

				$$(componentIds.columnList).parse(columns);
			};

			function populateData(objectId, dataCollection, columns) {
				var self = this;

				if ($$(self.viewId).showProgress)
					$$(self.viewId).showProgress({ type: 'icon' });

				getObjectDataTable.call(self, application, objectId, columns)
					.populateData(dataCollection);

				if ($$(self.viewId).hideProgress)
					$$(self.viewId).hideProgress();
			};

			function filterLinkedData(linkedField) {
				var self = this;

				if (!self.data.columns) return;

				var field = self.data.columns.filter(function (col) { return col.id == linkedField; })[0];

				if (self.data.linkedToDataCollection && field) {
					var currModel = self.data.linkedToDataCollection.AD.currModel();

					if (currModel) {
						$$(self.viewId).custom_filters = $$(self.viewId).custom_filters || {};
						$$(self.viewId).custom_filters['linked_collection_filter'] = function (item) {
							var itemValues = item[field.name];

							if (!itemValues) {
								return false;
							}
							else if (itemValues && !itemValues.filter) {
								itemValues = [itemValues]; // Convert to array
							}

							return itemValues.filter(function (f) { return f.id == currModel.id; }).length > 0;
						};
					}

					$$(self.viewId).refresh();
				}
			};



			// Set viewId to public
			this.viewId = viewId;
			this.editViewId = componentIds.editDataTable;
			this.data = data;

			this.render = function (setting, editable, showAll, dataCollection, linkedToDataCollection) {
				var self = this,
					columns = [],
					q = $.Deferred();

				webix.extend($$(self.viewId), webix.ProgressBar);
				$$(self.viewId).showProgress({ type: 'icon' });

				self.data.setting = setting;
				self.data.dataCollection = dataCollection;

				// Initial linked dataCollection events
				if (linkedToDataCollection) {
					self.data.linkedToDataCollection = linkedToDataCollection;
					if (events['onAfterCursorChange'] == null) {
						events['onAfterCursorChange'] = self.data.linkedToDataCollection.attachEvent('onAfterCursorChange', function (id) {
							$$(self.viewId).refresh();
						});
					}
				}

				if (setting.columns)
					self.data.visibleColumns = $.map(setting.columns, function (cId) { return cId.toString(); });

				AD.util.async.parallel([
					function (next) {
						self.data.columns = [];

						if (!setting.object)
							return next();

						var object = application.objects.filter(function (obj) { return obj.id == setting.object; });
						if (!object || object.length > 0)
							object = object[0];

						// Get object list
						object.getColumns()
							.fail(function (err) { next(err); })
							.then(function (result) {
								result.forEach(function (d) {
									if (d.translate) d.translate();
								});

								self.data.columns = result;

								if (self.data.columns) {
									if (!self.data.visibleColumns) self.data.visibleColumns = [];

									columns = self.data.columns.slice(0);

									// Show all
									if (showAll && $.grep(columns, function (d) { return self.data.visibleColumns.indexOf(d.id.toString()) > -1; }).length < 1) {
										self.data.visibleColumns = $.map(columns, function (col) { return col.id; });
									}
									else
										columns = columns.filter(function (c) {
											return self.data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
										}).slice(0);
								}

								next();
							});
					},
					function (next) {
						var dataTableController = getObjectDataTable.call(self, application, setting.object, self.data.columns);
						dataTableController.bindColumns(application, columns, true, setting.selectable === 'enable', setting.removable === 'enable');
						dataTableController.registerDeleteRowHandler(function (deletedId) {
							$$(self.viewId).showProgress({ type: 'icon' });

							// Delete data
							dataCollection.AD.destroyModel(deletedId.row)
								.fail(function (err) {
									AD.error.log('Error destroying entry.', { error: err, id: deletedId.row });

									$$(self.viewId).hideProgress();
								})
								.then(function (oldData) {
									$$(self.viewId).hideProgress();
								});
						});
						next();
					}
				], function (err) {
					if (err) {
						q.reject(err);
						return;
					}

					self.renderDataTable(
						dataCollection,
						{
							viewPage: setting.viewPage,
							viewId: setting.viewId,
							editPage: setting.editPage,
							editForm: setting.editForm
						},
						setting.selectable,
						setting.removable,
						setting.linkedField);

					$$(self.viewId).hideProgress();

					var header = {
						view: 'layout',
						autoheight: true,
						rows: []
					};

					if (editable) {
						header.id = componentIds.editHeader;

						$$(componentIds.editView).removeView(componentIds.editHeader);

						// Title
						header.rows.push({
							id: componentIds.editTitle,
							view: 'text',
							placeholder: 'Title',
							css: 'ab-component-header',
							value: setting.title || '',
							on: {
								onChange: function (newv, oldv) {
									if (newv != oldv) {
										var propValues = $$(componentIds.propertyView).getValues();
										propValues.title = newv;
										$$(componentIds.propertyView).setValues(propValues);
									}
								}
							}
						});

						// Description
						header.rows.push({
							id: componentIds.editDescription,
							view: 'textarea',
							placeholder: 'Description',
							css: 'ab-component-description',
							value: setting.description || '',
							inputHeight: 60,
							height: 60,
							on: {
								onChange: function (newv, oldv) {
									if (newv != oldv) {
										var propValues = $$(componentIds.propertyView).getValues();
										propValues.description = newv;
										$$(componentIds.propertyView).setValues(propValues);
									}
								}
							}
						});

					}
					else { // Label
						header.id = componentIds.header.replace('{id}', viewId);
						header.width = 800;

						if (setting.title) {
							header.rows.push({
								view: 'label',
								css: 'ab-component-header ab-ellipses-text',
								label: setting.title || ''
							});
						}

						if (setting.description) {
							header.rows.push({
								view: 'label',
								css: 'ab-component-description ab-ellipses-text',
								label: setting.description || ''
							});
						}
					}

					var action_buttons = [];

					if (setting.massUpdate === 'enable') {
						var object = application.objects.filter(function (obj) { return obj.id == self.data.setting.object });

						action_buttons.push({
							view: 'button', id: self.viewId + '-update-items-button', label: 'Update records', icon: "pencil", type: "icon", width: 140,
							click: function () {
								if ($$('ab-update-records-popup')) {
									$$('ab-update-records-popup').define('application', application);
									$$('ab-update-records-popup').define('objectModel', object[0]);
									$$('ab-update-records-popup').define('dataTable', $$(self.viewId));
									$$('ab-update-records-popup').define('dataCollection', self.data.dataCollection);
									$$('ab-update-records-popup').define('columns', columns);
									$$('ab-update-records-popup').show(this.$view);
								}
							}
						});
					}

					if (setting.selectable == 'enable' && setting.removable === 'enable') {
						action_buttons.push({
							view: 'button', id: self.viewId + '-delete-items-button', label: 'Delete records', icon: "trash", type: "icon", width: 140,
							click: function () {
								if ($$('ab-delete-records-popup')) {
									$$('ab-delete-records-popup').define('objectModel', object[0]);
									$$('ab-delete-records-popup').define('dataTable', $$(self.viewId));
									$$('ab-delete-records-popup').define('dataCollection', self.data.dataCollection);
									$$('ab-delete-records-popup').define('columns', columns);
									$$('ab-delete-records-popup').show(this.$view);
								}
							}
						});
					}

					if (setting.filter === 'enable') {
						action_buttons.push({
							view: 'button', id: self.viewId + '-filter-button', label: 'Add filters', icon: "filter", type: "icon", width: 120, badge: 0,
							click: function () {
								if ($$('ab-filter-popup')) {
									$$('ab-filter-popup').define('dataTable', $$(self.viewId));
									$$('ab-filter-popup').define('columns', columns);

									if (events['filterPopupOnChange'] == null) {
										events['filterPopupOnChange'] = $$('ab-filter-popup').attachEvent('onChange', function (dataTableId, num) {
											if (self.viewId == dataTableId) {
												$$(self.viewId + '-filter-button').define('badge', num);
												$$(self.viewId + '-filter-button').refresh();
											}
										});
									}

									$$('ab-filter-popup').show(this.$view);
								}
							}
						});
					}

					if (setting.sort === 'enable') {
						action_buttons.push({
							view: 'button', id: self.viewId + '-sort-button', label: 'Apply sort', icon: "sort", type: "icon", width: 120, badge: 0,
							click: function () {
								if ($$('ab-sort-popup')) {
									$$('ab-sort-popup').define('dataTable', $$(self.viewId));
									$$('ab-sort-popup').define('columns', columns);

									if (events['sortPopupOnChange'] == null) {
										events['sortPopupOnChange'] = $$('ab-sort-popup').attachEvent('onChange', function (dataTableId, num) {
											if (self.viewId == dataTableId) {
												$$(self.viewId + '-sort-button').define('badge', num);
												$$(self.viewId + '-sort-button').refresh();
											}
										});
									}

									$$('ab-sort-popup').show(this.$view);
								}
							}
						});
					}

					if (action_buttons.length > 0) {
						header.rows.push({
							view: 'toolbar',
							id: componentIds.toolbar.replace('{id}', viewId),
							autoheight: true,
							cols: action_buttons
						});
					}

					if (editable) {
						if (header.rows.length > 0)
							$$(componentIds.editView).addView(header, 0);
					}
					else {
						$$(self.viewId).clearAdditionalView();
						if (header.rows.length > 0)
							$$(self.viewId).prependView(header, true);
					}

					if ($$(componentIds.toolbar.replace('{id}', viewId))) {
						$$(componentIds.toolbar.replace('{id}', viewId)).$setSize($$(viewId).config.width + 3);
					}

					if (self.data.dataCollection && self.data.dataCollection.getCheckedItems().length > 0) {
						if ($$(self.viewId + '-update-items-button'))
							$$(self.viewId + '-update-items-button').enable();

						if ($$(self.viewId + '-delete-items-button'))
							$$(self.viewId + '-delete-items-button').enable();
					}
					else {
						if ($$(self.viewId + '-update-items-button'))
							$$(self.viewId + '-update-items-button').disable();

						if ($$(self.viewId + '-delete-items-button'))
							$$(self.viewId + '-delete-items-button').disable();
					}

					// Select edit item
					getObjectDataTable.call(self, application, setting.object, self.data.columns)
						.registerItemClick(function (id, e, node) {
							switch (id.column) {
								case 'view_detail':
									$(self).trigger('changePage', {
										pageId: setting.viewPage
									});

									if (!$$(self.viewId).config.multiselect || !$$(self.viewId).config.select)
										$$(self.viewId).define('select', true);

									if (dataCollection)
										dataCollection.setCursor((id.row || id));
									break;
								case 'edit_form':
									$(self).trigger('changePage', {
										pageId: setting.editPage
									});

									if (!$$(self.viewId).config.multiselect || !$$(self.viewId).config.select)
										$$(self.viewId).define('select', true);

									if (dataCollection)
										dataCollection.setCursor((id.row || id));
									break;
							}
						});

					if (events['onAfterRender'] == null) {
						events['onAfterRender'] = $$(self.viewId).attachEvent('onAfterRender', function (data) {
							if ($$(componentIds.toolbar.replace('{id}', viewId))) {
								$$(componentIds.toolbar.replace('{id}', viewId)).$setSize($$(viewId).config.width + 3);
							}

							$(self).trigger('renderComplete', {});
						});
					}



					// Select column by checkbox
					if (events['onCheck'] == null) {
						events['onCheck'] = $$(self.viewId).attachEvent('onCheck', function (row, col, state) {
							if (!self.data.dataCollection) return;

							if (col == 'select_column') {
								if (state)
									self.data.dataCollection.checkItem(row);
								else
									self.data.dataCollection.uncheckItem(row);
							}
						});
					}

					if (dataCollection) {
						if (events['onAfterSelect'] == null) {
							events['onAfterSelect'] = $$(self.viewId).attachEvent("onAfterSelect", function (data, preserve) {
								var rowId = data.id || data;

								// Set cursor of data collection
								var currModel = dataCollection.AD.currModel();
								if (!currModel || currModel.id != rowId)
									dataCollection.setCursor(rowId);
							});
						}

						if (events['onAfterCursorChange'] == null) {
							events['onAfterCursorChange'] = dataCollection.attachEvent("onAfterCursorChange", function (id) {
								var selectedItem = $$(self.viewId).getSelectedId(false),
									preserve = $$(self.viewId).config.multiselect;

								if (!id && $$(self.viewId).unselectAll)
									$$(self.viewId).unselectAll();
								else if ((!selectedItem || selectedItem.id != id) && $$(self.viewId).select) {
									$$(self.viewId).select(id, preserve);
								}
							});
						}

						if (events['onCheckItemsChange'] == null) {
							events['onCheckItemsChange'] = dataCollection.attachEvent("onCheckItemsChange", function () {
								// Enable Update/Delete buttons
								if (dataCollection.getCheckedItems().length > 0) {
									if ($$(self.viewId + '-update-items-button'))
										$$(self.viewId + '-update-items-button').enable();
									if ($$(self.viewId + '-delete-items-button'))
										$$(self.viewId + '-delete-items-button').enable();
								}
								// Disable Update/Delete buttons
								else {
									if ($$(self.viewId + '-update-items-button'))
										$$(self.viewId + '-update-items-button').disable();
									if ($$(self.viewId + '-delete-items-button'))
										$$(self.viewId + '-delete-items-button').disable();
								}
							});
						}
					}

					q.resolve();
				});

				return q;
			};

			this.renderDataTable = function (dataCollection, extraColumns, selectable, isTrashVisible, linkedField) {
				var self = this;

				if (!self.data.columns) return;

				if (!self.data.visibleColumns) self.data.visibleColumns = [];

				var columns = self.data.columns.filter(function (c) {
					return self.data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
				}).slice(0);

				// if (columns.length < 1 && showAll) columns = self.data.columns.slice(0); // Show all

				// View column
				if (extraColumns.viewPage && extraColumns.viewId) {
					columns.push({
						width: 60,
						weight: getMaxWeight(columns) + 1,
						setting: {
							id: "view_detail",
							header: "",
							label: "",
							template: "<span class='go-to-view-detail'>View</span>",
							css: 'ab-object-view-column'
						}
					});
				}

				// Edit column
				if (extraColumns.editPage && extraColumns.editForm) {
					columns.push({
						width: 45,
						weight: getMaxWeight(columns) + 1,
						setting: {
							id: "edit_form",
							header: "",
							label: "",
							template: "<span class='go-to-edit-form'>{common.editIcon()}</span>",
							css: { 'text-align': 'center' }
						}
					});
				}

				selectable = selectable == 'enable';
				isTrashVisible = isTrashVisible === 'enable'; // Convert to boolean

				getObjectDataTable.call(self, application, self.data.setting.object, self.data.columns).bindColumns(application, columns, true, selectable, isTrashVisible);

				populateData.call(self, self.data.setting.object, dataCollection, self.data.columns);

				if (linkedField)
					filterLinkedData.call(self, linkedField);
			};

			this.getSettings = function () {
				var propertyValues = $$(componentIds.propertyView).getValues(),
					columns = $.map($$(componentIds.editDataTable).config.columns, function (c) { return [c.dataId]; }),
					detailView = propertyValues.detailView && propertyValues.detailView.split('|') || null,
					viewPageId = detailView && detailView[0] || null,
					detailViewId = detailView && detailView[1] || null,
					editForm = propertyValues.editForm && propertyValues.editForm.split('|') || null,
					editPageId = editForm && editForm[0] || null,
					editFormId = editForm && editForm[1] || null;

				var settings = {
					title: propertyValues.title || '',
					description: propertyValues.description || '',
					object: propertyValues.object, // ABObject.id
					linkedTo: propertyValues.linkedTo != 'none' ? propertyValues.linkedTo : '', // ABObject.id
					linkedField: propertyValues.linkedField != 'none' ? propertyValues.linkedField : '', // ABColumn.id
					viewPage: viewPageId, // ABPage.id
					viewId: detailViewId, // ABPageComponent.id
					editPage: editPageId, // ABPage.id
					editForm: editFormId, // ABPageComponent.id
					columns: columns.filter(function (c) { return c; }), // [ABColumn.id]
					selectable: propertyValues.selectable,
					massUpdate: propertyValues.massUpdate,
					removable: propertyValues.removable,
					filter: propertyValues.filter,
					sort: propertyValues.sort
				};

				return settings;
			};

			this.populateSettings = function (setting, selectAll) {
				webix.extend($$(componentIds.columnList), webix.ProgressBar);

				var self = this,
					viewId = componentIds.editDataTable,
					dataCollection,
					linkedToDataCollection;

				async.series([
					// Get data collection
					function (next) {
						if (setting.object) {
							dataCollectionHelper.getDataCollection(application, setting.object)
								.fail(function (err) {
									// This object is deleted
									delete setting.object;
									next();
								})
								.done(function (result) {
									dataCollection = result;
									next();
								});
						}
						else {
							next();
						}
					},
					// Get linked data colllection
					function (next) {
						if (setting.linkedTo) {
							dataCollectionHelper.getDataCollection(application, setting.linkedTo)
								.fail(function (err) {
									// This linkedTo object is deleted
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
					// Render dataTable component
					function (next) {
						self.render(setting, true, selectAll, dataCollection, linkedToDataCollection).done(function () {
							// Columns list
							$$(componentIds.columnList).showProgress({ type: 'icon' });
							bindColumnList.call(self, setting.object, selectAll);
							$$(componentIds.columnList).hideProgress();

							next();
						});
					},
					// Properties
					// Data source - Object
					function (next) {
						if (!application.objects)
							return next();

						// Data source - Object
						var objectList = $$(componentIds.propertyView).getItem('object');
						objectList.options = $.map(application.objects, function (o) {
							return {
								id: o.id,
								value: o.label
							};
						});

						// Data source - Linked to
						var linkedObjIds = self.data.columns.filter(function (col) { return col.setting.linkObject != null; }).map(function (col) { return col.setting.linkObject.toString() }),
							linkedObjs = application.objects.filter(function (obj) { return linkedObjIds.indexOf(obj.id.toString()) > -1; }),
							linkedToItem = $$(componentIds.propertyView).getItem('linkedTo');
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

						// Data source - Linked field
						var linkedFieldItem = $$(componentIds.propertyView).getItem('linkedField');
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

						next();
					},
					// Data table - Detail view & Edit form
					function (next) {

						// 19 Jan 2017
						// Make sure we return all possible pages that can be selected, even if we are embedded 
						// in a buried Tab component.
						// var parentId = application.currPage.parent ? application.currPage.parent.attr('id') : application.currPage.attr('id');
						// application.getPages({ or: [{ id: parentId }, { parent: parentId }] })
						application.getApplicationPages(application.currPage)
							.fail(function (err) { next(err); })
							.then(function (pages) {
								var viewComponents = [],
									formComponents = [];

								pages.forEach(function (p) {
									if (p.translate) p.translate();

									// Details view components
									var detailsViews = p.components.filter(function (c) {
										return c.component === "view" && c.setting && c.setting.object === setting.object;
									});

									if (detailsViews && detailsViews.length > 0) {
										viewComponents = viewComponents.concat($.map(detailsViews, function (v) {
											return [{
												id: p.id + '|' + v.id,
												value: p.label + ' - ' + v.component
											}];
										}));
									}

									// Filter form components
									var forms = p.components.filter(function (c) {
										return c.component === "form" && c.setting && c.setting.object === setting.object;
									});

									if (forms && forms.length > 0) {
										formComponents = formComponents.concat($.map(forms, function (f) {
											return [{
												id: p.id + '|' + f.id,
												value: p.label + ' - ' + f.component
											}];
										}));
									}
								});

								var detailViewItem = $$(componentIds.propertyView).getItem('detailView');
								detailViewItem.options = viewComponents;
								detailViewItem.options.splice(0, 0, {
									id: null,
									pageId: null,
									value: '[none]'
								});

								var editFormItem = $$(componentIds.propertyView).getItem('editForm');
								editFormItem.options = formComponents;
								editFormItem.options.splice(0, 0, {
									id: null,
									pageId: null,
									value: '[none]'
								});

								next();
							});
					},
					// Set property values
					function (next) {
						var detailView, editForm;

						if (setting.viewPage && setting.viewId)
							detailView = setting.viewPage + '|' + setting.viewId;

						if (setting.editPage && setting.editForm)
							editForm = setting.editPage + '|' + setting.editForm;

						$$(componentIds.propertyView).setValues({
							title: setting.title || '',
							description: setting.description || '',
							object: setting.object,
							linkedTo: setting.linkedTo,
							linkedField: setting.linkedField,
							detailView: detailView,
							editForm: editForm,
							selectable: setting.selectable || 'disable',
							massUpdate: setting.massUpdate || 'disable',
							removable: setting.removable || 'disable',
							filter: setting.filter || 'disable',
							sort: setting.sort || 'disable'
						});

						$$(componentIds.propertyView).refresh();
					}

				]);
			};

			this.onDisplay = function () {

			}

		};

		gridComponent.getInfo = function () {
			return {
				name: 'grid',
				icon: 'fa-table',
				propertyView: componentIds.propertyView
			};
		};

		gridComponent.getView = function () {
			return {
				view: "dynamicdatatable",
				autoheight: true,
				maxHeight: 500,
				fixedRowHeight: false,
				datatype: "json",
				resizeColumn: true
			};
		};

		gridComponent.getEditView = function (componentManager) {
			var viewId = componentIds.editDataTable,
				dataTable = $.extend(true, {}, gridComponent.getView());

			dataTable.id = viewId;
			dataTable.autoheight = false;
			dataTable.height = 180;

			var editView = {
				id: componentIds.editView,
				padding: 10,
				rows: [
					dataTable,
					{
						view: 'label',
						label: 'Columns list'
					},
					{
						id: componentIds.columnList,
						view: 'activelist',
						template: function (obj, common) {
							return "<div class='ab-page-grid-column-item'>" +
								"<div class='column-checkbox'>" +
								common.markCheckbox(obj, common) +
								"</div>" +
								"<div class='column-name'>" + obj.label + "</div>" +
								"</div>";
						},
						activeContent: {
							markCheckbox: {
								view: "checkbox",
								width: 50,
								on: { /*checkbox onChange handler*/
									'onChange': function (newv, oldv) {
										var item_id = this.config.$masterId,
											propertyValues = $$(componentIds.propertyView).getValues(),
											editInstance = componentManager.editInstance,
											detailView = propertyValues.detailView && propertyValues.detailView.indexOf('|') > -1 ? propertyValues.detailView.split('|') : null,
											editValue = propertyValues.editForm && propertyValues.editForm.indexOf('|') > -1 ? propertyValues.editForm.split('|') : null;

										if (this.getValue()) // Check
											editInstance.data.visibleColumns.push(item_id);
										else // Uncheck
										{
											editInstance.data.visibleColumns.forEach(function (colId, index) {
												if (colId == item_id) {
													editInstance.data.visibleColumns.splice(index, 1);
													return;
												}
											});
										}

										editInstance.renderDataTable(editInstance.data.dataCollection, {
											viewPage: detailView ? detailView[0] : null,
											viewId: detailView ? detailView[1] : null,
											editPage: editValue ? editValue[0] : null,
											editForm: editValue ? editValue[1] : null
										},
											propertyValues.selectable,
											propertyValues.removable,
											propertyValues.linkedField);
									}
								}
							}
						}
					}
				]
			};

			return editView;
		};

		gridComponent.getPropertyView = function (componentManager) {
			return {
				view: "property",
				id: componentIds.propertyView,
				nameWidth: 110,
				elements: [
					{ label: "Header", type: "label" },
					{
						id: 'title',
						name: 'title',
						type: 'text',
						label: 'Title'
					},
					{
						id: 'description',
						name: 'description',
						type: 'text',
						label: 'Description'
					},
					{ label: "Data source", type: "label" },
					{
						id: 'object',
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
						id: 'linkedTo',
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
						id: 'linkedField',
						name: 'linkedField',
						type: 'richselect',
						label: 'Linked field',
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedData && selectedData.length > 0)
								return selectedData[0].value;
							else
								return "";
						}
					},
					{ label: "Data table", type: "label" },
					{
						id: 'detailView',
						name: 'detailView',
						label: 'Detail view',
						type: 'richselect',
						template: function (data, dataValue) {
							var selectedDetailView = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedDetailView && selectedDetailView.length > 0)
								return selectedDetailView[0].value;
							else
								return "[none]";
						}
					},
					{
						id: 'editForm',
						name: 'editForm',
						label: "Edit form",
						type: 'richselect',
						template: function (data, dataValue) {
							var selectedEditForm = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedEditForm && selectedEditForm.length > 0)
								return selectedEditForm[0].value;
							else
								return "[none]";
						}
					},
					{ label: "Options", type: "label" },
					{
						id: 'filter',
						name: 'filter',
						type: 'richselect',
						label: 'Filter',
						options: [
							{ id: 'enable', value: "Yes" },
							{ id: 'disable', value: "No" },
						]
					},
					{
						id: 'sort',
						name: 'sort',
						type: 'richselect',
						label: 'Sort',
						options: [
							{ id: 'enable', value: "Yes" },
							{ id: 'disable', value: "No" },
						]
					},
					{
						id: 'selectable',
						name: 'selectable',
						type: 'richselect',
						label: 'Selectable',
						options: [
							{ id: 'enable', value: "Yes" },
							{ id: 'disable', value: "No" },
						]
					},
					{
						id: 'massUpdate',
						name: 'massUpdate',
						type: 'richselect',
						label: 'Mass update',
						options: [
							{ id: 'enable', value: "Yes" },
							{ id: 'disable', value: "No" },
						]
					},
					{
						id: 'removable',
						name: 'removable',
						type: 'richselect',
						label: 'Removable',
						options: [
							{ id: 'enable', value: "Yes" },
							{ id: 'disable', value: "No" },
						]
					}
				],
				on: {
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (ignoreUpdate || state.old == state.value) return false;

						var viewId = componentIds.editDataTable,
							propertyValues = $$(componentIds.propertyView).getValues(),
							editInstance = componentManager.editInstance;

						switch (editor.id) {
							case 'title':
								$$(componentIds.editTitle).setValue(propertyValues.title);
								break;
							case 'description':
								$$(componentIds.editDescription).setValue(propertyValues.description);
								break;
							case 'linkedTo':
								var linkedTo = propertyValues.linkedTo,
									linkedField = $$(componentIds.propertyView).getItem('linkedField');

								if (linkedTo != 'none') {
									linkedField.options = editInstance.data.columns
										.filter(function (col) { return col.setting.linkObject == linkedTo; })
										.map(function (col) {
											return {
												id: col.id,
												value: col.label
											}
										}).attr();

									propertyValues['linkedField'] = linkedField.options[0].id; // Default selection
								} else {
									linkedField.options = [];
									linkedField.hidden = true;
									propertyValues['linkedField'] = null;
								}
								$$(componentIds.propertyView).setValues(propertyValues);
							case 'object':
							case 'filter':
							case 'sort':
							case 'selectable':
							case 'massUpdate':
							case 'removable':
								var setting = editInstance.getSettings();
								setting.columns = editInstance.data.visibleColumns;

								editInstance.populateSettings(setting, true);
								break;
							case 'detailView':
							case 'editForm':
								var detailView = propertyValues.detailView && propertyValues.detailView.indexOf('|') > -1 ? propertyValues.detailView.split('|') : null,
									editValue = propertyValues.editForm && propertyValues.editForm.indexOf('|') > -1 ? propertyValues.editForm.split('|') : null;

								editInstance.renderDataTable(componentManager.editInstance.data.dataCollection, {
									viewPage: detailView ? detailView[0] : null,
									viewId: detailView ? detailView[1] : null,
									editPage: editValue ? editValue[0] : null,
									editForm: editValue ? editValue[1] : null
								},
									propertyValues.selectable,
									propertyValues.removable,
									propertyValues.linkedField);
								break;
						}
					}
				}
			};
		};

		return gridComponent;

	}
);