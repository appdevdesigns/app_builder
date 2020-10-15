const InsertRecordTaskCore = require("../../../core/process/tasks/ABProcessTaskServiceInsertRecordCore.js");

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "InsertRecord";

module.exports = class InsertRecord extends InsertRecordTaskCore {
   ////
   //// Process Instance Methods
   ////

   /**
    * @method do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance, trx) {
      this.object = this.application.objects((o) => o.id == this.objectID)[0];
      if (!this.object) {
         let errorMessage = "Could not found the object to insert record task";
         this.log(instance, errorMessage);
         return Promise.reject(new Error(errorMessage));
      }

      let startElement = this.startElement;
      if (startElement)
         this.objectOfStartElem = this.application.objects(
            (o) => o.id == startElement.objectID
         )[0];

      let previousElement = this.previousElement;
      if (previousElement)
         this.objectOfPrevElem = this.application.objects(
            (o) => o.id == previousElement.objectID
         )[0];

      let values = this.getDataValue(instance);

      return Promise.resolve()
         .then(() => this.object.modelAPI().create(values))
         .then((record) => {
            return new Promise((next, bad) => {
               this.object
                  .modelAPI()
                  .findAll({
                     where: {
                        glue: "and",
                        rules: [
                           {
                              key: this.object.PK(),
                              rule: "equals",
                              value: record.uuid
                           }
                        ]
                     },
                     populate: true
                  })
                  .catch(bad)
                  .then((result) => {
                     this.stateUpdate(instance, {
                        data: result[0]
                     });
                     this.stateCompleted(instance);
                     next(true);
                  });
            });
         });
   }

   /**
    * @method processData()
    * return the current value requested for the given data key.
    * @param {obj} instance
    * @return {mixed} | null
    */
   processData(instance, key) {
      let myState = this.myState(instance);
      let data = myState.data;
      if (data == null) return null;

      return key ? data[key] : data;
   }

   /**
    * @method processDataStart()
    * return the value of the start element.
    * @param {obj} instance
    * @return {mixed} | null
    */
   processDataStart(instance) {
      let startElement = this.startElement;
      if (!startElement) return null;

      return startElement.myState(instance).data;
   }

   /**
    * @method processDataPrevious()
    * return the value of the previous Insert Record task.
    * @param {obj} instance
    * @return {mixed} | null
    */
   processDataPrevious(instance) {
      let prevElem = this.process.connectionPreviousTask(this)[0];
      if (!prevElem) return null;

      if (!(prevElem instanceof InsertRecord)) return null;

      let result = prevElem.processData(instance);
      return result;
   }

   /**
    * @method getDataValue()
    * return the value to insert.
    * @param {obj} instance
    * @return {mixed} | null
    */
   getDataValue(instance) {
      let result = {};
      let startData = this.processDataStart(instance);
      let previousData = this.processDataPrevious(instance);

      let getFieldValue = (object, fieldId, sourceData) => {
         if (!object) return null;

         let columnName;

         // Pull value of link object relation
         // data[__relation][COLUMN_NAME]
         if (fieldId.indexOf("|") > -1) {
            let linkFieldIds = fieldId.split("|");
            let field = object.fields((f) => f.id == linkFieldIds[0])[0];
            if (!field) return null;

            let objectLink = field.datasourceLink;
            if (!objectLink) return null;

            if (linkFieldIds[1] == "PK") {
               columnName = objectLink.PK();
            } else {
               let fieldLink = objectLink.fields(
                  (f) => f.id == linkFieldIds[1]
               )[0];
               if (!fieldLink) return null;

               columnName = fieldLink.columnName;
            }

            let data = sourceData[field.relationName()];
            if (!data) return null;

            return data[columnName];
         }
         // Pull value of the object
         else {
            if (fieldId == "PK") {
               columnName = object.PK();
            } else {
               let field = object.fields((f) => f.id == fieldId)[0];
               if (!field) return null;

               columnName = field.columnName;
            }

            return sourceData[columnName];
         }
      };

      Object.keys(this.fieldValues || {}).forEach((fieldId) => {
         let field = this.object.fields((f) => f.id == fieldId)[0];
         if (!field) return;

         let item = this.fieldValues[fieldId];
         switch (item.set) {
            case "1": // custom value
               result[field.columnName] = item.value;
               break;
            case "2": // update with root data
               result[field.columnName] = getFieldValue(
                  this.objectOfStartElem,
                  item.value,
                  startData
               );
               break;
            case "3": // update with previous data step
               result[field.columnName] = getFieldValue(
                  this.objectOfPrevElem,
                  item.value,
                  previousData
               );
               break;
            case "4": // formula value
               if (item.value) {
                  result[field.columnName] = eval(item.value);
               }
               break;
         }
      });

      return result;
   }
};
