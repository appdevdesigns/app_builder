/*
 * ABQLManager
 *
 * An interface for managing the different ABQL Operations available in our
 * AppBuilder.
 *
 */

const ABQLManagerCore = require("../../core/ql/ABQLManagerCore.js");

var ABQLManager = {
   /**
    * @method fromAttributes()
    * @description return an {ABQL} object that represents the given attributes that
    * were saved from the previous .toObj()
    * @param {object} attributes
    *		  the values returned from the previous .toObj() call
    * @param {ABProcessTask} task
    *		  the current ABProcessTaskServiceQuery that contains this QL
    * @param {ABApplication} application
    *		  the current ABApplication we are operating under.
    * @return {ABQL | null}
    */
   fromAttributes: ABQLManagerCore.fromAttributes
};
module.exports = ABQLManager;
