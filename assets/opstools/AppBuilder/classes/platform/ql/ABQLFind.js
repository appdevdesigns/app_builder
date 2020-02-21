/*
 * ABQLFind
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const moo = require("moo");

class ABQLFind {
    constructor(attributes, prevOP, task, application) {
        this.entryComplete = false;
        this.params = null;
        this.currQuery = null;
        this.queryValid = false;

        this.object = prevOP.object;
        this.paramObj = null;

        this.prevOP = prevOP;
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
        return `${this.prevOP.toQuery()}${this.currQuery}`;
    }

    fromQuery(queryString) {
        var results = ABQLFind.regEx.exec(queryString);
        if (results) {
            this.entryComplete = true;
            this.queryValid = true;
            this.params = results[1];
            var newQuery = queryString.replace(ABQLFind.regEx, "");
        } else {
            this.currQuery = queryString;
            this.queryValid = true; // assume true then set to false later
            this._suggestions = null;

            // calculate the processing of our command + params:
            // if we have finished our begining
            if (this.currQuery.indexOf(ABQLFind.option_begin) == 0) {
                var param = this.currQuery.slice(ABQLFind.option_begin.length);

                this.paramsFromQuery(param);
            } else {
                // else they need to finish the beginning
                this._suggestions = ABQLFind.option_begin;
            }

            // if we didn't have any suggestions, then what they typed
            // doesn't match, so remove the last character:
            if (!this._suggestions) {
                this.currQuery = this.currQuery.slice(0, -1);
                this.queryValid = false;
                this._suggestions = null;

                // try to regenerate the suggestions again:
                var param = this.currQuery.slice(ABQLFind.option_begin.length);

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
        var paramComplete = false;
        var paramObj = null;
        try {
            paramObj = JSON.parse(queryString);
            paramComplete = true;
        } catch (e) {}

        if (paramComplete) {
            this.paramObj = paramObj;
            this.entryComplete = true;
            this._suggestions = `.find(${queryString})`;
        } else {
            var lexer = moo.states({
                start: {
                    lbrace: { match: "{", push: "key" }
                },
                key: {
                    colon: { match: ":", push: "value" },
                    rparen: { match: ")", pop: true },
                    key: {
                        match: /"(?:\\["\\]|[^\n"\\])*"/
                        // value: (s) => s.slice(1, -1)
                    },
                    WS: /[ \t]+/,
                    currKey: moo.error
                },
                value: {
                    // lbrace: { match: "{", push: "complexValue" },
                    rbrace: { match: "}", pop: true },
                    valueContext: {
                        match: /"\$context\((?:\\["\\]|[^\n"\\])*?\)"/
                    },
                    value: {
                        match: /"(?:\\["\\]|[^\n"\\])*"/
                    },
                    comma: { match: ",", pop: true },
                    currVal: moo.error
                }
            });

            var state = "start";
            lexer.reset(queryString);
            var token = lexer.next();
            var lastToken = null;
            var lastKey = null;
            while (token) {
                switch (state) {
                    case "start":
                        if (token.type == "lbrace") {
                            state = "key";
                        }
                        break;
                    case "key":
                        if (token.type == "colon") {
                            state = "value";
                        }
                        if (token.type == "key") {
                            lastKey = token.value;
                        }
                        break;

                    case "value":
                        if (token.type == "comma") {
                            state = "key";
                        }
                        break;
                }
                lastToken = token;
                token = lexer.next();
            }

            console.log(lastToken);
            console.log(state);

            switch (state) {
                case "start":
                    // if we ended here, then we didn't even have our first {
                    this._suggestions = "{cond}";
                    break;

                case "key":
                    var currKey = "";
                    var types = ["key", "currKey"];
                    if (types.indexOf(lastToken.type) != -1) {
                        currKey = lastToken.value;
                    }
                    this._suggestions = this.fieldList(currKey);
                    break;

                case "value":
                    var currValue = "";
                    var types = ["value", "valueContext", "currVal"];
                    if (types.indexOf(lastToken.type) != -1) {
                        currValue = lastToken.value;
                    }
                    this._suggestions = this.valueList(lastKey, currValue);
                    break;
            }
            /*
            var markers = ["{", ",", ":"];
            var resultsToken = this.pullToken(queryString, markers);

            // if there are not characters for our param yet,
            if (!resultsToken.bound) {
                this._suggestions = "{cond}";
                return;
            }

            switch (resultsToken.bound) {
                case "{":
                case ",":
                    // we are looking for a field or cond value:
                    this._suggestions = this.fieldList(resultsToken.token);
                    break;

                case ":":
                    // we are looking for a value marker;
                    this._suggestions = "some value";
                    var resultsField = this.pullField(resultsToken.queryString);
                    if (resultsField.field.length != 1) {
                        // this isn't expected.  they must have typed ":"
                        // before they completed their field name.

                        // so mark this as query invalid and offer
                        // all relevant fields as a suggestion:
                        this.queryValid = false;
                        this._suggestions = this.fieldList(resultsField.token);
                    }
                    break;
            }
*/
        }
    }

    availableProcessDataFieldsHash() {
        var availableProcessDataFields = this.task.process.processDataFields(
            this.task
        );
        var hashFieldIDs = {};
        availableProcessDataFields.forEach((f) => {
            if (f.field) {
                hashFieldIDs[f.field.id] = f;
            } else {
                hashFieldIDs[f.key] = f;
            }
        });
        return hashFieldIDs;
    }

    fieldList(token) {
        var suggestions = [];

        var hashFieldIDs = this.availableProcessDataFieldsHash();

        var ignoreFieldTypes = ["connectObject"];
        this.object.fields().forEach((f) => {
            // dont include connect fields unless there is a matching process
            // data field for it.
            if (ignoreFieldTypes.indexOf(f.key) == -1 || hashFieldIDs[f.id]) {
                suggestions.push(`"${f.label}"`);
            }
        });
        suggestions.unshift(`"This Object"`);
        // suggestions.unshift(`"and"`);
        // suggestions.unshift(`"or"`);

        suggestions = suggestions.filter((s) => {
            return token.length == 0 || s.indexOf(token) == 0;
        });

        return suggestions.join("\n");
    }

    valueList(fieldKey, currVal) {
        var foundField = null;
        this.object.fields().forEach((f) => {
            if (`"${f.label}"`.indexOf(fieldKey) == 0) {
                foundField = f;
            }
        });
        debugger;
        var hashFieldIDs = this.availableProcessDataFieldsHash();
        var suggestions = [];

        if (!foundField && fieldKey == `"This Object"`) {
            // maybe they chose the "This Object" option:
            // look for a hash value that has "xxx->[object.label]"
            var possibleKey = `->${this.object.label} `; // note the extra " "
            var foundKey = Object.keys(hashFieldIDs)
                .map((f) => {
                    return hashFieldIDs[f];
                })
                .find((k) => {
                    var indx = k.label.indexOf(possibleKey);
                    var isEnd = indx + possibleKey.length == k.label.length;
                    return indx != -1 && isEnd;
                });
            if (foundKey) {
                var field = hashFieldIDs[foundKey.key];
                if (field) {
                    // note: remove the " " at the end of .label:
                    suggestions.push(`"$context(${field.label.slice(0, -1)})"`);
                }
            }
        } else {
            switch (foundField.key) {
                case "connectObject":
                    var field = hashFieldIDs[field.id];
                    if (field) {
                        suggestions.push(`"$context(${field.label})"`);
                    }
                    break;
            }
        }

        return suggestions
            .filter((s) => {
                return currVal.length == 0 || s.indexOf(currVal) == 0;
            })
            .join("\n");
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
            return ".find(";
        } else {
            return this._suggestions;
        }
    }
}

ABQLFind.option = ".find({cond})";
ABQLFind.option_begin = ".find(";
ABQLFind.regEx = /\.find\((.*?\})\)/;

module.exports = ABQLFind;
