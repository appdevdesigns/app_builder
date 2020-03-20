/*
 * ABQLRowUpdate
 *
 * An ABQLRow Update allows you to update the values on the current
 * Row of data.
 *
 */

const ABQLRowUpdateCore = require("../../core/ql/ABQLRowUpdateCore.js");

class ABQLRowUpdate extends ABQLRowUpdateCore {
    // constructor(attributes, prevOP, task, application) {
    //     super(attributes, ParameterDefinitions, prevOP, task, application);
    //     // #Hack! : when an Operation provides the same .NextQlOps that it
    //     // was defined in, we can't require it again ==> circular dependency.
    //     // so we manually set it here from the operation that created us:
    //     this.constructor.NextQLOps = prevOP.constructor.NextQLOps;
    // }
    ///
    /// Instance Methods
    ///

    /**
     * do()
     * perform the action for this Query Language Operation.
     * @param {Promise} chain
     *         the current promise chain of actions being performed.
     * @param {obj} instance
     *        The current process instance values used by our tasks to store
     *        their state/values.
     * @return {Promise}
     */
    do(chain, instance) {
        if (!chain) {
            throw new Error(
                "ABQLRowUpdate.do() called without a Promise chain!"
            );
        }

        // capture the new promise from the .then() and
        // return that as the next link in the chain
        var nextLink = chain.then((context) => {
            var nextContext = {
                label: "ABQLRowUpdate",
                object: context.object,
                data: null,
                prev: context
            };

            if (!context.object) {
                // weird!  pass along our context with data == null;
                return nextContext;
            }

            // otherwise, we perform our find, save the results to our
            // nextContext and then continue on:
            return new Promise((resolve, reject) => {
                // if there are no values to update then just continue.
                if (
                    !this.params ||
                    !this.params.values ||
                    this.params.values.length < 1
                ) {
                    resolve(nextContext);
                    return;
                }

                // figure out the update values:
                var updateParams = {};
                for (var v = 0; v < this.params.values.length; v++) {
                    var value = this.params.values[v];
                    var field = context.object.fields((f) => {
                        return f.id == value.fieldId;
                    })[0];
                    if (!field) {
                        var missingFieldError = new Error(
                            `ABQLRowUpdate could not find field[${value.fieldId}] in provided object[${context.object.id}]`
                        );
                        reject(missingFieldError);
                        return;
                    }

                    updateParams[field.columnName] = value.value;
                }

                // TODO: standardize on our model api
                // TODO: context.object.model().update({cond}, {values})

                var PK = context.object.PK();
                var query = context.object.model().query();

                // Do Knex update
                query
                    .patch(updateParams)
                    .where(PK, context.data[PK])
                    .catch(reject)
                    .then((returnVals) => {
                        // make sure we get a fully updated value for
                        // the current Row data.
                        context.object
                            .modelAPI()
                            .findAll({
                                where: {
                                    glue: "and",
                                    rules: [
                                        {
                                            key: PK,
                                            rule: "equals",
                                            value: context.data[PK]
                                        }
                                    ]
                                },
                                offset: 0,
                                limit: 1,
                                populate: true
                            })
                            .then((rows) => {
                                // this returns an [] so pull 1st value:
                                nextContext.data = rows[0];
                                resolve(nextContext);
                            })
                            .catch(reject);
                    });
            });
        });

        if (this.next) {
            return this.next.do(nextLink, instance);
        } else {
            return nextLink;
        }
    }
}

module.exports = ABQLRowUpdate;
