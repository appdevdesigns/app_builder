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
    DROP TEMPORARY TABLE IF EXISTS JE_ARCHIVE;

    CREATE TEMPORARY TABLE JE_ARCHIVE
    SELECT DISTINCT
        IFNULL(JE.`uuid`, NULL) `JE PK`,
        UUID() `JEArchive PK`,
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
        `JEArchive PK`, NOW(),
        `Bal ID`, `Batch Index`, `Date`, `Debit`, `Credit`, `Ref Number`, `Description`, `Project`
    FROM JE_ARCHIVE;

    /* Remove JE data */
    DELETE FROM `AB_AccountingApp_JournalEntry`
    WHERE `uuid` IN (
        SELECT `JE PK`
        FROM JE_ARCHIVE
        WHERE `JE PK` IS NOT NULL
    );

    /* Return  */
    SELECT DISTINCT `JEArchive PK`
    FROM JE_ARCHIVE;

END$$
DELIMITER ;
