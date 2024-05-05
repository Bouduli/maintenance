//module.exports = router;
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");

//Returns all houses where the contractor have been assigned tasks
router.get("/house", async(req,res)=>{

    try {
        //contractorID is retreived to regulate which tasks are shown.
        const {token} = req.user;
        const contractorID = token.id;

        //Houses for all appointed tasks are reteived. (this is a fucked up query i know. but it works).
        const house_sql = "SELECT * FROM houses where houseID IN (SELECT houseID FROM tasks WHERE taskID IN (SELECT taskID FROM task_contractors WHERE contractorID =?))";
        const houses = await db.query(house_sql, [contractorID]);

        if(!houses.length) {
            //this should never be the case, but IF it occurs, i want to know it happened. 
            console.error(`Fel: en användare ${contractorID} är tilldelad ett antal tasks, men det går inte att hus från tasksen.`);
            return res.status(409).json({
                error:"no houses found", message:"you have been appointed a task, which house doesn't exist in the database..."
            });
    
        }

        return res.status(200).json({
            content:houses
            
        });

    } catch (err) {
        console.log("err @ GET /worker/task  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
});

//fetching all tasks from the db
router.get("/task", async(req,res)=>{
    //contractorID is retreived to regulate which tasks are shown.
    const {token} = req.user;
    const contractorID = token.id;

    //appointed tasks are queried using nestled queries.
    const task_sql = "SELECT * FROM tasks where taskID IN (SELECT taskID FROM task_contractors WHERE contractorID= ?)";
    const tasks = await db.query(task_sql, [contractorID]);
    if(!tasks.length) return res.status(404).json({
        error:"no tasks", message: "Phew, seems your work is done..."
    });

    return res.status(200).json({
        content:tasks
    });

});
//fetching task details from db
router.get("/task/:id", async(req,res)=>{

    try {
        
        const {token} = req.user;
        const contractorID = token.id;
        const taskID = req.params.id;

        if(!taskID) return res.status(400).json({
            error:"id not provided"
        })

        //appointed task is queried with both contractorID and taskID in the inner query, 
        //to ensure that the contractor is appointed for the requested task.
        const sql = "SELECT * FROM tasks where taskID IN (SELECT taskID FROM task_contractors WHERE contractorID= ? AND taskID = ?) AND houseID IN (SELECT houseID FROM houses WHERE active=?)";
        const data = await db.query(sql, [contractorID, taskID, 1]);
        if(!data.length) return res.status(404).json({
            error:"no tasks", message: "Phew, seems your work is done..."
        });
        
        const houseSQL = "SELECT * FROM Houses WHERE houseID = ?"
        const houseData = await db.query(houseSQL, [data[0].houseID])
        if(!houseData.length) return res.status(404).json({
            error:"no house found for task",
        });

        const task = data[0];
        task.house = houseData[0];

        return res.status(200).json({
            content:task,
        });

    } catch (err) {
        console.log("err @ GET /worker/task/:id  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
});

//marking task as complete. 
router.put("/task/:id", async (req,res)=>{
    try {
        const taskID = req.params.id;
        //NOTE: id retreived from req.user and NOT Users table in the db.
        const contractorID = req.user.token.id;

        if(!taskID) return res.status(400).json({
            error:"no taskID provided"
        });

        if(!contractorID) return res.status(401).json({
            error:"contractorID could not be retreived, please re-authenticate.."
        });
        
        //Query performs two checks: Make sure that the task exists, AND that the contractor is appointed to the task.
        const find_sql = "SELECT * FROM task_contractors WHERE taskID = ? AND contractorID = ?";
        const find_data = await db.query(find_sql, [taskID, contractorID]);

        if(!find_data.length) return res.status(404).json({
            error:"no task found with the provided id", id:taskID
        });

        //update only allows a contractor to set completed, true or false.
        const {completed} = req.body || false;
        const sql_completed = completed? 1 : 0;

        const update_sql = "UPDATE tasks SET completed=? where taskID = ?";
        const update_data = await db.query(update_sql, [sql_completed, taskID]);

        // console.log(update_data);

        return res.status(200).json({content:{completed: completed, id:taskID}});
        
    } catch (err) {
        console.log("err @ PUT worker/task/:id  : ", err);
        return res.status(500).json("internal server error");

    }
});

// Creating a suggestion for a task, allowing a house-owner to "approve" it, which would insert it into the task-table. 
router.post("/task", async (req,res)=>{
    try {
        const contractorID = req.user.token.id;
        //houseID should be present for the client, and therefore will be provided by the client when it sends the request. 
        const {description, houseID} = req.body;

        if(!contractorID || !description || !houseID) return res.status(400).json({
            error:"either description or houseID was not provided",
            description : description || null,
            houseID : houseID || null
        });

        //suggested_tasks have the same structure as Tasks, therefore it is very similar.
        const insert_sql = "INSERT INTO Suggested_Tasks (houseID, description, contractorID) VALUES (?,?,?)";
        const insert_data = await db.query(insert_sql, [houseID, description, contractorID]);
        //if the query doesn't return a insertID, something has went wrong (duplicate keys) and a simple 404 is sent.
        if(!insert_data.insertId) return res.status(400).json({
            error:"unable to create task",
            houseID,
            contractorID
        });        

        return res.status(201).json({
            content:{
                id: insert_data.insertId
            }
        });


    } catch (err) {
        console.log("err @ POST /worker/task  : ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
})

//fetching all the contractor-created suggestions from the db.
router.get("/suggestion", async(req,res)=>{
    try {
        const {token} = req.user;
        const contractorID = token.id;

        const suggestion_sql = "SELECT * FROM suggested_tasks WHERE contractorID = ?";
        const suggestions = await db.query(suggestion_sql, [contractorID]);
        console.log("suggestions: ", suggestions);

        if(!suggestions.length) return res.status(404).json({
            error:"no suggestions", message: "you haven't created any suggestions, or your suggestions have been turned into tasks."
        });
        return res.status(200).json({
            content:suggestions
        });
    } catch (err) {
        console.log("Err @ GET /worker/suggestion  : ", err );
        return res.status(500).json({
            error:"internal server error"
        });
    }

})

//fetching details for a task-suggestion
router.get("/suggestion/:id", async(req,res)=>{
    try {
        const {token} = req.user;
        const contractorID = token.id;
        const suggestionID = req.params.id;

        if(!suggestionID) return res.status(400).json({
            error:"id not provided"
        })

        //the suggestion is retreived by quering against contractorID, provided suggestionID, and if the house is active.
        const sql = "SELECT * FROM suggested_tasks WHERE contractorID = ? AND suggestionID = ? AND houseID in (SELECT houseID FROM houses WHERE active=?) ";
        const data = await db.query(sql, [contractorID, suggestionID, 1]);
        if(!data.length) return res.status(404).json({
            error:"no tasks", message: "Phew, seems your work is done..."
        });
        
        //retreiving the house for which the suggestion applies. 
        const houseSQL = "SELECT * FROM Houses WHERE houseID = ?"
        const houseData = await db.query(houseSQL, [data[0].houseID])
        if(!houseData.length) return res.status(404).json({
            error:"no house found for task",
        });

        const suggestion = data[0];
        suggestion.house = houseData[0];

        //manipulate suggestion to behave like a Task in the application
        suggestion.taskID = suggestion.suggestionID;

        return res.status(200).json({
            content:suggestion,
        });

    } catch (err) {
        console.log("err @ GET /worker/suggestion/:id  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
})
module.exports  = router;
