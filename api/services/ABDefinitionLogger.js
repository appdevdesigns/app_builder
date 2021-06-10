module.exports = {
   /**
    * @method add()
    *
    * @param {object} {
    *                   definitionId: guid,
    *                   user: "username" | "AB_PROCESS",
    *                   type: "create" | "update" | "delete" | "import",
    *                   json: {Object} | {String}
    *                 }
    * @return {Promise}
    */
   add: ({ definitionId, user, type, json }) => {
      return new Promise((resolve, reject) => {
         ABDefinitionLogging.create({
            definitionId: definitionId,
            user: user,
            type: type,
            json: json
         })
            .then((result) => resolve(result))
            .catch(reject);
      });
   }
};
