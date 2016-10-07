steal(function () {
	var componentIds = {
		editView: 'ab-new-connectObject',
		objectList: 'ab-new-connectObject-list-item',
		objectCreateNew: 'ab-new-connectObject-create-new',
		objectLinkFrom: 'ab-add-field-link-from',
		objectLinkFrom2: 'ab-add-field-link-from-2',
		objectLinkTypeTo: 'ab-add-field-link-type-to',
		objectLinkTypeFrom: 'ab-add-field-link-type-from',
		objectLinkTo: 'ab-add-field-link-to',
		objectLinkTo2: 'ab-add-field-link-to-2',
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
						$$(componentIds.objectLinkTo).setValue(selectedObjLabel);
						$$(componentIds.objectLinkTo2).setValue(selectedObjLabel);
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
						id: componentIds.objectLinkFrom,
						view: 'label',
						width: 110
					},
					{
						id: componentIds.objectLinkTypeTo,
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
						id: componentIds.objectLinkTo,
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
						id: componentIds.objectLinkTo2,
						view: 'label',
						label: '[Select object]',
						width: 110
					},
					{
						id: componentIds.objectLinkTypeFrom,
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
						id: componentIds.objectLinkFrom2,
						view: 'label',
						width: 110
					},
				]
			}
		]
	};

	// Populate settings (when Edit field)
	connectObjectField.populateSettings = function (application, data) {
		var currObject = self.data.objectList.filter(function (obj) { return obj.id == self.data.currObjectId; })[0],
			selectedObject = $$(componentIds.connectObjectList).data.find(function (obj) {
				var linkObjId = data.linkObject.id ? data.linkObject.id : data.linkObject;
				return obj.id == linkObjId;
			})[0];

		if (!data) return;

		$$(componentIds.objectList).disable();
		$$(componentIds.objectList).select(selectedObject.id);
		$$(componentIds.objectCreateNew).disable();

		$$(componentIds.objectLinkFrom).setValue(currObject.label);
		$$(componentIds.objectLinkFrom2).setValue(currObject.label);

		$$(componentIds.objectLinkTypeTo).setValue(data.linkType);
		$$(componentIds.objectLinkTypeFrom).setValue(data.setting.linkViaType);
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
			linkTypeTo: $$(componentIds.objectLinkTypeTo).getValue(),
			linkTypeFrom: $$(componentIds.objectLinkTypeFrom).getValue(),
			linkObject: $$(componentIds.objectList).getSelectedId(false),
			fieldName: connectObjectField.name,
			type: connectObjectField.type,
			setting: {
				icon: connectObjectField.icon,
				editor: 'selectivity',
				template: '<div class="connect-data-values"></div>',
				filter_type: 'multiselect'
			}
		};
	};

	// Reset state
	connectObjectField.resetState = function () {
		$$(componentIds.objectList).unselectAll();
		$$(componentIds.objectList).enable();
		$$(componentIds.objectLinkFrom).setValue('');
		$$(componentIds.objectLinkFrom2).setValue('');
		$$(componentIds.objectLinkTypeTo).setValue('collection');
		$$(componentIds.objectLinkTypeFrom).setValue('model');
		$$(componentIds.objectLinkTo).setValue('[Select object]');
		$$(componentIds.objectLinkTo2).setValue('[Select object]');
		$$(componentIds.objectCreateNew).enable();
	};

	return connectObjectField;
});