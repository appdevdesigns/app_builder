USE `appbuilder-admin`;

DROP PROCEDURE IF EXISTS `CLOSE_FY_YEAR_PROCESS`;

DELIMITER $$
CREATE PROCEDURE `CLOSE_FY_YEAR_PROCESS` (
   IN FY_INDEX varchar(255)
)
BEGIN
   DECLARE ACCOUNT_Assets varchar(255) DEFAULT "1585806356532";
   DECLARE FP_Closed varchar(255) DEFAULT "1592549786113";
   DECLARE FY_Open varchar(255) DEFAULT "1594114974934";
   DECLARE FY_Closed varchar(255) DEFAULT "1594114975138";
   DECLARE FY_Closing varchar(255) DEFAULT "1594114975036";
   DECLARE FY_Future varchar(255) DEFAULT "1594114974880";
   -- DECLARE ACCOUNT_Equity varchar(255) DEFAULT "1585806356643";
   -- DECLARE ACCOUNT_Income varchar(255) DEFAULT "1590392412833";
   DECLARE OLD_END_DATE date;
   DECLARE FY_PERIOD varchar(255);
   DECLARE NEW_FY varchar(255);
   DECLARE NEW_FY_TWO_DIGITS varchar(255);
   DECLARE NEW_FP varchar(255);
   DECLARE FP_NEW_START_DATE date;
   DECLARE FP_Last varchar(255);
   DECLARE LOOP_Index int DEFAULT '1';

-- Pull FP Year object
   SELECT `FYear`, `End`
   INTO FY_PERIOD, OLD_END_DATE
   FROM `AB_AccountingApp_FiscalYear`
   WHERE `uuid` = FY_INDEX
   LIMIT 1;

-- 1. Find last fiscal month in fiscal year (M12)
   SELECT `FY Per`
   INTO FP_Last
   FROM `AB_AccountingApp_FiscalMonth`
   WHERE `FYear` LIKE FY_PERIOD AND `FY Per` LIKE "%12"
   LIMIT 1;
   -- Close all months in old year
   UPDATE `AB_AccountingApp_FiscalMonth`
   SET `Open` = 0, `Status` = FP_Closed, `Current Process`="Closed"
   WHERE `FYear` LIKE FY_PERIOD ;
-- 2. create/ find the next fiscal year and months
   -- FY21 -> trim out FY, add one, add leading zeros, and concat with "FY": to get 'FY22'
   -- SELECT CONCAT("FY", LPAD((SUBSTRING_INDEX(FY_PERIOD, "Y", -1)+ 1), 2, 0) ) INTO NEW_FY;
   -- Production data is 4 chars long
   SELECT CONCAT("FY", LPAD((RIGHT(FY_PERIOD, 4)+ 1), 4, 0) ) INTO NEW_FY;

   INSERT IGNORE INTO `AB_AccountingApp_FiscalYear` 
      (
         `FYear`, 
         `Start`, 
         `End`, 
         `Status`,
         `uuid`,
         `created_at`,
         `updated_at`
      ) 
   VALUES 
      (
         NEW_FY, 
         OLD_END_DATE + interval 1 day, 
         CAST(OLD_END_DATE AS DATE) + interval 1 day + interval 1 year+ interval -1 day, 
         FY_Open, 
         UUID(), 
         NOW(), 
         NOW()
      );

   SELECT OLD_END_DATE + interval 1 day INTO FP_NEW_START_DATE;
   
-- NEW_FY_TWO_DIGITS
-- LPAD((SUBSTRING_INDEX(FP_Last, "M", 1)+1),2,0)

   -- SELECT CONCAT("FY20", LPAD((SUBSTRING_INDEX(FY_PERIOD, "Y", -1)+ 1), 2, 0) ) INTO NEW_FY_TWO_DIGITS;
   SELECT CONCAT("FY", LPAD(RIGHT(NEW_FY, 2),2,0)) INTO NEW_FY_TWO_DIGITS;
   WHILE LOOP_Index <= 12 DO
      SELECT CONCAT(NEW_FY_TWO_DIGITS, " M", LPAD(LOOP_Index, 2, 0) ) INTO NEW_FP;
      INSERT INTO `AB_AccountingApp_FiscalMonth` 
         (`FYear`, `FY Per`, `Start`, `End`, `Status`, `Current Process`, `Open`, `uuid`,`created_at`,`updated_at`) 
      SELECT *
         FROM
      (
         SELECT DISTINCT
               NEW_FY `FYear`, 
               NEW_FP `FY Per`, 
               FP_NEW_START_DATE `Start`, 
               (FP_NEW_START_DATE + interval 1 month + interval -1 day) `End`, 
               "1592549785894" `Status`, 
               "Next For Use" `Current Process`, 
               0 `Open`, 
               UUID() `uuid`,
               NOW() `created_at`,
               NOW() `updated_at`            
      ) r
      ON DUPLICATE KEY UPDATE
      -- `FYear` = r.`FYear`,
      `Start` = r.`Start`, 
      `End` = r.`End`,
      `updated_at` = NOW();
      SELECT FP_NEW_START_DATE + interval 1 month INTO FP_NEW_START_DATE;
      -- SET LOOP_Index = LOOP_Index + 1;
      SELECT LOOP_Index + 1 INTO LOOP_Index;
   END WHILE;
   -- make ID for first fiscal period
-- 2.1 Find first fiscal month in the next fiscal year (M1)
   SELECT CONCAT(NEW_FY_TWO_DIGITS, " M01" ) INTO NEW_FP;
   -- update month to be open
   UPDATE `AB_AccountingApp_FiscalMonth`
   SET `Open` = 1, `Status` = "1592549785939"
   WHERE `FY Per` LIKE NEW_FP;

