//module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../db");

//index
router.get("/", async ( req,res)=>{
    try {
         
        
    } catch (err) {
        return res.status(500).json(err);
    }
})

//show
router.get("/:id", async (req,res)=>{
    try {
        
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;