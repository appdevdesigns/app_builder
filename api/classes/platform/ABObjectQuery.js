const path = require("path");
const _ = require("lodash");

const ABObjectQueryCore = require(path.join(
   __dirname,
   "..",
   "core",
   "ABObjectQueryCore"
));
const ABObjectExternal = require(path.join(__dirname, "ABObjectExternal"));
const ABObjectImport = require(path.join(__dirname, "ABObjectImport"));

const ABFieldConnect = require(path.join(
   __dirname,
   "dataFields",
   "ABFieldConnect"
));

const Model = require("objection").Model;

module.exports = class ABClassQuery extends ABObjectQueryCore {
   ///
   /// Migration Services
   ///

   dbViewName(prefixSchema = false) {
      if (prefixSchema) {
         // pull database name
         var schemaName = this.dbSchemaName();

         return "#schema#.#table#"
            .replace("#schema#", schemaName)
            .replace("#table#", this.viewName);
      } else {
         return this.viewName;
      }
   }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *        the array of ids to store any relevant .ids into.
    */
   exportIDs(ids) {
      // make sure we don't get into an infinite loop:
      if (ids.indexOf(this.id) > -1) return;
      ids.push(this.id);

      // include my fields:
      this.objects().forEach((o) => {
         o.exportIDs(ids);
      });
   }

   /**
    * migrateCreateTable
    * verify that a table for this object exists.
    * @param {Knex} knex the knex sql library manager for manipulating the DB.
    * @return {Promise}
    */
   migrateCreate(knex) {
      sails.log.verbose("ABClassQuery.migrateCreate()");
      sails.log.debug(
         "ABClassQuery.migrateCreate() called, but no migrations allowed."
      );

      let query = ABMigration.connection().queryBuilder();

      //// Now compile our joins:

      let processJoin = (baseObject, baseAlias, joins) => {
         (joins || []).forEach((link) => {
            // no link column
            if (!link.fieldID) return;

            // NOTE: query v1
            if (link.objectURL)
               baseObject = this.application.urlResolve(link.objectURL);

            // NOTE: query v1
            if (!baseAlias) baseAlias = baseObject.dbTableName(true);

            let connectionField = baseObject.fields((f) => {
               return f.id == link.fieldID;
            })[0];
            if (!connectionField) return; // no link so skip this turn.

            let connectedObject = connectionField.datasourceLink;
            let joinTable = connectedObject.dbTableName(true);

            let fieldLinkType = connectionField.linkType();
            let fieldIndex = connectionField.indexField;

            let joinAlias = link.alias;

            // NOTE: query v1
            let aliasName = link.alias;
            if (!aliasName) aliasName = joinTable;

            switch (fieldLinkType) {
               case "one":
                  if (
                     connectionField.settings.isSource || // 1:1 - this column is source
                     connectionField.linkViaType() == "many" // 1:M
                  ) {
                     // 1:M
                     // the base object can have 1 connected object
                     // the base object has the remote obj's .id in our field
                     // baseObject JOIN  connectedObject ON baseObject.columnName = connectedObject.id

                     // columnName comes from the baseObject
                     let columnName = connectionField.columnName;
                     let baseClause = `${baseAlias}.${columnName}`;
                     let connectedClause = `${aliasName}.${
                        fieldIndex
                           ? fieldIndex.columnName
                           : connectedObject.PK()
                     }`;
                     makeLink(
                        baseObject,
                        link,
                        joinTable,
                        joinAlias,
                        baseClause,
                        "=",
                        connectedClause
                     );
                  } else {
                     // 1:1 NOT .isSource
                     // the base object can have 1 connected object
                     // the base object's .id is in the connected Objects' colum
                     // baseObject JOIN  connectedObject ON baseObject.id = connectedObject.columnName

                     // columnName comes from the baseObject
                     let connectedField = connectionField.fieldLink;
                     if (!connectedField) return; // this is a problem!

                     let columnName = connectedField.columnName;
                     let baseClause = `${baseAlias}.${
                        fieldIndex ? fieldIndex.columnName : baseObject.PK()
                     }`;
                     let connectedClause = `${aliasName}.${columnName}`;
                     makeLink(
                        baseObject,
                        link,
                        joinTable,
                        joinAlias,
                        baseClause,
                        "=",
                        connectedClause
                     );
                  }
                  break;

               case "many":
                  // M:1
                  if (connectionField.linkViaType() == "one") {
                     // the base object can have many connectedObjects
                     // the connected object can only have one base object
                     // the base object's .id is stored in connected objects column
                     // baseObject JOIN connectedObject ON baseObject.id == connectedObject.columnName

                     // columnName comes from the baseObject
                     let connectedField = connectionField.fieldLink;
                     if (!connectedField) return; // this is a problem!

                     let columnName = connectedField.columnName;
                     let baseClause = `${baseAlias}.${
                        fieldIndex ? fieldIndex.columnName : baseObject.PK()
                     }`;
                     let connectedClause = `${aliasName}.${columnName}`;
                     makeLink(
                        baseObject,
                        link,
                        joinTable,
                        joinAlias,
                        baseClause,
                        "=",
                        connectedClause
                     );
                  } else {
                     // TODO: alias name M:N

                     // M:N connection
                     // the base object can have Many connectedObjects
                     // the connected object can have Many baseObjects
                     // There is going to be a join table connecting the two:
                     // the base object's .id is stored in connected objects column
                     // baseObject JOIN joinTable ON baseObject.id == joinTable.[baseColumnName]
                     // 		JOIN connectedObject ON joinTable.[connectedObjectName] == connectedObject.id

                     //// Make Base Connection
                     // get joinTable
                     joinTable = connectionField.joinTableName(true);

                     // get baseObjectColumn in joinTable
                     let baseObjectColumn = baseObject.name; // AppBuilder.rules.toJunctionTableFK(baseObject.name, connectionField.columnName);

                     let connectedAlias = null;
                     if (joinAlias) connectedAlias = joinAlias + "_MN"; // alias name of M:N connection

                     let customIndex = baseObject.PK();
                     let indexField = connectionField.indexField;
                     let indexField2 = connectionField.indexField2;

                     if (indexField && indexField.object.id == baseObject.id) {
                        customIndex = indexField.columnName;
                     } else if (
                        indexField2 &&
                        indexField2.object.id == baseObject.id
                     ) {
                        customIndex = indexField2.columnName;
                     }

                     let baseClause = baseAlias + "." + customIndex;
                     let joinClause =
                        (connectedAlias || joinTable) + "." + baseObjectColumn;

                     // make JOIN
                     makeLink(
                        baseObject,
                        link,
                        joinTable,
                        connectedAlias,
                        baseClause,
                        "=",
                        joinClause
                     );

                     //// Now connect connectedObject
                     // get connectedObjectColumn in joinTable
                     // let connectedField = connectionField.fieldLink;
                     let connectedObjectColumn = connectedObject.name; // AppBuilder.rules.toJunctionTableFK(connectedObject.name, connectedField.columnName);

                     let customIndex2 = connectedObject.PK();

                     if (
                        indexField &&
                        indexField.object.id == connectedObject.id
                     ) {
                        customIndex2 = indexField.columnName;
                     } else if (
                        indexField2 &&
                        indexField2.object.id == connectedObject.id
                     ) {
                        customIndex2 = indexField2.columnName;
                     }

                     let connectedClause = aliasName + "." + customIndex2;
                     joinClause =
                        (connectedAlias || joinTable) +
                        "." +
                        connectedObjectColumn;

                     // make JOIN
                     makeLink(
                        baseObject,
                        link,
                        connectedObject.dbTableName(true),
                        joinAlias,
                        connectedClause,
                        "=",
                        joinClause
                     );
                  }
                  break;
            }

            processJoin(connectedObject, link.alias, link.links);
         });
      };

      let makeLink = (object, link, joinTable, alias, A, op, B) => {
         console.log("link.type:" + link.type);

         // try to correct some type mistakes:
         let type = link.type.toLowerCase();
         let convertHash = {
            left: "leftJoin",
            leftjoin: "leftJoin",
            leftouterjoin: "leftOuterJoin",
            right: "rightJoin",
            rightjoin: "rightJoin",
            rightouterjoin: "rightOuterJoin",
            innerjoin: "innerJoin",
            fullouterjoin: "fullOuterJoin"
         };
         if (convertHash[type]) {
            type = convertHash[type];
         }

         // There is not FULL JOINS on MySQL
         // https://stackoverflow.com/questions/4796872/how-to-do-a-full-outer-join-in-mysql

         // TODO: Support alias name
         if (type == "fullOuterJoin") {
            let linkField = object.fields((f) => f.id == link.fieldID)[0];
            if (linkField == null) return;

            let joinObj = linkField.datasourceLink;
            if (joinObj == null) return;

            // include alias name
            let joinTableAlias = joinTable;
            if (alias) joinTableAlias += " AS " + alias;

            // NOTE: Full outer join match every single rows
            query["innerJoin"](joinTableAlias, function() {
               this.on(1, "=", 1);
            });

            // let joinAliasName = joinObj.id.replace(/[^a-zA-Z0-9]+/g, "");

            // let Aclause;
            // let Bclause;

            // if (A.indexOf('.') > -1) {
            // 	let parses = A.split('.');
            // 	Aclause = parses[parses.length - 1];
            // }

            // if (B.indexOf('.') > -1) {
            // 	let parses = B.split('.');
            // 	Bclause = parses[parses.length - 1];
            // }

            // // Make sure table and column include `
            // let convertColumnName = (columnName = "") => {

            // 	if (columnName.indexOf('`') > -1)
            // 		return columnName;

            // 	let result = [];

            // 	columnName.split('.').forEach(col => {
            // 		result.push("`" + col + "`");
            // 	});

            // 	return result.join('.');

            // };

            // let fullJoinCommand = "";

            // // If Many-to-Many relations
            // if (false) {
            // 	fullJoinCommand = ("SELECT t1.uuid, t2.uuid FROM `bootCamp`.`AB_test_Player` AS t1 " +
            // 							"LEFT JOIN `bootCamp`.`AB_test_HallOfFame` AS t2 " +
            // 							"ON 1 = 1 " +
            // 							"UNION ALL " +
            // 							"SELECT t1.uuid, t2.uuid FROM `bootCamp`.`AB_test_Player` AS t1 " +
            // 							"RIGHT JOIN `bootCamp`.`AB_test_HallOfFame` AS t2 " +
            // 							"ON 1 = 1");
            // }
            // else {
            // 	fullJoinCommand = ("inner join ( " +
            // 				"SELECT {joinTable}.{joinPk} FROM {joinTable} " +
            // 				"LEFT JOIN {baseTable} ON {baseTable}.{A} {op} {joinTable}.{B} " +
            // 				"UNION ALL " +
            // 				"SELECT {joinTable}.{joinPk} FROM {joinTable} " +
            // 				"RIGHT JOIN {baseTable} ON {baseTable}.{A} {op} {joinTable}.{B} " +
            // 				") as {joinTableName} " +
            // 				"on {joinTableAlias}.{joinPk} {op} {joinTableName}.{joinPk}")
            // 				.replace(/{baseTable}/g, convertColumnName(object.dbTableName(true)))
            // 				.replace(/{joinTable}/g, convertColumnName(joinTable))
            // 				.replace(/{joinTableAlias}/g, convertColumnName(alias ? alias : joinTable))
            // 				.replace(/{joinTableName}/g, convertColumnName(joinAliasName))
            // 				.replace(/{joinPk}/g, joinObj.PK())
            // 				.replace(/{A}/g, convertColumnName(Aclause))
            // 				.replace(/{op}/g, op)
            // 				.replace(/{B}/g, convertColumnName(Bclause));
            // }

            // query.joinRaw(fullJoinCommand);
         } else {
            // include alias name
            if (alias) joinTable += " AS " + alias;

            query[type](joinTable, function() {
               this.on(A, op, B);
            });
         }
      };

      let joinSetting = this.joins();

      // register the root object
      let rootObject = this.objectBase(),
         fromBaseTable = "#table#".replace(
            "#table#",
            rootObject.dbTableName(true)
         );

      if (joinSetting.alias)
         fromBaseTable = fromBaseTable + " as " + joinSetting.alias;

      query.from(fromBaseTable);

      let links = joinSetting.links;

      // NOTE: query v1
      if (links == null && Array.isArray(joinSetting)) {
         links = _.cloneDeep(joinSetting).shift(); // remove first item

         // convert to array
         if (links && !Array.isArray(links)) links = [links];
      }

      processJoin(rootObject, joinSetting.alias, links);

      let selects = [];
      let columns = [];

      // {
      //	objectName: {
      //		object: {ABObject},
      // 		transColumns: ['string']
      //	}
      //}
      let externalTrans = {};

      let fields = this.fields();

      // Add custom index fields
      (Object.keys(this.alias2Obj) || []).forEach((alias) => {
         var objID = this.alias2Obj[alias];
         var obj = this.objects().find((o) => o.id == objID);
         if (!obj) {
            return;
         }

         let indexes = obj.indexes();

         (indexes || []).forEach((idx) => {
            (idx.fields || []).forEach((idxFld) => {
               let existsIndexField =
                  this.fields((qFld) => qFld.id == idxFld.id).length > 0;

               // Add index field to generate to MySQL view
               if (!existsIndexField) {
                  let cloneField = _.clone(idxFld, false);
                  cloneField.alias = alias;
                  fields.push(cloneField);
               }
            });
         });
      });

      (fields || []).forEach((f) => {
         if (!f || f.key == "calculate" || f.key == "TextFormula")
            // TODO: ignore calculated fields
            return;

         let obj = f.object;

         // Connect fields
         if (f instanceof ABFieldConnect) {
            let selectField = "";
            let objLink = f.datasourceLink;
            let fieldLink = f.fieldLink;
            let fieldIndex = f.indexField;
            let fieldIndex2 = f.indexField2;
            let baseColumnName = obj.PK();

            if (!objLink) {
               sails.log.error(
                  `!!! connected.field[${f.id}] did not have an objLink`,
                  f
               );
            }
            if (!fieldLink) {
               sails.log.error(
                  `!!! connected.field[${f.id}] did not have a fieldLink`,
                  f
               );
            }

            // custom index
            if (fieldIndex && fieldIndex.object.id == obj.id) {
               baseColumnName = fieldIndex.columnName;
            } else if (fieldIndex2 && fieldIndex2.object.id == obj.id) {
               baseColumnName = fieldIndex2.columnName;
            }

            let connectColFormat = (
               "(SELECT CONCAT(" +
               "'[',GROUP_CONCAT(JSON_OBJECT('id', `{linkDbName}`.`{linkTableName}`.`{columnName}`)),']')" +
               " FROM `{linkDbName}`.`{linkTableName}`" +
               " WHERE `{linkDbName}`.`{linkTableName}`.`{linkColumnName}` = {prefix}.`{baseColumnName}`" +
               " AND `{linkDbName}`.`{linkTableName}`.`{columnName}` IS NOT NULL)" +
               " as `{displayPrefix}.{displayRelationName}`"
            ) // add object's name to display name
               .replace(/{prefix}/g, f.dbPrefix())
               .replace(/{baseColumnName}/g, baseColumnName)
               .replace(/{displayPrefix}/g, f.alias ? f.alias : obj.name)
               .replace(/{displayName}/g, f.columnName)
               .replace(/{displayRelationName}/g, f.relationName());

            // 1:M
            if (
               f.settings.linkType == "one" &&
               f.settings.linkViaType == "many"
            ) {
               selectField = (
                  "{prefix}.`{columnName}` as '{displayPrefix}.{columnName}', " +
                  "IF({prefix}.`{columnName}` IS NOT NULL, " +
                  "JSON_OBJECT('id', {prefix}.`{columnName}`)," +
                  "NULL)" +
                  " as '{displayPrefix}.{displayName}'"
               )
                  .replace(/{prefix}/g, f.dbPrefix())
                  .replace(/{columnName}/g, f.columnName)
                  .replace(/{displayPrefix}/g, f.alias ? f.alias : obj.name)
                  .replace(/{displayName}/g, f.relationName());
            }

            // M:1
            else if (
               f.settings.linkType == "many" &&
               f.settings.linkViaType == "one"
            ) {
               if (objLink && fieldLink) {
                  selectField = connectColFormat
                     .replace(/{linkDbName}/g, objLink.dbSchemaName())
                     .replace(/{linkTableName}/g, objLink.dbTableName())
                     .replace(/{linkColumnName}/g, fieldLink.columnName)
                     .replace(/{columnName}/g, objLink.PK());
               }
            }

            // 1:1
            else if (
               f.settings.linkType == "one" &&
               f.settings.linkViaType == "one"
            ) {
               if (f.settings.isSource) {
                  selectField = (
                     "{prefix}.`{columnName}` as '{displayPrefix}.{columnName}', " +
                     "IF({prefix}.`{columnName}` IS NOT NULL, " +
                     "JSON_OBJECT('id', {prefix}.`{columnName}`)," +
                     "NULL)" +
                     " as '{displayPrefix}.{displayName}'"
                  )
                     .replace(/{prefix}/g, f.dbPrefix())
                     .replace(/{columnName}/g, f.columnName)
                     .replace(/{displayPrefix}/g, f.alias ? f.alias : obj.name)
                     .replace(/{displayName}/g, f.relationName());
               } else {
                  if (objLink && fieldLink) {
                     selectField = connectColFormat
                        .replace(/{linkDbName}/g, objLink.dbSchemaName())
                        .replace(/{linkTableName}/g, objLink.dbTableName())
                        .replace(
                           /{linkColumnName}/g,
                           fieldIndex
                              ? fieldIndex.columnName
                              : fieldLink.columnName
                        )
                        .replace(/{columnName}/g, objLink.PK());
                  }
               }
            }

            // M:N
            else if (
               f.settings.linkType == "many" &&
               f.settings.linkViaType == "many"
            ) {
               if (objLink && fieldLink) {
                  let joinSchemaName =
                     f.settings.isSource == true
                        ? f.object.dbSchemaName()
                        : fieldLink.object.dbSchemaName();
                  let joinTableName = f.joinTableName();

                  selectField = connectColFormat
                     .replace(/{linkDbName}/g, joinSchemaName)
                     .replace(/{linkTableName}/g, joinTableName)
                     .replace(/{linkColumnName}/g, obj.name)
                     .replace(/{columnName}/g, objLink.name);
               }
            }

            if (selectField)
               selects.push(ABMigration.connection().raw(selectField));
         }
         // Aggregate fields
         else if (f.key == "formula") {
            let fieldConnect = f.object.fields(
               (fld) => fld.id == f.settings.field
            )[0];
            if (!fieldConnect) return;

            let fieldCustomIndex = fieldConnect.indexField;

            let objectNumber = ABObjectCache.get(f.settings.object);
            if (!objectNumber) return;

            let fieldNumber = objectNumber.fields(
               (fld) => fld.id == f.settings.fieldLink
            )[0];
            if (!fieldNumber) return;

            let functionName = "";
            switch (f.settings.type) {
               case "sum":
                  functionName = "SUM";
                  break;
               case "average":
                  functionName = "AVG";
                  break;
               case "max":
                  functionName = "MAX";
                  break;
               case "min":
                  functionName = "MIN";
                  break;
               case "count":
                  functionName = "COUNT";
                  break;
            }

            let whereClause = "";
            let joinClause = "";

            // 1:M , 1:1 isSource
            if (
               (fieldConnect.settings.linkType == "one" &&
                  fieldConnect.settings.linkViaType == "many") ||
               (fieldConnect.settings.linkType == "one" &&
                  fieldConnect.settings.linkViaType == "one" &&
                  fieldConnect.settings.isSource)
            ) {
               whereClause = "{table}.`{column}` = {linkTable}.`{linkId}`"
                  .replace("{table}", f.dbPrefix())
                  .replace("{column}", fieldConnect.columnName)
                  .replace("{linkTable}", objectNumber.dbTableName(true))
                  .replace(
                     "{linkId}",
                     fieldCustomIndex
                        ? fieldCustomIndex.columnName
                        : objectNumber.PK()
                  );
            }

            // M:1 , 1:1 not Source
            else if (
               (fieldConnect.settings.linkType == "many" &&
                  fieldConnect.settings.linkViaType == "one") ||
               (fieldConnect.settings.linkType == "one" &&
                  fieldConnect.settings.linkViaType == "one" &&
                  !fieldConnect.settings.isSource)
            ) {
               let connectedField = objectNumber.fields(
                  (fld) => fld.id == fieldConnect.settings.linkColumn
               )[0];
               if (!connectedField) return;

               whereClause = "{linkTable}.`{linkColumn}` = {table}.`{id}`"
                  .replace("{linkTable}", objectNumber.dbTableName(true))
                  .replace("{linkColumn}", connectedField.columnName)
                  .replace("{table}", f.dbPrefix())
                  .replace(
                     "{id}",
                     fieldCustomIndex
                        ? fieldCustomIndex.columnName
                        : f.object.PK()
                  );
            }

            // M:N
            else if (
               fieldConnect.settings.linkType == "many" &&
               fieldConnect.settings.linkViaType == "many"
            ) {
               let fieldLink = fieldConnect.fieldLink;
               if (!fieldLink) return;

               joinClause = " INNER JOIN {joinTable} ON {joinTable}.`{linkObjectName}` = {linkTable}.`{linkColumn}` "
                  .replace(/{joinTable}/g, fieldConnect.joinTableName(true))
                  .replace(/{linkObjectName}/g, objectNumber.name)
                  .replace(/{linkTable}/g, objectNumber.dbTableName(true))
                  .replace(/{linkColumn}/g, objectNumber.PK());

               whereClause = "{joinTable}.`{joinColumn}` = {table}.`{id}` AND {linkTable}.`{column}` IS NOT NULL"
                  .replace(/{joinTable}/g, fieldConnect.joinTableName(true))
                  .replace(/{joinColumn}/g, fieldConnect.object.name)
                  .replace(/{table}/g, f.dbPrefix())
                  .replace(/{id}/g, fieldConnect.object.PK())
                  .replace(/{linkTable}/g, objectNumber.dbTableName(true))
                  .replace(/{column}/g, fieldNumber.columnName);
            }

            let colFormat = (
               "(SELECT {FN}({linkTable}.`{linkColumn}`) " +
               "FROM {linkTable} " +
               joinClause +
               " WHERE " +
               whereClause +
               " ) as `{displayPrefix}.{displayName}`"
            ) // add object's name to alias
               .replace(/{FN}/g, functionName)
               .replace(/{linkTable}/g, objectNumber.dbTableName(true))
               .replace(/{linkColumn}/g, fieldNumber.columnName)
               .replace(/{displayPrefix}/g, f.alias ? f.alias : obj.name)
               .replace(/{displayName}/g, f.columnName);

            selects.push(ABMigration.connection().raw(colFormat));
         }
         // Normal fields
         else {
            let columnName = f.columnName;

            if (f.isMultilingual) {
               if (obj.isExternal || obj.isImported) {
                  if (externalTrans[obj.name] == null) {
                     externalTrans[obj.name] = {
                        alias: f.alias,
                        object: obj,
                        transColumns: []
                     };
                  }

                  // store trans column of external object
                  // create query command later
                  externalTrans[obj.name].transColumns.push(columnName);
                  return;
               } else {
                  columnName = "translations";
               }
            }

            let selectField = (
               "{aliasName}.{columnName}" + " as {displayPrefix}.{displayName}"
            ) // add object's name to display name
               .replace("{aliasName}", f.dbPrefix().replace(/`/g, ""))
               .replace("{columnName}", columnName)
               .replace("{displayPrefix}", f.alias ? f.alias : obj.name)
               .replace("{displayName}", columnName);

            if (columns.indexOf(selectField) < 0) columns.push(selectField);
         }
      });

      // SPECIAL CASE: Query translation of the external object
      Object.keys(externalTrans).forEach((objName) => {
         let transInfo = externalTrans[objName],
            obj = transInfo.object;

         // JSON_OBJECT('language_code', `language_code`, ..., )
         let queryCommand = "";

         // pull `language_code` column too
         transInfo.transColumns.push("language_code");

         transInfo.transColumns.forEach((transCol, index) => {
            if (index > 0) queryCommand += ",";

            queryCommand += "'{colName}', `{colName}`".replace(
               /{colName}/g,
               transCol
            );
         });

         let prefix = "";
         if (transInfo.alias)
            prefix = "`{alias}`".replace("{alias}", transInfo.alias);
         else
            prefix = "`{dbName}`.`{baseTableName}`"
               .replace(/{dbName}/g, obj.dbSchemaName())
               .replace(/{baseTableName}/g, obj.dbTableName());

         let transField = (
            "(SELECT CONCAT('[', " +
            "	GROUP_CONCAT(JSON_OBJECT(" +
            queryCommand +
            "))" +
            ", ']')" +
            " FROM `{dbName}`.`{linkTableName}`" +
            " WHERE `{dbName}`.`{linkTableName}`.`{linkColumnName}` = {prefix}.`{baseColumnName}`)" +
            " as `{displayPrefix}.{displayName}`"
         ) // add object's name to alias
            .replace(/{dbName}/g, obj.dbSchemaName())
            .replace(/{linkTableName}/g, obj.dbTransTableName())
            .replace(/{linkColumnName}/g, obj.transColumnName)
            .replace(/{prefix}/g, prefix)
            .replace(/{baseColumnName}/g, obj.PK())
            .replace("{displayPrefix}", prefix.replace(/`/g, ""))
            .replace("{displayName}", "translations");

         selects.push(ABMigration.connection().raw(transField));
      });

      // when empty columns, then add default id
      // if (selects.length == 0 && columns.length == 0) {
      Object.keys(this.alias2Obj).forEach((alias) => {
         let object = this.objectByAlias(alias);
         if (!object) return;

         // selects.push("#alias#.#pk# AS PK"
         selects.push(
            "#alias#.#pk# AS #alias#.#pk#"
               .replace(/#alias#/g, alias || fromBaseTable)
               .replace(/#pk#/g, object.PK())
         );
      });

      // Object.keys(this._objects).forEach((alias) => {
      //    let object = this.objectByAlias(alias);
      //    if (!object) return;

      //    // selects.push("#alias#.#pk# AS PK"
      //    selects.push(
      //       "#alias#.#pk# AS #alias#.#pk#"
      //          .replace(/#alias#/g, alias || fromBaseTable)
      //          .replace(/#pk#/g, object.PK())
      //    );
      // });
      // }

      query.column(columns);
      query.select(selects);
      query.distinct();

      let sqlCommand = query.toString();
      let viewName = this.dbViewName();

      sails.log.debug("ABClassQuery.migrateCreate - SQL:", sqlCommand);
      return knex.schema.raw(
         `CREATE OR REPLACE VIEW ${viewName} AS (${sqlCommand})`
      );
   }

   /**
    * migrateDropTable
    * remove the table for this object if it exists.
    * @param {Knex} knex the knex sql library manager for manipulating the DB.
    * @return {Promise}
    */
   migrateDrop(knex) {
      sails.log.verbose("ABObjectQuery.migrateDrop()");

      let viewName = this.dbViewName();

      // just continue gracefully:
      return knex.schema.raw(`DROP VIEW IF EXISTS ${viewName}`);
   }

   ///
   /// DB Model Services
   ///

   /**
    * @method model
    * return an objection.js model for working with the data in this Object.
    * @return {Objection.Model}
    */
   model() {
      return Model;
   }

   /**
    * @method queryFind
    * return a a knex QueryBuilder ready to perform a select() statment.
    * NOTE: ObjectQuery overrides this to return queries already joined with
    * multiple tables.
    * @param {obj} options - A set of optional conditions to add to the find():
    * 					{
    * 						columnNames: [string],
    * 						where: object,
    * 						offset: number,
    * 						ignoreIncludeId: boolean,
    * 						ignoreIncludeColumns: boolean,
    * 						ignoreEditTranslations: boolean,
    * 						skipExistingConditions: boolean,
    * 						workspaceView: guid
    * 					}
    *
    * @param {obj} userData
    * 		The current user's data (which can be used in our conditions.)
    * @return {QueryBuilder}
    */
   queryFind(options = {}, userData) {
      let raw = ABMigration.connection().raw,
         query = ABMigration.connection().queryBuilder();
      query.from(this.dbViewName());

      return (
         Promise.resolve()

            // Filter condition
            .then(() => {
               return new Promise((next, bad) => {
                  if (!options.ignoreIncludeId) {
                     // SELECT Running Number to be .id as a subquery
                     // SQL: select @rownum:=@rownum+1 as `id`, result.*
                     //		from (
                     //			select distinct ...
                     // 		) result , (SELECT @rownum:=0) r;
                     let queryRoot = ABMigration.connection().queryBuilder(),
                        queryString = query.toString();

                     query = queryRoot
                        .select(raw("@rownum := @rownum + 1 AS id, result.*"))
                        .from(function() {
                           let sqlCommand = raw(
                              queryString.replace("select ", "")
                           );

                           // sub query
                           this.select(sqlCommand).as("result");
                        })
                        .join(
                           raw(
                              `(SELECT @rownum := ${options.offset ||
                                 0}) rownum`
                           )
                        )
                        .as("rId");
                  }

                  // update our condition to include the one we are defined with:
                  //
                  let where = this.where;
                  if (where && where.glue && !options.skipExistingConditions) {
                     // we need to make sure our options.where properly contains our
                     // internal definitions as well.

                     // case: we have a valid passed in options.where
                     var haveOptions =
                        options.where &&
                        options.where.rules &&
                        options.where.rules.length > 0;

                     // case: we have a valid internal definition:
                     var haveInternal =
                        where && where.rules && where.rules.length > 0;

                     // if BOTH cases are true, then we need to AND them together:
                     if (haveOptions && haveInternal) {
                        // if (options.where && options.where.glue && options.where.rules && options.where.rules.length > 0) {

                        // in the case where we have a condition and a condition was passed in
                        // combine our conditions
                        // queryCondition AND givenConditions:
                        var oWhere = _.clone(options.where);
                        var thisWhere = _.cloneDeep(where);

                        var newWhere = {
                           glue: "and",
                           rules: [thisWhere, oWhere]
                        };

                        options.where = newWhere;

                        // options.where.rules = options.where.rules || [];

                        // (this.where.rules || []).forEach(r => {
                        // 	// START HERE MAY 29
                        // 	options.where.rules.push(_.clone(r));
                        // });
                     } else {
                        if (haveInternal) {
                           // if we had a condition and no condition was passed in,
                           // just use ours:
                           options.where = _.cloneDeep(where);
                        }
                     }
                  }

                  if (options) {
                     this.processFilterPolicy(options.where, userData)
                        .catch(bad)
                        .then(() => {
                           // when finished populate our Find Conditions
                           this.populateFindConditions(query, options, userData)
                              .catch(bad)
                              .then(() => next());
                        });
                  } else {
                     next();
                  }
               });
            })

            // Select columns
            .then(() => {
               if (options.ignoreIncludeColumns) {
                  // get count of rows does not need to include columns
                  query.clearSelect();
               }

               if (options.columnNames && options.columnNames.length) {
                  // MySQL view: remove ` in column name
                  options.columnNames = options.columnNames.map((colName) => {
                     if (typeof colName == "string") {
                        colName = "`" + (colName || "").replace(/`/g, "") + "`";
                        colName = ABMigration.connection().raw(colName);
                     }

                     return colName;
                  });

                  query.clearSelect().select(options.columnNames);
               }

               // edit property names of .translation
               // {objectName}.{columnName}
               if (!options.ignoreEditTranslations) {
                  query.on("query-response", function(rows, obj, builder) {
                     (rows || []).forEach((r) => {
                        // each rows
                        Object.keys(r).forEach((rKey) => {
                           // objectName.translations
                           if (rKey.endsWith(".translations")) {
                              r.translations = r.translations || [];

                              let objectName = rKey.replace(
                                 ".translations",
                                 ""
                              );

                              let translations = [];
                              if (typeof r[rKey] == "string")
                                 translations = JSON.parse(r[rKey]);

                              // each elements of trans
                              (translations || []).forEach((tran) => {
                                 let addNew = false;

                                 let newTran = r.translations.filter(
                                    (t) => t.language_code == tran.language_code
                                 )[0];
                                 if (!newTran) {
                                    newTran = {
                                       language_code: tran.language_code
                                    };
                                    addNew = true;
                                 }

                                 // include objectName into property - objectName.propertyName
                                 Object.keys(tran).forEach((tranKey) => {
                                    if (tranKey == "language_code") return;

                                    var newTranKey = "{objectName}.{propertyName}"
                                       .replace("{objectName}", objectName)
                                       .replace("{propertyName}", tranKey);

                                    // add new property name
                                    newTran[newTranKey] = tran[tranKey];
                                 });

                                 if (addNew) r.translations.push(newTran);
                              });

                              // remove old translations
                              delete rows[rKey];
                           }
                        });
                     });
                  });
               } // if ignoreEditTranslations

               return Promise.resolve();
            })

            // Final
            .then(() => {
               sails.log.debug(
                  "ABClassQuery.queryFind - SQL:",
                  query.toString()
               );
               return Promise.resolve(query);
            })
      );
   }

   /**
    * @method queryCount
    * return an Objection.js QueryBuilder that is already setup for this object.
    * This query is setup to add our count parameter to our returns.
    * @param {obj} options
    *		A set of optional conditions to add to the find():
    * @param {obj} userData
    * 		The current user's data (which can be used in our conditions.)
    * @param {string} tableName
    * 		[optional] the table name to use for the count
    * @return {QueryBuilder}
    */
   queryCount(options, userData, tableName) {
      // options = options || {};

      // we don't include relative data on counts:
      // and get rid of any .sort, .offset, .limit
      // options.includeRelativeData = false;
      delete options.sort;
      delete options.offset;
      delete options.limit;

      // not include columns
      // to prevent 'ER_MIX_OF_GROUP_FUNC_AND_FIELDS' error
      // options.ignoreIncludeColumns = true;

      // not update translations key names
      options.ignoreEditTranslations = true;

      // not include .id column
      options.ignoreIncludeId = true;

      options.ignoreIncludeColumns = true;

      // return the count not the full data
      options.columnNames = [ABMigration.connection().raw("COUNT(*) as count")];

      // added tableName to id because of non unique field error
      return this.queryFind(options, userData).then((result) => {
         return result[0];
         // return result[0]['count'];
      });
   }

   /**
    * @method isValidData
    * Parse through the given data and return an array of any invalid
    * value errors.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {array}
    */
   //// TODO: create OP.Validation.validator() and use super.isValidData() instead.
   isValidData(allParameters) {
      var errors = [];
      this.fields().forEach((f) => {
         var p = f.isValidData(allParameters);
         if (p.length > 0) {
            errors = errors.concat(p);
         }
      });

      return errors;
   }

   selectFormulaFields(query) {
      // Query does not need to generate formula field.
      // It should be created in CREATE VIEW command
   }

   convertConnectFieldCondition(field, condition) {
      condition.key = `${condition.alias}.${field.relationName()}`;

      return condition;
   }
};
