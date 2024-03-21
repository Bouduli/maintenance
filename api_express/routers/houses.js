const express = require("express");

const router = express.Router();

const db = require("../db");

//index
router.get("/", async (req,res)=>{
    try {
        //only show houses that a specific user has created.

        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })

        const data = await db.query("SELECT * FROM HOUSES WHERE userID = ? and active=?", [userID, 1]);

        if(!data.length) return res.status(404).json({
            error:"not found"
        })
        
        return res.status(200).json({
            content: data
        });
        
    } catch (err) {
        console.log("Error @ GET/houses - ", err);
        return res.status(500).json({
            error: "The operation failed"
        });
    }
});

//show
router.get("/:id", async(req,res)=>{
    try {
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })

        const {id} = req.params;
        if(!id) return res.send(400).json({
            error:"houseID not provided"
        });



        const data = await db.query("SELECT * FROM Houses WHERE houseID = ? and userID = ? and active=?", [id, userID, 1]);

        if(!data.length) return res.status(404).json({error: "House not found with the id provided", id});

        return res.status(200).json({
            content:data
        });


    } catch (err) {

        console.log("Error @ GET/houses/:id - ",err);
        return res.status(500).json({
            error: "the operation failed unexpectedly."
        });
    }
});


//create 
router.post("/", async(req,res)=>{
    try {
        const userID = req.user.token.id;
        const {address, description, name} = req.body;

        if(!address || !userID) return res.status(400).json({
            error:"userID and address must be provided",
            userID : userID || null,
            address : address || null,
        });

        const sql = "INSERT INTO Houses (userID, address, description, name) VALUES (?,?,?,?)";
        const data = await db.query(sql, [userID, address, description||null, name||null]); 

        return res.status(201).json({content: {id: data.insertId}});
    } catch (err) {
        console.log(err);

        return res.status(500).json({error: "operation failed"});
    }
})



//destroy
router.delete("/:id", async (req,res)=>{

try {
    //only delete houses which the user has access to.
    const userID = req.user.token.id;
    if(!userID) return res.status(401).json({
        message:"useriD not provided, please re-authenticate"
    })

    //HouseID
    const {id} = req.params;
    if(!id) return res.status(400).json({
        error: "no id provided for delete"
    });

    const sql = "UPDATE Houses SET address='***', name='***', description='***', active=0 WHERE houseID = ? AND userID =? AND active=?";
    const data = await db.query(sql, [id, userID, 1]);

    if (!data.affectedRows) return res.status(404).json({
        error:"resource with specified id could not be found",
        id
    });

    return res.status(200).json({content: data});

} catch (err) {
    console.log("Error @ DELETE/houses/q/:id - ", err);
    return res.status(500).json({
        error:"operation failed unexpectedly"
    });
}

})

//update
router.put("/:id", async (req,res)=>{
    try {
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })


        const {id} = req.params;
        const {address, name, description} = req.body;

        if(!id) return res.status(400).json({
            error: "No id provided for update"
        });

        const find_sql = "SELECT * FROM Houses WHERE houseID = ? and userID = ? and active=?";
        const found = await db.query(find_sql, [id, userID, 1]); 
        //Then we for sure have something to update. 
        if (!found.length) return res.status(404).json({
            error: "A resource with the specified id could not be found",
            id
        });

        //since id's are unique, found[0] should be the only provided resource, therefore the old house.
        const old = found[0];
        //a house with updated info (where applicable) is created
        const updated= {
            houseID : old.houseID,
            userID : userID || old.userID,
            address : address || old.address,
            name: name || old.name,
            description: description || old.description,
        };

        const update_sql = "UPDATE houses SET userID = ?, address = ?, name = ?, description = ? WHERE houseID = ? AND userID = ? AND active=?";
        const data = await db.query(update_sql, [updated.userID, updated.address, updated.name, updated.description, updated.houseID, userID, 1]);

        return res.status(200).json({content: {id: id} });

    } catch (err) {
        console.log("Error @ PUT/houses/:id - ", err);

        return res.status(500).json({error: "operation failed"});
    }
})

module.exports = router;