/*
 * ABQLValueSave
 *
 * An ABQLValueSave can store the current Data field set into the Process Task it is
 * in, so that this data can be made available to other Process Tasks.
 *
 */

const ABQLValueSaveCore = require("../../core/ql/ABQLValueSaveCore.js");

class ABQLValueSave extends ABQLValueSaveCore {}
ABQLValueSave.uiIndentNext = 30;

module.exports = ABQLValueSave;
