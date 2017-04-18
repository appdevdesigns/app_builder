steal(
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',

	function () {

		var componentIds = {
			importModelForm: 'ab-object-import-model-form',
			importModelList: 'ab-object-import-model-list',
			importModelListFilter: 'ab-object-import-model-list-filter',

			columnList: 'ab-object-import-column-list',

			saveButton: 'ab-object-import-model-save',
			cancelButton: 'ab-object-import-model-cancel'
		},
			labels = {
				common: {
					import: AD.lang.label.getLabel('ab.common.import') || "Import",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
				}
			};

		var instance = {
			onInit: function () {
				// Reset state
				$$(componentIds.importModelListFilter).setValue('');
				$$(componentIds.columnList).clearAll();

				AD.comm.service.get({ url: '/app_builder/application/' + AD.classes.AppBuilder.currApp.id + '/findModels' })
					.fail(function (err) {
						webix.message({
							type: "error",
							text: err
						});
					})
					.done(function (list) {
						var listData = [];
						for (var i = 0; i < list.length; i++) {
							listData.push({
								id: list[i].objectId || list[i].modelName,
								modelName: list[i].modelName
							});
						}
						$$(componentIds.importModelList).clearAll();
						$$(componentIds.importModelList).parse(listData, 'json');
					});

			},

			getCreateView: function () {
				return {
					header: labels.common.import, //"Import"
					body: {
						id: componentIds.importModelForm,
						view: "form",
						elements: [
							// Models list filter
							{
								cols: [
									{
										view: 'icon',
										icon: 'filter',
										align: 'left'
									},
									{
										view: 'text',
										id: componentIds.importModelListFilter,
										on: {
											onTimedKeyPress: function () {
												var filterText = this.getValue();
												$$(componentIds.importModelList).filter('#id#', filterText);
											}
										}
									}
								]
							},
							// Models list
							{
								view: 'list',
								id: componentIds.importModelList,
								select: true,
								height: 250,
								minHeight: 250,
								maxHeight: 250,
								data: [],
								template: '<div>#modelName#</div>',
								on: {
									onSelectChange: function (ids) {
										$$(componentIds.columnList).clearAll();

										if (ids && ids.length > 0) {
											var ignore = ['id', 'createdAt', 'updatedAt'];

											$$(componentIds.columnList).showProgress({ type: 'icon' });

											var modelItem = $$(componentIds.importModelList).data.find({ id: ids[0] })[0];

											AD.comm.service.get({
												url: '/app_builder/application/findModelAttributes',
												data: {
													model: modelItem.modelName
												}
											})
												.fail(function (err) { $$(componentIds.columnList).hideProgress(); })
												.done(function (cols) {
													
													var colNames = [];
													for (var colName in cols) {
														var col = cols[colName];
														
														// Skip these columns
														if (ignore.indexOf(colName) >= 0) continue;
														if (col.model) continue;
														if (col.collection) continue;
														
														colNames.push({
															include: col.supported,
															id: colName,
															label: colName,
															disabled: !col.supported,
														});
													}

													$$(componentIds.columnList).parse(colNames);
													$$(componentIds.columnList).hideProgress();
												});
										}
									}
								}
							},
							{
								view: 'label',
								label: "<b>{0}</b>".replace('{0}', 'Columns'),
								height: 20
							},
							// Columns list
							{
								view: 'activelist',
								id: componentIds.columnList,
								datatype: "json",
								multiselect: false,
								select: false,
								height: 200,
								minHeight: 200,
								maxHeight: 200,
								type: {
									height: 40
								},
								on: {
									onBeforeRender: function () {
										// Add progress bar ability to list
										if ($$(componentIds.columnList).showProgress == null)
											webix.extend($$(componentIds.columnList), webix.ProgressBar);
									}
								},
								activeContent: {
									include: {
										view: "checkbox",
										width: 30
									},
									label: {
										view: 'text',
										width: 280
									}
								},
								template: function(obj, common) {
									if (obj.disabled) {
										obj.include = false;
										return '<span class="float-left"><span class="glyphicon glyphicon-remove-circle"></span></span>' +
											'<span class="float-left" style="padding-left: 1em; text-decoration: line-through">' + obj.label + '</span>';
									} else {
										return '<span class="float-left">' + common.include(obj, common) + '</span>' +
											'<span class="float-left">' + common.label(obj, common) + '</span>';
									}
								}
							},
							// Import & Cancel buttons
							{
								cols: [
									{
										view: 'button', id: componentIds.saveButton, value: labels.common.import, type: 'form', click: function () {
											var button = this;
											var list = $$(componentIds.importModelList);
											var selectedModel = list.getSelectedItem();
											if (!selectedModel) return;

											button.disable();

											$(instance).trigger('startCreate');

											var columns = $$(componentIds.columnList).data.find({ include: true }).map(function (col) {
												return {
													name: col.id,
													label: col.label
												}
											});

											// Tell the server to import the model
											AD.comm.service.post({
												url: '/app_builder/application/' + AD.classes.AppBuilder.currApp.id + '/importModel',
												data: {
													objectID: (typeof selectedModel.id == 'number' ? selectedModel.id : null), // If id is not number, then it is model name.
													model: selectedModel.modelName,
													columns: columns
												}
											})
												.fail(function (err) {
													$(instance).trigger('createFail', { error: err });
												})
												.done(function (objData) {
													var ABObject = AD.Model.get('opstools.BuildApp.ABObject');
													// Already have the object data in `objData` but call
													// findOne() so that the framework will be updated.
													ABObject.findOne({ id: objData.id })
														.done(function (result) {
															if (result.translate) result.translate();

															$(instance).trigger('createDone', { newObject: result });
														});

												})
												.always(function () {
													button.enable();
												});
										}
									},
									{
										view: "button", id: componentIds.cancelButton, value: labels.common.cancel, click: function () {
											$(instance).trigger('cancel');
										}
									}
								]
							}
						]
					}
				};
			}

		};

		return instance;

	});