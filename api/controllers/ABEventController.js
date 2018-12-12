/**
 * ABEventController
 *
 * We currently have some special purpose Event Operations to support our conferece.
 * This controller manages those operations:
 *
 */

var path = require('path');
var fs   = require('fs');

var async = require('async');
var _     = require('lodash');

var mysql = require('mysql');
var moment = require('moment');

var Base64Images = require('../classes/Base64Images.js');

module.exports = {


    // POST: /app_builder/Event/sendFeeConfirmationEmail
    // send a confirmation email out to registered users about their Charges
    sendFeeConfirmation: function(req, res) {

        var connAB = mysql.createConnection({
            host: sails.config.connections.appBuilder.host,
            user: sails.config.connections.appBuilder.user,
            password: sails.config.connections.appBuilder.password,
            database: sails.config.connections.appBuilder.database
        });


    },



    // POST: /app_builder/Event/sendConfirmationEmail
    // send a confirmation email out to registered users
    // @param {string} user  (optional) the speific user to send to
    // @param {integer} event (optional) the specific Event to process (default: all Events)
    sendRegistrationConfirmation: function(req, res) {

        var connAB = mysql.createConnection({
            host: sails.config.connections.appBuilder.host,
            user: sails.config.connections.appBuilder.user,
            password: sails.config.connections.appBuilder.password,
            database: sails.config.connections.appBuilder.database
        });


var ANALYSIS_TEST = true;

        var hashEvents = {};
        var hashPhotos = {};
        var hashHousingRoomFees = {};
        var hashHousingFees = {};   // Crib, Bed, etc... 


        var hashRegistrationPackets = {

            /*
            reg.id : {  
                event:{event},
                registration: {registration},
                registrants: { registrant.id:{registrant}, ... },

                email: '',
                preferredName:''
            }
            */
        }

        var resultSentEmails  = {};  // { emailAddr : [ packets, ]}
        var resultMismatchedFamilies = [];
        var resultErrorPackets = [];
        var resultErrorSending = [];


        sails.log(' ... preparing to send confirmation emails');

        // respond with a success message so browser doesn't resend request!
        res.AD.success({sent:true}); 

        async.series([

            // get events
            (next) => {

                connAB.query(`

                    SELECT * FROM AB_Events_Event

                    `, (err, results, fields) => {
                    if (err) next(err);
                    else {
                        results.forEach((r)=>{
                            hashEvents[r.id] = r;
                        })
                        next();
                    }
                });
            },

            // get housing room fees:
            (next) => {

                connAB.query(`

                    SELECT * FROM AB_Events_Fees
                    WHERE Post_Name IN ( "HTwin", "HDouble", "HStandard Room" )

                    `, (err, results, fields) => {
                    if (err) next(err);
                    else {
                        results.forEach((r)=>{
                            var translations = JSON.parse(r.translations);
                            hashHousingRoomFees[r.id] = translations[0].Fee;
                        })
                        next();
                    }
                });
            },

            // get housing fees:
            (next) => {

                connAB.query(`

                    SELECT * FROM AB_Events_Fees
                    WHERE Post_Name IN ( "HCrib", "HExtra Bed" )

                    `, (err, results, fields) => {
                    if (err) next(err);
                    else {
                        results.forEach((r)=>{
                            hashHousingFees[r.id] = r.Post_Name.replace(' ', '');
                        })
                        next();
                    }
                });
            },



            // get Registrations
            (next)=>{
                var sql = `

                    SELECT * FROM AB_Events_Registration
                    WHERE event IS Not Null AND SumConfirm = 0

                `;

// Analysis Test:
// if (ANALYSIS_TEST) {

//     // get all registrations we sent out to last time.
//     sql = `

//         SELECT * FROM AB_Events_Registration
//         WHERE event IS Not Null

//     `;
// }


// Testing Locally: 443, 444, 510, 519
// sql = `
// SELECT * FROM AB_Events_Registration
// WHERE event IS Not Null AND id IN ( 442, 443, 470 )
// `
                connAB.query(sql, (err, results, fields) => {
                    if (err) next(err);
                    else {
                        results.forEach((r)=>{
                            var event = hashEvents[r.Event];

                            // some people have null translations so here is a default set:
                            var translations = {
                                "Non-attend reason":"",
                                "Special Requests":""
                            }
                            if (r.translations) {
                                translations  = JSON.parse(r.translations)[0];
                            }
                            

                            hashRegistrationPackets[r.id] = {
                                error:false,
                                errorText:[],
                                regFamilyID: r.RenFamily,
                                event: event,
                                registration: r,
                                registrants:{},
                                HCrib:false,
                                HExtraBed:false,
                                nonAttend:translations['Non-attend reason'],
                                specialRequests:translations['Special Requests']
                            };
                        })
                        next();
                    }
                });

            },


            // get Registrants for each Registration:
            (next)=>{

                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function getRegistrants(list, cb) {
                    if (list.length == 0) {
                        cb();
                    } else {
                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];

                        connAB.query(`

                            SELECT * FROM AB_Events_registrants
                            WHERE Registration434 = ${registrationID}

                            `, (err, results, fields) => {
                            if (err) cb(err);
                            else {
                                var isOneAttending = false;
                                results.forEach((r)=>{
                                    packet.registrants[r.id]=r;
                                    if (r.Attending) {
                                        isOneAttending = true;
                                    }
                                })
                                packet.isOneAttending = isOneAttending;
                                getRegistrants(list, cb);
                            }
                        });


                    }
                }
                getRegistrants(allRegistrationIDs, (err)=>{
                    next(err);
                })
            },


            // // clear out registrations with No one attending
            // (next)=>{
            //     var allRegistrationIDs = Object.keys(hashRegistrationPackets);
            //     var removeCount = 0;

            //     function eachRegistration(list, cb) {
            //         if (list.length == 0) {
            //             cb();
            //         } else {
            //             var registrationID = list.shift();
            //             var packet = hashRegistrationPackets[registrationID];

                        
            //             if (!packet.isOneAttending) {
            //                 removeCount ++;
            //                 delete hashRegistrationPackets[registrationID];
            //             }

            //             eachRegistration(list, cb);
            //         }
            //     }
            //     eachRegistration(allRegistrationIDs, (err)=>{
            //         console.log('... removed '+removeCount+' registrations where no one was attending.');
            //         next(err);
            //     })
            // },


            // fill out Registrant Ren Data in registrant.rendata
            (next)=>{
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function populateRen(list, hashRegistrants, cb) {
                    if (list.length == 0) {
                        cb();
                    } else {
                        var registrantID = list.shift();
                        var registrant = hashRegistrants[registrantID];

                        connAB.query(`

                            SELECT * FROM AB_Events_hrisrendata
                            WHERE ren_id = ${registrant['Ren Name']}

                            `, (err, results, fields) => {
                            if (err) cb(err);
                            else {
                                results.forEach((r)=>{
                                    registrant.rendata = r;
                                })
                                populateRen(list, hashRegistrants, cb);
                            }
                        });
                    }
                }
                function populateRegistrantRen(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();

                        var allRegistrantIDs = Object.keys(hashRegistrationPackets[registrationID].registrants);
                        populateRen(allRegistrantIDs, hashRegistrationPackets[registrationID].registrants, (err)=>{
                            if (err) {
                                cb(err);
                            } else {
                                populateRegistrantRen(list, cb);
                            }
                        })

                    }
                }
                populateRegistrantRen(allRegistrationIDs, (err)=>{
                    next(err);
                })
            },


            // find AccountHolder Details:
            (next) => {
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        var registration = packet.registration;

                        packet.userUUID = '-';
                        
                        connAB.query(`

                            SELECT * FROM AB_Events_AccountHolder
                            WHERE id = ${registration['AccountOwner']}

                            `, (err, results, fields) => {
                            if (err) cb(err);
                            else {
                                results.forEach((r)=>{
                                    packet.userUUID = r.id;
                                    packet.email = r.email;
                                    packet.userName = r.User;
                                    packet.accountHolderRen = r.Ren;
                                    var foundRen = Object.keys(packet.registrants).map((rKey)=>{ return packet.registrants[rKey]}).find((reg)=>{ return reg['Ren Name'] == r.Ren; })
                                    if (foundRen) {
                                        packet.preferredName = getFirstName(foundRen.rendata);
                                    } else {
                                        var firstID = Object.keys(packet.registrants)[0];
                                        if (firstID) {
                                            if (packet.registrants[firstID].rendata) {
                                                packet.preferredName = getFirstName(packet.registrants[firstID].rendata);
                                            } else {
                                                packet.preferredName = 'Citizen';
                                                packet.error = true;
                                                packet.errorText.push("No rendata for registrant:"+firstID );
                                            }
                                            
                                        } else {
                                            packet.preferredName = 'Citizen';
                                            packet.error = true;
                                            packet.errorText.push("No Registrants for this Registration");
                                        }
                                        
                                    }
                                    
                                })
                                eachRegistration(list, cb);
                            }
                        });

                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },


            // map Account Holder -> Family IDs to packet:
            (next) => {

                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];

                        packet.accountHolderFamilyID = '??';

                        if (!packet.accountHolderRen) {
                            eachRegistration(list,  cb);
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
                                eachRegistration(list,  cb);
                            }
                        });

                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },


            // find UserAccount Info:
            (next) => {
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        var registration = packet.registration;

                        SiteUser.find({ username: packet.userName })
                        .then((userList)=>{
                            if (userList && userList.length > 0) {
                                packet.languageCode = userList[0].languageCode;
                                packet.email = userList[0].email;
                                packet.siteUser = userList[0];
                            } else {
                                packet.languageCode = 'en';
                                packet.error = true;
                                packet.errorText.push('No user account for userName:'+packet.userName);
                            }
                            eachRegistration(list, cb);
                        })
                        .catch(cb);

                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },



            // convert conference name to languageCode:
            (next) => {
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        var registration = packet.registration;

                        var json = []
                        try {
                            json = JSON.parse(packet.event.translations)
                        }catch(e) {

                        }

                        var langTrans = json.find((t)=>{ return t.language_code == packet.languageCode; });
                        if (langTrans) {
                            packet.conferenceName = langTrans.Title;
                        } else {
                            if (packet.event) {
                                packet.conferenceName = packet.event.name;
                            } else {
                                packet.error = true;
                                packet.errorText.push('No event for this registration:'+packet.registration.id);
                            }
                            
                        }

                        eachRegistration(list, cb);
                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },

            // get all photos in a hash:
            (next)=>{

                connAB.query(`

                    SELECT * FROM AB_Events_regsPhotos

                    `, (err, results, fields) => {
                    if (err) next(err);
                    else {
                        results.forEach((r)=>{
                            hashPhotos[r.Ren] = r.Photo;
                        })
                        next();
                    }
                });

            },

            // compile Attendees  data:
            // attendees:[ { firstname:'name', lastname:'name', photo:true/false }]
            (next) => {
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        var registration = packet.registration;

                        var attendees = [];
                        if (!packet.error) {
                            Object.keys(packet.registrants).map((r)=>{ return packet.registrants[r]; }).forEach((person)=>{
                                if (person.Attending == 1) {

                                    if (person.rendata) {

                                        attendees.push({
                                            firstname: person.rendata.ren_givenname,
                                            lastname: person.rendata.ren_surname,
                                            photo: (hashPhotos[person.rendata.ren_id] && hashPhotos[person.rendata.ren_id] != '')
                                        })
                                    } else {

                                        packet.error = true;
                                        packet.errorText.push('registrant.'+person.id+' did not have a ren entry. !!! ');
                                        attendees.push({
                                            firstname: 'registrant.'+person.id+' did not have a ren entry. !!! ',
                                            lastname: '',
                                            photo: false
                                        })

                                    }
                                    
                                    
                                }
                            })
                        }
                        packet.attendees = attendees;
                        eachRegistration(list, cb);
                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },



            // compile Housing  data:
            // housing:[ { type:'Description', dates:'from - to' }]
            // 
            (next) => {
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        var registration = packet.registration;

                        
                        connAB.query(`

                            SELECT * FROM AB_Events_Charges
                            WHERE Reg = ${registrationID}

                            `, (err, results, fields) => {
                            if (err) cb(err);
                            else {
                                var housing = [];
                                results.forEach((r)=>{

                                    // if a housingRoomFee add it to the housing entries
                                    if (hashHousingRoomFees[r.Fees177]) {
                                        var from = moment(r.Start).format("ddd MMM D");
                                        var to = moment(r.End).format("ddd MMM D");;

                                        var entry = {
                                            type: hashHousingRoomFees[r.Fees177],
                                            dates: `${from} - ${to}`
                                        }
                                        
                                        housing.push(entry);
                                    }

                                    // if one of the other housing fees, mark the Fee
                                    if (hashHousingFees[r.Fees177]) {
                                        packet[hashHousingFees[r.Fees177]] = true;
                                    }
                                    
                                })
                                packet.housing = housing;
                                eachRegistration(list, cb);
                            }
                        });
                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },


            // 
            // Compile Schedules
            // 
            (next)=>{
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistrant(list, packet, cb) {
                    if (list.length==0) {
                        cb();
                    } else {
                        var registrantID = list.shift();
                        var registrant = packet.registrants[registrantID];

                        var childRenType = 4;
                        var ren = registrant.rendata;

                        // skip entries without a rendata 
                        if (!ren) {
                            eachRegistrant(list, packet, cb);
                            return;
                        }

                        // skip children
                        if (ren.rentype_id == childRenType) {
                            eachRegistrant(list, packet, cb);
                            return;
                        }

                        var schedule = {
                            name:getFirstName(ren),
                            first:'?',
                            second:'?',
                            third:'?'
                        }

                        var hashPriority = {
                            '1535347981478' : 'first',
                            '1535347981516' : 'second',
                            '1535347981589' : 'third'
                        }

                        connAB.query(`

                            SELECT Rank, translations
                            FROM AB_Events_Schedule as s
                            INNER JOIN AB_Events_SubEvent as se ON s.\`Sub Event\` = se.id
                            WHERE s.Attendee = ${registrantID}

                            `, (err, results, fields) => {
                            if (err) cb(err);
                            else {

                                results.forEach((r)=>{

                                    var json = JSON.parse(r.translations);
                                    schedule[hashPriority[r.Rank]] = json[0]['Title']
                                    
                                })
                                
                                packet.schedules.push(schedule);

                                eachRegistrant(list, packet, cb);
                            }
                        });

                    }
                }

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {
                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        packet.schedules = [];

                        if (packet.event.hasCourses) {

                            var allRegistrantIDs = Object.keys(packet.registrants);
                            eachRegistrant(allRegistrantIDs, packet, (err)=>{
                                if (err) { cb(err); return; }
                                eachRegistration(list, cb);
                            })
      
                        } else {
                            eachRegistration(list, cb);
                        }
                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })
            },


            //
            // Compile Childcare services + Translations + Travel
            //
            (next) => {
                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];
                        

                        
                        var allRegistrants = Object.keys(packet.registrants).map((k)=>{ return packet.registrants[k]; });
                        var childRenType = 4;
                        var lang = packet.languageCode || 'en';
                        if (lang == 'ko') lang = 'en';


                        // childcare:
                        var hashChildCare = {
                            "1527238278649" : {
                                    'en' : 'None',
                                    'zh-hans': '没有'
                                },
                            "1527238278344" : {
                                    'en' : 'Chinese',
                                    'zh-hans': '中文'
                                },
                            "1527238278417" : {
                                    'en' : 'English',
                                    'zh-hans': '英文'
                                },
                            "1527238278503" : {
                                    'en' : 'Korean',
                                    'zh-hans': '韩文'
                                },
                        }
                        var childCare = [];
                        allRegistrants.forEach((registrant)=>{
                            if (registrant.Attending) {

                                var ren = registrant.rendata;
                                if (ren && ren.rentype_id == childRenType) {

                                    childCare.push({
                                        name: getFirstName(ren),
                                        option: hashChildCare[registrant.Childcare][lang]
                                    })

                                }
                            }
                        })
                        packet.childCare = childCare;

                        
                        var hashTranslation = {
                            "1533895123776" : {
                                    'en' : 'None',
                                    'zh-hans': '没有'
                                },
                            "1533895123922" : {
                                    'en' : 'Chinese',
                                    'zh-hans': '中文'
                                },
                            "1533895123849" : {
                                    'en' : 'English',
                                    'zh-hans': '英文'
                                },
                            "1533895123960" : {
                                    'en' : 'Korean',
                                    'zh-hans': '韩文'
                                },
                        }
                        var translations = [];
                        allRegistrants.forEach((registrant)=>{

                            if (registrant.Attending) {

                                var ren = registrant.rendata;
                                if (ren && ren.rentype_id != childRenType) {

                                    translations.push({
                                        name: getFirstName(ren),
                                        option: hashTranslation[registrant.translation][lang]
                                    })

                                }
                            }
                        })
                        packet.translations = translations;



                        var travelArrival = [];
                        var travelDeparture = [];
                        allRegistrants.forEach((registrant)=>{

                            if (registrant.Attending) {

                                var ren = registrant.rendata;

                                if (ren) {
                                    travelArrival.push({
                                        name: getFullName(ren),
                                        info: registrant['Arrival Ticket']
                                    })

                                    travelDeparture.push({
                                        name: getFullName(ren),
                                        info: registrant['Departure Ticket']
                                    })
                                }
                                
                            }
                        })
                        packet.travelArrival = travelArrival;
                        packet.travelDeparture = travelDeparture;


                        eachRegistration(list, cb);
                    }

                    var translations = [];

                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })

            },


            // 
            // Send the emails!
            //
            (next) =>{


                var allRegistrationIDs = Object.keys(hashRegistrationPackets);

// testing:
// var justThese = [ 554, 555 ];
// mccgowans 554, 555
// rpoolman  442, 443, 470
// allRegistrationIDs = [ 442, 443, 470 ];


                function eachRegistration(list,  cb) {
                    if (list.length==0) {
                        cb();
                    } else {

                        var registrationID = list.shift();
                        var packet = hashRegistrationPackets[registrationID];

// testing: maybe i've already confirmed one of my testing ones.
// if (!packet) {
// console.log('!!! desired registration not processed ['+registrationID+']  perhaps you already confirmed it?');
// eachRegistration(list, cb);
// return;
// }
                        if (packet.error) {
                            resultErrorPackets.push(packet);
                            // console.log();
                            // console.log('-------------------');
                            // console.log(packet.errorText.join('\n'));
                            // console.log();
                            // console.log(packet);
                            // console.log('-------------------');
                            // console.log();
                            eachRegistration(list, cb);
                            return;
                        }

                        if (packet.accountHolderFamilyID != packet.regFamilyID) {
                            resultMismatchedFamilies.push(packet);
                        }

                        if (!resultSentEmails[packet.email]) {
                            resultSentEmails[packet.email] = [];
                        }
                        resultSentEmails[packet.email].push(packet);

if (ANALYSIS_TEST) {

    // skip the sending of the emails:
    eachRegistration(list, cb);
    return;

}
                        var triggerBase = 'event.registration.summary.';

                        var lang = packet.languageCode || 'en';
                        if (lang == 'ko') {
                            lang = 'en';
                        }

// lang = 'en';
                        var triggerID = triggerBase + lang;
                        var emailTo = [ packet.email ];
                        
// still testing:
// emailTo = [ 'jhausman@zteam.biz', 'jduncandesign@gmail.com', 'rpoolman@zteam.biz' ];
// emailTo = [ 'jhausman@zteam.biz' ];
// emailTo = [ 'rpoolman@zteam.biz' ];




                        EmailNotifications.trigger(triggerID, {
                            to: emailTo,
                            variables: packet,
                            attachments: [
                                {
                                    filename: 'header.png',
                                    content: Buffer.from(Base64Images.headerPNG, 'base64'),
                                    contents: Buffer.from(Base64Images.headerPNG, 'base64'),
                                    cid: 'header',
                                },
                                {
                                    filename: 'bg.jpg',
                                    content: Buffer.from(Base64Images.backgroundJPG, 'base64'),
                                    contents: Buffer.from(Base64Images.backgroundJPG, 'base64'),
                                    cid: 'bg',
                                }
                            ]
                        })
                        .done((html) => {
                            eachRegistration(list, cb);
                        })
                        .fail((err)=>{
                            resultErrorSending.push({ error:err, packet:packet })
                            eachRegistration(list, cb);
                        });

                    }
                }
                eachRegistration(allRegistrationIDs, (err)=>{
                    next(err);
                })
            },


            // Save Error Packets
            (next) => {
                var logContents = "";

                var countSentEmails = 0;
                for(var p in resultSentEmails) {
                    countSentEmails += resultSentEmails[p].length;
                }

                logContents = `
Num Sent Emails : ${countSentEmails}
Num Emails with mismatched Account Holder / Family : ${resultMismatchedFamilies.length}
Num Packets with compiling errors:  ${resultErrorPackets.length}
Num Packets with errors sending emails: ${resultErrorSending.length}



===============


`;

                
                logContents += "\nEmails Sent breakdown:\n";
                var formatResultSentEmails = {};

                for(var p in resultSentEmails) {
                    formatResultSentEmails[p] = formatResultSentEmails[p] || [];
                    resultSentEmails[p].forEach((packet)=>{
                        formatResultSentEmails[p].push(packet.registration.id)
                    })
                }

                var stringResultSentEmails = JSON.stringify(formatResultSentEmails, null, 4);
                logContents += `

--------------------------------------------------
${stringResultSentEmails}
--------------------------------------------------

`;


                console.log('... there were '+resultErrorPackets.length+' registrations with errors compiling their data.');

                logContents += "\nDetails for packets with compile errors:\n";
                logContents += "\nReg.id  :  error text \n";
                var formatCompileErrors = {};

                resultErrorPackets.forEach((packet)=>{
                    formatCompileErrors[packet.registration.id] = packet.errorText.join('; ');
                })
                var stringCompileErrors = JSON.stringify(formatCompileErrors, null, 4)

                logContents += `

--------------------------------------------------
${stringCompileErrors}
--------------------------------------------------

`;



                logContents += "\nDetails for packets with sending errors:\n";
                console.log('... there were '+resultErrorSending.length+' registrations with errors sending their emails.');
                var formatErrorSending = {};
                resultErrorSending.forEach((error)=>{
                    var stringError = error.error.toString();
                    formatErrorSending[error.packet.email] = stringError;
                });
                var stringErrorSending  = JSON.stringify(formatErrorSending, null, 4)

                logContents += `

--------------------------------------------------
${stringErrorSending}
--------------------------------------------------

`;


                var tsFlag = moment().format("YYMMDD-HHmmss");

                fs.writeFile('events_log_confirmationEmailErrors_'+tsFlag+'.log', logContents, (err)=>{
                    if (err) {
                        ADCore.error.log('::: ABMobileQRController.sendRegistrationConfirmation(): error writing log file: ', { error: err } )
                    }
                    next();
                })

            }


        ], (err, data)=>{


            connAB.end();

console.log(':::: Event Confirmation Emails finished.');

            if (err) {
                // res.AD.error(err, err.httpResponseCode || 400);
            } else {
                // res.AD.success({sent:true});    
            }
        })

    },





    // get: /event/confirm/:regID/:isConfirmed
    // receive the incoming response to the email confirmation we sent out.
    receiveRegistrationConfirmationResponse: function(req, res) {
        var regID = req.param('regID') || '--';
        var isConfirmed = req.param('isConfirmed') || '--';
        
        console.log('::: Event Registration Confirmed: '+regID+' '+isConfirmed);

        var connAB = mysql.createConnection({
            host: sails.config.connections.appBuilder.host,
            user: sails.config.connections.appBuilder.user,
            password: sails.config.connections.appBuilder.password,
            database: sails.config.connections.appBuilder.database
        });


        connAB.query(`

            UPDATE AB_Events_Registration
            SET SumConfirm=1, isAccurate=${isConfirmed}
            WHERE uuid = "${regID}"

            `, (err, results, fields) => {
            if (err) {
console.error(err);
res.error(err);
            }
            else {

                var responsePath = 'app_builder/registration_confirmed';
                if (isConfirmed == "0") {
                    responsePath = 'app_builder/needs_adjustments'
                }

                res.view(responsePath, {});

                connAB.end();
                
            }
        });

    }

};



function getFirstName(ren) {
    return ren.ren_preferredname || ren.ren_givenname
}

function getFullName(ren) {
    var first = getFirstName(ren);
    var last  = ren.ren_surname;
    return `${first} ${last}`;
}