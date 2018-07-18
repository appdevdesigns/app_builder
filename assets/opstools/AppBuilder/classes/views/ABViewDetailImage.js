/*
 * ABViewDetailImage
 *
 * An ABViewDetailImage defines a UI string component in the detail component.
 *
 */

import ABViewDetailComponent from "./ABViewDetailComponent"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDetailImagePropertyComponentDefaults = {
}


var ABViewDetailImageDefaults = {
	key: 'detailimage',		// {string} unique key for this view
	icon: 'image',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail.image' // {string} the multilingual label key for the class label
}


export default class ABViewDetailImage extends ABViewDetailComponent {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailImageDefaults);

	}


	static common() {
		return ABViewDetailImageDefaults;
	}

	///
	/// Instance Methods
	///

	//
	//	Editor Related
	//


	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {

		var idBase = 'ABViewDetailImageEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var elem = this.component(App).ui;
		elem.id = ids.component;

		var _ui = {
			rows: [
				elem,
				{}
			]
		};

		var _init = (options) => {
		}

		var _logic = {
		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

	}



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var component = super.component(App);
		var field = this.field();
		var detailView = this.detailComponent();

		var idBase = 'ABViewDetailImage_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		component.ui.id = ids.component;

		var _logic = {

			setValue: (val) => {

				var imageTemplate = '';

				if (val) {
					var imageUrl = "/opsportal/image/" + this.application.name + "/" + val;

					imageTemplate = '<div class="ab-image-data-field"><div style="float: left; background-size: cover; background-position: center center; background-image:url(\'#imageUrl#\');  width: #width#px; height: #height#px;"></div></div>'
						.replace("#imageUrl#", imageUrl)
						.replace(/#width#/g, field.settings.imageWidth || 50)
						.replace(/#height#/g, field.settings.imageHeight || 50);
				}

				component.logic.setValue(ids.component, imageTemplate);

			}

		};

		return {
			ui: component.ui,
			init: component.init,

			logic: _logic
		};
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


	//// Report ////

	/**
	 * @method print
	 * 
	 * 
	 * @return {Object} - PDF object definition
	 */
	print(dataRow) {

		return new Promise((resolve, reject) => {

			var reportDef = {};

			var detailCom = this.detailComponent();
			if (!detailCom) return resolve(reportDef);

			var field = this.field();
			if (!field) return resolve(reportDef);

			field.toBase64(dataRow || this.getCurrentData()).then(imageData => {

				reportDef = {
					columns: [
						{
							bold: true,
							text: field.label,
							width: detailCom.settings.labelWidth
						}
					]
				};

				if (imageData && imageData.data) {
					reportDef.columns.push({
						image: imageData.data,
						width: parseInt(field.settings.imageWidth || 20),
						height: parseInt(field.settings.imageHeight || 20),
					});
				}
				else {
					reportDef.columns.push({});
				}

				resolve(reportDef);

			}).catch(reject);

		});

	}


}