//
// ABViewRuleActionFormRecordRuleInsertConnected
//
// An action that allows you to insert a connected object.
//
// NOTE: this is very similar to the Update Connected Rule, so we subclass that one and
// modify it to only Insert data.
//
//
const UpdateConnected = require("./ABViewRuleActionFormRecordRuleUpdateConnected");

module.exports = class ABViewRuleActionFormRecordRuleInsertConnected extends UpdateConnected {
   /**
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    */
   constructor(App, idBase, currentForm) {
      super(App, idBase, currentForm);
      var L = function(key, altText) {
         return AD.lang.label.getLabel(key) || altText;
      };

      this.key = "ABViewRuleActionFormRecordRuleInsertConnected";
      this.label = L(
         "ab.component.ruleaction.insertConnectedObject",
         "*Insert Connected Object"
      );
   }

   /**
    * valueDisplayChooser
    * Our Values Display is a Select Box with a choice of connected fields.
    * Once a field is chosen, then we display the Updater form.
    * @param {string}  idBase  a unique webix id to base our sub components on.
    */
   valueDisplayChooser(idBase) {
      var Component = super.valueDisplayChooser(idBase);

      // in our case, there are no additional QB conditions:
      // so overwrite the .showQBIfNeeded() routine to not show anything:
      Component._logic.showQBIfNeeded = function() {};

      return Component;
   }

   /**
    * queryBuilderDisplay
    * override our parent .queryBuilderDisplay to not create a new .objectQB
    * @return {null}
    */
   queryBuilderDisplay() {
      return null;
   }

   /**
    * process
    * gets called when a form is submitted and the data passes the Query Builder Rules.
    * @param {obj} options
    *				options.data : {obj} the key=>value of the data just entered by the form
    *				options.form : {ABViewForm} the Form object that is processing this rule
    * @return {Promise}
    */
   process(options) {
      // get connected object
      var connObj = this.connectedObject();
      var model = connObj.model();

      var connectionField = this.selectedField();

      var condition = null; // our lookup condition

      // we are going to create a new instance of the connected object
      // and make sure our .id is in the connected object's connectionField
      // the server side will take care of making the proper relationship.

      // first, create a new set of values:
      var newObjectValues = {};

      // update them according to our rules
      this.processUpdateObject({}, newObjectValues);

      if (newObjectValues.newRecords) {
         // now add our .id to the proper field in newObjectValues
         let connectedObjectField;
         connectedObjectField = connObj.fields((f) => {
            return f.id == connectionField.settings.linkColumn;
         }, true)[0];

         if (!connectedObjectField)
            return Promise.reject("No connected object field");

         newObjectValues.newRecords.forEach((r) => {
            r[connectedObjectField.columnName] = options.data.id;
            // perform the update/insert
            return model.create(r);
         });
      } else {
         // now add our .id to the proper field in newObjectValues
         let connectedObjectField;
         connectedObjectField = connObj.fields((f) => {
            return f.id == connectionField.settings.linkColumn;
         }, true)[0];

         if (!connectedObjectField)
            return Promise.reject("No connected object field");

         newObjectValues[connectedObjectField.columnName] = options.data.id;

         // perform the update/insert
         return model.create(newObjectValues);
      }
   }

   /**
    * toSettings
    * return an object that represents the current state of this Action
    * @return {obj}
    */
   toSettings() {
      // settings: {
      // 	selectedFieldID: 'guid',
      //	valueRules:{}		// from ABViewRuleActionObjectUpdater
      // }

      // let our parent store our QB settings
      var settings = super.toSettings();

      // we don't use .qpCondition
      delete settings.qbCondition;

      return settings;
   }
};
