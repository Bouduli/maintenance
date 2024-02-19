DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);
INSERT INTO users(name, email) VALUES
('Oliver', 'oliver@oliver.se'),
('erik', 'erik@erikurry.se')

/* DELIMITER $$

CREATE TRIGGER check_email_format
BEFORE INSERT ON Users 
FOR EACH ROW
BEGIN
    IF NEW.email NOT REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
END 
$$

DELIMITER ; */
