//module.exports = {}

// access control middlewares
const jwt = require("jsonwebtoken");

function loggedIn(){
    return async function(req,res,next){
        
        const cookie = req.cookies["auth-token"];

        if(!cookie) return res.status(401).json({
            error: "authentication required"
        });
        console.log(cookie);
        console.log(process.env.STATEFUL_JWT);
        const isValid = await verify(cookie, process.env.STATEFUL_JWT);
        console.log(isValid);
        if(!isValid) return res.status(401).json({
            error:"Invalid token"
        });
        return next();
    }
}

//function is used
async function verify(token, secret){
   try {
        const isValid = await jwt.verify(token,secret);
        
        return true;
    } catch (err) {
        
        console.log("err @ verify() : ", err);
        
        return false;
   }
}

module.exports = {loggedIn};