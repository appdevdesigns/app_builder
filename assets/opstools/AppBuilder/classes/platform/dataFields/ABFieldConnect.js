var ABFieldConnectCore = require("../../core/dataFields/ABFieldConnectCore");
var ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

var ids = {
   linkObject: "ab-new-connectObject-list-item",
   objectCreateNew: "ab-new-connectObject-create-new",

   fieldLink: "ab-add-field-link-from",
   fieldLink2: "ab-add-field-link-from-2",
   linkType: "ab-add-field-link-type-to",
   linkViaType: "ab-add-field-link-type-from",
   fieldLinkVia: "ab-add-field-link-to",
   fieldLinkVia2: "ab-add-field-link-to-2",

   link1: "ab-link1-field-options",
   link2: "ab-link2-field-options",

   isCustomFK: "ab-is-custom-fk",
   indexField: "ab-index-field",
   indexField2: "ab-index-field2",

   connectDataPopup: "ab-connect-object-data-popup"
};

var defaultValues = ABFieldConnectCore.defaultValues();

function populateSelect(populate, callback) {
   var options = [];
   ABFieldConnectComponent.CurrentApplication.objectsIncluded().forEach((o) => {
      options.push({ id: o.id, value: o.label });
   });

   // sort by object's label  A -> Z
   options.sort((a, b) => {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
   });

   $$(ids.linkObject).define("options", options);
   $$(ids.linkObject).refresh();
   if (populate != null && populate == true) {
      $$(ids.linkObject).setValue(options[options.length - 1].id);
      $$(ids.linkObject).refresh();
      var selectedObj = $$(ids.linkObject)
         .getList()
         .getItem(options[options.length - 1].id);
      if (selectedObj) {
         var selectedObjLabel = selectedObj.value;
         $$(ids.fieldLinkVia).setValue(
            L(
               "ab.dataField.connectObject.selectedObject",
               "*<b>#selectedObjLabel#</b> entry."
            ).replace("#selectedObjLabel#", selectedObjLabel)
         );
         $$(ids.fieldLinkVia2).setValue(
            L(
               "ab.dataField.connectObject.connectWith",
               "*Each <b>#selectedObjLabel#</b> entry connects with"
            ).replace("#selectedObjLabel#", selectedObjLabel)
         );
         $$(ids.link1).show();
         $$(ids.link2).show();
      }
      callback();
   }
}

