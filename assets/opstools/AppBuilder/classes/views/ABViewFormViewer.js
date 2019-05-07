/*
 * ABViewFormViewer
 *
 * An ABViewFormViewer defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"

import ABViewFormBuilder from "./ABViewFormBuilder"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewFormViewerPropertyComponentDefaults = {
	formBuilder: "" // uuid of ABViewFormBuilder
};


var ABViewDefaults = {
	key: 'formViewer',		// {string} unique key for this view
	icon: 'tasks',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.formViewer' // {string} the multilingual label key for the class label
};

export default class ABViewFormViewer extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//			format: x				// the display style of the text
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}

	static common() {
		return ABViewDefaults;
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

		var idBase = 'ABViewFormViewerEditorComponent_' + this.id;

		var FormViewer = this.component(App, idBase);

		return FormViewer;

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var idBase = 'ABViewFormViewerPropertyEditor';

		let commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.formViewer.formBuilder', '*Form Builder:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							view: "select",
							name: "formBuilder",
							label: L('ab.component.formViewer.formBuilder', '*Form Builder:'),
							labelWidth: App.config.labelWidthLarge,
							options: []
						}

					]
				}
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		if (!view) return;

		// Set the objects you can choose from in the list
		var defaultOption = { id: '', value: L('ab.component.formViewer.selectFormBuilder', '*Select form builder') };

		// Pull data collections to options
		var formBuilderOptions = [];

		// TODO
		view.application.pages().forEach(p => {

			let formBuilders = p.views(v => v instanceof ABViewFormBuilder, true);

			formBuilders.forEach(formBuilder => {
				formBuilderOptions.push({
					id: formBuilder.id,
					value: `${formBuilder.parent.label} - ${formBuilder.label}`
				});
			});

		});

		formBuilderOptions.unshift(defaultOption);
		$$(ids.formBuilder).define("options", formBuilderOptions);
		$$(ids.formBuilder).refresh();
		$$(ids.formBuilder).setValue(view.settings.formBuilder);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.formBuilder = $$(ids.formBuilder).getValue();

	}

	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App, idBase) {

		idBase = idBase || 'ABViewFormViewer_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
			formViewer: App.unique(idBase + '_formViewer'),
		}

		let _ui = {
			type: "space",
			padding: 17,
			rows: [
				{
					id: ids.component,
					view: 'template',
					borderless: true,
					template: `<div id="${ids.formViewer}"></div>`,
					css: { "padding": "10px" }
				}
			]
		};


		// make sure each of our child views get .init() called
		let _init = (options) => {

			let elem = document.getElementById(ids.formViewer);
			if (!elem) return;

			// pull form definition
			let formDefinition = {},
				formBuilder = this.formBulider;
			if (formBuilder)
				formDefinition = formBuilder.formDefinition;

			// Render custom Formio form
			Formio.createForm(elem, formDefinition).then(form => {

				// Defaults are provided as follows.
				// form.submission = {
				// 	data: {
				// 		// firstName: 'Joe',
				// 		// lastName: 'Smith'
				// 	}
				// };

				// Register for the submit event to get the completed submission.
				form.on('submit', function (submission) {

					// submission.data

					console.log('Submission was made!', submission);
				});

			});

		};

		let _logic = {

			onShow: () => {
			},

		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _logic.onShow
		};

	}

	get formBulider() {

		let result = null;

		this.application.pages().forEach(p => {

			if (result)
				return;

			let formBD = p.views(v => v.id == this.settings.formBuilder, true)[0];
			if (formBD) {
				result = formBD;
			}

		});

		return result;

	}

}