//module.exports = router;
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const { restart } = require("nodemon");

//Returns all houses where the contractor have been assigned tasks, which contains an array of every task.
router.get("/data", async(req,res)=>{

    try {
        //contractorID is retreived to regulate which tasks are shown.
        const {token} = req.user;
        const contractorID = token.id;

        //appointed tasks are queried using nestled queries.
        const task_sql = "SELECT * FROM tasks where taskID IN (SELECT taskID FROM task_contractors WHERE contractorID= ?)";
        const tasks = await db.query(task_sql, [contractorID]);
        if(!tasks.length) return res.status(404).json({
            error:"no tasks", message: "Phew, seems your work is done..."
        });

        //Houses for all appointed tasks are reteived. (this is a fucked up query i know. but it works).
        const house_sql = "SELECT * FROM houses where houseID IN (SELECT houseID FROM tasks WHERE taskID IN (SELECT taskID FROM task_contractors WHERE contractorID =?))";
        const houses = await db.query(house_sql, [contractorID]);

        if(!houses.length) {
            //this should never be the case, but IF it occurs, i want to know it happened. 
            console.error(`Fel: en användare ${contractorID} är tilldelad ett antal tasks, men det går inte att hus från tasksen.`);
            return res.status(409).json({
                error:"no houses found", message:"you have been appointed a task, which doesn't exist in the database..."
            });
    
        }
        //a "task" field is added to all houses.
        houses.forEach(h=>h.tasks=[]);
        
        // "task" field is populated with entries from tasks array. empty if no tasks exists (shouldn't happen tho.)
        houses.forEach(h=>{
            h.tasks.push(...tasks.filter(t=>t.houseID == h.houseID));
        })

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
//fetching a specific task from the db
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
        const sql = "SELECT * FROM tasks where taskID IN (SELECT taskID FROM task_contractors WHERE contractorID= ? AND taskID = ?)";
        const data = await db.query(sql, [contractorID, taskID]);
        if(!data.length) return res.status(404).json({
            error:"no tasks", message: "Phew, seems your work is done..."
        });

        return res.status(200).json({
            content:data[0]
            
        });

    } catch (err) {
        console.log("err @ GET /worker/task  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
});

//marking task as complete. 
router.put("/task/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const userID = req.user.token.id;

        if(!id) return res.status(400).json({
            error:"no taskID provided"
        });
        
        //Make sure that the task exists in task_contractor table.
        const find_sql = "SELECT taskID, contractorID FROM task_contractors WHERE taskID = ?";
        const find_data = await db.query(find_sql, [id]);

        if(!find_data.length) return res.status(404).json({
            error:"no task found with the provided id", id:id 
        });

        //should be the only received task
        const {taskID, contractorID} = find_data[0];

        //make sure that contractorID from token is consistent with that of task_contractor entry
        if(contractorID != userID) return res.status(403).json({
            error:"you are not allowed to edit this task"
        });


        //update only allows a contractor to set completed, true or false.
        const {completed} = req.body || false;
        const sql_completed = completed? 1 : 0;

        const update_sql = "UPDATE tasks SET completed=? where taskID = ?";
        const update_data = await db.query(update_sql, [sql_completed, taskID]);

        // console.log(update_data);

        return res.status(200).json({content:{completed: completed}});
        
    } catch (err) {
        console.log("err @ PUT worker/task/:id  : ", err);
        return res.status(500).json("internal server error");

    }
});

// Suggesting a task that should be performed.
router.post("/task", async (req,res)=>{
    try {
        const contractorID = req.user.token.id;
        //houseID should be present for the client, so that when the request is fired, this is retrieved there. 
        const {description, houseID} = req.body;

        if(!contractorID || !description || !houseID) return res.status(400).json({
            error:"either description or houseID was not provided",
            description : description || null,
            houseID : houseID || null
        });

        const insert_sql = "INSERT INTO Suggested_Tasks (houseID, description, contractorID) VALUES (?,?,?)";
        const insert_data = await db.query(insert_sql, [houseID, description, contractorID]);

        console.log(insert_data);
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
module.exports  = router;
