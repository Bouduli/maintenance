//module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../db");
const email_client = require("../email");

//------------ MISC OPERATIONS ---- (they are at the top, because otherwise routes would conflict.)

//Invite a contractor to a task
router.post("/invite", async(req,res)=>{
    try {
        
        const {id, name} = req.user.token;
        const {email, taskID} = req.body;

        if(!email || !id) return res.status(400).json({
            error:"email of contractor, or taskID not provided",
            email:email || null,
            taskID: taskID || null
        });

        //make sure the contractor exists in the contractors table.
        const find_contractor = "SELECT contractorID FROM contractors WHERE email = ?";
        const contractor_data = await db.query(find_contractor, [email]);
        if(!contractor_data.length) return res.status(404).json({
            error:"Contractor with the provided email was not found"
        });

        //contractorID is used to make a connection between the task, and the contractor in Task_Contractors table.
        const {contractorID} = contractor_data[0]

        //make sure that the requested task exists
        const find_task = "SELECT taskID, userID FROM tasks WHERE taskID = ?";
        const task_data = await db.query(find_task, [taskID]);
        if(!task_data.length) return res.status(404).json({
            error:"task not found with the provided id",
            id: taskID ||null
        });

        const task = task_data[0];
        console.log(task);       
        //make sure that the user is allowed to add contractor to the task
        if(task.userID != id) return res.status(403).json({
            error:"you are not allowed to invite contractor to this task"
        });

        //make sure that the contractor isn't already added to the task..
        const check_invited_sql = "SELECT contractorID, taskID from task_contractors where taskID = ? and contractorID = ?";
        const check_invited_data = await db.query(check_invited_sql, [taskID, contractorID]);

        //if we have entries with this contractorID and taskID -> then we have a duplicate. Hence 409.
        if(check_invited_data.length) return res.status(409).json({
            error:"this contractor has already been invited to this task."
        });

        //making the 'connection'
        const insert_sql = "INSERT INTO task_contractors VALUES (?,?)";
        const insert_data = await db.query(insert_sql, [taskID, contractorID]);
        console.log(insert_data);
        if(insert_data.insertId!=0 && insert_data.affectedRows!=1) return res.status(400).json({
            error:"making a connection between task and contractor failed",
            taskID: taskID,
            contractor_email: email
        });

        //optional: sending an email that a user have been appointed a task.
        const email_data = await email_client.sendHtmlMail(email, {
            Header:"You have been appointed with another task", //--------------------------------------------------------> Do something with this link <----------
            Body:`<p>You have been invited to another task.!\rLogin today at: </p> <a href='http://localhost:12345'> Maintenance.com </a>`,
            Footer :"If you beleive this was a mistake, I suggest you disregard this email"
        });
        console.log(email_data)

        return res.status(200).json({
            content:{
                invited: email,
                task: taskID
            }
        })

        
    } catch (err) {
        console.log("err @ POST /task/invite ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
})

//find appointed contractors for a specific task
router.get("/appointee/:id", async(req,res)=>{
    try {
        
        const taskID = req.params.id;
        if(!taskID) return res.status(400).json({
            error:" taskid not provided"
        });

        
        //NOTE: a check should be added so that the db wont return anything, if the task or the contractor, wasn't created by this person. 

        //returns all contractors, where contractorID matches field in task_contractors
        const sql  = "SELECT * FROM contractors WHERE contractorID IN (SELECT contractorID from task_contractors WHERE taskID = ?)";
        const data = await db.query(sql, [taskID]);
        if(!data.length) return res.status(404).json({
            error:" no contractors appointed for this taskid",
            taskID
        });

        return res.status(200).json({
            content:data
        });


    } catch (err) {
        console.log("err @ /tasks/contractors  : ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
})

//List all task suggestions
router.get("/suggestion", async(req,res)=>{

    try {
        const userID = req.user.token.id;
        if(!userID) return res.status(400).json({
            error:"userID did not follow your request, please re-authenticate."
        });

        //selects all suggested_tasks for houses which the user has created.
        const sql = "SELECT * FROM suggested_tasks WHERE houseID IN (SELECT houseID FROM houses WHERE userID = ?)";
        const suggestions = await db.query(sql, [userID]);
        if(!suggestions.length) return res.status(404).json({
            error:"no task suggestions found", message:"phew?"
        });

        //selects all contractors which have created a task suggestion.
        const contractor_sql = "SELECT * FROM contractors WHERE contractorID IN (SELECT contractorID FROM suggested_tasks WHERE houseID IN (SELECT houseID FROM houses WHERE userID = ?))"
        const contractors = await db.query(contractor_sql, [userID]);
        if(!contractors.length) {
            //logging - shouldn't occur, but just like in /worker/data - if this happens, i want to find out!!!
            console.log(`En användare (${userID}) försöker komma åt suggestions, och har sådanna, dock hittas inte den/de contractors som har skapat suggestionen`);

            return res.status(404).json({
                error:"no contractors found",
                message:"you have been sent a task-suggestion, however the related contractors couldn't be found",
                userID: userID
            });
        };

        //adding contractor field (object) to each task_suggestion, to retreive creator-data in application.
        suggestions.forEach(s=>s.user = {});
        suggestions.forEach(s=>{
            s.user = contractors.find(c=> c.contractorID == s.contractorID);
        });

        // console.log(suggestions);
        return res.status(200).json({
            content:suggestions
        });

    } catch (err) {
        console.log("err @ GET /worker/suggestions  : ", err);
        res.status(500).json({
            error:"internal server error"
        })
        
    }
});

//approve task suggestion with provided id
router.post("/suggestion/:id", async(req,res)=>{
    try {
        //suggestionID is retreived 
        const {id} = req.params;
        if(!id) return res.status(400).json({
            error:"no id provided"
        });
        
        //userID is retreived
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            error:"No userid provided with request, please login again."
        });
        
        //find the suggestion with provided id
        const select_suggestion_sql = "SELECT * FROM suggested_tasks where suggestionID = ?";
        const select_suggestion_data = await db.query(select_suggestion_sql, [id]);
        if(!select_suggestion_data.length) return res.status(404).json({
            error:"task-suggestion with the provided ID was not found",
            id
        });

        const suggestion = select_suggestion_data[0];
        // console.log(suggestion);
        
        //make sure that the user is allowed to approve tasks for the house (has created it).
        const select_house_sql = "SELECT userID from houses where userID = ? AND houseID = ?"
        const select_house_data = await db.query(select_house_sql, [userID, suggestion.houseID]);
        if(!select_house_data.length) return res.status(403).json({
            error:"you are not allowed to approve a task for this house.",
            houseID: suggestion.houseID,
            suggestionID: id
        });

        //inserting the suggested_task into the tasks-table
        const insert_sql = "INSERT INTO tasks (description, houseID, userID) VALUES (?,?,?)"
        const insert_data = await db.query(insert_sql, [suggestion.description, suggestion.houseID, userID])
        console.log(insert_data);
        if(!insert_data.insertId) return res.status(400).json({
            error:"unable to approve task-suggestion.",
            suggestionID: id

        });

        // removing suggestion from task_suggestions.
        const remove_sql = "DELETE FROM suggested_tasks WHERE suggestionID = ?";
        const remove_data = await db.query(remove_sql, [suggestion.suggestionID]);
        if(!remove_data.affectedRows) return res.status(400).json({
            error: "unable to remove task_suggestion, however the suggestion was approved",
            new_task_id: insert_data.insertId
        });

        return res.status(200).json({
            content:{
                taskID: insert_data.insertId,
                approved_suggestion_with_id: id
            }
        })



    } catch (err) {
        console.log("err @ POST /suggestion/:id  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
})

router.delete("/suggestion/:id", async(req,res)=>{
    try {
        
        const {id} = req.params;
        if(!id) return res.status(400).json({
            error:"id not provided for task-rejection"
        });

        //userID is retreived
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            error:"No userid provided with request, please login again."
        });

        const sql = "DELETE FROM suggested_tasks WHERE suggestionID = ?";
        const data = await db.query(sql, [id]);
        if(!data.affectedRows) return res.status(404).json({
            error:"no suggestion found",
            id: id
        });

        return res.status(200).json({
            message:"successfully deleted task-suggestion",
            id: id
        });

    } catch (err) {
        console.log("Err @ DELETE/task/suggestion/:id  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
})

//---------------- CRUD OPERATIONS ---------------------------
//index
router.get("/", async ( req,res)=>{
    try {
        
        //only retreive tasks available to the authenticated user
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })

        const data = await db.query("SELECT * FROM tasks WHERE userID = ?", [userID]);
        if(!data.length) return res.status(404).json({
            error:"no tasks found"
        });
        
        return res.status(200).json({
            content: data
        });

    } catch (err) {
        console.log("Err @ GET/tasks :", err);
        return res.status(500).json({
            error: "operation failed"
        });
    }
})

//show
router.get("/:id", async (req,res)=>{
    try {
        //only retreive tasks available to the authenticated user
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })

        const {id} = req.params;

        //empty id should not be the case, if the endpoint is reached
        if(!id) return res.status(400).json({
            error:"no id provided"
        });

        const data = await db.query("SELECT * FROM tasks WHERE taskID = ? AND userID = ?", [id, userID]);

        if(!data.length) return res.status(404).json({
            error: "no task found with the provided id",
            id
        })

        return res.status(200).json({
            content: data
        });

    } catch (err) {
        console.log("Err @ GET/tasks/:id :", err);
        
        return res.status(500).json(err);
    }
});

