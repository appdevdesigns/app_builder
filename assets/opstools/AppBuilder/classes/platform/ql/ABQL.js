/*
 * ABQL
 *
 * An ABQL defines the base class for our AB Query Language Objects.
 * These classes share a common way to
 *   - parse input strings for commands
 *
 *
 */

class ABQL {
    constructor(attributes, prevOP, task, application) {
        this.object = prevOP ? prevOP.object : null;

        this.prevOP = prevOP;
        this.task = task;
        this.application = application;
        this.next = null;

        this.fromAttributes(attributes);
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

    fromAttributes(attributes) {
        /*
        {
            id: uuid(),
            name: 'name',
            type: 'xxxxx',
            json: "{json}"
        }
        */

        // super.fromValues(attributes);

        this.entryComplete = attributes.entryComplete || false;
        this.params = attributes.params || null;
        this.currQuery = attributes.currQuery || null;
        this.queryValid = attributes.queryValid || false;
        this.objectID = attributes.objectID || null;
        // be sure to do a hard lookup if an objectID was saved:
        if (this.objectID) {
            this.object = this.objectLookup();
        }

        if (attributes.next) {
            var nextOP = null;
            this.constructor.NextQLOps.forEach((OP) => {
                if (OP.key == attributes.next.key) {
                    nextOP = OP;
                }
            });
            if (nextOP) {
                // exact match, so add next:
                var qlOP = new nextOP(
                    attributes.next,
                    this,
                    this.task,
                    this.application
                );
                this.next = qlOP;
            }
        }
    }

    /**
     * @method toObj()
     *
     * properly compile the current state of this ABApplication instance
     * into the values needed for saving to the DB.
     *
     * Most of the instance data is stored in .json field, so be sure to
     * update that from all the current values of our child fields.
     *
     * @return {json}
     */
    toObj() {
        // OP.Multilingual.unTranslate(this, this, ["label"]);

        // var result = super.toObj();

        var obj = {
            key: this.constructor.key,
            entryComplete: this.entryComplete,
            params: this.params,
            currQuery: this.currQuery,
            queryValid: this.queryValid,
            objectID: this.object ? this.object.id : null
        };

        if (this.next) {
            obj.next = this.next.toObj();
        }

        return obj;
    }

    objectLookup() {
        return this.application.objects((o) => {
            var quotedLabel = `"${o.label}"`;
            return (
                o.id == this.objectID ||
                o.id == this.params ||
                quotedLabel.indexOf(this.params) == 0
            );
        })[0];
    }

    /// ABApplication data methods

    tabComplete() {
        if (this._suggestions) {
            // if our begin tag is  present in _suggestions
            if (
                this._suggestions.indexOf(this.constructor.option_begin) != -1
            ) {
                // this is probably finishing out our command:
                this.currQuery = this._suggestions;
            } else {
                // we are suggesting a parameter value:
                this.currQuery = `${this.constructor.option_begin}${this._suggestions}`;
            }

            // now make sure we do another refresh to get another
            // suggestion.
            this.fromQuery(this.currQuery);
        }
    }

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
            return `${this.prevOP ? this.prevOP.toQuery() : ""}${
                this.constructor.option_begin
            }${this.params ? this.params : ""})`;
        } else {
            return `${this.prevOP ? this.prevOP.toQuery() : ""}${
                this.currQuery
            }`;
        }
    }

    fromQuery(queryString) {
        var results = this.constructor.regEx.exec(queryString);
        if (results) {
            this.entryComplete = true;
            this.queryValid = true;
            this.params = results[1];

            if (this.paramsValid(queryString)) {
                // now progress on to any next operations:
                var newQuery = queryString.replace(this.constructor.regEx, "");
                var matchingOPs = [];
                this.constructor.NextQLOps.forEach((OP) => {
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
                }

                // if there were no matching OPs, then they typed an error:
                if (matchingOPs.length == 0) {
                    this.queryValid = false;
                }
            } else {
                // I don't recoginze these params!
                this.queryValid = false;
                this._suggestions = " ! Invalid Params !";
            }
        } else {
            this.currQuery = queryString;
            this.queryValid = true; // assume true then set to false later
            this._suggestions = null;

            // calculate the processing of our command + params:
            // if we have finished our begining
            if (this.currQuery.indexOf(this.constructor.option_begin) == 0) {
                var param = this.currQuery.slice(
                    this.constructor.option_begin.length
                );

                this.paramsFromQuery(param);
            } else {
                // else they need to finish the beginning
                this._suggestions = this.constructor.option_begin;
            }

            // if we didn't have any suggestions, then what they typed
            // doesn't match, so remove the last character:
            if (!this._suggestions) {
                this.currQuery = this.currQuery.slice(0, -1);
                this.queryValid = false;
                this._suggestions = null;

                // try to regenerate the suggestions again:
                var param = this.currQuery.slice(
                    this.constructor.option_begin.length
                );

                this.paramsFromQuery(param);
            }
        }
    }

    firstOP() {
        if (!this.prevOP) {
            return this;
        } else {
            return this.prevOP.firstOP();
        }
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

    paramsValid(queryString) {
        return true;
    }

    suggestions() {
        if (this.entryComplete) {
            // return suggestions for next operations.
            var suggestions = [];

            this.constructor.NextQLOps.forEach((OP) => {
                suggestions.push(OP.option);
            });
            return suggestions.join("\n");
        } else {
            return this._suggestions;
        }
    }
}

module.exports = ABQL;
