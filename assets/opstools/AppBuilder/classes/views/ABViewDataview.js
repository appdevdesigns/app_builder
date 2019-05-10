/*
 * ABViewDataview
 *
 *
 *
 */

import ABViewDetail from "./ABViewDetail"

import ABViewPropertyLinkPage from "./viewProperties/ABViewPropertyLinkPage"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewDataviewDefaults = {
	key: 'dataview',					// {string} unique key for this view
	icon: 'th',							// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.dataview',	// {string} the multilingual label key for the class label
	xCount: 1, // {int} the number of columns per row (need at least one)
	detailsPage: '',
	detailsTab: '',
	editPage: '',
	editTab: ''
}

export default class ABViewDataview extends ABViewDetail {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, (defaultValues || ABViewDataviewDefaults));

	}

	static common() {
		return ABViewDataviewDefaults;
	}


	///
	/// Instance Methods
	///



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var idBase = 'ABViewDataviewPropertyEditor';

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		this.linkPageComponent = ABViewPropertyLinkPage.propertyComponent(App, idBase);

		return commonUI.concat([
			{
				view: "counter",
				name: "xCount",
				min: 1, // we cannot have 0 columns per row so lets not accept it
				label: L('ab.components.dataview.xCount', "*Items in a row"),
				labelWidth: App.config.labelWidthLarge,
				step: 1
			},
			this.linkPageComponent.ui
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.xCount).setValue(view.settings.xCount || ABViewDataviewDefaults.xCount);

		this.linkPageComponent.viewLoad(view);
		this.linkPageComponent.setSettings(view.settings);

		// view.populateEditor(ids, view);

		// var details = view.settings.detailsPage;
		// if (view.settings.detailsTab != "") {
		// 	details += ":"+view.settings.detailsTab;
		// }
		// $$(ids.detailsPage).setValue(details);
		// var edit = view.settings.editPage;
		// if (view.settings.editTab != "") {
		// 	edit += ":"+view.settings.editTab;
		// }
		// $$(ids.editPage).setValue(edit);



		// when a change is made in the properties the popups need to reflect the change
		this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
		if (!this.updateEventIds[view.id]) {
			this.updateEventIds[view.id] = true;

			view.addListener('properties.updated', function () {
				view.populateEditor(ids, view);
			}, this);
		}

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.xCount = $$(ids.xCount).getValue();

		let linkSettings = this.linkPageComponent.getSettings();
		for (let key in linkSettings) {
			view.settings[key] = linkSettings[key];
		}

		// var detailsPage = $$(ids.detailsPage).getValue();
		// var detailsTab = "";
		// if (detailsPage.split(":").length > 1) {
		// 	var detailsVals = detailsPage.split(":");
		// 	detailsPage = detailsVals[0];
		// 	detailsTab = detailsVals[1];
		// } 
		// view.settings.detailsPage = detailsPage;
		// view.settings.detailsTab = detailsTab;

		// var editPage = $$(ids.editPage).getValue();
		// var editTab = "";
		// if (editPage.split(":").length > 1) {
		// 	var editVals = editPage.split(":");
		// 	editPage = editVals[0];
		// 	editTab = editVals[1];
		// } 
		// view.settings.editPage = editPage;
		// view.settings.editTab = editTab;

	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		this.settings.detailsPage = this.settings.detailsPage || ABViewDataviewDefaults.detailsPage;
		this.settings.editPage = this.settings.editPage || ABViewDataviewDefaults.editPage;
		this.settings.detailsTab = this.settings.detailsTab || ABViewDataviewDefaults.detailsTab;
		this.settings.editTab = this.settings.editTab || ABViewDataviewDefaults.editTab;

	}



	/**
	* @method component()
	* return a UI component based upon this view.
	* @param {obj } App 
	* @return {obj } UI component
	*/
	component(App) {

		var com = {};

		var idBase = 'ABViewDataview_' + this.id;
		var ids = {
			scrollview: App.unique(idBase + '_scrollview'),
			component: App.unique(idBase + '_component'),
		}

		let linkPage = this.linkPageHelper.component(App, idBase);

		com.ui = {
			id: ids.scrollview,
			view: "scrollview",
			scroll: "y",
			body: {
				id: ids.component,
				view: 'layout',
				paddingX: 15,
				paddingY: 19,
				type: 'space',
				rows: []
			},
			on: {
				onAfterScroll: function () {
					let pos = this.getScrollState();

					com.logic.scroll(pos);
				}
			}
		};

		if (this.settings.height)
			com.ui.height = this.settings.height;


		com.init = (options) => {

			var dc = this.dataCollection;
			if (!dc) return;

			// initial the link page helper
			linkPage.init({
				view: this,
				dataCollection: dc
			});

			com.onShow();

			this.eventAdd({
				emitter: dc,
				eventName: "loadData",
				listener: () => {

					com.onShow();
				}
			});

			if (dc.dataStatus == dc.dataStatusFlag.notInitial) {
				// load data when a widget is showing
				dc.loadData();
			}

		};

		com.logic = {

			busy: () => {

				let Layout = $$(ids.component);

				Layout.disable();

				if (Layout.showProgress)
					Layout.showProgress({ type: "icon" });
			},

			ready: () => {

				let Layout = $$(ids.component);

				Layout.enable();

				if (Layout.hideProgress)
					Layout.hideProgress();
			},

			// we need to recursivly look backwards to toggle tabs into view when a user choosed to select a tab for edit or details views
			toggleTab: (parentTab, wb) => {

				// find the tab
				var tab = wb.getTopParentView().queryView({ id: parentTab });
				// if we didn't pass and id we may have passed a domNode
				if (tab == null) {
					tab = $$(parentTab);
				}

				if (tab == null) return;

				// set the tabbar to to the tab
				var tabbar = tab.getParentView().getParentView();

				if (tabbar == null) return;

				if (tabbar.setValue) { // if we have reached the top we won't have a tab
					tabbar.setValue(parentTab);
				}

				// find if it is in a multiview of a tab
				var nextTab = tabbar.queryView({ view: "scrollview" }, "parent");
				// if so then do this again
				if (nextTab) {
					com.toggleTab(nextTab, wb);
				}
			},

			/**
			 * @method scroll
			 * @param pos - {
			 * 					x: {integer},
			 * 					y: {integer}
			 * 				}
			 */
			scroll: (pos) => {

				let loadWhen = 40;

				let y = pos.y;
				let maxYPos = $$(ids.component).$height - $$(ids.scrollview).$height;
				if (maxYPos - y <= loadWhen) {

					if (this.loadMoreTimer)
						return;

					var dc = this.dataCollection;
					if (!dc) return;

					if (this._rowCount >= dc.totalCount)
						return;

					// loading cursor
					com.logic.busy();

					dc.loadData(this._rowCount || 0)
						.catch(() => {
							com.logic.ready();
						})
						.then(() => {
							com.logic.ready();
						});

					this.loadMoreTimer = setTimeout(() => {
						this.loadMoreTimer = null;
					}, 1100);

				}

			}

		};

		com.onShow = () => {

			var editPage = this.settings.editPage;
			var detailsPage = this.settings.detailsPage;
			var editTab = this.settings.editTab;
			var detailsTab = this.settings.detailsTab;

			let baseCom = super.component(App, this.id);
			baseCom.onShow();

			// clear UI
			webix.ui([{
				view: 'label',
				label: 'No data',
				height: 50, 
				align: "center"
			}], $$(ids.component));

			var dc = this.dataCollection;
			if (!dc) return;

			// add loading cursor
			var Layout = $$(ids.component);
			if (Layout)
				webix.extend(Layout, webix.ProgressBar);

			var rows = dc.getData();

			// store total of rows
			this._rowCount = rows.length;

			// lets build a grid based off the number of columns we want in each row
			var dataGrid = [];
			var colCount = 1; // start with column 1
			var rowObj = { cols: [] }; // create row that has a cols array to push items into
			// loop through items and put them into columns
			rows.forEach(row => {
				// if the column value is higher than the number of columns allowed begin a new row
				if (colCount > parseInt(this.settings.xCount)) {
					dataGrid.push(rowObj);
					rowObj = { cols: [] };
					colCount = 1;
				}

				// get the components configuation
				let detailCom = _.cloneDeep(super.component(App, row.id));

				// adjust the UI to make sure it will look like a "card"
				detailCom.ui.type = "space";
				detailCom.ui.css = "ab-detail-view";
				if (detailsPage || editPage) {
					detailCom.ui.css += " ab-detail-hover ab-record-" + row.id;
				}
				if (detailsPage) {
					detailCom.ui.css += " ab-detail-page";
				}
				if (editPage) {
					detailCom.ui.css += " ab-edit-page";
				}
				detailCom.ui.paddingX = 10;
				detailCom.ui.paddingY = 6;

				// put the component into the column
				rowObj.cols.push(detailCom.ui);

				// we are done with this column move to the next
				colCount++;

			});

			// get any empty cols with number of colums minus the mod of the length and the xCount
			var emptyCols = parseInt(this.settings.xCount) - (rows.length % parseInt(this.settings.xCount));

			// make sure that we need emptyCols, that we are doing more than one column per row and that the emptyCols does not equal the number per row
			if (emptyCols && (parseInt(this.settings.xCount) > 1) && (emptyCols != parseInt(this.settings.xCount))) {
				for (var i = 0; i < emptyCols; i++) {
					// add a spacer to fill column space
					rowObj.cols.push({});
				};
			}

			// push in the last row
			dataGrid.push(rowObj);

			// dynamically create the UI with this new configuration
			webix.ui(dataGrid, $$(ids.component));

			if (detailsPage || editPage) {
				$$(ids.component).$view.onclick = (e) => {
					var clicked = false;
					if (editPage) {
						for (let p of e.path) {
							if (p.className && p.className.indexOf("webix_accordionitem_header") > -1) {
								clicked = true;
								$(p.parentNode.parentNode)[0].classList.forEach((c) => {
									if (c.indexOf("ab-record-") > -1) {
										// var record = parseInt(c.replace("ab-record-", ""));
										var record = c.replace("ab-record-", "");
										linkPage.changePage(editPage, record);
										// com.logic.toggleTab(detailsTab, ids.component);
									}
								});
								break;
							}
						};
					}
					if (detailsPage && !clicked) {
						for (let p of e.path) {
							if (p.className && p.className.indexOf("webix_accordionitem") > -1) {
								$(p.parentNode.parentNode)[0].classList.forEach((c) => {
									if (c.indexOf("ab-record-") > -1) {
										// var record = parseInt(c.replace("ab-record-", ""));
										var record = c.replace("ab-record-", "");
										linkPage.changePage(detailsPage, record);
										// com.logic.toggleTab(detailsTab, ids.component);
									}
								});
								break;
							}
						};
					}
				};
			}

			// loop through the components so we can initialize their data
			// this has to be done after they have been attached to the view so we couldn't have done in the previous step
			rows.forEach(row => {

				let detailCom = _.cloneDeep(super.component(App, row.id));

				detailCom.init();
				detailCom.logic.displayData(row);

			});


			$$(ids.scrollview).adjust();

		};

		return com;

	}


	// populateEditor(ids, view) {
	// 	// Set the options of the possible detail views
	// 	var detailViews = [
	// 		{ id:'', value:L('ab.component.label.noLinkedView', '*No linked view') }
	// 	];

	// 	detailViews = view.loopPages(view, view.application._pages, detailViews, "detail");
	// 	$$(ids.detailsPage).define("options", detailViews);
	// 	$$(ids.detailsPage).refresh();

	// 	// Set the options of the possible edit forms
	// 	var editForms = [
	// 		{id:'', value:L('ab.component.label.noLinkedForm', '*No linked form')}
	// 	];
	// 	editForms = view.loopPages(view, view.application._pages, editForms, "form");
	// 	view.application._pages.forEach((o)=>{
	// 		o._views.forEach((j)=>{
	// 			if (j.key == "form" && j.settings.object == view.settings.datacollection) {
	// 				editForms.push({id:j.parent.id, value:j.label});				
	// 			}
	// 			if (j.key == "tab") {
	// 				j._views.forEach((k)=>{
	// 					k._views.forEach((l)=>{	
	// 						if (l.key == "form" && l.settings.datacollection == view.settings.datacollection) {
	// 							editForms.push({id:l.parent.id, value:l.label});				
	// 						}
	// 					});
	// 				});
	// 			}
	// 		});
	// 	});
	// 	$$(ids.editPage).define("options", editForms);
	// 	$$(ids.editPage).refresh();
	// }

	// loopPages(view, pages, detailViews, type) {
	// 	if (typeof pages == "array" || typeof pages == "object") {
	// 		pages.forEach((p) => {
	// 			if (p._pages.length > 0) {
	// 				detailViews = view.loopPages(view, p._pages, detailViews, type);
	// 			}
	// 			detailViews = view.loopViews(view, p._views, detailViews, type);
	// 		});
	// 	}
	// 	detailViews = view.loopViews(view, pages, detailViews);
	// 	return detailViews;
	// }

	// loopViews(view, views, detailViews, type) {
	// 	if (typeof views == "array" || typeof views == "object") {
	// 		views.forEach((v) => {
	// 			if (v.key == type && v.settings.datacollection == view.settings.datacollection) {
	// 				detailViews.push({ id: v.pageParent().id, value: v.label });
	// 			}
	// 			// find views inside layouts
	// 			else if (v.key == "layout" || v.key == "viewcontainer") {
	// 				detailViews = view.loopViews(view, v._views, detailViews, type);
	// 			}
	// 			// find views inside Tab component
	// 			else if (v.key == "tab") {
	// 				var tabViews = v.views();
	// 				tabViews.forEach(tab => {

	// 					var viewContainer = tab.views(subT => subT.key == "tab");
	// 					viewContainer.forEach(vc => {

	// 						vc.views().forEach((st) => {
	// 							// detailViews = view.loopViews(view, st._views, detailViews, type);							
	// 							var subViews = st.views(subV => subV.key == type && subV.settings.datacollection == view.settings.datacollection);
	// 							subViews.forEach((sub) => {
	// 								detailViews.push({ id: v.pageParent().id + ":" + st.id, value: st.label + ":" + sub.label });
	// 							});
	// 						});

	// 					});

	// 					var subViews = tab.views(subV => subV.key == type && subV.settings.datacollection == view.settings.datacollection);
	// 					subViews.forEach((sub) => {
	// 						detailViews.push({ id: v.pageParent().id + ":" + tab.id, value: tab.label + ":" + sub.label });
	// 					});

	// 				});

	// 			}
	// 		});
	// 		return detailViews;
	// 	}
	// 	return detailViews;
	// }

	get linkPageHelper() {

		if (this.__linkPageHelper == null)
			this.__linkPageHelper = new ABViewPropertyLinkPage();

		return this.__linkPageHelper;

	}


	//// Report ////

	print() {

		return new Promise((resolve, reject) => {

			var reportDef = [];

			var dc = this.dataCollection;
			if (!dc) return reportDef;

			var rows = dc.getData();

			var tasks = [];

			rows.forEach(row => {

				// add tasks
				tasks.push(new Promise((next, err) => {

					// pull container definition
					super.print(row).then(containerDef => {

						// add to rows
						reportDef.push(containerDef);
						next();

					}).catch(err);


				}));

			});


			// final fn - return report definition
			tasks.push(new Promise((next, err) => {
				resolve(reportDef);
				next();
			}));

			// action sequentially
			tasks.reduce((promiseChain, currTask) => {
				return promiseChain.then(currTask);
			}, Promise.resolve([]));

		});

	}

}