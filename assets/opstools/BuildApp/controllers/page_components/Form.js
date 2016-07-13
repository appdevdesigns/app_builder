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
					AD.Control.extend('opstools.BuildApp.Components.Form', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.info = {
								name: 'Form',
								icon: 'fa-list-alt'
							};

							// Model
							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editForm: 'ab-form-edit-mode',

								propertyView: self.info.name + '-property-view',
								selectObject: self.info.name + '-select-object'
							};

							self.view = {
								view: "form",
								autoheight: true,
								elements: []
							};

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var form = $.extend(true, {}, self.getView());
								form.id = self.componentIds.editForm;

								var editView = {
									id: self.componentIds.editView,
									padding: 10,
									rows: [
										form
									]
								};

								return editView;
							};

							self.getPropertyView = function () {
								return {
									view: "property",
									id: self.componentIds.propertyView,
									elements: [
										{ label: "Data source", type: "label" },
										{
											id: self.componentIds.selectObject,
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
										}
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case self.componentIds.selectObject:
													var settings = self.getSettings();

													self.populateSettings(settings);
													break;
											}
										}
									}
								};
							};

							self.setApp = function (app) {
								self.data.app = app;
							};

							self.render = function (viewId, settings) {
								self.data.columns = null;

								$$(viewId).clear();
								$$(viewId).clearValidation();

								// Clear views - redraw
								webix.ui([], $$(viewId));

								if (!settings.object) return;

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).showProgress({ type: "icon" });

								// Get object list
								self.Model.ABColumn.findAll({ object: settings.object })
									.fail(function (err) { $$(viewId).hideProgress(); }) // TODO message
									.then(function (data) {
										data.forEach(function (d) {
											if (d.translate) d.translate();
										});

										self.data.columns = data;

										self.data.columns.forEach(function (c) {
											var element = {
												labelWidth: 100,
												minWidth: 500
											};
											element.label = c.label;

											if (!c.setting.editor) { // Checkbox
												element.view = 'checkbox';
											}
											else if (c.setting.editor === 'selectivity') {
												// TODO
											}
											else if (c.setting.editor === 'popup') {
												element.view = 'textarea';
											}
											else if (c.setting.editor === 'number') {
												element.view = 'counter';
											}
											else if (c.setting.editor === 'date') {
												element.view = 'datepicker';
											}
											else if (c.setting.editor === 'richselect') {
												element.view = 'richselect';
												element.options = $.map(c.setting.filter_options, function (opt, index) {
													return {
														id: index,
														value: opt
													}
												});
											}
											else {
												element.view = c.setting.editor;
											}

											$$(viewId).addView(element);
										});

										$$(viewId).refresh();
										$$(viewId).hideProgress();
									});
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues();

								var settings = {
									object: propertyValues[self.componentIds.selectObject]
								};

								return settings;
							};

							self.populateSettings = function (settings) {
								// Render form component
								self.render(self.componentIds.editForm, settings);

								// Get object list
								self.data.objects = null;
								self.Model.ABObject.findAll({ application: self.data.app.id })
									.fail(function (err) { callback(err); })
									.then(function (result) {
										result.forEach(function (o) {
											if (o.translate)
												o.translate();
										});

										self.data.objects = result;

										// Properties

										// Data source - Object
										var item = $$(self.componentIds.propertyView).getItem(self.componentIds.selectObject);
										item.options = $.map(self.data.objects, function (o) {
											return {
												id: o.id,
												value: o.label
											};
										});

										// Set property values
										var propValues = {};
										propValues[self.componentIds.selectObject] = settings.object;
										$$(self.componentIds.propertyView).setValues(propValues);

										$$(self.componentIds.propertyView).refresh();
									});
							};

							self.editStop = function () {
							};

						},

						getInstance: function () {
							return this;
						}

					});

				});
		});
	}
);