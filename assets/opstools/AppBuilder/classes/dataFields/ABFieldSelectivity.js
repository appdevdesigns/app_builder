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
	placeholder: ""
}

export default class ABFieldSelectivity extends ABField {

	constructor(values, object, fieldDefaults) {

		super(values, object, fieldDefaults);

	}

	selectivityRender(domNode, settings, App, row) {
		if (domNode == null) return;

		// setting up our specific settings:
		settings = settings || {};
		for (var dv in defaultSettings) {
			settings[dv] = settings[dv] || defaultSettings[dv];
		}

		settings['data'] = this.prepareData(settings['data'], settings.multiple);

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
			// this.selectivitySetBadge(domNode, App, row);
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

	selectivitySet(domNode, data, App, row) {
		if (domNode && domNode.selectivity) {

			data = this.prepareData(data);

			if (data)
				domNode.selectivity.setData(data);
			else
				domNode.selectivity.clear();
				
			this.selectivitySetBadge(domNode, App, row);
		}
	}

	selectivityDestroy(domNode) {
		if (domNode && domNode.selectivity) {
			domNode.selectivity.destroy();

			delete domNode.selectivity;
		}
	}

	prepareData(data, multiple = true) {
		if (typeof data == 'string' && data.length > 0)
			data = JSON.parse(data);

		// if single select, then it should be object
		if (!multiple && Array.isArray(data)) {
			data = data[0];
		}

		return data;
	}

	selectivitySetBadge(domNode, App, row) {
		var field = this;
		var innerHeight = domNode.clientHeight;
		var outerHeight = domNode.parentElement.clientHeight;
		if (innerHeight - outerHeight > 5) {
			var count = 0;
			if (domNode && domNode.selectivity)
				var values = domNode.selectivity.getValue() || [];
			else
				var values = [];
			
			count = values.length;
			if (count > 1) {
				var badge = domNode.querySelector('.webix_badge .selectivityBadge');
				if (badge != null) {
					badge.innerHTML = count;
				} else {
					var anchor = document.createElement("A");
					anchor.href = "javascript:void(0);";
					anchor.addEventListener('click', function(){
						App.actions.onRowResizeAuto(row.id, innerHeight);
					});
					var node = document.createElement("SPAN");
					var textnode = document.createTextNode(count);
					node.classList.add("webix_badge", "selectivityBadge");
					node.appendChild(textnode);
					anchor.appendChild(node);
					domNode.appendChild(anchor);
				}
			}
		}
	}


};