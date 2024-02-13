const express = require("express");

const router = express.Router();

const db = require("../db");

//index
router.get("/", async (req,res)=>{
    try {
        const data = await db.select("houses");

        res.status(200).json(data);
        
    } catch (err) {
        return res.status(500).json(err);
    }
});

//show
router.get("/:id", async(req,res)=>{
    try {
        const {id} = req.params;
        if(!id) return res.send(400).json({
            error:"houseID not provided"
        });



        const data = await db.select("houses", `WHERE houseID = ${id}`);

        if(!data.length) return res.status(404).json({error: "House not found with the id provided", id});

        return res.status(200).json(data);


    } catch (err) {

        console.log("Error @ GET/:id: ",err);
        return res.status(500).json(err);
    }
});

//create
/* router.post("/", async (req,res)=>{
    try {
        const {address, userID} = req.body;
        if( !address ||  !userID) return res.status(400).json({
            error: "userID or address not provided",
            userID, address
        });

        const sql = await db.inserter("houses", {address, userID});
        console.log("insertersql: ",sql)
    
        const insertedId = await db.insertHouse( {address, userID});
        return res.status(201).json({
            insertedId, 
            house:{
                address,
                userID
            }
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}) */

//create 
router.post("/", async(req,res)=>{
    try {
        const {address, userID, description, name} = req.body;

        if(!address || !userID) return res.status(400).json({
            error:"userID and address must be provided",
            userID : userID || null,
            address : address || null,
        });

        const sql = "INSERT INTO Houses (userID, address, description, name) VALUES (?,?,?)";
        const data = await db.query(sql, [userID, address, description||null, name||null]); 

        return res.status(201).json({id: data.insertedId});
    } catch (err) {
        console.log(err);

        return res.status(500).json(err);
    }
})


//destroy
router.delete("/:id", async (req,res)=>{
    try {
        
        const {id} = req.params;

        if(!id) return res.status(400).json({
            error:"no id provided for delete"
        });

        const sql = "DELETE FROM Houses WHERE houseID = ?";
        const data = await db.deleteHouse(id);

        // console.log("data @ deleteRoute: ", data);

        return res.status(200).json(data);

    } catch (err) {
        console.log("error @ deleteRoute: ", err);
        return res.status(500).json(err);
    }

});

//update
router.put("/:id", async (req,res)=>{
    try {
        
        const {id} = req.params;
        const {userID, address, name, description} = req.body;

        if(!id) return res.status(400).json({
            error: "No id provided for update"
        });

        const find_sql = "SELECT * FROM Houses WHERE houseID = ?";
        const found = await db.query(find_sql, [id]); 
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

        const update_sql = "UPDATE houses SET userID = ?, address = ?, name = ?, description = ? WHERE houseID = ?";
        const data = await db.query(update_sql, [updated.userID, updated.address, updated.name, updated.description, updated.houseID]);

        console.log(data);

        return res.status(200).json({success:true, id: id});

    } catch (err) {
        console.log("error @QPutHouse", err);

        return res.status(500).json({err});
    }
})

//update
/* router.put("/:id", async (req,res)=>{

    try {
        const {id} = req.params;
        const {userID, address, name, description} = req.body;

        if(!id) return res.status(400).json({
            error: "no id provided for update"
        });

        const data = await db.house.update(id, {userID, address, name, description});

        return res.status(200).json(data);


    } catch (err) {
        console.log("err @housePut: ",err);
        return res.status(500).json(err);
    }
}) */


module.exports = router;