const router = require("express").Router();

const mw = require("../middleware");
const db = require("../db");

router.get("/", mw.identity() ,async(req,res)=>{
    

    // console.log("index user: ", req.user);
        
    if(!req.user) return res.render("login", {title:"login"});

    if(req.user.role == 'contractor')
        return res.redirect('/worker');

    //permissions for landing page content. 
    const permissions = {'user':true};
    if(req.user.token.role=='admin') permissions['admin'] = true;
    
    return res.render('index', {title: 'Maintenance System', permissions});
});
router.get("/login", async(req,res)=>{
    res.render("login", {title:"Login"});
});


router.get("/worker", mw.auth("pwl"), async(req,res)=>{

    // Find alternate "profiles" (mysql accounts that the user might want to access)
    const {email, id} = req.user.token;

    const sql = "SELECT * FROM contractors WHERE email =?";
    const data = await db.query(sql, [email]);
    if(!data.length) return res.status(404).json({
        error:"no accounts to swap with"
    });
    //assign the "current" user, allowing the client to this as selected. 
    data.find(d=>d.contractorID == id).current=true;

    const permissions = {'worker': true};

    res.render("worker", {title: "worker", permissions, profiles: data});
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