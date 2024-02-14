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
        
        const {houseID, description} = req.body;

        if(!houseID || !description) return res.status(400).json({
            error:"Either houseID or description was not provided",
            //if it is undefined, then it is written out as null in the response object. claritys sake
            id: houseID || null,
            description: description|| null
        });
        const sql = "INSERT INTO tasks (houseID, description) VALUES (?,?)";
        const data = await db.query(sql, [houseID, description]);

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




module.exports = router;