//module.exports = {}

// access control middlewares
const jwt = require("jsonwebtoken");

/**
 * Middleware that takes tokenType as an argument, dictating which JWT-secret is used to verify the JWT.
 * @param {[string]} tokenType optional string dictates which JWT secret is used, default = "stateful".
 * @returns A middleware of type async(req,res,next)
 * @example app.get("/restricted_endpoint", auth("admin"), async (req,res)=> ... )
 */
function auth(tokenType = "stateful"){
    return async function(req,res,next){
        
        try {
            
            const cookie = req.cookies["auth-token"];

            if(!cookie) return res.status(401).json({
                error: "authentication required"
            });

            const secret = tokenType == "stateful" ? process.env.JWT_SECRET: process.env.PWL_LONG_TERM_SECRET ;
            const token = await jwt.verify(cookie, secret);

            req.user = {token};
            if(token.admin) req.user.admin=true;

            return next();
            
        } catch (err) {
            console.log("err @ mw.auth()  : ", err);
            return res.status(401).json({
                error:"Invalid token, please re-authenticate."
            });
            
        }
    }
}
function admin(){
    return async function(req,res,next){
        try {
            const {token, admin} = req.user;
            
            if(!admin) return res.status(403).json({
                error:"you are not authorized for this action "
            });

            return next();

        } catch (err) {
            console.log("err @ mw.admin()  : ", err);
            return res.status(403).json({
                error:"you are not authorized for this action"
            })
        }
    }
}

module.exports = {auth, admin};