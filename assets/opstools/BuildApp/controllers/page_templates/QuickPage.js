steal(
	// List your Controller's dependencies here:
	function () {
		var componentIds = {
			selectObjects: 'ab-quickpage-select-object',

			displayGrid: 'ab-quickpage-display-grid',
			addNewButton: 'ab-quickpage-add-new-button',
			addNewForm: 'ab-quickpage-add-new-form',

			editData: 'ab-quick-edit-data',
			viewData: 'ab-quick-view-data',

			connectedData: 'ab-quick-connected-data'
		};


		function populateObjects() {
			var self = this;

			self.application.getObjects()
				.then(function (objects) {
					objects.forEach(function (obj) {
						if (obj.translate) obj.translate();
					});

					self.application.objects = objects;

					$$(componentIds.selectObjects).define('options', $.map(self.application.objects, function (obj) {
						return {
							id: obj.id,
							value: obj.label
						};
					}));
					$$(componentIds.selectObjects).refresh();

					selectObject.call(self);
				});
		}

		function hasAddConnectPage() {
			var self = this;

			if (!$$(componentIds.connectedData))
				return false;

			var connectFields = $$(componentIds.connectedData).getValues(),
				connectValues = Object.keys(connectFields).map(function (d) { return d.indexOf('|add') && connectFields[d] });

			return connectValues.indexOf(1) > -1;
		}

		function selectObject() {
			var self = this,
				uiDefinition = self.getUIDefinition(),
				selectedObj = self.application.objects.filter(function (obj) {
					return obj.id == $$(componentIds.selectObjects).getValue();
				})[0];

			// Rename object name to template
			uiDefinition.rows.forEach(function (r) {
				if (r.id && $$(r.id).config.labelRight) {
					var label = $$(r.id).config.labelRight.replace(/<b>[\s\S]*?<\/b>/, '<b>' + selectedObj.label + '<\/b>');
					$$(r.id).define('labelRight', label);
					$$(r.id).refresh();
				}
			});

			// Connected data
			var connectedCols = selectedObj.columns.filter(function (col) { return col.setting.linkObject; });

			$$('QuickPage').removeView(componentIds.connectedData);

			if (connectedCols.length > 0) {
				var connectedLayout = {
					id: componentIds.connectedData,
					view: 'form',
					borderless: true,
					autoheight: true,
					margin: 0,
					padding: 0,
					elements: []
				};

				connectedLayout.elements.push({
					view: 'label',
					label: 'Do you want to add other options?',
					css: 'bold'
				});

				async.waterfall([
					function (next) {
						selectedObj.getColumns()
							.fail(function (err) {
								AD.error.log('Error finding an objects columns.', { error: err, objectID: selectedObj.id });
								next(err);
							})
							.then(function (columns) {
								columns.forEach(function (col) {
									if (col.translate) col.translate();
								})
								next(null, columns);
							})
					},

					function (columns, next) {
						columns.forEach(function (col) {
							if (!col.setting.linkObject) return;

							connectedLayout.elements.push({
								name: col.id + '|list',
								view: 'checkbox',
								labelRight: 'List connected <b>#col.name#</b> with a Grid'.replace('#col.name#', col.label),
								labelWidth: 2
							});

							connectedLayout.elements.push({
								name: col.id + '|add',
								view: 'checkbox',
								labelRight: 'Add a connected <b>#col.name#</b> with a Form'.replace('#col.name#', col.label),
								labelWidth: 2
							});
						});

						next();
					}
				], function (err) {
					if (err) {
						// TODO: Error message
						return;
					}

					$$('QuickPage').addView(connectedLayout);
				});
			}
		}

		return {
			webix_ready: function () {
				webix.extend($$('QuickPage'), webix.ProgressBar);
			},

			getUIDefinition: function () {
				var self = this;

				return {
					id: 'QuickPage',
					view: 'layout',
					css: 'ab-interface-new-quick-page',
					autoheight: true,
					rows: [
						{
							id: componentIds.selectObjects,
							view: 'select',
							label: 'Select an object',
							labelWidth: 120,
							css: 'bold',
							options: [],
							on: { onChange: selectObject.bind(self) }
						},
						{ height: 10 },
						{
							id: componentIds.displayGrid,
							view: 'checkbox',
							labelRight: 'Display multiple <b>object.label</b> in a Grid',
							labelWidth: 2
						},
						{
							id: componentIds.addNewButton,
							view: 'checkbox',
							labelRight: 'A Menu button linked to a page to Add a new <b>object.label</b>',
							labelWidth: 2
						},
						{
							id: componentIds.addNewForm,
							view: 'checkbox',
							labelRight: 'Add a new <b>object.label</b> with a Form',
							labelWidth: 2
						},
						{ height: 10 },
						{
							view: 'label',
							label: 'Each record in the Grid can be linked to a page that shows on Edit form or a page to View Details',
							css: 'bold'
						},
						{
							id: componentIds.editData,
							view: 'checkbox',
							labelRight: 'Edit selected <b>object.label</b>',
							labelWidth: 2
						},
						{
							id: componentIds.viewData,
							view: 'checkbox',
							labelRight: 'View details of <b>object.label</b>',
							labelWidth: 2
						}
					]
				};
			},

			show: function (application, page) {
				this.application = application;
				populateObjects.call(this);
			},

			save: function (application) {
				var q = $.Deferred(),
					self = this,
					columns,
					mainPage,
					addFormPage,
					editFormPage,
					editForm,
					viewPage,
					viewDetail,
					connectPages = {}; // { fieldId: page, ... , fieldIdn: pagen }

				$$('QuickPage').showProgress({ type: 'icon' });

				var selectedObj = application.objects.filter(function (obj) {
					return obj.id == $$(componentIds.selectObjects).getValue();
				})[0];

				async.series([
					// Create the main page
					function (next) {
						if (!application) return next();

						application.createPage({
							name: selectedObj.name,
							label: selectedObj.label
						})
							.fail(next)
							.then(function (result) {
								if (result.translate) result.translate();
								mainPage = result;
								next();
							});
					},

					// Create the add object form page
					function (next) {
						// Check 'Add new object'
						if (!$$(componentIds.addNewButton).getValue() || !application) return next();

						// Create the add form page
						application.createPage({
							parent: mainPage.id,
							name: 'Add ' + selectedObj.name,
							label: 'Add ' + selectedObj.label,
							type: 'modal'
						})
							.fail(next)
							.then(function (result) {
								if (result.translate) result.translate();
								addFormPage = result;
								next();
							});
					},

					// Create the edit object form page
					function (next) {
						// Check 'Edit object'
						if (!$$(componentIds.editData).getValue() || !application) return next();

						// Create the edit form page
						application.createPage({
							parent: mainPage.id,
							name: 'Edit ' + selectedObj.name,
							label: 'Edit ' + selectedObj.label,
							type: 'modal'
						})
							.fail(next)
							.then(function (result) {
								if (result.translate) result.translate();
								editFormPage = result;
								next();
							});
					},

					// Create the view & connected data page
					function (next) {
						if (!$$(componentIds.viewData).getValue() || !hasAddConnectPage.call(self) || !application) return next();

						// Create the view page
						application.createPage({
							parent: mainPage.id,
							name: 'View ' + selectedObj.name,
							label: 'View ' + selectedObj.label
						})
							.fail(next)
							.then(function (result) {
								if (result.translate) result.translate();

								viewPage = result;
								next();
							});
					},

					// Insert 'Add new object' to the main page
					function (next) {
						if (!$$(componentIds.addNewButton).getValue() || !mainPage) return next();

						// Create 'Menu' component
						mainPage.createComponent({
							component: 'menu',
							weight: 0,
							setting: {
								layout: "x",
								pageIds: [addFormPage.id]
							}
						})
							.fail(next)
							.then(function () { next() });
					},

					// Insert 'Object form' to the main page
					function (next) {
						if (!$$(componentIds.addNewForm).getValue() || !mainPage) return next();

						mainPage.createComponent({
							component: 'form',
							weight: 2,
							setting: {
								object: $$(componentIds.selectObjects).getValue(),
								title: 'Add ' + selectedObj.label,
								visibleFieldIds: $.map(selectedObj.columns, function (col) { return col.id; }),
								saveVisible: "show",
								cancelVisible: "show",
							}
						})
							.fail(next)
							.then(function (result) { next(); });
					},

					// Insert 'Add Object form' to the add object page
					function (next) {
						if (!addFormPage) return next();

						addFormPage.createComponent({
							component: 'form',
							weight: 0,
							setting: {
								object: $$(componentIds.selectObjects).getValue(),
								title: 'Add ' + selectedObj.label,
								visibleFieldIds: $.map(selectedObj.columns, function (col) { return col.id; }),
								saveVisible: "show",
								cancelVisible: "show",
								clearOnLoad: "yes"
							}
						})
							.fail(next)
							.then(function (result) {
								editForm = result;
								next();
							});
					},

					// Insert 'Link' to the add object page
					function (next) {
						if (!addFormPage) return next();

						addFormPage.createComponent({
							component: 'link',
							weight: 1,
							setting: {
								title: 'Back to #pageName#'.replace(/#pageName#/g, mainPage.label),
								linkTo: mainPage.id
							}
						})
							.fail(next)
							.then(function (result) {
								next();
							});
					},

					// Insert 'Edit Object form' to the edit object page
					function (next) {
						if (!editFormPage) return next();

						editFormPage.createComponent({
							component: 'form',
							weight: 0,
							setting: {
								object: $$(componentIds.selectObjects).getValue(),
								title: 'Edit ' + selectedObj.label,
								visibleFieldIds: $.map(selectedObj.columns, function (col) { return col.id; }),
								saveVisible: "show",
								cancelVisible: "show"
							}
						})
							.fail(next)
							.then(function (result) {
								editForm = result;
								next();
							});
					},

					// Insert 'Link'  to the edit object page
					function (next) {
						if (!editFormPage) return next();

						editFormPage.createComponent({
							component: 'link',
							weight: 1,
							setting: {
								title: 'Back to #pageName#'.replace(/#pageName#/g, mainPage.label),
								linkTo: mainPage.id
							}
						})
							.fail(next)
							.then(function (result) {
								next();
							});
					},

					// Insert 'View' component to the view page
					function (next) {
						if (!$$(componentIds.viewData).getValue() || !viewPage) return next();

						viewPage.createComponent({
							component: 'view',
							weight: 0,
							setting: {
								title: selectedObj.label,
								object: $$(componentIds.selectObjects).getValue(),
								visibleFieldIds: $.map(selectedObj.columns, function (col) { return col.id; })
							}
						})
							.fail(next)
							.then(function (result) {
								viewDetail = result;
								next();
							});
					},

					// Insert 'Object grid' to the main page
					function (next) {
						if (!$$(componentIds.displayGrid).getValue() || !mainPage) return next();

						mainPage.createComponent({
							component: 'grid',
							weight: 1,
							setting: {
								title: selectedObj.label,
								object: $$(componentIds.selectObjects).getValue(),
								viewPage: viewPage ? viewPage.id : null,
								viewId: viewDetail ? viewDetail.id : null,
								editPage: editFormPage ? editFormPage.id : null,
								editForm: editForm ? editForm.id : null,
								columns: $.map(selectedObj.columns, function (col) { return col.id; }),
								removable: "disable"
							}
						})
							.fail(next)
							.then(function () { next(); });
					},

					// Create 'Add connect data' page
					function (next) {
						if (!$$(componentIds.connectedData) || !application) return next();

						var connectFields = $$(componentIds.connectedData).getValues(),
							createPageTask = [];

						Object.keys(connectFields).forEach(function (key) {
							if (key.indexOf('|add') > -1 && connectFields[key]) {
								createPageTask.push(function (ok) {
									var columnId = parseInt(key.split('|')[0]),
										column = selectedObj.columns.filter(function (c) { return c.id == columnId })[0],
										object = application.objects.filter(function (obj) { return obj.id == column.setting.linkObject })[0];

									// Create the connected form page
									application.createPage({
										parent: mainPage.id,
										name: 'Add ' + object.name,
										label: 'Add ' + object.label,
										type: 'modal'
									})
										.fail(ok)
										.then(function (result) {
											connectPages[columnId] = result;
											ok();
										});
								});
							}
						});


						async.parallel(createPageTask, next);
					},

					// Add 'Form' to the connect pages
					function (next) {
						var addFormTasks = [];

						Object.keys(connectPages).forEach(function (key) {
							addFormTasks.push(function (ok) {
								var columnId = parseInt(key),
									page = connectPages[columnId],
									column = selectedObj.columns.filter(function (c) { return c.id == columnId && c.setting.linkObject; })[0],
									object = application.objects.filter(function (obj) { return obj.id == column.setting.linkObject; })[0],
									visibleFieldIds = $.map(object.columns, function (c) { return c.id });

								page.createComponent({
									component: 'form',
									weight: 0,
									setting: {
										title: 'Add ' + object.label,
										object: column.setting.linkObject,
										visibleFieldIds: visibleFieldIds,
										saveVisible: 'show',
										cancelVisible: 'show',
										clearOnLoad: 'yes'
									}
								})
									.fail(ok)
									.then(function () { ok(); });
							});
						});

						async.parallel(addFormTasks, next);
					},

					// Add 'Link' to the connect pages
					function (next) {
						var addLinkTasks = [];

						Object.keys(connectPages).forEach(function (key) {
							addLinkTasks.push(function (ok) {
								var columnId = parseInt(key),
									page = connectPages[columnId];

								page.createComponent({
									component: 'link',
									weight: 1,
									setting: {
										title: 'Back to ' + viewPage.label,
										linkTo: viewPage.id
									}
								})
									.fail(ok)
									.then(function () { ok(); });
							});
						});

						async.parallel(addLinkTasks, next);
					},

					// Insert 'Menu' to the view page
					function (next) {
						if (!viewPage || !$$(componentIds.connectedData) || !$$(componentIds.viewData).getValue() || !hasAddConnectPage.call(self)) return next();

						var menuData = [],
							connectFields = $$(componentIds.connectedData).getValues();

						if ($$(componentIds.viewData).getValue())
							menuData.push(editFormPage.id);

						for (var key in connectFields) {
							if (key.indexOf('|add') > -1 && connectFields[key]) { // Select add connect data
								var columnId = parseInt(key.replace('|add', ''));
								menuData.push(connectPages[columnId].id);
							}
						}

						viewPage.createComponent({
							component: 'menu',
							weight: 1,
							setting: {
								layout: 'x',
								pageIds: menuData
							}
						})
							.fail(next)
							.then(function () { next(); });
					},

					// Add 'Grid' to the view page
					function (next) {
						if (!$$(componentIds.connectedData) || !viewPage) return next();

						var connectFields = $$(componentIds.connectedData).getValues(),
							createGridTasks = [],
							index = 0;

						Object.keys(connectFields).forEach(function (key, i) {
							if (key.indexOf('|list') > -1 && connectFields[key]) {
								createGridTasks.push(function (ok) {
									var columnId = parseInt(key.replace('|list', '')),
										column = selectedObj.columns.filter(function (c) { return c.id == columnId && c.setting.linkObject; })[0],
										object = application.objects.filter(function (obj) { return obj.id == column.setting.linkObject; })[0],
										visibleFieldIds = $.map(object.columns, function (c) { return c.id }),
										linkedField = object.columns.filter(function (col) { return col.setting.linkObject == selectedObj.id; });

									// Create connect data Grid
									viewPage.createComponent({
										component: 'grid',
										weight: i + 2,
										setting: {
											title: object.label,
											object: column.setting.linkObject,
											linkedTo: selectedObj.id,
											linkedField: linkedField[0].id || '',
											columns: visibleFieldIds
										}
									})
										.fail(ok)
										.then(function () { ok(); });
								});
							}
						});

						async.parallel(createGridTasks, next);
					},

					// Add 'Link' to the view page
					function (next) {
						if (!viewPage) return next();

						viewPage.createComponent({
							component: 'link',
							weight: 1000,
							setting: {
								title: "Back to #pageName#".replace(/#pageName#/g, mainPage.label),
								linkTo: mainPage.id
							}
						})
							.fail(next)
							.then(function () { next(); });
					},

					// Finish - Get pages to return
					function (next) {
						application.getPages({ or: [{ id: mainPage.id }, { parent: mainPage.id }] })
							.fail(function (err) {
								q.reject(err);
								next(err);
							})
							.then(function (result) {
								result.forEach(function (r) {
									if (r.translate) r.translate();
								});

								q.resolve(result.attr());

								next();

								$$('QuickPage').hideProgress();

							})
					}
				]);

				return q;
			}
		};

	}
);