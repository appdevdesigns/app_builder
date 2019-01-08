//
//  conf-FixAccountHolders.js
//
//  this script will run through and fix any Account Holders that don't match
//  the Registration's family id.
//
//  To use:
//  copy this to the server:  /appdev-core/setup/conf-FixAccountHolders.js
//  $ cd /app_builder/setup
//  $ node conf-FixAccountHolders.js  
//
//  I recommend running the test first and verifying all the actions look
//  good before doing it for real.
//
//  for help:
//  $ node conf-FixAccountHolders.js help
//



var LOCALTEST = false;       // is this running on your development machine?


var mysql = require('mysql');

var path = require('path');
var fs = require('fs');
var AD = require('ad-utils');
var _ = require('lodash');
var moment = require('moment');

var connAB = null;


if (LOCALTEST) {
    console.log();
    console.log(':::');
    console.log('::: LOCALTEST: setup for testing on your development machine.');
    console.log(':::')
}


var sails,
    cwd;

var TEST_RUN = true;  
            // true  :  only prints out what it expects to do.
            // false :  actually performs the actions

var USER    = "root";
var PASS    = "root";
var DB      = "appbuilder";
var PORT    = '3306';

////
//// Parse any command line arguments:
////
var wantHelp = false;




process.argv.forEach(function(a){
    var parts = a.split(':');
    var lcA = parts[0].toLowerCase();

    switch(lcA) {

        case 'help':
            wantHelp = true;
            break;

        case 'test':
            break;

        case 'real':
            TEST_RUN = false;
            break;

        case 'user':
            if (parts[1]) {
                USER = parts[1];
            }
            break;

        case 'pass':
            if (parts[1]) {
                PASS = parts[1];
            }
            break;

        case 'db':
            if (parts[1]) {
                DB = parts[1];
            }
            break;

        case 'port':
            if (parts[1]) {
                PORT = parts[1];
            }
            break;

    }
})


if (wantHelp) {
    var text = `

 conf-FixAccountHolders.js

 this script will run through and fix any Account Holders that don't match
 the Registration's family id.

 To use:
 copy this to the server:  /appdev-core/setup/conf-FixAccountHolders.js
 $ cd /app_builder/setup
 $ node conf-FixAccountHolders.js  

 I recommend running the test first and verifying all the actions look
 good before doing it for real.

 for help:
 $ node conf-FixAccountHolders.js help

`
    AD.log(text);
    process.exit(0);
}


if (TEST_RUN) {
    console.log(`

////
//// Test Run : no actual updates will be made.
////


`)
}

var resultSummary = {};

// 

