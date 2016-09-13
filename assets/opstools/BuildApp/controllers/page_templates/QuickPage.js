steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Templates.QuickPage', {

						init: function (element, options) {
							this.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),

								ABPage: AD.Model.get('opstools.BuildApp.ABPage'),
								ABPageComponent: AD.Model.get('opstools.BuildApp.ABPageComponent')
							};

							this.data = {};

							this.componentIds = {
								selectObjects: 'ab-quickpage-select-object',

								displayGrid: 'ab-quickpage-display-grid',
								addNewButton: 'ab-quickpage-add-new-button',
								addNewForm: 'ab-quickpage-add-new-form',

								editData: 'ab-quick-edit-data',
								viewData: 'ab-quick-view-data',

								connectedData: 'ab-quick-connected-data'
							};
						},

						webix_ready: function () {
						},

						getUIDefinition: function () {
							var self = this;

							return {
								id: 'QuickPage',
								view: 'layout',
								css: 'ab-interface-new-quick-page',
								rows: [
									{
										id: self.componentIds.selectObjects,
										view: 'select',
										label: 'Select an object',
										labelWidth: 120,
										css: 'bold',
										options: [],
										on: { onChange: self.selectObject.bind(self) }
									},
									{ height: 10 },
									{
										id: self.componentIds.displayGrid,
										view: 'checkbox',
										labelRight: 'Display multiple <b>object.label</b> in a Grid',
										labelWidth: 2
									},
									{
										id: self.componentIds.addNewButton,
										view: 'checkbox',
										labelRight: 'A Menu button linked to a page to Add a new <b>object.label</b>',
										labelWidth: 2
									},
									{
										id: self.componentIds.addNewForm,
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
										id: self.componentIds.editData,
										view: 'checkbox',
										labelRight: 'Edit selected <b>object.label</b>',
										labelWidth: 2
									},
									{
										id: self.componentIds.viewData,
										view: 'checkbox',
										labelRight: 'View details of <b>object.label</b>',
										labelWidth: 2
									}
								]
							};
						},

						show: function () {
							this.populateObjects();
						},

						save: function () {
							var q = $.Deferred(),
								self = this,
								mainPageId, formPageId, editFormId, viewPageId, connectFormPageId;

							var selectedObj = self.data.objects.filter(function (obj) {
								return obj.id == $$(self.componentIds.selectObjects).getValue();
							})[0];

							async.series([
								// Create the main page
								function (next) {
									self.Model.ABPage.create({
										application: self.options.data.appId,
										name: selectedObj.name,
										label: selectedObj.label
									})
										.fail(function (err) { next(err); })
										.then(function (result) {
											mainPageId = result.id;
											next();
										});
								},

								// Create the object form page
								function (next) {
									// Check 'Add new object' or 'Edit object'
									if ($$(self.componentIds.addNewButton).getValue() || $$(self.componentIds.editData).getValue()) {
										// Create form page
										self.Model.ABPage.create({
											application: self.options.data.appId,
											parent: mainPageId,
											name: 'Add ' + selectedObj.name,
											label: 'Add ' + selectedObj.label
										})
											.fail(function (err) { next(err); })
											.then(function (result) {
												formPageId = result.id;
												next();
											});
									}
									else {
										next();
									}
								},

								// Insert 'Add new object' to the main page
								function (next) {
									if ($$(self.componentIds.addNewButton).getValue()) {
										// Create 'Menu' component
										self.Model.ABPageComponent.create({
											page: mainPageId,
											component: 'Menu',
											weight: 0,
											setting: {
												layout: "x",
												data: [formPageId]
											}
										})
											.fail(function (err) { next(err); })
											.then(function () { next() });
									}
									else {
										next();
									}
								},

								// Insert 'Object form' to the main page
								function (next) {
									if ($$(self.componentIds.addNewForm).getValue()) {
										self.Model.ABPageComponent.create({
											page: mainPageId,
											component: 'Form',
											weight: 2,
											setting: {
												object: $$(self.componentIds.selectObjects).getValue(),
												title: 'Add ' + selectedObj.label,
												visibleFieldIds: $.map(selectedObj.columns, function (col) { return col.id; }),
												saveVisible: "show"
											}
										})
											.fail(function (err) { next(err); })
											.then(function (result) { next(); });
									}
									else {
										next();
									}
								},

								// Insert 'Object form' to the object form page
								function (next) {
									if (formPageId) {
										self.Model.ABPageComponent.create({
											page: formPageId,
											component: 'Form',
											weight: 2,
											setting: {
												object: $$(self.componentIds.selectObjects).getValue(),
												title: 'Edit ' + selectedObj.label,
												visibleFieldIds: $.map(selectedObj.columns, function (col) { return col.id; }),
												saveVisible: "show",
												cancelVisible: "show"
											}
										})
											.fail(function (err) { next(err); })
											.then(function (result) {
												editFormId = result.id;
												next();
											});
									}
									else {
										next();
									}
								},

								// Insert 'Object grid' to the main page
								function (next) {
									if ($$(self.componentIds.displayGrid).getValue()) {
										self.Model.ABPageComponent.create({
											page: mainPageId,
											component: 'Grid',
											weight: 1,
											setting: {
												title: selectedObj.label,
												object: $$(self.componentIds.selectObjects).getValue(),
												editPage: formPageId || null,
												editForm: editFormId || null,
												columns: $.map(selectedObj.columns, function (col) { return col.id; }),
												removable: "disable"

												// TODO: Add 'view button'
											}
										})
											.fail(function (err) { next(err); })
											.then(function () { next(); });
									}
									else {
										next();
									}
								},


								// TODO Connected data page
								// $$(self.componentIds.connectedData).getValues() -- get connect properties data

								// Finish
								function (next) {
									self.Model.ABPage.findOne({ id: mainPageId })
										.then(function (result) {
											if (result.translate) result.translate();

											q.resolve(result.attr());
											next();
										})
								}
							]);

							return q;
						},

						populateObjects: function () {
							var self = this;

							self.Model.ABObject.findAll({ application: self.options.data.appId })
								.then(function (objects) {
									objects.forEach(function (obj) {
										if (obj.translate) obj.translate();
									});

									self.data.objects = objects.attr();

									$$(self.componentIds.selectObjects).define('options', $.map(self.data.objects, function (obj) {
										return {
											id: obj.id,
											value: obj.label
										};
									}));
									$$(self.componentIds.selectObjects).refresh();

									self.selectObject($$(self.componentIds.selectObjects).getValue());
								});
						},

						selectObject: function (newv, oldv) {
							var self = this,
								uiDefinition = self.getUIDefinition();

							var selectedObj = self.data.objects.filter(function (obj) {
								return obj.id == $$(self.componentIds.selectObjects).getValue();
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
							var connectedCols = selectedObj.columns.filter(function (col) { return col.linkToObject; });

							$$('QuickPage').removeView(self.componentIds.connectedData);

							if (connectedCols.length > 0) {
								var connectedLayout = {
									id: self.componentIds.connectedData,
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
										self.Model.ABColumn.findAll({ object: selectedObj.id, linkToObject: { '!': null } })
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
											connectedLayout.elements.push({
												id: webix.uid(),
												name: col.name + '-display-list',
												view: 'checkbox',
												labelRight: 'List connected <b>#col.name#</b> with a Grid'.replace('#col.name#', col.label),
												labelWidth: 2
											});

											connectedLayout.elements.push({
												id: webix.uid(),
												name: col.name + '-add-connect-data',
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

					});
				});
		})
	}
);