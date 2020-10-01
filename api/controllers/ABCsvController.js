const fs = require("fs");
const uuid = require("uuid/v4");
const ABGraphApplication = require("app_builder/api/graphModels/ABApplication");
const ABGraphDataCollection = require("app_builder/api/graphModels/ABDataview");

const OUTPUT_PATH =
   sails.config.appbuilder["csvOutputPath"] || "/var/lib/mysql-files";

/**
 * @method getCsvWidget
 *
 * @param {uuid} appID
 * @param {uuid} pageID
 * @param {uuid} viewID
 *
 * @return {Promise} resolve(ABView)
 */
let getCsvWidget = ({ appID, pageID, viewID }) => {
   let app;
   let result;
   return (
      Promise.resolve()
         // Pull the application
         .then(() => ABGraphApplication.findOne(appID))
         // Pull CSV widget
         .then(
            (application) =>
               new Promise((next, fail) => {
                  if (!application) return fail("Could not found application");
                  app = application.toABClass();

                  let page = app.pages((p) => p.id == pageID)[0];
                  if (!page) return fail("Could not found page");

                  result = page.views((v) => v.id == viewID)[0];
                  if (!result)
                     return fail("Could not found CSV exporter widget");

                  next();
               })
         )
         // Pull Data collections
         .then(
            () =>
               new Promise((next, fail) => {
                  result.settings = result.settings || {};
                  if (!result.settings.dataviewID) return next();

                  ABGraphDataCollection.find({
                     where: { _key: result.settings.dataviewID }
                  })
                     .catch(fail)
                     .then((DCs) => {
                        (DCs || []).forEach((dc) => {
                           if (dc) {
                              let dcClass = dc.toABClass(app);

                              dcClass.__datasource = app.objects(
                                 (o) => o.id == dc.settings.datasourceID
                              )[0];

                              app._datacollections.push(dcClass);
                           }
                        });

                        next();
                     });
               })
         )
         // Final
         .then(() => Promise.resolve(result))
   );
};

let generateCsv = ({ viewCsv, userData, filename, extraWhere }) => {
   let dc = viewCsv.datacollection;
   if (!dc) return Promise.resolve();

   let obj = dc.datasource;
   if (!obj) return Promise.resolve();

   let where = {
      glue: "and",
      rules: []
   };
   let sort;

   if (dc.settings) {
      if (
         dc.settings.objectWorkspace &&
         dc.settings.objectWorkspace.filterConditions
      )
         where.rules.push(dc.settings.objectWorkspace.filterConditions);

      if (dc.settings.objectWorkspace && dc.settings.objectWorkspace.sortFields)
         sort = dc.settings.objectWorkspace.sortFields;
   }

   if (extraWhere) {
      where.rules.push(extraWhere);
   }

   // TODO: Filter cursor of parent DC
   // {
   //    alias: fieldLink.alias, // ABObjectQuery
   //    key: Object.keys(params)[0],
   //    rule: fieldLink.alias ? "contains" : "equals", // NOTE: If object is query, then use "contains" because ABOBjectQuery return JSON
   //    value: fieldLink.getRelationValue(
   //       dataCollectionLink.__dataCollection.getItem(
   //          value
   //       )
   //    )
   // }

   let knex = ABMigration.connection();
   let query = obj.model().query();
   let options = {
      where: where,
      sort: sort,
      populate: true
   };

   return (
      Promise.resolve()
         .then(() => obj.populateFindConditions(query, options, userData))
         // Write SQL command
         .then(() => {
            let SQL;

            obj.fields().forEach((f) => {
               if (f.key == "connectObject") return;

               query.select(knex.raw(`IFNULL(\`${f.columnName}\`, '')`));
            });

            try {
               SQL = query.toString();
console.log(SQL);
               SQL = `${SQL}
            INTO OUTFILE '/var/lib/mysql-files/${filename}.csv'
            FIELDS TERMINATED BY ','
            ENCLOSED BY '"'
            ESCAPED BY ''
            LINES TERMINATED BY '\n'`;
            } catch (e) {}

            return Promise.resolve(SQL);
         })
         // Execute Mysql to Generate CSV file
         .then((SQL) => {
            return knex.raw(SQL);
         })
   );
};

let ABCsvController = {
   // GET /app_builder/application/:appID/page/:pageID/view/:viewID/csv
   exportCsv(req, res) {
      let appID = req.param("appID");
      let pageID = req.param("pageID");
      let viewID = req.param("viewID");

      let extraWhere = req.body || {};
      let outputFilename;
      let filename = uuid();

      Promise.resolve()
         .then(() => getCsvWidget({ appID, pageID, viewID }))
         .then((viewCsv) => {
            outputFilename = viewCsv.settings.filename;
            return generateCsv({
               viewCsv,
               userData: req.user.data,
               filename,
               where: extraWhere
            });
         })
         .then(() => {
            let outputFile = `${OUTPUT_PATH}/${filename}.csv`;

            // check exists CSV file
            fs.access(outputFile, fs.constants.F_OK, (err) => {
               if (err) {
                  res.AD.success();
                  return;
               }

               // Set res header
               res.setHeader(
                  "Content-disposition",
                  `attachment; filename=${outputFilename}.csv`
               );

               // stream file to response
               fs.createReadStream(`${OUTPUT_PATH}/${filename}.csv`)
                  .on("error", function(err) {
                     return res.AD.error(err, 500);
                  })
                  .pipe(res);
            });
         });
   }
};

module.exports = ABCsvController;
