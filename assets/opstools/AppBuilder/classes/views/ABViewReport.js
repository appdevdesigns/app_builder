/*
 * ABViewReport
 *
 * An ABView that represents a "Report" in the system.
 * 
 *
 */

import ABView from "./ABView"
import ABViewPage from "./ABViewPage"
import ABViewReportPage from "./ABViewReportPage"
import ABViewReportPanel from "./ABViewReportPanel"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABPropertyComponentDefaults = {
	pageSize: 'A4',
	pageOrientation: 'portrait',
	pageMarginsLeft: 40,
	pageMarginsTop: 60,
	pageMarginsRight: 40,
	pageMarginsBottom: 60,
}

var ABViewDefaults = {
	key: 'report',	    // unique key identifier for this ABView
	icon: 'file-text',	// icon reference: (without 'fa-' )

}

export default class ABViewReport extends ABViewPage {

	constructor(values, application, parent, defaultValues) {
		super(values, application, parent, (defaultValues || ABViewDefaults));

		// the report always have 'header', 'detail' and 'footer' panels
		if (this.views(v => v instanceof ABViewReportPanel).length < 3) {

			// header
			var header = ABViewManager.newView({
				key: ABViewReportPanel.common().key,
				label: 'Header'
			}, application, this);
			this._views.push(header);

			// detail
			var detail = ABViewManager.newView({
				key: ABViewReportPanel.common().key,
				label: 'Detail'
			}, application, this);
			this._views.push(detail);

			// footer
			var footer = ABViewManager.newView({
				key: ABViewReportPanel.common().key,
				label: 'Footer'
			}, application, this);
			this._views.push(footer);

		}

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

		// Convert from "0" => 0
		this.settings.pageMarginsLeft = parseInt(this.settings.pageMarginsLeft || ABPropertyComponentDefaults.pageMarginsLeft);
		this.settings.pageMarginsTop = parseInt(this.settings.pageMarginsTop || ABPropertyComponentDefaults.pageMarginsTop);
		this.settings.pageMarginsRight = parseInt(this.settings.pageMarginsRight || ABPropertyComponentDefaults.pageMarginsRight);
		this.settings.pageMarginsBottom = parseInt(this.settings.pageMarginsBottom || ABPropertyComponentDefaults.pageMarginsBottom);

	}


	//
	//	Editor Related
	//

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var comp = super.component(App);

		var idBase = 'ABViewReport_' + this.id;
		var ids = {
			printPopup: App.unique(idBase + '_printPopup'),
		};

		var _ui = {
			view: 'layout',
			rows: [
				// print button
				{
					view: 'layout',
					cols: [
						{},
						{
							view: "button",
							type: "iconButton",
							icon: "print",
							label: 'Print',
							align: "right",
							autowidth: true,
							on: {
								onItemClick: function (id, e) {
									comp.logic.popupShow(this.$view);
								}
							}
						}
					]
				},

				// display container
				comp.ui
			]
		};

		var _init = (options) => {

			comp.init(options);

			// WORKAROUND : Where should we define this ??
			// For include html2canvas.js
			webix.codebase = "";
			webix.cdn = "/js/webix";

			webix.ui({
				view: "popup",
				id: ids.printPopup,
				width: 160,
				height: 120,
				select: false,
				body: {
					id: ids.list,
					view: 'list',
					data: [
						{ name: "PDF", icon: "file-pdf-o" },
						{ name: "PNG", icon: "file-image-o" }
						// { name: "Print", icon: "print" }
					],
					template: function (obj, common) {
						return comp.logic.popupItemTemplate(obj, common);
					},
					on: {
						onItemClick: function (id, e, node) {
							var component = this.getItem(id);

							comp.logic.print(component.name);
						}
					}
				}
			});

		}

		comp.logic.popupShow = ($button) => {

			$$(ids.printPopup).show($button);

		};

		comp.logic.popupHide = () => {

			$$(ids.printPopup).hide();

		};

