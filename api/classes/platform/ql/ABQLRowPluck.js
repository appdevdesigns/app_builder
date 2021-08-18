const ABQLRowPluckCore = require("../../core/ql/ABQLRowPluckCore.js");

class ABQLRowPluck extends ABQLRowPluckCore {
   do(chain, instance) {
      chain = chain.then((context) => {
         let nextContext = {
            label: "ABQLRowPluck",
            object: context.object,
            data: context.data,
            prev: context
         };

         // no data
         if (!context.data) {
            nextContext.log = "no data set! can't setPluck() of null.";
            return nextContext;
         }

         // convert to an array
         if (!Array.isArray(context.data)) nextContext.data = [context.data];

         return nextContext;
      });

      let nextLink = chain
         // resue pluck data function of ABQLSetPluck
         .then(() => super.do(chain, instance))
         // change label from "ABQLSetPluck" to "ABQLRowPluck"
         .then((context) => {
            context.label = "ABQLRowPluck";

            // Clean up the data to match the pluck field
            if (context.data) {
               // If the pluck field is the M:N, M:1 connect field, then it should pass an array data
               if (this.field.key == "connectObject" && this.field.settings.linkType == "many") {
                  // Convert to an array
                  if (!Array.isArray(context.data)) context.data = [context.data];
               }
               // Normal field should pass a single object value
               else if (Array.isArray(context.data)) {
                  if (context.data.length > 1) {
                     this.process.log(`The data values have more than 1. "${this.field.columnName}" does not support multiple values.`);
                     context.data = context.data[0];
                  }
                  else if (context.data.length == 1) {
                     context.data = context.data[0];
                  }
                  else if (context.data.length < 1) {
                     context.data = null;
                  }
               }
            }

            return context;
         });

      if (this.next) {
         return this.next.do(nextLink, instance);
      } else {
         return nextLink;
      }
   }
}

module.exports = ABQLRowPluck;
