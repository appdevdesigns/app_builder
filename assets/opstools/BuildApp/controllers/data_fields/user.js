steal(
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/webix_custom_components/UserDataPopup.js',
	function (selectivityHelper) {

		var componentIds = {
			editView: 'ab-new-user',
			default: 'ab-new-user-default',
			multiSelect: 'ab-new-user-multiSelect',

			userDataPopup: 'ab-user-data-popup'
		};

		// General settings
		var userDataField = {
			name: 'user',
			type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
			icon: 'user-o',
			menuName: AD.lang.label.getLabel('ab.dataField.user.menuName') || 'User',
			includeHeader: true,
			description: AD.lang.label.getLabel('ab.dataField.user.description') || 'A single checkbox that can be checked or unchecked.'
		};

		function initUserDataPopup(object, columnName, rowId, selectivityNode) {
			if (!$$(componentIds.userDataPopup)) {
				webix.ui({
					id: componentIds.userDataPopup,
					view: "user_data_popup",
				});
			}

			$$(componentIds.userDataPopup).onClose(function (selectedItems) {
				selectivityHelper.setData(selectivityNode, selectedItems);

				var userData = getReturnData(object.id, columnName, rowId, selectedItems);

				// Wait until selectivity populate data completely
				setTimeout(function () {
					$(userDataField).trigger('update', userData);
				}, 600);
			});
		}

		function getReturnData(objectId, columnName, rowId, selectedItems) {

			var userData = {};
			userData.objectId = objectId;
			userData.columnName = columnName;
			userData.rowId = rowId;
			userData.data = $.map(selectedItems, function (item) {
				return {
					id: item.id,
					text: item.text
				}
			});
			userData.displayData = userData.data

			return userData;
		}

		userDataField.editDefinition = {
			id: componentIds.editView,
			rows: [
				{
					view: 'checkbox',
					id: componentIds.multiSelect,
					labelRight: 'Multiselect',
					labelWidth: 0
				}
			]
		};

		userDataField.populateSettings = function (application, data) {
			if (!data.setting) return;

			$$(componentIds.multiSelect).setValue(data.setting.multiselect);
		};

		userDataField.getSettings = function () {
			return {
				fieldName: userDataField.name,
				type: 'json',
				setting: {
					icon: userDataField.icon,
					multiselect: $$(componentIds.multiSelect).getValue(),
					template: '<div class="user-data-values"></div>'
				}
			};
		};

		userDataField.customDisplay = function (application, object, fieldData, rowData, data, viewId, itemNode, options) {
			// Initial selectivity
			selectivityHelper.renderSelectivity(itemNode, 'user-data-values', options.readOnly);

			var selectedItems = [];
			if (data) {
				if (data.id) {
					selectedItems.push({
						id: data.id,
						text: data.text,
					});
				}
				else if (data.each || data.forEach) {
					data = data.filter(function (item) { return item != null; });
					selectedItems = $.map(data.attr ? data.attr() : data, function (item) {
						return {
							id: item.id,
							text: item.text,
						};
					});
				}
			}

			// Set selectivity data
			var selectivityNode = $(itemNode).find('.user-data-values');
			selectivityHelper.setData(selectivityNode, selectedItems);

			return true;
		};

		userDataField.customEdit = function (application, object, fieldData, dataId, itemNode) {
			if (!application || !fieldData) return false;

			var selectivityNode = $(itemNode).find('.user-data-values'),
				selectedData = selectivityHelper.getData(selectivityNode),
				selectedIds = $.map(selectedData, function (d) { return d.id; });

			// Init connect data popup
			initUserDataPopup(object, fieldData.name, dataId, selectivityNode);

			// Open popup
			$$(componentIds.userDataPopup).open(application, dataId, selectedIds, fieldData.setting.multiselect, !fieldData.isSynced);

			return false;
		};

		userDataField.getValue = function (application, object, fieldData, itemNode) {
			var selectivityNode = $(itemNode).find('.user-data-values'),
				selectedValues = selectivityHelper.getData(selectivityNode),
				result;

			if (selectedValues && selectedValues.length > 0)
				result = $.map(selectedValues, function (selectedItem) { return selectedItem.id; });
			else
				result = [];

			return result;
		};

		userDataField.setValue = function (fieldData, itemNode, data) {
			var selectivityNode = $(itemNode).find('.user-data-values');

			if (data == null) data = [];
			else if (!(data instanceof Array)) data = [data];

			selectivityHelper.setData(selectivityNode, data);
		};


		userDataField.resetState = function () {
			$$(componentIds.multiSelect).setValue(0);
		};


		return userDataField;
	});