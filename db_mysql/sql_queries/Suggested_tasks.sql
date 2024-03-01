DROP TABLE IF EXISTS Suggested_tasks;
CREATE TABLE Suggested_tasks (
    suggestionID INT AUTO_INCREMENT PRIMARY KEY,
    houseID INT NOT NULL,
    contractorID INT NOT NULL,
    severity TINYINT NOT NULL,
    description varchar(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- due_date DATE NOT NULL,
    FOREIGN KEY (houseID) REFERENCES Houses(houseID),
    FOREIGN KEY (contractorID) REFERENCES contractors(contractorID)
    
);