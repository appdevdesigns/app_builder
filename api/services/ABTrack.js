/**
 * ABTrack
 *
 * Services for our Data Tracking.
 *
 */

const winston = require("winston");

const folderPath =
   sails.config.appbuilder &&
   sails.config.appbuilder.track &&
   sails.config.appbuilder.track.folder
      ? sails.config.appbuilder.track.folder
      : "data/app_builder/track";
const levels = {
   delete: 0,
   insert: 1,
   update: 2
};

function getLogger({ objectId, levelName }) {
   // let filePrefix =
   //    levels[levelName] == levels.delete ? "remove" : "manipulate";
   let filename = `${folderPath}/track-${objectId}.log`;
   let defaultValues = { level: levelName };

   return winston.createLogger({
      levels: levels,
      format: winston.format.combine(
         winston.format.timestamp(),
         winston.format.json()
      ),
      defaultMeta: defaultValues,
      transports: [
         new winston.transports.File({
            filename: filename,
            level: levelName
         })
      ]
   });
}

function logging({ logger, rowId, username, data, level }) {
   let ignoreProps = [
      "id",
      "uuid",
      "created_at",
      "updated_at",
      "properties",
      "createdAt",
      "updatedAt"
   ];

   if (data && !Array.isArray(data)) {
      data = [data];
   }

   (data || []).forEach((rec) => {
      // clean up record
      let record = Object.assign({}, rec);
      ignoreProps.forEach((p) => {
         delete record[p];
      });

      logger.log({ rowId, username, record, level });
   });
}

module.exports = {
   get levels() {
      return levels;
   },

   logInsert: ({ objectId, rowId, username, data }) => {
      let logger = getLogger({ objectId, levelName: "insert" });

      logging({ logger, rowId, username, data });
   },

   logUpdate: ({ objectId, rowId, username, data }) => {
      let logger = getLogger({ objectId, levelName: "update" });

      logging({ logger, rowId, username, data });
   },

   logDelete: ({ objectId, rowId, username, data }) => {
      let logger = getLogger({ objectId, levelName: "delete" });

      logging({ logger, rowId, username, data });
   },

   find: ({
      objectId,
      rowId,
      levelName,
      username,
      start,
      limit,
      startDate,
      endDate
   }) => {
      let logger = getLogger({ objectId });

      let options = {
         from: startDate,
         until: endDate,
         // start,
         // limit,
         order: "desc"
         // fields: ['record']
      };

      return new Promise((resolve, reject) => {
         // filter by .startDate, .endDate, .start, .limit
         logger.query(options, (err, data) => {
            if (err) {
               return reject(err);
            }

            // filter by .rowId, .level, .username
            let result = data.file || [];
            result = (result || []).filter((rec) => {
               if (levelName && rec.level != levelName) {
                  return false;
               }

               if (rowId && rec.rowId != rowId) {
                  return false;
               }

               if (username && rec.username != username) {
                  return false;
               }

               return true;
            });

            resolve(result);
         });
      });
   }
};
