//module.exports = {}

// access control middlewares
const jwt = require("jsonwebtoken");
/**
 * Identification Middleware which identifies (without verifying) the user.
 * This is only used to ENSURE that the user has a "role" when visiting `index.pug` as the user should be redirected 
 * depending on the user's permissions. 
 * 
 * Since the function doesn't "verify" the JWT provided, 
 * the token shouldn't be trusted, so therefore this route is ONLY used to display "nav-buttons" or intiate redirect
 * (authentication is properly handeled when redirecting/navigating to the other endpoint.) 
 * @returns 
 */
function identity(){
    return async function (req,res,next){
        try {
            const cookie = req.cookies["auth-token"];
            if(cookie){
                const unsafe_token = await jwt.decode(cookie);
                req.user = {token: unsafe_token, role: unsafe_token.role, validate_required :true};
            }
            next()
        } catch (err) {
            console.log("err @ mw.identity()  : ", err);
            next()
        }
    }
}

/**
 * Middleware that takes tokenType as an argument, dictating which JWT-secret is used to verify the JWT.
 * @param {[string]} tokenType optional string dictates which JWT secret is used, default = "stateful".
 * @returns A middleware of type async(req,res,next)
 * @example app.get("/restricted_endpoint", auth("admin"), async (req,res)=> ... )
 */
function auth(tokenType = "stateful"){
    return async function(req,res,next){
        
        try {
            if(req.user && !req.user.validate_required) return next();

            const cookie = req.cookies["auth-token"];

            if(!cookie) return res.status(401).json({
                error: "authentication required"
            });

            const secret = tokenType == "stateful" ? process.env.JWT_SECRET: process.env.PWL_LONG_TERM_SECRET ;
            const token = await jwt.verify(cookie, secret);
            
            req.user = {token};
            if(token.admin) req.user.admin=true;
            //used to control views. 
            req.user.role = token.role;
            
            // remove validate required field
            delete req.user.validate_required;

            return next();
            
        } catch (err) {
            console.log("err @ mw.auth()  : ", err);
            
            if(req.body.api_only) return res.status(401).json({
                error:"Invalid token, please re-authenticate."
            });

            else return res.status(401).render("login", {title:"Login", unauthorized:true});
            
        }
    }
}
function admin(){
    return async function(req,res,next){
        try {
            const {token, admin} = req.user;

            if(!admin || token.validate_required) return res.status(403).json({
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

module.exports = {auth, admin, identity};