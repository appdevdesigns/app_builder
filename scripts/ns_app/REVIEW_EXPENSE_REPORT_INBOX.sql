DROP PROCEDURE IF EXISTS `REVIEW_EXPENSE_REPORT_INBOX`;

DELIMITER $$
CREATE PROCEDURE `REVIEW_EXPENSE_REPORT_INBOX` (
    IN EXPENSE_REPORT_ID varchar(255)
)
BEGIN
    DECLARE STATUS_QX_APPROVE_VALUE varchar(255) DEFAULT "1612340065524"; -- QX Approved
    DECLARE USER_FORM_TASK_ID varchar(255) DEFAULT "Task_06ytbzw"; -- Task ID

    DECLARE PROCESS_ID varchar(255);
    DECLARE PROCESS_CONTEXT longtext;
    DECLARE PROCESS_CONTEXT_INPUT longtext;
    DECLARE PROCESS_CONTEXT_STATE longtext;
    DECLARE USER_FORM_CONTEXT longtext;
    DECLARE USER_FORM_ID varchar(255);
    DECLARE RUN_EXPENSE_REPORT_ID varchar(255);
    DECLARE IS_EXISTS BOOLEAN DEFAULT FALSE;

    -- Find context from Process loggings
    DECLARE done INT DEFAULT FALSE;
    DECLARE ALL_PROCESS_CONTEXTS CURSOR FOR 
        SELECT `context`
        FROM `site`.`appbuilder_processes`
        WHERE
            `processID` = PROCESS_ID
                AND (`status` = "created" OR `status` = "completed")
                AND (
                    CASE 
                    WHEN EXPENSE_REPORT_ID IS NOT NULL 
                    THEN `context` LIKE CONCAT('%', EXPENSE_REPORT_ID, '%')
                    ELSE 1 = 1 END
                )
        ORDER BY `createdAt` DESC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Pull ID of Expense Report Approval process
    SET PROCESS_ID := (SELECT `id`
                        FROM `site`.`appbuilder_definition`
                        WHERE `type` = "process"
                        AND `name` = "Expense Report Approval"
                        LIMIT 1);

    OPEN ALL_PROCESS_CONTEXTS;
    read_loop: LOOP
        FETCH ALL_PROCESS_CONTEXTS INTO PROCESS_CONTEXT;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET PROCESS_CONTEXT_INPUT := JSON_EXTRACT(PROCESS_CONTEXT, '$.input');
        SET PROCESS_CONTEXT_STATE := JSON_EXTRACT(PROCESS_CONTEXT, '$.taskState');

        -- Extract ID of Expense Report row
        SET RUN_EXPENSE_REPORT_ID := JSON_UNQUOTE(JSON_EXTRACT(PROCESS_CONTEXT_INPUT, '$.uuid'));

        -- Recheck ID of Expense Report row again
        IF EXPENSE_REPORT_ID IS NULL 
        OR EXPENSE_REPORT_ID = RUN_EXPENSE_REPORT_ID
        THEN
            SET IS_EXISTS := (SELECT COUNT(`uuid`)
                            FROM `appbuilder`.`AB_DonationTracking_ExpenseReport`
                            WHERE `uuid` = RUN_EXPENSE_REPORT_ID
                            AND `Status` != STATUS_QX_APPROVE_VALUE) > 0;

            IF IS_EXISTS = TRUE
            THEN
                -- Pull ID of user form
                -- $.Task_06ytbzw.userFormID
                SET USER_FORM_CONTEXT := JSON_EXTRACT(PROCESS_CONTEXT_STATE, CONCAT('$.', USER_FORM_TASK_ID));
                SET USER_FORM_ID := JSON_UNQUOTE(JSON_EXTRACT(USER_FORM_CONTEXT, '$.userFormID'));

                IF USER_FORM_ID IS NOT NULL 
                AND USER_FORM_ID != "null"
                THEN
                    -- Remove the process INBOX
                    DELETE FROM `site`.`process_userform`
                    WHERE `uuid` = USER_FORM_ID;
                END IF;
            END IF;


        END IF;

    END LOOP;
    CLOSE ALL_PROCESS_CONTEXTS;

END$$
DELIMITER ;
