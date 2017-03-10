steal(function () {

	var componentIds = {
		importModelList: 'ab-object-import-model-list',
		importModelListFilter: 'ab-object-import-model-list-filter'
	},
		labels = {
			common: {
				import: AD.lang.label.getLabel('ab.common.import') || "Import",
				cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
			}
		};

	var instance = {
		onInit: function () {

			$$(componentIds.importModelListFilter).setValue('');
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
							minHeight: 400,
							data: [],
							template: '<div>#modelName#</div>',
						},
						// Import & Cancel buttons
						{
							cols: [
								{
									view: 'button', value: labels.common.import, type: 'form', click: function () {
										var button = this;
										var list = $$(componentIds.importModelList);
										var selectedModel = list.getSelectedItem();
										if (!selectedModel) return;

										button.disable();

										$(instance).trigger('startCreate');

										// Tell the server to import the model
										AD.comm.service.post({
											url: '/app_builder/application/' + AD.classes.AppBuilder.currApp.id + '/importModel',
											data: {
												objectID: (typeof selectedModel.id == 'number' ? selectedModel.id : null), // If id is not number, then it is model name.
												model: selectedModel.modelName
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
									view: "button", value: labels.common.cancel, click: function () {
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