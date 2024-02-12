const express = require("express");

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

//#region houserouter

const houseRouter = express.Router();

houseRouter.get("/", (req,res)=>{
    res.status(200).json({
        hello:"world"
    });
});
houseRouter.post("/", async (req,res)=>{
    const stuff = await db.find();
    res.status(200).json(stuff);
})

app.use("/house",houseRouter);

//#endregion