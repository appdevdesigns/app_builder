// Namespacing conventions:
// OP.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
OP.Model.extend(
   "opstools.BuildApp.ABUser",
   {
      useSockets: true,
      restURL: "/app_builder/abuser"

      // static methods
   },
   {
      // instance Methods
   }
);
