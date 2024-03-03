//module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");

const db = require("../db");
const email_client = require("../email");
//show users
router.get("/user", async(req,res)=>{
    try {
        
        const sql = "SELECT userID, email, name FROM Users";
        const data = await db.query(sql);

        if(!data.length) return res.status(404).json({
            error:"no users found"
        });

        return res.status(200).json({
            content:{
                users:data
            }
        });

    } catch (err) {
        console.log("err @ GET /admin/user  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
});

//create user;
router.post("/user", async(req,res)=>{
    try {
        //user data is provided in request body (admin panel uses a form for this)
        const {email, name, phone, password} = req.body;

        //if the user-data is incomplete, the server returns an error indicating what is missing
        if(!email || !name || !phone || !password) {

            let required = [];

            if(!email) required.push("email");
            if(!name) required.push("name");
            if(!phone) required.push("phone");
            if(!password) required.push("password")

            return res.status(400).json({
                error:"not all parameters were provided",
                required
            });
        }

        //regex to validate if something is an email. Source: https://emailregex.com/index.html
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!emailRegex.exec(email)) return res.status(400).json({
            error:"bad email was provided",
            email: email
        });

        //validate that no user has taken that email.
        const select_sql = "SELECT * FROM USERS WHERE email = ?";
        const select_result = await db.query(select_sql, [email]);
        if(select_result.length) return res.status(409).json({
            error:"a user with that email already exists"
        });
        //makes a hash of the password
        const hash = await bcrypt.hash(password, 12);

        const insert_sql = "INSERT INTO users (name, email, hash) VALUES (?,?,?)";
        const insert_data = await db.query(insert_sql, [name, email, hash]);

        // console.log(insert_data);
        
        //invite of a contractor is successful, therefore:
        const email_data = await email_client.sendHtmlMail(email, {
            Header:"Welcome to the maintenance system!", //--------------------------------------------------------> Do something with this link <----------
            Body:"<p>You have been invited to the maintenance system as a User by a system administrator!\rLogin today at: </p> <a href='http://localhost:12345'> Maintenance.com </a>",
            Footer :"If you beleive this was a mistake, I suggest you disregard this email"
        });
        // console.log("email_data: ", email_data);

        return res.status(200).json({
            content:{
                registered_user: `${name} with email ${email}`
            }
        });

    } catch (err) {
        console.log("err @ POST /admin/user  : ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
});


module.exports = router;
