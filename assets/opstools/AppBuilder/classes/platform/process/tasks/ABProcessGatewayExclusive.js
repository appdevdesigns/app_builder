const ABProcessGatewayExclusiveCore = require("../../../core/process/tasks/ABProcessGatewayExclusiveCore.js");

const RowFilter = require("../../RowFilter");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessGatewayExclusive extends ABProcessGatewayExclusiveCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id, App) {
      var ids = this.propertyIDs(id);

      var ui = {
         id: id,
         view: "form",
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.element.name", "*Name"),
               name: "name",
               value: this.name
            }
         ]
      };

      // here is how we can find out what possible process data
      // fields are available to this task:
      //   returns an [{ key:'{uuid}', label:"" field:{ABDataField} }, {}, ...]
      var listDataFields = this.process.processDataFields(this);
      var abFields = (listDataFields || []).map((f) => {
         return f.field;
      });

      var myOutgoingConnections = this.process.connectionsOutgoing(
         this.diagramID
      );

      this.__dfLookup = {};
      this.conditions = this.conditions || {};
      myOutgoingConnections.forEach((conn) => {
         var condition = this.conditions[conn.id] || {};

         var connectedElement = this.process.elementForDiagramID(conn.to);

         var DF = new RowFilter(App, `${id}_${conn.id}_filter`);
         DF.init({ showObjectName: true });
         DF.applicationLoad(this.application);
         DF.fieldsLoad(abFields);
         this.__dfLookup[conn.id] = DF;

         var connUI = {
            view: "fieldset",
            label: `to ${
               connectedElement
                  ? connectedElement.name
                  : "unlabeled Task(" + conn.id + ")"
            }`,
            body: {
               rows: [
                  {
                     id: `${id}_${conn.id}_label`,
                     view: "text",
                     label: "Label",
                     value: condition.label || ""
                  },
                  DF.ui
               ]
            }
         };

         ui.elements.push(connUI);
      });

      // DF.setValue(CurrentQuery.where);

      webix.ui(ui, $$(id));

      $$(id).show();

      // update the filters after they have been .show()n
      myOutgoingConnections.forEach((conn) => {
         var condition = this.conditions[conn.id] || {};
         var DF = this.__dfLookup[conn.id];
         if (condition.filterValue) {
            DF.setValue(condition.filterValue);
         }
      });
   }

   /**
    * propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      var ids = this.propertyIDs(id);
      this.name = this.property(ids.name);
      this.conditions = {};

      var myOutgoingConnections = this.process.connectionsOutgoing(
         this.diagramID
      );
      myOutgoingConnections.forEach((conn) => {
         this.conditions[conn.id] = {};
         this.conditions[conn.id].label = this.property(
            `${id}_${conn.id}_label`
         );
         if (this.__dfLookup && this.__dfLookup[conn.id]) {
            var DF = this.__dfLookup[conn.id];
            this.conditions[conn.id].filterValue = DF.getValue();
         }
      });
   }

   /**
    * diagramProperties()
    * return a set of values for the XML shape definition based upon
    * the current values of this object.
    * @return {json}
    */
   diagramProperties() {
      // the first entry is for the gateway element itself
      var properties = [
         {
            id: this.diagramID,
            def: {
               name: this.name
            }
         }
      ];

      // now add any additional updates for each of our connections:
      var myOutgoingConnections = this.process.connectionsOutgoing(
         this.diagramID
      );
      myOutgoingConnections.forEach((conn) => {
         properties.push({
            id: conn.id,
            def: {
               name: this.conditions[conn.id].label
            }
         });
      });
      return properties;
   }
};
