/*
 * ABFieldSelectivity
 *
 * An ABFieldSelectivity defines a single unique Field/Column in a ABObject.
 *
 */

import ABField from "./ABField"

var defaultSettings = {
	allowClear: true,
	removeOnly: false,
	readOnly: false,
	showDropdown: true,
	showSearchInputInDropdown: false,
	placeholder: "",
}

export default class ABFieldSelectivity extends ABField {

	constructor(values, object, fieldDefaults) {

		super(values, object, fieldDefaults);

	}

	selectivityRender(domNode, settings) {
		if (domNode == null) return;

		// setting up our specific settings:
		settings = settings || {};
		for (var dv in defaultSettings) {
			settings[dv] = settings[dv] || defaultSettings[dv];
		}

		// Prevent render selectivity duplicate
		if (domNode.selectivity != null) {
			// Refresh selectivity settings
			domNode.selectivity.setOptions(settings);

			return;
		}

		settings.element = domNode;

		// Render selectivity
		var selectivityInput;
		if (settings.multiple) {
			selectivityInput = new Selectivity.Inputs.Multiple(settings);
		}
		else {
			selectivityInput = new Selectivity.Inputs.Single(settings);
		}

		domNode.selectivity = selectivityInput;
	}

	selectivityGet(domNode) {
		if (domNode && domNode.selectivity)
			return domNode.selectivity.getData() || [];
		else
			return [];
	}

	selectivitySet(domNode, data) {
		if (domNode && domNode.selectivity) {
			if (typeof data == 'string' && data.length > 0)
				data = JSON.parse(data);

			if (data)
				domNode.selectivity.setData(data);
			else
				domNode.selectivity.clear();
		}
	}

	selectivityDestroy(domNode) {
		if (domNode && domNode.selectivity) {
			domNode.selectivity.destroy();

			delete domNode.selectivity;
		}
	}

};