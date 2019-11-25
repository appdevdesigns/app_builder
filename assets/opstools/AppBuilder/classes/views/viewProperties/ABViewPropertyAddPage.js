import ABViewProperty from "./ABViewProperty";

let L = (key, altText) => {
	return AD.lang.label.getLabel(key) || altText;
};

export default class ABViewPropertyAddPage extends ABViewProperty {

	/**
	 * @property default
	 * return default settings
	 * 
	 * @return {Object}
	 */
	static get default() {
		return {
			formView: '', // id of form to add new data
		};
	}

	static propertyComponent(App, idBase) {

		let ids = {
			formView: idBase + '_formView'
		};

		let ui = {
			id: ids.formView,
			name: 'formView',
			view: 'richselect',
			label: L('ab.component.connect.form', '*Add New Form'),
			labelWidth: App.config.labelWidthXLarge,
			on: {
				onChange: (newVal, oldVal) => {
					if (newVal == L('ab.component.connect.no', '*No add new option')) {
						$$(ids.formView).setValue("");
					}

					_logic.callbacks.onSave();
				}
			}
		};

		let _init = (options) => {

			for (let c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

		};

		let _logic = {

			callbacks: {
				onSave: function () { console.warn('NO onSave()!') }
			},

			setSettings: (view, settings = {}) => {

				if (view == null)
					return;

				// Set the options of the possible edit forms
				let editForms = [
					{ id: L('ab.component.connect.no', '*No add new option'), value: L('ab.component.connect.no', '*No add new option') }
				];

				let pagesHasForm = view.pageRoot()
					.pages(p => {
						return p.views(v => {
							return v &&
								v.key == "form" &&
								v.dataview &&
								v.dataview.datasource.id == view.field().settings.linkObject;
						}, true).length;
					}, true)
					.map(p => {
						return {
							id: p.id,
							value: p.label
						}
					});

				editForms = editForms.concat(pagesHasForm);

				$$(ids.formView).define("options", editForms);
				$$(ids.formView).refresh();
				$$(ids.formView).setValue(settings.formView || this.default.formView);

			},

			getSettings: (view) => {

				let settings = view.settings || {};

				settings.formView = $$(ids.formView).getValue();

				return settings;

			}
		};

		return {
			ui: ui,
			init: _init,
			setSettings: _logic.setSettings,
			getSettings: _logic.getSettings
		};
	}

	fromSettings(settings = {}) {

		this.settings = this.settings || {};
		this.settings.formView = settings.formView || this.constructor.default.formView;

	}

	component(App, idBase) {

		let ids = {
			popup: App.unique(idBase + '_popup_add_new')
		};

		let ui = "";

		if (this.settings.formView) {
			let iDiv = document.createElement('div');
			iDiv.className = 'ab-connect-add-new';
			iDiv.innerHTML = '<a href="javascript:void(0);" class="fa fa-plus ab-connect-add-new-link"></a>';
			// iDiv.appendChild(node);
			ui = iDiv.outerHTML;
		}

		let _logic = {

			callbacks: {
				onSaveData: (saveData) => { },
				onCancel: () => { },
				onClearOnLoad: () => { }
			},

			applicationLoad: (application) => {
				this._application = application;
			},

			openFormPopup: () => {

				if (this._application == null)
					return;

				if ($$(ids.popup)) {
					$$(ids.popup).show();
					return;
				}

				let pageId = this.settings.formView;
				let page = this._application.pages(p => p.id == pageId, true)[0];


				// Clone page so we modify without causing problems
				let pageClone = _.cloneDeep(page);
				let instance = webix.uid();
				pageClone.id = pageClone.id + "-" + instance; // lets take the stored id can create a new dynamic one so our views don't duplicate
				let popUpComp = pageClone.component(App);
				let ui = popUpComp.ui;

				let popupTemplate = {
					view: "window",
					id: ids.popup,
					modal: true,
					position: "center",
					// position:function(stthis.__addPageToolate){
					// 	state.left = x + 20this.__addPageTool; // offset the popups
					// 	state.top = y + 20;this.__addPageTool
					// },
					resize: true,
					width: parseInt(this.settings.popupWidth) || 700,
					height: (parseInt(this.settings.popupHeight) + 44) || 450,
					css: 'ab-main-container',
					head: {
						view: "toolbar",
						css: "webix_dark",
						cols: [
							{
								view: "label",
								label: page.label,
								css: "modal_title",
								align: "center"
							},
							{
								view: "button",
								label: "Close",
								autowidth: true,
								align: "center",
								click: function () {

									var popup = this.getTopParentView();
									popup.close();

								}
							}
						]
					},
					body: {
						view: "scrollview",
						scroll: true,
						body: ui
					}
				};

				// Create popup
				webix.ui(popupTemplate).show();

				// Initial UI components
				setTimeout(() => {

					popUpComp.init({
						onSaveData: _logic.callbacks.onSaveData,
						onCancelClick: _logic.callbacks.onCancel,
						clearOnLoad: _logic.callbacks.onClearOnLoad
					});

					popUpComp.onShow();

				}, 50);

			}

		};

		let init = (options) => {

			for (let c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

		}

		return {
			ui: ui,
			init: init,

			applicationLoad: _logic.applicationLoad,
			onClick: _logic.openFormPopup
		};

	}
}