/**
 * ABFieldConnectComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldConnectComponent = new ABFieldComponent({
   fieldDefaults: ABFieldConnectCore.defaults(),

   elements: (App, field) => {
      ids = field.idsUnique(ids, App);

      return [
         {
            view: "richselect",
            label: L(
               "ab.dataField.connectObject.connectToObject",
               "*Connected to:"
            ),
            id: ids.linkObject,
            disallowEdit: true,
            name: "linkObject",
            labelWidth: App.config.labelWidthLarge,
            placeholder: L(
               "ab.dataField.connectObject.connectToObjectPlaceholder",
               "*Select object"
            ),
            options: [],
            // select: true,
            // height: 140,
            // template: "<div class='ab-new-connectObject-list-item'>#label#</div>",
            on: {
               onChange: (newV, oldV) => {
                  ABFieldConnectComponent.logic.selectObjectTo(newV, oldV);
               }
            }
         },
         {
            view: "button",
            css: "webix_primary",
            id: ids.objectCreateNew,
            disallowEdit: true,
            value: L(
               "ab.dataField.connectObject.connectToNewObject",
               "*Connect to new Object"
            ),
            click: () => {
               ABFieldConnectComponent.logic.clickNewObject();
            }
         },
         {
            view: "layout",
            id: ids.link1,
            hidden: true,
            cols: [
               {
                  id: ids.fieldLink,
                  view: "label",
                  width: 300
               },
               {
                  id: ids.linkType,
                  disallowEdit: true,
                  name: "linkType",
                  view: "richselect",
                  value: defaultValues.linkType,
                  width: 95,
                  options: [
                     {
                        id: "many",
                        value: L("ab.dataField.connectObject.hasMany", "*many")
                     },
                     {
                        id: "one",
                        value: L("ab.dataField.connectObject.belongTo", "*one")
                     }
                  ],
                  on: {
                     onChange: (newValue, oldValue) => {
                        ABFieldConnectComponent.logic.selectLinkType(
                           newValue,
                           oldValue
                        );
                     }
                  }
               },
               {
                  id: ids.fieldLinkVia,
                  view: "label",
                  label: L(
                     "ab.dataField.connectObject.selectedObject",
                     "*<b>#selectedObjLabel#</b> entry."
                  ).replace("#selectedObjLabel#", "[Select object]"),
                  width: 200
               }
            ]
         },
         {
            view: "layout",
            id: ids.link2,
            hidden: true,
            cols: [
               {
                  id: ids.fieldLinkVia2,
                  view: "label",
                  label: L(
                     "ab.dataField.connectObject.connectWith",
                     "Each <b>#selectedObjLabel#</b> entry connects with"
                  ).replace("#selectedObjLabel#", "[Select object]"),
                  width: 300
               },
               {
                  id: ids.linkViaType,
                  name: "linkViaType",
                  disallowEdit: true,
                  view: "richselect",
                  value: defaultValues.linkViaType,
                  width: 95,
                  options: [
                     {
                        id: "many",
                        value: L("ab.dataField.connectObject.hasMany", "*many")
                     },
                     {
                        id: "one",
                        value: L("ab.dataField.connectObject.belongTo", "*one")
                     }
                  ],
                  on: {
                     onChange: (newV, oldV) => {
                        ABFieldConnectComponent.logic.selectLinkViaType(
                           newV,
                           oldV
                        );
                     }
                  }
               },
               {
                  id: ids.fieldLink2,
                  view: "label",
                  width: 200
               }
            ]
         },
         {
            name: "linkColumn",
            view: "text",
            hidden: true
         },
         {
            name: "isSource",
            view: "text",
            hidden: true
         },
         {
            id: ids.isCustomFK,
            name: "isCustomFK",
            view: "checkbox",
            disallowEdit: true,
            labelWidth: 0,
            labelRight: L(
               "ab.dataField.connectObject.isCustomFK",
               "*Custom Foreign Key"
            ),
            hidden: true,
            on: {
               onChange: () => {
                  ABFieldConnectComponent.logic.checkCustomFK();
               }
            }
         },
         {
            id: ids.indexField,
            name: "indexField",
            view: "richselect",
            disallowEdit: true,
            hidden: true,
            labelWidth: App.config.labelWidthLarge,
            label: L("ab.dataField.connectObject.indexField", "*Index Field:"),
            placeholder: L(
               "ab.dataField.connectObject.indexFieldPlaceholder",
               "*Select index field"
            ),
            options: []
            // on: {
            //    onChange: () => {
            //       ABFieldConnectComponent.logic.updateColumnName();
            //    }
            // }
         },
         {
            id: ids.indexField2,
            name: "indexField2",
            view: "richselect",
            disallowEdit: true,
            hidden: true,
            labelWidth: App.config.labelWidthLarge,
            label: L("ab.dataField.connectObject.indexField", "*Index Field:"),
            placeholder: L(
               "ab.dataField.connectObject.indexFieldPlaceholder",
               "*Select index field"
            ),
            options: []
         }
      ];
   },

   // defaultValues: the keys must match a .name of your elements to set it's default value.
   defaultValues: defaultValues,

   // rules: basic form validation rules for webix form entry.
   // the keys must match a .name of your .elements for it to apply
   rules: {},

   // include additional behavior on default component operations here:
   // The base routines will be processed first, then these.  Any results
   // from the base routine, will be passed on to these:
   logic: {
      applicationLoad: (application) => {
         ABFieldConnectComponent.CurrentApplication = application;
      },

      objectLoad: (object) => {
         ABFieldConnectComponent.CurrentObject = object;
      },

      clear: (ids) => {
         // $$(ids.linkObject).unselectAll();
         $$(ids.linkObject).setValue(defaultValues.linkObject);
      },

      isValid: (ids, isValid) => {
         // validate require select linked object
         var selectedObjId = $$(ids.linkObject).getValue();
         if (!selectedObjId) {
            webix.html.addCss($$(ids.linkObject).$view, "webix_invalid");
            isValid = false;
         } else {
            webix.html.removeCss($$(ids.linkObject).$view, "webix_invalid");
         }

         return isValid;
      },

      show: (pass_ids) => {
         // add objects to list
         // $$(pass_ids.linkObject).clearAll();
         // $$(pass_ids.linkObject).parse(ABFieldConnectComponent.CurrentApplication.objects());
         populateSelect(false);

         // show current object name
         $$(ids.fieldLink).setValue(
            L(
               "ab.dataField.connectObject.connectWith",
               "*Each <b>#selectedObjLabel#</b> entry connects with"
            ).replace(
               "#selectedObjLabel#",
               ABFieldConnectComponent.CurrentObject.label
            )
         );
         $$(ids.fieldLink2).setValue(
            L(
               "ab.dataField.connectObject.selectedObject",
               "*<b>#selectedObjLabel#</b> entry."
            ).replace(
               "#selectedObjLabel#",
               ABFieldConnectComponent.CurrentObject.label
            )
         );

         // keep the column name element to use when custom index is checked
         ABFieldConnectComponent._$columnName = $$(pass_ids.columnName);
         ABFieldConnectComponent.logic.updateCustomIndex();
      },

      populate: (ids, values) => {},

      values: (ids, values) => {
         return values;
      },

      selectObjectTo: (newValue, oldValue) => {
         if (!newValue) {
            $$(ids.link1).hide();
            $$(ids.link2).hide();
         }
         if (newValue == oldValue || newValue == "") return;

         let selectedObj = $$(ids.linkObject)
            .getList()
            .getItem(newValue);
         if (!selectedObj) return;

         let selectedObjLabel = selectedObj.value;
         $$(ids.fieldLinkVia).setValue(
            L(
               "ab.dataField.connectObject.selectedObject",
               "*<b>#selectedObjLabel#</b> entry."
            ).replace("#selectedObjLabel#", selectedObjLabel)
         );
         $$(ids.fieldLinkVia2).setValue(
            L(
               "ab.dataField.connectObject.connectWith",
               "*Each <b>#selectedObjLabel#</b> entry connects with"
            ).replace("#selectedObjLabel#", selectedObjLabel)
         );
         $$(ids.link1).show();
         $$(ids.link2).show();

         ABFieldConnectComponent.logic.updateCustomIndex();
      },

      clickNewObject: () => {
         if (!App.actions.addNewObject) return;

         async.series(
            [
               function(callback) {
                  App.actions.addNewObject(false, callback); // pass false because after it is created we do not want it to select it in the object list
               },
               function(callback) {
                  populateSelect(true, callback); // pass true because we want it to select the last item in the list that was just created
               }
            ],
            function(err) {
               // console.log('all functions complete')
            }
         );
      },

      selectLinkType: (newValue, oldValue) => {
         let labelEntry = L("ab.dataField.connectObject.entry", "*entry");
         let labelEntries = L("ab.dataField.connectObject.entries", "*entries");

         let message = $$(ids.fieldLinkVia).getValue() || "";

         if (newValue == "many") {
            message = message.replace(labelEntry, labelEntries);
         } else {
            message = message.replace(labelEntries, labelEntry);
         }
         $$(ids.fieldLinkVia).define("label", message);
         $$(ids.fieldLinkVia).refresh();

         ABFieldConnectComponent.logic.updateCustomIndex();
      },

      selectLinkViaType: (newValue, oldValue) => {
         let labelEntry = L("ab.dataField.connectObject.entry", "*entry");
         let labelEntries = L("ab.dataField.connectObject.entries", "*entries");

         let message = $$(ids.fieldLink2).getValue() || "";

         if (newValue == "many") {
            message = message.replace(labelEntry, labelEntries);
         } else {
            message = message.replace(labelEntries, labelEntry);
         }
         $$(ids.fieldLink2).define("label", message);
         $$(ids.fieldLink2).refresh();

         ABFieldConnectComponent.logic.updateCustomIndex();
      },

      checkCustomFK: () => {
         $$(ids.indexField).hide();
         $$(ids.indexField2).hide();

         let isChecked = $$(ids.isCustomFK).getValue();
         if (isChecked) {
            let menuItems = $$(ids.indexField).getList().config.data;
            if (menuItems && menuItems.length) {
               $$(ids.indexField).show();
            }

            let menuItems2 = $$(ids.indexField2).getList().config.data;
            if (menuItems2 && menuItems2.length) {
               $$(ids.indexField2).show();
            }
         }

         // ABFieldConnectComponent.logic.updateColumnName();
      },

      updateCustomIndex: () => {
         let linkObjectId = $$(ids.linkObject).getValue();
         let linkType = $$(ids.linkType).getValue();
         let linkViaType = $$(ids.linkViaType).getValue();

         let sourceObject = null; // object stores index column
         let linkIndexes = null; // the index fields of link object M:N

         $$(ids.indexField2).define("options", []);
         $$(ids.indexField2).refresh();

         // 1:1
         // 1:M
         if (
            (linkType == "one" && linkViaType == "one") ||
            (linkType == "one" && linkViaType == "many")
         ) {
            sourceObject = ABFieldConnectComponent.CurrentApplication.objects(
               (o) => o.id == linkObjectId
            )[0];
         }
         // M:1
         else if (linkType == "many" && linkViaType == "one") {
            sourceObject = ABFieldConnectComponent.CurrentObject;
         }
         // M:N
         else if (linkType == "many" && linkViaType == "many") {
            sourceObject = ABFieldConnectComponent.CurrentObject;

            let linkObject = ABFieldConnectComponent.CurrentApplication.objects(
               (o) => o.id == linkObjectId
            )[0];

            // Populate the second index fields
            let linkIndexFields = [];
            linkIndexes = linkObject.indexes((idx) => idx.unique);
            (linkIndexes || []).forEach((idx) => {
               (idx.fields || []).forEach((f) => {
                  if (
                     (!f ||
                        !f.settings ||
                        !f.settings.required ||
                        linkIndexFields.filter((opt) => opt.id == f.id)
                           .length) &&
                     f.key != "AutoIndex" &&
                     f.key != "combined"
                  )
                     return;

                  linkIndexFields.push({
                     id: f.id,
                     value: f.label
                  });
               });
            });
            $$(ids.indexField2).define("options", linkIndexFields);
            $$(ids.indexField2).refresh();
         }

         $$(ids.indexField).hide();
         $$(ids.indexField2).hide();

         if (!sourceObject) {
            $$(ids.isCustomFK).hide();
            return;
         }

         let indexes = sourceObject.indexes((idx) => idx.unique);
         if (
            (!indexes || indexes.length < 1) &&
            (!linkIndexes || linkIndexes.length < 1)
         ) {
            $$(ids.isCustomFK).hide();
            $$(ids.indexField).define("options", []);
            $$(ids.indexField).refresh();
            return;
         }

         let indexFields = [];
         (indexes || []).forEach((idx) => {
            (idx.fields || []).forEach((f) => {
               if (
                  (!f ||
                     !f.settings ||
                     !f.settings.required ||
                     indexFields.filter((opt) => opt.id == f.id).length) &&
                  f.key != "AutoIndex" &&
                  f.key != "combined"
               )
                  return;

               indexFields.push({
                  id: f.id,
                  value: f.label,
                  field: f
               });
            });
         });
         $$(ids.indexField).define("options", indexFields);
         $$(ids.indexField).refresh();

         if (indexFields && indexFields.length) {
            $$(ids.isCustomFK).show();
         }

         ABFieldConnectComponent.logic.checkCustomFK();
      }

      // updateColumnName: () => {
      //    let isChecked = $$(ids.isCustomFK).getValue();
      //    let indexFieldId = $$(ids.indexField).getValue();
      //    let indexFieldOpt = (
      //       $$(ids.indexField).getList().config.data || []
      //    ).filter((opt) => opt.id == indexFieldId)[0];

      //    if (isChecked && indexFieldOpt && indexFieldOpt.field) {
      //       // Disable & Update the column name
      //       if (ABFieldConnectComponent._$columnName) {
      //          let linkObjectId = $$(ids.linkObject).getValue();
      //          let linkObject = ABFieldConnectComponent.CurrentApplication.objects(
      //             (o) => o.id == linkObjectId
      //          )[0];
      //          if (linkObject) {
      //             ABFieldConnectComponent._$columnName.setValue(
      //                `${linkObject.name}.${indexFieldOpt.field.columnName}`
      //             );
      //          }
      //          ABFieldConnectComponent._$columnName.disable();
      //       }
      //    } else {
      //       // Enable the column name element
      //       if (ABFieldConnectComponent._$columnName) {
      //          ABFieldConnectComponent._$columnName.enable();
      //       }
      //    }
      // }
   }
});

module.exports = class ABFieldConnect extends ABFieldConnectCore {
   constructor(values, object) {
      super(values, object);
   }

   /*
    * @function propertiesComponent
    *
    * return a UI Component that contains the property definitions for this Field.
    *
    * @param {App} App the UI App instance passed around the Components.
    * @param {stirng} idBase
    * @return {Component}
    */
   static propertiesComponent(App, idBase) {
      return ABFieldConnectComponent.component(App, idBase);
   }

   /**
    * @method destroy()
    *
    * destroy the current instance of ABApplication
    *
    * also remove it from our _AllApplications
    *
    * @return {Promise}
    */
   destroy() {
      return new Promise((resolve, reject) => {
         // verify we have been .save()d before:
         if (this.id) {
            // NOTE: our .migrateXXX() routines expect the object to currently exist
            // in the DB before we perform the DB operations.  So we need to
            // .migrateDrop()  before we actually .objectDestroy() this.
            // this.migrateDrop()
            //    // .then(() => {
            //    //    // NOTE : prevent recursive remove connected fields
            //    //    // - remove this field from JSON
            //    //    this.object._fields = this.object.fields((f) => {
            //    //       return f.id != this.id;
            //    //    });
            //    // })
            //    .then(() => {
            //       // Save JSON of the object
            //       return this.object.fieldRemove(this);
            //    })
            super
               .destroy()
               .then(() => {
                  // Now we need to remove our linked Object->field

                  var linkObject = this.datasourceLink;
                  if (!linkObject) return Promise.resolve(); // TODO: refactor in v2

                  var linkField = this.fieldLink;
                  if (!linkField) return Promise.resolve(); // TODO: refactor in v2

                  // destroy linked field
                  return linkField.destroy();
               })
               .then(resolve)
               .catch(reject);
         } else {
            resolve(); // nothing to do really
         }
      });
   }

   ///
   /// Working with Actual Object Values:
   ///

   /**
    * @method pullRelationValues
    *
    * On the Web client, we want our returned relation values to be
    * ready for Webix objects that require a .text field.
    *
    * @param {*} row
    * @return {array}
    */
   pullRelationValues(row) {
      var selectedData = [];

      var data = super.pullRelationValues(row);
      var linkedObject = this.datasourceLink;

      if (data && linkedObject) {
         // if this select value is array
         if (data.map) {
            selectedData = data.map(function(d) {
               // display label in format
               if (d) d.text = d.text || linkedObject.displayData(d);

               return d;
            });
         } else if (data.id || data.uuid) {
            selectedData = data;
            selectedData.text =
               selectedData.text || linkedObject.displayData(selectedData);
         }
      }

      return selectedData;
   }

   // return the grid column header definition for this instance of ABFieldConnect
   columnHeader(options) {
      options = options || {};

      var config = super.columnHeader(options);
      var field = this;
      var App = App;

      var width = options.width,
         editable = options.editable;

      config.template = (row) => {
         if (row.$group) return row[field.columnName];

         var node = document.createElement("div");
         node.classList.add("connect-data-values");
         if (typeof width != "undefined") {
            node.style.marginLeft = width + "px";
         }

         var domNode = node;

         var multiselect = field.settings.linkType == "many";

         var placeholder = L(
            "ab.dataField.connect.placeholder_single",
            "*Select item"
         );
         if (multiselect) {
            placeholder = L(
               "ab.dataField.connect.placeholder_multiple",
               "*Select items"
            );
         }
         var readOnly = false;
         if (editable != null && !editable) {
            readOnly = true;
            placeholder = "";
         }

         // var domNode = node.querySelector('.list-data-values');

         // get selected values
         var selectedData = field.pullRelationValues(row);

         var multiselect = field.settings.linkType == "many";

         // Render selectivity
         if (!options.skipRenderSelectivity) {
            field.selectivityRender(
               domNode,
               {
                  multiple: multiselect,
                  readOnly: readOnly,
                  editPage: options.editPage,
                  placeholder: placeholder,
                  data: selectedData
               },
               App,
               row
            );
         }

         return domNode.outerHTML;
      };

      return config;
   }

   /*
    * @function customDisplay
    * perform any custom display modifications for this field.
    * @param {object} row is the {name=>value} hash of the current row of data.
    * @param {App} App the shared ui App object useful more making globally
    *					unique id references.
    * @param {HtmlDOM} node  the HTML Dom object for this field's display.
    */
   customDisplay(row, App, node, options) {
      options = options || {};

      var isFormView = options.formView != null ? options.formView : false;
      // sanity check.
      if (!node) {
         return;
      }

      var domNode = node.querySelector(".connect-data-values");
      if (!domNode) return;

      var multiselect = this.settings.linkType == "many";

      // get selected values
      var selectedData = this.pullRelationValues(row);

      var placeholder = L(
         "ab.dataField.connect.placeholder_single",
         "*Select item"
      );
      if (multiselect) {
         placeholder = L(
            "ab.dataField.connect.placeholder_multiple",
            "*Select items"
         );
      }
      var readOnly = false;
      if (options.editable != null && options.editable == false) {
         readOnly = true;
         placeholder = "";
      }

      if (options.filters == null) {
         options.filters = {};
      }

      // if this field's options are filtered off another field's value we need
      // to make sure the UX helps the user know what to do.
      var placeholderReadOnly = null;
      if (options.filterValue && options.filterKey) {
         if (!$$(options.filterValue)) {
            // this happens in the Interface Builder when only the single form UI is displayed
            readOnly = true;
            placeholderReadOnly =
               "Must select item from 'PARENT ELEMENT' first.";
         } else {
            let val = this.getValue($$(options.filterValue));
            if (!val) {
               // if there isn't a value on the parent select element set this one to readonly and change placeholder text
               readOnly = true;
               let label = $$(options.filterValue);
               placeholderReadOnly =
                  "Must select item from '" + label.config.name + "' first.";
            }
         }
      }

      // Render selectivity
      this.selectivityRender(
         domNode,
         {
            multiple: multiselect,
            data: selectedData,
            placeholder: placeholderReadOnly
               ? placeholderReadOnly
               : placeholder,
            readOnly: readOnly,
            editPage: options.editPage,
            ajax: {
               url: "It will call url in .getOptions function", // require
               minimumInputLength: 0,
               quietMillis: 250,
               fetch: (url, init, queryOptions) => {
                  // if we are filtering based off another selectivity's value we
                  // need to do it on fetch each time because the value can change
                  // copy the filters so we don't add to them every time there is a change
                  var combineFilters = JSON.parse(
                     JSON.stringify(options.filters)
                  );
                  // only add filters if we pass valid value and key
                  if (options.filterValue && options.filterKey) {
                     // get the current value of the parent select box
                     let parentVal = this.getValue($$(options.filterValue));
                     if (parentVal) {
                        // if there is a value create a new filter rule
                        var filter = {
                           key: options.filterKey,
                           rule: "equals",
                           value: parentVal.uuid
                        };
                        combineFilters.rules.push(filter);
                     }
                  }

                  return this.getOptions(
                     combineFilters,
                     queryOptions.term
                  ).then(function(data) {
                     return {
                        results: data
                     };
                  });
               }
            }
         },
         App,
         row
      );

      if (!domNode.dataset.isListened) {
         // prevent listen duplicate
         domNode.dataset.isListened = true;

         // Listen event when selectivity value updates
         if (domNode && row.id && !isFormView) {
            domNode.addEventListener(
               "change",
               (e) => {
                  // update just this value on our current object.model
                  var values = {};
                  values[this.columnName] = this.selectivityGet(domNode);

                  // check data does not be changed
                  if (Object.is(values[this.columnName], row[this.columnName]))
                     return;

                  // pass empty string because it could not put empty array in REST api
                  // added check for null because default value of field is null
                  if (
                     values[this.columnName] == null ||
                     values[this.columnName].length == 0
                  )
                     values[this.columnName] = "";

                  this.object
                     .model()
                     .update(row.id, values)
                     .then(() => {
                        // update values of relation to display in grid
                        values[this.relationName()] = values[this.columnName];

                        // update new value to item of DataTable .updateItem
                        if (values[this.columnName] == "")
                           values[this.columnName] = [];
                        if ($$(node) && $$(node).updateItem)
                           $$(node).updateItem(row.id, values);
                     })
                     .catch((err) => {
                        node.classList.add("webix_invalid");
                        node.classList.add("webix_invalid_cell");

                        OP.Error.log("Error updating our entry.", {
                           error: err,
                           row: row,
                           values: values
                        });
                        console.error(err);
                     });
               },
               false
            );
         } else {
            domNode.addEventListener(
               "change",
               (e) => {
                  if (domNode.clientHeight > 32) {
                     var item = $$(node);
                     item.define("height", domNode.clientHeight + 6);
                     item.resizeChildren();
                     item.resize();
                  }
               },
               false
            );
            // add a change listener to the selectivity instance we are filtering our options list by.
            if (options.filterValue && $$(options.filterValue)) {
               var parentDomNode = $$(options.filterValue).$view.querySelector(
                  ".connect-data-values"
               );
               parentDomNode.addEventListener(
                  "change",
                  (e) => {
                     let parentVal = this.selectivityGet(parentDomNode);
                     if (parentVal) {
                        // if there is a value set allow the user to edit and
                        // put back the placeholder text to the orignal value
                        domNode.selectivity.setOptions({
                           readOnly: false,
                           placeholder: placeholder
                        });
                        // clear any previous value because it could be invalid
                        domNode.selectivity.setValue(null);
                     } else {
                        // if there is not a value set make field read only and
                        // set the placeholder text to a read only version
                        domNode.selectivity.setOptions({
                           readOnly: true,
                           placeholder: placeholderReadOnly
                        });
                        // clear any previous value because it could be invalid
                        domNode.selectivity.setValue(null);
                     }
                  },
                  false
               );
            }
         }
      }
   }

   /*
    * @function customEdit
    *
    * @param {object} row is the {name=>value} hash of the current row of data.
    * @param {App} App the shared ui App object useful more making globally
    *					unique id references.
    * @param {HtmlDOM} node  the HTML Dom object for this field's display.
    */

   //// NOTE: why do we pass in row, App, and node?  is this something we do in our external components?
   ////       are these values present when this Object is instanciated? Can't we just pass these into the
   ////       object constructor and have it internally track these things?
   customEdit(row, App, node) {
      if (this.settings.linkType == "many") {
         var domNode = node.querySelector(".connect-data-values");

         if (domNode.selectivity != null) {
            // Open selectivity
            domNode.selectivity.open();
            return false;
         }
         return false;
      }
      return false;
   }

   /*
    * @funciton formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   formComponent() {
      return super.formComponent("connect");
   }

   detailComponent() {
      var detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: "detailconnect"
         };
      };

      return detailComponentSetting;
   }

   /**
    * @method getOptions
    * show options list in selectivity
    *
    * @return {Promise}
    */
   getOptions(where, term) {
      return new Promise((resolve, reject) => {
         where = where || {};

         if (!where.glue) where.glue = "and";

         if (!where.rules) where.rules = [];

         term = term || "";

         // check if linked object value is not define, should return a empty array
         if (!this.settings.linkObject) return resolve([]);

         // if options was cached
         // if (this._options != null) return resolve(this._options);

         var linkedObj = this.datasourceLink;

         // System could not found the linked object - It may be deleted ?
         if (linkedObj == null) return reject();

         var linkedCol = this.fieldLink;

         // System could not found the linked field - It may be deleted ?
         if (linkedCol == null) return reject();

         // Get linked object model
         var linkedModel = linkedObj.model();

         // M:1 - get data that's only empty relation value
         if (
            this.settings.linkType == "many" &&
            this.settings.linkViaType == "one"
         ) {
            where.rules.push({
               key: linkedCol.id,
               rule: "is_null"
            });
            // where[linkedCol.columnName] = null;
         }
         // 1:1
         else if (
            this.settings.linkType == "one" &&
            this.settings.linkViaType == "one"
         ) {
            // 1:1 - get data is not match link id that we have
            if (this.settings.isSource == true) {
               // NOTE: make sure "haveNoRelation" shows up as an operator
               // the value ":0" doesn't matter, we just need 'haveNoRelation' as an operator.
               // newRule[linkedCol.id] = { 'haveNoRelation': 0 };
               where.rules.push({
                  key: linkedCol.id,
                  rule: "haveNoRelation"
               });
            }
            // 1:1 - get data that's only empty relation value by query null value from link table
            else {
               where.rules.push({
                  key: linkedCol.id,
                  rule: "is_null"
               });
               // newRule[linkedCol.id] = 'null';
               // where[linkedCol.id] = null;
            }
         }

         // Pull linked object data
         linkedModel
            .findAll({
               where: where,
               populate: false
            })
            .then((result) => {
               // cache linked object data
               this._options = result.data;

               // populate display text
               this._options.forEach((opt) => {
                  opt.text = linkedObj.displayData(opt);
               });

               // filter
               this._options = this._options.filter(function(item) {
                  if (item.text.toLowerCase().includes(term.toLowerCase())) {
                     return true;
                  }
               });

               resolve(this._options);
            }, reject);
      });
   }

   getValue(item) {
      var domNode = item.$view.querySelector(".connect-data-values");
      var values = this.selectivityGet(domNode);
      return values;
   }

   setValue(item, rowData) {
      if (!item) return;

      // if (_.isEmpty(rowData)) return; removed because sometimes we will want to set this to empty

      // var val = rowData[this.columnName];
      // if (typeof val == "undefined") {
      // 	// val = rowData;

      // 	// if ! val in proper selectivity format ->  strange case
      // 	var testVal = Array.isArray(rowData) ? rowData[0] : rowData;
      // 	if (!(testVal.id && testVal.text)) {
      // 		val = this.pullRelationValues(rowData);
      // 	}

      // } else {

      // 	// convert our val into pullRelationValues
      // 	// get label to display
      // 	val = this.pullRelationValues(rowData);
      // }

      let val = this.pullRelationValues(rowData);

      // get selectivity dom
      var domSelectivity = item.$view.querySelector(".connect-data-values");

      if (domSelectivity) {
         // set value to selectivity
         this.selectivitySet(domSelectivity, val);

         if (domSelectivity.clientHeight > 32) {
            item.define("height", domSelectivity.clientHeight + 6);
            item.resizeChildren();
            item.resize();
         }
      }
   }
};
