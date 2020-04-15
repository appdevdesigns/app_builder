// Namespacing conventions:
// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
AD.Model.Base.extend(
   "opstools.BuildApp.ABUser",
   {
      findAll: "GET /app_builder/abuser",
      findOne: "GET /app_builder/abuser/{id}",
      create: "POST /app_builder/abuser",
      update: "PUT /app_builder/abuser/{id}",
      destroy: "DELETE /app_builder/abuser/{id}",
      describe: function() {
         return { username: "string", password: "text" };
      },
      fieldId: "id",
      fieldLabel: "username"
   },
   {
      // model: function() {
      //     return AD.Model.get('opstools.BuildApp.ABApplication'); //AD.models.opstools.BuildApp.ABApplication;
      // },
      // getID: function() {
      //     return this.attr(this.model().fieldId) || 'unknown id field';
      // },
      // getLabel: function() {
      //     return this.attr(this.model().fieldLabel) || 'unknown label field';
      // }
   }
);
