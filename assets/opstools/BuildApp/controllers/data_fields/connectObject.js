steal(function () {
	var componentIds = {
		editView: 'ab-new-connectObject',
		headerName: 'ab-new-connectObject-header',
		labelName: 'ab-new-connectObject-label',
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
		name: 'connect object',
		type: 'connectObject',
		icon: 'external-link',
		menuName: 'Connect to another record'
	};

	// Edit definition
	connectObjectField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "text",
				id: componentIds.headerName,
				label: "Name",
				placeholder: "Name",
				labelWidth: 50,
				css: 'ab-new-field-name', // Highlight this when open
				on: {
					onChange: function (newValue, oldValue) {
						if (oldValue == $$(componentIds.labelName).getValue())
							$$(componentIds.labelName).setValue(newValue);
					}
				}
			},
			{
				view: "text",
				id: componentIds.labelName,
				label: 'Label',
				placeholder: 'Header name',
				labelWidth: 50,
				css: 'ab-new-label-name'
			},
			{
				view: "label",
				label: "<span class='webix_icon fa-{0}'></span>{1}"
					.replace('{0}', connectObjectField.icon)
					.replace('{1}', 'Connect to Object')
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
	connectObjectField.populateSettings = function (data) {
		var currObject = self.data.objectList.filter(function (obj) { return obj.id == self.data.currObjectId; })[0],
			selectedObject = $$(componentIds.connectObjectList).data.find(function (obj) {
				var linkObjId = data.linkObject.id ? data.linkObject.id : data.linkObject;
				return obj.id == linkObjId;
			})[0];

		$$(componentIds.headerName).setValue(data.name.replace(/_/g, ' '));
		$$(componentIds.labelName).setValue(data.label);

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
				title: self.labels.add_fields.requireConnectedObjectTitle,
				ok: self.labels.common.ok,
				text: self.labels.add_fields.requireConnectedObjectDescription
			})
			return false;
		}

		return {
			name: $$(componentIds.headerName).getValue(),
			label: $$(componentIds.labelName).getValue(),
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
		$$(componentIds.headerName).setValue('');
		$$(componentIds.headerName).enable();
		$$(componentIds.labelName).setValue('');
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