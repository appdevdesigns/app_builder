steal(function () {
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
				icon: connectObjectField.icon,
				editor: 'selectivity',
				template: '<div class="connect-data-values"></div>',
				filter_type: 'multiselect'
			}
		};
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