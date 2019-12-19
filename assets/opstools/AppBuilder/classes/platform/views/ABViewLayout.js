const ABViewLayoutCore = require("../../core/views/ABViewLayoutCore");

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewLayout extends ABViewLayoutCore {

	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, defaultValues);

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

		var idBase = 'ABViewLayoutEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component'),
			view: App.unique(idBase + '_view')
		}

		var component = this.component(App);

		/** Logic */
		var _logic = {

			templateButton: function (obj) {

				return ('<div class="ab-widget-header ab-layout-header">' +
					'<i class="fa fa-#icon# webix_icon_btn"></i> ' +
					' #label#' +
					'<div class="ab-component-tools">' +
					'<i class="fa fa-trash ab-component-remove"></i>' +
					'<i class="fa fa-edit ab-component-edit"></i>' +
					'</div>' +
					'</div>')
					.replace('#icon#', obj.icon)
					.replace('#label#', obj.label);

			},


			viewEdit: (e, id, trg) => {

				var view = this.views(function (v) { return v.id == id; })[0];

				if (!view) return false;

				// NOTE: let webix finish this onClick event, before
				// calling .populateInterfaceWorkspace() which will replace
				// the interface elements with the edited view.  (apparently
				// that causes errors.)
				setTimeout(() => {
					App.actions.populateInterfaceWorkspace(view);
				}, 50);

				e.preventDefault();
				return false;
			},

			viewDelete: (e, id, trg) => {

				var view = this.views(function (v) { return v.id == id; })[0];

				OP.Dialog.Confirm({
					title: L('ab.interface.component.confirmDeleteTitle', '*Delete component'),
					text: L('ab.interface.component.confirmDeleteMessage', '*Do you want to delete <b>{0}</b>?').replace('{0}', view.label),
					callback: (result) => {
						if (result) {

							// this.viewDestroy(view)
							view.destroy()
								.then(() => {

									// refresh the editor interface.
									App.actions.populateInterfaceWorkspace(this);

								});
						}
					}
				});
				e.preventDefault();
			}

		};

		/** UI */
		var _ui = Object.assign(component.ui, {});
		_ui.type = "space";

		this.views().forEach((v, index) => {

			_ui.cols[index] = {
				rows: [
					// Add action buttons
					{
						type: 'template',
						height: 33,
						template: _logic.templateButton({
							icon: v.icon,
							label: v.label
						}),
						onClick: {
							"ab-component-edit": (e, id, trg) => {
								_logic.viewEdit(e, v.id, trg);
							},
							"ab-component-remove": (e, id, trg) => {
								_logic.viewDelete(e, v.id, trg);
							}
						}
					},
					// Preview display here
					_ui.cols[index],
					{}
				]
			};

		});

		return {
			ui: _ui,
			init: component.init,
			logic: _logic
		}
	}


	//
	// Property Editor
	// 

	/**
	 * @method addView
	 * called when the .propertyEditorDefaultElements() button is clicked.
	 * This method should find the current View instance and call it's .addColumn()
	 * method.
	 */
	static addView(ids, _logic) {

		// get current instance and .addColumn()
		var LayoutView = _logic.currentEditObject();
		LayoutView.addColumn();

		// trigger a save()
		this.propertyEditorSave(ids, LayoutView);
	}



	/**
	 * @method propertyEditorDefaultElements
	 * return the input form used in the property editor for this View.
	 */
	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// if I don't create my own propertyEditorComponent, then I need to 
		// create the onClick handler that will cause the current view instance
		// to create a vew sub view/ column
		if (!_logic.onClick) {
			_logic.onClick = () => {
				this.addView(ids, _logic)
			}
		}

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([

			// [button] : add column
			{
				view: 'button',
				value: L('ab.component.layout.addColumn', '*Add Column '),
				click: _logic.onClick
			}

		]);
	}


}