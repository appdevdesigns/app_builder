/*
 * ABQLRowSave
 *
 * An ABQLRowSave can store the current Data set into the Process Task it is
 * in, so that this data can be made available to other Process Tasks.
 *
 */

const ABQLSetSaveCore = require("../../core/ql/ABQLSetSaveCore.js");

class ABQLRowSave extends ABQLSetSaveCore {}
ABQLRowSave.uiIndentNext = 20;

module.exports = ABQLRowSave;
