import AB from "../../../components/ab";
import ABField from "../../../classes/dataFields/ABField";

import sampleApp from "../../fixtures/ABApplication";

describe("ABField unit tests", () => {
   function L(key, altText) {
      return AD.lang.label.getLabel(key) || altText;
   }

   var sandbox;

   var ab;
   var mockApp;
   var mockObject;
   var ids;

   var target;

   var columnName = "TEST_FIELD_COLUMN";

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = sampleApp.objects()[0];

      ids = {
         label: "TEST_ABField_label",
         columnName: "TEST_ABField_column",
         fieldDescription: "TEST_ABField_description",
         showIcon: "TEST_ABField_icon",
         required: "TEST_ABField_required",
         unique: "TEST_ABField_unique",
         numberOfNull: "TEST_ABField_numberOfNull"
      };

      target = new ABField(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject,
         {
            key: "TEST ABField"
         }
      );
   });

   beforeEach(() => {
      sandbox = sinon.sandbox.create();
   });

   afterEach(() => {
      sandbox.restore();
   });

   after(() => {});

   /* ABField test cases */
   describe("ABField test cases", () => {
      it("should exist field", () => {
         assert.isDefined(target);
      });

      it(".definitionEditor: should return valid UI definition", () => {
         let resultUI = ABField.definitionEditor(mockApp, ids, {}, target);

         resultUI.container = "ab_test_div";

         // render UI editor
         new webix.ui(resultUI);
      });

      it(".clearEditor: should clear values of UI editor", () => {
         ABField.clearEditor(ids);

         assert.isNull(
            ABField._CurrentField,
            "should clear stored current field"
         );
         assert.equal("", $$(ids.label).getValue());
         assert.equal("", $$(ids.columnName).getValue());
         assert.equal(1, $$(ids.showIcon).getValue());
         assert.equal(0, $$(ids.required).getValue());
         assert.isFalse(
            $$(ids.numberOfNull).isVisible(),
            "should hide numberOfNull component"
         );
      });

      it(".editorPopulate: should populate valid values", () => {
         let field = {
            label: "LABEL",
            columnName: "COLUMN NAME",
            settings: {
               showIcon: 1,
               required: 1,
               unique: 1
            }
         };

         ABField.editorPopulate(ids, field);

         assert.equal(field, ABField._CurrentField, "should store valid field");
         assert.equal(field.label, $$(ids.label).getValue());
         assert.equal(field.columnName, $$(ids.columnName).getValue());
         assert.equal(field.settings.showIcon, $$(ids.showIcon).getValue());
         assert.equal(field.settings.required, $$(ids.required).getValue());
         assert.equal(field.settings.unique, $$(ids.unique).getValue());
      });

      it(".editorValues: should return valid settings", () => {
         let label = "LABEL";
         let columnName = "COLUMN NAME";
         let settings = {
            label: label,
            columnName: columnName,
            settings: {
               first: "ONE",
               second: "TWO"
            }
         };

         let result = ABField.editorValues(settings);

         assert.equal(label, result.label);
         assert.equal(columnName, result.columnName);
         assert.equal(settings, result.settings);
         assert.isUndefined(settings.label, "should remove .label");
         assert.isUndefined(settings.columnName, "should remove .columnName");
      });

      it(".isValid: should not error", () => {
         let validator = target.isValid();

         assert.isTrue(validator.pass());
         assert.isFalse(validator.fail());
      });

      it(".isValid: should call unique error", () => {
         // set duplicate column name
         target.id = "TEST ID";
         target.columnName = "Noun";

         let validator = target.isValid();

         assert.isTrue(validator.fail());
         assert.isFalse(validator.pass());
      });

      it(".destroy: should not call remove this field", (done) => {
         delete target.id;

         let stubFieldRemove = sandbox
            .stub(mockObject, "fieldRemove")
            .callsFake(function() {});
         let result = target.destroy().then(() => {
            assert.isTrue(result instanceof Promise);
            sandbox.assert.notCalled(stubFieldRemove);
            done();
         });
      });

      it(".destroy: should not call remove this field", (done) => {
         target.id = "TEST ID";

         let stubFieldRemove = sandbox
            .stub(mockObject, "fieldRemove")
            .callsFake(function() {
               return Promise.resolve();
            });
         let result = target.destroy();

         assert.isTrue(result instanceof Promise);
         result.then(() => {
            sandbox.assert.calledOnce(stubFieldRemove);
            done();
         });
      });

      it(".save: should add correctly", (done) => {
         delete target.id;

         let model = target.object.model();

         let stubFindAll = sandbox.stub(model, "findAll").callsFake(function() {
            return Promise.resolve({ data: [] });
         });
         let stubFieldSave = sandbox
            .stub(mockObject, "fieldSave")
            .callsFake(function() {
               return Promise.resolve();
            });
         let stubMigrateCreate = sandbox
            .stub(target, "migrateCreate")
            .callsFake(function() {
               return Promise.resolve();
            });
         let stubMigrateUpdate = sandbox
            .stub(target, "migrateUpdate")
            .callsFake(function() {
               return Promise.resolve();
            });

         let result = target.save();

         assert.isTrue(result instanceof Promise);

         result.then(() => {
            sandbox.assert.notCalled(stubFindAll);
            sandbox.assert.calledOnce(stubFieldSave);
            sandbox.assert.calledOnce(stubMigrateCreate);
            sandbox.assert.notCalled(stubMigrateUpdate);

            done();
         });
      });

      it(".save: should update correctly", (done) => {
         target.id = "TEST ID";
         target.settings.required = true;
         target.settings.default = true;

         let model = target.object.model();

         let stubFindAll = sandbox.stub(model, "findAll").callsFake(function() {
            return Promise.resolve({ data: [] });
         });
         let stubFieldSave = sandbox
            .stub(mockObject, "fieldSave")
            .callsFake(function() {
               return Promise.resolve();
            });
         let stubMigrateCreate = sandbox
            .stub(target, "migrateCreate")
            .callsFake(function() {
               return Promise.resolve();
            });
         let stubMigrateUpdate = sandbox
            .stub(target, "migrateUpdate")
            .callsFake(function() {
               return Promise.resolve();
            });

         let result = target.save();

         assert.isTrue(result instanceof Promise);

         result.then(() => {
            sandbox.assert.calledOnce(stubFindAll);
            sandbox.assert.calledOnce(stubFieldSave);
            sandbox.assert.calledOnce(stubMigrateUpdate);
            sandbox.assert.notCalled(stubMigrateCreate);

            done();
         });
      });

      it(".toObj: should return valid settings", () => {
         target.label = "LABEL";

         // {
         //	"id": "TEST ID",
         //	"key": "TEST ABField",
         //	"label": "LABEL",
         //	"isImported": 0,
         //	"columnName": "Noun",
         //	"settings": {
         //		"showIcon": null,
         //		"required": true,
         //		"width": null,
         //		"default": true
         //	},
         //	"translations": [{ "language_code": "en", "label": "LABEL" }]
         // }
         let result = target.toObj();

         assert.equal(target.id, result.id);
         assert.equal(target.key, result.key);
         assert.equal(target.isImported, result.isImported);
         assert.equal(target.columnName, result.columnName);
         assert.isDefined(target.settings);
         assert.isDefined(target.settings.showIcon);
         assert.isDefined(target.settings.required);
         assert.isDefined(target.settings.width);
         assert.isDefined(target.settings.default);
         assert.equal(target.label, result.translations[0].label);
      });

      it(".migrateCreate: should call and pass valid parameters", () => {
         let stubPost = sandbox
            .stub(OP.Comm.Service, "post")
            .callsFake(function() {
               return Promise.resolve();
            });

         let result = target.migrateCreate();

         assert.isDefined(result);
         assert.isTrue(result instanceof Promise);
         sandbox.assert.calledOnce(stubPost);
         sandbox.assert.calledWith(stubPost, {
            url: "/app_builder/migrate/object/#objID#/field/#fieldID#"
               .replace("#objID#", target.object.id)
               .replace("#fieldID#", target.id)
         });
      });

      it(".migrateUpdate: should call and pass valid parameters", () => {
         let stubPut = sandbox
            .stub(OP.Comm.Service, "put")
            .callsFake(function() {
               return Promise.resolve();
            });

         let result = target.migrateUpdate();

         assert.isDefined(result);
         assert.isTrue(result instanceof Promise);
         sandbox.assert.calledOnce(stubPut);
         sandbox.assert.calledWith(stubPut, {
            url: "/app_builder/migrate/object/#objID#/field/#fieldID#"
               .replace("#objID#", target.object.id)
               .replace("#fieldID#", target.id)
         });
      });

      it(".migrateDrop: should call and pass valid parameters", () => {
         let stubDelete = sandbox
            .stub(OP.Comm.Service, "delete")
            .callsFake(function() {
               return Promise.resolve();
            });

         let result = target.migrateDrop();

         assert.isDefined(result);
         assert.isTrue(result instanceof Promise);
         sandbox.assert.calledOnce(stubDelete);
         sandbox.assert.calledWith(stubDelete, {
            url: "/app_builder/migrate/object/#objID#/field/#fieldID#"
               .replace("#objID#", target.object.id)
               .replace("#fieldID#", target.id)
         });
      });

      it(".columnHeader: should show icon and label in column header", () => {
         target.settings.showIcon = true;

         let isObjectWorkspace = true;
         let result = target.columnHeader({
            isObjectWorkspace: isObjectWorkspace
         });

         assert.equal(target.columnName, result.id);
         assert.equal(
            `<span class="webix_icon fa fa-${target.fieldIcon()}"></span>${
               target.label
            }`,
            result.header
         );
      });

      it(".columnHeader: should label only in column header", () => {
         target.settings.showIcon = false;

         let isObjectWorkspace = true;
         let result = target.columnHeader({
            isObjectWorkspace: isObjectWorkspace
         });

         assert.equal(target.columnName, result.id);
         assert.equal(target.label, result.header);
      });

      it(".customDisplay: should exist and be a function", () => {
         assert.isDefined(target.customDisplay);
         assert.isFunction(target.customDisplay);
      });

      it(".customEdit: should return true", () => {
         assert.isDefined(target.customEdit);
         assert.isFunction(target.customEdit);

         let result = target.customEdit();

         assert.isTrue(result);
      });

      it(".isValidData: should not add any error", () => {
         let data = {};
         data[target.columnName] = "VALUE";

         let validator = { addError: function() {} };
         let stubAddError = sandbox
            .stub(validator, "addError")
            .callsFake(function() {});

         target.isValidData(data, validator);

         sandbox.assert.notCalled(stubAddError);
      });

      it(".isValidData: should add the required field error", () => {
         let data = {};
         data[target.columnName] = ""; // empty

         let validator = { addError: function() {} };
         let stubAddError = sandbox
            .stub(validator, "addError")
            .callsFake(function() {});

         target.isValidData(data, validator);

         sandbox.assert.calledOnce(stubAddError);
         sandbox.assert.calledWith(
            stubAddError,
            target.columnName,
            "*This is a required field."
         );
      });

      it(".isMultilingual: should return false", () => {
         assert.isDefined(target.isMultilingual);

         let result = target.isMultilingual;

         assert.isFalse(result);
      });

      it(".getValue: should return valid data", () => {
         let val = "THIS IS VALUE";
         let $textbox = webix.ui({
            view: "text",
            value: val
         });

         let result = target.getValue($textbox);

         assert.equal(val, result);
      });

      it(".setValue: should set valid data", () => {
         let newVal = "NEW VALUE",
            defaultVal = "DEFAULT VALUE",
            $textbox = webix.ui({
               view: "text",
               value: "OLD VALUE"
            });

         let rowData = {};
         rowData[target.columnName] = newVal;

         target.setValue($textbox, rowData, defaultVal);

         assert.equal(newVal, $textbox.getValue());
         assert.notEqual(defaultVal, $textbox.getValue());
      });

      it(".setValue: should set default value", () => {
         let newVal = "NEW VALUE",
            defaultVal = "DEFAULT VALUE",
            $textbox = webix.ui({
               view: "text",
               value: "OLD VALUE"
            });

         let rowData = null; // not set value

         target.setValue($textbox, rowData, defaultVal);

         assert.notEqual(newVal, $textbox.getValue());
         assert.equal(defaultVal, $textbox.getValue());
      });

      it(".dataValue: should return valid value", () => {
         let val = "VALID VALUE";

         let rowData = {};
         rowData[target.columnName] = val;

         let result = target.dataValue(rowData);

         assert.equal(val, result);
      });

      it(".dataValue: should return valid value", () => {
         let val = "VALID VALUE";

         let rowData = {};
         rowData[`${target.object.name}.${target.columnName}`] = val;

         let result = target.dataValue(rowData);

         assert.equal(val, result);
      });

      it(".dataValue: should return valid value", () => {
         let val = "VALID VALUE";

         target.alias = "ALIAS NAME";

         let rowData = {};
         rowData[`${target.alias}.${target.columnName}`] = val;

         let result = target.dataValue(rowData);

         assert.equal(val, result);
      });

      it(".format: should call .dataValue", () => {
         let stubDataValue = sandbox
            .stub(target, "dataValue")
            .callsFake(function() {});

         let rowData = {};

         let result = target.format(rowData);

         sandbox.assert.calledOnce(stubDataValue);
         sandbox.assert.calledWith(stubDataValue, rowData);
      });

      it(".format: should return a empty string", () => {
         let rowData = null;

         let result = target.format(rowData);

         assert.equal("", result);
      });

      it(".formComponent: should return a valid object - { common, newInstance }", () => {
         let result = target.formComponent();

         assert.isDefined(result.common);
         assert.isDefined(result.newInstance);
         assert.isFunction(result.common);
         assert.isFunction(result.newInstance);
      });

      it(".formComponent.common: should return a valid object - { key }", () => {
         let formKey = "FORM COMPONENT KEY";
         let formCom = target.formComponent(formKey);
         let result = formCom.common();

         assert.equal(formKey, result.key);
      });

      it(".formComponent.newInstance: should call application.viewNew with valid parameters", () => {
         let stubViewNew = sandbox
            .stub(sampleApp, "viewNew")
            .callsFake(function() {});

         let formKey = "FORM COMPONENT KEY";
         let formCom = target.formComponent(formKey);
         let result = formCom.newInstance(sampleApp, mockObject);

         sandbox.assert.calledOnce(stubViewNew);
         // sandbox.assert.calledWith(stubViewNew, {
         // 	key: formKey,
         // 	settings: {
         // 		objectId: target.object.id,
         // 		fieldId: target.id
         // 	}
         // }, sampleApp, mockObject);
      });

      it(".detailComponent: should return a valid object - { common, newInstance }", () => {
         let result = target.detailComponent();

         assert.isDefined(result.common);
         assert.isDefined(result.newInstance);
         assert.isFunction(result.common);
         assert.isFunction(result.newInstance);
      });

      it(".detailComponent.common: should return a valid object - { key }", () => {
         let detailKey = "DETAIL COMPONENT KEY";
         let detailCom = target.formComponent(detailKey);
         let result = detailCom.common();

         assert.equal(detailKey, result.key);
      });

      it(".detailComponent.newInstance: should call application.viewNew with valid parameters", () => {
         let stubViewNew = sandbox
            .stub(sampleApp, "viewNew")
            .callsFake(function() {});

         let datailKey = "DETAIL COMPONENT KEY";
         let detailCom = target.formComponent(datailKey);
         let result = detailCom.newInstance(sampleApp, mockObject);

         sandbox.assert.calledOnce(stubViewNew);
         // sandbox.assert.calledWith(stubViewNew, {
         // 	key: datailKey,
         // 	settings: {
         // 		objectId: target.object.id,
         // 		fieldId: target.id
         // 	}
         // }, sampleApp, mockObject);
      });
   });
});
