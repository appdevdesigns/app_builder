steal(function () {
	System.import('appdev').then(function () {
		steal.import(
			'appdev/model/model',
			'opstools/RBAC')
			.then(function () {

				var SiteUser = AD.Model.get('opstools.RBAC.SiteUser');

				var labels = {
					common: {
						ok: AD.lang.label.getLabel('ab.common.ok') || "Ok",
						search: AD.lang.label.getLabel('ab.common.search') || "Search",
						save: AD.lang.label.getLabel('ab.common.save') || "Save",
						cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
					}
				},
					data = {},
					events = {};

				webix.protoUI({
					name: 'user_data_popup',
					$init: function (config) {
					},
					defaults: {
						modal: true,
						head: "Users",
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
												var searchText = this.getValue().toLowerCase(),
													dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

												dataList.filter(function (user) {
													return user.username.indexOf(searchText) > -1;
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
											// if (data.unsync) {
											// 	webix.alert({
											// 		// title: labels.object.cannotConnectedDataTitle,
											// 		// text: labels.object.cannotConnectedDataDescription,
											// 		ok: labels.common.ok
											// 	});

											// 	return false;
											// }

											if (this.isSelected(id)) {
												this.unselect(id);
											}
											else {
												// Single select mode
												if (!this.config.multiselect)
													this.unselectAll();

												var selectedIds = this.getSelectedId(true);
												selectedIds.push(id);

												this.select(selectedIds);
											}

										},
										onSelectChange: function () {
											var dataList = this,
												selectedIds = this.getSelectedId(true),
												selectedItems = [];

											selectedIds.forEach(function (username) {
												var htmlNode = dataList.getItemNode(username);
												if (!htmlNode) return;

												selectedItems.push({ id: username, text: username });
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
												var selectedItems = $.map(dataList.getSelectedId(true), function (username) {
													var htmlNode = dataList.getItemNode(username);
													if (!htmlNode) return;

													return [{ id: username, text: username }];
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

					open: function (application, rowId, selectedIds, multiselect, unsync) {
						var dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

						dataList.clearAll();
						if (dataList.hideOverlay) dataList.hideOverlay();

						data.selectedIds = selectedIds;
						data.unsync = unsync;

						this.getTopParentView().show();
						webix.extend(dataList, webix.ProgressBar);
						dataList.showProgress({ type: 'icon' });
						dataList.define('multiselect', multiselect);
						dataList.define('template', function (item, common) {
							var templateText = "<div class='ab-user-data'>{username}</div>";

							return templateText.replace('{username}', item.username);
						});
						dataList.refresh();

						// Pull users
						SiteUser.findAll({})
							.fail(function (err) {
								webix.message(err.message);
								dataList.hideProgress();
							})
							.done(function (data) {
								dataList.parse(data.attr().map(function (item) {
									return {
										id: item.username,
										username: item.username
									};
								}));
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

			});
	});
});