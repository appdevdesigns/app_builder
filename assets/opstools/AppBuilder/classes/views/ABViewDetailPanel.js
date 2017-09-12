/*
 * ABViewDetailPanel
 *
 *
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewDetailComponent from "./ABViewDetailComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDetailPropertyComponentDefaults = {
}

var ABViewDetailDefaults = {
	key: 'detail',		// {string} unique key for this view
	icon: 'file-text-o',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail' // {string} the multilingual label key for the class label
}

export default class ABViewDetailPanel extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailDefaults);

	}

	static common() {
		return ABViewDetailDefaults;
	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// _logic functions

		_logic.selectObject = (objId, oldObjId) => {

			// TODO : warning message

			var currView = _logic.currentEditObject();
			var detailView = currView.detailComponent();

			// remove all old field components
			if (oldObjId != null)
				detailView.clearFieldComponents();

			// Update field options in property
			this.propertyUpdateFieldOptions(ids, currView, objId);

			// add all fields to editor by default
			if (currView._views.length < 1) {

				var fields = $$(ids.fields).find({});
				fields.forEach((f) => {

					if (!f.selected) {

						_logic.addFieldToForm(f);

						// update item to UI list
						f.selected = 1;
						$$(ids.fields).updateItem(f.id, f);
					}

				});

			}

		};

		_logic.listTemplate = (field, common) => {

			return common.markCheckbox(field) + " #label#"
				.replace("#label#", field.label);

		};

		_logic.check = (e, fieldId) => {

			var currView = _logic.currentEditObject();

			// update UI list
			var item = $$(ids.fields).getItem(fieldId);
			item.selected = item.selected ? 0 : 1;
			$$(ids.fields).updateItem(fieldId, item);

			// add a field to the form
			if (item.selected) {
				_logic.addFieldToForm(item);
			}
			// remove field in the form
			else {
				var detailView = currView.detailComponent();
				var fieldView = detailView.fieldComponents().filter(c => c.settings.fieldId == fieldId)[0];

				if (fieldView)
					fieldView.destroy();

			}

			// trigger a save()
			this.propertyEditorSave(ids, currView);

		};


		_logic.addFieldToForm = (field) => {

			if (field == null)
				return;

			var detailView = _logic.currentEditObject();

			var newView = field.detailComponent().newInstance(detailView.application, detailView);
			if (newView == null)
				return;

			// set settings to component
			newView.settings = newView.settings || {};
			newView.settings.fieldId = field.id;
			// TODO : Default settings

			// add a new component
			detailView._views.push(newView);

			// update properties when a sub-view is destroyed
			newView.once('destroyed', () => { this.propertyEditorPopulate(ids, detailView); });

		}


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'object',
				view: 'richselect',
				label: L('ab.components.detail.objects', "*Objects"),
				on: {
					onChange: _logic.selectObject
				}
			},
			{
				name: 'fields',
				view: 'list',
				select: false,
				minHeight: 200,
				template: _logic.listTemplate,
				type: {
					markCheckbox: function (item) {
						return "<span class='check webix_icon fa-" + (item.selected ? "check-" : "") + "square-o'></span>";
					}
				},
				onClick: {
					"check": _logic.check
				}
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var detailComponent = view.detailComponent();
		var objectId = detailComponent.settings.object;

		// Pull object list to options
		var objectOptions = view.application.objects().map((obj) => {

			return {
				id: obj.id,
				value: obj.label
			};
		});

		$$(ids.object).define('options', objectOptions);
		$$(ids.object).refresh();
		$$(ids.object).setValue(objectId);

		// Disable to select object in layout
		// We can select object in form component only
		$$(ids.object).disable();

		this.propertyUpdateFieldOptions(ids, view, objectId);

		// update properties when a field component is deleted
		view.views().forEach((v) => {
			if (v instanceof ABViewDetailComponent)
				v.once('destroyed', () => this.propertyEditorPopulate(ids, view));
		});

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

	}

	static propertyUpdateFieldOptions(ids, view, objectId) {

		var detailComponent = view.detailComponent();
		var object = view.application.objectByID(objectId);
		var existsFields = detailComponent.fieldComponents();

		// Pull field list
		var fieldOptions = [];
		if (object != null) {
			fieldOptions = object.fields().map((f) => {

				f.selected = existsFields.filter((com) => { return f.id == com.settings.fieldId; }).length > 0;

				return f;

			});
		}

		$$(ids.fields).clearAll();
		$$(ids.fields).parse(fieldOptions);

	}

	/*
	* @method componentList
	* return the list of components available on this view to display in the editor.
	*/
	componentList() {
		return [];
	}


	/**
	 * @method detailComponent()
	 *
	 * return a detail component
	 *
	 * @return {ABViewForm}
	 */
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


	/**
	 * @method fieldComponents()
	 *
	 * return an array of all the children
	 *
	 * @return {array} 	array
	 */
	fieldComponents() {

		var flattenComponents = (views) => {
			var components = [];

			_.each(views, (comp) => {
				components.push(comp);
				comp._views && (components = _.union(components, flattenComponents(comp._views)))
			});

			return components
		}

		if (this._views && this._views.length > 0) {
			var allComponents = flattenComponents(this._views);

			return allComponents.filter((comp) => comp instanceof ABViewDetailComponent);
		}
		else {
			return [];
		}
	}

	clearFieldComponents() {
		this.fieldComponents().forEach((comp) => {
			comp.destroy();
		});
	}




}