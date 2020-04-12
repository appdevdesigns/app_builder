export default {
   isComponent: function(Component) {
      assert.isDefined(Component, "it should exist.");
      assert.isDefined(Component.ui, "should have a ui property");
      assert.isDefined(Component.init, "should have a init property");
      assert.isDefined(Component._logic, "should expose _logic property");
   },

   findElement: function(ui, condition) {
      var result;

      for (var key in ui) {
         if (result != null) break;

         var elem = ui[key];

         var conditionKey = Object.keys(condition)[0];
         if (conditionKey && elem[conditionKey] == condition[conditionKey]) {
            result = elem;
            break;
         }
         // process sub columns
         else if (elem.cols) {
            result = OP.Test.findElement(elem.cols, condition);
         } else if (elem.body && elem.body.cols) {
            result = OP.Test.findElement(elem.body.cols, condition);
         }
         // or rows
         else if (elem.rows) {
            result = OP.Test.findElement(elem.rows, condition);
            break;
         } else if (elem.body && elem.body.rows) {
            result = OP.Test.findElement(elem.body.rows, condition);
            break;
         }
         // or elements
         else if (elem.elements) {
            result = OP.Test.findElement(elem.elements, condition);
            break;
         } else if (elem.body && elem.body.elements) {
            result = OP.Test.findElement(elem.body.elements, condition);
            break;
         }
      }

      return result;
   }
};
