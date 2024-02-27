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
        const sql = "SELECT * FROM tasks where taskID = (SELECT taskID FROM task_contractors WHERE email = ?)"
        const data = await db.query(sql, [email]);
        if(!data.length) return res.status(404).json({
            error:"no tasks", message: "Phew, seems your work is done..."
        });

        return res.status(200).json({
            content:{
                ids: data
            }
        });

    } catch (err) {
        console.log("err @ GET /worker/task  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
})

module.exports  = router;
