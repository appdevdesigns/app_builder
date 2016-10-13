steal(
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',
	function (selectivityHelper) {
		var componentIds = {
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
			description: ''
		};

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
		connectObjectField.populateSettings = function (application, data) {
			$$(componentIds.editView).appName = application.name;

			var objectList = AD.op.WebixDataCollection(application.objects);
			objectList.attachEvent('onAfterAdd', function (id, index) {
				$$(componentIds.objectList).filter(function (obj) { return obj.id != application.currObj.id; });
			});
			objectList.attachEvent('onAfterDelete', function () {
				$$(componentIds.objectList).filter(function (obj) { return obj.id != application.currObj.id; });
			});
			$$(componentIds.objectList).clearAll();
			$$(componentIds.objectList).data.sync(objectList);
			$$(componentIds.objectList).refresh();
			$$(componentIds.objectList).filter(function (obj) { return obj.id != application.currObj.id; });

			$$(componentIds.fieldLink).setValue(application.currObj.label);
			$$(componentIds.fieldLink2).setValue(application.currObj.label);

			$$(componentIds.fieldLinkViaType).linkVia = null;

			if (!data.setting || !data.setting.linkObject || !data.setting.linkType) return;

			var selectedObject = $$(componentIds.objectList).data.find(function (obj) {
				var linkObjId = data.setting.linkObject;
				return obj.id == linkObjId;
			});

			$$(componentIds.objectList).disable();
			if (selectedObject && selectedObject.length > 0)
				$$(componentIds.objectList).select(selectedObject[0].id);
			$$(componentIds.objectCreateNew).disable();

			$$(componentIds.fieldLinkType).setValue(data.setting.linkType);
			$$(componentIds.fieldLinkViaType).setValue(data.setting.linkViaType);
			$$(componentIds.fieldLinkViaType).linkVia = data.setting.linkVia;
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

		// // Connect data popup
		// $$(self.webixUiId.addConnectObjectDataPopup).registerSelectChangeEvent(function (selectedItems) {
		// 							self.controllers.SelectivityHelper.setData(self.getCurSelectivityNode(), selectedItems);
		// });
		// $$(self.webixUiId.addConnectObjectDataPopup).registerCloseEvent(function (selectedItems) {
		// 							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

		// 							var selectedIds = [];

		// 							if (selectedItems && selectedItems.length > 0)
		// 		selectedIds = $.map(selectedItems, function (item) { return { id: item.id }; });

		// 							self.updateRowData(
		// 		{ value: selectedIds }, // state
		// 		{ // editor
		// 			row: self.data.selectedCell.row,
		// 			column: self.data.selectedCell.column
		// 		},
		// 		false)
		// 		.then(function (result) {
		// 			// Update row
		// 			var rowData = $$(self.webixUiId.objectDatatable).getItem(self.data.selectedCell.row);

		// 			rowData[self.data.selectedCell.column] = selectedItems.map(function (item) {
		// 				return {
		// 					id: item.id,
		// 					dataLabel: item.text
		// 				}
		// 			}) || [];

		// 			$$(self.webixUiId.objectDatatable).updateItem(self.data.selectedCell.row, rowData);

		// 			// Remove duplicate selected item when the link column supports one value
		// 			var colData = self.data.columns.filter(function (col) { return col.name == self.data.selectedCell.column; })[0];
		// 			if (selectedIds && colData.setting.linkViaType === 'model') {
		// 				$$(self.webixUiId.objectDatatable).eachRow(function (row) {
		// 					if (row != self.data.selectedCell.row) {
		// 						var otherRow = $$(self.webixUiId.objectDatatable).getItem(row);
		// 						if (otherRow[self.data.selectedCell.column]) {
		// 							// Filter difference values
		// 							otherRow[self.data.selectedCell.column] = otherRow[self.data.selectedCell.column].filter(function (i) {
		// 								return selectedIds.filter(function (sId) { return i.id == sId.id; }).length < 1;
		// 							});

		// 							$$(self.webixUiId.objectDatatable).updateItem(row, otherRow);
		// 						}
		// 					}
		// 				});
		// 			}

		// 			// Resize row height
		// 			self.controllers.ObjectDataTable.calculateRowHeight(self.data.selectedCell.row, self.data.selectedCell.column, selectedIds.length);

		// 			$$(self.webixUiId.objectDatatable).hideProgress();

		// 			self.data.selectedCell = null
		// 		});

		// 							self.controllers.SelectivityHelper.setData(self.getCurSelectivityNode(), selectedItems);
		// });

		connectObjectField.customEdit = function (application, data, itemNode) {
			if (!application || !data || !data.setting.linkObject || !data.setting.linkVia) return false;

			// Create connect data popup
			if (!$$(componentIds.connectDataPopup)) {
				webix.ui({
					id: componentIds.connectDataPopup,
					view: "connected_data_popup",
				});
			}

			var selectivityNode = $(itemNode).find('.connect-data-values'),
				selectedData = selectivityHelper.getData(selectivityNode),
				selectedIds = $.map(selectedData, function (d) { return d.id; });

			// Get the link object
			var linkObject = AD.classes.AppBuilder.currApp.objects.filter(function (o) { return o.id == data.setting.linkObject; });
			if (!linkObject || linkObject.length < 1)
				return false;
			else
				linkObject = linkObject[0];

			// Get the via column
			var linkVia = linkObject.columns.filter(function (col) { return col.id == data.setting.linkVia; });
			if (!linkVia || linkVia.length < 1)
				return false;
			else
				linkVia = linkVia[0];

			$$(componentIds.connectDataPopup).open(linkObject, itemNode.row, selectedIds, data.setting.linkType, linkVia.name, linkVia.setting.linkType);

			return false;
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
	});