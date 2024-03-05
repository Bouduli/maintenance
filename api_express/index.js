const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}));

const db = require("./db");
const mw = require("./middleware");

//parsing cookies on all routes
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//templating with pug
require("pug");
app.set("view engine", "pug");

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
    res.render("index", {title:"Maintenance System"})
});

//Authentication
const authRouter = require("./routers/authentication");
app.use("/auth", authRouter);

//A regular user accesses these routes
const houseRouter = require("./routers/houses");
app.use("/house", mw.auth(), houseRouter);

const taskRouter = require("./routers/tasks");
app.use("/task", mw.auth(), taskRouter);

const contractorRouter = require("./routers/contractors");
app.use("/contractor", mw.auth(), contractorRouter);

//worker api router
const workerRouter = require("./routers/worker");
app.use("/worker", mw.auth("PWL"), workerRouter)

//administrator api router
const adminRouter = require("./routers/administrator");
//MAKE SURE TO LOCK THIS ROUTER WITH MIDDLEWARE
app.use("/admin", mw.auth(), mw.admin(), adminRouter)