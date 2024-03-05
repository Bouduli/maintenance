DROP TABLE IF EXISTS Contractors;
CREATE TABLE Contractors (
    contractorID INT AUTO_INCREMENT,
    invited_by INT,
    name VARCHAR(255) NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    active_account BOOLEAN DEFAULT 1,
    invited_by int(11) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (contractorID, invited_by),
    FOREIGN KEY (invited_by) REFERENCES Users(userID)
    
);
-- INSERT INTO Contractors (name, occupation, email, phone) VALUES
-- ('Linus Korvalds', 'Linux', 'linus@torvalds.fi', "070-521 69 69"),
-- ('Adam Dahlgren', 'Plumber', 'adaahl0431@edu.halmstad.se', "071-241 69 69")

/* DELIMITER $$

CREATE TRIGGER check_email_format
BEFORE INSERT ON Contractors, 
FOR EACH ROW
BEGIN
    IF NEW.email NOT REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
END$$

DELIMITER ;
 */