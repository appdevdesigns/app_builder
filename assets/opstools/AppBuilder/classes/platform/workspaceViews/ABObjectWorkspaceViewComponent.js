// ABObjectWorkspaceViewComponent.js
//

module.exports = class ABObjectWorkspaceViewComponent {
   constructor(options) {
      this.elements =
         options.elements ||
         function() {
            return [];
         };
      this.init = options.init || function() {};
      this.validate =
         options.validate ||
         function() {
            return true;
         };
      this.values =
         options.values ||
         function() {
            return {};
         };
      this.logic = options.logic || {};
   }
};
