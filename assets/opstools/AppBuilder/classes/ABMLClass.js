/**
 * ABMLClass
 * manage the multilingual information of an instance of a AB Defined Class.
 *
 * these classes have certain fields ("label", "description"), that can be
 * represented in different language options as defined by our platform.
 *
 * This platform ABMLClass will define 2 methods that allow for the translation
 * untranslation of this data.
 */
var ABMLClassCore = require("./ABMLClassCore");

module.exports = class ABMLClass extends ABMLClassCore {
    constructor(fieldList) {
        super(fieldList);
    }

    /**
     * @method translate()
     *
     * translate the multilingual fields (in this.mlFields) from
     * our .translation data.
     */
    translate() {
        // NOTE: until we have our proper Core changes in place,
        // this file will also be included on the Server.  So we
        // need to make sure we don't crash trying web code:
        if (typeof OP != "undefined") {
            // multilingual fields: label, description
            OP.Multilingual.translate(this, this, this.mlFields);
        }
    }

    /**
     * @method unTranslate()
     *
     * un-translate the multilingual fields (in this.mlFields) into
     * our .translation data
     */
    unTranslate() {
        // NOTE: until we have our proper Core changes in place,
        // this file will also be included on the Server.  So we
        // need to make sure we don't crash trying web code:
        if (typeof OP != "undefined") {
            // multilingual fields: label, description
            OP.Multilingual.unTranslate(this, this, this.mlFields);
        }
    }
};
