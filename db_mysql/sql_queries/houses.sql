DROP TABLE IF EXISTS Houses;
CREATE TABLE Houses (
    houseID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT 1
    FOREIGN KEY (userID) REFERENCES Users(userID)
);
-- INSERT INTO Houses (userID, address, name, description) 
-- VALUES 
--     (1, 'Smedjegatan 4', 'Gamlegården', 'Detta ör mitt hur yoo' ),
--     (1, 'Silvergatan 12', 'Isacs hus', NULL);
