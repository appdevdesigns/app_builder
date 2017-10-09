/*
 * ABViewDetailComponent
 *
 * An ABViewDetailComponent defines a UI component that is intended to be part of
 * a detail.   These components are tied to an Object's data field.
 *
 */

import ABView from "./ABView"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABViewDetailComponent extends ABView {

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'fieldLabel',
				view: "text",
				disabled: true,
				label: L('ab.component.detail.field.label', '*Field')
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var field = view.field();

		if (field) {
			$$(ids.fieldLabel).setValue(field.label);
		}
	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// setup 'label' of the element
		var detailView = this.detailComponent(),
			field = this.field(),
			label = '';

		var settings = {};
		if (detailView)
			settings = detailView.settings;


		var templateLabel = '';
		if (settings.showLabel == true) {
			if (settings.labelPosition == 'top')
				templateLabel = "<label style='display:block; text-align: left;' class='webix_inp_top_label'>#label#</label>#display#";
			else
				templateLabel = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>#display#";
		}

		var template = (templateLabel)
			.replace(/#width#/g, settings.labelWidth)
			.replace(/#label#/g, field.label);
			
		var height = 38;
		if (typeof field.settings.useHeight != "undefined" && field.settings.useHeight == 1) {
			height = parseInt(field.settings.imageHeight);
		}

		var _ui = {
			view: "template",
			borderless: true,
			height: height,
			template: template,
			data: { display: '' } // show empty data in template
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		}

		var _logic = {

			setValue: (componentId, val) => {

				if ($$(componentId))
					$$(componentId).setValues({ display: val });

			}

		}

		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}

	}

	detailComponent() {
		var form = null;

		var curr = this;
		while (curr.key != 'detail' && !curr.isRoot() && curr.parent) {
			curr = curr.parent;
		}

		if (curr.key == 'detail') {
			form = curr;
		}

		return form;
	}

	field() {
		var object = this.application.objects((obj) => obj.id == this.settings.objectId)[0];
		if (object == null) return null;

		var field = object.fields((v) => v.id == this.settings.fieldId)[0];
		return field;
	}


}