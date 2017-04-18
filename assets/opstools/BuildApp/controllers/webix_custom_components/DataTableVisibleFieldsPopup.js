steal(
    // List your Controller's dependencies here:
    function () {
        var data = {},
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
                                        var visible_popup = this.getTopParentView();

                                        visible_popup.dataTable.eachColumn(function (cId) {
                                            visible_popup.dataTable.showColumn(cId);
                                        }, true);

                                        visible_popup.callChangeEvent();
                                    }
                                },
                                {
                                    view: 'button',
                                    value: labels.visible_fields.hideAll,
                                    click: function () {
                                        var visible_popup = this.getTopParentView(),
                                            columns = [];

                                        visible_popup.dataTable.config.columns.forEach(function (c) {
                                            if (c.id != 'appbuilder_trash')
                                                columns.push(c.id);
                                        });

                                        columns.forEach(function (c) {
                                            visible_popup.dataTable.hideColumn(c);
                                        });

                                        visible_popup.callChangeEvent();
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
                                    var visible_popup = this.getTopParentView(),
                                        item = this.getItem(id);

                                    if (visible_popup.dataTable.isColumnVisible(id))
                                        visible_popup.dataTable.hideColumn(id);
                                    else
                                        visible_popup.dataTable.showColumn(id);

                                    visible_popup.callChangeEvent();
                                }
                            }
                        }
                    ]
                },
                on: {
                    onShow: function () {
                        // Initial show/hide icon
                        $('.ab-visible-field-icon').hide();

                        for (key in this.dataTable.config.columns) {
                            var c = this.dataTable.config.columns[key];
                            $($$(componentIds.fieldsList).getItemNode(c.id)).find('.ab-visible-field-icon').show();
                        };
                    }
                }
            },

            registerDataTable: function (dt) {
                this.dataTable = dt;
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
                var visible_popup = this.getTopParentView(),
                    hiddenNumber = 0;

                visible_popup.dataTable.eachColumn(function (cId) {
                    if (!visible_popup.dataTable.isColumnVisible(cId) && cId != 'appbuilder_trash')
                        hiddenNumber++;
                }, true);

                visible_popup.callEvent('onChange', [hiddenNumber]);
            },

            showField: function (id) {
                var visible_popup = this.getTopParentView();

                visible_popup.dataTable.showColumn(id);

                $($$(componentIds.fieldsList).getItemNode(id)).find('.ab-visible-field-icon').show();

                if (visible_popup.dataTable.config.columns.length > 0) {
                    var colId = visible_popup.dataTable.config.columns[0].id;

                    if (colId != 'appbuilder_trash') {
                        visible_popup.dataTable.showColumn('appbuilder_trash');
                    }
                }

                visible_popup.callChangeEvent();
            },

            hideField: function (id) {
                var visible_popup = this.getTopParentView();

                visible_popup.dataTable.hideColumn(id);

                $($$(componentIds.fieldsList).getItemNode(id)).find('.ab-visible-field-icon').hide();

                if (visible_popup.dataTable.config.columns[0].id == 'appbuilder_trash') {
                    visible_popup.dataTable.hideColumn('appbuilder_trash');
                }

                visible_popup.callChangeEvent();
            }

        }, webix.ui.popup);

    }
);