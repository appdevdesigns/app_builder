const SubProcessCore = require("../../../core/process/tasks/ABProcessTaskSubProcessCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class SubProcess extends SubProcessCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         isEnable: `${id}_isEnable`,
         parameterId: `${id}_parameterId`
      };
   }

   /**
    * @method propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      let ids = this.propertyIDs(id);

      // Pull query tasks option list
      let parameterOptions = (this.process.processDataFields(this) || []).map(
         (item) => {
            return {
               id: item.key,
               value: item.label
            };
         }
      );

      let ui = {
         id: id,
         view: "form",
         elementsConfig: {
            labelWidth: 120
         },
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.element.name", "*Name"),
               name: "name",
               value: this.name
            },
            {
               id: ids.isEnable,
               view: "switch",
               label: L("ab.process.subProcess.enable", "*Enable"),
               value: this.isEnable
            },
            {
               id: ids.parameterId,
               view: "richselect",
               label: L("ab.process.subProcess.repeatFor", "*Repeat for"),
               options: parameterOptions,
               value: this.parameterId
            }
         ]
      };
      webix.ui(ui, $$(id));
   }

   /**
    * @method propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      let ids = this.propertyIDs(id);
      this.name = this.property(ids.name);
      this.isEnable = this.property(ids.isEnable);
      this.parameterId = this.property(ids.parameterId);
   }

   /**
    * @method diagramProperties()
    * return a set of values for the XML shape definition based upon
    * the current values of this object.
    * @return {json}
    */
   diagramProperties(bpmnModeler) {
      let props = super.diagramProperties();
      props = props || [{}];
      props[0].def = props[0].def || {};

      if (this.parameterId != null) {
         props[0].def = props[0].def || {};
         props[0].def.loopCharacteristics = bpmnModeler
            .get("moddle")
            .create("bpmn:MultiInstanceLoopCharacteristics");
         props[0].def.loopCharacteristics.isSequential = true;
      }

      return props;
   }

   /**
    * @method onChange()
    * update the current Task with information that was relevant
    * from the provided BPMN:Element
    * @param {BPMNElement}
    */
   onChange(defElement) {
      let loopCharacteristics =
         defElement.loopCharacteristics ||
         defElement.businessObject.loopCharacteristics ||
         {};

      switch (loopCharacteristics.$type) {
         case "bpmn:MultiInstanceLoopCharacteristics":
            this.loopType = loopCharacteristics.isSequential
               ? "sequential"
               : "parallel";
            break;
         case "bpmn:StandardLoopCharacteristics":
            this.loopType = "looping";
            break;
      }
   }

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
      return this.process.destroy.call(this);
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
      return this.process.save.call(this);
   }

   /**
    * @method elementNewForModelDefinition()
    * create a new process element defined by the given BPMN:Element
    *
    * the BPMN:Element definition comes from the BPMN Modeler when a new
    * diagram element is created.
    *
    * @param {BPMN:Element} element
    *        the BPMN modeler diagram element definition
    * @return {ABProcess[OBJ]}
    */
   elementNewForModelDefinition(element) {
      let task = this.application.processElementNewForModelDefinition(
         element,
         this
      );
      if (task) {
         this.elementAdd(task);
      }
      return task;
   }
};
