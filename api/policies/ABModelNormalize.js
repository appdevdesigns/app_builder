/**
 * ABModelNormalize
 * 
 * @module      :: Policy
 * @description :: Ensures our inputs for a .find clause are normaized into 
 *                 a common structure: { where:{}, skip:xx, limit:xx }
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require('url');
var AD = require('ad-utils');

module.exports = function(req, res, next) {
    
    // we need to take our current inputs, and normalize them into a:
    // { 
    //    where:{},
    //    limit:xx,   // optional
    //    skip:xx     // optional
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

      var allParams = req.allParams();
      delete allParams.appID    // don't want these
      delete allParams.objID

// console.log('... allParams', allParams);
      sails.log.verbose('ABModelNormalize(): allParams:', allParams);
      if (allParams.where || allParams.limit) {
        req.options._where = allParams.where || {};

        if (allParams.skip) {
          req.options._offset = parseInt(allParams.skip);
        }

        if (allParams.limit) {
          req.options._limit = parseInt(allParams.limit);
        }

      }

      sails.log.verbose('ABModelNormalize(): req.options:', req.options);


  next();

};
