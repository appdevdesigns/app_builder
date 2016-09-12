steal(
	// List your Controller's dependencies here:

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Templates.QuickPage', {

						init: function (element, options) {
							this.componentIds = {
								selectObjects: 'ab-quickpage-select-object',

								displayGrid: 'ab-quickpage-display-grid',
								addNewButton: 'ab-quickpage-add-new-button',
								addNewForm: 'ab-quickpage-add-new-form',

								editData: 'ab-quick-edit-data',
								viewData: 'ab-quick-view-data'
							};
						},

						webix_ready: function () {

						},

						getUIDefinition: function () {
							var self = this;

							return {
								id: 'QuickPage',
								view: 'layout',
								rows: [
									{
										id: self.componentIds.selectObjects,
										view: 'select',
										label: 'Select an object',
										labelWidth: 120,
										options: [],
										on: { onChange: self.selectObject.bind(self) }
									},
									{ height: 10 },
									{
										id: self.componentIds.displayGrid,
										view: 'checkbox',
										labelRight: 'Display multiple #object.label# in a Grid',
										labelWidth: 2
									},
									{
										id: self.componentIds.addNewButton,
										view: 'checkbox',
										labelRight: 'A Menu button linked to a page to Add a new #object.label#',
										labelWidth: 2
									},
									{
										id: self.componentIds.addNewForm,
										view: 'checkbox',
										labelRight: 'Add a new #object.label# with a Form',
										labelWidth: 2
									},
									{ height: 10 },
									{
										view: 'label',
										label: 'Each record in the Grid can be linked to a page that shows on Edit form or a page to View Details',
										// css: 'bold'
									},
									{
										id: self.componentIds.editData,
										view: 'checkbox',
										labelRight: 'Edit selected #object.label#',
										labelWidth: 2
									},
									{
										id: self.componentIds.viewData,
										view: 'checkbox',
										labelRight: 'View details of #object.label#',
										labelWidth: 2
									},
									{ height: 10 },
									{
										id: self.componentIds.connectedData,
										view: 'layout',
										rows: []
									}
								]
							};
						},

						selectObject: function (newv, oldv) {
							var self = this,
								objectLabel = '',
								uiDefinition = self.getUIDefinition();

							// Rename object name to template
							uiDefinition.rows.forEach(function (r) {
								if (r.id) {
									var label = $$(r.id).config.label.replace(/#object.label#/g, objectLabel);
									$$(r.id).define('label', label);
								}
							});

							// Connected data
							// $$(self.componentIds.connectedData).addView
						}

					});
				});
		})
	}
);