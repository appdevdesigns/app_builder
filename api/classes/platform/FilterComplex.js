const FilterComplexCore = require("../core/FilterComplexCore");

module.exports = class FilterComplex extends FilterComplexCore {
   constructor(App, idBase) {
      idBase = idBase || "ab_row_filter";

      super(App, idBase);
   }
};
