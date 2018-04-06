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
	columns: 1,
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

		super(values, application, parent, (defaultValues || ABViewDefaults));

	}


	static common() {
		return ABViewDefaults;
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABView instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj() {

		var obj = super.toObj();

		return obj;

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
		this.settings.columns = parseInt(this.settings.columns || ABPropertyComponentDefaults.columns);

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
		};

		var subComponents = {} // { viewId: viewComponent, ..., viewIdn: viewComponent }

		var cellHeight = 250;
		// if (this.key == "form" || this.key == "detail") {
		// 	cellHeight = 80;
		// }

		var _ui = {
			rows: [{
				id: ids.component,
				view: "dashboard",
				css: "ab-" + this.key + "-container",
				cellHeight: cellHeight,
				gridColumns: this.settings.columns || ABPropertyComponentDefaults.columns
			}]
		};

		var _init = (options) => {


			var Dashboard = $$(ids.component);
			webix.extend(Dashboard, webix.OverlayBox);

			// this.views().reverse().forEach((child) => {

			// NOTE: need to sorting before .addView because there is a render position bug in webix 5.1.7
			// https://webix.com/snippet/404cf0c7
			var childViews = this.viewsSortByPosition();

			// attach all the .UI views:
			childViews.forEach((child) => {

				var component = child.component(App);

				// store
				subComponents[child.id] = component;

				Dashboard.addView({

					view: 'panel',

					// specific viewId to .name, it will be used to save view position
					name: child.id,
					icon: 'arrows',
					css: 'ab-widget-container',
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
							component.ui
							// (mode == 'preview' ? component.ui : {
							// 	// empty element
							// 	view: 'spacer',
							// 	hidden: true,
							// })
						]
					},

					// dx: _logic.validatePosition(child.position.dx, 1, Dashboard.config.gridColumns),
					// dy: _logic.validatePosition(child.position.dy, 1, Dashboard.config.gridRows),

					dx: child.position.dx || 1,
					dy: child.position.dy || 1,
					x: _logic.validatePosition(child.position.x, 0, Dashboard.config.gridColumns - 1),
					y: child.position.y || 0

				});


				// initial sub-component
				component.init();

			});


			// listen onChange event
			// NOTE: listen after populate views by .addView
			if (this._onChangeId) Dashboard.detachEvent(this._onChangeId);
			this._onChangeId = Dashboard.attachEvent("onChange", () => {
				_logic.onChange();
			});


			// show "drop here" panel
			_logic.showEmptyPlaceholder();

			Dashboard.adjust();

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

							deletedView.destroy()
								.then(() => {

									// signal the current view has been deleted.
									deletedView.emit('destroyed', deletedView);

									// remove UI of this component in template
									var deletedElem = Dashboard.queryView({ name: id });
									if (deletedElem)
										Dashboard.removeView(deletedElem);

									_logic.showEmptyPlaceholder();

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

			onChange: () => {

				var Dashboard = $$(ids.component);

				// ignore in "preview" mode
				if (Dashboard == null || Dashboard.config.view != "dashboard") return;

				var viewState = Dashboard.serialize();

				// save view position state to views
				this.views().forEach((v) => {

					var state = viewState.filter((vs) => vs.name == v.id)[0];
					if (state) {

						v.position.x = state.x;
						v.position.y = state.y;

						// validate position data
						if (v.position.x < 0) v.position.x = 0;
						if (v.position.y < 0) v.position.y = 0;
					}

				});

				// save template layout
				this.save();

			},

			showEmptyPlaceholder: () => {

				var Dashboard = $$(ids.component);

				// if we don't have any views, then place a "drop here" placeholder
				if (Dashboard.getChildViews().length == 0) {
					Dashboard.showOverlay("<div class='drop-zone'><div>" + App.labels.componentDropZone + "</div></div>");
				}

			},

			validatePosition: (curPosition, minPosition, maxPosition) => {

				if (curPosition < minPosition)
					return minPosition;
				if (curPosition > maxPosition)
					return maxPosition;
				else
					return curPosition;

			}


		};

		var _onShow = () => {

			this.views().forEach((v) => {

				var component = subComponents[v.id];

				if (component &&
					component.onShow) {
					component.onShow();
				}

			});

		};

		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _onShow
		}
	}



	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


    /** 
     * @method propertyEditorFields
     * return an array of webix UI fields to handle the settings of this
     * ABView. 
     * This method should make any modifications to ids, logic, and init
     * as needed to support the new fields added in this routine.
     * @param {App} App  The global App object for the current Application instance
     * @param {obj} options a set of shared data for creating the UI:
     * 	 options.ids    {obj}  A hash of the settings ids for our fields.
     *   options.logic  {obj}  A hash of fn() called by our webix components
     *   options.init   {fn}   An initialization fn() called to setup our fields.
     * @return {array}  of webix UI definitions.
     */
	propertyEditorFields(App, options) { 
		var components = super.propertyEditorFields(App, options); 

		var ids = options.ids;
		ids.columns = App.unique('columns');

		components = components.concat([
			{
				id: ids.columns,
				name: 'columns',
				view: 'counter',
				min: 1,
				label: L('ab.components.container.columns', "*Columns"),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: function (newVal, oldVal) {

						if (newVal > 8)
							$$(ids.columns).setValue(8);

					}
				}
			}
		]);

		var superInit = options.init;
		options.init = (data) => {
			if (superInit) superInit(data);
			if (data.columns) {
				$$(ids.columns).setValue(data.columns);
			}
		}

		return components;
	}


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'columns',
				view: 'counter',
				min: 1,
				label: L('ab.components.container.columns', "*Columns"),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: function (newVal, oldVal) {

						if (newVal > 8)
							$$(ids.columns).setValue(8);

					}
				}
			}
		]);

	}


	// propertyEditorPopulate(App, ids, data) {

	// 	super.propertyEditorPopulate(App, ids, data);

	// 	if ($$(ids.columns)) {
	// 		$$(ids.columns).setValue(data.columns || ABPropertyComponentDefaults.columns);
	// 	}

	// 	// when a change is made in the properties the popups need to reflect the change
	// 	this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
	// 	if (!this.updateEventIds[this.id]) {
	// 		this.updateEventIds[this.id] = true;

	// 		// refresh dashboard to update "position.x" and "position.y" of child views
	// 		this.addListener('properties.updated', function () {

	// 			setTimeout(() => {
	// 				this.editorComponent(App).logic.onChange();
	// 			}, 100)

	// 		}, this);
	// 	}


	// }


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.columns = $$(ids.columns).getValue();

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
		};

		this.viewComponents = this.viewComponents || {}; // { viewId: viewComponent, ..., viewIdn: viewComponent }

		var _logic = {

			changePage: (pageId) => {
				this.changePage(pageId);
			},
			
			callbacks: {
				
			},

			getElements: (views) => {
				var rows = [];
				var curRowIndex;
				var curColIndex;

				views.forEach((v) => {

					var component = v.component(App);
					
					this.viewComponents[v.id] = component;
					
					// if key == "form" or "button" register the callbacks to the parent
					// NOTE this will only work on the last form of a page!
					if ( (v.key == "form") && v._logic.callbacks) {
						_logic.callbacks = v._logic.callbacks;
					}

					// Create a new row
					if (v.position.y == null ||
						v.position.y != curRowIndex) {

						curRowIndex = v.position.y || rows.length;
						curColIndex = 0;

						var rowNew = {
							cols: []
						};

						// Create columns following setting value
						var colNumber = this.settings.columns || ABPropertyComponentDefaults.columns;
						for (var i = 0; i < colNumber; i++) {
							rowNew.cols.push({});
						}

						rows.push(rowNew);
					}

					// Get the last row
					var curRow = rows[rows.length - 1];

					// Add ui of sub-view to column
					curRow.cols[v.position.x || 0] = component.ui;

					curColIndex += 1;

					// Trigger 'changePage' event to parent
					this.eventAdd({
						emitter: v,
						eventName: 'changePage',
						listener: _logic.changePage
					});

				});

				return rows;
			}

		};

		// Generate rows & cols of views to .layout
		var views = this.viewsSortByPosition();
		var rowViews = _logic.getElements(views);


		var _ui = {
			id: ids.component,
			view: "layout",
			rows: rowViews
		};


		// make sure each of our child views get .init() called
		var _init = (options) => {
			// register our callbacks:
			if (options) {
				for(var c in _logic.callbacks) {
					_logic.callbacks[c] = options[c] || _logic.callbacks[c];
				}
			}

			// attach all the .UI views:
			for (var key in this.viewComponents) {

				var component = this.viewComponents[key];

				// Initial component along with options in case there are callbacks we need to listen for
				component.init(options);
			}

		};

		var _onShow = () => {

			this.views().forEach((v) => {

				var component = this.viewComponents[v.id];

				if (component &&
					component.onShow) {
					component.onShow();
				}

			});

		}

		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _onShow
		};
	}

	viewsSortByPosition() {

		// Sort views from y, x positions
		return this.views().sort((a, b) => {

			if (a.position.y == b.position.y) 
				return a.position.x - b.position.x;
			else
				return a.position.y - b.position.y;

		});

	}



}