steal(
    // List your Controller's dependencies here:
    function () {
        var data = {},
            dataTable,
            componentIds = {
                fieldsList: 'ab-visible-fields-list'
            },
            labels = {
                visible_fields: {
                    showAll: AD.lang.label.getLabel('ab.visible_fields.showAll') || "Show all",
                    hideAll: AD.lang.label.getLabel('ab.visible_fields.hideAll') || "Hide all"
                }
            };

        webix.protoUI({
            name: "visible_fields_popup",
            $init: function (config) {
            },
            defaults: {
                body: {
                    rows: [
                        {
                            cols: [
                                {
                                    view: 'button',
                                    value: labels.visible_fields.showAll,
                                    click: function () {
                                        dataTable.eachColumn(function (cId) {
                                            dataTable.showColumn(cId);
                                        }, true);

                                        this.getTopParentView().callChangeEvent();
                                    }
                                },
                                {
                                    view: 'button',
                                    value: labels.visible_fields.hideAll,
                                    click: function () {
                                        var columns = [];

                                        dataTable.config.columns.forEach(function (c) {
                                            if (c.id != 'appbuilder_trash')
                                                columns.push(c.id);
                                        });

                                        columns.forEach(function (c) {
                                            dataTable.hideColumn(c);
                                        });

                                        this.getTopParentView().callChangeEvent();
                                    }
                                }
                            ]
                        },
                        {
                            view: 'list',
                            id: componentIds.fieldsList,
                            autoheight: true,
                            select: false,
                            template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle ab-visible-field-icon"></i>&nbsp;</span> #label#',
                            on: {
                                onItemClick: function (id, e, node) {
                                    var item = this.getItem(id),
                                        dataTable = dataTable;

                                    if (dataTable.isColumnVisible(id))
                                        dataTable.hideColumn(id);
                                    else
                                        dataTable.showColumn(id);

                                    this.getTopParentView().callChangeEvent();
                                }
                            }
                        }
                    ]
                },
                on: {
                    onShow: function () {
                        // Initial show/hide icon
                        $('.ab-visible-field-icon').hide();

                        for (key in dataTable.config.columns) {
                            var c = dataTable.config.columns[key];
                            $($$(componentIds.fieldsList).getItemNode(c.id)).find('.ab-visible-field-icon').show();
                        };
                    }
                }
            },

            registerDataTable: function (dt) {
                dataTable = dt;
            },

            setFieldList: function (fieldList) {
                // We can remove it when we can get all column from webix datatable (include hidden fields)
                data.fieldList = fieldList;

                this.bindFieldList();
            },

            bindFieldList: function () {
                $$(componentIds.fieldsList).clearAll();
                $$(componentIds.fieldsList).parse(this.getFieldList());
            },

            getFieldList: function () {
                var result = [];

                // Get all columns include hidden columns
                if (data.fieldList) {
                    data.fieldList.forEach(function (f) {
                        result.push({
                            id: f.name,
                            label: f.label
                        });
                    });
                }

                return result;
            },

            callChangeEvent: function () {
                var hiddenNumber = 0;

                dataTable.eachColumn(function (cId) {
                    if (!dataTable.isColumnVisible(cId))
                        hiddenNumber++;
                }, true);

                this.getTopParentView().callEvent('onChange', [hiddenNumber]);
            },

            showField: function (id) {
                dataTable.showColumn(id);

                $($$(componentIds.fieldsList).getItemNode(id)).find('.ab-visible-field-icon').show();

                this.getTopParentView().callChangeEvent();
            },

            hideField: function (id) {
                dataTable.hideColumn(id);

                $($$(componentIds.fieldsList).getItemNode(id)).find('.ab-visible-field-icon').hide();

                this.getTopParentView().callChangeEvent();
            }

        }, webix.ui.popup);

    }
);