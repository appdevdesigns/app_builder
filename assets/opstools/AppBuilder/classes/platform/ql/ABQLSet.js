/*
 * ABQLFind
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const QLFirst = require("./ABQLSetFirst.js");

var allOps = [QLFirst];

module.exports = allOps;
