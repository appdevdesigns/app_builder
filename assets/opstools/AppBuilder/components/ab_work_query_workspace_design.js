/*
 * ab_work_query_workspace_design
 *
 * Manage the Query Workspace area.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

const ABDataCollection = require("../classes/platform/ABDataCollection");
const RowFilter = require("../classes/platform/RowFilter");

module.exports = class ABWorkQueryWorkspaceDesign extends ABComponent {
   /**
    * @param {object} ??
    */
   constructor(App) {
      super(App, "ab_work_query_workspace_design");
      var L = this.Label;

      var idBase = "AB_Query_Workspace_Design";

      var labels = {
         common: App.labels,
         component: {
            // formHeader: L('ab.application.form.header', "*Application Info"),
            deleteSelected: L(
               "ab.object.toolbar.deleteRecords",
               "*Delete records"
            ),
            hideFields: L("ab.object.toolbar.hideFields", "*Hide fields"),
            massUpdate: L("ab.object.toolbar.massUpdate", "*Edit records"),
            filterFields: L("ab.object.toolbar.filterFields", "*Add filters"),
            sortFields: L("ab.object.toolbar.sortFields", "*Apply sort"),
            frozenColumns: L(
               "ab.object.toolbar.frozenColumns",
               "*Frozen fields"
            ),
            defineLabel: L("ab.object.toolbar.defineLabel", "*Define label"),
            permission: L("ab.object.toolbar.permission", "*Permission"),
            addFields: L("ab.object.toolbar.addFields", "*Add field"),
            export: L("ab.object.toolbar.export", "*Export"),
            confirmDeleteTitle: L(
               "ab.object.delete.title",
               "*Delete data field"
            ),
            confirmDeleteMessage: L(
               "ab.object.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),
         tree: this.unique("tree"),
         tabObjects: this.unique("tabObjects"),
         depth: this.unique("depth"),

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

         datatable: this.unique("datatable"),

         // // Toolbar:
         // toolbar: this.unique('toolbar'),

         selectedObject: this.unique("selectedObject"),
         grouping: this.unique("grouping"),
         hidePrefix: this.unique("hidePrefix")
      };

      // The DataTable that displays our object:
      // var DataTable = new ABWorkspaceDatatable(App);

      // Our init() function for setting up our UI
      this.init = function() {
         // webix.extend($$(ids.form), webix.ProgressBar);
         webix.extend($$(ids.tree), webix.ProgressBar);
         webix.extend($$(ids.tabObjects), webix.ProgressBar);
         webix.extend($$(ids.datatable), webix.ProgressBar);

         DataFilter.init({
            onChange: _logic.save,
            showObjectName: true
         });
      };

      var CurrentApplication = null;
      var CurrentQuery = null;
      var CurrentDatacollection = null;

      var DataFilter = new RowFilter(App, idBase + "_filter");

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
         clearWorkspace: function() {
            // NOTE: to clear a visual glitch when multiple views are updating
            // at one time ... stop the animation on this one:
            // $$(ids.noSelection).show(false, false);
         },

         /**
          * @function populateQueryWorkspace()
          *
          * Initialize the Object Workspace with the provided ABObject.
          *
          * @param {ABObject} object     current ABObject instance we are working with.
          */
         populateQueryWorkspace: function(query) {
            CurrentQuery = query;

            if (CurrentQuery == null) {
               _logic.clearWorkspace();
               return;
            }

            // create new data view
            CurrentDatacollection = new ABDataCollection(
               {
                  query: [CurrentQuery.toObj()],
                  settings: {
                     datasourceID: CurrentQuery.id
                  }
               },
               CurrentApplication
            );
            CurrentDatacollection.datasource = CurrentQuery;

            var objBase = CurrentQuery.objectBase();

            $$(ids.selectedObject).show();

            // *** Tree ***
            _logic.refreshTree().then(() => {
               // *** Tabs ***

               let links = CurrentQuery.joins().links || [];

               $$(ids.tabObjects).showProgress({ type: "icon" });

               // NOTE : Tabview have to contain at least one cell
               $$(ids.tabObjects).addView({
                  body: {
                     id: "temp"
                  }
               });

               // clear object tabs
               var tabbar = $$(ids.tabObjects).getTabbar();
               var optionIds = tabbar.config.options.map((opt) => opt.id);
               optionIds.forEach((optId) => {
                  if (optId != "temp") {
                     // Don't remove a temporary tab (remove later)
                     $$(ids.tabObjects).removeView(optId);
                  }
               });
               var $viewMultiview = $$(ids.tabObjects).getMultiview();
               $viewMultiview
                  .getChildViews()
                  .map(($view) => $view)
                  .forEach(($view) => {
                     if ($view && $view.config.id != "temp")
                        $viewMultiview.removeView($view);
                  });

               if (!objBase) return;

               // add the main object tab
               let tabUI = _logic.templateField({
                  object: objBase,
                  isTypeHidden: true,
                  aliasName: "BASE_OBJECT"
               });
               $$(ids.tabObjects).addView(tabUI);

               // select default tab to the main object
               $$(ids.tabObjects).setValue(tabUI.id);

               // populate selected fields
               _logic.setSelectedFields("BASE_OBJECT");

               // Other object tabs will be added in a check tree item event
               var fnAddTab = (objFrom, links) => {
                  (links || []).forEach((join) => {
                     // NOTE: query v1
                     if (join.objectURL) {
                        objFrom = CurrentApplication.urlResolve(join.objectURL);
                     }

                     if (!objFrom) return;

                     if (!join.fieldID) return;

                     var fieldLink = objFrom.fields(
                        (f) => f.id == join.fieldID,
                        true
                     )[0];
                     if (!fieldLink) return;

                     var objLink = CurrentQuery.objects(
                        (obj) => obj.id == fieldLink.settings.linkObject
                     )[0];
                     if (!objLink) return;
                     // if (!objLink ||
                     // 	// prevent join recursive base object
                     // 	objLink.id == objBase.id) return;

                     // add tab
                     let tabUI = _logic.templateField({
                        field: fieldLink,
                        joinType: join.type,
                        aliasName: join.alias
                     });
                     $$(ids.tabObjects).addView(tabUI);

                     // populate selected fields
                     _logic.setSelectedFields(join.alias);

                     fnAddTab(objLink, join.links);
                  });
               };

               fnAddTab(objBase, links);

               /** Grouping **/
               $$(ids.grouping).define("value", query.settings.grouping);
               $$(ids.grouping).refresh();

               /** Hide prefix label **/
               $$(ids.hidePrefix).define("value", query.settings.hidePrefix);
               $$(ids.hidePrefix).refresh();

               // remove a temporary tab
               $$(ids.tabObjects).removeView("temp");
               $$(ids.tabObjects).adjust();

               $$(ids.tabObjects).hideProgress({ type: "icon" });

               /** Filter **/
               _logic.refreshFilter();

               /** DataTable **/
               _logic.refreshDataTable();
            });
         },

         /**
          * @method getChildItems
          * Get items of tree view
          *
          * @param {uuid} objectId - id of ABObject
          * @param {uuid} parentItemId
          *
          * @return {Promise}
          */
         getChildItems(objectId, parentItemId) {
            let treeItems = {
               data: []
            };
            let objectResult;

            return (
               Promise.resolve()
                  // get object
                  .then(() => _logic.getObject(objectId))

                  // populate to tree values
                  .then((object) => {
                     // if (parentItemId) {
                     // 	var item = store.getItem(parentItemId);
                     // 	if (item.$level > $$(ids.depth).getValue())
                     // 		return;
                     // }

                     objectResult = object;

                     if (parentItemId) treeItems.parent = parentItemId;

                     let tasks = [];

                     // Loop to find object of the connect field
                     object.connectFields(true).forEach((f) => {
                        tasks.push(() => {
                           return new Promise((ok, error) => {
                              _logic
                                 .getObject(f.settings.linkObject)
                                 .catch(error)
                                 .then((objectLink) => {
                                    if (objectLink == null) return ok();

                                    let fieldID = f.id;

                                    // add items to tree
                                    var label = "#object# (#field#)"
                                       .replace("#object#", objectLink.label)
                                       .replace("#field#", f.label);

                                    treeItems.data.push({
                                       value: label, // a label of link object
                                       fieldID: fieldID,
                                       objectId: objectLink.id,
                                       objectLinkId: f.settings.linkObject,
                                       checked: false,
                                       disabled: false, // always enable
                                       open: false,

                                       webix_kids: true
                                    });

                                    ok();
                                 });
                           });
                        });
                     });

                     // action sequentially
                     return tasks.reduce((promiseChain, currTask) => {
                        return promiseChain.then(currTask);
                     }, Promise.resolve());
                  })

                  // Final - pass result
                  .then(() =>
                     Promise.resolve({
                        object: objectResult,
                        treeItems: treeItems
                     })
                  )
            );
         },

         /**
          * @method aliasName
          * get new alias name
          *
          * @return {string}
          */
         aliasName() {
            return OP.Util.uuid()
               .replace(/[^a-zA-Z0-9]+/g, "")
               .substring(0, 8);
         },

         /**
          * @method save
          * update settings of the current query and save to database
          *
          * @return {Promise}
          */
         save: (selctedFields = null) => {
            console.log("Changed **********************");

            return new Promise((resolve, reject) => {
               var $tree = $$(ids.tree);

               var objectBase = CurrentQuery.objectBase();

               /** joins **/
               let joins = {
                  alias: "BASE_OBJECT",
                  objectID: objectBase.id, // the base object of the join
                  links: []
               };

               let lookupFields = {};

               let $checkedItem = $tree
                  .getChecked()
                  .map((id) => $tree.getItem(id))
                  .sort((a, b) => a.$level - b.$level);

               ($checkedItem || []).forEach(($treeItem) => {
                  // let field = CurrentQuery.fields(f => f.id == $treeItem.fieldID, true)[0];
                  // if (!field) return;

                  // alias name
                  let aliasName = $treeItem.alias;
                  if (!aliasName) {
                     aliasName = _logic.aliasName();
                     $tree.updateItem($treeItem.id, {
                        alias: aliasName
                     });
                  }

                  // pull the join type &&
                  let joinType = "innerjoin";
                  let $tabObject = $$(ids.tabObjects)
                     .getMultiview()
                     .getChildViews()
                     .filter((v) => v.config.id == aliasName)[0];
                  if ($tabObject) {
                     let $joinType = $tabObject.queryView({ name: "joinType" });
                     joinType = $joinType.getValue() || "innerjoin";
                  }

                  let links = joins.links, // default is links of base
                     newJoin = {
                        alias: aliasName,
                        fieldID: $treeItem.fieldID,
                        type: joinType,
                        links: []
                     };

                  if ($treeItem.$level > 1) {
                     // pull parent join
                     let parentId = $tree.getParentId($treeItem.id),
                        $parentItem = $tree.getItem(parentId);

                     links = lookupFields[$parentItem.alias].links;
                  }

                  // add new join into parent links
                  links.push(newJoin);

                  // cache join
                  lookupFields[aliasName] = newJoin;
               });

               CurrentQuery.importJoins(joins);

               /** fields **/
               if (selctedFields == null) {
                  selctedFields = $$(ids.datatable)
                     .config.columns.map((col) => {
                        // an array of field ids

                        // pull object by alias
                        let object = CurrentQuery.objectByAlias(col.alias);
                        if (!object) return;

                        let field = object.fields(
                           (f) => f.id == col.fieldID,
                           true
                        )[0];
                        if (!field) return;

                        // avoid add fields that not exists alias
                        if (
                           col.alias != "BASE_OBJECT" &&
                           CurrentQuery.links((l) => l.alias == col.alias)
                              .length < 1
                        )
                           return;

                        return {
                           alias: col.alias,
                           fieldID: col.fieldID
                        };
                     })
                     .filter((col) => col != null);
               }

               CurrentQuery.importFields(selctedFields);

               /** where **/
               CurrentQuery.where = DataFilter.getValue();

               /** depth **/
               // CurrentQuery.objectWorkspace.depth = $$(ids.depth).getValue();

               /** grouping **/
               CurrentQuery.settings = {
                  grouping: $$(ids.grouping).getValue(),
                  hidePrefix: $$(ids.hidePrefix).getValue()
               };

               // Save to db
               CurrentQuery.save()
                  .catch(reject)
                  .then(() => {
                     // refresh data
                     _logic.refreshDataTable();

                     resolve();
                  });
            });
         },

         checkObjectLink: (objId, isChecked) => {
            var $tree = $$(ids.tree);
            $tree.blockEvent(); // prevents endless loop

            var rootid = objId;
            if (isChecked) {
               // If check we want to check all of the parents as well
               while ($tree.getParentId(rootid)) {
                  rootid = $tree.getParentId(rootid);
                  if (rootid != objId) $tree.checkItem(rootid);
               }
            } else {
               // If uncheck we want to uncheck all of the child items as well.
               $tree.data.eachSubItem(rootid, function(item) {
                  if (item.id != objId) $tree.uncheckItem(item.id);
               });
            }

            // call save to db
            _logic.save().then(() => {
               // update UI -- add new tab
               this.populateQueryWorkspace(CurrentQuery);

               // // select tab
               // var tabbar = $$(ids.tabObjects).getTabbar();
               // tabbar.setValue(objectLink.id);
            });

            $tree.unblockEvent();
         },

         depthChange: function(newv, oldv) {
            // call save to db
            _logic.save().then(() => {
               this.populateQueryWorkspace(CurrentQuery);
            });
         },

         setSelectedFields: function(aliasName) {
            // *** Field double list ***
            let $viewDbl = $$(aliasName).queryView({ name: "fields" });
            if ($viewDbl) {
               let fieldIDs = CurrentQuery.fields(
                  (f) => f.alias == aliasName,
                  true
               ).map((f) => f.id);

               $viewDbl.setValue(fieldIDs);
            }
         },

         checkFields: function() {
            // pull check fields
            var fields = [];
            var $viewMultiview = $$(ids.tabObjects).getMultiview();
            $viewMultiview.getChildViews().forEach(($viewTab) => {
               let $viewDbl = $viewTab.queryView({ name: "fields" });
               if ($viewDbl && $viewDbl.getValue()) {
                  // pull an array of field's url
                  let selectedFields = $viewDbl
                     .getValue()
                     .split(",")
                     .map((fieldID) => {
                        return {
                           alias: $viewTab.config.aliasName,
                           fieldID: fieldID
                        };
                     });
                  fields = fields.concat(selectedFields);
               }
            });

            // keep same order of fields
            var orderFieldUrls = $$(ids.datatable).config.columns.map(
               (col) => col.fieldID
            );
            fields.sort((a, b) => {
               var indexA = orderFieldUrls.indexOf(a.fieldID),
                  indexB = orderFieldUrls.indexOf(b.fieldID);

               if (indexA < 0) indexA = 999;
               if (indexB < 0) indexB = 999;

               return indexA - indexB;
            });

            // CurrentQuery.importFields(fields);

            // call save to db
            _logic.save(fields).then(() => {
               // refresh columns of data table
               _logic.refreshDataTable();

               // refresh filter
               _logic.refreshFilter();
            });
         },

         /**
          * @function templateField()
          *	return UI of the object tab
          *
          * @param {JSON} option - {
          * 							object: ABObject [option],
          * 							field:  ABField [option],
          * 							joinType: 'string',
          * 							isTypeHidden: boolean
          * 						}
          *
          * @return {JSON}
          */
         templateField: function(option) {
            if (option.object == null && option.field == null)
               throw new Error("Invalid params");

            var object = option.object
               ? option.object
               : CurrentQuery.objects(
                    (obj) => obj.id == option.field.settings.linkObject
                 )[0];

            var fields = object
               .fields((f) => f.fieldSupportQuery(), true)
               .map((f) => {
                  return {
                     id: f.id,
                     value: f.label
                  };
               });

            var label = "#object#".replace("#object#", object.label);
            if (option.field) {
               label += " (#field#)".replace("#field#", option.field.label);
            }

            let aliasName = option.aliasName;

            return {
               header: label,
               body: {
                  id: aliasName,
                  aliasName: aliasName,
                  type: "space",
                  css: "bg-white",
                  rows: [
                     {
                        view: "select",
                        name: "joinType",
                        label: L(
                           "ab.object.querybuilder.joinRecordsBy",
                           "*Join records by"
                        ),
                        labelWidth: 200,
                        placeholder: "Choose a type of table join",
                        hidden: option.isTypeHidden == true,
                        value: option.joinType || "innerjoin",
                        options: [
                           {
                              id: "innerjoin",
                              value:
                                 "Returns records that have matching values in both tables (INNER JOIN)."
                           },
                           {
                              id: "left",
                              value:
                                 "Return all records from the left table, and the matched records from the right table (LEFT JOIN)."
                           },
                           {
                              id: "right",
                              value:
                                 "Return all records from the right table, and the matched records from the left table (RIGHT JOIN)."
                           },
                           {
                              id: "fullouterjoin",
                              value:
                                 "Return all records when there is a match in either left or right table (FULL JOIN)"
                           }
                        ],
                        on: {
                           onChange: function() {
                              _logic.save();
                           }
                        }
                     },
                     {
                        view: "dbllist",
                        name: "fields",
                        list: {
                           height: 300
                        },
                        labelLeft: "Available Fields",
                        labelRight: "Included Fields",
                        labelBottomLeft:
                           "Move these fields to the right to include in data set.",
                        labelBottomRight:
                           "These fields will display in your final data set.",
                        data: fields,
                        on: {
                           onChange: function() {
                              _logic.checkFields();
                           }
                        }
                     },
                     { fillspace: true }
                  ]
               }
            };
         },

         refreshTree: function() {
            return new Promise((resolve, reject) => {
               // Relationship Depth
               // $$(ids.depth).blockEvent(); // prevents endless loop

               // if (CurrentQuery.objectWorkspace.depth) {
               // 	$$(ids.depth).setValue(CurrentQuery.objectWorkspace.depth);
               // } else {
               // 	$$(ids.depth).setValue(5);
               // }

               // $$(ids.depth).unblockEvent();

               let fnCheckItem = (treeStore, object, links, parentId) => {
                  (links || []).forEach((link) => {
                     // NOTE: query v1
                     if (link.objectURL) {
                        object = CurrentApplication.urlResolve(link.objectURL);
                        parentId = undefined;
                     } else {
                        parentId = parentId || 0;
                     }

                     if (!object) return;

                     let field = object.fields(
                        (f) => f.id == link.fieldID,
                        true
                     )[0];
                     if (!field) return;

                     let findCond = {
                        fieldID: field.id
                     };
                     if (parentId != null) {
                        findCond.$parent = parentId;
                     }

                     let $item = null;
                     (treeStore.find(findCond) || []).forEach((item) => {
                        if (item.$parent) {
                           // select item who has parent is checked
                           let parentItem = treeStore.getItem(item.$parent);
                           if (parentItem && parentItem.checked) $item = item;
                        } else {
                           $item = item;
                        }
                     });

                     // update check status
                     if ($item) {
                        treeStore.updateItem($item.id, {
                           alias: link.alias,
                           checked: true,
                           open: true
                        });

                        _logic
                           .getChildItems(field.settings.linkObject, $item.id)
                           .then((result) => {
                              $$(ids.tree).parse(result.treeItems);

                              fnCheckItem(
                                 treeStore,
                                 result.object,
                                 link.links,
                                 $item.id
                              );
                           });
                     }
                  });
               };

               let objBase = CurrentQuery.objectBase();
               let links = CurrentQuery.joins().links || [];

               // set connected objects:
               $$(ids.tree).clearAll();

               // show loading cursor
               $$(ids.tree).showProgress({ type: "icon" });

               // NOTE: render the tree component in Promise to prevent freeze UI.
               // populate tree store
               if (objBase) {
                  _logic
                     .getChildItems(objBase.id)
                     .catch(reject)
                     .then((result) => {
                        $$(ids.tree).parse(result.treeItems);

                        fnCheckItem($$(ids.tree), objBase, links);

                        // show loading cursor
                        $$(ids.tree).hideProgress({ type: "icon" });

                        resolve();
                     });
               }
            });
         },

         refreshFilter: function() {
            DataFilter.applicationLoad(
               CurrentQuery ? CurrentQuery.application : null
            );
            DataFilter.fieldsLoad(
               CurrentQuery ? CurrentQuery.fields() : [],
               CurrentQuery
            );
            DataFilter.setValue(CurrentQuery.where);
         },

         refreshDataTable: function() {
            if (CurrentDatacollection == null) return;

            console.log("Refresh data table *******");

            let DataTable = $$(ids.datatable);
            DataTable.clearAll();

            // set columns:
            var columns = CurrentQuery.columnHeaders(false, false);
            DataTable.refreshColumns(columns);

            let qCurrentView = CurrentQuery.workspaceViews.getCurrentView();

            CurrentDatacollection.clearAll();
            CurrentDatacollection.datasource = CurrentQuery;

            // Set filter and sort conditions
            CurrentDatacollection.fromValues({
               query: [CurrentQuery.toObj()],
               settings: {
                  datasourceID: CurrentQuery.id,
                  objectWorkspace: {
                     //// NOTE: the .where condition is already part of the
                     //// query definition, so we don't want to pass it again
                     //// as part of the workspace filter conditions.
                     // filterConditions: null,  // qCurrentView.filterConditions,
                     sortFields: qCurrentView.sortFields
                  }
               }
            });
            CurrentDatacollection.datasource = CurrentQuery;

            // Bind datatable view to data view
            CurrentDatacollection.unbind(DataTable);
            CurrentDatacollection.bind(DataTable);

            // set data:
            CurrentDatacollection.loadData(0, 50, () => {}).then(() =>
               CurrentDatacollection.bind(DataTable)
            );
            // CurrentQuery.model().findAll({ limit: 20, where: CurrentQuery.workspaceViews.getCurrentView().filterConditions, sort: CurrentQuery.workspaceViews.getCurrentView().sortFields })
            // 	.then((response) => {

            // 		DataTable.clearAll();

            // 		response.data.forEach((d) => {
            // 			DataTable.add(d);
            // 		})
            // 	})
            // 	.catch((err) => {
            // 		OP.Error.log('Error running Query:', { error: err, query: CurrentQuery });
            // 	});
         },

         getObject: (objectId) => {
            return new Promise((resolve, reject) => {
               // Find object in this query
               let objectLink = CurrentQuery.objects(
                  (obj) => obj.id == objectId
               )[0];
               if (objectLink) return resolve(objectLink);

               // Find object from our complete list of Objects
               objectLink = CurrentQuery.application.objects(
                  (obj) => obj.id == objectId
               )[0];
               if (objectLink) return resolve(objectLink);

               // Find object from database
               // CurrentQuery.application
               //    .objectGet(objectId)
               //    .catch(reject)
               //    .then((obj) => {
               //       objectLink = obj;
               //       resolve(objectLink);
               //    });
            });
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();
         }
      };
      this._logic = _logic;

      // Our webix UI definition:
      this.ui = {
         view: "multiview",
         id: ids.component,
         rows: [
            {
               id: ids.selectedObject,
               type: "form",
               rows: [
                  {
                     cols: [
                        {
                           rows: [
                              {
                                 view: "label",
                                 label: L(
                                    "ab.object.querybuilder.manageObjects",
                                    "*Manage Objects"
                                 ),
                                 css: "ab-query-label"
                                 // height: 50
                              },
                              // {
                              // 	autowidth: true,
                              // 	css: "bg-gray",
                              // 	cols: [
                              // 		{},
                              // 		{
                              // 			id: ids.depth,
                              // 			view: "counter",
                              // 			label: L('ab.object.querybuilder.relationshipDepth', "*Relationship Depth"),
                              // 			width: 270,
                              // 			labelWidth: 165,
                              // 			step: 1,
                              // 			value: 5,
                              // 			min: 1,
                              // 			max: 10,
                              // 			on: {
                              // 				onChange: function (newv, oldv) {
                              // 					_logic.depthChange(newv, oldv);
                              // 				}
                              // 			}
                              // 		},
                              // 		{}
                              // 	]
                              // },
                              {
                                 view: "tree",
                                 id: ids.tree,
                                 css: "ab-tree",
                                 template:
                                    "{common.icon()} {common.checkbox()} #value#",
                                 data: [],
                                 on: {
                                    onItemClick: function(id, event, item) {
                                       if (this.getItem(id).disabled) return;

                                       if (this.isChecked(id)) {
                                          this.uncheckItem(id);
                                       } else {
                                          this.checkItem(id);
                                       }
                                    },
                                    onItemCheck: function(
                                       id,
                                       isChecked,
                                       event
                                    ) {
                                       _logic.checkObjectLink(id, isChecked);
                                    },
                                    onBeforeOpen: function(id) {
                                       let item = this.getItem(id);
                                       if (item.$count === -1) {
                                          $$(ids.tree).showProgress({
                                             type: "icon"
                                          });

                                          _logic
                                             .getChildItems(
                                                item.objectLinkId,
                                                id
                                             )
                                             .then((result) => {
                                                $$(ids.tree).parse(
                                                   result.treeItems
                                                );
                                                $$(ids.tree).hideProgress();
                                             });
                                       }
                                    }
                                 }
                              }
                           ]
                        },
                        {
                           width: 20
                        },
                        {
                           gravity: 2,
                           rows: [
                              {
                                 view: "label",
                                 label: L(
                                    "ab.object.querybuilder.manageFields",
                                    "*Manage Fields"
                                 ),
                                 css: "ab-query-label"
                                 // height: 50
                              },
                              {
                                 view: "tabview",
                                 id: ids.tabObjects,
                                 tabMinWidth: 180,
                                 tabbar: {
                                    bottomOffset: 1
                                 },
                                 cells: [
                                    {} // require
                                 ],
                                 multiview: {
                                    on: {
                                       onViewChange: function(prevId, nextId) {
                                          let aliasName = nextId; // tab id

                                          _logic.setSelectedFields(aliasName);
                                       }
                                    }
                                 }
                              }
                           ]
                        }
                     ]
                  },
                  // grouping
                  {
                     id: ids.grouping,
                     view: "checkbox",
                     label: L("ab.object.querybuilder.grouping", "*Grouping"),
                     labelWidth: App.config.labelWidthXLarge,
                     on: {
                        onChange: () => {
                           _logic.save();
                        }
                     }
                  },
                  // hide prefix labels
                  {
                     id: ids.hidePrefix,
                     view: "checkbox",
                     label: L(
                        "ab.object.querybuilder.hidePrefix",
                        "*Hide prefix labels"
                     ),
                     labelWidth: App.config.labelWidthXLarge,
                     on: {
                        onChange: () => {
                           _logic.save();
                        }
                     }
                  },
                  // filter
                  {
                     view: "label",
                     label: L(
                        "ab.object.querybuilder.manageFilters",
                        "*Manage Filters"
                     ),
                     css: "ab-query-label"
                     // height: 50
                  },
                  DataFilter.ui,
                  {
                     id: ids.datatable,
                     view: "treetable",
                     minHeight: 280,
                     dragColumn: true,
                     columns: [],
                     data: [],
                     on: {
                        onAfterColumnDrop: () => {
                           _logic.save();
                        }
                     }
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
};
