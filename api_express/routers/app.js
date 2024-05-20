const router = require("express").Router();

const mw = require("../middleware");

router.get("/", mw.identity() ,async(req,res)=>{
    const permissions = {'user':true};
    if(req.user.token.role=='admin') permissions['admin'] = true;

    // console.log("index user: ", req.user);
        
    if(!req.user) return res.render("login", {title:"login"})
    if(req.user.role == 'contractor')
        return res.redirect('/worker');
    else return res.render('index', {title: 'Maintenance System', permissions});
});
router.get("/login", async(req,res)=>{
    res.render("login", {title:"Login"});
});
router.get("/worker", mw.auth("pwl"), async(req,res)=>{
    const permissions = {'worker': true};
    res.render("worker", {title: "worker"})
});
router.get("/user", mw.auth(), async (req,res)=>{
    const permissions = {'user':true};
    if(req.user.token.role=='admin') permissions['admin'] = true;

    res.render("user", {title:"user", permissions});
});
router.get("/admin", mw.auth(), mw.admin(), async(req,res)=>{
    const permissions = {'user':true, 'admin':true};

    res.render("administrator", {title:"admin", permissions});
});

module.exports=router;