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
    try {
        const {address, userID} = req.body;
        if( !address ||  !userID) return res.status(400).json({
            error: "userID or address not provided",
            userID, address
        });
    
        const stuff = await db.insertHouse( {address, userID});
        return res.status(200).json(stuff);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
})

app.use("/house",houseRouter);

//#endregion