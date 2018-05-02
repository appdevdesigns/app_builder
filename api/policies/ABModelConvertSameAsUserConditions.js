/**
 * ABModelConvertSameAsUserConditions
 * 
 * @module      :: Policy
 * @description :: Scan any provided conditions to see if we have a 'same_as_user' 
 *                 or 'not_same_as_user' clause.  If we do, convert it to an IN or NOT IN
 *                 clause.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require('url');
var AD = require('ad-utils');
var _ = require('lodash');


module.exports = function(req, res, next) {
    

    // our QB Conditions look like:
    // {
    //   "glue": "and",
    //   "rules": [{
    //     "key": "name_first",
    //     "rule": "begins_with",
    //     "value": "a"
    //   }, {
    //     "key": "name_family",
    //     "rule": "begins_with",
    //     "value": "a"
    //   }, {
    //     "glue": "or",
    //     "rules": [{
    //       "glue": "and",
    //       "rules": [{
    //         "key": "name_first",
    //         "rule": "not_begins_with",
    //         "value": "Apple"
    //       }, {
    //         "key": "name_family",
    //         "rule": "not_contains",
    //         "value": "Pie"
    //       }]
    //     }, {
    //       "glue": "and",
    //       "rules": [{
    //         "key": "name_first",
    //         "rule": "ends_with",
    //         "value": "Crumble"
    //       }, {
    //         "key": "name_family",
    //         "rule": "equal",
    //         "value": "Goodness"
    //       }]
    //     }]
    //   }]
    // }  
    //
    //   


    // move along if no or empty where clause
    if (_.isEmpty(req.options._where)) {
        next();
        return;
    }


    parseCondition(req.options._where, null, req, res, (err) => {
        next(err);
    })
 

};



/**
 * @function findEntry
 * analyze the current condition to see if it is one we are looking for.
 * if it is a grouping entry ( 'and', 'or') then search it's children looking 
 * for an entry as well.
 * if no entry is found, return null.
 * @param {obj} a condition entry
 * @return {obj} a condition entry that matches our type we are looking for:
 */
function findEntry(_where) {

    if (_where.rules) {

        var entry = null;
        for(var i=0; i < _where.rules.length; i++) {
            entry = findEntry(_where.rules[i]);
            if (entry) {
                return entry;
                break;
            }
        }
        return entry;

    } else {

        if ((_where.rule == 'same_as_user') || (_where.rule == 'not_same_as_user')) {
            return _where;
        } else {
            return null;
        }
    }
}



function parseCondition(_where, object, req, res, cb) {

    var cond = findEntry(_where);
    if (!cond) {
        cb();
    } else {

        // the first time we find a cond to process, we then
        // lookup the object for this route:
        if (!object) {
            AppBuilder.routes.verifyAndReturnObject(req, res)
                .then(function (obj) {
                    object = obj;

                    // try again with an object now:
                    parseCondition(_where, object, req, res, cb);
                })
                .catch((err)=>{
                    ADCore.error.log('AppBuilder:Policy:ABModelConvertSameAsUserConditions:error finding object for this route:', {error:err});
                    
                    // exit with error:
                    cb(err);
                });

        } else {

            // get list of object->field lookups with the last one being the closest obj that has a [user] field type
            // foreach entry (LIFO)
                // lookup matching entries, use PKs to lookup next round

            // when done, we should have object.field = [of matching values from user]
            // rebuild current condition using results:

// we want to recursively do a DepthFirstSearch DFS to find the first object that has a [user] field.
// along the way, build an array of lookups {obj, fieldOut, fieldCond, }
// each step along the way, we should be able to do a lookup on obj where fieldCond in results of previous lokup
// the first lookup, have fieldCond = [user], 
// the look up will get all objs where fieldCond=[user], and will return an [] of values from the fieldOut column
// that result will return to the next lookup, where it will find all obj->fieldCond IN previous results
// etc... 

            processObjectWithUser(object, req,  (err, lookups)=>{

                processLookup(lookups, (err, data)=>{


                    if (!data) {

// looks like we did not return any data from the lookups:

                    } else {
//// QUESTION:  if data == [], what does this mean?  
// we want entries that either match / or don't match 


                        // data should represent an [{object}] elements that match valid [user] versions
                        // we need to pull out of data the proper values for this condition
                        // and build a new condition: 


                        // current cond should be in format:
                            //  cond.key   : the sql column name
                            //  cond.rule  : the rule key: 
                            //  cond.value :  (empty)

                        
                        // cond.key = cond.key;     // this should already be the proper field value

                        // cond.rule  : should be either ["in", "not_in"]
                        var convert = {
                            'same_as_user' : 'in',
                            'not_same_as_user' : 'not_in'
                        }
                        cond.rule = convert[cond.rule];

                        // cond.value : should be an [] of values that matched the [user]
                        // cond.key is the field in data that we want to match on
                        var fieldValues = data.map((d)=>{ return d[cond.key]; });

// TODO: simplify fieldValues to a unique list
                        cond.value = fieldValues; 


                        // we've updated this condition, now try to process another one:
                        parseCondition(_where, object, req, res, cb);

                    }

                })


            });  // processObjectWithUser()


        } // if !object

    } // if !cond
}







