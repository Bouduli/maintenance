const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}));

const db = require("./db");


const PORT = process.env.PORT || 12345; 
app.listen(PORT, (err)=>{
    if(err) return console.log(err);
    console.log("Server at http://localhost:"+ PORT)
});

app.get("/", (req,res)=>{
    res.status(200).send("Hello World")
})

const houseRouter = require("./routers/houses");
app.use("/house",houseRouter);


const taskRouter = require("./routers/tasks");
app.use("/task", taskRouter);

const contractorRouter = require("./routers/contractors");
app.use("/contractor",contractorRouter);

const authRouter = require("./routers/authentication");
app.use("/auth", authRouter);
