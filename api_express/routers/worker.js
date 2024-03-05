//module.exports = router;
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const { restart } = require("nodemon");

//listing tasks for a contractor
router.get("/task", async(req,res)=>{

    try {
        //token is verified, mostly to retreive email address.
        const {token} = req.user;
        
        const contractorID = token.id;

        //appointed tasks are queried using (double-queries)
        const sql = "SELECT * FROM tasks where taskID IN (SELECT taskID FROM task_contractors WHERE contractorID= ?)";
        const data = await db.query(sql, [contractorID]);
        if(!data.length) return res.status(404).json({
            error:"no tasks", message: "Phew, seems your work is done..."
        });

        return res.status(200).json({
            content:{
                tasks:data
            }
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

        //make sure that email is consistent with task_contractor entry
        if(contractorID != userID) return res.status(403).json({
            error:"you are not allowed to edit this task"
        });


        //update only allows a contractor to set completed, true or false.
        const {completed} = req.body || false;
        const sql_completed = completed? 1 : 0;

        const update_sql = "UPDATE tasks SET completed=? where taskID = ?";
        const update_data = await db.query(update_sql, [sql_completed, taskID]);

        // console.log(update_data);

        return res.status(200).json({content:{marked_complete: completed}});
        
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