		comp.logic.popupItemTemplate = (obj, common) => {

			return "<div><i class='fa fa-#icon# webix_icon_btn' aria-hidden='true'></i> #name#</div>"
				.replace(/#icon#/g, obj.icon)
				.replace(/#name#/g, obj.name);

		};

		comp.logic.print = (name) => {

			switch (name) {
				case "PDF":
					this.downloadPdf();
					break;

				case "PNG":
					webix.toPNG($$(comp.ui.id),
						{
							filename: this.label
						})
						.catch(err => {
							OP.Error.log("System could not export PNG", { error: err });
						})
						.fail((err) => {
							OP.Error.log("System could not export PNG", { error: err });
						})
						.then(() => {
							comp.logic.popupHide();
						})
					break;

				case "Print":
					// https://docs.webix.com/desktop__printing.html
					webix.print($$(comp.ui.id));
					comp.logic.popupHide();
					break;

			}

		};

		return {
			ui: _ui,
			init: _init,
			logic: comp.logic,

			onShow: comp.onShow
		}
	}


	//// Report ////

	print() {

		var docDefinition = {
			// a string or { width: number, height: number }
			pageSize: this.settings.pageSize,

			// by default we use portrait, you can change it to landscape if you wish
			pageOrientation: this.settings.pageOrientation,

			// [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
			pageMargins: [
				this.settings.pageMarginsLeft,
				this.settings.pageMarginsTop,
				this.settings.pageMarginsRight,
				this.settings.pageMarginsBottom
			],

			header: [],
			content: [],
			footer: []
		};

		var views = this.views();

		// pull Header PDF json definition
		if (views[0]) {
			docDefinition.header = views[0].print();
		}

		// pull Detail PDF json definition
		if (views[1]) {
			docDefinition.content = views[1].print();
		}

		// pull Footer PDF json definition
		if (views[2]) {
			docDefinition.footer = views[2].print();
		}

		return docDefinition;

	}

	previewPdf() {

		var docDefinition = this.print();

		pdfMake.createPdf(docDefinition).open();
	}

	downloadPdf() {

		var docDefinition = this.print(),
			filename = (this.label + '.pdf');

		pdfMake.createPdf(docDefinition).download(filename);
	}


	componentList(isEdited) {
		return [];
	}


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = ABView.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'pageSize',
				view: 'richselect',
				label: L('ab.components.report.pageSize', "*Page size"),
				labelWidth: App.config.labelWidthLarge,
				options: [
					'4A0', '2A0', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10',
					'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10',
					'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
					'RA0', 'RA1', 'RA2', 'RA3', 'RA4',
					'SRA0', 'SRA1', 'SRA2', 'SRA3', 'SRA4',
					'EXECUTIVE', 'FOLIO', 'LEGAL', 'LETTER', 'TABLOID'
				]
			},
			{
				name: 'pageOrientation',
				view: 'richselect',
				label: L('ab.components.report.orientation', "*Orientation"),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{
						id: 'portrait',
						value: L('ab.components.report.portrait', "*Portrait")
					},
					{
						id: 'landscape',
						value: L('ab.components.report.landscape', "*Landscape")
					}
				]
			},
			{
				view: "fieldset",
				label: L('ab.component.report.margin', '*Margin:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows: [
						{
							name: 'pageMarginsLeft',
							label: L('ab.component.report.margin.left', '*Left'),
							view: App.custom.numbertext.view,
							type: "number"
						},
						{
							name: 'pageMarginsTop',
							label: L('ab.component.report.margin.top', '*Top'),
							view: App.custom.numbertext.view,
							type: "number"
						},
						{
							name: 'pageMarginsRight',
							label: L('ab.component.report.margin.right', '*Right'),
							view: App.custom.numbertext.view,
							type: "number"
						},
						{
							name: 'pageMarginsBottom',
							label: L('ab.component.report.margin.botton', '*Bottom'),
							view: App.custom.numbertext.view,
							type: "number"
						}
					]
				}
			},
			{
				view: 'button',
				value: "Preview PDF",
				on: {
					onItemClick: (id, e) => {

						// preview PDF
						_logic.currentEditObject().previewPdf();

					}
				}
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		ABView.propertyEditorPopulate(App, ids, view);

		$$(ids.pageSize).setValue(view.settings.pageSize || ABPropertyComponentDefaults.pageSize);
		$$(ids.pageOrientation).setValue(view.settings.pageOrientation || ABPropertyComponentDefaults.pageOrientation);
		$$(ids.pageMarginsLeft).setValue(view.settings.pageMarginsLeft || ABPropertyComponentDefaults.pageMarginsLeft);
		$$(ids.pageMarginsTop).setValue(view.settings.pageMarginsTop || ABPropertyComponentDefaults.pageMarginsTop);
		$$(ids.pageMarginsRight).setValue(view.settings.pageMarginsRight || ABPropertyComponentDefaults.pageMarginsRight);
		$$(ids.pageMarginsBottom).setValue(view.settings.pageMarginsBottom || ABPropertyComponentDefaults.pageMarginsBottom);

	}


	static propertyEditorValues(ids, view) {

		ABView.propertyEditorValues(ids, view);

		view.settings.pageSize = $$(ids.pageSize).getValue();
		view.settings.pageOrientation = $$(ids.pageOrientation).getValue();
		view.settings.pageMarginsLeft = $$(ids.pageMarginsLeft).getValue();
		view.settings.pageMarginsTop = $$(ids.pageMarginsTop).getValue();
		view.settings.pageMarginsRight = $$(ids.pageMarginsRight).getValue();
		view.settings.pageMarginsBottom = $$(ids.pageMarginsBottom).getValue();

	}

}