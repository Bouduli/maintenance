const router = require("express").Router();

const db = require("../db");


//index
router.get("/", async(req,res)=>{

    try {
        const data = db.query("SELECT * FROM contractors");
        
        if(!data.length) return res.status(404).json({
            error: "not found"
        })
        return res.status(200).json({
            content: {
                data : data
            }
        });
        
    } catch (err) {
        
        console.log("err @ GET/CONTRACTORS/ :", err);

        return res.status(500).json({
            error:"internal server error"
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
    
        const sql = "SELECT * FROM contractors WHERE contractorID = ?";
        const data = db.query(sql, [id]);
    
        if(!data.length) return res.status(404).json({
            error:"resource not found with requested id",
            id: id
        });
    
        return res.status(200).json({
            content:{
                data: data
            }
        });
    } catch (err) {
        console.log("err @ GET/contractors/:id  : ", err);

        return res.status(500).json({
            error: "internal server error"
        });

    }


})