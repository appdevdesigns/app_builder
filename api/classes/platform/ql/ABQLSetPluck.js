/*
 * ABQLSetPluck
 *
 * An ABQLSetPluck can process a set (array) of data and puck out a specified
 * field from each row to then make an array of values that only contain that 
 * field.
 * 
 * Example: 
array = [
 {
   name: "Neo",
   email: "neo@thematrix.com",
   relationships: [ { morpheous}, {trinity} ]
 },
 {
   name: "trinity",
   email: "trinity@thematrix.com",
   relationships: [ {neo}, {morpheous} ]
 },
 {
   name: "morpheous",
   email: "morpheous@thematrix.com",
   relationships: [ {neo}, {trinity}]
 }

]

pluck("email") :
   [
      "neo@thematrix.com",
      "trinity@thematrix.com",
      "morpheous@thematrix.com"
   ]

pluck("relationships"):
   [
      {neo},
      {trinity},
      {morpheous}
   ]
 *
 */
const _ = require("lodash");

const ABQLSetPluckCore = require("../../core/ql/ABQLSetPluckCore.js");

class ABQLSetPluck extends ABQLSetPluckCore {
   // constructor(attributes, prevOP, task, application) {
   //     super(attributes, [], prevOP, task, application);
   // }
   ///
   /// Instance Methods
   ///

   /**
    * do()
    * perform the action for this Query Language Operation.
    * @param {Promise} chain
    *         the current promise chain of actions being performed.
    * @param {obj} instance
    *        The current process instance values used by our tasks to store
    *        their state/values.
    * @return {Promise}
    */
   do(chain, instance) {
      if (!chain) {
         throw new Error("ABQLSetPluck.do() called without a Promise chain!");
      }

      // capture the new promise from the .then() and
      // return that as the next link in the chain
      var nextLink = chain.then((context) => {
         var nextContext = {
            label: "ABQLSetPluck",
            object: context.object,
            data: null,
            prev: context
         };

         if (!context.data) {
            // weird!  pass along our context with data == null;
            nextContext.log = "no data set! can't setPluck() of null.";
            return nextContext;
         }

         // make sure we are working with an Array
         if (Array.isArray(context.data)) {
            // make sure we have a reference to our .field
            if (!this.field) {
               // v2 method:
               // this.field = this.object.fieldByID(this.fieldID);
               this.field = this.object.fields((f) => f.id == this.fieldID)[0];
            }
            if (!this.field) {
               // whoops!
               throw new Error(
                  "ABQLSetPluck.do(): unable to resolve .fieldID."
               );
            }

            // CASE 1:  Connected Objects:
            // v2 refenece:
            // if (this.field.isConnection) {
            if (this.field.key == "connectObject") {
               var linkObj = this.field.datasourceLink;
               var PK = linkObj.PK();

               // we need to go lookup the connected values:
               var ids = [];
               context.data.forEach((d) => {
                  var entry = this.field.dataValue(d);
                  if (!Array.isArray(entry)) entry = [entry];
                  entry.forEach((e) => {
                     var id = e[PK] || e;
                     if (id) {
                        ids.push(id);
                     }
                  });
               });

               // in v2:
               // use .find() and:
               // var cond = {};
               // cond[PK] = _.uniq(ids);

               var cond = {
                  key: PK,
                  rule: "in",
                  value: _.uniq(ids)
               };

               return new Promise((resolve, reject) => {
                  linkObj
                     .modelAPI()
                     .findAll({ where: cond, populate: true })
                     .then((rows) => {
                        
                        // Special Formatting for Form.io fields.
                        // Allow displaying connected data that has been .format()ed
                        // find any connectedObjects
                        var linkedConnections = linkObj.connectFields();
                        (linkedConnections || []).forEach((f) => {
                           // for each row
                           (rows || []).forEach((r) => {
                              // insert a formatted entry
                              r[`${f.columnName}.format`] = f.format(r);
                           });
                        });
                        // Calculate and TextFormula fields do not have stored
                        // values so we need to run .format() for each instance
                        var fieldsToFormat = ["calculate","TextFormula"];
                        var formatFields = linkObj.fields((f) => {
                           return fieldsToFormat.indexOf(f.key) != -1;
                        });
                        (formatFields || []).forEach((f) => {
                           // for each row
                           (rows || []).forEach((r) => {
                              // insert a formatted entry
                              r[f.columnName] = f.format(r);
                           });
                        });

                        nextContext._condition = cond;
                        nextContext.object = linkObj;
                        nextContext.data = rows;
                        resolve(nextContext);
                     })
                     .catch((err) => {
                        reject(err);
                     });
               });
            }

            // CASE 2: pluck out single values:
            var newData = [];
            context.data.forEach((d) => {
               newData.push(this.field.dataValue(d));
            });
            nextContext.data = newData;
            return nextContext;
         } else {
            // this shouldn't happen!
            throw new Error("ABQLSetPluck.do() called on non Array of data.");
         }
      });

      if (this.next) {
         return this.next.do(nextLink, instance);
      } else {
         return nextLink;
      }
   }
}

module.exports = ABQLSetPluck;
