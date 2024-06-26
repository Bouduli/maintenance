//module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const email_client = require("../email");
const db = require("../db");
const mw = require("../middleware");

//STATEUFL AUTHENTICATION FOR USERS
router.post("/login", async (req,res)=>{

    try {

        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({
            error : "password or email not provided"
        });

        //selecting hash from database, also makes sure that the user exists.
        const select_sql = "SELECT hash,name,userID,admin FROM users WHERE email = ? AND active_account=1";
        const select_data = await db.query(select_sql, [email]);

        if(!select_data.length) return res.status(401).json({
            error:"something went wrong with the login, check email and password"
        });

        const user = select_data[0];
        const hash = user.hash;

        const successful_login = await bcrypt.compare(password.toString(), hash);

        //ctrl+c ctrl+v to be consistent (security) with resposne above.
        if(!successful_login) return res.status(401).json({
            error:"something went wrong with the login, check email and password"
        });

        //payload for JWT
        const payload ={
            name: user.name,
            email: user.email,
            admin: user.admin,
            id: user.userID
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

router.post("/change_password", mw.auth(), async (req,res)=>{
    try {
        const {email, old_password, new_password} = req.body;

        console.log(req.user);
        const userID = req.user.token.id;
        if(!email || !old_password || !new_password, !userID) {
        
            const requried = [];
            if(!email) requried.push("email");
            if(!old_password) requried.push("old_password");
            if(!new_password) requried.push("new_password");
            if(!userID) requried.push("userID");

            return res.status(400).json({
                error:"request is missing some required parameters.",
                missing: requried
            });
        }

        //make sure wether or not the user exists in the database. (descriptive error handling)
        //if user is administrator, only email is required during this check... hence these disgusting lines.
        const find_sql = req.user.admin? "SELECT hash, userID FROM Users WHERE email =? AND active_account =1 " :  "SELECT hash, userID from Users WHERE email =? AND userID =? AND active_account=1";
        const find_data = req.user.admin ? await db.query(find_sql, [email]) : await db.query(find_sql, [email, userID]);

        if(!find_data.length) return res.status(404).json({
            error:"no user found with that email and userID",
            userID : userID || null,
            email : email || null
        });
        const user = find_data[0];
        // console.log(user);

        //verify the users current password
        const old_password_match = await bcrypt.compare(old_password.toString(), user.hash);
        if(!old_password_match) return res.status(401).json({
            error:"old password does not match."
        });

        const new_hash = await bcrypt.hash(new_password.toString(), 12);

        const update_sql = "UPDATE Users SET hash=? WHERE email =? AND userID =? AND active_account=1";
        const update_data = await db.query(update_sql, [new_hash, email, user.userID]);
        // console.log(update_data);

        if(!update_data.changedRows) return res.status(304).json({
            error:"nothing changed",
            userID : user.userID
        });

        return res.status(200).json({
            content:{
                message:"changed password of user",
                email : user.email
            }
        })

        


    } catch (err) {
        console.log("err @ POST /auth/change_password  : ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
});


function generateOTP() {
 
    // Declare a digits variable
    // which stores all digits 
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}



// PASSWORDLESS AUTHENTICATION FOR CONTRACTORS
router.post("/login_pwl", async (req,res)=>{
    try {
        const {email} = req.body;

        if(!email) return res.status(400).json({
            error:"email not provided"
        });

        
        //making sure that the contractor exists.
        const select_sql = "SELECT contractorID FROM contractors WHERE email = ?";
        const select_data = await db.query(select_sql, [email]);
        if(!select_data.length) return res.status(401).json({
            error:"something went wrong with the login, check your email"
        });
        
        // numeric code of length 6
        const code = generateOTP();
        
        // const data = await email_client.sendHtmlMail(email, {
        //     Header: "One Time Password",
        //     Body:`OTP: ${code}`,
        //     Footer:"This code expires in 60 seconds..."
        // });
        
        console.log(`The OTP is: ${code}`);

        //hash to compare against during verify
        const hash = await bcrypt.hash(code, 12);

        const token = await jwt.sign({email, hash}, process.env.PWL_JWT_SECRET,{
            expiresIn:60
        });

        res.cookie("auth-token", token, {
            maxAge:60000,
            httpOnly:true
        });

        return res.status(200).json({
            content:{
                token: token
            }
        });


    } catch (err) {
        console.log("err @ /auth/login_pwl", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
});

router.post("/verify_pwl", async(req,res)=>{

    try {
        const {code} = req.body;
        const token = req.cookies["auth-token"];
    
        if(!code) return res.status(400).json({
            error:"code not provided"
        });
        if(!token) return res.status(400).json({
            error:"cookie not provided with request, please login again."
        });
        
        //will throw an exception for failed jwt verification - catch returns 401
        const OTP_token = await jwt.verify(token, process.env.PWL_JWT_SECRET);
        
        //email is retreived to query against DB for contractorID, and hash for comparing against the OTP
        const {email, hash} = OTP_token;
        
        //early return for invalid code
        if( !(await bcrypt.compare(code, hash)) ) return res.status(401).json({
            error:"verification failed, please try again"
        });

        /*contractorID is retreived from db
        *
        * Yes, this looks sketchy, but is secure..
        * 1. email originates from 'login' step, where proper checks against the DB are performed (that the contractor exists), therefore A USER EXISTS.
        * 2. Database structure has emails being unique, therefore the array from db.query HAS LENGTH 1
        * Since A USER EXISTS and the array HAS LENGTH 1, we can safely access contractorID from index 0.
        * 
        * This is performed, as opposed to my first idea, because a userID should not be included in the JWT, unless it's hash has been verified against the emailed code.
        * This is necessary, because the API really shouldn't provide internal IDs, unless the related user is properly authenticated.
        * 
        */
        const {contractorID} = (await db.query("SELECT contractorID FROM contractors WHERE email=?",[email]))[0] 

        //longer-term auth token, since the user passed verification and shall be logged in.
        const long_token = await jwt.sign({email, id:contractorID}, process.env.PWL_LONG_TERM_SECRET, {
            expiresIn:"1h"
        });

        res.cookie("auth-token", long_token, {
            httpOnly:true
        });

        return res.status(200).json({
            content:{
                token:long_token
            }
        });


    } catch (err) {
        console.log("Err @ POST /auth/verify_pwl", err);
        return res.status(401).json({
            error:"verification failed, please try again."
        })
    }
});

//LOGOUT APPLICABLE TO BOTH AUTHENTICATION-TYPES
router.get("/logout", async(req,res)=>{
    res.clearCookie("auth-token");
    return res.status(200).json({
        message: "logged out"
    });

});

module.exports = router;