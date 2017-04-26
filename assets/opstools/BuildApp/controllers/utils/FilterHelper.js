steal(
	'opstools/BuildApp/controllers/utils/FilterHelper.js',
	function (filterHelper) {
		var filterHelper = {};

		var labels = {
			containsCondition: AD.lang.label.getLabel('ab.filter_fields.containsCondition') || "contains",
			notContainCondition: AD.lang.label.getLabel('ab.filter_fields.notContainCondition') || "doesn't contain",
			isCondition: AD.lang.label.getLabel('ab.filter_fields.isCondition') || "is",
			isNotCondition: AD.lang.label.getLabel('ab.filter_fields.isNotCondition') || "is not",
			startsWithCondition: AD.lang.label.getLabel('ab.filter_fields.startsWithCondition') || "starts with",
			endWithCondition: AD.lang.label.getLabel('ab.filter_fields.endWithCondition') || "end with",
			isBlankCondition: AD.lang.label.getLabel('ab.filter_fields.isBlankCondition') || "is blank",
			isNotBlankCondition: AD.lang.label.getLabel('ab.filter_fields.isNotBlankCondition') || "is not blank",

			beforeCondition: AD.lang.label.getLabel('ab.filter_fields.beforeCondition') || "is before",
			afterCondition: AD.lang.label.getLabel('ab.filter_fields.afterCondition') || "is after",
			onOrBeforeCondition: AD.lang.label.getLabel('ab.filter_fields.onOrBeforeCondition') || "is on or before",
			onOrAfterCondition: AD.lang.label.getLabel('ab.filter_fields.onOrAfterCondition') || "is on or after",

			equalCondition: AD.lang.label.getLabel('ab.filter_fields.equalCondition') || ":",
			notEqualCondition: AD.lang.label.getLabel('ab.filter_fields.notEqualCondition') || "≠",
			lessThanCondition: AD.lang.label.getLabel('ab.filter_fields.lessThanCondition') || "<",
			moreThanCondition: AD.lang.label.getLabel('ab.filter_fields.moreThanCondition') || ">",
			lessThanOrEqualCondition: AD.lang.label.getLabel('ab.filter_fields.lessThanOrEqualCondition') || "≤",
			moreThanOrEqualCondition: AD.lang.label.getLabel('ab.filter_fields.moreThanOrEqualCondition') || "≥",

			equalListCondition: AD.lang.label.getLabel('ab.filter_fields.equalListCondition') || "equals",
			notEqualListCondition: AD.lang.label.getLabel('ab.filter_fields.notEqualListCondition') || "does not equal",

			checkedCondition: AD.lang.label.getLabel('ab.filter_fields.checkedCondition') || "is checked",
			notCheckedCondition: AD.lang.label.getLabel('ab.filter_fields.notCheckedCondition') || "is not checked"
		};


		filterHelper.getConditionList = function (filter_type) {
			var conditionList = [];

			switch (filter_type) {
				case "text":
				case "multiselect":
					conditionList = [
						labels.containsCondition,
						labels.notContainCondition,
						labels.isCondition,
						labels.isNotCondition,
						labels.startsWithCondition,
						labels.endWithCondition,
						labels.isBlankCondition,
						labels.isNotBlankCondition
					];
					break;
				case "date":
					conditionList = [
						labels.beforeCondition,
						labels.afterCondition,
						labels.onOrBeforeCondition,
						labels.onOrAfterCondition
					];
					break;
				case "number":
					conditionList = [
						labels.equalCondition,
						labels.notEqualCondition,
						labels.lessThanCondition,
						labels.moreThanCondition,
						labels.lessThanOrEqualCondition,
						labels.moreThanOrEqualCondition
					];
					break;
				case "list":
					conditionList = [
						labels.equalListCondition,
						labels.notEqualListCondition
					];
					break;
				case "boolean":
					conditionList = [
						labels.checkedCondition,
						labels.notCheckedCondition
					];
					break;
			}

			return conditionList;
		};

		filterHelper.getComparerView = function (filter_type, format, options) {
			var comparerView = null;

			switch (filter_type) {
				case "text":
				case "multiselect":
					comparerView = { view: "text" };
					break;
				case "date":
					comparerView = { view: "datepicker" };

					if (format)
						inputView.format = format;

					break;
				case "number":
					comparerView = { view: "text", validate: webix.rules.isNumber };
					break;
				case "list":
					comparerView = {
						view: "combo",
						options: options || []
					};
					break;
				case "boolean":
					break;
			}

			return comparerView;
		};

		filterHelper.filter = function (operator, dataValue, inputValue) {
			var condResult;

			switch (operator) {
				// Text filter
				case labels.containsCondition:
					condResult = dataValue.indexOf(inputValue.trim().toLowerCase()) > -1;
					break;
				case labels.notContainCondition:
					condResult = dataValue.indexOf(inputValue.trim().toLowerCase()) < 0;
					break;
				case labels.isCondition:
					condResult = dataValue == inputValue.trim().toLowerCase();
					break;
				case labels.isNotCondition:
					condResult = dataValue != inputValue.trim().toLowerCase();
					break;
				case labels.startsWithCondition:
					condResult = dataValue.toString().startsWith(inputValue.trim().toLowerCase());
					break;
				case labels.endWithCondition:
					condResult = dataValue.toString().endsWith(inputValue.trim().toLowerCase());
					break;
				case labels.isBlankCondition:
					condResult = dataValue.toString().length === 0;
					break;
				case labels.isNotBlankCondition:
					condResult = dataValue.toString().length > 0;
					break;
				// Date filter
				case labels.beforeCondition:
					if (!(dataValue instanceof Date)) dataValue = new Date(dataValue);
					condResult = dataValue < inputValue;
					break;
				case labels.afterCondition:
					if (!(dataValue instanceof Date)) dataValue = new Date(dataValue);
					condResult = dataValue > inputValue;
					break;
				case labels.onOrBeforeCondition:
					if (!(dataValue instanceof Date)) dataValue = new Date(dataValue);
					condResult = dataValue <= inputValue;
					break;
				case labels.onOrAfterCondition:
					if (!(dataValue instanceof Date)) dataValue = new Date(dataValue);
					condResult = dataValue >= inputValue;
					break;
				// Number filter
				case labels.equalCondition:
					condResult = Number(dataValue) == Number(inputValue);
					break;
				case labels.notEqualCondition:
					condResult = Number(dataValue) != Number(inputValue);
					break;
				case labels.lessThanCondition:
					condResult = Number(dataValue) < Number(inputValue);
					break;
				case labels.moreThanCondition:
					condResult = Number(dataValue) > Number(inputValue);
					break;
				case labels.lessThanOrEqualCondition:
					condResult = Number(dataValue) <= Number(inputValue);
					break;
				case labels.moreThanOrEqualCondition:
					condResult = Number(dataValue) >= Number(inputValue);
					break;
				// List filter
				case labels.equalListCondition:
					if (dataValue)
						condResult = dataValue.toString().toLowerCase().indexOf(inputValue.toString().toLowerCase()) > -1;
					break;
				case labels.notEqualListCondition:
					if (dataValue)
						condResult = dataValue.toString().toLowerCase().indexOf(inputValue.toString().toLowerCase()) < 0;
					else
						condResult = true;
					break;
				// Boolean/Checkbox filter
				case labels.checkedCondition:
					condResult = (dataValue === true || dataValue === 1);
					break;
				case labels.notCheckedCondition:
					condResult = !dataValue;
					break;
			}

			return condResult;
		};

		return filterHelper;
	}
);