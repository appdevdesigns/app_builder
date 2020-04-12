import AB from "../../../components/ab";
import ABFieldBase from "../../../classes/dataFields/ABFieldBase";

import sampleApp from "../../fixtures/ABApplication";
import { AssertionError } from "assert";

describe("ABFieldBase unit tests", () => {
   var sandbox;

   var ab;
   var mockObject;

   var target;

   var columnName = "TEST_FIELD_COLUMN";

   before(() => {
      ab = new AB();

      mockObject = sampleApp.objects()[0];

      target = new ABFieldBase(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject,
         {
            key: "TEST ABFieldBase"
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

   it(".reservedNames: should return a valid array", () => {
      let result = ABFieldBase.reservedNames;

      assert.equal("id", result[0]);
      assert.equal("created_at", result[1]);
      assert.equal("updated_at", result[2]);
      assert.equal("properties", result[3]);
      assert.equal("createdAt", result[4]);
      assert.equal("updatedAt", result[5]);
   });

   it(".fieldKey: should return the valid key", () => {
      target.defaults.key = "FIELD KEY";

      let result = target.fieldKey();

      assert.equal(target.defaults.key, result);
   });

   it(".fieldOrmTypes: should return a valid array", () => {
      target.defaults.compatibleOrmTypes = ["type1", "type2", "type3"];

      let result = target.fieldOrmTypes();

      target.defaults.compatibleOrmTypes.forEach((type, index) => {
         assert.equal(type, result[index]);
      });
   });

   it(".fieldMysqlTypes: should return a valid array", () => {
      target.defaults.compatibleMysqlTypes = [
         "mysql type 1",
         "mysql type 2",
         "mysql type 3"
      ];

      let result = target.fieldMysqlTypes();

      target.defaults.compatibleMysqlTypes.forEach((type, index) => {
         assert.equal(type, result[index]);
      });
   });

   it(".fieldIcon: should return valid icon", () => {
      target.defaults.icon = "ICON VALUE";

      let result = target.fieldIcon();

      assert.equal(target.defaults.icon, result);
   });

   it(".fieldMenuName: should return valid menu name", () => {
      target.defaults.menuName = "MENU NAME";

      let result = target.fieldMenuName();

      assert.equal(target.defaults.menuName, result);
   });

   it(".fieldDescription: should return valid description", () => {
      target.defaults.description = "VALID DESCRIPTION";

      let result = target.fieldDescription();

      assert.equal(target.defaults.description, result);
   });

   it(".fieldIsFilterable: should return valid boolean when isFilterable is boolean", () => {
      target.defaults.isFilterable = true;

      let result = target.fieldIsFilterable();

      assert.equal(target.defaults.isFilterable, result);
   });

   it(".fieldIsFilterable: should return valid boolean when isFilterable is a function", () => {
      target.defaults.isFilterable = (f) => {
         return true;
      };

      let result = target.fieldIsFilterable();

      assert.equal(target.defaults.isFilterable(), result);
   });

   it(".fieldIsSortable: should return valid boolean when isSortable is boolean", () => {
      target.defaults.isSortable = true;

      let result = target.fieldIsSortable();

      assert.equal(target.defaults.isSortable, result);
   });

   it(".fieldIsSortable: should return valid boolean when isSortable is a function", () => {
      target.defaults.isSortable = (f) => {
         return true;
      };

      let result = target.fieldIsSortable();

      assert.equal(target.defaults.isSortable(), result);
   });

   it(".fieldUseAsLabel: should return valid boolean when useAsLabel is boolean", () => {
      target.defaults.useAsLabel = true;

      let result = target.fieldUseAsLabel();

      assert.equal(target.defaults.useAsLabel, result);
   });

   it(".fieldUseAsLabel: should return valid boolean when useAsLabel is a function", () => {
      target.defaults.useAsLabel = (f) => {
         return true;
      };

      let result = target.fieldUseAsLabel();

      assert.equal(target.defaults.useAsLabel(), result);
   });

   it(".fieldSupportRequire: should return valid boolean", () => {
      target.defaults.supportRequire = true;

      let result = target.fieldSupportRequire();

      assert.equal(target.defaults.supportRequire, result);
   });

   it(".fieldSupportQuery: should return valid boolean when supportQuery is boolean", () => {
      target.defaults.supportQuery = true;

      let result = target.fieldSupportQuery();

      assert.equal(target.defaults.supportQuery, result);
   });

   it(".fieldSupportQuery: should return valid boolean when supportQuery is a function", () => {
      target.defaults.supportQuery = (f) => {
         return true;
      };

      let result = target.fieldSupportQuery();

      assert.equal(target.defaults.supportQuery(), result);
   });

   it(".toObj: should return valid settings", () => {
      let result = target.toObj();

      assert.equal(target.id, result.id);
      assert.equal(target.key, result.key);
      assert.equal(target.icon, result.icon);
      assert.equal(target.isImported, result.isImported);
      assert.equal(target.columnName, result.columnName);
      assert.equal(target.settings, result.settings);
      assert.equal(target.translations, result.translations);
   });

   it(".fromValues: should populate valid settings", () => {
      let settings = {
         id: "ID",
         key: "KEY",
         icon: "ICON",
         label: "LABEL",
         columnName: "COLUMN NAME",
         translations: [{ language_code: "en", label: "EN LABEL" }],
         isImported: 1,
         settings: {
            showIcon: 1,
            required: 1,
            width: 250
         }
      };

      target.fromValues(settings);

      assert.equal(settings.id, target.id);
      assert.equal(settings.key, target.key);
      assert.equal(settings.icon, target.icon);
      assert.equal(settings.label, target.label);
      assert.equal(settings.columnName, target.columnName);
      assert.equal(settings.translations, target.translations);
      assert.equal(settings.isImported, target.isImported);
      assert.equal(settings.settings.showIcon, target.settings.showIcon);
      assert.equal(settings.settings.required, target.settings.required);
      assert.equal(settings.settings.width, target.settings.width);
   });

   it(".urlPointer: should return valid pointer string", () => {
      let result = target.urlPointer();

      assert.equal(`${target.object.urlField()}${target.id}`, result);
   });

   it(".defaultValue: should set default to be empty string", () => {
      let rowData = {};

      target.defaultValue(rowData);

      assert.equal("", rowData[target.columnName]);
   });
});
