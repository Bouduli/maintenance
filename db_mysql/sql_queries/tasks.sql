DROP TABLE IF EXISTS Tasks;
CREATE TABLE Tasks (
    taskID INT AUTO_INCREMENT PRIMARY KEY,
    houseID INT NOT NULL,
    completed BOOLEAN DEFAULT false,
    description varchar(255) NOT NULL,
    -- due_date DATE NOT NULL,
    FOREIGN KEY (houseID) REFERENCES Houses(houseID)
);

-- INSERT INTO TASKS (houseID, description) VALUES 
--     (1, 'Re-Paint my facade quickly'),
--     (1, 'Fix the pavement that has a large pot-hole')