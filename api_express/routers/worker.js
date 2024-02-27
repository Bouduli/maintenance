//module.exports = router;
const router = require("express").Router();

const db = require("../db");

//listing tasks for a contractor
router.get("/task", async(req,res)=>{

    try {
        //Auth token is validated in middleware, therefore this token should exist, with an email field.
        const auth_token = req.cookies["auth-token"];
        const email = auth_token.email;

        const data = await db.query("SELECT taskID FROM task_contractors WHERE email = ?", [email]);
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
