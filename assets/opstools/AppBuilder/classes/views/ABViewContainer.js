/*
 * ABViewContainer
 *
 * An ABViewContainer defines a UI label display component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABPropertyComponentDefaults = {
	columns: 2,
	rows: 6
}


var ABViewDefaults = {
	key: 'viewcontainer',	// {string} unique key for this view
	icon: 'braille',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.container' // {string} the multilingual label key for the class label
}



export default class ABViewContainer extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 * @param {obj} defaultValues special sub class defined default values.
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, ABViewDefaults);

	}


	static common() {
		return ABViewDefaults;
	}



	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// convert from "0" => 0
		this.settings.columns = parseInt(this.settings.columns || 0);
		this.settings.rows = parseInt(this.settings.rows || 0);

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

		var idBase = 'ABViewContainerEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}

		var _ui = this.component(App, mode).ui;
		_ui.id = ids.component;


		var _init = (options) => {


			var Dashboard = $$(ids.component);

			// attach all the .UI views:
			this.views().forEach((child) => {

				var component = child.component(App);

				Dashboard.addView({
					view: 'widget',

					body: {
						rows: [
							{
								view: 'template',
								height: 30,
								css: "ab-widget-header",
								template: _logic.template(child),
								onClick: {
									"ab-component-edit": (e, id, trg) => {
										_logic.viewEdit(e, child.id, trg);
									},
									"ab-component-remove": (e, id, trg) => {
										_logic.viewDelete(e, child.id, trg);
									}
								}
							},
							(mode == 'preview' ? component.ui : {
								// empty element
								view: 'spacer',
								hidden: true,
							})
						]
					},

					dx: child.position.dx,
					dy: child.position.dy,
					x: child.position.x,
					y: child.position.y
				});

				// Initial component
				component.init();

			});
		};


		var _logic = {


			/**
			 * @method template()
			 * render the list template for the View
			 * @param {obj} obj the current View instance
			 * @param {obj} common  Webix provided object with common UI tools
			 */
			template: function (child) {

				return ('<div>' +
					'<i class="fa fa-#icon# webix_icon_btn"></i> ' +
					' #label#' +
					'<div class="ab-component-tools">' +
					'<i class="fa fa-trash ab-component-remove"></i>' +
					'<i class="fa fa-edit ab-component-edit"></i>' +
					'</div>' +
					'</div>')
					.replace('#icon#', child.icon)
					.replace('#label#', child.label);

			},


			/**
			 * @method viewDelete()
			 * Called when the [delete] icon for a child View is clicked.
			 * @param {obj} e the onClick event object
			 * @param {integer} id the id of the element to delete
			 * @param {obj} trg  Webix provided object 
			 */
			viewDelete: (e, id, trg) => {

				var deletedView = this.views(v => v.id == id)[0];

				if (!deletedView) return false;

				OP.Dialog.Confirm({
					title: L('ab.interface.component.confirmDeleteTitle', '*Delete component'),
					text: L('ab.interface.component.confirmDeleteMessage', 'Do you want to delete <b>{0}</b>?').replace('{0}', deletedView.label),
					callback: function (result) {
						if (result) {

							var Dashboard = $$(ids.component);

							// remove UI of this component in template
							var deletedElem = Dashboard.queryView({ viewId: id });
							if (deletedElem)
								Dashboard.destroyView(deletedElem);

							// update/refresh template to ABView
							_logic.refreshTemplate();

							deletedView.destroy()
								.then(() => {

									// signal the current view has been deleted.
									deletedView.emit('destroyed', deletedView);


									// if we don't have any views, then place a "drop here" placeholder
									if (Dashboard.getChildViews().length == 0) {
										webix.extend(Dashboard, webix.OverlayBox);
										Dashboard.showOverlay("<div class='drop-zone'><div>" + App.labels.componentDropZone + "</div></div>");
									}
								})
								.catch((err) => {
									OP.Error.log('Error trying to delete selected View:', { error: err, view: deletedView })
								})
						}
					}
				});
				e.preventDefault();
			},


			/**
			 * @method viewEdit()
			 * Called when the [edit] icon for a child View is clicked.
			 * @param {obj} e the onClick event object
			 * @param {integer} id the id of the element to edit
			 * @param {obj} trg  Webix provided object 
			 */
			viewEdit: (e, id, trg) => {

				var view = this.views(v => v.id == id)[0];

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

			onAfterPortletMove: () => {

				_logic.refreshTemplate();

				// save template layout to ABPageView
				this.save();

				// // Reorder
				// var viewId = active.config.id;
				// var targetId = target.config.id;

				// var toPosition = this._views.findIndex((v) => v.id == targetId);

				// this.viewReorder(viewId, toPosition);

			},

			refreshTemplate: () => {

				// get portlet template UI to ABView
				this.template = $$(ids.component).getState();

			}

		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}



	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'columns',
				view: 'counter',
				label: L('ab.components.container.columns', "*Columns"),
			},
			{
				name: 'rows',
				view: 'counter',
				label: L('ab.components.container.rows', "*Rows"),
			}
		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.columns).setValue(view.columns || ABPropertyComponentDefaults.columns);
		$$(ids.rows).setValue(view.rows || ABPropertyComponentDefaults.rows);

	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.columns = $$(ids.columns).getValue();
		view.rows = $$(ids.rows).getValue();

	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewContainer_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		var _ui = {
			id: ids.component,
			view: "dashboard",
			gridColumns: this.settings.columns,
			gridRows: this.settings.rows,
		};


		// make sure each of our child views get .init() called
		var _init = (options) => {


			var Dashboard = $$(ids.component);

			// attach all the .UI views:
			this.views().forEach((child) => {

				var component = child.component(App);

				Dashboard.addView({
					view: 'layout',

					body: component.ui,

					dx: child.position.dx,
					dy: child.position.dy,
					x: child.position.x,
					y: child.position.y
				});


				// Initial component
				component.init();


				// Trigger 'changePage' event to parent
				child.removeListener('changePage', _logic.changePage)
					.on('changePage', _logic.changePage);


			});

		};


		var _logic = {

			changePage: (pageId) => {
				this.changePage(pageId);
			}

		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		};
	}



}