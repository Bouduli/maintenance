const router = require("express").Router();

const mw = require("../middleware");

router.get("/", async(req,res)=>{

    res.render("index", {title:"Maintenance System"});
});
router.get("/login", async(req,res)=>{
    res.render("login", {title:"Login"});
});
router.get("/worker", mw.auth("pwl"), async(req,res)=>{
    res.render("worker", {title: "worker"})
});
router.get("/user", mw.auth(), async (req,res)=>{
    res.render("user2", {title:"user"});
});
router.get("/admin", mw.auth(), mw.admin(), async(req,res)=>{
    res.render("administrator", {title:"admin"});
});

module.exports=router;