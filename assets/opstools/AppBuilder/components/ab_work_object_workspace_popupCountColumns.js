/*
 * ab_work_object_workspace_popupCountColumns
 *
 * Manage the Count Columns popup.
 *
 */


module.exports = class AB_Work_Object_Workspace_PopupCountColumns extends OP.Component {
	
	constructor(App, idBase) {
		idBase = idBase || 'ab_work_object_workspace_popupCountColumns';

		super(App, idBase);
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {
				showAll: L('ab.count_columns.showAll', "*Show All"),
				hideAll: L('ab.count_columns.hideAll', "*Hide All")
			}
		}


		// internal list of Webix IDs to reference our UI components
		var ids = {
			component: this.unique(idBase + '_popupCount'),
			list: this.unique(idBase + '_popupCount_list')
		}


		// Our webix UI definition:
		this.ui = {
			view:"popup",
			id: ids.component,
			body: {
				rows: [
					{
						cols: [
							{
								view: 'button',
								value: labels.component.showAll,
								on: {
									onItemClick: function() {
										_logic.clickShowAll();
									}
								}
							},
							{
								view: 'button',
								value: labels.component.hideAll,
								on: {
									onItemClick: function() {
										_logic.clickHideAll();
									}
								}
							}
						]
					},
					{
						view: 'list',
						id: ids.list,
						maxHeight: 250,
						select: false,
						template: '<span style="min-width: 18px; display: inline-block;"><i class="fa ab-count-field-icon"></i>&nbsp;</span> #label#',
						on: {
							onItemClick: function (id, e, node) {
								_logic.clickListItem(id, e, node);
							}
						}
					}
				]
			},
			on: {
				onShow: function () {
					_logic.onShow();
				}
			}
		}


		// Our init() function for setting up our UI
		this.init = (options) => {

			// register our callbacks:
			for(var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);
		}


		var CurrentObject = null;
		var CountFieldIds = [];

		// our internal business logic
		var _logic = this._logic = {

			callbacks:{

				/**
				 * @function onChange
				 * called when we have made changes to the hidden field settings
				 * of our Current Object.
				 *
				 * this is meant to alert our parent component to respond to the
				 * change.
				 */
				onChange:function(){}
			},


			/**
			 * @function clickHideAll
			 * the user clicked the [hide all] option.  So hide all our fields.
			 */
			clickHideAll: function () {

				var List = $$(ids.list);

				// pass an array is empty
				CountFieldIds = [];

				// hide all icons
				List.find({}).forEach(item => {
					_logic.iconHide(item.id);
				});

				_logic.callbacks.onChange(CountFieldIds);

			},


			/**
			 * @function clickShowAll
			 * the user clicked the [show all] option.  So show all our fields.
			 */
			clickShowAll: function () {

				var List = $$(ids.list);
				var allFieldIds = List.find({}).map(f => f.id);

				CountFieldIds = allFieldIds;

				// show all icons
				List.find({}).forEach(item => {
					_logic.iconShow(item.id);
				});

				_logic.callbacks.onChange(CountFieldIds);

			},


			/**
			 * @function clickListItem
			 * update the clicked field setting.
			 */
			clickListItem: function(fieldId) {

				// select
				if (CountFieldIds.indexOf(fieldId) < 0) {
					CountFieldIds.push(fieldId);

					_logic.iconShow(fieldId);
				}
				// unselect
				else {
					CountFieldIds = CountFieldIds.filter(fid => fid != fieldId);

					_logic.iconHide(fieldId);
				}

				_logic.callbacks.onChange(CountFieldIds);

			},


			/**
			 * @function iconHide
			 * Hide the icon for the given node
			 * @param {DOM} node  the html dom node of the element that contains our icon
			 */
			iconHide: function(fieldId) {

				var List = $$(ids.list);
				var $node = List.getItemNode(fieldId);
				if ($node) {
					$node.querySelector('.ab-count-field-icon').classList.remove("fa-circle");
				}
			},


			/**
			 * @function iconShow
			 * Show the icon for the given node
			 * @param {DOM} node  the html dom node of the element that contains our icon
			 */
			iconShow: function(fieldId) {

				var List = $$(ids.list);
				var $node = List.getItemNode(fieldId);
				if ($node) {
					$node.querySelector('.ab-count-field-icon').classList.add("fa-circle");
				}
			},


			/**
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 */
			objectLoad: function(object) {
				CurrentObject = object;
			},


			/**
			 * @function setValue
			 * 
			 * @param {array} - an array contains field ids
			 */
			setValue: function(fieldIds) {

				CountFieldIds = fieldIds || [];

				_logic.onShow();

			},


			/**
			 * @function onShow
			 * Ready the Popup according to the current object each time it is shown (perhaps a field was created or delted)
			 */
			onShow: function() {

				// refresh list
				var allFields = CurrentObject.fields().map(f => {
					return {
						id: f.id,
						label: f.label
					};
				});

				$$(ids.list).clearAll();
				$$(ids.list).parse(allFields);

				// update icons
				CountFieldIds.forEach(fieldId => {
					_logic.iconShow(fieldId);
				});

			},

			/**
			 * @function show()
			 *
			 * Show this component.
			 * @param {obj} $view  the webix.$view to hover the popup around.
			 */
			show:function($view, options) {
				if (options != null) {
					$$(ids.component).show($view, options);
				} else {
					$$(ids.component).show($view);
				}
			}

		}


		// Expose any globally accessible Actions:
		this.actions({
		})

		// 
		// Define our external interface methods:
		// 
		this.objectLoad = _logic.objectLoad;
		this.setValue = _logic.setValue;
		this.show = _logic.show;

	}

}