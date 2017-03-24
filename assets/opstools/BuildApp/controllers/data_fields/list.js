steal(
    'opstools/BuildApp/controllers/utils/SelectivityHelper.js',

    'opstools/BuildApp/controllers/webix_custom_components/EditList.js',
    function(selectivityHelper) {
        var componentIds = {
            editView: 'ab-new-select-list',
            listOptions: 'ab-new-select-option',
            newOption: 'ab-new-select-new',
            multiSelectOption: 'ab-new-select-multiselect',

            singleDefault: 'ab-new-select-single-default',
            multipleDefault: 'ab-new-select-multiple-default'
        };

        // General settings
        var listDataField = {
            name: 'list',
            type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
            icon: 'th-list',
            menuName: AD.lang.label.getLabel('ab.dataField.list.menuName') || 'Select list',
            includeHeader: true,
            description: AD.lang.label.getLabel('ab.dataField.list.description') || 'Single select allows you to select a single predefined options below from a dropdown.'
        };

        var removedOptionIds = [];

        function updateDefaultList(application, object, fieldData, rowData, data, viewId, itemNode, options) {
            var optList = $$(componentIds.listOptions).find({}).map(function (opt) {
                return {
                    id: opt.dataId,
                    value: opt.label
                }
            });

            optList.unshift({
                id: 'none',
                value: '[No Default]'
            });

            $$(componentIds.singleDefault).define('options', optList);
            $$(componentIds.singleDefault).setValue('none');

//          $$(componentIds.multipleDefault)
//          listDataField.customDisplay(application, object, fieldData, rowData, data, viewId, itemNode, options)
        }

        // Edit definition
        listDataField.editDefinition = {
            id: componentIds.editView,
            rows: [{
                    view: "checkbox",
                    id: componentIds.multiSelectOption,
                    labelRight: AD.lang.label.getLabel('ab.dataField.list.multiSelectOption') || 'Multiselect',
                    labelWidth: 0,
                    value: false,
                    on: {
                        onChange: function () {
                            if (this.getValue() == true) {
                                $$(componentIds.singleDefault).hide();
                                $$(componentIds.multipleDefault).show();
                            }
                            else {
                                $$(componentIds.singleDefault).show();
                                $$(componentIds.multipleDefault).hide();
                            }
                        }
                    }
                },
                { view: "label", label: "<b>{0}</b>".replace('{0}', "Options") },
                {
                    view: "editlist",
                    id: componentIds.listOptions,
                    template: "<div style='position: relative;'>#label#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
                    autoheight: true,
                    drag: true,
                    editable: true,
                    editor: "text",
                    editValue: "label",
                    onClick: {
                        "ab-new-field-remove": function(e, id, trg) {
                            var dataId = $$(componentIds.listOptions).getItem(id).dataId;

                            // Store removed id to array
                            if (typeof dataId === 'number')
                                removedOptionIds.push(dataId);

                            $$(componentIds.listOptions).remove(id);
                        }
                    },
                    on: {
                        onAfterAdd: function() {
                            updateDefaultList();
                        },
                        onAfterEditStop: function() {
                            updateDefaultList();
                        },
                        onAfterDelete: function() {
                            updateDefaultList();
                        }
                    }
                },
                {
                    view: "button",
                    value: "Add new option",
                    click: function() {
                        var temp_id = 'temp_' + webix.uid();
                        var itemId = $$(componentIds.listOptions).add({ id: temp_id, dataId: temp_id, label: '' }, $$(componentIds.listOptions).count());
                        $$(componentIds.listOptions).edit(itemId);
                    }
                },
                {
                    id: componentIds.singleDefault,
                    view: 'richselect',
                    label: 'Default',
                    value: 0
                },
                {
                    id: componentIds.multipleDefault,
                    view: 'template',
                    label: 'Default',
                    borderless: true,
                    hidden: true,
                    template: '<div class="list-data-values"></div>'
                }
            ]
        };

        // Populate settings (when Edit field)
        listDataField.populateSettings = function(application, data) {
            if (!data.setting) return;

            var options = [];
            data.setting.options.forEach(function(opt) {
                options.push({
                    dataId: opt.dataId,
                    id: opt.id,
                    label: opt.label
                });
            });
            $$(componentIds.multiSelectOption).setValue(data.setting.multiSelect);
            $$(componentIds.listOptions).parse(options);
            $$(componentIds.listOptions).refresh();
        };

        // For save field
        listDataField.getSettings = function() {
            var options = [],
                filter_options = [];

            $$(componentIds.listOptions).editStop(); // Close edit mode
            $$(componentIds.listOptions).data.each(function(opt) {
                var optId = typeof opt.dataId == 'string' && opt.dataId.startsWith('temp') ? null : opt.dataId;

                options.push({ dataId: optId, id: opt.label.replace(/ /g, '_'), value: opt.label });

                filter_options.push(opt.label);
            });

            // Filter value is not empty
            filter_options = $.grep(filter_options, function(name) { return name && name.length > 0; });
            options = $.grep(options, function(opt) { return opt && opt.value && opt.value.length > 0; });

            if (options.length < 1) {
                webix.alert({
                    title: AD.lang.label.getLabel('ab.dataField.list.warning.optionRequired') || "Option required",
                    text: AD.lang.label.getLabel('ab.dataField.list.warning.optionRequireDescription') || "Enter at least one option.",
                    ok: AD.lang.label.getLabel('ab.common.ok') || "Ok"
                })

                return null;
            }

            //isMultiselect will be a number, 1 or 0 for true or false
            var isMultiselect = $$(componentIds.multiSelectOption).getValue();

            return {
                fieldName: listDataField.name,
                type: 'string',
                setting: {
                    icon: listDataField.icon,
                    filter_type: 'list',
                    editor: isMultiselect ? 'template' : 'richselect',
                    options: options, // [{"dataId":"ABList.id","id":"STRING","label":"STRING"}]
                    filter_options: filter_options,
                    multiSelect: isMultiselect,
                    template: isMultiselect ? '<div class="list-data-values"></div>' : undefined
                },
                removedOptionIds: removedOptionIds
            };
        };

        listDataField.customDisplay = function(application, object, fieldData, rowData, data, viewId, itemNode, options) {
            if (!fieldData.setting.multiSelect || fieldData.setting.multiSelect === '0') return false;
            $(itemNode).find('.list-data-values').selectivity({
                allowClear: true,
                multiple: true,
                readOnly: !!options.readOnly,
                items: $.makeArray(fieldData.setting.filter_options),
                value: (data || '').split(','),
                placeholder: AD.lang.label.getLabel('ab.object.noConnectedData') || "No data selected"
            });

            $(itemNode).off('change');
            $(itemNode).on('change', function() {
                // Wait until selectivity populate data completely
                setTimeout(function () {

                    var selectedData = {
                        objectId: object.id,
                        columnName: fieldData.name,
                        rowId: rowData.id,
                        data: listDataField.getValue(application, object, fieldData, itemNode)
                    };

                    $(listDataField).trigger('update', selectedData);
                }, 600);
            });
 
            return true;
        };
        listDataField.hasCustomEdit = function(fieldData) {
            //!! will ensure that this function will return a boolean value
            return !!fieldData.setting.multiSelect && fieldData.setting.multiSelect !== '0';
        };
        listDataField.customEdit = function(application, object, fieldData, dataId, itemNode) {
            if (!fieldData.setting.multiSelect || fieldData.setting.multiSelect === '0') return true;
            $(itemNode).find('.list-data-values').selectivity('open');
            return true;
        };
        listDataField.setValue = function(fieldData, itemNode, data) {
            $(itemNode).find('.list-data-values').selectivity("value", (data).split(','));
        };
        listDataField.getValue = function getValue(application, object, fieldData, itemNode) {
            if (!fieldData.setting.multiSelect || fieldData.setting.multiSelect === '0') return undefined;
            var values = $(itemNode).find('.list-data-values').selectivity("value");
            return values.join(",");
        };

        // Reset state
        listDataField.resetState = function() {
            $$(componentIds.listOptions).editCancel();
            $$(componentIds.listOptions).unselectAll();
            $$(componentIds.listOptions).clearAll();
            $$(componentIds.multiSelectOption).setValue(0);

            removedOptionIds = [];
        };

        return listDataField;

    });