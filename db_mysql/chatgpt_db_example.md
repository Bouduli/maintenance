#ChatGPT MySQL database example
Conversation is available in its entirety [here](https://chat.openai.com/share/e1dc6faa-3b37-4dd0-b803-08a1bbe74a38)

***For inspiration for the database structure, chatgpt was prompted with the following:***


Can you give me examples of how I can make a MySQL database, given that i wan't to acheive the following goals: 

I'm making a maintenance system for houses where a "User/Customer": identified by name, accountID,  can create a "House" , for which they can publish "Tasks / Jobs", that includes an description and due date. For a specific "Task/Job" I want "Users/Customers"  to be able to add "Contractors / Workers" of which are identified by Name, occupation, and an email address. 
<hr>

***ChatGPT answered with:***
Sure, I can help you design a MySQL database for your maintenance system. Below is an example of how you can structure your tables to achieve the goals you described:
1. **Users/Customer Table:**
   - Fields: userID (Primary Key), name, accountID

```sql
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    accountID INT NOT NULL,
    UNIQUE(accountID)
);
```

2. **House Table:**
   - Fields: houseID (Primary Key), userID (Foreign Key referencing Users table), address

```sql
CREATE TABLE House (
    houseID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    address VARCHAR(255) NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID)
);
```

3. **Tasks/Jobs Table:**
   - Fields: taskID (Primary Key), houseID (Foreign Key referencing House table), description, due_date

```sql
CREATE TABLE Tasks (
    taskID INT AUTO_INCREMENT PRIMARY KEY,
    houseID INT,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    FOREIGN KEY (houseID) REFERENCES House(houseID)
);
```

4. **Contractors/Workers Table:**
   - Fields: contractorID (Primary Key), name, occupation, email

```sql
CREATE TABLE Contractors (
    contractorID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);
```

5. **Task_Contractors Table (Many-to-Many Relationship):**
   - Fields: taskID (Foreign Key referencing Tasks table), contractorID (Foreign Key referencing Contractors table)

```sql
CREATE TABLE Task_Contractors (
    taskID INT,
    contractorID INT,
    PRIMARY KEY (taskID, contractorID),
    FOREIGN KEY (taskID) REFERENCES Tasks(taskID),
    FOREIGN KEY (contractorID) REFERENCES Contractors(contractorID)
);
```

This structure allows users/customers to create houses, publish tasks/jobs for their houses, and add contractors/workers to specific tasks/jobs.