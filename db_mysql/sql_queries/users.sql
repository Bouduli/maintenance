DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR (20) NOT NULL,
    admin BOOLEAN DEFAULT 0,
    active_account BOOLEAN DEFAULT 1,
    hash CHAR(60) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- INSERT INTO users(name, email, hash) VALUES
-- ('Oliver', 'oliver@oliver.se', '$2b$12$obZmNDgR09ZmHsoHCBjqretUo4yNAySET7Ugd04GbzOLjFt.0iqyS'),
-- ('erik', 'erik@erikurry.se', '$2b$12$yWbp7WmGGhSBaSzVrSB.YeGBJwh2pX88nDhZfIJ/AFT66uB79cQoe');

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
