DROP TABLE IF EXISTS Tasks;
CREATE TABLE Tasks (
    taskID INT AUTO_INCREMENT PRIMARY KEY,
    houseID INT,
    description varchar(255) NOT NULL,
    -- due_date DATE NOT NULL,
    FOREIGN KEY (houseID) REFERENCES House(houseID)
);