//module.exports = router;
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");

//listing tasks for a contractor
router.get("/task", async(req,res)=>{

    try {
        //token is verified, mostly to retreive email address.
        const token = await jwt.verify(req.cookies["auth-token"], process.env.PWL_LONG_TERM_SECRET);
        const email = token.email;
        console.log(email);

        //appointed tasks are queried using (double-queries)
        const sql = "SELECT * FROM tasks where taskID = (SELECT taskID FROM task_contractors WHERE email = ?)";
        const data = await db.query(sql, [email]);
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

        if(!id) return res.status(400).json({
            error:"no taskID provided"
        });
        
        //Make sure that the contractor is appointed for the task
        const find_sql = "SELECT * FROM tasks WHERE taskID = (SELECT taskID FROM task_contractors WHERE taskID = ?)";
        const find_data = await db.query(find_sql, [id]);

        if(!find_data.length) return res.status(404).json({
            error:"no task found with the provided id", id:id 
        });

        //should be the only received task
        const task = find_data[0];

        //update only allows a contractor to set completed, true or false.
        const {completed} = req.body || false;
        const sql_completed = completed? 1 : 0;

        const update_sql = "UPDATE tasks SET completed=? where taskID = ?";
        const update_data = await db.query(update_sql, [sql_completed, id]);

        task.completed = completed; 
        console.log(update_data);

        return res.status(200).json({content:task});
        
    } catch (err) {
        console.log("err @ PUT worker/task/:id  : ", err);
        return res.status(500).json("internal server error");

    }
})
module.exports  = router;
