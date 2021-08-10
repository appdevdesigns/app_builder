const ABQLRowPluckCore = require("../../core/ql/ABQLRowPluckCore.js");

class ABQLRowPluck extends ABQLRowPluckCore {
    do(chain, instance) {
        chain = chain.then((context) => {
            let nextContext = {
                label: "ABQLRowPluck",
                object: context.object,
                data: context.data,
                prev: context
            };

            // no data
            if (!context.data) {
                nextContext.log = "no data set! can't setPluck() of null.";
                return nextContext;
            }

            // convert to an array
            if (!Array.isArray(context.data)) nextContext.data = [context.data];

            return nextContext;
        });

        let nextLink = chain
            // resue pluck data function of ABQLSetPluck
            .then(() => super.do(chain, instance))
            // change label from "ABQLSetPluck" to "ABQLRowPluck"
            .then((context) => {
                context.label = "ABQLRowPluck";
                return context;
            });

        if (this.next) {
            return this.next.do(nextLink, instance);
        } else {
            return nextLink;
        }
    }
}

module.exports = ABQLRowPluck;
