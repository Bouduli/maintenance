DROP TABLE IF EXISTS Task_Contractors;
CREATE TABLE Task_Contractors (
    taskID INT,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (taskID, email),
    FOREIGN KEY (taskID) REFERENCES Tasks(taskID),
    FOREIGN KEY (email) REFERENCES Contractors(email)
);