//create 
router.post("/", async (req,res)=>{
    try {
        const userID = req.user.token.id;
        const {houseID, description} = req.body;

        if(!houseID || !description ||!userID) return res.status(400).json({
            error:"Either houseID, userID, or description was not provided",
            //if it is undefined, then it is written out as null in the response object. claritys sake
            houseId: houseID || null,
            userID: userID || null,
            description: description|| null
        });

        //make sure that the user is the owner of the house, and therefore, allowed to create a task
        const find_sql = "SELECT userID FROM houses WHERE houseID = ? and userID = ?";
        const find_data = await db.query(find_sql, [houseID, userID])
        if(!find_data.length) return res.status(403).json({
            error:"you are not allowed to create a task on this house"
        });

        //inserting the task
        const sql = "INSERT INTO tasks (houseID, userID, description) VALUES (?,?,?)";
        const data = await db.query(sql, [houseID, userID, description]);

        return res.status(201).json({content:{id: data.insertId} });

    } catch (err) {
        console.log("Err @ POST/tasks : ", err);
        return res.status(500).json({
            error: "operation failed"
        })
    }

})

//destroy
router.delete("/:id", async(req,res)=>{
    try {
        
        //only delete tasks available to the authenticated user
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })

        const {id} = req.params;

        const sql = "DELETE FROM tasks WHERE taskID = ? AND userID = ?";
        const data = await db.query(sql, [id, userID]);

        if(!data.affectedRows) return res.status(404).json({
            error:"not found",
            id
        });

        return res.status(200).json({
            content: {
                message: "successfully deleted task",
                id: id
            }
        });
    } catch (err) {
        console.log("Err @ DELETE/tasks/:id  : ", err);
        return res.status(500).json({

            error : "operation failed"
        });
    }
})

