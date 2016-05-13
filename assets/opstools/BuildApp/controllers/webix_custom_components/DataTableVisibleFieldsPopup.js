steal(
    // List your Controller's dependencies here:
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/ad',
                'appdev/control/control').then(function () {

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.BuildApp.DataTableVisibleFieldsPopup', {


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.initWebixControls();
                        },

						initWebixControls: function () {

							webix.protoUI({
                                name: "visible_fields_popup",
                                $init: function (config) {
                                },
                                defaults: {
                                    body: {
                                        view: 'list',
                                        autoheight: true,
                                        select: false,
                                        template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-square ab-visible-field-icon"></i>&nbsp;</span> #value#',
                                        on: {
                                            onItemClick: function (id, e, node) {
                                                var item = this.getItem(id),
                                                    dataTable = this.getTopParentView().dataTable;

                                                if (dataTable.isColumnVisible(id)) {
                                                    $(node).find('.ab-visible-field-icon').hide();
                                                    dataTable.hideColumn(id);
                                                }
                                                else {
                                                    $(node).find('.ab-visible-field-icon').show();
                                                    dataTable.showColumn(id);
                                                }

                                            }
                                        }
                                    }
                                },
                                registerDataTable: function (dataTable) {
                                    var self = this;

                                    self.dataTable = dataTable;
                                    self.getBody().parse(self.getFieldList());
                                },
                                getFieldList: function () {
                                    var self = this,
                                        fieldList = [];

                                    self.dataTable.eachColumn(function (columnId) {
                                        var columnConfig = self.dataTable.getColumnConfig(columnId);

                                        fieldList.push({
                                            id: columnId,
                                            value: $(columnConfig.header[0].text).text().trim()
                                        });
                                    });

                                    return fieldList;
                                },
                            }, webix.ui.popup);


						}
					});
				});
		});
	}
);