//module.exports = {}

// access control middlewares
const jwt = require("jsonwebtoken");

/**
 * The function returns a middleware that controls that a user is loggedIn.
 * @returns the middleware
 */
function loggedIn(){
    return async function(req,res,next){
        
        const cookie = req.cookies["auth-token"];

        if(!cookie) return res.status(401).json({
            error: "authentication required"
        });

        const isValid = await verify(cookie, process.env.JWT_SECRET);

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