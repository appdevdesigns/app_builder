/**
 * Import and export AppBuilder apps.
 */
var path = require("path");
const ABDefinition = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABDefinition"
));
const ABApplication = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABApplication"
));

module.exports = {
   /**
    * Export an application's metadata to JSON
    *
    * @param {string} appID
    *        the {uuid} of the ABApplication definition we are exporting.
    * @return {json} data
    *         a data structure that contains all the necessary definitions
    *         to recreate an Application in an AB Runtime environment.
    */
   appToJSON: function(appID) {
      var data = {
         abVersion: "0.0.0",
         definitions: []
      };
      var Application = null;

      return new Promise((resolve, reject) => {
         var def = ABDefinition.definition(appID);
         if (def) {
            Application = new ABApplication(def);
         }

         if (!Application) {
            var error = new Error("Not Found");
            error.code = 404;
            error.detailMsg = `AppBuilderExport.appToJSON(): Can't find Application ID [${appID}]`;
            return reject(error);
         }

         // gathering all the Definition, IDs:
         var ids = [];
         Application.exportIDs(ids);

         // for a thorough list, there will be duplicate ids, so lets only include
         // unique entries:
         // ids = _.uniq(ids);
         ids.forEach((id) => {
            if (id) {
               // NOTE: go directly to the Model to get the full ABDefinition entry:
               data.definitions.push(ABDefinitionModel.objForID(id));
            }
         });
         resolve(data);
      });
   },

   /**
    * Import JSON data to create an application.
    *
    * @param JSON data
    *      This is the JSON object produced by appToJSON()
    */
   appFromJSON: function(data) {
      var Application = ABSystemObject.getApplication();
      var hashSaved = {};
      var allObjects = [];

      return new Promise((resolve, reject) => {
         Promise.resolve()
            .then(() => {
               // Insert all the ABDefinitions for Applications, fields and objects:
               var allSaves = [];
               (data.definitions || [])
                  .filter(
                     (d) =>
                        ["object", "field", "application"].indexOf(d.type) > -1
                  )
                  .forEach((def) => {
                     hashSaved[def.id] = def;
                     allSaves.push(
                        ABDefinitionModel.create(def).catch((err) => {
                           //                            console.log(`>>>>>>>>>>>>>>>>>>>>>>
                           // ${err.toString()}
                           // >>>>>>>>>>>>>>>>>>>>>>`);

                           if (err.toString().indexOf("already exists") > -1) {
                              // console.log("===> trying an update instead.");
                              return ABDefinitionModel.update(def.id, def);
                           }
                        })
                     );
                  });

               return Promise.all(allSaves);
            })
            .then(() => {
               // create instances of all objects first.
               (data.definitions || [])
                  .filter((d) => d.type == "object")
                  .forEach((o) => {
                     var object = Application.objectNew(o.json);
                     allObjects.push(object);
                  });
            })
            .then(() => {
               // now load all the Objects, and do a .migrageCreate() on them:
               // NOTE: there is a timing issue with ABFieldConnect fields.

               var allMigrates = [];
               (allObjects || []).forEach((object) => {
                  allMigrates.push(
                     ABMigration.createObject(object).catch((err) => {
                        console.log(`>>>>>>>>>>>>>>>>>>>>>>
ABMigration.createObject() error:
${err.toString()}
>>>>>>>>>>>>>>>>>>>>>>`);
                     })
                  );
               });

               return Promise.all(allMigrates);
            })
            .then(() => {
               // now save all the rest:
               var allSaves = [];
               (data.definitions || []).forEach((def) => {
                  if (!hashSaved[def.id]) {
                     allSaves.push(
                        ABDefinitionModel.create(def).catch((err) => {
                           console.log(`>>>>>>>>>>>>>>>>>>>>>>
ABDefinitionModel.create() error:
${err.toString()}
>>>>>>>>>>>>>>>>>>>>>>`);

                           if (err.toString().indexOf("already exists") > -1) {
                              // console.log("===> trying an update instead.");
                              return ABDefinitionModel.update(def.id, def);
                           }
                        })
                     );
                  }
               });
               return Promise.all(allSaves);
            })
            .then(() => {
               resolve(data);
            });
      });
   }
};
