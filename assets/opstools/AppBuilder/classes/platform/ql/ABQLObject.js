/*
 * ABQL
 *
 * An ABQL defines a Query Language Operation. A QL Operation
 * is intended to be evaluated at run time and return a value that can be
 * assigned to form value or an object.
 *
 *
 */
const QLFind = require("./ABQLFind.js");

var NextQLOps = [QLFind];

class ABQLObject {
    constructor(attributes, task, application) {
        this.entryComplete = false;
        this.params = null;
        this.currQuery = null;
        this.queryValid = false;
        this.object = null;

        this.task = task;
        this.application = application;
        this.next = null;
    }

    /*
     * parseQuery()
     * check the given query string input and see if this object is the
     * starting object.
     * @param {string} query
     *			 the entered query string operation.
     * @return {bool}
     */
    static parseQuery(query) {
        // we want to see if the beginning of this query matches our
        // option_begin string.
        var begQuery = query;
        if (query.length > this.option_begin.length) {
            begQuery = query.slice(0, this.option_begin.length);
        }
        if (this.option_begin.indexOf(begQuery) == 0) {
            return true;
        }
        return false;
    }

    ///
    /// Instance Methods
    ///

    /// ABApplication data methods

    /**
     * @method toObj()
     *
     * properly compile the current state of this ABView instance
     * into the values needed for saving to the DB.
     *
     * @return {json}
     */
    toQuery() {
        if (this.entryComplete) {
            return `${ABQLObject.option_begin}${this.params})`;
        }
        return this.currQuery;
    }

    fromQuery(queryString) {
        var results = ABQLObject.regEx.exec(queryString);
        if (results) {
            this.entryComplete = true;
            this.queryValid = true;
            this.object = null;
            this.params = results[1];

            var foundObj = this.application.objects((o) => {
                var quotedLabel = `"${o.label}"`;
                return (
                    o.id == this.params || quotedLabel.indexOf(this.params) == 0
                );
            })[0];
            if (foundObj) {
                this.object = foundObj;

                // now progress on to any next operations:
                var newQuery = queryString.replace(ABQLObject.regEx, "");
                var matchingOPs = [];
                NextQLOps.forEach((OP) => {
                    if (OP.parseQuery(newQuery)) {
                        matchingOPs.push(OP);
                    }
                });
                if (matchingOPs.length == 1) {
                    // exact match, so add next:
                    var qlOP = new matchingOPs[0](
                        {},
                        this,
                        this.task,
                        this.application
                    );
                    qlOP.fromQuery(newQuery);
                    this.next = qlOP;
                    qlOP.fromQuery(newQuery);
                }

                // if there were no matching OPs, then they typed an error:
                if (matchingOPs.length == 0) {
                    this.queryValid = false;
                }
            } else {
                // they didn't type in an object name we recoginze:
                this.queryValid = false;
                this._suggestions = " ! Invalid Object !";
            }
        } else {
            this.currQuery = queryString;
            this.queryValid = true; // assume true then set to false later
            this._suggestions = null;

            // calculate the processing of our command + params:
            // if we have finished our begining
            if (this.currQuery.indexOf(ABQLObject.option_begin) == 0) {
                var param = this.currQuery.slice(
                    ABQLObject.option_begin.length
                );

                this.paramsFromQuery(param);
            } else {
                // else they need to finish the beginning
                this._suggestions = ABQLObject.option_begin;
            }

            // if we didn't have any suggestions, then what they typed
            // doesn't match, so remove the last character:
            if (!this._suggestions) {
                this.currQuery = this.currQuery.slice(0, -1);
                this.queryValid = false;
                this._suggestions = null;

                // try to regenerate the suggestions again:
                var param = this.currQuery.slice(
                    ABQLObject.option_begin.length
                );

                this.paramsFromQuery(param);
            }
        }
    }

    /**
     * @method paramsFromQuery()
     * take the given queryString value and see if it matches our
     * possible parameter values.
     * we update ._suggestions based upon the current param state.
     * @param {string} queryString
     */
    paramsFromQuery(queryString) {
        // return suggestions for our parameters
        var suggestions = [];
        var objects = this.application.objects((o) => {
            var quotedLabel = `"${o.label}"`;
            return (
                queryString.length == 0 || quotedLabel.indexOf(queryString) == 0
            );
        });
        objects.forEach((o) => {
            suggestions.push(`"${o.label}"`);
        });
        this._suggestions = suggestions.join("\n");
    }

    lastOP() {
        if (!this.entryComplete) {
            return this;
        } else {
            // now figure out which of our nextOps are being used.
            if (this.next) {
                return this.next.lastOP();
            } else {
                // we haven't specified a next OP, so we are still up.
                return this;
            }
        }
    }

    suggestions() {
        if (this.entryComplete) {
            // return suggestions for next operations.
            var suggestions = [];

            NextQLOps.forEach((OP) => {
                suggestions.push(OP.option);
            });
            return suggestions.join("\n");
        } else {
            return this._suggestions;
        }
    }
}

ABQLObject.option = "$O([objectName])";
ABQLObject.option_begin = "$O(";
ABQLObject.regEx = /\$O\(([\w,\d,\s,"]+)\)/;

module.exports = ABQLObject;
