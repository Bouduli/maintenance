DROP TABLE IF EXISTS Tasks;
CREATE TABLE Tasks (
    taskID INT AUTO_INCREMENT PRIMARY KEY,
    houseID INT NOT NULL,
    userID INT NOT NULL,
    completed BOOLEAN DEFAULT false,
    description varchar(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- due_date DATE NOT NULL,
    FOREIGN KEY (houseID) REFERENCES Houses(houseID),
    FOREIGN KEY (userID) REFERENCES Users(userID)
    
);

DROP TRIGGER IF EXISTS before_delete_Task;
DELIMITER //
CREATE TRIGGER before_delete_Task
BEFORE DELETE ON Tasks
FOR EACH ROW
BEGIN
    DELETE FROM Task_contractors WHERE taskID = OLD.taskID;
END;
//
DELIMITER ;

-- INSERT INTO TASKS (houseID, description) VALUES 
--     (1, 'Re-Paint my facade quickly'),
--     (1, 'Fix the pavement that has a large pot-hole')