// processObjectWithUser
// attempt to find the closest object to the provided obj, that has a [user] field.
// @param {ABObj} obj The current obj to evaluate
// @param {fn}    cb  A node style callback (err, data)  that is called when we have finished
// @return  null if no object with a [user] field is found.
//          {array} of lookup definitions from found obj  
function processObjectWithUser( obj, req,  cb ) {

    var userField = obj.fields((f)=> { return f.key == 'user';})[0];
    if (userField) {
        // this obj has a USER field!!! 


        // return a lookup for this object, with entries where userField == current user
        var cond = {
            glue:'and',
            rules:[{
                key:userField.columnName,
                rule:'equals',
                value:req.user.data.username
            }]
        };

        var lookup = {
            object:obj,
            cond:cond
        }

        var stack = [];
        stack.push(lookup);

        cb(null, stack);
        return


    } else {

        var connectionFields = obj.fields((f) => { return f.key == 'connectObject'; });

        if (connectionFields.length == 0) {
            cb(null, null);
            return;
        }

        
        ProcessField(connectionFields, req,  cb);

    } // if !user

} // function  processObjectWithUser()




function ProcessField( list, req, cb) {

    // if we got to the end, then there were no successful fields:
    if (list.length == 0) {
        cb(null, null);   
    } else {

        // get current field
        var currField = list.shift();

        // check to see if currField's obj has a solution:
        var connectedObj = obj.application.objects((o)=>{ return o.id == currField.linkObject; })[0];
        if (!connectedObj) {

            // if no connectedObj, then on to next field:
            ProcessField(list, req, cb);
            return;
        }


        // does this object give us a solution?
        processObjectWithUser(connectedObj, req, (err, result)=>{

            // if no results with this object, move on to next Field:
            if (!result) {  
                ProcessField(list, req, cb);
            } else {

                // we now have a solution.  So figure out how to decode the data returned 
                // by connectedObj to limit the current obj:

                var linkCase = currField.linkType()+':'+currField.linkViaType();

                switch(linkCase.toLowerCase()) {

                    case 'one:one':
                    case 'one:many':

                        // in this case, this obj[currField.columnName] = the PK of the connectedObj 
                        // values we will receive 

                        // NOTE: also the lookup format changes for lookups that depend on the results
                        // of previous calls:
                        var lookup = {
                            obj:obj,
                            field: currField.columnName,
                            dataColumn: connectedObj.PK()
                        }
                        result.push(lookup);
                        cb(null, result);
                        break;


                    case 'many:one':
                        // in this case, this obj.PK  is in the connectedObj[currField.columnName]

                        var linkedField = currField.fieldLink();

                        var lookup = {
                            obj:obj,
                            field: obj.PK(),  
                            dataColumn: linkedField.columnName
                        }
                        result.push(lookup);
                        cb(null, result);
                        break;


                    case 'many:many':

                        // push a query for the joinTable 
                        // ok the resulting data contains the PK for the connectedObj that must
                        // be used to lookup the joinTable

                        var lookupJoin = {
                            joinTable: currField.joinTableName(),
                            field: connectedObj.name,
                            dataColumn: connectedObj.PK()

                        }
                        result.push(lookupJoin);


                        // push a query for this obj
                        // then we need to push a lookup for this obj where our PK is in the 
                        // joinTable results:
                        var lookup = {
                            obj:obj,
                            field: obj.PK(),
                            dataColumn: obj.name
                        }
                        result.push(lookupJoin);

                        cb(null, result);
                        break;

                } // end switch

            } // end if(result)


        }); // ProcessObjectWithUser()

    }  // if list.length > 0
    
} // end ProcessField()





/////
///// LEFT OFF HERE:
/////

// implement   processLookup(lookups, (err, data)=>{











