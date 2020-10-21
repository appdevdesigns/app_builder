const path = require("path");

const ABApplication = require(path.join(
   "..",
   "classes",
   "platform",
   "ABApplication"
));

/**
 * @method getCsvWidget
 *
 * @param {uuid} appID
 * @param {uuid} pageID
 * @param {uuid} viewID
 *
 * @return {Promise} resolve(ABDefinition of the CSVView)
 */
let getCsvWidget = ({ appID, pageID, viewID }) => {
   // Question: there is nothing Async about this fn().
   // Why are we using a Promise here?
   return new Promise((resolve, reject) => {
      // All we need to do here is find the definition for our CSV widget
      // and create an instance of a DataCollection it references.

      // Find the Definition for the CSV Widget
      let def = ABApplication.definitionForID(viewID);
      if (!def) {
         return reject(
            new Error(
               `ABCsvController:getCsvWidget(): unable to find CSV Widget with ID[${viewID}]`
            )
         );
      }

      // make a cloned copy of the Definition to work with:
      let defCSV = JSON.parse(JSON.stringify(def));

      // do we have a valid DC defined?
      defCSV.settings = defCSV.settings || {};
      if (!defCSV.settings.dataviewID)
         return reject(
            new Error(
               `ABCsvController:getCsvWidget(): CSV Widget [${viewID}] has not defined a DataCollection.`
            )
         );

      // convert string settings -> boolean
      if (typeof defCSV.settings.hasHeader == "string")
         defCSV.settings.hasHeader = JSON.parse(defCSV.settings.hasHeader);

      // create an instance of the DataCollection
      var defDC = ABApplication.definitionForID(defCSV.settings.dataviewID);
      if (!defDC) {
         return reject(
            new Error(
               `ABCSVController:getCsvWidget():unable to find ABDataCollection for ID[${result.settings.dataviewID}]`
            )
         );
      }

      let app = ABApplication.applicationForID(appID);
      if (!app)
         return fail(new Error(`Could not find application for ID[${appID}]`));

      defCSV.___csv_datacollection = app.datacollectionNew(defDC);

      resolve(defCSV);
   });
};

let getSQL = ({ defCSV, userData, extraWhere }) => {
   let dc = defCSV.___csv_datacollection;
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

            // Clear SELECT fields
            query.eager("").clearSelect();

            // Convert display data to CSV file
            obj.fields().forEach((f) => {
               let select;

               switch (f.key) {
                  case "connectObject":
                     // 1:M, 1:1 (isSource = true)
                     if (
                        f.settings.linkType == "one" &&
                        f.settings.linkViaType == "many"
                     ) {
                        select = f.columnName;
                     }
                     // M:1, 1:1 (isSource = false)
                     else if (
                        f.settings.linkType == "many" &&
                        f.settings.linkViaType == "one"
                     ) {
                        let objLink = f.datasourceLink;
                        let fieldLink = f.fieldLink;
                        if (objLink && fieldLink) {
                           let sourceColumnName = f.indexField
                              ? f.indexField.columnName
                              : "uuid";
                           select = `(SELECT GROUP_CONCAT(\`uuid\` SEPARATOR ' & ') FROM \`${objLink.tableName}\` WHERE \`${fieldLink.columnName}\` = \`${obj.tableName}\`.\`${sourceColumnName}\`)`;
                        }
                     }
                     // M:N
                     else if (
                        f.settings.linkType == "many" &&
                        f.settings.linkViaType == "many"
                     ) {
                        let joinTablename = f.joinTableName();
                        let joinColumnNames = f.joinColumnNames();
                        select = `(SELECT GROUP_CONCAT(\`${joinColumnNames.targetColumnName}\` SEPARATOR ' & ') FROM \`${joinTablename}\` WHERE ${joinColumnNames.sourceColumnName} = \`uuid\`)`;
                     }

                     break;
                  case "list":
                     select = `
                        CASE
                           ${(f.settings.options || [])
                              .map((opt) => {
                                 return `WHEN \`${f.columnName}\` = "${opt.id}" THEN "${opt.text}"`;
                              })
                              .join(" ")}
                           ELSE ""
                        END
                     `;
                     break;
                  case "string":
                  case "LongText":
                     if (f.isMultilingual) {
                        let transCol = (this.viewName
                           ? "`{prefix}.translations`"
                           : "{prefix}.translations"
                        ).replace("{prefix}", f.dbPrefix().replace(/`/g, ""));

                        let languageCode =
                           (userData || {}).languageCode || "en";

                        select = knex.raw(
                           'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({transCol}, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({transCol}, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))'
                              .replace(/{transCol}/g, transCol)
                              .replace(/{languageCode}/g, languageCode)
                              .replace(/{columnName}/g, f.columnName)
                        );
                     } else {
                        select = `IFNULL(\`${f.columnName}\`, '')`;
                     }
                     break;
                  default:
                     select = `IFNULL(\`${f.columnName}\`, '')`;
                     break;
               }

               if (select) query.select(knex.raw(select));
            });

            // Header at the first line
            let SQLHeader = "";
            if (defCSV.settings.hasHeader == true) {
               // SELECT "One", "Two", "Three", "Four", "Five", "Six" UNION ALL
               SQLHeader = `SELECT ${obj
                  .fields()
                  .map((f) => `"${f.label}"`)
                  .join(",")} UNION ALL`;
            }

            try {
               // SQL = `${SQLHeader} ${query.toString()}
               SQL = `${SQLHeader} ${query.debug()}`;
            } catch (e) {}

            return Promise.resolve(SQL);
         })
         // Execute Mysql to Generate CSV file
         .then((SQL) => Promise.resolve(() => knex.raw(SQL)))
   );
};

let ABCsvController = {
   // GET /app_builder/application/:appID/page/:pageID/view/:viewID/csv
   exportCsv(req, res) {
      let appID = req.param("appID");
      let pageID = req.param("pageID");
      let viewID = req.param("viewID");

      let outputFilename;

      Promise.resolve()
         .then(() => getCsvWidget({ appID, pageID, viewID }))
         // Generate SQL command
         .then(
            (defCSV) =>
               new Promise((next, bad) => {
                  outputFilename = defCSV.settings.filename;

                  getSQL({
                     defCSV,
                     userData: req.user.data,
                     extraWhere: defCSV.settings.where
                  })
                     .catch(bad)
                     .then((getKnexQuery) => {
                        // Get SQL stream
                        let knexQuery = getKnexQuery();
                        let stream = knexQuery.stream();

                        next(stream);
                     });
               })
         )
         .then((sqlStream) => {
            if (!sqlStream) {
               return res.AD.error("Could not connect to SQL streaming", 500);
            }

            // Set res header
            res.setHeader(
               "Content-disposition",
               `attachment; filename=${outputFilename}.csv`
            );

            sqlStream.on("close", () => {
               res.end();
            });
            sqlStream.on("finish", () => {
               res.end();
            });

            sqlStream.on("data", (result) => {
               res.write(`${Object.values(result).join(",")}\r\n`);
            });
         })
         .catch((err) => {
            sails.log.error(err);
            if (err.toString().indexOf("EE_CANTCREATEFILE") != -1) {
               err = new Error(
                  "Database was unable to create CSV file. Please check the file permissions and try again."
               );
            }

            res.AD.error(err, 500);
         });
   }
};

module.exports = ABCsvController;
