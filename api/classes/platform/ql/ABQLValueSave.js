const ABQLValueSaveCore = require("../../core/ql/ABQLValueSaveCore.js");

class ABQLValueSave extends ABQLValueSaveCore {
    do(chain, instance) {
        let nextLink = super.do(chain, instance)
            // change label from "ABQLSetSave" to "ABQLValueSave"
            .then((context) => {
                context.label = "ABQLValueSave";
                return context;
            });

        if (this.next) {
            return this.next.do(nextLink, instance);
        } else {
            return nextLink;
        }
    }
}

module.exports = ABQLValueSave;
