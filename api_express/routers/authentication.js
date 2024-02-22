//module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");

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

        const select_sql = "SELECT * FROM USERS WHERE email = ?";
        const select_result = await db.query(select_sql, [email]);

        return res.status(200).json(select_result);


    } catch (err) {
        
        console.log("Err @ POST auth/register")
        return res.status(500).json({
            error:"internal server error"
        })
    }

});


router.post("login", async (req,res)=>{


});

module.exports = router;