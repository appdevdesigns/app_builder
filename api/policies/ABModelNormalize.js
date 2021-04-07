/**
 * @module      ABModelNormalize
 *
 * @description :: Policy
 *              :: Ensures our inputs for a .find clause are normaized into
 *                 a common structure: { where:{}, skip:xx, limit:xx }
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require("url");
var AD = require("ad-utils");

module.exports = function(req, res, next) {
   // we need to take our current inputs, and normalize them into a:
   // {
   //    where:{},
   //    limit:xx,     // optional
   //    offset:xx,    // optional
   //    sort:[]       // optional
   // }
   //
   // structure.

   // if there currently are no .where, .limit, .skip parameters present, then assume
   // the current parameters make up the .where clause:
   // {
   //    where:{ current params }
   // }

   // Webix components might ask:
   // continue - flag that indicates that this request was formed automatically;
   // count - value of datafetch parameter;
   // start - ID of the last data item in the data component before issuing a request.

   // More normal request would include:
   // skip: xx
   // limit: xx
   req.options = req.options || {};
   req.options._where = {};
   req.options._offset = null;
   req.options._limit = null;
   req.options._sort = null;
   req.options._populate = true; // our expected default operation.

   var allParams = req.allParams();
   delete allParams.appID; // don't want these
   delete allParams.objID;

   sails.log.verbose("ABModelNormalize(): allParams:", allParams);
   if (
      allParams.where ||
      allParams.limit ||
      allParams.offset ||
      allParams.sort ||
      allParams.populate
   ) {
      req.options._where = allParams.where || {};

      // Our standard expected parameter for paging, or loading chunks of data.
      if (allParams.offset) {
         req.options._offset = parseInt(allParams.offset);
      }
      // NOTE: some webix components provide a .start parameter
      else if (allParams.start) {
         req.options._offset = parseInt(allParams.start);
      }
      // And we handle any previous case using .skip  (Sails uses this)
      else if (allParams.skip) {
         req.options._offset = parseInt(allParams.skip);
      }

      if (allParams.limit) {
         req.options._limit = parseInt(allParams.limit);
      }

      if (allParams.sort) {
         req.options._sort = allParams.sort;
      }

      // populate:[]
      // the populate param allows the API to specify which connections to
      // populate when loading.
      //
      // our default option will be to populate all connections: populate:true
      //
      // it is also possible to specify individual connections (by columnName)
      // to populate: populate:['email', 'address'] and in this case ONLY these
      // connections will be populated.
      //
      // we can also prevent any populations by:  populate:false
      //
      if (allParams.populate || allParams.populate === false) {
         req.options._populate = allParams.populate;
         if (req.options._populate === "true") req.options._populate = true;
         if (req.options._populate === "false") req.options._populate = false;
      }
   }

   /// Convert Depreciated method:
   /// for params that look like:
   /// {
   ///     where: {
   ///         where : [{}],
   ///         sort : []
   ///     }
   ///     limit:xxx,
   ///     skip : xxx
   /// }
   if (req.options._where.where) {
      req.options._sort = req.options._where.sort || null;
      req.options._where = req.options._where.where;
   }

   sails.log.verbose("ABModelNormalize(): req.options:", req.options);

   next();
};
