steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	function (modelCreator) {
		var data = {},
			events = {},
			labels = {
				common: {
					ok: AD.lang.label.getLabel('ab.common.ok') || "Ok",
					search: AD.lang.label.getLabel('ab.common.search') || "Search",
					save: AD.lang.label.getLabel('ab.common.save') || "Save",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
				},
				// Connected data
				object: {
					selectConnectedData: AD.lang.label.getLabel('ab.object.selectConnectedData') || "Select data to connect",
					cannotConnectedDataTitle: AD.lang.label.getLabel('ab.object.cannotConnectedDataTitle') || "System could not link to this data",
					cannotConnectedDataDescription: AD.lang.label.getLabel('ab.object.cannotConnectedDataDescription') || "This data is unsynchronized. You can click Synchronize button to sync data."
				}
			};

		// Select connected object data popup
		webix.protoUI({
			name: 'connected_data_popup',
			$init: function (config) {
			},
			defaults: {
				modal: true,
				head: labels.object.selectConnectedData,
				position: "center",
				autowidth: true,
				autoheight: true,
				body: {
					rows: [
						{
							view: 'toolbar',
							cols: [{
								view: 'search',
								label: labels.common.search,
								keyPressTimeout: 140,
								on: {
									onTimedKeyPress: function () {
										var searchText = this.getValue(),
											dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

										dataList.filter(function (obj) {
											var result = false;

											for (var key in obj) {
												if (key != 'id' && obj[key])
													result = obj[key].indexOf(searchText) > -1 || result;
											}

											return result;
										});
									}
								}
							}]
						},
						{
							view: 'list',
							width: 600,
							height: 400,
							type: {
								height: 40, // Defines item height
							},
							on: {
								onAfterLoad: function () {
									if (data.selectedIds && data.selectedIds.length > 0)
										this.select(data.selectedIds);
									else
										this.unselectAll();
								},
								onItemClick: function (id, e, node) {
									if (isNaN(id)) {
										webix.alert({
											title: labels.object.cannotConnectedDataTitle,
											text: labels.object.cannotConnectedDataDescription,
											ok: labels.common.ok
										});

										return false;
									}

									if (this.isSelected(id)) {
										this.unselect(id);
									}
									else {
										// Single select mode
										if (!this.config.multiselect)
											this.unselectAll();

										var selectedIds = this.getSelectedId();

										if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
											if (selectedIds)
												selectedIds = [selectedIds];
											else
												selectedIds = [];
										}

										selectedIds.push(id);

										this.select(selectedIds);
									}

								},
								onSelectChange: function () {
									var dataList = this,
										selectedIds = this.getSelectedId(true),
										selectedItems = [];

									selectedIds.forEach(function (id) {
										var htmlNode = dataList.getItemNode(id);
										if (!htmlNode) return;

										var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

										selectedItems.push({ id: id, text: connectData });
									});

									if (events.selectChange)
										events.selectChange(selectedItems);
								}
							}
						},
						{
							align: "right",
							cols: [
								{
									autowidth: true
								},
								{
									view: "button",
									value: labels.common.save,
									type: "form",
									align: "right",
									width: 150,
									click: function () {
										if (!events.close) return true;

										var dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

										// [{ id: id, text: '' }, ..., { id: idn, text: '' }]
										var selectedItems = $.map(dataList.getSelectedId(true), function (id) {
											var htmlNode = dataList.getItemNode(id);
											if (!htmlNode) return;

											var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

											return [{ id: id, text: connectData }];
										});

										if (!selectedItems || selectedItems.length < 1)
											selectedItems = [];

										events.close(selectedItems);

										dataList.clearAll();


										this.getTopParentView().hide();
									}
								},
								{
									view: "button",
									value: labels.common.cancel,
									align: "right",
									width: 150,
									click: function () {
										this.getTopParentView().hide();
									}
								}
							]
						}
					]
				}
			},

			open: function (application, object, rowId, selectedIds, linkType, linkColName, linkViaType) {
				var dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

				dataList.clearAll();
				if (dataList.hideOverlay) dataList.hideOverlay();

				data.selectedIds = selectedIds;

				this.getTopParentView().show();
				webix.extend(dataList, webix.ProgressBar);
				dataList.showProgress({ type: 'icon' });
				dataList.define('multiselect', linkType === 'collection');
				dataList.define('template', function (item, common) {
					var templateText = "<div class='ab-connect-data'>";

					if (object.labelFormat || object.columns.length > 0) {
						if (object.labelFormat)
							templateText += object.labelFormat;
						else { // Get default column
							var defaultColName = object.columns.filter(function (col) {
								return col.type === 'string' || col.type === 'text';
							});
							templateText += '#' + (defaultColName[0] ? defaultColName[0].name : object.columns[0].name) + '#';
						}
					}

					templateText += isNaN(item.id) ? " (Unsynchronized)" : "";
					templateText += "</div>";
					templateText = templateText.replace(/[{]/g, '#').replace(/[}]/g, '#'); // Replace label format

					for (var key in item) {
						templateText = templateText.replace(new RegExp('#' + key + '#', 'g'), item[key]);
					}

					templateText = templateText.replace(/#(.+?)#/g, '');

					return templateText;
				});
				dataList.refresh();

				var objectModel = modelCreator.getModel(application, object.name),
					cond = {};

				// // Filter selected data
				// if (linkViaType === 'model' && linkViaColName) {
				// 	cond[linkViaColName] = { '!': null };

				// 	// Get own selected data
				// 	if (selectedIds && selectedIds.length > 0) {

				// 		var origCond = cond;
				// 		cond = { or: [] };
				// 		cond.or.push(origCond);

				// 		cond.or.push({
				// 			id: selectedIds
				// 		})
				// 	}
				// }


				// objectModel.store = {};

				// Load the connect data
				// objectModel.findAll({ where:cond})
				objectModel.Cached.findAll(cond)
					.fail(function (err) { next(err); })
					.then(function (data) {
						// Filter selected data
						if (linkViaType === 'model') {
							data = data.filter(function (d) {
								return !d[linkColName] || d[linkColName].id == rowId || selectedIds.indexOf(d.id) > -1;
							});
						}

						data.forEach(function (d) {
							if (d.translate) d.translate();
						});

						if (data && data.length > 0)
							dataList.parse(data.attr());
						else {
							webix.extend(dataList, webix.OverlayBox);
							dataList.showOverlay("No #objectName# available.".replace('#objectName#', object.label));
						}

						dataList.hideProgress();
					});
			},

			onSelect: function (selectChange) {
				events.selectChange = selectChange;
			},

			onClose: function (close) {
				events.close = close;
			}
		}, webix.ui.window);

	}
);