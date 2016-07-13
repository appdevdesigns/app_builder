steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.SelectivityHelper', {
						init: function (element, options) {
							var self = this;

							this.options = AD.defaults({
								changedSelectivityEvent: 'AB_Selectivity.Changed',
							}, options);

							// Call parent init
							this._super(element, options);

							self.data = {};

							self.initMultilingualLabels();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							self.labels.noConnectedData = AD.lang.label.getLabel('ab.object.noConnectedData') || "No data selected";
						},

						renderSelectivity: function (cssClass, readOnly) {
							var self = this;

							// Initial multi-combo
							$('.' + cssClass).selectivity('destroy');
							$('.' + cssClass).selectivity({
								allowClear: true,
								multiple: true,
								removeOnly: true,
								readOnly: readOnly || false,
								showDropdown: false,
								showSearchInputInDropdown: false,
								placeholder: self.labels.noConnectedData
							}).on('change', function (ev) {
								// Trigger event
								self.element.trigger(self.options.changedSelectivityEvent, {
									event: ev,
									itemNode: $(this)
								});
							});
						},

						setData: function (node, data) {
							node.selectivity('data', data);
						}


					});
				});
		})
	}
);