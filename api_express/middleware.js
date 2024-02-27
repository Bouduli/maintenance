//module.exports = {}

// access control middlewares
const jwt = require("jsonwebtoken");

/**
 * Middleware that takes tokenType as an argument, dictating which JWT-secret is used to verify the JWT.
 * @param {[string]} tokenType optional string dictates which JWT secret is used, default = "stateful".
 * @returns A middleware of type async(req,res,next)
 * @example app.get("/restricted_endpoint", loggedIn("admin"), async (req,res)=> ... )
 */
function loggedIn(tokenType = "stateful"){
    return async function(req,res,next){
        
        const cookie = req.cookies["auth-token"];

        if(!cookie) return res.status(401).json({
            error: "authentication required"
        });

        const secret = tokenType == "stateful" ? process.env.JWT_SECRET: process.env.PWL_LONG_TERM_SECRET ;
        const isValid = await verify(cookie, secret);

        if(!isValid) return res.status(401).json({
            error:"Invalid token, please re-authenticate."
        });

        return next();
    }
}

/**
 * Verifies a JWT token with the provided secret. 
 * @param {*} token JWT
 * @param {*} secret Provided secret, which changes depending on what token is used to sign the token. 
 * @returns True, if the token can be verified; otherwise false. 
 * 
 */
async function verify(token, secret){
   try {
        //an exception is thrown when a JWT isn't valid, hence the catch only returns false. 
        await jwt.verify(token,secret);
        
        return true;
    } catch (err) {
        
        console.log("err @ verify() : ", err);
        
        return false;
   }
}

module.exports = {loggedIn};