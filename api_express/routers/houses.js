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

        if(!data.length) return res.status(400).json({error: "House not found with the id provided", id});

        return res.status(200).json(data);


    } catch (err) {

        console.log("Error @ GET/:id: ",err);
        return res.status(500).json(err);
    }
});

//create
router.post("/", async (req,res)=>{
    try {
        const {address, userID} = req.body;
        if( !address ||  !userID) return res.status(400).json({
            error: "userID or address not provided",
            userID, address
        });
    
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
})

//destroy
router.delete("/:id", async (req,res)=>{
    try {
        
        const {id} = req.params;

        if(!id) return res.status(400).json({
            error:"no id provided for delete"
        });


        const data = await db.deleteHouse(id);

        // console.log("data @ deleteRoute: ", data);

        return res.status(200).json(data);

    } catch (err) {
        console.log("error @ deleteRoute: ", err);
        return res.status(500).json(err);
    }

})


module.exports = router;