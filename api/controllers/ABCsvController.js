const ABGraphApplication = require("../graphModels/ABApplication");
const ABGraphDataCollection = require("../graphModels/ABDataview");
const ABObjectQuery = require("../classes/platform/ABObjectQuery");

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

                  result = page.views((v) => v.id == viewID, true)[0];
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

let getSQL = ({ viewCsv, userData, extraWhere }) => {
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
   let options = {
      where: where,
      sort: sort,
      populate: true
   };

   let query;
   if (obj instanceof ABObjectQuery) {
      query = ABMigration.connection().queryBuilder();
      query.from(obj.dbViewName());
   } else {
      query = obj.model().query();
   }

   return (
      Promise.resolve()
         .then(() => obj.populateFindConditions(query, options, userData))
         // Write SQL command
         .then(() => {
            let SQL;

            // Clear SELECT fields
            if (query.eager) query = query.eager("");
            if (query.clearEager) query = query.clearEager();
            query = query.clearSelect();

            // Convert display data to CSV file
            obj.fields().forEach((f) => {
               let select;
               let columnName = f.columnName;
               if (f.alias) columnName = `${f.alias}.${columnName}`;

               switch (f.key) {
                  case "connectObject":
                     // 1:M, 1:1 (isSource = true)
                     if (
                        f.settings.linkType == "one" &&
                        f.settings.linkViaType == "many"
                     ) {
                        select = `\`${columnName}\``;
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
                        select = `(SELECT GROUP_CONCAT(\`${joinColumnNames.targetColumnName}\` SEPARATOR ' & ') FROM \`${joinTablename}\` WHERE \`${joinColumnNames.sourceColumnName}\` = \`uuid\`)`;
                     }

                     break;
                  case "formula":
                     select = obj.convertFormulaField(f);
                     break;
                  case "calculate":
                  case "TextFormula":
                     // TODO
                     select = null;
                     break;
                  case "list":
                     select = `
                        CASE
                           ${(f.settings.options || [])
                              .map((opt) => {
                                 return `WHEN \`${columnName}\` = "${opt.id}" THEN "${opt.text}"`;
                              })
                              .join(" ")}
                           ELSE ""
                        END
                     `;
                     break;
                  case "string":
                  case "LongText":
                     if (f.isMultilingual) {
                        let transCol = (f.object instanceof ABObjectQuery
                           ? "`{prefix}.translations`"
                           : "{prefix}.translations"
                        ).replace("{prefix}", f.dbPrefix().replace(/`/g, ""));

                        let languageCode =
                           (userData || {}).languageCode || "en";

                        select = knex.raw(
                           'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({transCol}, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({transCol}, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))'
                              .replace(/{transCol}/g, transCol)
                              .replace(/{languageCode}/g, languageCode)
                              .replace(/{columnName}/g, columnName)
                        );
                     } else {
                        select = `IFNULL(\`${columnName}\`, '')`;
                     }
                     break;
                  default:
                     select = `IFNULL(\`${columnName}\`, '')`;
                     break;
               }

               if (select) query.select(knex.raw(select));
            });

            // Header at the first line
            let SQLHeader = "";
            if (viewCsv.settings.hasHeader == true) {
               // SELECT "One", "Two", "Three", "Four", "Five", "Six" UNION ALL
               SQLHeader = `SELECT ${obj
                  // TODO: fix .calculate and .TextFormula fields
                  .fields((f) => f.key != "calculate" && f.key != "TextFormula")
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

      let where = req.query;
      if (where && where.rules && typeof where.rules == "string") {
         where.rules = JSON.parse(where.rules);
      }

      let outputFilename;

      Promise.resolve()
         .then(() => getCsvWidget({ appID, pageID, viewID }))
         // Generate SQL command
         .then(
            (viewCsv) =>
               new Promise((next, bad) => {
                  outputFilename = viewCsv.settings.filename;

                  getSQL({
                     viewCsv,
                     userData: req.user.data,
                     // extraWhere: viewCsv.settings.where
                     extraWhere:
                        where && where.rules && where.rules.length
                           ? where
                           : null
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
         });
   }
};

module.exports = ABCsvController;
