module.exports = {
   /**
    * GET /app_builder/object/:objectId/track
    *
    * Get data tracking of the object
    */
   find: (req, res) => {
      let cond = req.query || {};
      cond.objectId = req.param("objectId");

      ABTrack.find(cond)
         .catch((error) => {
            res.AD.error(error);
         })
         .then((data) => {
            res.AD.success(data || []);
         });
   }
};
