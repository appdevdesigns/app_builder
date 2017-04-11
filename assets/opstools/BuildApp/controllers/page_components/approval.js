steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/utils/InputValidator.js',

	function (dataCollectionHelper, selectivityHelper, inputValidator) {
		var componentIds = {
			editRequestApproval: 'ab-approval-edit-view',
			displayPage: 'ab-approval-display-page',
			propertyView: 'ab-approval-property-view',

			headerColumnList: 'ab-approval-header-columns',
			detailColumnList: 'ab-approval-detail-columns'
		};

		function renderApprovePage(setting) {
			var approveItem = {};

			$$(componentIds.detailColumnList).find({ markCheckbox: 1 }).forEach(function (col) {
				approveItem[col.label] = '[Data]';
			});

			var domItem = can.view('/opstools/BuildApp/views/ProcessApproval/itemApproval.ejs', new can.Map({
				data: approveItem,
				title: {
					header: setting.headerTitle || '',
					detail: setting.title || ''
				},
				headerInfo: {}
			})
			);

			$($$(componentIds.displayPage).$view).children('div').html('');
			$($$(componentIds.displayPage).$view).children('div').append(domItem);
		}

		//Constructor
		var requestApprovalComponent = function (application, viewId, componentId) {
			var self = this,
				events = {}, // { eventName: eventId, ..., eventNameN: eventIdN }
				data = {
					visibleColumns: []
				};

			self.viewId = viewId;
			self.editViewId = componentIds.editRequestApproval;
			self.data = data;

			function getColumnList(objectId) {
				var dfd = $.Deferred(),
					selectedObj = application.objects.filter(function (obj) { return obj.id == objectId; })[0];

				if (selectedObj == null) {
					dfd.resolve(new can.List([]));
					return dfd;
				}

				selectedObj.getColumns()
					.fail(dfd.reject)
					.done(function (columns) {

						columns.forEach(function (col) {
							if (col.translate) col.translate();
						});

						dfd.resolve(columns);
					});

				return dfd;
			}

			function bindColumnList(columns) {
				$$(componentIds.detailColumnList).clearAll();

				// Select this object at first time
				var visibleColumns = self.data.visibleColumns ? self.data.visibleColumns.slice(0) : [];
				if ($.grep(columns, function (d) { return visibleColumns.indexOf(d.id.toString()) > -1; }).length < 1) {
					visibleColumns = visibleColumns.concat($.map(columns, function (d) { return d.id.toString(); }));
				}

				// Initial checkbox
				columns.forEach(function (col) {
					col.attr('markCheckbox', visibleColumns.filter(function (c) { return c == col.id; }).length > 0);
				});

				$$(componentIds.detailColumnList).parse(columns.attr());
				$$(componentIds.detailColumnList).refresh();
			}


			// Instance functions
			this.render = function (setting) {
				var q = $.Deferred(),
					dataCollection,
					self = this;

				function updateCheckedItems() {
					var checkItems = [];

					dataCollection.getCheckedItems().forEach(function (rowId) {
						var checkedItem = dataCollection.getItem(rowId);

						checkItems.push({
							id: checkedItem.id,
							text: checkedItem._dataLabel
						});
					});

					selectivityHelper.setData($($$(self.viewId).$view).find('.ab-checked-items'), checkItems);
				}

				async.series([
					// Get data collection
					function (next) {
						if (setting.object == null) return next();

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
					},
					function (next) {
						var view = $.extend(true, {}, requestApprovalComponent.getView());
						view.id = self.viewId;
						view.rows[1].click = function () {
							var requestButton = this;

							// TODO : POPUP

							if (dataCollection == null) return;

							var checkedItems = dataCollection.getCheckedItems();

							// Call server to request approve
							if (checkedItems.length > 0) {
								requestButton.disable();

								var columnIds = [];
								columnIds = setting.columns.attr ? setting.columns.attr() : setting.columns;

								AD.comm.service.post({
									url: '/app_builder/object/#objectId#/requestApprove'.replace('#objectId#', setting.object),
									data: {
										title: setting.title,
										itemIds: checkedItems,
										columns: columnIds
									}
								})
									.fail(function (err) {
										console.error(err);
										$$(self.viewId).enable();
									})
									.done(function (requestIds) {

										// Update approve status to Data collection
										requestIds.forEach(function (itemId) {
											var item = dataCollection.getItem(itemId);
											item['_approveStatus'] = 'requesting';

											dataCollection.updateItem(itemId, item);
										});

										// Show success message
										webix.message({
											type: "success",
											text: "Approve requesting is done"
										});

										requestButton.enable();
									});
							}

						};

						webix.ui(view, $$(self.viewId));

						selectivityHelper.renderSelectivity($$(self.viewId).$view, 'ab-checked-items', true);

						updateCheckedItems();

						data.isRendered = true;

						next();
					},
					// Create a listener to update selectivity of checked items
					function (next) {
						if (events['onCheckItemsChange'] == null && dataCollection != null) {
							events['onCheckItemsChange'] = dataCollection.attachEvent("onCheckItemsChange", function () {
								updateCheckedItems();
							});
						}

						next();
					}

				], function (err) {
					if (err)
						q.reject(err);
					else
						q.resolve();
				});

				return q;
			};

			this.getSettings = function () {
				var values = $$(componentIds.propertyView).getValues(),
					columns = $$(componentIds.detailColumnList)
						.find({ markCheckbox: 1 })
						.map(function (col) { return col.id; });

				return {
					// headerTitle: values.headerTitle,
					// headerObject: values.headerObject || 'none', // ABObject.id
					title: values.title,
					object: values.object || 'none', // ABObject.id
					columns: columns // [ABColumn.id]
				};
			};

			this.populateSettings = function (setting) {
				// Properties
				if (!$$(componentIds.propertyView)) return;

				var objectList = application.objects.attr().map(function (obj) {
					return {
						id: obj.id,
						value: obj.label
					};
				});


				// var headerObject = $$(componentIds.propertyView).getItem('headerObject');
				var object = $$(componentIds.propertyView).getItem('object');

				// headerObject.options = objectList;
				// headerObject.options.splice(0, 0, {
				// 	id: 'none',
				// 	value: '[Select]'
				// });
				object.options = objectList;

				$$(componentIds.propertyView).setValues({
					// headerTitle: setting.headerTitle || '',
					// headerObject: setting.headerObject || 'none',
					title: setting.title || '',
					object: setting.object || 'none'
				});

				$$(componentIds.propertyView).refresh();

				self.data.visibleColumns = setting.columns;

				var columns = [];

				async.series([
					function (next) {
						if (setting.object != 'none') {
							getColumnList(setting.object)
								.fail(next)
								.done(function (result) {
									columns = result;
									next();
								});
						}
						else {
							next();
						}
					},
					function (next) {
						// Bind column list
						bindColumnList(columns);

						// Render approve page
						renderApprovePage(setting);

						next();
					}
				]);

			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

		};

		// Static functions
		requestApprovalComponent.getInfo = function () {
			return {
				name: 'approval',
				icon: 'fa-check-square',
				propertyView: componentIds.propertyView
			};
		};

		requestApprovalComponent.getView = function () {
			return {
				rows: [
					{
						view: 'template',
						borderless: true,
						width: 700,
						height: 50,
						template: '<div class="ab-checked-items"></div>'
					},
					{
						view: "button",
						value: "Request Approve",
						width: 200
					}
				]
			};
		};

		requestApprovalComponent.getEditView = function (componentManager) {
			var editView =
				{
					id: componentIds.editRequestApproval,
					rows: [
						{
							id: componentIds.displayPage,
							view: 'template',
							template: '<div></div>',
							css: 'ab-scroll-y'
						},
						// {
						// 	view: 'label',
						// 	label: 'Header columns'
						// },
						// {
						// 	id: componentIds.headerColumnList,
						// 	view: 'activelist',
						// 	template: function (obj, common) {
						// 		return "<div class='ab-page-grid-column-item'>" +
						// 			"<div class='column-checkbox'>" +
						// 			common.markCheckbox(obj, common) +
						// 			"</div>" +
						// 			"<div class='column-name'>" + obj.label + "</div>" +
						// 			"</div>";
						// 	},
						// 	activeContent: {
						// 		markCheckbox: {
						// 			view: "checkbox",
						// 			width: 50,
						// 			on: { /*checkbox onChange handler*/
						// 				'onChange': function (newv, oldv) {
						// 					// var item_id = this.config.$masterId,
						// 					// 	propertyValues = $$(componentIds.propertyView).getValues(),
						// 					// 	editInstance = componentManager.editInstance,
						// 					// 	detailView = propertyValues.detailView && propertyValues.detailView.indexOf('|') > -1 ? propertyValues.detailView.split('|') : null,
						// 					// 	editValue = propertyValues.editForm && propertyValues.editForm.indexOf('|') > -1 ? propertyValues.editForm.split('|') : null;

						// 					// if (this.getValue()) // Check
						// 					// 	editInstance.data.visibleColumns.push(item_id);
						// 					// else // Uncheck
						// 					// {
						// 					// 	editInstance.data.visibleColumns.forEach(function (colId, index) {
						// 					// 		if (colId == item_id) {
						// 					// 			editInstance.data.visibleColumns.splice(index, 1);
						// 					// 			return;
						// 					// 		}
						// 					// 	});
						// 					// }

						// 					// editInstance.renderDataTable(editInstance.data.dataCollection, {
						// 					// 	viewPage: detailView ? detailView[0] : null,
						// 					// 	viewId: detailView ? detailView[1] : null,
						// 					// 	editPage: editValue ? editValue[0] : null,
						// 					// 	editForm: editValue ? editValue[1] : null
						// 					// },
						// 					// 	propertyValues.selectable,
						// 					// 	propertyValues.removable,
						// 					// 	propertyValues.linkedField);
						// 				}
						// 			}
						// 		}
						// 	}
						// },
						{
							view: 'label',
							label: 'Detail columns'
						},
						{
							id: componentIds.detailColumnList,
							view: 'activelist',
							template: function (col, common) {
								return "<div class='ab-page-grid-column-item'>" +
									"<div class='column-checkbox'>" +
									common.markCheckbox(col, common) +
									"</div>" +
									"<div class='column-name'>" + col.label + "</div>" +
									"</div>";
							},
							activeContent: {
								markCheckbox: {
									view: "checkbox",
									width: 50,
									on: { /*checkbox onChange handler*/
										'onChange': function (newv, oldv) {
											var item_id = this.config.$masterId,
												editInstance = componentManager.editInstance;

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

											// Wait until check list is updated
											setTimeout(function () {
												var setting = editInstance.getSettings();
												renderApprovePage(setting);
											}, 10);
										}
									}
								}
							}
						}

					]
				};

			return editView;
		};

		requestApprovalComponent.getPropertyView = function (componentManager) {
			var self = this;

			return {
				view: "property",
				id: componentIds.propertyView,
				nameWidth: 70,
				elements: [
					// { label: "Header", type: "label" },
					// {
					// 	id: 'headerTitle',
					// 	name: 'headerTitle',
					// 	type: "text",
					// 	label: "Title"
					// },
					// {
					// 	id: 'headerObject',
					// 	name: 'headerObject',
					// 	type: "combo",
					// 	label: "Object",
					// 	template: function (data, dataValue) {
					// 		var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
					// 		if (selectedData && selectedData.length > 0)
					// 			return selectedData[0].value;
					// 		else
					// 			return "[Select]";
					// 	}
					// },
					{ label: "Detail", type: "label" },
					{
						id: 'title',
						name: 'title',
						type: "text",
						label: "Title"
					},
					{
						id: 'object',
						name: 'object',
						type: "combo",
						label: "Object",
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
					onBeforeEditStop: function (state, editor) {
						if (state.value.length > 0 && (editor.id == 'headerTitle' || editor.id == 'title')) {
							return inputValidator.validateFormat(state.value);
						}
						else {
							return true;
						}
					},
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (state.old === state.value) return true;

						switch (editor.id) {
							case 'title':
							case 'object':
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.populateSettings(setting, true);
								break;
						}
					}
				}
			};
		};

		return requestApprovalComponent;

	}
);