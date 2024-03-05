DROP TABLE IF EXISTS Task_Contractors;
CREATE TABLE Task_Contractors (
    taskID INT,
    contractorID INT,
    PRIMARY KEY (taskID, contractorID),
    FOREIGN KEY (taskID) REFERENCES Tasks(taskID),
    FOREIGN KEY (contractorID) REFERENCES Contractors(contractorID)
);

DROP PROCEDURE IF EXISTS GetTasksByEmail;
DELIMITER //

CREATE PROCEDURE GetTasksByEmail (IN userEmail VARCHAR(255))
BEGIN
    SELECT * 
    FROM tasks 
    WHERE taskID = (
        SELECT taskID 
        FROM task_contractors 
        WHERE email = userEmail
    );
END//

DELIMITER ;
