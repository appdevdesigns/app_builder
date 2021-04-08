/**
 * ABDefinitionController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require("lodash");
const ABDefinition = require("../classes/platform/ABDefinition");
const actionUtil = require("../../../../node_modules/sails/lib/hooks/blueprints/actionUtil");
const destroyUtil = require("../../../../node_modules/sails/lib/hooks/blueprints/actions/destroy");
const updateUtil = require("../../../../node_modules/sails/lib/hooks/blueprints/actions/update");

module.exports = {
   _config: {
      model: "abdefinitionmodel", // all lowercase model name
      actions: false,
      shortcuts: false,
      rest: true
   },

   create: (req, res) => {
      let data = actionUtil.parseValues(req);

      ABDefinition.create(data, {
         user: (req.user.data || {}).username
      })
         .catch((err) => res.negotiate(err))
         .then((newInstance) => {
            // NOTE : Just copy those from node_modules/sails/lib/hooks/blueprints/actions/create.js
            // Could not use create.js directly because I want .id of the newInstance

            // If we have the pubsub hook, use the model class's publish method
            // to notify all subscribers about the created item
            if (req._sails.hooks.pubsub) {
               if (req.isSocket) {
                  ABDefinitionModel.subscribe(req, newInstance);
                  ABDefinitionModel.introduce(newInstance);
               }
               // Make sure data is JSON-serializable before publishing
               let publishData = _.isArray(newInstance)
                  ? _.map(newInstance, function(instance) {
                       return instance.toJSON();
                    })
                  : newInstance.toJSON();
               ABDefinitionModel.publishCreate(
                  publishData,
                  !req.options.mirror && req
               );
            }

            // Send JSONP-friendly response if it's supported
            res.created(newInstance);
         });
   },

   update: (req, res) => {
      // Listen when .res done
      res.on("finish", function() {
         // Logging
         let pk = actionUtil.requirePk(req),
            data = actionUtil.parseValues(req),
            username = (req.user.data || {}).username;

         ABDefinitionLogger.add({
            user: username,
            type: "update",
            definitionId: pk,
            json: data
         }).then(() => {});
      });

      // Update ABDefinitionModel instance
      updateUtil(req, res);
   },

   destroy: (req, res) => {
      let pk = actionUtil.requirePk(req);

      Promise.resolve()
         // Pull JSON of ABDefinitionModel
         .then(
            () =>
               new Promise((next, bad) => {
                  ABDefinitionModel.findOne({ id: pk })
                     .catch(bad)
                     .then((def) => next(def));
               })
         )
         // Logging
         .then(
            (def) =>
               new Promise((next, bad) => {
                  ABDefinitionLogger.add({
                     user: (req.user.data || {}).username,
                     type: "delete",
                     definitionId: pk,
                     json: def.json
                  })
                     .catch(bad)
                     .then(() => {
                        next();
                     });
               })
         )
         // Remove ABDefinitionModel instance
         .then(() => {
            destroyUtil(req, res);
         });
   }
};
