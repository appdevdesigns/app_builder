/*
 * ABQL
 *
 * An ABQL defines the base class for our AB Query Language Objects.
 * These classes share a common way to
 *   - parse input strings for commands
 *
 *
 */

const moo = require("moo");

class ABQL {
    constructor(attributes, parameterDefinitions, prevOP, task, application) {
        // manage the incoming Parameter Definitions
        if (!Array.isArray(parameterDefinitions)) {
            parameterDefinitions = [parameterDefinitions];
        }
        this.parameterDefinitions = parameterDefinitions;

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
            this.object = this.objectLookup(this.objectID);
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

    objectLookup(objID) {
        // find which param value is an "objectName" type:
        // var nameKey = "";
        // this.parameterDefinitions.forEach((pDef) => {
        //     if (pDef.type == "objectName") {
        //         nameKey = pDef.name;
        //     }
        // });

        return this.application.objects((o) => {
            var quotedLabel = `"${o.label}"`;
            return (
                o.id == this.objectID ||
                o.id == objID ||
                quotedLabel.indexOf(objID) == 0
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

    paramsToString() {
        var strs = [];
        this.parameterDefinitions.forEach((pDef) => {
            strs.push(this.params[pDef.name]);
            // switch (pDef.type) {
            //     case "objectName":
            //         strs.push(this.params[pDef.name]);
            //         break;
            // }
        });

        return strs.join(",");
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
            }${this.params ? this.paramsToString() : ""})`;
        } else {
            return `${this.prevOP ? this.prevOP.toQuery() : ""}${
                this.currQuery ? this.currQuery : ""
            }`;
        }
    }

    fromQuery(queryString) {
        var results = this.constructor.regEx.exec(queryString);
        if (results) {
            this.entryComplete = true;
            this.queryValid = true;
            this.params = {};

            if (this.paramsValid(results[1])) {
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

    paramPull(paramDef, queryString) {
        var result = { param: queryString, balance: 0 };
        if (queryString.length > 0) {
            switch (paramDef.type) {
                case "objectName":
                    // define a lexer for objectNames
                    var lexerObjectName = moo.compile({
                        comma: { match: "," },
                        name: {
                            match: /"(?:\\["\\]|[^\n"\\])*"/
                            // value: (s) => s.slice(1, -1)
                        },
                        WS: /[ \t]+/,
                        currKey: moo.error
                    });
                    lexerObjectName.reset(queryString);
                    var name = "";
                    var foundObj = null;
                    var token = lexerObjectName.next();

                    if (token) {
                        // if this is the 2nd time through, might
                        // begin with a ','
                        while (token.type == "comma") {
                            token = lexerObjectName.next();
                        }

                        // pull the parameter from the current queryString
                        if (["name", "currKey"].indexOf(token.type) != -1) {
                            name = token.value;
                        }
                        result.param = name;
                    }

                    break;

                case "objectConditions":
                    // define a lexer for objectConditions
                    // the goal of this lexer is to achieve json balance
                    // ( equal # of { & }) while reaching an end condition:
                    var lexerObjectCond = moo.compile({
                        comma: { match: "," },
                        colon: { match: ":" },
                        lbrace: { match: "{" },
                        rbrace: { match: "}" },
                        rparen: { match: ")" },
                        keyval: {
                            match: /"(?:\\["\\]|[^\n"\\])*"/
                            // value: (s) => s.slice(1, -1)
                        },
                        WS: /[ \t]+/,
                        currKey: moo.error
                    });
                    lexerObjectCond.reset(queryString);
                    var balance = 0;
                    var foundObj = null;
                    var token = lexerObjectCond.next();
                    var stop = false;
                    var param = "";
                    while (token && !stop) {
                        if (token.type == "lbrace") {
                            balance++;
                        }
                        if (token.type == "rbrace") {
                            balance--;
                        }

                        // check for stop condition:
                        // when balance is achieved and we find a ","
                        if (balance == 0) {
                            if (token.type == "comma") {
                                stop = true;
                            }
                        }

                        if (!stop) {
                            param += token.value;
                            token = lexerObjectCond.next();
                        }
                    }
                    result.param = param;
                    result.balance = balance;
                    break;
            }
        }

        return result;
    }

    suggestionComplete() {
        var params = [];
        this.parameterDefinitions.forEach((pDef) => {
            params.push(this.params[pDef.name]);
        });
        return `${this.constructor.option_begin}${params.join(",")})`;
    }

    /**
     * @method paramsFromQuery()
     * take the given queryString value and see if it matches our
     * possible parameter values.
     * we update ._suggestions based upon the current param state.
     * @param {string} queryString
     */
    paramsFromQuery(queryString) {
        var keepGoing = true;
        var current = queryString;

        // for each of our parameters,
        this.parameterDefinitions.forEach((pDef) => {
            if (!keepGoing) return;

            // pull the current param
            var pullResult = this.paramPull(pDef, current);
            current = current.replace(pullResult.param, "");

            // if this param is NOT valid
            if (!this.paramIsValid(pDef, pullResult)) {
                // don't keep going after this
                keepGoing = false;

                // offer suggestions for this param
                switch (pDef.type) {
                    case "objectName":
                        // return suggestions for our parameters
                        var suggestions = [];
                        var objects = this.application.objects((o) => {
                            var quotedLabel = `"${o.label}"`;
                            return (
                                pullResult.param.length == 0 ||
                                quotedLabel.indexOf(pullResult.param) == 0
                            );
                        });
                        objects.forEach((o) => {
                            suggestions.push(`"${o.label}"`);
                        });
                        this._suggestions = suggestions.join("\n");
                        break;

                    case "objectConditions":
                        var paramComplete = false;
                        var paramObj = null;
                        try {
                            paramObj = JSON.parse(pullResult.param);
                            paramComplete = true;
                        } catch (e) {}

                        if (paramComplete) {
                            this.paramObj = paramObj;
                            this.params[pDef.name] = pullResult.param;
                            // this.entryComplete = true;
                            this._suggestions = this.suggestionComplete();
                        } else {
                            // define a lexer to help us parse through the provided cond string
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

                            // now follow our state, to figure out if we are entering a
                            // key, or a value, and then figure out how to offer suggestions
                            // based upon what they are entering now:
                            var state = "start";
                            lexer.reset(pullResult.param);
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

                            // by this point, we have ended on a state, and can figure out
                            // what to suggest:
                            switch (state) {
                                case "start":
                                    // if we ended here, then we didn't even have our first {
                                    this._suggestions = "{cond}";
                                    break;

                                case "key":
                                    // we are entering a Key, so suggest the available fields
                                    // from this object
                                    var currKey = "";
                                    var types = ["key", "currKey"];
                                    if (types.indexOf(lastToken.type) != -1) {
                                        currKey = lastToken.value;
                                    }
                                    this._suggestions = this.fieldList(currKey);

                                    // if we end up with ._suggestions == currKey
                                    // then the key is complete, and we need to now enter ":"
                                    if (this._suggestions == currKey) {
                                        this._suggestions = ":";
                                    }
                                    break;

                                case "value":
                                    // entering a value, decide what to suggest based on what
                                    // the current key/field we are on:
                                    var currValue = "";
                                    var types = [
                                        "value",
                                        "valueContext",
                                        "currVal"
                                    ];
                                    if (types.indexOf(lastToken.type) != -1) {
                                        currValue = lastToken.value;
                                    }
                                    this._suggestions = this.valueList(
                                        lastKey,
                                        currValue
                                    );
                                    break;
                            }
                        }

                        break;
                }
            }
        });

        if (keepGoing) {
            // none of our params were invalid, so just suggest to complete our
            this._suggestions = this.suggestionComplete();
        }
    }

    paramIsValid(paramDef, pullResult) {
        var isValid = true;
        this.params = this.params || {};
        switch (paramDef.type) {
            case "objectName":
                // verify it is valid
                var param = pullResult.param;
                var foundObj = null;
                if (param) {
                    // see if we find a Matching Object
                    foundObj = this.application.objects((o) => {
                        var quotedLabel = `"${o.label}"`;
                        return (
                            param.length == 0 || quotedLabel.indexOf(param) == 0
                        );
                    })[0];
                    if (foundObj) {
                        this.params[paramDef.name] = param;
                        // it is NOT valid unless it is an exact match:
                        if (`"${foundObj.label}"` != param) {
                            isValid = false;
                        }
                    }
                }
                isValid = isValid && param.length > 0 && foundObj;
                break;

            case "objectConditions":
                if (pullResult.balance == 0) {
                    this.params[paramDef.name] = pullResult.param;
                }
                isValid =
                    isValid &&
                    pullResult.balance == 0 &&
                    pullResult.param.length > 0;
                break;
        }

        return isValid;
    }
    /**
     * @method paramsValid()
     * parse through the given text and see if our defined parameters
     * can be properly represented.
     * @param {string} queryString
     *        the current value of the text that is the parameter(s) to our
     *        function.
     * @return {bool}
     *         true : if every parameter parses
     *         false: otherwise
     */
    paramsValid(queryString) {
        // queryString represents the full text parameters. Might be > 1 params

        var current = queryString;
        var isValid = true; // so optimistic.

        // for each of our defined parameters
        this.parameterDefinitions.forEach((pDef) => {
            var pullResult = this.paramPull(pDef, current);
            current = current.replace(pullResult.param, "");
            isValid = isValid && this.paramIsValid(pDef, pullResult);
        });

        return isValid;
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
