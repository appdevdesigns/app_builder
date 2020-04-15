const FilterComplexCore = require("../core/FilterComplexCore");

module.exports = class FilterComplex extends FilterComplexCore {
   constructor(App, idBase) {
      super(App, idBase);

      let L = this.Label;

      let labels = (this.labels = {
         common: (App || {}).labels,
         component: {
            and: L("ab.filter_fields.and", "*And"),
            or: L("ab.filter_fields.or", "*Or"),
            addNewFilter: L("ab.filter_fields.addNewFilter", "*Add a filter"),

            thisObject: L("ab.filter_fields.thisObject", "*This Object"),
            inQuery: L("ab.filter_fields.inQuery", "*In Query"),
            notInQuery: L("ab.filter_fields.notInQuery", "*Not In Query"),
            inQueryField: L("ab.filter_fields.inQueryField", "*By Query Field"),
            notInQueryField: L(
               "ab.filter_fields.notInQueryField",
               "*Not By Query Field"
            ),

            inQueryFieldQueryPlaceholder: L(
               "ab.filter_fields.inQueryFieldQueryPlaceholder",
               "*Choose a Query"
            ),
            inQueryFieldFieldPlaceholder: L(
               "ab.filter_fields.inQueryFieldFieldPlaceholder",
               "*Choose a Field"
            ),

            sameAsUser: L("ab.filter_fields.sameAsUser", "*Same As User"),
            notSameAsUser: L(
               "ab.filter_fields.notSameAsUser",
               "*Not Same As User"
            ),

            sameAsField: L("ab.filter_fields.sameAsFild", "*Same As Field"),
            notSameAsField: L("ab.filter_fields.notSameAsFild", "*Not Field"),

            inDataCollection: L(
               "ab.filter_fields.inDataCollection",
               "*In Data Collection"
            ),
            notInDataCollection: L(
               "ab.filter_fields.notInDataCollection",
               "*Not In Data Collection"
            ),

            containsCondition: L(
               "ab.filter_fields.containsCondition",
               "*contains"
            ),
            notContainCondition: L(
               "ab.filter_fields.notContainCondition",
               "*doesn't contain"
            ),
            isCondition: L("ab.filter_fields.isCondition", "*is"),
            isNotCondition: L("ab.filter_fields.isNotCondition", "*is not"),

            beforeCondition: L(
               "ab.filter_fields.beforeCondition",
               "*is before"
            ),
            afterCondition: L("ab.filter_fields.afterCondition", "*is after"),
            onOrBeforeCondition: L(
               "ab.filter_fields.onOrBeforeCondition",
               "*is on or before"
            ),
            onOrAfterCondition: L(
               "ab.filter_fields.onOrAfterCondition",
               "*is on or after"
            ),
            beforeCurrentCondition: L(
               "ab.filter_fields.beforeCurrentCondition",
               "*is before current date"
            ),
            afterCurrentCondition: L(
               "ab.filter_fields.afterCurrentCondition",
               "*is after current date"
            ),
            onOrBeforeCurrentCondition: L(
               "ab.filter_fields.onOrBeforeCurrentCondition",
               "*is on or before current date"
            ),
            onOrAfterCurrentCondition: L(
               "ab.filter_fields.onOrAfterCurrentCondition",
               "*is on or after current date"
            ),
            onLastDaysCondition: L(
               "ab.filter_fields.onLastDaysCondition",
               "*last ... days"
            ),
            onNextDaysCondition: L(
               "ab.filter_fields.onNextDaysCondition",
               "*next ... days"
            ),

            equalCondition: L("ab.filter_fields.equalCondition", ":"),
            notEqualCondition: L("ab.filter_fields.notEqualCondition", "≠"),
            lessThanCondition: L("ab.filter_fields.lessThanCondition", "<"),
            moreThanCondition: L("ab.filter_fields.moreThanCondition", ">"),
            lessThanOrEqualCondition: L(
               "ab.filter_fields.lessThanOrEqualCondition",
               "≤"
            ),
            moreThanOrEqualCondition: L(
               "ab.filter_fields.moreThanOrEqualCondition",
               "≥"
            ),

            equalListCondition: L(
               "ab.filter_fields.equalListCondition",
               "*equals"
            ),
            notEqualListCondition: L(
               "ab.filter_fields.notEqualListCondition",
               "*does not equal"
            ),

            checkedCondition: L(
               "ab.filter_fields.checkedCondition",
               "*is checked"
            ),
            notCheckedCondition: L(
               "ab.filter_fields.notCheckedCondition",
               "*is not checked"
            ),

            isCurrentUserCondition: L(
               "ab.filter_fields.isCurrentUserCondition",
               "*is current user"
            ),
            isNotCurrentUserCondition: L(
               "ab.filter_fields.isNotCurrentUserCondition",
               "*is not current user"
            ),
            containsCurrentUserCondition: L(
               "ab.filter_fields.containsCurrentUserCondition",
               "*contains current user"
            ),
            notContainsCurrentUserCondition: L(
               "ab.filter_fields.notContainsCurrentUserCondition",
               "*does not contain current user"
            )
         }
      });

      // internal list of Webix IDs to reference our UI components.
      let ids = (this.ids = {
         filterForm: `${idBase}_filter_form`,
         popup: `${idBase}_popup`,
         querybuilder: `${idBase}_querybuilder`
      });

      // webix UI definition:
      this.ui = {
         rows: [
            {
               view: "form",
               id: ids.filterForm,
               // hidden: true,
               elements: [
                  {
                     view: "querybuilder",
                     id: ids.querybuilder,
                     fields: [],
                     filters: []
                  }
               ]
            },
            {
               view: "button",
               value: "Save",
               click: () => {
                  this.condition = $$(this.ids.querybuilder).getValue();
                  $$(this.ids.popup).hide();
                  this.emit("save", this.condition);
               }
            }
         ]
      };
   }

   // setting up UI
   init(options) {
      super.init(options);
   }

   popUp() {
      var ui = {
         id: this.ids.popup,
         view: "popup",
         position: "center",
         height: 500,
         width: 1000,
         body: this.ui
      };

      this.myPopup = webix.ui(ui);
      if (this.condition) {
         $$(this.ids.querybuilder).setValue(this.condition);
      }

      this.myPopup.show();
   }

   setValue(settings) {
      this.condition = settings;
   }
};
