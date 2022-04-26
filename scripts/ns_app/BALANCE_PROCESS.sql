DROP PROCEDURE IF EXISTS `BALANCE_PROCESS`;

DELIMITER $$
CREATE PROCEDURE `BALANCE_PROCESS` (
    IN BATCH_UUID varchar(255)
)
BEGIN
    DECLARE ACCOUNT_Assets varchar(255) DEFAULT "1585806356532";
    DECLARE ACCOUNT_Expenses varchar(255) DEFAULT "1585806356789";
    DECLARE ACCOUNT_Liabilities varchar(255) DEFAULT "1585806356570";
    DECLARE ACCOUNT_Equity varchar(255) DEFAULT "1585806356643";
    DECLARE ACCOUNT_Income varchar(255) DEFAULT "1590392412833";
    DECLARE BATCH_INDEX int;
    DECLARE FY_PERIOD varchar(255);

    -- Get FY Period
    SELECT `Post Period`, `Batch Index`
    INTO FY_PERIOD, BATCH_INDEX
    FROM `AB_AccountingApp_Batch`
    WHERE `uuid` = BATCH_UUID
    LIMIT 1;

    -- UPSERT new GLSegment (NOT 3991)
    INSERT INTO `AB_AccountingApp_GLSegment`
        (`uuid`, `FY Period`, `COA Num`, `RC Code`, 
        `Starting Balance`, `Credit`, `Debit`, `Running Balance`,
        `created_at`, `updated_at`)
    SELECT * FROM
    (
        SELECT 
            IFNULL(GL.`uuid`, UUID()),
            FY_PERIOD,
            JE.`Account`,
            JE.`RC Code`,
            IFNULL(`Starting Balance`, 0),
            SUM(IFNULL(JE.`Credit`, 0)) `Credit`,
            SUM(IFNULL(JE.`Debit`, 0)) `Debit`,
            -- Calculate RUNNING BALANCE
            IFNULL((
                SELECT (CASE 
                    -- Account Number 3991, Liabilities, Equity, Income
                    WHEN AC.`Acct Num` = 3991
                    OR AC.`Category` = ACCOUNT_Liabilities 
                    OR AC.`Category` = ACCOUNT_Equity
                    OR AC.`Category` = ACCOUNT_Income
                        -- startingBalance - totalDebit + totalCredit;
                    THEN IFNULL(GL.`Starting Balance`, 0) - SUM(IFNULL(JE.`Debit`, 0)) + SUM(IFNULL(JE.`Credit`, 0))

                    -- Assets, Expenses
                    WHEN AC.`Category` = ACCOUNT_Assets
                    OR AC.`Category` = ACCOUNT_Expenses
                        -- startingBalance + totalDebit - totalCredit
                    THEN IFNULL(GL.`Starting Balance`, 0) + SUM(IFNULL(JE.`Debit`, 0)) - SUM(IFNULL(JE.`Credit`, 0))
                    END)
                FROM `AB_AccountingApp_Account` AC
                WHERE AC.`Acct Num` = JE.`Account`
                LIMIT 1
            ), 0) `Running Balance`,
            NOW() `created_at`,
            NOW() `updated_at`
        FROM
            `AB_AccountingApp_JournalEntry` JE
                LEFT JOIN
            `AB_AccountingApp_GLSegment` GL
                ON JE.`Account` = GL.`COA Num`
                AND JE.`RC Code` = GL.`RC Code`
                AND GL.`COA Num` != 3991
                AND GL.`FY Period` = FY_PERIOD
        WHERE
            JE.`Batch Index` = BATCH_INDEX
            AND JE.`Account` IS NOT NULL
            AND JE.`RC Code` IS NOT NULL
        GROUP BY JE.`Account` , JE.`RC Code`
    ) r
    ON DUPLICATE KEY UPDATE
    `Credit` = r.`Credit`,
    `Debit`= r.`Debit`,
    `Running Balance` = r.`Running Balance`,
    `updated_at` = NOW();

    -- UPDATE GLSegment (Account 3991)
    INSERT INTO `AB_AccountingApp_GLSegment`
        (`uuid`, `FY Period`, `COA Num`, `RC Code`, 
        `Starting Balance`, `Credit`, `Debit`, `Running Balance`,
        `created_at`, `updated_at`)
    SELECT * FROM
    (
        SELECT 
            IFNULL(GL3991.`uuid`, UUID()),
            FY_PERIOD,
            3991,
            GL.`RC Code`,
            IFNULL(GL3991.`Starting Balance`, 0),
            SUM(IFNULL(GL.`Credit`, 0)) `Credit`,
            SUM(IFNULL(GL.`Debit`, 0)) `Debit`,
            IFNULL(GL3991.`Starting Balance`, 0) - SUM(IFNULL(GL.`Debit`, 0)) + SUM(IFNULL(GL.`Credit`, 0)) `Running Balance`,
            NOW() `created_at`,
            NOW() `updated_at`
        FROM
            `AB_AccountingApp_GLSegment` GL
                LEFT JOIN
            `AB_AccountingApp_GLSegment` GL3991
                ON GL3991.`COA Num` = 3991
                AND GL.`RC Code` = GL3991.`RC Code`
                AND GL.`FY Period` = GL3991.`FY Period`
        WHERE
            GL.`FY Period` = FY_PERIOD
            AND (
                GL.`COA Num` LIKE '4%' OR
                GL.`COA Num` LIKE '5%' OR
                GL.`COA Num` LIKE '6%' OR
                GL.`COA Num` LIKE '7%' OR
                GL.`COA Num` LIKE '8%' OR
                GL.`COA Num` LIKE '9%'
            )
        GROUP BY GL.`FY Period`, GL.`RC Code`
    ) r
    ON DUPLICATE KEY UPDATE
    `Credit` = r.`Credit`,
    `Debit`= r.`Debit`,
    `Running Balance` = r.`Running Balance`,
    `updated_at` = NOW();

END$$
DELIMITER ;
