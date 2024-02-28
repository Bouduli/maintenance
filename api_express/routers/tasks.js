//module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../db");

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
        
        const {houseID, description, userID} = req.body;

        if(!houseID || !description) return res.status(400).json({
            error:"Either houseID or description was not provided",
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



module.exports = router;