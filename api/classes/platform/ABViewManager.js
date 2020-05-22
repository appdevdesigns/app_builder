const ABView = require("./views/ABView");

module.exports = class ABViewManager {
   static allViews(fn) {
      fn =
         fn ||
         function() {
            return true;
         };

      let views = [];
      views.push(ABView);

      return views.filter(fn);
   }

   static newView(values, application, parent) {
      return new ABView(values, application, parent);
   }
};
