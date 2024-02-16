const express = require("express");

const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}));

const db = require("./db");
const email = require("./email")

const PORT = process.env.PORT || 12345; 
app.listen(PORT, (err)=>{
    if(err) return console.log(err);
    console.log("Server at http://localhost:"+ PORT)
});

app.get("/", async (req,res)=>{

    try {
        const info = await email.send("oliverbertil2@gmail.com");
        return res.status(200).json({

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
app.use("/house",houseRouter);


const taskRouter = require("./routers/tasks");
app.use("/tasks", taskRouter);