//#region Setup
const express = require("express");
require("dotenv").config();

const app = express();
const cors = require("cors");
app.use(cors({
    credentials:true
}));

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}));
app.use(express.static("public"))

const db = require("./db");
const mw = require("./middleware");

//parsing cookies on all routes
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//templating with pug
require("pug");
app.set("view engine", "pug");

// initiate and test db (making sure that a connection can be retreived and released).
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
//#endregion

//#region Routes
// View-enpoints are in this `app` router.
const appRouter = require("./routers/app");
app.use("/", appRouter);

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
app.use("/administrator", mw.auth(), mw.admin(), adminRouter);

//#endregion