-- 3. Find M12 Balances with Account Number = 3500 an 3991
   -- /* CREATE NEW GLSegment (Account 3500) */
   INSERT INTO `AB_AccountingApp_GLSegment`
      (`Balndx`,
      `FY Period`, `COA Num`, `RC Code`, 
      `Starting Balance`, `Credit`, `Debit`, `Running Balance`,
      `created_at`, `updated_at`,`uuid`)
   SELECT * FROM
   (
      SELECT DISTINCT
         CONCAT(NEW_FP, '-3500-', RC.`RC Name`) `Balndx`,
         NEW_FP `FY Period`, 
         3500 `COA Num`,
         RC.`RC Name` `RC Code`,
         (
            IFNULL((
               SELECT 
                  IFNULL(GL.`Starting Balance`, 0)
               FROM `AB_AccountingApp_GLSegment` GL
               WHERE 
                  GL.`COA Num`=3500 AND 
                  GL.`FY Period`=FP_Last AND 
                  GL.`RC Code` = RC.`RC Name`
               LIMIT 1
            ), 0)
            +
            IFNULL((
               SELECT 
                  IFNULL(GL9.`Running Balance`, 0)
               FROM `AB_AccountingApp_GLSegment` GL9
               WHERE 
                  GL9.`COA Num`=3991 AND 
                  GL9.`FY Period`=FP_Last AND 
                  GL9.`RC Code` = RC.`RC Name`
               LIMIT 1
            ), 0)
         ) `Starting Balance`,
         0 `Credit`,
         0 `Debit`,
         0 `Running Balance`,
         NOW() `created_at`,
         NOW() `updated_at`,
         UUID() `uuid`
      FROM
         `AB_MyTeamFinance_ResponsibilityCenter` RC
      INNER JOIN `AB_AccountingApp_GLSegment` GL -- Do not add empty 3500 records
         ON RC.`RC Name` = GL.`RC Code`
         WHERE
         GL.`COA Num` LIKE "3500"  OR
         GL.`COA Num` LIKE "3991" 
   ) r
   ON DUPLICATE KEY UPDATE
   `Starting Balance` = r.`Starting Balance`,
   `Credit` = 0,
   `Debit` = 0,
   `updated_at` = NOW();

   -- Remove empty 3500 records
   DELETE FROM `AB_AccountingApp_GLSegment`
	WHERE `COA Num` LIKE CONCAT("%",NEW_FP,"-3500%" ) AND `Starting Balance`= '0' AND`Running Balance`='0' AND`Debit`='0' AND`Credit`='0';

   -- update running balance
   UPDATE `AB_AccountingApp_GLSegment`
   SET 
      `Running Balance` = `Starting Balance` 
   WHERE `Balndx` LIKE CONCAT("%",NEW_FP,"-3500%" );

-- 5. Find All M1 Balances With Account Type = Income, Expense, or Equity
-- 6. Update M1 Balances
   INSERT INTO `AB_AccountingApp_GLSegment` (
      `uuid`,
      `Balndx`,
      `FY Period`,
      `COA Num`,
      `RC Code`,
      `Starting Balance`,
      `Credit`,
      `Debit`,
      `Running Balance`,
      `created_at`,
      `updated_at`
   ) 
   SELECT *
      FROM
   (
      SELECT DISTINCT
      UUID() `uuid`,
      CONCAT (NEW_FP, '-', GL.`COA Num`, '-', GL.`RC Code`) `Balndx`, 
      NEW_FP `FY Period`, -- Next Fiscal Month
      GL.`COA Num`, -- Same as Original Balance Record
      GL.`RC Code`,
      IFNULL(
         IF( -- Income 1590392412833, Expense 1585806356789, or Equity 1585806356643
         (AC.`Category` LIKE '1590392412833' OR AC.`Category` LIKE '1585806356789' OR AC.`Category` LIKE '1585806356643' or GL.`COA Num` LIKE "3991"),
         -- (GL.`COA Num` > 9999 OR GL.`COA Num` < 4000) AND (GL.`COA Num` > 49999 OR GL.`COA Num` < 40000) AND GL.`COA Num` != "3991"),
            0,  
            GL.`Running Balance`
         )
         , 0) `Starting Balance`,
      0 `Credit`,
      0 `Debit`,
      IFNULL(
         IF( 
         (AC.`Category` LIKE '1590392412833' OR AC.`Category` LIKE '1585806356789' OR AC.`Category` LIKE '1585806356643' or GL.`COA Num` LIKE "3991"),
            0,  
            GL.`Running Balance`
         )
         , 0)  `Running Balance`,
      NOW() `created_at`,
      NOW() `updated_at`
      FROM
      `AB_AccountingApp_GLSegment` GL
      LEFT JOIN `AB_AccountingApp_Account` AC
      ON AC.`Acct Num` = GL.`COA Num`
      WHERE
      GL.`FY Period` LIKE FP_Last AND
      GL.`COA Num` != "3500" 
   ) r
   ON DUPLICATE KEY UPDATE
   `Starting Balance` = r.`Starting Balance`,
   `Running Balance` = IF(
      (r.`COA Num` > 1999 AND r.`COA Num` < 7000) OR (r.`COA Num` > 8999 AND r.`COA Num` < 9200),
      r.`Starting Balance` + `AB_AccountingApp_GLSegment`.`Credit` - `AB_AccountingApp_GLSegment`.`Debit`,
      r.`Starting Balance` + `AB_AccountingApp_GLSegment`.`Debit` - `AB_AccountingApp_GLSegment`.`Credit`  
      ),
   `updated_at` = NOW();
-- update old year to closed
   UPDATE `AB_AccountingApp_FiscalYear`
   SET `Status` = FY_Closed
   WHERE `uuid` = FY_INDEX;

END$$
DELIMITER ;
