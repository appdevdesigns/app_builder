//
//  conf-EventCharges.js
//
//  this script will run through and create unique charges for each of our
//  current registrations.
//
//  To use:
//  copy this to the server:  /appdev-core/setup/conf-EventCharges.js
//  $ cd /app_builder/setup
//  $ node conf-EventCharges.js  
//
//  I recommend running the test first and verifying all the actions look
//  good before doing it for real.
//
//  for help:
//  $ node conf-EventCharges.js help
//



/////
///// Remaining Queries to Insert:
/////

    

// 

    

    







var LOCALTEST = true;       // is this running on your development machine?


var mysql = require('mysql');

var path = require('path');
var fs = require('fs');
var AD = require('ad-utils');
var _ = require('lodash');


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


    }
})


if (wantHelp) {
    var text = `
conf-EventCharges.js

this script will run through and create unique charges for each of our
current registrations.

To use:
copy this to the server:  /appdev-core/setup/conf-EventCharges.js
$ cd /app_builder/setup
$ node conf-EventCharges.js  

I recommend running the test first and verifying all the actions look
good before doing it for real.

for help:
$ node conf-EventCharges.js help

`
    AD.log(text);
    process.exit(0);
}

var ChargesTable = 'AB_Events_Charges';
if (TEST_RUN){
    ChargesTable += '_testing';
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
            "user": "root",
            "password": "root",
            "database": "develop",
            "port": 8889
        });

    } else {
        var configAppBuilder = sails.config.connections.appBuilder;
        connAB = mysql.createConnection(configAppBuilder);
    }



    var testPrefix = '';
    if (TEST_RUN) { testPrefix = '[testing] '}



    console.log();
    console.log('Event: Calculating Charges ... ');

    async.series([

        //
        // Insert Adult Registrants (ASC) Full Week 
        //
        (next)=>{
            
            runQuery(
                'Insert Adult Registrants (ASC) Full Week', 
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
    reg.id, 26, CONCAT('auto_import_26_CFAdult_', reg.id, '_', pep.id), 1
FROM
    AB_Events_registrants pep
INNER JOIN
    AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
    AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
    reg.\`User Submitted\` = 1 and
    pep.Attending = 1 and 
    reg.Event = 2 and 
    pep.Childcare = 1527238278649 and 
    FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) >= 18 and
    not exists (
        SELECT 1
        FROM \`${ChargesTable}\`
        WHERE uuid IN ( 
        
        SELECT
            CONCAT('auto_import_26_CFAdult_', reg.id, '_', pep.id)
        FROM
            AB_Events_registrants pep
        INNER JOIN
            AB_Events_Registration reg on pep.Registration434 = reg.id
        
        ) and
        uuid = CONCAT('auto_import_26_CFAdult_', reg.id, '_', pep.id)
    );
                `,
                next);


        },
        

        //
        // Insert Childcare English (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare English (ASC) Full Week ',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 23, CONCAT('auto_import_23_CCEN_', reg.id, '_', pep.id), '2019-01-15 00:00:00', '2019-01-19 00:00:00', 1
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	pep.Childcare = 1527238278417 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 13 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_23_CCEN_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_23_CCEN_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Childcare Korean (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare Korean (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 22, CONCAT('auto_import_22_CCKO_', reg.id, '_', pep.id), '2019-01-15 00:00:00', '2019-01-19 00:00:00', 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	pep.Childcare = 1527238278503 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 13 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_22_CCKO_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_22_CCKO_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Childcare Chinese (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare Chinese (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 24, CONCAT('auto_import_24_CCCN_', reg.id, '_', pep.id), '2019-01-15 00:00:00', '2019-01-19 00:00:00', 1
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	pep.Childcare = 1527238278344 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 13 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_24_CCCN_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_24_CCCN_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Childcare MK2MK (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare MK2MK (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 25, CONCAT('auto_import_25_CCMK2MK_', reg.id, '_', pep.id), '2019-01-15 00:00:00', '2019-01-19 00:00:00', 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	pep.Childcare != 1527238278649 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 12 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_25_CCMK2MK_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_25_CCMK2MK_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Adult Food Package (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Adult Food Package (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 38, CONCAT('auto_import_38_FConfPkg_', reg.id, '_', pep.id), 1, '2019-01-15 00:00:00', '2019-01-19 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	pep.Childcare = 1527238278649 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) >= 18 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_38_FConfPkg_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_38_FConfPkg_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Children 13+ Lunch (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 13+ Lunch (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 39, CONCAT('auto_import_39_FLunch_', reg.id, '_', pep.id), 1, '2019-01-15 00:00:00', '2019-01-19 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 12 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) <= 18 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_39_FLunch_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_39_FLunch_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Children 4-12 Lunches (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 4-12 Lunches (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 40, CONCAT('auto_import_40_FLunch4-11_', reg.id, '_', pep.id), 1, '2019-01-15 00:00:00', '2019-01-19 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 3 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) <= 12 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_40_FLunch4-11_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_40_FLunch4-11_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Children 0-3 Lunch (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 0-3 Lunch (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 44, CONCAT('auto_import_44_FLunch0-3_', reg.id, '_', pep.id), 1, '2019-01-15 00:00:00', '2019-01-19 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 4 and 
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_44_FLunch0-3_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_44_FLunch0-3_', reg.id, '_', pep.id)
	);
                `,
                next);


        },


        //
        // Insert Children 0-3 Breakfasts (ASC) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 0-3 Breakfasts (ASC) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 43, CONCAT('auto_import_43_FBrkfst0-3_', reg.id, '_', pep.id), 1, '2019-01-15 00:00:00', '2019-01-20 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 2 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 4 and 
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_43_FBrkfst0-3_', reg.id, '_', pep.id)
			FROM
				AB_Events_registrants pep
			INNER JOIN
				AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_43_FBrkfst0-3_', reg.id, '_', pep.id)
	);
                `,
                next);


        },


        //
        // Insert all extra bed breakfast discounts (ASC)
        //
        (next)=>{
            
            runQuery(
                'Insert all extra bed breakfast discounts (ASC)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	ch.Reg, 45, CONCAT('auto_import_45_FDiscFreeBrkfst4-11_', ch.Reg, '_', ch.id), '2019-01-15 00:00:00', '2019-01-20 00:00:00', 1
FROM 
	\`${ChargesTable}\` ch
INNER JOIN 
	AB_Events_Registration reg on reg.id = ch.Reg 
WHERE 
	ch.Fees177 = 51 and
	ch.Reg IS NOT NULL and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_45_FDiscFreeBrkfst4-11_', ch.Reg, '_', ch.id)
			FROM
				\`${ChargesTable}\` ch

		) and
		uuid = CONCAT('auto_import_45_FDiscFreeBrkfst4-11_', ch.Reg, '_', ch.id)
	);
                `,
                next);


        },

        //
        // Insert National Staff Discount (ASC)
        //
        (next)=>{
            
            runQuery(
                'Insert National Staff Discount (ASC)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
	reg.id, 104, CONCAT('auto_import_104_ASCDiscount_', reg.id, '_', pep.id), 1
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_hrisworker wk on pep.\`Ren Name\` = wk.ren_id
INNER JOIN
	AB_Events_Registration reg on reg.id = pep.Registration434 
WHERE 
	reg.Event = 2 AND 
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	wk.sendingregion_id IN (3,4,5,6,7,8,9,10,22,37,40) AND 
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_104_ASCDiscount_', reg.id, '_', pep.id)
			FROM
				AB_Events_registrants pep
			INNER JOIN
				AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_104_ASCDiscount_', reg.id, '_', pep.id)
	);

                `,
                next);


        },



        ////
        //// Insert Breakfast Charges for Each Registration (ASC):
        ////
        (next)=>{


            function processOne(list, cb) {
                if (list.length == 0) {
                    cb();
                } else {


                    var regID = list.shift();


                    runQuery(
                        'Insert Breakfast Charges for Registration ['+regID+']', 
                        `

                            SET @roomsCovered = 0;
                            SET @roomsCovered = (
                                SELECT
                                    COUNT(*)*2 as count
                                FROM 
                                    ${ChargesTable} as ch
                                WHERE
                                    ch.Reg = ${regID} and
                                    ch.Fees177 IN (
                                        SELECT 
                                            id
                                        FROM
                                            AB_Events_Fees fee
                                        WHERE
                                            fee.\`Post_Name\` IN ('HDouble','Hsuite','HTwin','HStandard Room')
                                    )
                            );
                            SET @rownum = 0;
                            INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
                            SELECT
                            	regID, 103, CONCAT('auto_import_103_FBrkfst13+_', regID, '_', pepID), '2019-01-15 00:00:00', '2019-01-20 00:00:00', 1
                            FROM (
                            	SELECT
                            		reg.id as regID, pep.id as pepID, FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) as age, @rownum := @rownum + 1 AS entry
                            	FROM
                            		AB_Events_registrants pep
                            	INNER JOIN
                            		AB_Events_Registration reg on pep.Registration434 = reg.id
                            	INNER JOIN 
                            		AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
                            	WHERE
                            		reg.\`User Submitted\` = 1 and
                            		pep.Attending = 1 and 
                            		reg.Event = 2 and 
                            		reg.id = ${regID} 
                            	ORDER BY 
                            		age DESC
                            ) d WHERE entry <= @roomsCovered and 
                            @roomsCovered > 0 and
                            not exists (
                            	SELECT 1
                            	FROM \`${ChargesTable}\`
                            	WHERE uuid IN ( 
                            	
                            		SELECT
                            			CONCAT('auto_import_103_FBrkfst13+_', regID, '_', pepID)
                            		FROM
                            			${ChargesTable} ch
                            	
                            	) and
                            	uuid = CONCAT('auto_import_103_FBrkfst13+_', regID, '_', pepID)
                            );
                            SET @rownum = 0;
                            INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
                            SELECT
                                regID, 42, CONCAT('auto_import_42_FBrkfst4-11_', regID, '_', pepID), '2019-01-15 00:00:00', '2019-01-20 00:00:00', 1
                            FROM (
                                SELECT
                                    reg.id as regID, pep.id as pepID, FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) as age, @rownum := @rownum + 1 AS entry
                                FROM
                                    AB_Events_registrants pep
                                INNER JOIN
                                    AB_Events_Registration reg on pep.Registration434 = reg.id
                                INNER JOIN 
                                    AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
                                WHERE
                                    reg.\`User Submitted\` = 1 and
                                    pep.Attending = 1 and 
                                    reg.Event = 2 and 
                                    reg.id = ${regID} and 
                                    FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 3
                                ORDER BY 
                                    age DESC
                            ) d WHERE entry > @roomsCovered and 
                            @roomsCovered > 0 and
                            not exists (
                                SELECT 1
                                FROM \`${ChargesTable}\`
                                WHERE uuid IN ( 
                                
                                    SELECT
                                        CONCAT('auto_import_42_FBrkfst4-11_', regID, '_', pepID)
                                    FROM
                                        ${ChargesTable} ch
                                
                                ) and
                                uuid = CONCAT('auto_import_42_FBrkfst4-11_', regID, '_', pepID)
                            );

                            
                        `,
                        ()=>{
                            processOne(list, cb);
                        }
                    );

                }
            }


            connAB.query(`

                    SELECT id 
                    FROM AB_Events_Registration
                    WHERE  
                        Event = 2 
                        AND \`User Submitted\` = 1

                `, (err, results, fields) => {
                if (err) {
                }
                else {
                    var allIDs = results.map((r)=>{ return r.id });
// testing:
// allIDs = [ 816 ];
                    processOne(allIDs, (err)=>{
                        next(err);
                    })
                }
                        
            })



        },
        
        //
        // Insert Discount for early registration (ASC)
        //
        (next)=>{
            
            runQuery(
                'Insert Discount for early registration (ASC)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
    reg.id, 36, CONCAT('auto_import_36_CFEarlyDiscount_', reg.id), 1
FROM
    AB_Events_Registration reg
WHERE
    reg.\`User Submitted\` = 1 and
    reg.Event = 2 and 
    ( reg.\`Submit Date\` < "2018-10-27 00:00:00" or
    reg.created_at < "2018-10-27 00:00:00" ) and
    not exists (
        SELECT 1
        FROM \`${ChargesTable}\`
        WHERE uuid IN ( 
        
        SELECT
            CONCAT('auto_import_36_CFEarlyDiscount_', reg.id)
        FROM
            AB_Events_Registration reg
        
        ) and
        uuid = CONCAT('auto_import_36_CFEarlyDiscount_', reg.id)
    );
                `,
                next);
            
        },
        
        //
        // Insert Fee for late registration (ASC)
        //
        (next)=>{
            
            runQuery(
                'Insert Fee for late registration (ASC)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
    reg.id, 32, CONCAT('auto_import_32_CFLateFee_', reg.id), 1
FROM
    AB_Events_Registration reg
WHERE
    reg.\`User Submitted\` = 1 and
    reg.Event = 2 and 
    reg.created_at > "2018-10-27 00:00:00" and
    not exists (
        SELECT 1
        FROM \`${ChargesTable}\`
        WHERE uuid IN ( 
        
        SELECT
            CONCAT('auto_import_32_CFLateFee_', reg.id)
        FROM
            AB_Events_Registration reg
        
        ) and
        uuid = CONCAT('auto_import_32_CFLateFee_', reg.id)
    );
                `,
                next);
            
        },
        
        
        //
        // Insert Adult Registrants (DEV) Full Week 
        //
        (next)=>{
            
            runQuery(
                'Insert Adult Registrants (DEV) Full Week', 
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
	reg.id, 75, CONCAT('auto_import_75_CFAdult_', reg.id, '_', pep.id), 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	pep.Childcare = 1527238278649 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) >= 18 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_75_CFAdult_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_75_CFAdult_', reg.id, '_', pep.id)
	);
                `,
                next);


        },
        

        //
        // Insert Childcare English (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare English (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 67, CONCAT('auto_import_67_CCEN_', reg.id, '_', pep.id), '2019-01-21 00:00:00', '2019-01-26 00:00:00', 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	pep.Childcare = 1527238278417 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 13 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_67_CCEN_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_67_CCEN_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Childcare Korean (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare Korean (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 64, CONCAT('auto_import_64_CCKO_', reg.id, '_', pep.id), '2019-01-21 00:00:00', '2019-01-26 00:00:00', 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	pep.Childcare = 1527238278503 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 13 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_64_CCKO_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_64_CCKO_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Childcare Chinese (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare Chinese (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 63, CONCAT('auto_import_63_CCCN_', reg.id, '_', pep.id), '2019-01-21 00:00:00', '2019-01-26 00:00:00', 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	pep.Childcare = 1527238278344 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 13 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_63_CCCN_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_63_CCCN_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Childcare MK2MK (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Childcare MK2MK (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	reg.id, 68, CONCAT('auto_import_68_CCMK2MK_', reg.id, '_', pep.id), '2019-01-21 00:00:00', '2019-01-26 00:00:00', 1 
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	pep.Childcare != 1527238278649 and
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 12 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_68_CCMK2MK_', reg.id, '_', pep.id)
			FROM
				AB_Events_registrants pep
			INNER JOIN
				AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_68_CCMK2MK_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Adult Food Package (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Adult Food Package (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 87, CONCAT('auto_import_87_FConfPkg_', reg.id, '_', pep.id), 1, '2019-01-21 00:00:00', '2019-01-26 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	pep.Childcare = 1527238278649 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) >= 18 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_87_FConfPkg_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_87_FConfPkg_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Children 13+ Lunch (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 13+ Lunch (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
    reg.id, 91, CONCAT('auto_import_91_FLunch_', reg.id, '_', pep.id), 1, '2019-01-21 00:00:00', '2019-01-26 00:00:00'
FROM
    AB_Events_registrants pep
INNER JOIN
    AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
    AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
    reg.\`User Submitted\` = 1 and
    pep.Attending = 1 and 
    reg.Event = 6 and 
    FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 12 and 
    FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) <= 18 and
    not exists (
        SELECT 1
        FROM \`${ChargesTable}\`
        WHERE uuid IN ( 

        SELECT
            CONCAT('auto_import_91_FLunch_', reg.id, '_', pep.id)
        FROM
            AB_Events_registrants pep
        INNER JOIN
            AB_Events_Registration reg on pep.Registration434 = reg.id

        ) and
        uuid = CONCAT('auto_import_91_FLunch_', reg.id, '_', pep.id)
    );
                `,
                next);


        },

        //
        // Insert Children 4-12 Lunches (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 4-12 Lunches (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 91, CONCAT('auto_import_91_FLunch4-11_', reg.id, '_', pep.id), 1, '2019-01-21 00:00:00', '2019-01-26 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 3 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) <= 12 and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_91_FLunch4-11_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_91_FLunch4-11_', reg.id, '_', pep.id)
	);
                `,
                next);


        },

        //
        // Insert Children 0-3 Lunch (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 0-3 Lunch (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 92, CONCAT('auto_import_92_FLunch0-3_', reg.id, '_', pep.id), 1, '2019-01-20 00:00:00', '2019-01-27 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 4 and 
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

		SELECT
			CONCAT('auto_import_92_FLunch0-3_', reg.id, '_', pep.id)
		FROM
			AB_Events_registrants pep
		INNER JOIN
			AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_92_FLunch0-3_', reg.id, '_', pep.id)
	);
                `,
                next);


        },


        //
        // Insert Children 0-3 Breakfasts (DEV) Full Week
        //
        (next)=>{
            
            runQuery(
                'Insert Children 0-3 Breakfasts (DEV) Full Week',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`, \`Start\`, \`End\`)
SELECT
	reg.id, 84, CONCAT('auto_import_84_FBrkfst0-3_', reg.id, '_', pep.id), 1, '2019-01-21 00:00:00', '2019-01-27 00:00:00'
FROM
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Registration reg on pep.Registration434 = reg.id
INNER JOIN 
	AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
WHERE
	reg.\`User Submitted\` = 1 and
	pep.Attending = 1 and 
	reg.Event = 6 and 
	FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) < 4 and 
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_84_FBrkfst0-3_', reg.id, '_', pep.id)
			FROM
				AB_Events_registrants pep
			INNER JOIN
				AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_84_FBrkfst0-3_', reg.id, '_', pep.id)
	);
                `,
                next);


        },


        //
        // Insert all extra bed breakfast discounts (DEV)
        //
        (next)=>{
            
            runQuery(
                'Insert all extra bed breakfast discounts (DEV)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
SELECT
	ch.Reg, 88, CONCAT('auto_import_88_FDiscFreeBrkfst4-11_', ch.Reg, '_', ch.id), '2019-01-21 00:00:00', '2019-01-27 00:00:00', 1
FROM 
	\`${ChargesTable}\` ch
INNER JOIN 
	AB_Events_Registration reg on reg.id = ch.Reg 
WHERE 
	ch.Fees177 = 69 and
	ch.Reg IS NOT NULL and
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_88_FDiscFreeBrkfst4-11_', ch.Reg, '_', ch.id)
			FROM
				\`${ChargesTable}\` ch

		) and
		uuid = CONCAT('auto_import_88_FDiscFreeBrkfst4-11_', ch.Reg, '_', ch.id)
	);
                `,
                next);


        },

        //
        // Insert National Staff Discount (DEV)
        //
        (next)=>{
            
            runQuery(
                'Insert National Staff Discount (DEV)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
    reg.id, 105, CONCAT('auto_import_105_DevWkDiscount_', reg.id, '_', pep.id), 1
FROM
    AB_Events_registrants pep
INNER JOIN
    AB_Events_hrisworker wk on pep.\`Ren Name\` = wk.ren_id
INNER JOIN
    AB_Events_Registration reg on reg.id = pep.Registration434 
WHERE 
    reg.Event = 6 AND 
    reg.\`User Submitted\` = 1 and
    pep.Attending = 1 and 
    wk.sendingregion_id IN (3,4,5,6,7,8,9,10,22,37,40) AND 
    not exists (
        SELECT 1
        FROM \`${ChargesTable}\`
        WHERE uuid IN ( 

            SELECT
                CONCAT('auto_import_105_DevWkDiscount_', reg.id, '_', pep.id)
            FROM
                AB_Events_registrants pep
            INNER JOIN
                AB_Events_Registration reg on pep.Registration434 = reg.id

        ) and
        uuid = CONCAT('auto_import_105_DevWkDiscount_', reg.id, '_', pep.id)
    );

                `,
                next);


        },

        //
        // Insert all Dev Week Fees (DEV)
        //
        (next)=>{
            
            runQuery(
                'Insert all Dev Week Fees (DEV)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT 
	reg.id, 106, CONCAT('auto_import_106_DevClass_', reg.id, '_', pep.id), 1
FROM 
	AB_Events_registrants pep
INNER JOIN
	AB_Events_Schedule cls on cls.Attendee = pep.id
INNER JOIN 
	AB_Events_Registration reg on reg.id = pep.Registration434
WHERE
	pep.Attending = 1 and
	reg.\`User Submitted\` = 1 and
	reg.Event = 6 and 
	not exists (
		SELECT 1
		FROM \`${ChargesTable}\`
		WHERE uuid IN ( 

			SELECT
				CONCAT('auto_import_106_DevClass_', reg.id, '_', pep.id)
			FROM
				AB_Events_registrants pep
			INNER JOIN
				AB_Events_Registration reg on pep.Registration434 = reg.id

		) and
		uuid = CONCAT('auto_import_106_DevClass_', reg.id, '_', pep.id)
	)
GROUP BY
	reg.id,
	pep.id,
	pep.Registration434	
ORDER BY
	pep.\`Ren Name\`;
                `,
                next);


        },
        
        
        ////
        //// Insert Breakfast Charges for Each Registration (DEV):
        ////
        (next)=>{


            function processOne(list, cb) {
                if (list.length == 0) {
                    cb();
                } else {


                    var regID = list.shift();


                    runQuery(
                        'Insert Breakfast Charges for Registration ['+regID+']', 
                        `

                            SET @roomsCovered = 0;
                            SET @roomsCovered = (
                                SELECT
                                    COUNT(*)*2 as count
                                FROM 
                                    ${ChargesTable} as ch
                                WHERE
                                    ch.Reg = ${regID} and
                                    ch.Fees177 IN (
                                        SELECT 
                                            id
                                        FROM
                                            AB_Events_Fees fee
                                        WHERE
                                            fee.\`Post_Name\` IN ('HDouble','Hsuite','HTwin','HStandard Room')
                                    )
                            );
                            SET @rownum = 0;
                            INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
                            SELECT
                                regID, 85, CONCAT('auto_import_85_FBrkfst13+_', regID, '_', pepID), '2019-01-21 00:00:00', '2019-01-27 00:00:00', 1
                            FROM (
                                SELECT
                                    reg.id as regID, pep.id as pepID, FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) as age, @rownum := @rownum + 1 AS entry
                                FROM
                                    AB_Events_registrants pep
                                INNER JOIN
                                    AB_Events_Registration reg on pep.Registration434 = reg.id
                                INNER JOIN 
                                    AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
                                WHERE
                                    reg.\`User Submitted\` = 1 and
                                    pep.Attending = 1 and 
                                    reg.Event = 6 and 
                                    reg.id = ${regID} 
                                ORDER BY 
                                    age DESC
                            ) d WHERE entry <= @roomsCovered and 
                            @roomsCovered > 0 and
                            not exists (
                                SELECT 1
                                FROM \`${ChargesTable}\`
                                WHERE uuid IN ( 
                                
                                    SELECT
                                        CONCAT('auto_import_85_FBrkfst13+_', regID, '_', pepID)
                                    FROM
                                        ${ChargesTable} ch
                                
                                ) and
                                uuid = CONCAT('auto_import_85_FBrkfst13+_', regID, '_', pepID)
                            );
                            SET @rownum = 0;
                            INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Start\`, \`End\`, \`Apply Charge\`)
                            SELECT
                                regID, 86, CONCAT('auto_import_86_FBrkfst4-11_', regID, '_', pepID), '2019-01-21 00:00:00', '2019-01-27 00:00:00', 1
                            FROM (
                                SELECT
                                    reg.id as regID, pep.id as pepID, FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) as age, @rownum := @rownum + 1 AS entry
                                FROM
                                    AB_Events_registrants pep
                                INNER JOIN
                                    AB_Events_Registration reg on pep.Registration434 = reg.id
                                INNER JOIN 
                                    AB_Events_hrisrendata ren on pep.\`Ren Name\` = ren.ren_id
                                WHERE
                                    reg.\`User Submitted\` = 1 and
                                    pep.Attending = 1 and 
                                    reg.Event = 6 and 
                                    reg.id = ${regID} and 
                                    FLOOR(datediff('2019-01-28', ren.ren_birthdate)/365) > 3
                                ORDER BY 
                                    age DESC
                            ) d WHERE entry > @roomsCovered and 
                            @roomsCovered > 0 and
                            not exists (
                                SELECT 1
                                FROM \`${ChargesTable}\`
                                WHERE uuid IN ( 
                                
                                    SELECT
                                        CONCAT('auto_import_86_FBrkfst4-11_', regID, '_', pepID)
                                    FROM
                                        ${ChargesTable} ch
                                
                                ) and
                                uuid = CONCAT('auto_import_86_FBrkfst4-11_', regID, '_', pepID)
                            );

                            
                        `,
                        ()=>{
                            processOne(list, cb);
                        }
                    );

                }
            }


            connAB.query(`

                    SELECT id 
                    FROM AB_Events_Registration
                    WHERE  
                        Event = 6 
                        AND \`User Submitted\` = 1

                `, (err, results, fields) => {
                if (err) {
                }
                else {
                    var allIDs = results.map((r)=>{ return r.id });
// testing:
// allIDs = [ 816 ];
                    processOne(allIDs, (err)=>{
                        next(err);
                    })
                }
                        
            })



        },
        
        //
        // Insert Discount for early registration (DEV)
        // Removed this charge because it is only applied to ASC
//         (next)=>{
// 
//             runQuery(
//                 'Insert Discount for early registration (DEV)',
//                 `
// INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
// SELECT
//     reg.id, 65, CONCAT('auto_import_65_CFEarlyDiscount_', reg.id), 1
// FROM
//     AB_Events_Registration reg
// WHERE
//     reg.\`User Submitted\` = 1 and
//     reg.Event = 6 and 
//     ( reg.\`Submit Date\` < "2018-10-27 00:00:00" or
//     reg.created_at < "2018-10-27 00:00:00" ) and
//     not exists (
//         SELECT 1
//         FROM \`${ChargesTable}\`
//         WHERE uuid IN ( 
// 
//         SELECT
//             CONCAT('auto_import_65_CFEarlyDiscount_', reg.id)
//         FROM
//             AB_Events_Registration reg
// 
//         ) and
//         uuid = CONCAT('auto_import_65_CFEarlyDiscount_', reg.id)
//     );
//                 `,
//                 next);
// 
//         },
        
        //
        // Insert Fee for late registration (DEV)
        //
        (next)=>{
            
            runQuery(
                'Insert Fee for late registration (DEV)',
                `
INSERT INTO \`${ChargesTable}\` (\`Reg\`, \`Fees177\`, \`uuid\`, \`Apply Charge\`)
SELECT
    reg.id, 81, CONCAT('auto_import_81_CFLateFee_', reg.id), 1
FROM
    AB_Events_Registration reg
WHERE
    reg.\`User Submitted\` = 1 and
    reg.Event = 6 and 
    reg.created_at > "2018-10-27 00:00:00" and
    not exists (
        SELECT 1
        FROM \`${ChargesTable}\`
        WHERE uuid IN ( 
        
        SELECT
            CONCAT('auto_import_81_CFLateFee_', reg.id)
        FROM
            AB_Events_Registration reg
        
        ) and
        uuid = CONCAT('auto_import_81_CFLateFee_', reg.id)
    );
                `,
                next);
            
        },



    ////
    //// All Done, print out some results:
    ////

    ],function(err, results){

        console.log();
        console.log();


        var resultSummaryContents = "";
        var maxLength =0;
        for (var r in resultSummary) {
            if (r.length > maxLength) {
                maxLength = r.length;
            }
        }

        maxLength += 2;


        for (var r in resultSummary) {
            var padded = padIt(r, maxLength);
            resultSummaryContents += `
${padded} : ${resultSummary[r]}`;
        }


        var logFileName = "log-confEventCharges.log";
        fs.writeFile(logFileName, resultSummaryContents, (err)=>{

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



function runQuery ( resultKey, sql, cb ) {

    var sqlParts = sql.split(";");

    async.eachSeries(sqlParts, (sqlCmd, done)=>{

// how to detect an empty query and skip?

        connAB.query(sqlCmd, (err, results, fields) => {
            if (err) {

                // if our .split(';') resulted in a final empty query, just ignore:
                if (err.code == 'ER_EMPTY_QUERY') {
                    done();
                    return;
                }

                // log the error
                resultSummary[resultKey] = err.toString();
                done(err);
            }
            else {
                resultSummary[resultKey] = `${results.affectedRows} rows INSERTED `
                done()
            }
                    
        })
    }, (err, results)=>{
        cb();
    })

}


function padIt(str, length) {
    while (str.length < length) {
        str += ' ';
    }
    return str;
}
