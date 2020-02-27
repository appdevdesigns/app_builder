/*
 * ABQLFind
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const ABQL = require("./ABQL.js");
const moo = require("moo");
const NextQLOps = require("./ABQLSet.js");

var ParameterDefinitions = [
    {
        type: "objectConditions",
        name: "cond"
    }
];

class ABQLFind extends ABQL {
    constructor(attributes, prevOP, task, application) {
        super(attributes, ParameterDefinitions, prevOP, task, application);
    }

    ///
    /// Instance Methods
    ///

    fromAttributes(attributes) {
        super.fromAttributes(attributes);
        this.paramObj = null;
        if (attributes.paramObj) {
            try {
                this.paramObj = JSON.parse(attributes.paramObj);
            } catch (e) {}
        }
    }

    /**
     * @method toObj()
     *
     * properly compile the current state of this ABQL instance
     * into the values needed for saving to the DB.
     * @return {json}
     */
    toObj() {
        // OP.Multilingual.unTranslate(this, this, ["label"]);

        var result = super.toObj();
        result.paramObj = null;
        if (this.paramObj) {
            result.paramObj = JSON.stringify(this.paramObj);
        }
        return result;
    }

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
                debugger;
                // if the last character of .currQuery isn't a ":"
                // then look for replacing a portion of the .currQuery
                if (this.currQuery[this.currQuery.length - 1] != ":") {
                    // take the 1st character of _suggestions
                    var first = this._suggestions[0];
                    if (first) {
                        // find the last place it matches in our currQuery
                        var lastMatch = this.currQuery.lastIndexOf(first);

                        // remove the remaining characters from .currQuery
                        this.currQuery = this.currQuery.slice(0, lastMatch);

                        // add _suggestions to .currQuery
                        this.currQuery += this._suggestions;
                    }
                } else {
                    // else we are just going to add _suggestion to the
                    // end of .currQuery
                    this.currQuery += this._suggestions;
                }
            }

            // now make sure we do another fromQuery() to get another
            // suggestion.
            this.fromQuery(this.currQuery);
        }
    }

    /// ABApplication data methods

    paramsValid(queryString) {
        // let the parent parse the parameter into this.params[]
        if (super.paramsValid(queryString)) {
            // now make sure that our .params[cond] actually parses JSON
            var paramComplete = false;
            try {
                this.paramObj = JSON.parse(this.params["cond"]);
                paramComplete = true;
            } catch (e) {}

            return paramComplete;
        }
        return false;
    }

    // suggestionComplete() {
    //     return `.find(${this.params[cond]})`;
    // }

    /**
     * @method paramsFromQuery()
     * take the given queryString value and see if it matches our
     * possible parameter values.
     * we update ._suggestions based upon the current param state.
     * @param {string} queryString
     */
    // paramsFromQuery(queryString) {
    //     var paramComplete = false;
    //     var paramObj = null;
    //     try {
    //         paramObj = JSON.parse(queryString);
    //         paramComplete = true;
    //     } catch (e) {}

    //     if (paramComplete) {
    //         this.paramObj = paramObj;
    //         this.params = queryString;
    //         // this.entryComplete = true;
    //         this._suggestions = `.find(${queryString})`;
    //     } else {
    //         // define a lexer to help us parse through the provided cond string
    //         var lexer = moo.states({
    //             start: {
    //                 lbrace: { match: "{", push: "key" }
    //             },
    //             key: {
    //                 colon: { match: ":", push: "value" },
    //                 rparen: { match: ")", pop: true },
    //                 key: {
    //                     match: /"(?:\\["\\]|[^\n"\\])*"/
    //                     // value: (s) => s.slice(1, -1)
    //                 },
    //                 WS: /[ \t]+/,
    //                 currKey: moo.error
    //             },
    //             value: {
    //                 // lbrace: { match: "{", push: "complexValue" },
    //                 rbrace: { match: "}", pop: true },
    //                 valueContext: {
    //                     match: /"\$context\((?:\\["\\]|[^\n"\\])*?\)"/
    //                 },
    //                 value: {
    //                     match: /"(?:\\["\\]|[^\n"\\])*"/
    //                 },
    //                 comma: { match: ",", pop: true },
    //                 currVal: moo.error
    //             }
    //         });

    //         // now follow our state, to figure out if we are entering a
    //         // key, or a value, and then figure out how to offer suggestions
    //         // based upon what they are entering now:
    //         var state = "start";
    //         lexer.reset(queryString);
    //         var token = lexer.next();
    //         var lastToken = null;
    //         var lastKey = null;
    //         while (token) {
    //             switch (state) {
    //                 case "start":
    //                     if (token.type == "lbrace") {
    //                         state = "key";
    //                     }
    //                     break;
    //                 case "key":
    //                     if (token.type == "colon") {
    //                         state = "value";
    //                     }
    //                     if (token.type == "key") {
    //                         lastKey = token.value;
    //                     }
    //                     break;

    //                 case "value":
    //                     if (token.type == "comma") {
    //                         state = "key";
    //                     }
    //                     break;
    //             }
    //             lastToken = token;
    //             token = lexer.next();
    //         }

    //         // by this point, we have ended on a state, and can figure out
    //         // what to suggest:
    //         switch (state) {
    //             case "start":
    //                 // if we ended here, then we didn't even have our first {
    //                 this._suggestions = "{cond}";
    //                 break;

    //             case "key":
    //                 // we are entering a Key, so suggest the available fields
    //                 // from this object
    //                 var currKey = "";
    //                 var types = ["key", "currKey"];
    //                 if (types.indexOf(lastToken.type) != -1) {
    //                     currKey = lastToken.value;
    //                 }
    //                 this._suggestions = this.fieldList(currKey);

    //                 // if we end up with ._suggestions == currKey
    //                 // then the key is complete, and we need to now enter ":"
    //                 if (this._suggestions == currKey) {
    //                     this._suggestions = ":";
    //                 }
    //                 break;

    //             case "value":
    //                 // entering a value, decide what to suggest based on what
    //                 // the current key/field we are on:
    //                 var currValue = "";
    //                 var types = ["value", "valueContext", "currVal"];
    //                 if (types.indexOf(lastToken.type) != -1) {
    //                     currValue = lastToken.value;
    //                 }
    //                 this._suggestions = this.valueList(lastKey, currValue);
    //                 break;
    //         }
    //     }
    // }

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

        var hashFieldIDs = this.availableProcessDataFieldsHash();
        var suggestions = [];

        if (!foundField && fieldKey == `"This Object"`) {
            // maybe they chose the "This Object" option:
            // look for a hash value that has id:xxxxx.uuid and object == this object
            var foundKey = Object.keys(hashFieldIDs)
                .map((f) => {
                    return hashFieldIDs[f];
                })
                .find((k) => {
                    var isSameObj = k.object && k.object.id == this.object.id;
                    var isUUIDKey = k.key.split(".").pop() == "uuid";
                    return isUUIDKey && isSameObj;
                });

            if (foundKey) {
                var field = hashFieldIDs[foundKey.key];
                if (field) {
                    suggestions.push(`"$context(${field.label})"`);
                }
            }
        } else {
            switch (foundField.key) {
                //// TODO: double check the validity of this:
                case "connectObject":
                    var field = hashFieldIDs[foundField.id];
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
}

ABQLFind.key = "find";
ABQLFind.option = ".find({cond})";
ABQLFind.option_begin = ".find(";
ABQLFind.regEx = /\.find\((.*?\})\)/;
ABQLFind.NextQLOps = NextQLOps;

module.exports = ABQLFind;