//update
router.put("/:id", async (req,res)=>{

    try {

        //only update tasks available to the authenticated user
        const userID = req.user.token.id;
        if(!userID) return res.status(401).json({
            message:"useriD not provided, please re-authenticate"
        })

        const {id} = req.params;
        const {houseID, completed, description} = req.body;

        if(!id) return res.status(400).json({
            error: "no id provided for delete"
        });

        //retreive existing entry (also used to check that the user is authenticated)
        const find_sql = "SELECT * FROM tasks WHERE taskID = ? and userID = ?";
        const found = await db.query(find_sql, [id, userID]);

        if(!found.length) return res.status(404).json({
            error: "item not found with specified id",
            id
        });

        //found is always an array, but should only hold one value.
        const old = found[0];
        const updated = {
            taskID: old.taskID,
            houseID : houseID || old.houseID,
            completed : completed || old.completed,
            description : description || old.description
        }
        
        //updates the task using a mix of newly-provided values, and the old values, if no new ones were procided.
        const updated_sql = "UPDATE tasks SET houseID = ? , completed = ?, description = ? WHERE taskID = ? and userID =?"
        const data = await db.query(updated_sql, [ updated.houseID, updated.completed, updated.description, updated.taskID, userID]);
        
        //if data isn't changed, then it is reflected here.
        if(!data.changedRows) return res.status(304).json({
            error:"nothing changed",
            id
        });
        
        return res.status(200).json({
            content: {
                id: id
            }
        });

    } catch (err) {
        console.log("Err @ PUT /task/:id  : ", err);
        return res.status(500).json({
            error: "something went wrong"
        })
    }
})

module.exports = router;