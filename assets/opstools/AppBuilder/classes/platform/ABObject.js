// import ABApplication from "./ABApplication"
const ABObjectCore = require("../core/ABObjectCore");

// import OP from "OP"
// var ABFieldManager = require("../classes/ABFieldManager");
// import ABFieldManager from "../ABFieldManager"

const ABObjectWorkspaceViewCollection = require("./workspaceViews/ABObjectWorkspaceViewCollection");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

// Start listening for server events for object updates and call triggerEvent as the callback
io.socket.on("ab.object.update", function(msg) {
   AD.comm.hub.publish("ab.object.update", {
      objectId: msg.objectId,
      data: msg.data
   });
});

// io.socket.on("ab.object.delete", function (msg) {
// });

module.exports = class ABObject extends ABObjectCore {
   constructor(attributes, application) {
      super(attributes, application);

      this.workspaceViews = new ABObjectWorkspaceViewCollection(
         attributes,
         this,
         application
      );

      this.fromValues(attributes);

      // listen
      AD.comm.hub.subscribe("ab.object.update", (msg, data) => {
         if (this.id == data.objectId) this.fromValues(data.data);
      });
   }

   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   fromValues(attributes) {
      /*
		{
			id: uuid(),
			name: 'name',
			labelFormat: 'xxxxx',
			isImported: 1/0,
			isExternal: 1/0,
			urlPath:'string',
			importFromObject: 'string', // JSON Schema style reference:  '#[ABApplication.id]/objects/[ABObject.id]'
										// to get other object:  ABApplication.objectFromRef(obj.importFromObject);
			translations:[
				{}
			],
			fields:[
				{ABDataField}
			]
		}
		*/

      super.fromValues(attributes);

      if (this.workspaceViews) this.workspaceViews.fromObj(attributes);
   }

   //// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

   isValid() {
      var validator = OP.Validation.validator();

      // label/name must be unique:
      var isNameUnique =
         this.application.objects((o) => {
            return o.name.toLowerCase() == this.name.toLowerCase();
         }).length == 0;
      if (!isNameUnique) {
         validator.addError(
            "name",
            L(
               "ab.validation.object.name.unique",
               "Object name must be unique (#name# already used in this Application)"
            ).replace("#name#", this.name)
         );
         // errors = OP.Form.validationError({
         // 		name:'name',
         // 		message:L('ab.validation.object.name.unique', 'Object name must be unique (#name# already used in this Application)').replace('#name#', this.name),
         // 	}, errors);
      }

      // Check the common validations:
      // TODO:
      // if (!inputValidator.validate(values.label)) {
      // 	_logic.buttonSaveEnable();
      // 	return false;
      // }

      return validator;
   }

   /**
    * @method isValidData
    * Parse through the given data and return an array of any invalid
    * value errors.
    * @param {obj} data a key=>value hash of the inputs to parse.
    * @return {array}
    */
   isValidData(data) {
      var validator = OP.Validation.validator();
      this.fields().forEach((f) => {
         var p = f.isValidData(data, validator);
      });

      return validator;
   }

   ///
   /// Instance Methods
   ///

   /**
    * @method fieldNew()
    *
    * return an instance of a new (unsaved) ABField that is tied to this
    * ABObject.
    *
    * NOTE: this new field is not included in our this.fields until a .save()
    * is performed on the field.
    *
    * @param {obj} values  the initial values for this field.
    *						{ key:'{string}'} is required
    * @return {ABField}
    */
   // fieldNew ( values ) {
   // 	// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
   // 	return ABFieldManager.newField( values, this );
   // }

   /// ABApplication data methods

   /**
    * @method destroy()
    *
    * destroy the current instance of ABObject
    *
    * also remove it from our parent application
    *
    * @return {Promise}
    */
   destroy() {
      return new Promise((resolve, reject) => {
         // Remove the import object, then its model will not be destroyed
         if (this.isImported) {
            this.application
               .objectDestroy(this)
               .catch(reject)
               .then(() => {
                  resolve();
               });

            return;
         }

         // OK, some of our Fields have special follow up actions that need to be
         // considered when they no longer exist, so before we simply drop this
         // object/table, drop each of our fields and give them a chance to clean up
         // what needs cleaning up.

         // ==> More work, but safer.
         var fieldDrops = [];
         this.fields().forEach((f) => {
            fieldDrops.push(f.destroy());
         });

         Promise.all(fieldDrops)
            .then(() => {
               return new Promise((next, err) => {
                  // now drop our table
                  // NOTE: our .migrateXXX() routines expect the object to currently exist
                  // in the DB before we perform the DB operations.  So we need to
                  // .migrateDrop()  before we actually .objectDestroy() this.
                  this.migrateDrop()
                     .then(() => {
                        // finally remove us from the application storage
                        return this.application.objectDestroy(this);
                     })
                     .then(next)
                     .catch(err);
               });
            })

            // flag .disable to queries who contains this removed object
            .then(() => {
               return new Promise((next, err) => {
                  this.application
                     .queries(
                        (q) => q.objects((o) => o.id == this.id).length > 0
                     )
                     .forEach((q) => {
                        q._objects = q.objects((o) => o.id != this.id);

                        q.disabled = true;
                     });

                  next();
               });
            })
            .then(resolve)
            .catch(reject);
      });
   }

   /**
    * @method save()
    *
    * persist this instance of ABObject with it's parent ABApplication
    *
    *
    * @return {Promise}
    *						.resolve( {this} )
    */
   save() {
      return new Promise((resolve, reject) => {
         var isAdd = false;

         // if this is our initial save()
         if (!this.id) {
            // this.id = OP.Util.uuid();	// setup default .id
            this.label = this.label || this.name;
            this.urlPath =
               this.urlPath || this.application.name + "/" + this.name;
            isAdd = true;
         }

         this.application
            .objectSave(this)
            .then((newObj) => {
               if (newObj && newObj.id && !this.id) this.id = newObj.id;

               if (isAdd) {
                  // on a Create: trigger a migrateCreate object
                  this.migrateCreate()
                     .then(() => {
                        resolve(this);
                     })
                     .catch(reject);
               } else {
                  resolve(this);
               }
            })
            .catch(function(err) {
               reject(err);
            });
      });
   }

   /**
    * @method toObj()
    *
    * properly compile the current state of this ABApplication instance
    * into the values needed for saving to the DB.
    *
    * Most of the instance data is stored in .json field, so be sure to
    * update that from all the current values of our child fields.
    *
    * @return {json}
    */
   toObj() {
      var result = super.toObj();

      result.objectWorkspaceViews = this.workspaceViews.toObj();

      return result;
   }

   ///
   /// DB Migrations
   ///

   migrateCreate() {
      var url = "/app_builder/migrate/object/#objID#".replace(
         "#objID#",
         this.id
      );

      return OP.Comm.Service.post({
         url: url
      });
   }

   migrateDrop() {
      var url = "/app_builder/migrate/object/#objID#".replace(
         "#objID#",
         this.id
      );

      return OP.Comm.Service["delete"]({
         url: url
      });
   }

   ///
   /// Working with Client Components:
   ///

   /**
    * @method columnResize()
    *
    * save the new width of a column
    *
    * @param {} id The instance of the field to save.
    * @param {int} newWidth the new width of the field
    * @param {int} oldWidth the old width of the field
    * @return {Promise}
    */
   columnResize(columnName, newWidth, oldWidth) {
      for (var i = 0; i < this._fields.length; i++) {
         if (this._fields[i].columnName == columnName) {
            this._fields[i].settings.width = newWidth;
         }
      }
      return this.save();
   }

   // return the column headers for this object
   // @param {bool} isObjectWorkspace  return the settings saved for the object workspace
   columnHeaders(
      isObjectWorkspace,
      isEditable,
      summaryColumns,
      countColumns,
      hiddenFieldNames
   ) {
      summaryColumns = summaryColumns || [];
      countColumns = countColumns || [];

      var headers = [];
      var columnNameLookup = {};

      // get the header for each of our fields:
      this.fields().forEach(function(f) {
         var header = f.columnHeader({
            isObjectWorkspace: isObjectWorkspace,
            editable: isEditable
         });

         if (isEditable) {
            header.validationRules = f.settings.validationRules;
         }

         header.alias = f.alias || undefined; // query type
         header.fieldID = f.id;
         header.fieldURL = f.urlPointer();

         if (f.settings.width != 0) {
            // set column width to the customized width
            header.width = f.settings.width;
         } else {
            // set column width to adjust:true by default;
            header.adjust = true;
         }

         // add the summary footer
         if (summaryColumns.indexOf(f.id) > -1) {
            if (f.key == "calculate" || f.key == "formula") {
               header.footer = { content: "totalColumn", field: f };
            } else {
               header.footer = { content: "summColumn" };
            }
         }
         // add the count footer
         else if (countColumns.indexOf(f.id) > -1)
            header.footer = { content: "countColumn" };

         headers.push(header);
         columnNameLookup[header.id] = f.columnName; // name => id
      });

      // update our headers with any settings applied in the Object Workspace
      if (isObjectWorkspace) {
         let hiddenFieldList = [];

         if (hiddenFieldNames && hiddenFieldNames.length > 0)
            hiddenFieldList = hiddenFieldNames;
         else if (this.workspaceHiddenFields)
            hiddenFieldList = this.workspaceHiddenFields;

         if (hiddenFieldList.length > 0) {
            hiddenFieldList.forEach((hfID) => {
               headers.forEach((h) => {
                  if (columnNameLookup[h.id] == hfID) {
                     h.hidden = true;
                  }
               });
            });
         }
      }

      return headers;
   }

   // after a component has rendered, tell each of our fields to perform
   // any custom display operations
   // @param {Webix.DataStore} data a webix datastore of all the rows effected
   //        by the render.
   customDisplays(data, App, DataTable, rowIds, isEditable) {
      if (!data || !data.getFirstId) return;

      // var fields = this.fields(f => this.workspaceHiddenFields.indexOf(f.columnName) < 0);
      let fields = [];
      DataTable.eachColumn((columnName) => {
         let field = this.fields((f) => f.columnName == columnName)[0];
         if (field) fields.push(field);
      });

      if (rowIds != null) {
         rowIds.forEach((id) => {
            var row = data.getItem(id);
            fields.forEach((f) => {
               var node = DataTable.getItemNode({
                  row: row.id,
                  column: f.columnName
               });
               f.customDisplay(row, App, node, {
                  editable: isEditable
               });
            });
         });
      } else {
         var id = data.getFirstId();
         while (id) {
            var row = data.getItem(id);
            fields.forEach((f) => {
               var node = DataTable.getItemNode({
                  row: row.id,
                  column: f.columnName
               });
               f.customDisplay(row, App, node, {
                  editable: isEditable
               });
            });
            id = data.getNextId(id);
         }
      }
   }

   // Display data with label format of object
   displayData(rowData) {
      if (rowData == null) return "";

      // translate multilingual
      var mlFields = this.multilingualFields();
      this.application.translate(rowData, rowData, mlFields);

      var labelData = this.labelFormat || "";

      // default label
      if (!labelData && this.fields().length > 0) {
         var defaultField = this.fields((f) => f.fieldUseAsLabel())[0];
         if (defaultField) labelData = "{" + defaultField.id + "}";
         else
            labelData = `${OP.Util.isUuid(rowData.id) ? "ID: " : ""}${
               rowData.id
            }`; // show id of row
      }

      // get column ids in {colId} template
      // ['{colId1}', ..., '{colIdN}']
      var colIds = labelData.match(/\{[^}]+\}/g);

      if (colIds && colIds.forEach) {
         colIds.forEach((colId) => {
            var colIdNoBracket = colId.replace("{", "").replace("}", "");

            var field = this.fields((f) => f.id == colIdNoBracket)[0];
            if (field == null) return;

            labelData = labelData.replace(colId, field.format(rowData) || "");
         });
      }

      // if label is empty, then show .id
      if (!labelData.trim())
         labelData = labelData = `${OP.Util.isUuid(rowData.id) ? "ID: " : ""}${
            rowData.id
         }`; // show id of row

      return labelData;
   }

   /**
    * @method isReadOnly
    *
    * @return {boolean}
    */
   // get isReadOnly() {

   // 	return this.isImported || this.isExternal;

   // }

   ///
   /// Fields
   ///

   /**
    * @method fields()
    * return an array of all the ABFields for this ABObject.
    *
    * @param filter {Object}
    * @param getAll {Boolean} - [Optional]
    *
    * @return {array}
    */
   // fields (filter, getAll = false) {

   // 	filter = filter || function() { return true; };

   // 	let availableConnectFn = (f) => {
   // 		if (f.key == 'connectObject' &&
   // 			this.application &&
   // 			this.application.objects(obj => obj.id == f.settings.linkObject).length < 1) {

   // 			return false

   // 		}
   // 		else {
   // 			return true;
   // 		}
   // 	};

   // 	let result = this._fields.filter(filter);

   // 	if (!getAll) {
   // 		result = result.filter(availableConnectFn);
   // 	}

   // 	return result;
   // }

   /**
    * @method connectFields()
    * return an array of the ABFieldConnect that is connect object fields.
    *
    * @param filter {Object}
    * @param getAll {Boolean} - [Optional]
    *
    * @return {array}
    */
   // connectFields (getAll = false) {

   // 	return this.fields(f => f.key == 'connectObject', getAll);
   // }

   ///
   /// Working with data from server
   ///

   /**
    * @method model
    * return a Model object that will allow you to interact with the data for
    * this ABObject.
    */
   // model() {

   // 	if (!this._model) {

   // 		this._model = new ABModel(this);

   // 		// if (this.isImported) {
   // 		// 	var obj = ABApplication.objectFromRef(this.importFromObject);
   // 		// 	this._model = new ABModel(obj);
   // 		// }
   // 		// else {
   // 		// 	this._model = new ABModel(this);
   // 		// }
   // 	}

   // 	return this._model;
   // }

   currentView() {
      return this.workspaceViews.getCurrentView();
   }
};
