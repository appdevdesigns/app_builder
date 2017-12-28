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
		if (settings.multiple && settings.items && (settings.data && settings.data.length)) {
			settings.data.forEach(function(d) {
				var matchHex = settings.items.map(function(i) {
					if (i.id == d.id)
						d.hex = i.hex;
				});
			});
			settings['data'] = this.prepareData(settings['data'], settings.multiple);
		} else if (typeof settings['data'] == "undefined" || typeof settings['data'] == "null" || settings['data'] == null) {
			settings['data'] = this.prepareData([], settings.multiple);
		} else {
			settings['data'] = this.prepareData(settings['data'], settings.multiple);
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
			if (settings.isUsers) {
				settings.templates = {
					multipleSelectedItem: function(options) {
				        var extraClass = options.highlighted ? ' highlighted' : '';
				        return (
				            '<span class="selectivity-multiple-selected-item' +
				            	extraClass +
				            	'" ' +
								'style="background-color: #eee !important; color: #666 !important; box-shadow: inset 0px 1px 1px #333;"' +
				            	'data-item-id="' +
				            	options.id +
				            '">' +
							'<i class="fa fa-user" style="color: #666; opacity: 0.6;"></i> ' + options.text +
				            (options.removable
				                ? ' <a class="selectivity-multiple-selected-item-remove" style="color: #333;">' +
				                  '<i class="fa fa-remove"></i>' +
				                  '</a>'
				                : '') +
				            '</span>'
				        );
				    }
				}
			} else {
				settings.templates = {
					multipleSelectedItem: function(options) {
				        var extraClass = options.highlighted ? ' highlighted' : '';
				        return (
				            '<span class="selectivity-multiple-selected-item' +
				            	extraClass +
				            	'" ' +
								'style="background-color:' +
								options.hex +
								' !important;"' +
				            	'data-item-id="' +
				            	options.id +
				            '">' +
							options.text +
				            (options.removable
				                ? ' <a class="selectivity-multiple-selected-item-remove">' +
				                  '<i class="fa fa-remove"></i>' +
				                  '</a>'
				                : '') +
				            '</span>'
				        );
				    }
				}				
			}
			selectivityInput = new Selectivity.Inputs.Multiple(settings);

			domNode.selectivity = selectivityInput;
			this.selectivitySetBadge(domNode, App, row);
		}
		else {
			selectivityInput = new Selectivity.Inputs.Single(settings);
			domNode.selectivity = selectivityInput;
		}
	}

	selectivityGet(domNode) {
		if (domNode && domNode.selectivity)
			return domNode.selectivity.getData() || [];
		else
			return [];
	}

	selectivitySet(domNode, data, App, row) {
		if (domNode && domNode.selectivity) {

			data = this.prepareData(data, domNode.selectivity.options.multiple);

			if ((Array.isArray(data) && data[0]) || // Check Array
				(data && data.id)) // Check a object
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

	prepareData(data, multiple = true) {
		if (typeof data == 'string' && data.length > 0)
			data = JSON.parse(data);

		// if single select, then it should be object
		if (!multiple && Array.isArray(data)) {
			data = data[0];
		} else if (multiple && !Array.isArray(data)) {
			data = [data];
		}

		return data;
	}

	selectivitySetBadge(domNode, App, row) {
		var field = this;
		if (!domNode.clientHeight) return;
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
				var badge = domNode.querySelector('.webix_badge.selectivityBadge');
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