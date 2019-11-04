/*
 * ABViewLayout
 *
 * An ABViewLayout defines a UI column layout display component.
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABViewWidget from "./ABViewWidget"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var PropertyComponentDefaults = {
	label: '',
	numColumns: 1  	// The number of columns for this layout
}


var ABViewDefaults = {
	key: 'layout',		// {string} unique key for this view
	icon: 'columns',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.layout' // {string} the multilingual label key for the class label
}



export default class ABViewLayout extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);


		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}


	static common() {
		return ABViewDefaults;
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

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	/*
	 * @function addView
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



	/*
	 * @function propertyEditorDefaultElements
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


	/*
	 * @function addColumn
	 * method to actually add a new ABView as one of our columns.
	 * This is called by the static .addView() method.
	 */
	addColumn() {

		this._views.push(ABViewManager.newView({
			key: ABViewContainer.common().key
		}, this.application, this));

	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = [];
		this.views().forEach((v) => {
			viewComponents.push({
				view: v,
				component: v.component(App)
			});
		})

		function L(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		var idBase = 'ABViewLayout_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		// an ABViewLayout is a container with X number of columns
		var _ui = {
			id: ids.component,
			// type: "space",
			cols: []
		}

		if (viewComponents.length > 0) {
			// insert each of our sub views into our columns:
			viewComponents.forEach((view) => {

				//// TODO: track column widths?
				_ui.cols.push(view.component.ui);
			});
		} else {
			_ui.cols.push({
				view: "label",
				label: L('ab.interface.component.noColumnsYet', '*No columns have been added yet.')
			});
		}

		var _logic = {

			changePage: (pageId) => {
				this.changePage(pageId);
			}

		};

		// make sure each of our child views get .init() called
		var _init = (options) => {


			viewComponents.forEach((view) => {

				if (view.component.init)
					view.component.init(options);

				if (view.component.onShow)
					view.component.onShow();

				// Trigger 'changePage' event to parent
				this.eventAdd({
					emitter: view.view,
					eventName: 'changePage',
					listener: _logic.changePage
				});
			})

			if ($$(ids.component) && $$(ids.component).adjust)
				$$(ids.component).adjust();
		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}



	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 * @param {bool} isEdited  is this component currently in the Interface Editor
	 * @return {array} of ABView objects.
	 */
	componentList(isEdited) {


		if (isEdited) {

			// if the layout component is being edited in the editor (isEdited == true)
			// then we return [];
			return [];

		} else {

			// the layout view doesn't care what components are offered, it get's 
			// the list from it's parent view.
			// ## NOTE: layout views should not be root views.
			if (this.parent) {
				return this.parent.componentList(false);
			} else {
				return [];
			}

		}

	}


	//// Report ////

	print() {

		return new Promise((resolve, reject) => {

			var reportDef = {
				columns: []
			};

			var tasks = [];

			this.views().forEach((v, vIndex) => {

				tasks.push(new Promise((next, err) => {

					v.print().then(vDef => {

						reportDef.columns[vIndex] = vDef;
						next();

					}).catch(err);

				}));

			});

			Promise.all(tasks)
				.catch(reject)
				.then(() => {

					resolve(reportDef);

				});

		});


	}


}

