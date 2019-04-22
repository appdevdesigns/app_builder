/*
 * ABViewCarousel
 *
 * An ABViewCarousel defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABFieldImage from "../dataFields/ABFieldImage"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewCarouselPropertyComponentDefaults = {
	width: 460,
	height: 275,
	hideItem: false,
	hideButton: false,
	navigationType: "corner" // "corner" || "side"
};


var ABViewDefaults = {
	key: 'carousel',		// {string} unique key for this view
	icon: 'clone',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.carousel' // {string} the multilingual label key for the class label
};



export default class ABViewCarousel extends ABViewWidget {

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

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// convert from "0" => 0
		this.settings.width = parseInt(this.settings.width || ABViewCarouselPropertyComponentDefaults.width);
		this.settings.height = parseInt(this.settings.height || ABViewCarouselPropertyComponentDefaults.height);
		this.settings.hideItem = JSON.parse(this.settings.hideItem || ABViewCarouselPropertyComponentDefaults.hideItem);
		this.settings.hideButton = JSON.parse(this.settings.hideButton || ABViewCarouselPropertyComponentDefaults.hideButton);
		this.settings.navigationType = this.settings.navigationType || ABViewCarouselPropertyComponentDefaults.navigationType;

	}



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

		var idBase = 'ABViewCarouselEditorComponent';

		var CarouselComponent = this.component(App, idBase);

		return CarouselComponent;

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.label.dataSource', '*Data:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							view: "select",
							name: "dataSource",
							label: L('ab.component.label.dataSource', '*Object:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							on: {
								onChange: function (newv, oldv) {
									if (newv != oldv) {

										$$(ids.detailsPage).setValue("");
										$$(ids.editPage).setValue("");

										let imageFields = [];

										let dc = _logic.currentEditObject().pageRoot().dataCollections(dc => dc.id == newv)[0];
										if (dc) {

											let datasource = dc.datasource;
											if (datasource) {
												imageFields = datasource
													.fields(f => f instanceof ABFieldImage)
													.map(f => { return { id: f.id, value: f.label }; }) || [];
											}
										}

										imageFields.unshift({ id: '', value: L('ab.component.label.selectField', '*Select a field') });

										$$(ids.field).define("options", imageFields);
										$$(ids.field).refresh();

									}
								}
							}
						},

						{
							view: "select",
							name: "field",
							label: L('ab.component.label.field', '*Field:'),
							labelWidth: App.config.labelWidthLarge,
							options: []
						}

					]
				}
			},

			{
				view: "fieldset",
				label: L('ab.component.label.linkedPages', '*Linked Pages:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							view: "select",
							name: "detailsPage",
							label: L('ab.component.label.detailsPage', '*Details Page:'),
							labelWidth: App.config.labelWidthLarge,
							options: []
						},
						{
							view: "select",
							name: "editPage",
							label: L('ab.component.label.editForm', '*Edit Form:'),
							labelWidth: App.config.labelWidthLarge,
							options: []
						}
					]
				}
			},
			{
				view: "fieldset",
				label: L('ab.component.label.customizeDisplay', '*Customize Display:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							view: "select",
							name: "navigationType",
							label: L('ab.component.carousel.navigationType', '*Navigation Type'),
							labelWidth: App.config.labelWidthLarge,
							options: [
								{ id: "corner", value: "Corner" },
								{ id: "side", value: "Side" }
							]
						},

						{
							view: "checkbox",
							name: "hideItem",
							labelRight: L('ab.component.carousel.hideItem', '*Hide item list'),
							labelWidth: App.config.labelWidthCheckbox
						},

						{
							view: "checkbox",
							name: "hideButton",
							labelRight: L('ab.component.carousel.hideButton', '*Hide navigation buttons'),
							labelWidth: App.config.labelWidthCheckbox
						},

						{
							view: 'counter',
							name: "width",
							label: L("ab.component.grid.width", "*Width:"),
							labelWidth: App.config.labelWidthXLarge,
						},

						{
							view: 'counter',
							name: "height",
							label: L("ab.component.grid.height", "*Height:"),
							labelWidth: App.config.labelWidthXLarge,
						},

						{
							cols: [
								{
									view: "label",
									label: L("ab.component.label.filterData", "*Filter Option:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: "button",
									id: ids.gridFilterMenuButton,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.gridFilterMenuShow(this.$view);
									}
								}
							]
						}

					]
				}
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		// Set the objects you can choose from in the list
		var defaultOption = { id: '', value: L('ab.component.label.selectObject', '*Select an object') };

		// Pull data collections to options
		var objectOptions = view.pageRoot().dataCollections().map((dc) => {
			return {
				id: dc.id,
				value: dc.label
			};
		});
		objectOptions.unshift(defaultOption);
		$$(ids.dataSource).define("options", objectOptions);
		$$(ids.dataSource).refresh();

		$$(ids.dataSource).setValue(view.settings.dataSource);
		$$(ids.field).setValue(view.settings.field);

		$$(ids.width).setValue(view.settings.width);
		$$(ids.height).setValue(view.settings.height);
		$$(ids.hideItem).setValue(view.settings.hideItem);
		$$(ids.hideButton).setValue(view.settings.hideButton);
		$$(ids.navigationType).setValue(view.settings.navigationType);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.field = $$(ids.field).getValue();

		view.settings.width = $$(ids.width).getValue();
		view.settings.height = $$(ids.height).getValue();
		view.settings.hideItem = $$(ids.hideItem).getValue();
		view.settings.hideButton = $$(ids.hideButton).getValue();
		view.settings.navigationType = $$(ids.navigationType).getValue();

	}

	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewCarousel_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		let _ui = {
			cols: [
				{
					id: ids.component,
					view: "carousel",
					cols: [],
					width: this.settings.width,
					height: this.settings.height,
					navigation: {
						items: !this.settings.hideItem,
						buttons: !this.settings.hideButton,
						type: this.settings.navigationType
					}
				},
				{} // spacer
			]
		};


		// make sure each of our child views get .init() called
		let _init = (options) => {

			let dc = this.dataCollection;
			if (!dc) return;

			this.eventAdd({
				emitter: dc,
				eventName: "loadData",
				listener: () => {

					_logic.onShow();
				}
			});




		};

		let _logic = {

			myTemplate: (row) => {
				return `<img src="${row.src}" class="content" ondragstart="return false" width="${this.settings.width}"/><div class="title">${row.title || ""}</div>`;
			},

			onShow: () => {

				let dc = this.dataCollection;
				if (!dc) return;

				let obj = dc.datasource;
				if (!obj) return;

				let field = this.imageField;
				if (!field) return;

				let rows = dc.getData();

				let images = [];

				rows.forEach(r => {

					let imgFile = r[field.columnName];
					if (imgFile) {
						images.push({
							css: "image", template: _logic.myTemplate, data: {
								// title: obj, // TODO : get label of object
								src: `/opsportal/image/${obj.application.name}/${imgFile}`
							}
						});
					}

				});

				// re-render
				if (images && images.length)
					webix.ui(images, $$(ids.component));

			}

		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _logic.onShow
		};

	}

	/**
	 * @property dataCollection
	 * return ABViewDataCollection of this form
	 * 
	 * @return {ABViewDataCollection}
	 */
	get dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.dataSource)[0];
	}

	get imageField() {
		let dc = this.dataCollection;
		if (!dc) return null;

		let obj = dc.datasource;
		if (!obj) return null;

		return obj.fields(f => f.id == this.settings.field)[0];

	}

}