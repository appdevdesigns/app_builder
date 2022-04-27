DROP PROCEDURE IF EXISTS `JEARCHIVE_PROCESS`;

DELIMITER $$
CREATE PROCEDURE `JEARCHIVE_PROCESS` (
    IN BATCH_UUID varchar(255)
)
BEGIN
    DECLARE BATCH_INDEX int;
    DECLARE FY_PERIOD varchar(255);

    /* Get FY Period & Batch Index */
    SELECT `Post Period`, `Batch Index`
    INTO FY_PERIOD, BATCH_INDEX
    FROM `AB_AccountingApp_Batch`
    WHERE `uuid` = BATCH_UUID
    LIMIT 1;

    /* Pull data from JE and Balance */
    DROP TEMPORARY TABLE `JE_ARCHIVE`;

    CREATE TEMPORARY TABLE `JE_ARCHIVE`
    SELECT DISTINCT
        IFNULL(JE.`uuid`, NULL) `uuid`,
        GL.`Balndx` `Bal ID`,
        JE.`Batch Index`,
        JE.`Date`,
        JE.`Debit`,
        JE.`Credit`,
        JE.`Ref Name` `Ref Number`,
        IFNULL(JE.`Memo`, JE.`Approval Note`) `Description`,
        JE.`Project`
    FROM `AB_AccountingApp_JournalEntry` JE
    INNER JOIN `AB_AccountingApp_GLSegment` GL
    ON JE.`Account` = GL.`COA Num`
    AND JE.`RC Code` = GL.`RC Code`
    WHERE JE.`Batch Index` = BATCH_INDEX
    AND GL.`FY Period` = FY_PERIOD;

    /* Create to JEArchive */
    INSERT INTO `AB_AccountingApp_JEArchive` 
        (`uuid`, `created_at`,
        `Bal ID`, `Batch Index`, `Date`, `Debit`, `Credit`, `Ref Number`, `Description`, `Project`)
    SELECT DISTINCT 
        UUID(), NOW(),
        `Bal ID`, `Batch Index`, `Date`, `Debit`, `Credit`, `Ref Number`, `Description`, `Project`
    FROM `JE_ARCHIVE`;

    /* Remove JE data */
    DELETE FROM `AB_AccountingApp_JEArchive`
    WHERE `uuid` IN (
        SELECT `uuid`
        FROM `JE_ARCHIVE`
        WHERE `uuid` IS NOT NULL
    );

END$$
DELIMITER ;
