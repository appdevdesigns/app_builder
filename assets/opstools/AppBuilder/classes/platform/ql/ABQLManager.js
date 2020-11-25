/*
 * ABQLManager
 *
 * An interface for managing the different ABQL Operations available in our
 * AppBuilder.
 *
 */

const ABQLManagerCore = require("../../core/ql/ABQLManagerCore.js");

var ABQLManager = {
   /**
    * @method fromAttributes()
    * return an {ABQL} object that represents the given attributes that
    * were saved from the previous .toObj()
    * @param {object} attributes
    *		  the values returned from the previous .toObj() call
    * @param {ABProcessTask***} task
    *		  the current ABProcessTaskServiceQuery that contains this QL
    * @param {ABApplication} application
    *		  the current ABApplication we are operating under.
    * @return {ABQL} | null
    */
   fromAttributes: ABQLManagerCore.fromAttributes,

   /**
    * @method ids()
    * return a set of unique webix ids for the ui portions of this object.
    * @param {string} id
    *		  the webix base id of the parameters panel.
    * @return {object}
    */
   ids: function(id) {
      return {
         root: `${id}_root`,
         select: `${id}_root_select`,
         options: `${id}_root_options`
      };
   },

   /**
    * @method builder
    * return a UI component like object that will display the QL builder.
    * The component will support:
    *		.ui(id) : returns a webix ui definition for the current builder
    *		.init(id) : performs any special actions to prepare the webix ui
    * @param {object} rootOP
    *		  the root ABQLxxxx operation
    * @param {ABProcessTask***} task
    *		  the current Process Task that is requesting the data.
    * @param {ABApplication} application
    *		  the ABApplication object that is currently active.
    * @return {object}
    */
   builder: function(rootOP, task, application) {
      // var rootOP = this.fromAttributes(attributes, task, application);

      return {
         ui: function(id) {
            var options = [{ id: 0, value: "choose Root" }];
            ABQLManagerCore.QLOps.forEach((op) => {
               options.push({ id: op.key, value: op.label });
            });

            var ids = ABQLManager.ids(id);
            var ui = {
               rows: [
                  {
                     view: "label",
                     label: "Query:"
                  },
                  {
                     id: ids.root,
                     cols: [
                        {
                           id: ids.select,
                           view: "select",
                           value: rootOP ? rootOP.constructor.key : 0,
                           options: options,
                           on: {
                              onChange: (newValue, oldValue) => {
                                 function resetValue() {
                                    var select = $$(ids.select);
                                    select.blockEvent();
                                    select.setValue(oldValue);
                                    select.unblockEvent();
                                 }
                                 if (newValue == oldValue) {
                                    return;
                                 }
                                 var newOP = ABQLManagerCore.QLOps.find(
                                    (op) => {
                                       return op.key == newValue;
                                    }
                                 );
                                 if (!newOP) {
                                    resetValue();
                                    return;
                                 }
                                 function addOP() {
                                    if (newOP) {
                                       rootOP = new newOP(
                                          {},
                                          task,
                                          application
                                       );
                                       rootOP.viewAddParams(id, $$(ids.root));
                                       rootOP.viewAddNext(
                                          id,
                                          $$(ids.root).getParentView()
                                       );
                                    }
                                 }
                                 var topEntry = $$(ids.root).getParentView();
                                 var allRows = topEntry.getChildViews();
                                 if (allRows.length > 2) {
                                    webix.confirm({
                                       title: "continue?",
                                       text:
                                          "changing this rule will reset any following rules.",
                                       ok: "yes",
                                       cancel: "no",
                                       callback: (result) => {
                                          if (result) {
                                             // remove the current additional Rows:
                                             var thisView = $$(ids.root);
                                             var ir = allRows.length - 1;
                                             while (
                                                allRows[ir].config.id !=
                                                thisView.config.id
                                             ) {
                                                topEntry.removeView(
                                                   allRows[ir]
                                                );
                                                ir--;
                                             }

                                             // now remove the parameters
                                             var allCols = thisView.getChildViews();
                                             var ic = allCols.length;
                                             while (ic > 1) {
                                                thisView.removeView(
                                                   allCols[ic - 1]
                                                );
                                                ic--;
                                             }

                                             addOP();
                                          } else {
                                             resetValue();
                                          }
                                       }
                                    });
                                 } else {
                                    addOP();
                                 } // if allRows.length > 2
                              } // onChange
                           }
                        }
                     ]
                  }
               ]
            };

            if (rootOP) {
               rootOP.uiAddParams(id, ui);
               rootOP.uiAddNext(id, ui);
            }

            return ui;
         },
         init: function(id) {}
      };
   },

   /**
    * @method parse
    * step through the current properties panel and decode the QL objects
    * and their parameters.
    * Return the .toOBJ() attributes definition as a result.
    * @param {string} id
    *		  the webix base id of the parameters panel.
    * @param {ABProcessTask***} task
    *		  the current Process Task that is requesting the data.
    * @param {ABApplication} application
    *		  the ABApplication object that is currently active.
    * @return {object}
    */
   parse: function(id, task, application) {
      var ids = ABQLManager.ids(id);
      var root = $$(ids.root);

      if (!root) {
         console.warn("ABQLManager.parse(): unable to find root element");
         return;
      }

      // get all the input rows
      var rows = root.getParentView().getChildViews();
      rows.shift(); // remove the query label row:

      function parseCurrent(rows, options, prevOP) {
         if (rows.length == 0) {
            return null;
         }
         var row = rows.shift();

         // get which operation was selected
         // find the operation selector (skip any indents)
         var views = row.getChildViews();
         var selector = views.shift();
         while (!selector.getValue) {
            selector = views.shift();
         }
         var value = selector.getValue();

         // figure out the QLOP object
         var OP = options.find((o) => {
            return o.key == value;
         });
         if (OP) {
            var currOP = null;
            if (prevOP) {
               currOP = new OP({}, prevOP, task, application);
            } else {
               currOP = new OP({}, task, application);
            }

            // now get currOP to initialize from it's parameters:
            currOP.parseRow(row, id);

            // carry forward any .object info if not already established
            // by the .parseRow():
            if (!currOP.object && prevOP) {
               currOP.object = prevOP.object;
               currOP.objectID = currOP.object ? currOP.object.id : null;
            }

            var nextRow = parseCurrent(
               rows,
               currOP.constructor.NextQLOps,
               currOP
            );
            currOP.next = nextRow;
            return currOP;
         }
         return null;
      }
      var operation = parseCurrent(rows, ABQLManagerCore.QLOps, null);
      return operation;
   }
};
module.exports = ABQLManager;
