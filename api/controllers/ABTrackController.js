module.exports = {
   /**
    * GET /app_builder/object/:objectId/track
    *
    * Get data tracking of the object
    */
   find: (req, res) => {
      let cond = req.query || {};
      cond.objectId = req.param("objectId");

      let result = [];

      Promise.resolve()
         // Pull tracking data from logger
         .then(
            () =>
               new Promise((next, bad) => {
                  ABTrack.find(cond)
                     .catch((error) => {
                        bad(error);
                        res.AD.error(error);
                     })
                     .then((data) => {
                        result = data || [];
                        next();
                     });
               })
         )
         // Pull .created_at from DB when the track file does not an insert log
         .then(
            () =>
               new Promise((next, bad) => {
                  if (!cond || !cond.rowId) return next();

                  if (result.filter((item) => item.level == "insert").length)
                     return next();

                  let object = ABObjectCache.get(cond.objectId);
                  let where = {};
                  where[object.PK()] = cond.rowId;

                  object
                     .queryFind(
                        {
                           where: where,
                           populate: false
                        },
                        req.user.data
                     )
                     .catch((error) => {
                        bad(error);
                        res.AD.error(error);
                     })
                     .then((list) => {
                        if (list[0]) {
                           // last updated date
                           if (
                              !result.filter((item) => item.level == "update")
                                 .length
                           ) {
                              result.push({
                                 level: "update",
                                 rowId: cond.rowId,
                                 timestamp: list[0].updated_at
                              });
                           }

                           // .created_at
                           result.push({
                              level: "insert",
                              rowId: cond.rowId,
                              timestamp: list[0].created_at
                           });
                        }

                        next();
                     });
               })
         )
         // final
         .then(
            () =>
               new Promise((next) => {
                  res.AD.success(result || []);
                  next();
               })
         );
   }
};
