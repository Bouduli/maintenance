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


houseRouter.get("/", async (req,res)=>{
    try {
        const data = await db.select("houses");

        res.status(200).json(data);
        
    } catch (err) {
        return res.status(500).json(err);
    }
});


houseRouter.post("/", async (req,res)=>{
    try {
        const {address, userID} = req.body;
        if( !address ||  !userID) return res.status(400).json({
            error: "userID or address not provided",
            userID, address
        });
    
        const insertedId = await db.insertHouse( {address, userID});
        return res.status(201).json({
            insertedId, 
            house:{
                address,
                userID
            }
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
})

houseRouter.get("/:id", async(req,res)=>{
    try {
        const {id} = req.params;
        if(!id) return res.send(400).json({
            error:"houseID not provided"
        });



        const data = await db.select("houses", `WHERE houseID = ${id}`);

        if(!data.length) return res.status(400).json({error: "House not found with the id provided", id});

        return res.status(200).json(data);


    } catch (err) {

        console.log("Error @ GET/:id: ",err);
        return res.status(500).json(err);
    }
})


app.use("/house",houseRouter);

//#endregion


//#region taskrouter

const taskRouter = express.Router();
taskRouter.get("/", async ( req,res)=>{
    try {
         

    } catch (err) {
        return res.status(500).json(err);
    }
})

taskRouter.get("/:id", async (req,res)=>{
    try {
        
    } catch (err) {
        return res.status(500).json(err);
    }
});

app.use("/tasks", taskRouter);
//#endregion