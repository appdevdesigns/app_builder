steal(
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',
	function (selectivityHelper) {
		var events = {},
			componentIds = {
				editView: 'ab-new-connectObject',

				objectList: 'ab-new-connectObject-list-item',
				objectCreateNew: 'ab-new-connectObject-create-new',

				fieldLink: 'ab-add-field-link-from',
				fieldLink2: 'ab-add-field-link-from-2',
				fieldLinkType: 'ab-add-field-link-type-to',
				fieldLinkViaType: 'ab-add-field-link-type-from',
				fieldLinkVia: 'ab-add-field-link-to',
				fieldLinkVia2: 'ab-add-field-link-to-2',

				connectDataPopup: 'ab-connect-object-data-popup'
			};

		// General settings
		var connectObjectField = {
			name: 'connectObject',
			type: 'connectObject',
			icon: 'external-link',
			menuName: 'Connect to another record',
			includeHeader: true,
			description: '',
			formView: 'template' //
		};

		function initConnectDataPopup(object, columnName, rowId, selectivityNode) {
			if (!$$(componentIds.connectDataPopup)) {
				webix.ui({
					id: componentIds.connectDataPopup,
					view: "connected_data_popup",
				});
			}

			// Connect data popup
			$$(componentIds.connectDataPopup).onSelect(function (selectedItems) {
				selectivityHelper.setData(selectivityNode, selectedItems);
			});

			$$(componentIds.connectDataPopup).onClose(function (selectedItems) {
				selectivityHelper.setData(selectivityNode, selectedItems);

				var connectData = getReturnData(object, columnName, rowId, selectedItems);

				$(connectObjectField).trigger('update', connectData);
			});
		}


// TODO: relocat this to dataFieldsManager.getReturnData()
// connectObjectField.DataFieldManager.getReturnData()
		function getReturnData(object, columnName, rowId, selectedItems) {
			var connectData = {};
			connectData.objectId = object.id;
			connectData.columnName = columnName;
			connectData.rowId = rowId;
			connectData.data = $.map(selectedItems, function (item) { return item.id; });
			connectData.displayData = $.map(selectedItems, function (item) {
				return {
					id: item.id,
					dataLabel: item.text
				}
			});

			if (connectData.data.length === 0)
				connectData.data = '';
			else if (connectData.data.length === 1)
				connectData.data = connectData.data[0]; // Convert Array to string

			return connectData;
		}

		// Listen change selectivity item event
		$(selectivityHelper).on('change', function (event, result) {
			if (result.event && result.event.removed) {
				var selectedItems = selectivityHelper.getData(result.itemNode),
					connectData = getReturnData(
						result.event.removed.object,
						result.event.removed.columnName,
						result.event.removed.rowId,
						selectedItems);

				$(connectObjectField).trigger('update', connectData);
			}
		});

		// Edit definition
		connectObjectField.editDefinition = {
			id: componentIds.editView,
			rows: [
				{
					view: "label",
					label: "Connect to Object"
				},
				{
					view: "list",
					id: componentIds.objectList,
					select: true,
					height: 140,
					template: "<div class='ab-new-connectObject-list-item'>#label#</div>",
					on: {
						onAfterSelect: function () {
							var selectedObjLabel = this.getSelectedItem(false).label;
							$$(componentIds.fieldLinkVia).setValue(selectedObjLabel);
							$$(componentIds.fieldLinkVia2).setValue(selectedObjLabel);
						}
					}
				},
				{
					view: 'button',
					id: componentIds.objectCreateNew,
					value: 'Connect to new Object',
					click: function () {
						if (this.getTopParentView().createNewObjectEvent)
							this.getTopParentView().createNewObjectEvent();
					}
				},
				{
					view: 'layout',
					cols: [
						{
							id: componentIds.fieldLink,
							view: 'label',
							width: 110
						},
						{
							id: componentIds.fieldLinkType,
							view: "segmented",
							value: "collection",
							width: 165,
							inputWidth: 160,
							options: [
								{ id: "collection", value: "Has many" },
								{ id: "model", value: "Belong to" }
							]
						},
						{
							id: componentIds.fieldLinkVia,
							view: 'label',
							label: '[Select object]',
							width: 110
						},
					]
				},
				{
					view: 'layout',
					cols: [
						{
							id: componentIds.fieldLinkVia2,
							view: 'label',
							label: '[Select object]',
							width: 110
						},
						{
							id: componentIds.fieldLinkViaType,
							view: "segmented",
							value: "model",
							width: 165,
							inputWidth: 160,
							options: [
								{ id: "collection", value: "Has many" },
								{ id: "model", value: "Belong to" }
							]
						},
						{
							id: componentIds.fieldLink2,
							view: 'label',
							width: 110
						},
					]
				}
			]
		};

		// Populate settings (when Edit field)
		connectObjectField.populateSettings = function (application, fieldData) {
			$$(componentIds.editView).appName = application.name;

			var objectList = AD.op.WebixDataCollection(application.objects);
			objectList.attachEvent('onAfterAdd', function (id, index) {
				$$(componentIds.objectList).filter(function (obj) { return obj.id != application.currObj.id; });
			});
			objectList.attachEvent('onAfterDelete', function () {
				$$(componentIds.objectList).filter(function (obj) { return obj.id != application.currObj.id; });
			});
			$$(componentIds.objectList).clearAll();
			$$(componentIds.objectList).data.unsync();
			$$(componentIds.objectList).data.sync(objectList);
			$$(componentIds.objectList).refresh();
			$$(componentIds.objectList).filter(function (obj) { return obj.id != application.currObj.id; });

			$$(componentIds.fieldLink).setValue(application.currObj.label);
			$$(componentIds.fieldLink2).setValue(application.currObj.label);

			$$(componentIds.fieldLinkViaType).linkVia = null;

			if (!fieldData.setting || !fieldData.setting.linkObject || !fieldData.setting.linkType) return;

			var selectedObject = $$(componentIds.objectList).data.find(function (obj) {
				var linkObjId = fieldData.setting.linkObject;
				return obj.id == linkObjId;
			});

			$$(componentIds.objectList).disable();
			if (selectedObject && selectedObject.length > 0)
				$$(componentIds.objectList).select(selectedObject[0].id);
			$$(componentIds.objectCreateNew).disable();

			$$(componentIds.fieldLinkType).setValue(fieldData.setting.linkType);
			$$(componentIds.fieldLinkViaType).setValue(fieldData.setting.linkViaType);
			$$(componentIds.fieldLinkViaType).linkVia = fieldData.setting.linkVia;
		};

		// For save field
		connectObjectField.getSettings = function () {
			var linkObject = $$(componentIds.objectList).getSelectedItem();
			if (!linkObject) {
				webix.alert({
					title: "Object required",
					text: "Please select object to connect.",
					ok: "Ok"
				})
				return null;
			}

			return {
				fieldName: connectObjectField.name,
				type: connectObjectField.type,
				setting: {
					appName: $$(componentIds.editView).appName,
					linkType: $$(componentIds.fieldLinkType).getValue(),
					linkObject: $$(componentIds.objectList).getSelectedId(false),
					linkViaType: $$(componentIds.fieldLinkViaType).getValue(),
					linkVia: $$(componentIds.fieldLinkViaType).linkVia,
					icon: connectObjectField.icon,
// choose something that isn't a Webix standard data editor
// then add a .template field. (use a class definition that you can lookup in .customDisplay)
					editor: 'selectivity',
					template: '<div class="connect-data-values"></div>',
/*

template: function(data) {
	return '<div class="unique-value'
}

*/
					filter_type: 'multiselect'
				}
			};
		};

// customDisplay : renders this DataField in it's cell. (form or grid)
// application: the ABApplication instance for our running application
// object : the ABObject that contains this DataField
// columnName : the ABColumn.name of the column definition that contains this DataField 
// rowId : the .id of the Model Instance from which we are getting the data for this DataField
// data : the value of this DataField
// itemNode : the cell that contains this DataField (DOM reference)
// options  : provided by the calling component (grid or Form) and currently only has .readOnly:bool
		connectObjectField.customDisplay = function (application, object, columnName, rowId, data, itemNode, options) {
			
// insert a <div id="xxx"></div> into current itemNode,
// then create a Webix container that 
// webix.ui({
// 	container:'xxx',
// })
// 'xxx' must be unique for this row/column entry.

			// Initial selectivity
			selectivityHelper.renderSelectivity(itemNode, 'connect-data-values', options.readOnly);


			var selectedItems = [];
			if (data) {
				if (data.map) {
					selectedItems = data.map(function (cVal) {
						return {
							id: cVal.id,
							text: cVal.dataLabel,
							object: object,
							columnName: columnName,
							rowId: rowId
						};
					});
				}
				else if (data.id) {
					selectedItems.push({
// add in additional data values so that they get passed back on the selectivity .change event
// this is where we get the result.XXX values in the getReturnData() function.
						id: data.id,
						text: data.dataLabel,
						object: object,
						columnName: columnName,
						rowId: rowId
					});
				}
			}

			// Set selectivity data
			var selectivityNode = $(itemNode).find('.connect-data-values');
			selectivityHelper.setData(selectivityNode, selectedItems);

			return true;
		};


// on a grid or form, when the user clicks on a Data Field, this gets called to display the Editor.
// if the DataField defines this, our AppBuilder knows to call this when clicked.
// fieldData : the ABColumn object that contains this DataField
// dataId : the rowId
		connectObjectField.customEdit = function (application, object, fieldData, dataId, itemNode) {
			if (!application || !fieldData || !fieldData.setting.linkObject || !fieldData.setting.linkVia) return false;

			var selectivityNode = $(itemNode).find('.connect-data-values'),
				selectedData = selectivityHelper.getData(selectivityNode),
				selectedIds = $.map(selectedData, function (d) { return d.id; });

			// Init connect data popup
			initConnectDataPopup(object, fieldData.name, dataId, selectivityNode);

			// Get the link object
			var linkObject = application.objects.filter(function (o) { return o.id == fieldData.setting.linkObject; });
			if (!linkObject || linkObject.length < 1)
				return false;
			else
				linkObject = linkObject[0];

			// Get the via column
			var linkVia = linkObject.columns.filter(function (col) { return col.id == fieldData.setting.linkVia; });
			if (!linkVia || linkVia.length < 1)
				return false;
			else
				linkVia = linkVia[0];

			// Open popup
			$$(componentIds.connectDataPopup).open(application, linkObject, dataId, selectedIds, fieldData.setting.linkType, linkVia.name, linkVia.setting.linkType);

			return false;
		};


// when a Form component gathers the data, this gets called to interpret what should be returned.
// 
		connectObjectField.getValue = function (application, object, fieldData, itemNode) {
			var selectivityNode = $(itemNode).find('.connect-data-values'),
				selectedValues = selectivityHelper.getData(selectivityNode);

			if (selectedValues && selectedValues.length > 0) {
				return $.map(selectedValues, function (selectedItem) {
					return selectedItem.id;
				});
			}
			else {
				return '';
			}
		};

		// Reset state
		connectObjectField.resetState = function () {
			$$(componentIds.editView).appName = null;
			$$(componentIds.objectList).unselectAll();
			$$(componentIds.objectList).enable();
			$$(componentIds.fieldLink).setValue('');
			$$(componentIds.fieldLink2).setValue('');
			$$(componentIds.fieldLinkType).setValue('collection');
			$$(componentIds.fieldLinkViaType).setValue('model');
			$$(componentIds.fieldLinkVia).setValue('[Select object]');
			$$(componentIds.fieldLinkVia2).setValue('[Select object]');
			$$(componentIds.objectCreateNew).enable();
		};

		return connectObjectField;
	}
);