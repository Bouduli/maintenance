//module.exports=router
const router = require("express").Router();

const db = require("../db");


//index
router.get("/", async(req,res)=>{

    try {
        const data = await db.query("SELECT * FROM contractors");
        
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
        const data = await db.query(sql, [id]);
    
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

//create
router.post("/", async(req,res)=>{

    try {
        
        const {name, occupation, email, phone} = req.body;
        
        if(!name || !occupation, !email, !phone) return res.status(400).json({
            error:"One or more parameters not provided",
            name: name || null,
            occupation : occupation || null,
            email : email || null,
            phone : phone  || null
        });

        const sql = "INSERT INTO contractors (name, occupation, email, phone) VALUES (?,?,?,?)";
        const data = await db.query(sql, [name, occupation, email, phone]);

        if (!data.insertId) return res.status(400).json({
            //shouldnt't be malformed tho
            error:"insertion was unsucessful due to a malformed request",
            name: name || null,
            occupation : occupation || null,
            email : email || null,
            phone : phone  || null
        });

        return res.status(201).json({ content: {id: data.insertId} })

    } catch (err) {
        console.log("err @ POST contractors/  : ", err);

        return res.status(500).json({error:"internal server error"});
    }
})

//destroy
router.delete("/:id", async(req,res)=>{

    try {
        const {id} = req.params;
    
        if(!id) return res.status(400).json({
            error:"id not provided for delete"
        });
    
        const data = await db.query("DELETE FROM contractors WHERE contractorID = ?", [id]);
    
        if(!data.affectedRows) return res.status(404).json({
            error:"resource with specified id could not be found",
            id
        });
    
        return res.status(200).json({
            data: data
        });
    
    } catch (err) {
        console.log("err @ DELETE/contractors/:id  : ", err);
        
        return res.status(500).json({
            error:"internal server error"
        });
    }


});
module.exports=router;