//module.exports=router
const router = require("express").Router();

const db = require("../db");
const email_client = require("../email");

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

        //regex to validate if the provided email is a valid email. Source: https://emailregex.com/index.html
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!emailRegex.exec(email)) return res.status(400).json({
            error:"bad email was provided",
            email: email
        });

        //prevent the same contractor to be invited again.
        const find_sql = "SELECT email FROM CONTRACTORS where email = ?";
        const find_data = await db.query(find_sql, [email]);
        if(find_data.length) return res.status(409).json({
            error:"A contractor with that email already exists"
        });

        const sql = "INSERT INTO contractors (name, occupation, email, phone) VALUES (?,?,?,?)";
        const data = await db.query(sql, [name, occupation, email, phone]);

        if (!data.insertId) return res.status(400).json({
            //shouldnt't be malformed tho
            error:"invite of contractor was unsucessful due to a malformed request",
            name: name || null,
            occupation : occupation || null,
            email : email || null,
            phone : phone  || null
        });

        //invite of a contractor is successful, therefore an email is sent.
        const email_data = await email_client.sendHtmlMail(email, {
            Header:"Welcome to the maintenance system!", //--------------------------------------------------------> Do something with this link <----------
            Body:"<p>You have been invited to the maintenance system as a contractor by a user!\rLogin today at: </p> <a href='http://localhost:12345'> Maintenance.com </a>",
            Footer :"If you beleive this was a mistake, I suggest you disregard this email"
        });
        // console.log("email data: ", email_data);
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
    
        const data = await db.query("UPDATE contractors SET name ='***', email = '***', occupation='***', phone = '***', active_account=0 WHERE contractorID = ?", [id]);
    
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

//update
router.put("/:id", async(req,res)=>{
    try {
        const {id} = req.params;
        const {name, occupation, email, phone} = req.body;
    
        if(!id) return res.status(400).json({
            error: "No id provided for update"
        });
    
        //find old resource, to make sure that an update can take place.
        const find_sql = "SELECT * FROM contractors WHERE contractorID = ?";
        const found = await db.query(find_sql, [id]); 
        if (!found.length) return res.status(404).json({
            error: "A resource with the specified id could not be found",
            id
        });

        //contractor should be unique, therefore first index,
        const old = found[0];

        const updated = {
            contractorID : old.contractorID,
            name : name || old.name,
            occupation : occupation || old.occupation,
            email : email || old.email,
            phone : phone || old.phone
        }

        const update_sql = "UPDATE contractors SET name=?, occupation=?, email=?, phone=? WHERE contractorID = ?"
        const data = await db.query(update_sql, [updated.name, updated.occupation, updated.email, updated.phone, id]);
        
        if(!data.changedRows) return res.status(304).json({
            error: "nothing changed",
            id
        });

        return res.status(200).json({
            content: {
                id: id
            }
        });

    } catch (err) {
        console.log("err @ PUT/contractors/:id  : ", err);

        return res.status(500).json({
            error:"internal server error"
        })
    }
})
module.exports=router;