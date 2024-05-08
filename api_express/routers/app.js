const router = require("express").Router();

const mw = require("../middleware");

router.get("/", mw.identity() ,async(req,res)=>{


    console.log("index user: ", req.user);
        
    if(!req.user) return res.render("login", {title:"login"})
    if(req.user.role == 'contractor')
        return res.redirect('/worker');
    else return res.render('index', {title: 'Maintenance System', admin: req.user.role == 'admin'});
});
router.get("/login", async(req,res)=>{
    res.render("login", {title:"Login"});
});
router.get("/worker", mw.auth("pwl"), async(req,res)=>{
    res.render("worker", {title: "worker"})
});
router.get("/user", mw.auth(), async (req,res)=>{
    res.render("user", {title:"user"});
});
router.get("/user2", mw.auth(), async (req,res)=>{
    res.render("user2", {title:"user"});
});
router.get("/admin", mw.auth(), mw.admin(), async(req,res)=>{
    res.render("administrator", {title:"admin"});
});

module.exports=router;