console.log('... lifting sails');
AD.test.sails.lift({
    // disable the http interface and related hooks
    // to prevent any conflicts with the running sails
    // process.
    hooks:{
        http:false,
        csrf: false,
        grunt: false,
        sockets:false,
        pubsub:false,
        views:false
    },

    "appbuilder": {
        "mcc": {
            "enabled": false,
            "url": "http://localhost:1338",
            "accessToken": ""
        },
        "baseURL": "http://localhost:1337",
        "deeplink": null,
        "pathFiles": "data/app_builder"
    }

})
.fail(function(err){
    AD.log.error(err);
    process.exit(1);
})
.then(function(server) {

    sails = server;

    // make sure our scripts don't interact with the Relay Server.
    sails.config.appbuilder.mcc.enabled = false;


    // configure our Connection to the AppBuilder DB:
    if (LOCALTEST) {
        connAB = mysql.createConnection({
            "host": "localhost",
            "user": USER,
            "password": PASS,
            "database": DB,
            "port": PORT
        });

    } else {
        var configAppBuilder = sails.config.connections.appBuilder;
        connAB = mysql.createConnection(configAppBuilder);
    }



    var testPrefix = '';
    if (TEST_RUN) { testPrefix = '[testing] '}



    console.log();
    console.log('Event: Fixing Account Holders ');

    var hashRegistrations = {};
    var hashPacketsNeedingChange = {};

    var resultUpdatedEntries = [];
    var resultRegistrationWithoutAccountHolder = [];
    var resultAccountHolderLinkedToUnknownRen = [];
    var resultNoMatchingAccountHolder = [];
    var resultsPossibleNonPOC = [];

    async.series([

        //
        // Gather all Registrations
        //
        (next)=>{
            

            connAB.query(`

                    SELECT * FROM AB_Events_Registration
                    WHERE event IS Not Null AND SumConfirm = 0

                `, (err, results, fields) => {
                if (err) {
                    next(err);
                }
                else {

                    results.forEach((r)=>{
                        hashRegistrations[r.id] = {
                            registration:r
                        };
                    })
                    next();
                }
                        
            })


        },


        // find AccountHolder Details:
        (next) => {
            var allRegistrationIDs = Object.keys(hashRegistrations);

            async.eachSeries(
                allRegistrationIDs, 

                (registrationID, cb)=>{

                    var packet = hashRegistrations[registrationID];
                    var registration = packet.registration;
                    
                    connAB.query(`

                        SELECT * FROM AB_Events_AccountHolder
                        WHERE id = ${registration['AccountOwner']}

                        `, (err, results, fields) => {
                        if (err) { 
                            cb(err);
                        }
                        else {
                            results.forEach((r)=>{
                                packet.accountHolderRen = r.Ren;
                            })
                            cb();
                        }
                    });

                },

                (err,results)=>{
                    next(err);
                })
        },


        // map Account Holder -> Family IDs to packet:
        (next) => {
            var allRegistrationIDs = Object.keys(hashRegistrations);

            async.eachSeries(
                allRegistrationIDs, 

                (registrationID, cb)=>{

                    var packet = hashRegistrations[registrationID];
                    

                    packet.accountHolderFamilyID = '??';

                    if (!packet.accountHolderRen) {
                        cb();
                        return;
                    }


                    connAB.query(`

                        SELECT * FROM AB_Events_hrisrendata
                        WHERE ren_id = ${packet.accountHolderRen}

                        `, (err, results, fields) => {
                        if (err) {
                            cb(err);
                        }
                        else {
                            results.forEach((r)=>{
                                packet.accountHolderFamilyID = r.family_id;
                            })
                            cb();
                        }
                    });

                },

                (err,results)=>{
                    next(err);
                })
        },


        // identify the packets needing to update their AccountHolders:
        (next)=>{
            var allRegistrationIDs = Object.keys(hashRegistrations);

            allRegistrationIDs.forEach((regID)=>{
                var packet = hashRegistrations[regID];
                if (packet.accountHolderFamilyID != packet.registration.RenFamily) {
                    hashPacketsNeedingChange[regID]=packet;
                }
            })

            next();
        },



        // Gather registration.account holder to match the one referenced by Registration:
        (next) => {
            var allRegistrationIDs = Object.keys(hashPacketsNeedingChange);

            async.eachSeries(
                allRegistrationIDs, 

                (registrationID, cb)=>{

                    var packet = hashPacketsNeedingChange[registrationID];
                

                    packet.update = null;

                    connAB.query(`

                        SELECT reg.id as regID, ren.ren_id as renID, acc.id as accID
                        FROM AB_Events_Registration reg
                        INNER JOIN AB_Events_hrisrendata ren on reg.RenFamily=ren.family_id
                        LEFT JOIN AB_Events_AccountHolder acc on ren.ren_id = acc.Ren
                        WHERE ren.ren_isfamilypoc = 1 AND reg.id = ${registrationID};

                        `, (err, results, fields) => {
                        if (err) {
                            cb(err);
                        }
                        else {
                            results.forEach((r)=>{
                                packet.update = r;
                            })
                            cb();
                        }
                    });

                },

                (err,results)=>{
                    next(err);
                })
        },


        // UPDATE registration.account holder to match the one we found:
        (next) => {
            var allRegistrationIDs = Object.keys(hashPacketsNeedingChange);

            async.eachSeries(
                allRegistrationIDs, 

                (registrationID, cb)=>{

                    var packet = hashPacketsNeedingChange[registrationID];
                

                    if (!packet.update) {
                        if (!packet.registration.AccountOwner) {
                            resultRegistrationWithoutAccountHolder.push(packet);
                        } else {

                            if (packet.accountHolderRen && packet.accountHolderFamilyID == '??'){
                                resultAccountHolderLinkedToUnknownRen.push(packet);
                            } else {
                                resultsPossibleNonPOC.push(packet);
                            }
                        }
                        cb();
                        return;
                    }

                    if (!packet.update.accID) {
                        resultNoMatchingAccountHolder.push(packet);
                        cb();
                        return;
                    }

                    if (!TEST_RUN) {
                        
                        connAB.query(`

                            UPDATE AB_Events_Registration
                            SET AccountOwner = ${packet.update.accID}
                            WHERE id = ${registrationID};

                            `, (err, results, fields) => {
                            if (err) {
                                cb(err);
                            }
                            else {
                                resultUpdatedEntries.push(packet);
                                cb();
                            }
                        });

                    } else {

                        console.log(testPrefix+" updating registration["+registrationID+"] to have accountOwner["+packet.update.accID+"]");
                        cb();
                    }


                },

                (err,results)=>{
                    next(err);
                })
        },

    ////
    //// All Done, print out some results:
    ////

    ],function(err, results){

        console.log();
        console.log();

        var countPackets = Object.keys(hashPacketsNeedingChange).length;

        logContents = `
Num Registrations with mismatched Account Holders: ${countPackets}
Num Registrations Updated : ${resultUpdatedEntries.length}
Num Registrations Without Account Holders : ${resultRegistrationWithoutAccountHolder.length}
Num Account Holders Linked to Unknown Ren : ${resultAccountHolderLinkedToUnknownRen.length}
Num Registrations whose ren has no matching Account Holder : ${resultNoMatchingAccountHolder.length}
Num Registrations linked to non POC : ${resultsPossibleNonPOC.length}

===============



`;


        logContents += "Update Registrations Breakdown:";
        var formatUpdatedEntries = {};
        resultUpdatedEntries.forEach((packet)=>{
            formatUpdatedEntries[packet.registration.id] = packet.update.accID;
        })

        var stringUpdatedEntries = JSON.stringify(formatUpdatedEntries, null, 4);
        logContents += `
registration.id => accountHolder.id
--------------------------------------------------
${stringUpdatedEntries}
--------------------------------------------------



`;


        logContents += "Registrations without AccountHolders:";
        var formatRegistrationWithoutAccountHolder = {};
        resultRegistrationWithoutAccountHolder.forEach((packet)=>{
            formatRegistrationWithoutAccountHolder[packet.registration.id] = packet.registration.AccountOwner;
        })

        var stringRegistrationWithoutAccountHolder = JSON.stringify(formatRegistrationWithoutAccountHolder, null, 4);
        logContents += `
registration.id => registration.AccountOwner
--------------------------------------------------
${stringRegistrationWithoutAccountHolder}
--------------------------------------------------



`;  

        logContents += "Account Holders linked to Unknown Ren:";
        var formatAccountHolderLinkedToUnknownRen = {};
        resultAccountHolderLinkedToUnknownRen.forEach((packet)=>{
            formatAccountHolderLinkedToUnknownRen[packet.registration.AccountOwner] = packet.accountHolderRen;
        })

        var stringAccountHolderLinkedToUnknownRen = JSON.stringify(formatAccountHolderLinkedToUnknownRen, null, 4);
        logContents += `
accountHolder.id => ren.id
--------------------------------------------------
${stringAccountHolderLinkedToUnknownRen}
--------------------------------------------------



`;        


        logContents += "No Matching Account Holder Breakdown:";
        var formatNoMatchingAccountHolder = {};
        resultNoMatchingAccountHolder.forEach((packet)=>{
            formatNoMatchingAccountHolder[packet.registration.id] = packet.update;
        })

        var stringNoMatchingAccountHolder = JSON.stringify(formatNoMatchingAccountHolder, null, 4);
        logContents += `
registration.id => { regID, renID, accID }
--------------------------------------------------
${stringNoMatchingAccountHolder}
--------------------------------------------------



`;        


        logContents += "Registrations Linked to Non POC:";
        var formatPossibleNonPOC = {};
        resultsPossibleNonPOC.forEach((packet)=>{
            formatPossibleNonPOC[packet.registration.id] = packet.accountHolderRen;
        })

        var stringPossibleNonPOC = JSON.stringify(formatPossibleNonPOC, null, 4);
        logContents += `
registration.id => accountOwner.ren_id
--------------------------------------------------
${stringPossibleNonPOC}
--------------------------------------------------



`;



        var tsFlag = moment().format("YYMMDD-HHmmss");
        var logFileName = "log-FixAccountHolders-"+tsFlag+".log";
        fs.writeFile(logFileName, logContents, (err)=>{

            // if we had an error (like file exists) try again:
            if (err) {
                console.log('error saving results to file['+logFileName+'] :', err.toString() );
            } else {
                console.log('saved results to log file: '+logFileName);
            }


            // using setTimeout() to prevent sails lowering while there are pending DB ops
            // out there.
            setTimeout(()=>{ 

                sails.lower(function() {

                    if (err) {
                        process.exit(1);
                    } else {
                        process.exit(0);
                    }
                });

            }, 50);
        })
        

    })
      
});



function padIt(str, length) {
    while (str.length < length) {
        str += ' ';
    }
    return str;
}
