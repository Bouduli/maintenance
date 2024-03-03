//module.exports = router;
const router = require("express").Router();
const db = require("../db");

//show users
router.get("/user", async(req,res)=>{
    try {
        
        const sql = "SELECT userID, email, name FROM Users";
        const data = await db.query(sql);

        if(!data.length) return res.status(404).json({
            error:"no users found"
        });

        return res.status(200).json({
            content:{
                users:data
            }
        });

    } catch (err) {
        console.log("err @ GET /admin/user  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
});




module.exports = router;
