//module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../db");

router.post("/register", async(req,res)=>{

    try {
        
        const {email, password, name} = req.body;

        //sends a 400 response object, indicating what parameters ws missing...
        if(!email || !password || !name) {

            let required = [];

            if(!email) required.push("email");
            if(!password) required.push("password");
            if(!name) required.push("name");

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

        console.log(insert_data);
        
        return res.status(200).json({
            content:{
                id : insert_data.insertId
            }
        });


    } catch (err) {
        
        console.log("Err @ POST auth/register")
        return res.status(500).json({
            error:"internal server error"
        })
    }

});


router.post("/login", async (req,res)=>{

    try {

        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({
            error : "password or email not provided"
        });

        //selecting hash from database, also makes sure that the user exists.
        const select_sql = "SELECT hash,name FROM users WHERE email = ?";
        const select_data = await db.query(select_sql, [email]);

        if(!select_data.length) return res.status(401).json({
            error:"something went wrong with the login, check email and password"
        });
        
        const user = select_data[0];
        const hash = user.hash;
        const successful_login = await bcrypt.compare(password, hash);

        //ctrl+c ctrl+v to be consistent (security) with resposne above.
        if(!successful_login) return res.status(401).json({
            error:"something went wrong with the login, check email and password"
        });

        const payload ={
            name: user.name,
            email: user.email
        };
        
        const token = await jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.cookie("auth-token", token, {
            httpOnly: true
        })

        return res.status(200).json({
            content:{
                token: token
            }
        });
        
    } catch (err) {
        console.log("err @ POST/auth/login  : ", err);

        return res.status(500).json({
            error:"internal server error"
        });
    }


});

router.get("/logout", async(req,res)=>{
    res.clearCookie("auth-token");
    return res.status(200).json({
        message: "logged out"
    });

})
module.exports = router;