const router = require("express").Router();

const db = require("../db");


//index
router.get("/", async(req,res)=>{

    const data = db.query("SELECT * FROM contractors");



})

//show
router.get("/:id", async (req,res)=>{
    const {id} = req.params;

})