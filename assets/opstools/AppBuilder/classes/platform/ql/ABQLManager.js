/*
 * ABQLManager
 *
 * An interface for managing the different ABQL Operations available in our
 * AppBuilder.
 *
 */

const QLObject = require("./ABQLObject.js");

var QLOps = [QLObject];

module.exports = {
    /*
     * @function currentParser
     * return an ABQL object that best describes the query given
     * @param {string} query
     * 		 the entered query string
     * @return [{ABQL},...]
     */
    currentParser: function(query, task, application) {
        var matchingOPs = [];
        QLOps.forEach((Op) => {
            if (Op.parseQuery(query)) {
                matchingOPs.push(Op);
            }
        });
        if (matchingOPs.length == 1) {
            // let this Operation initialize and return the last OP
            // in the chain
            var qlOP = new matchingOPs[0]({}, task, application);
            qlOP.fromQuery(query);
            return qlOP.lastOP();
        } else {
            // return a parser generic parser
            return {
                toQuery: function() {
                    if (matchingOPs.length == 0) {
                        query = query.slice(0, -1);
                    }

                    return query;
                },
                suggestions: function() {
                    var options = [];
                    QLOps.forEach((Op) => {
                        options.push(Op.option);
                    });
                    return options.join("\n");
                }
            };
        }
    }
};
