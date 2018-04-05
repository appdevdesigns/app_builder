
/*
 * ab_work_query_workspace
 *
 * Manage the Query Workspace area.
 *
 */


export default class ABWorkQueryWorkspace extends OP.Component {

	/**
	 * @param {object} ??
	 */
	constructor(App) {
		super(App, 'ab_work_query_workspace');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				selectQuery: L('ab.query.selectQuery', "*Select an query to work with."),


				// formHeader: L('ab.application.form.header', "*Application Info"),
				deleteSelected: L('ab.object.toolbar.deleteRecords', "*Delete records"),
				hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
				massUpdate: L('ab.object.toolbar.massUpdate', "*Edit records"),
				filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
				sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
				frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen fields"),
				defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
				permission: L('ab.object.toolbar.permission', "*Permission"),
				addFields: L('ab.object.toolbar.addFields', "*Add field"),
				"export": L('ab.object.toolbar.export', "*Export"),
				confirmDeleteTitle: L('ab.object.delete.title', "*Delete data field"),
				confirmDeleteMessage: L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")
			}
		};



		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			tree: this.unique('tree'),
			tabObjects: this.unique('tabObjects'),
			menu: this.unique('menu'),

			// buttonAddField: this.unique('buttonAddField'),
			// buttonDeleteSelected: this.unique('deleteSelected'),
			// buttonExport: this.unique('buttonExport'),
			// buttonFieldsVisible: this.unique('buttonFieldsVisible'),
			// buttonFilter: this.unique('buttonFilter'),
			// buttonFrozen: this.unique('buttonFrozen'),
			// buttonLabel: this.unique('buttonLabel'),
			// buttonMassUpdate: this.unique('buttonMassUpdate'),
			// buttonRowNew: this.unique('buttonRowNew'),
			// buttonSort: this.unique('buttonSort'),

			datatable: this.unique('datatable'),

			// // Toolbar:
			// toolbar: this.unique('toolbar'),

			noSelection: this.unique('noSelection'),
			selectedObject: this.unique('selectedObject'),

		}


		// The DataTable that displays our object:
		// var DataTable = new ABWorkspaceDatatable(App);


		// Our init() function for setting up our UI
		this.init = function () {
			// webix.extend($$(ids.form), webix.ProgressBar);

			$$(ids.noSelection).show();
		}



		var CurrentApplication = null;
		var CurrentQuery = null;


		// our internal business logic
		var _logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application
			 */
			applicationLoad: (application) => {
				CurrentApplication = application;

			},


			/**
			 * @function clearWorkspace()
			 *
			 * Clear the query workspace.
			 */
			clearWorkspace: function () {

				// NOTE: to clear a visual glitch when multiple views are updating
				// at one time ... stop the animation on this one:
				$$(ids.noSelection).show(false, false);
			},


			/**
			 * @function populateObjectWorkspace()
			 *
			 * Initialize the Object Workspace with the provided ABObject.
			 *
			 * @param {ABObject} object     current ABObject instance we are working with.
			 */
			populateQueryWorkspace: function (query) {

				CurrentQuery = query;

				if (CurrentQuery == null) {
					_logic.clearWorkspace();
					return;
				}

				var objMain = CurrentQuery.objectMain(),
					objLinks = objMain.objectLinks();

				$$(ids.selectedObject).show();


				// *** List ***

				// set connected objects:
				$$(ids.tree).clearAll();
				$$(ids.tree).parse(objLinks.map(o => {
					return {
						id: o.id,
						value: o.label,
						checked: (CurrentQuery.objects(oLink => oLink.id == o.id).length > 0)
					};
				}));

				$$(ids.tree).refresh();
				// TODO : sub-objects
				// {id:"root", value:"Cars", open:true, data:[
				//     { id:"1", open:true, value:"Toyota", data:[
				//         { id:"1.1", value:"Avalon" },
				//         { id:"1.2", value:"Corolla" },
				//         { id:"1.3", value:"Camry" }
				//     ]},
				//     { id:"2", value:"Skoda", open:true, data:[
				//         { id:"2.1", value:"Octavia" },
				//         { id:"2.2", value:"Superb" }
				//     ]}
				// ]}



				// *** Tabs ***

				// NOTE : Tabview have to contain at least one cell
				$$(ids.tabObjects).addView({
					body: {
						id: 'temp'
					}
				});

				// clear object tabs
				var tabbar = $$(ids.tabObjects).getTabbar();
				var optionIds = tabbar.config.options.map(opt => opt.id);
				optionIds.forEach(optId => {

					if (optId != 'temp') { // Don't remove a temporary tab (remove later)
						$$(ids.tabObjects).removeView(optId);
					}
				});
				var $viewMultiview = $$(ids.tabObjects).getMultiview();
				$viewMultiview.getChildViews().map($view => $view).forEach($view => {
					if ($view && $view.config.id != 'temp')
						$viewMultiview.removeView($view);
				});

				// add the main object tab
				let tabUI = _logic.templateField(objMain, true);
				$$(ids.tabObjects).addView(tabUI);

				// select default tab to the main object
				$$(ids.tabObjects).setValue(objMain.id);

				// Other object tabs will be added in a check tree item event
				CurrentQuery.objects().forEach(obj => {
					// add tab
					let tabUI = _logic.templateField(obj);
					$$(ids.tabObjects).addView(tabUI);
				});

				// remove a temporary tab
				$$(ids.tabObjects).removeView('temp');
				$$(ids.tabObjects).adjust();
				

				/** Menu **/
				_logic.refreshFieldMenu();


				/** DataTable **/
				_logic.refreshDataTable();
			},


			/**
			 * @method save
			 * update settings of the current query and save to database
			 * 
			 * @return {Promise}
			 */
			save: () => {

				var tree = $$(ids.tree);

				var objectMain = CurrentQuery.objectMain();

				/** joins **/
				var joins = [],
					selectObjIds = tree.getChecked();

				selectObjIds.forEach(objId => {

					var objectLink = CurrentQuery.application.objects(obj => obj.id == objId)[0];
					if (!objectLink) return;

					var fieldLink = objectLink.fields(f => {
						return f.key == 'connectObject' &&
							f.settings.linkObject == objectMain.id;
					})[0];
					if (!fieldLink) return;

					// add new join into query
					joins.push({
						objectURL: objectLink.urlPointer(),
						fieldID: fieldLink.id,
						type: 'innerjoin' // default
					});

				});
				CurrentQuery.importJoins(joins);


				/** fields **/
				var fields = [];
				var $viewMultiview = $$(ids.tabObjects).getMultiview();
				$viewMultiview.getChildViews().forEach($viewTab => {

					let $viewDbl = $viewTab.queryView({ name: 'fields' });
					if ($viewDbl && $viewDbl.getValue()) {

						// pull an array of field's url
						let fieldUrls = $viewDbl.getValue().split(',').map(fUrl => {
							return {
								fieldURL: fUrl
							};
						});
						fields = fields.concat(fieldUrls);

					}

				});
				CurrentQuery.importFields(fields);


				// Save to db
				return CurrentQuery.save();

			},


			checkObjectLink: (objId, isChecked) => {

				var tree = $$(ids.tree);
				tree.blockEvent(); // prevents endless loop

				var rootid = objId;
				if (isChecked) {
					// If check we want to check all of the parents as well
					while (tree.getParentId(rootid)) {
						rootid = tree.getParentId(rootid);
						if (rootid != objId)
							tree.checkItem(rootid);
					}
				}
				else {
					// If uncheck we want to uncheck all of the child items as well.
					tree.data.eachSubItem(rootid, function (item) {
						if (item.id != objId)
							tree.uncheckItem(item.id);
					});

				}

				// call save to db
				_logic.save()
					.then(() => {

						// update UI -- add new tab
						this.populateQueryWorkspace(CurrentQuery);

						// // select tab
						// var tabbar = $$(ids.tabObjects).getTabbar();
						// tabbar.setValue(objectLink.id);

					});



				tree.unblockEvent();

			},


			tabChange: function () {

				// *** Field double list ***
				let tabId = $$(ids.tabObjects).getValue(), // object id
					fieldURLs = CurrentQuery.fields(f => f.object.id == tabId).map(f => f.urlPointer()),
					$viewDbl = $$(tabId).queryView({ name: 'fields' });
				if ($viewDbl)
					$viewDbl.setValue(fieldURLs);

			},


			checkFields: function () {

				// call save to db
				_logic.save()
					.then(() => {

						// refresh UI menu
						_logic.refreshFieldMenu();


						// refresh Data table
						_logic.refreshDataTable();

					});

			},


			/**
			 * @function templateField()
			 *	return UI of the object tab
			 * 
			 * @return {JSON}
			 */
			templateField: function (object, isMain) {

				var fields = object.fields().map(f => {
					return {
						id: f.urlPointer(),
						value: f.label
					};
				});

				return {
					header: isMain ? "Main Object" : "Connected Object",
					body: {
						id: object.id,
						type: "space",
						rows: [
							(!isMain ?
								{
									view: "select",
									label: "Join records by:",
									labelWidth: 200,
									placeholder: "Choose a type of table join",
									options: [
										{ id: 'innerjoin', value: 'Returns records that have matching values in both tables (INNER JOIN).' },
										{ id: 'left', value: 'Return all records from the left table, and the matched records from the right table (LEFT JOIN).' },
										{ id: 'right', value: 'Return all records from the right table, and the matched records from the left table (RIGHT JOIN).' },
										{ id: 'fullouterjoin', value: 'Return all records when there is a match in either left or right table (FULL JOIN)' }
									]
								} : {}),
							{
								view: "dbllist",
								name: 'fields',
								list: {
									height: 300
								},
								labelLeft: "Available Fields",
								labelRight: "Included Fields",
								labelBottomLeft: "Move these fields to the right to include in data set.",
								labelBottomRight: "These fields will display in your final data set.",
								data: fields,
								on: {
									onChange: function () {
										_logic.checkFields();
									}
								}
							},
							{ fillspace: true }
						]
					}
				};
			},




			refreshFieldMenu: function () {

				// clear
				$$(ids.menu).find({}).forEach(item => {
					$$(ids.menu).remove(item.id);
				});

				$$(ids.menu).parse(CurrentQuery.fields().map(f => f.label));
				$$(ids.menu).refresh();
			},


			refreshDataTable: function () {

				var DataTable = $$(ids.datatable);
				DataTable.clearAll();


				// set columns:
				var columns = CurrentQuery.columnHeaders(false, false);
				DataTable.refreshColumns(columns);


				// set data:
				CurrentQuery.model().findAll()
					.then((response) => {
						response.data.forEach((d) => {
							DataTable.add(d);
						})
					})
					.catch((err) => {
						OP.Error.log('Error running Query:', { error: err, query: CurrentQuery });
					});

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();
			},

		}
		this._logic = _logic;


		// Our webix UI definition:
		this.ui = {
			view: 'multiview',
			id: ids.component,
			rows: [
				{
					id: ids.noSelection,
					rows: [
						{
							maxHeight: App.config.xxxLargeSpacer,
							hidden: App.config.hideMobile
						},
						{
							view: 'label',
							align: "center",
							label: labels.component.selectQuery
						},
						{
							maxHeight: App.config.xxxLargeSpacer,
							hidden: App.config.hideMobile
						}
					]
				},
				{
					id: ids.selectedObject,
					type: "space",
					rows: [
						{
							cols: [
								{
									rows: [
										{
											view: "label",
											label: "Manage Objects",
											css: "ab-query-label",
											height: 50
										},
										{
											view: "tree",
											id: ids.tree,
											css: "ab-tree",
											template: "{common.icon()} {common.checkbox()} #value#",
											data: [],
											on: {
												onItemClick: function (id, event, item) {
													if (this.isChecked(id)) {
														this.uncheckItem(id);
													} else {
														this.checkItem(id);
													}
												},
												onItemCheck: function (id, isChecked, event) {

													_logic.checkObjectLink(id, isChecked);
												}
											}
										}
									]
								},
								{
									width: 10
								},
								{
									gravity: 2,
									rows: [
										{
											view: "label",
											label: "Manage Fields",
											css: "ab-query-label",
											height: 50
										},
										{
											view: "tabview",
											id: ids.tabObjects,
											tabMinWidth: 200,
											cells: [
												{} // require
											],
											multiview: {
												on: {
													onViewChange: function (prevId, nextId) {
														_logic.tabChange();
													}
												}
											}
										}
									]
								}
							]
						},
						{
							view: "label",
							label: "Manage Field Order",
							css: "ab-query-label",
							height: 50
						},
						{
							type: "space",
							rows: [
								{
									id: ids.menu,
									view: "menu",
									data: [],
									drag: true,
									dragscroll: true
								}
							]
						},
						{
							id: ids.datatable,
							view: 'datatable',
							height: 200,
							columns: [],
							data: []
						},
						{
							fillspace: true
						}
					]

				}
			]
		};



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
		this.clearWorkspace = this._logic.clearWorkspace;
		this.populateQueryWorkspace = this._logic.populateQueryWorkspace;

	}

}
