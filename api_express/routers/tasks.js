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


module.exports = router;