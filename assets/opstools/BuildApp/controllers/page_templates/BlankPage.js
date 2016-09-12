steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABPage.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Templates.BlankPage', {

						init: function (element, options) {
							this.componentId = {
								addNewForm: 'BlankPage',
								addNewParentList: 'ab-interface-add-new-parent-list'
							};

							this.Model = AD.Model.get('opstools.BuildApp.ABPage');

							this.initMultilingualLabels();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							self.labels.common = {};
							self.labels.common.formName = AD.lang.label.getLabel('ab.common.form.name') || "Name";

							self.labels.interface = {};
							self.labels.interface.placeholderPageName = AD.lang.label.getLabel('ab.interface.placeholderPageName') || 'Page name';
						},

						webix_ready: function () {
							webix.extend($$(this.componentId.addNewForm), webix.ProgressBar);
						},

						getUIDefinition: function () {
							var self = this;

							return {
								view: "form",
								id: self.componentId.addNewForm,
								width: 400,
								elements: [
									{ view: "select", id: self.componentId.addNewParentList, label: "Parent page", name: "parent", labelWidth: 110, options: [] },
									{ view: "text", label: self.labels.common.formName, name: "name", required: true, placeholder: self.labels.interface.placeholderPageName, labelWidth: 110 }
								]

							};
						},

						show: function () {
							var self = this;

							$$(self.componentId.addNewForm).clearValidation();
							$$(self.componentId.addNewForm).clear();

							var options = [{ id: '', value: '[Root page]' }];
							self.options.data.pages.each(function (d) {
								if (!d.parent) { // Get only root pages
									options.push({ id: d.id, value: d.label });
								}
							});

							$$(self.componentId.addNewParentList).define('options', options);

							// Default select parent page
							if (self.options.data.selectedPage) {
								var selected_page_id = self.options.data.selectedPage.id;

								if (self.options.data.selectedPage.parent)
									selected_page_id = self.options.data.selectedPage.parent;

								$$(self.componentId.addNewParentList).setValue(selected_page_id);
							}
							else
								$$(self.componentId.addNewParentList).setValue('');

							$$(self.componentId.addNewParentList).render();

						},

						save: function () {
							var self = this,
								q = $.Deferred();

							if (!$$(self.componentId.addNewForm).validate()) {
								q.reject();
								return q;
							}

							var parentPageId = $$(self.componentId.addNewForm).elements['parent'].getValue(),
								newPageName = $$(self.componentId.addNewForm).elements['name'].getValue().trim();

							$$(self.componentId.addNewForm).showProgress({ type: 'icon' });

							var newPage = {
								application: self.options.data.appId,
								name: newPageName,
								label: newPageName
							};

							if (parentPageId)
								newPage.parent = parentPageId;

							// Call create new page to server
							self.Model.create(newPage).fail(function (err) {
								$$(self.componentId.addNewForm).hideProgress();

								q.reject(err);

								// TODO : should show error message in InterfaceList.js
								// webix.message({
								// 	type: "error",
								// 	text: self.labels.common.createErrorMessage.replace("{0}", newPage.label)
								// });

								// AD.error.log('Page : Error create page data', { error: err });
							}).then(function (result) {
								if (result.translate) result.translate();

								$$(self.componentId.addNewForm).hideProgress();
								$$(self.componentId.addNewForm).clear();

								q.resolve(result);
							});

							return q;
						}

					});

				});
		});
	}
);