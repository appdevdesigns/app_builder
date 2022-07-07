USE `appbuilder-admin`;

DROP PROCEDURE IF EXISTS `CLOSE_FP_PROCESS`;

DELIMITER $$
CREATE PROCEDURE `CLOSE_FP_PROCESS` (
   IN FISCAL_PERIOD_UUID varchar(255)
) 
BEGIN
   DECLARE FP_Closed varchar(255) DEFAULT "";
   DECLARE FP_OPEN varchar(255) DEFAULT "1592549785939";
   -- DECLARE FP_Closing varchar(255) DEFAULT "1592549786026";
   -- DECLARE FP_Next_To_Use varchar(255) DEFAULT "1592549785894";
   DECLARE FY_PERIOD varchar(255);
   DECLARE OLD_END_DATE date;
   DECLARE SEARCHDATE date;
   DECLARE NEW_FP varchar(255);
   DECLARE NEW_FP_UUID varchar(255);
   DECLARE NEXT_MONTH_NUM varchar(255);
   DECLARE CURRENT_YEAR varchar(255);
   /* */
   SELECT `FY Per`, `End`, `FYear`
   INTO FY_PERIOD, OLD_END_DATE, CURRENT_YEAR
   FROM `AB_AccountingApp_FiscalMonth`
   WHERE `uuid` = FISCAL_PERIOD_UUID
   LIMIT 1;

   -- START conditions for a new year
   -- trim out the month, add one -> If closing month has a remainder when divided by 12, it resets to that number: 13 becomes 1
   SELECT ((SUBSTRING_INDEX(FY_PERIOD, "M", -1)+ 1) MOD 12 ) INTO NEXT_MONTH_NUM;
   -- if month is '1', we have to increment all the places we use year
   SELECT IF(
       NEXT_MONTH_NUM LIKE '1',
       CONCAT("FY", LPAD((RIGHT(CURRENT_YEAR, 4)+ 1), 4, 0) ),
       CURRENT_YEAR
   ) INTO CURRENT_YEAR;

   SELECT IF(
       NEXT_MONTH_NUM LIKE '1',
       CONCAT("FY", LPAD(RIGHT(CURRENT_YEAR, 2),2,0)),
       FY_PERIOD
   ) INTO NEW_FP;
   -- make sure next year exist
   INSERT IGNORE INTO `AB_AccountingApp_FiscalYear` 
      (
         `FYear`, 
         `Status`,
         `uuid`,
         `created_at`,
         `updated_at`
      ) 
   VALUES 
      (
         CURRENT_YEAR, 
         "1594114974934", 
         UUID(), 
         NOW(), 
         NOW()
      );
   -- END conditions for a new year

   -- FY21 M03 -> add leading zeros to month_num, and concat with the current year: to get 'FY21 M04'
   SELECT CONCAT((SUBSTRING_INDEX(NEW_FP, " ", 1)), " M", LPAD(NEXT_MONTH_NUM, 2, 0) ) INTO NEW_FP;

   SELECT `uuid`
   INTO NEW_FP_UUID
   FROM `AB_AccountingApp_FiscalMonth` 
   WHERE `FY Per` = NEW_FP
   LIMIT 1;

   -- if `FY Per` that we made isn't in the talbe, add the next month: 
   -- we are counting on FY Per being a unique field!
   INSERT INTO `AB_AccountingApp_FiscalMonth` 
      (
         `FY Per`, 
         `FYear`,  
         `Start`, 
         `End`, 
         `Status`, 
         `Current Process`, 
         `Open`, 
         `uuid`,
         `created_at`,
         `updated_at`
      ) 
      SELECT *
         FROM
      (
      SELECT DISTINCT
         NEW_FP `FY Per`, 
         CURRENT_YEAR `FYear`,  
         OLD_END_DATE + interval 1 day `Start`, 
         CAST(OLD_END_DATE AS DATE) + interval 1 day + interval 1 month+ interval -1 day `End`, 
         "1592549785939" `Status`, 
         "In use" `Current Process`, 
         1 `Open`, 
         IFNULL(NEW_FP_UUID, UUID()) `uuid`,
         NOW() `created_at`,
         NOW() `updated_at`  
      ) r
   ON DUPLICATE KEY UPDATE
   `updated_at` = NOW();

   UPDATE `AB_AccountingApp_FiscalMonth`
   SET `Open` = 0
   WHERE `uuid` = FISCAL_PERIOD_UUID
   LIMIT 1;

   -- set open
   UPDATE `AB_AccountingApp_FiscalMonth`
   SET `Open` = 1,
      `Status` = FP_OPEN
   -- WHERE `Start` = DATEADD(day, 1, OLD_END_DATE);
   WHERE `FY Per` LIKE NEW_FP
   LIMIT 1;

   -- new GLSegment (inc. 3991) 
   INSERT INTO `AB_AccountingApp_GLSegment` (
         `Balndx`,
         `uuid`,
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
            CONCAT (NEW_FP, '-', GL.`COA Num`, '-', GL.`RC Code`) `Balndx`, 
            UUID() `uuid`,
            NEW_FP `FY Period`, -- Next Fiscal Month
            GL.`COA Num`, -- Same as Original Balance Record
            GL.`RC Code`,
            IFNULL(GL.`Running Balance`, 0) `Starting Balance`,
            0 `Credit`,
            0 `Debit`,
            IFNULL(GL.`Running Balance`, 0) `Running Balance`,
            Now() `created_at`,
            Now() `updated_at`
         FROM
            `AB_AccountingApp_GLSegment` GL
         WHERE
            GL.`FY Period` LIKE FY_PERIOD
      ) r
      ON DUPLICATE KEY UPDATE
      `Starting Balance` = r.`Starting Balance`,
      `Running Balance` = IF(
         (r.`COA Num` > 1999 AND r.`COA Num` < 7000) OR (r.`COA Num` > 8999 AND r.`COA Num` < 9200),
         r.`Starting Balance` + `AB_AccountingApp_GLSegment`.`Credit` - `AB_AccountingApp_GLSegment`.`Debit`,
         r.`Starting Balance` + `AB_AccountingApp_GLSegment`.`Debit` - `AB_AccountingApp_GLSegment`.`Credit`  
         ),
      `updated_at` = NOW();

END$$
DELIMITER ;