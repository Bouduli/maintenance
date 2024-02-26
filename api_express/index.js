const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}));

const db = require("./db");
const email = require("./email");
const mw = require("./middleware");

//parsing cookies on all routes
const cookieParser = require("cookie-parser");
app.use(cookieParser());

(async()=>{
    try {
        if(await db.init()) console.log("Database opened at 3306");

    } catch {
        console.log("Database could not be opened");
        process.exit(1);
    }
})();

const PORT = process.env.PORT || 12345; 
app.listen(PORT, (err)=>{
    if(err) return console.log(err);
    console.log("Server at http://localhost:"+ PORT)
});

app.get("/", async (req,res)=>{

    try {
        // const info = await email.send(process.env.EMAIL_TEST_RECIPIENT);
        const info = "hi bro";
        res.status(200).json({

            content:{
                info: info
            }
        });
        
    } catch (err) {
        return res.status(500).json({
            error: "email failed"
        })
    }
})

const houseRouter = require("./routers/houses");
app.use("/house", mw.loggedIn(), houseRouter);
app.use("/house", mw.loggedIn(), houseRouter);


const taskRouter = require("./routers/tasks");
app.use("/task", mw.loggedIn(), taskRouter);
app.use("/task", mw.loggedIn(), taskRouter);

const contractorRouter = require("./routers/contractors");
app.use("/contractor", mw.loggedIn(), contractorRouter);
app.use("/contractor", mw.loggedIn(), contractorRouter);

const authRouter = require("./routers/authentication");
app.use("/auth", authRouter);
