/*
 * custom_savablelayout
 *
 * Create a custom webix component.
 *
 */

// Import our Custom Components here:
const ActiveList = require("./activelist");
const CountFooter = require("./countfooter");
const DateTimePicker = require("./datetimepicker");
const EditList = require("./editlist");
const EditTree = require("./edittree");
const EditUnitList = require("./editunitlist");
const FocusableTemplate = require("./focusableTemplate");
const FormIOBuilder = require("./formioBuilder");
const FormIOPreview = require("./formioPreview");
const NumberText = require("./numbertext");
const TotalFooter = require("./totalfooter");
const TreeSuggest = require("./treesuggest");
// const SavableLayout = require('./savablelayout');

var componentList = [
   ActiveList,
   CountFooter,
   DateTimePicker,
   EditList,
   EditTree,
   EditUnitList,
   FocusableTemplate,
   FormIOBuilder,
   FormIOPreview,
   NumberText,
   TotalFooter,
   TreeSuggest
   // SavableLayout
];

module.exports = class ABCustomComponentManager {
   constructor() {}

   initComponents(App) {
      App.custom = App.custom || {};

      componentList.forEach((Component) => {
         var component = new Component(App);
         App.custom[component.key] = component;
      });
   }
};
