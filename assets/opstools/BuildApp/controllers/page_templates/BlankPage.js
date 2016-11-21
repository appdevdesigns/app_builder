steal(
	// List your Controller's dependencies here:
	function () {
		var componentId = {
			addNewForm: 'BlankPage',
			addNewParentList: 'ab-interface-add-new-parent-list'
		},
			labels = {
				common: {
					formName: AD.lang.label.getLabel('ab.common.form.name') || "Name"
				},
				interface: {
					placeholderPageName: AD.lang.label.getLabel('ab.interface.placeholderPageName') || 'Page name'
				}
			};

		return {
			webix_ready: function () {
				webix.extend($$(componentId.addNewForm), webix.ProgressBar);
			},

			getUIDefinition: function () {
				return {
					view: "form",
					id: componentId.addNewForm,
					width: 400,
					elements: [
						{ view: "select", id: componentId.addNewParentList, label: "Parent page", name: "parent", labelWidth: 110, options: [] },
						{ view: "text", label: labels.common.formName, name: "name", required: true, placeholder: labels.interface.placeholderPageName, labelWidth: 110 }
					]

				};
			},

			show: function (application, selectedPage) {
				$$(componentId.addNewForm).clearValidation();
				$$(componentId.addNewForm).clear();

				var options = [{ id: '', value: '[Root page]' }];
				application.pages.each(function (d) {
					if (!d.parent) { // Get only root pages
						options.push({ id: d.id, value: d.label });
					}
				});

				$$(componentId.addNewParentList).define('options', options);

				// Default select parent page
				if (selectedPage) {
					var selected_page_id = selectedPage.id;

					if (selectedPage.parent)
						selected_page_id = selectedPage.parent;

					$$(componentId.addNewParentList).setValue(selected_page_id);
				}
				else
					$$(componentId.addNewParentList).setValue('');

				$$(componentId.addNewParentList).render();

			},

			save: function (application) {
				var self = this,
					q = $.Deferred();

				if (!$$(componentId.addNewForm).validate()) {
					q.reject();
					return q;
				}

				var parentPageId = $$(componentId.addNewForm).elements['parent'].getValue(),
					newPageName = $$(componentId.addNewForm).elements['name'].getValue().trim();

				$$(componentId.addNewForm).showProgress({ type: 'icon' });

				var newPage = {
					name: newPageName,
					label: newPageName
				};

				if (parentPageId)
					newPage.parent = parentPageId;

				// Call create new page to server
				application.createPage(newPage).fail(function (err) {
					$$(componentId.addNewForm).hideProgress();

					q.reject(err);

					// TODO : should show error message in InterfaceList.js
					// webix.message({
					// 	type: "error",
					// 	text: labels.common.createErrorMessage.replace("{0}", newPage.label)
					// });

					// AD.error.log('Page : Error create page data', { error: err });
				}).then(function (result) {
					$$(componentId.addNewForm).hideProgress();
					$$(componentId.addNewForm).clear();

					q.resolve(result);
				});

				return q;
			}
		};
	}
);