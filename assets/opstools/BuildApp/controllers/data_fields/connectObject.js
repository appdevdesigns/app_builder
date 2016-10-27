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

		function initConnectDataPopup(objectId, fieldData, selectivityNode) {
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

				// Convert Array to Object
				if (fieldData.setting.linkType == 'model' && selectedItems[0])
					selectedItems = selectedItems[0];

				var returnData = {
					objectId: objectId,
					data: $.map(selectedItems, function (item) { return item.id; }),
					displayData: $.map(selectedItems, function (item) {
						return {
							id: item.id,
							dataLabel: item.text
						}
					})
				};

				// $.map(result.data, function (item) {
				// 	return {
				// 		id: item.id,
				// 		dataLabel: item.text
				// 	};
				// }) || [];

				$(connectObjectField).trigger('update', returnData);

			});
		}

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
					editor: 'selectivity',
					template: '<div class="connect-data-values"></div>',
					filter_type: 'multiselect'
				}
			};
		};

		connectObjectField.customDisplay = function (data, itemNode, options) {
			// Initial selectivity
			selectivityHelper.renderSelectivity(itemNode, 'connect-data-values', options.readOnly);

			var selectedItems = [];
			if (data) {
				if (data.map) {
					selectedItems = data.map(function (cVal) {
						return {
							id: cVal.id,
							text: cVal.dataLabel
						};
					});
				}
				else if (data.id) {
					selectedItems.push({
						id: data.id,
						text: data.dataLabel
					});
				}
			}

			// Set selectivity data
			var fieldNode = $(itemNode).find('.connect-data-values');
			selectivityHelper.setData(fieldNode, selectedItems);

			// Listen change selectivity item event
			$(selectivityHelper).on('change', function (event, data) {
				if (event.removed) {
					$(connectObjectField).trigger('update', { data: data });

					// id: item.id,
					// dataLabel: item.text
				}
			});

			return true;
		};

		connectObjectField.customEdit = function (application, fieldData, dataId, itemNode) {
			if (!application || !fieldData || !fieldData.setting.linkObject || !fieldData.setting.linkVia) return false;

			var selectivityNode = $(itemNode).find('.connect-data-values'),
				selectedData = selectivityHelper.getData(selectivityNode),
				selectedIds = $.map(selectedData, function (d) { return d.id; });

			// Init connect data popup
			initConnectDataPopup(application.currObj.id, fieldData, selectivityNode);

			// Get the link object
			var linkObject = AD.classes.AppBuilder.currApp.objects.filter(function (o) { return o.id == fieldData.setting.linkObject; });
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
			$$(componentIds.connectDataPopup).open(linkObject, dataId, selectedIds, fieldData.setting.linkType, linkVia.name, linkVia.setting.linkType);

			return false;
		};

		connectObjectField.getValue = function () {

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