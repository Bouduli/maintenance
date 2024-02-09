DROP TABLE IF EXISTS Task_Contractors;
CREATE TABLE Task_Contractors (
    taskID INT,
    contractorID INT,
    PRIMARY KEY (taskID, contractorID),
    FOREIGN KEY (taskID) REFERENCES Tasks(taskID),
    FOREIGN KEY (contractorID) REFERENCES Contractors(contractorID)
);