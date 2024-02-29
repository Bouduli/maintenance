//module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../db");
const email_client = require("../email");

//index
router.get("/", async ( req,res)=>{
    try {
    
        const data = await db.query("SELECT * FROM tasks");
        if(!data.length) return res.status(404).json({
            error:"no tasks found"
        });
        
        return res.status(200).json({
            content: data
        });

    } catch (err) {
        console.log("Err @ GET/tasks :", err);
        return res.status(500).json({
            error: "operation failed"
        });
    }
})

//show
router.get("/:id", async (req,res)=>{
    try {
        const {id} = req.params;

        //empty id should not be the case, if the endpoint is reached
        if(!id) return res.status(400).json({
            error:"no id provided"
        });

        const data = await db.query("SELECT * FROM tasks WHERE taskID = ?", [id]);

        if(!data.length) return res.status(404).json({
            error: "no task found with the provided id",
            id
        })

        return res.status(200).json({
            content: data
        });

    } catch (err) {
        console.log("Err @ GET/tasks/:id :", err);
        
        return res.status(500).json(err);
    }
});

//create 
router.post("/", async (req,res)=>{
    try {
        const userID = req.user.token.id;
        const {houseID, description} = req.body;

        if(!houseID || !description ||!userID) return res.status(400).json({
            error:"Either houseID, userID, or description was not provided",
            //if it is undefined, then it is written out as null in the response object. claritys sake
            houseId: houseID || null,
            userID: userID || null,
            description: description|| null
        });
        const sql = "INSERT INTO tasks (houseID, userID, description) VALUES (?,?,?)";
        const data = await db.query(sql, [houseID, userID, description]);

        return res.status(201).json({content:{id: data.insertId} });

    } catch (err) {
        console.log("Err @ POST/tasks : ", err);
        return res.status(500).json({
            error: "operation failed"
        })
    }

})

//destroy
router.delete("/:id", async(req,res)=>{
    try {
        
        const {id} = req.params;

        const sql = "DELETE FROM tasks WHERE taskID = ?";
        const data = await db.query(sql, [id]);

        if(!data.affectedRows) return res.status(404).json({
            error:"not found",
            id
        });

        return res.status(200).json({
            content: {
                message: "successfully deleted task",
                id: id
            }
        });
    } catch (err) {
        console.log("Err @ DELETE/tasks/:id  : ", err);
        return res.status(500).json({

            error : "operation failed"
        });
    }
})

//update
router.put("/:id", async (req,res)=>{

    try {
        const {id} = req.params;
        const {houseID, completed, description} = req.body;

        if(!id) return res.status(400).json({
            error: "no id provided for delete"
        });
        //retreive existing entry (also used to check that the ID exists)
        const find_sql = "SELECT * FROM tasks WHERE taskID = ?";
        const found = await db.query(find_sql, [id]);

        if(!found.length) return res.status(404).json({
            error: "item not found with specified id",
            id
        });

        //found is always an array, but should only hold one value.
        const old = found[0];
        const updated = {
            taskID: old.taskID,
            houseID : houseID || old.houseID,
            completed : completed || old.completed,
            description : description || old.description
        }

        const updated_sql = "UPDATE tasks SET houseID = ? , completed = ?, description = ? WHERE taskID = ?"
        const data = await db.query(updated_sql, [ updated.houseID, updated.completed, updated.description, updated.taskID]);
        
        if(!data.changedRows) return res.status(304).json({
            error:"nothing changed",
            id
        });
        
        return res.status(200).json({
            content: {
                id: id
            }
        });

    } catch (err) {
        console.log("Err @DELETE/:id  : ", err);
        return res.status(500).json({
            error: "something went wrong"
        })
    }
})

router.post("/invite", async(req,res)=>{
    try {
        
        const {id, name} = req.user.token;
        const {email, taskID} = req.body;

        if(!email || !id) return res.status(400).json({
            error:"email of contractor, or taskID not provided",
            email:email || null,
            taskID: taskID || null
        });

        //make sure the contractor exists in the contractors table.
        const find_contractor = "SELECT email FROM contractors WHERE email = ?";
        const contractor_data = await db.query(find_contractor, [email]);
        if(!contractor_data.length) return res.status(404).json({
            error:"Contractor with the provided email was not found"
        });

        //make sure that the task exists
        const find_task = "SELECT taskID FROM tasks WHERE taskID = ?";
        const task_data = await db.query(find_task, [taskID]);
        if(!task_data.length) return res.status(403).json({
            error:"task not found with the provided id",
            id: taskID
        });

        const task = task_data[0];
        //make sure that the user is allowed to add contractor to the task
        
        if(task.taskID != taskID) return res.status(403).json({
            error:"you are not allowed to invite contractor to this task"
        });

        const insert_sql = "INSERT INTO task_contractors VALUES (?,?)";
        const insert_data = await db.query(insert_sql, [taskID, email])

        const email_data = await email_client.sendHtmlMail(email, {
            Header:"You have been appointed with another task", //--------------------------------------------------------> Do something with this link <----------
            Body:`<p>You have been invited to another task.!\rLogin today at: </p> <a href='http://localhost:12345'> Maintenance.com </a>`,
            Footer :"If you beleive this was a mistake, I suggest you disregard this email"
        });
        console.log(email_data)

        return res.status(200).json({
            content:{
                invited: email,
                task: taskID
            }
        })

        
    } catch (err) {
        console.log("err @ POST /task/invite ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
})


module.exports = router;