//module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");

const db = require("../db");
const email_client = require("../email");

//index users
router.get("/user", async(req,res)=>{
    try {
        //gets a overview of a user, intended to be displayed in the list.
        const sql = "SELECT userID, email, name, admin FROM Users where active_account=1";
        const data = await db.query(sql);

        if(!data.length) return res.status(404).json({
            error:"no users found"
        });

        return res.status(200).json({
            content:data
        });

    } catch (err) {
        console.log("err @ GET /admin/user  : ", err);
        return res.status(500).json({
            error:"internal server error"
        });
    }
});

//show users (details of a user, showing all houses, tasks, and contractors they've created. - NOT IMPLEMENTED IN CLIENT)
router.get("/user/:id", async(req,res)=>{
    try {
        //id of user is retreived from params
        const {id} = req.params;
        if(!id) return res.status(400).json({
            error:"id not provided"
        });
        
        //retreive info of a user, this will be used as a base for the response object
        const user_sql = "SELECT userID, email, name, phone, last_login, created_at, active_account, admin  FROM Users WHERE userID = ?";
        const user_data = await db.query(user_sql, [id]);
        if(!user_data.length) return res.status(404).json({
            error:" no user found with the provided userID",
            id: id
        });

        //there should only be one user because of database definition, therefore we select first index.
        const user = user_data[0]

        //Retreive all houses the user has created.
        const house_sql = "SELECT * FROM houses WHERE userID = ? and active=?";
        const house_data = await db.query(house_sql, [id, 1]);
        //if no houses, we assign an empty array
        if(!house_data.length) user.houses = [];
        else user.houses = [...house_data];


        //retreive all tasks the user has created.
        const task_sql = "SELECT * FROM tasks WHERE userID = ? ";
        const task_data = await db.query(task_sql, [id]);
        //if no tasks at all, all houses are assigned an empty array 
        if(!task_data.length) user.houses.forEach(h => h.tasks=[]);
        //otherwise all houses get their tasks assigned
        else {
            user.houses.forEach(h=>h.tasks = [...task_data.filter(t=>t.houseID == h.houseID)]);
        }


        //retreive all "active" contractors invited by a user
        const contractors_sql = "SELECT * FROM contractors where invited_by=? and active_account=?";
        const contractor_data = await db.query(contractors_sql, [id, 1]);
        if(!contractor_data.length) user.contractors=[];
        else user.contractors = [...contractor_data];


        return res.status(200).json({
            content: user
        });
        
    } catch (err) {
        console.log("err @ GET /user/:id  : ", err);



        return res.status(500).json({
            error :"internal server error"
        })
    }
})

//create user;
router.post("/user", async(req,res)=>{
    try {
        //user data is provided in request body (admin panel uses a form for this)
        const {email, name, phone, password, admin} = req.body;
        
        //if the user-data is incomplete, the server returns an error indicating what is missing
        if(!email || !name || !phone || !password) {

            let required = [];

            if(!email) required.push("email");
            if(!name) required.push("name");
            if(!phone) required.push("phone");
            if(!password) required.push("password")

            return res.status(400).json({
                error:"not all parameters were provided",
                required
            });
        }

        //regex to validate if something is an email. Source: https://emailregex.com/index.html
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!emailRegex.exec(email)) return res.status(400).json({
            error:"bad email was provided",
            email: email
        });

        //validate that no user has taken that email.
        const select_sql = "SELECT * FROM USERS WHERE email = ?";
        const select_result = await db.query(select_sql, [email]);
        if(select_result.length) return res.status(409).json({
            error:"a user with that email already exists"
        });
        //makes a hash of the password
        const hash = await bcrypt.hash(password, 12);

        const insert_sql = "INSERT INTO users (name, email, hash, phone, admin) VALUES (?,?,?,?,?)";
        const insert_data = await db.query(insert_sql, [name, email, hash, phone, Boolean(admin)? 1 : 0]);
        if(!insert_data.insertId) return res.status(400).json({
            error:"register failed due to malformed request."
        });
        // console.log(insert_data);
        
        //invite of a contractor is successful, therefore:
        const email_data = await email_client.sendHtmlMail(email, {
            Header:"Welcome to the maintenance system!", //--------------------------------------------------------> Do something with this link <----------
            Body:"<p>You have been invited to the maintenance system as a User by a system administrator!\rLogin today at: </p> <a href='http://localhost:12345'> Maintenance.com </a>",
            Footer :"If you beleive this was a mistake, I suggest you disregard this email"
        });
        // console.log("email_data: ", email_data);

        return res.status(200).json({
            content:{
                registered_user: `${name} with email ${email}`,
                id: insert_data.insertId
            }
        });

    } catch (err) {
        console.log("err @ POST /admin/user  : ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
});

//destroy user; (de-activates user and anonymises personal data)
router.delete("/user/:id", async(req,res)=>{
    try {
        //id of authenticated user
        const userID = req.user.token.id;
        if(!userID) return res.status(400).json({
            error:"unable to retreive id, please re-authenticate"
        });
    
        //id of delete
        const {id} = req.params;
        if(!id) return res.status(400).json({
            error:"id not provided"
        });

        // two reasons behind this request.
        //  1. make sure that the user exist.
        //  2. using retreived userID to make sure that authenticated user isn't the id that is deleted.
        const find_sql = "SELECT userID  FROM Users WHERE userID = ?";
        const find_data = await db.query(find_sql, [id]);
        if(!find_data.length) return res.status(404).json({
            error:"no user found with the provided userID"
        });
        //making sure not to delete authenticated user.
        if(find_data[0].userID == userID) return res.status(403).json({
            error:"You cannot delete yourself bro!", userID: userID
        });

        const delete_sql = "UPDATE Users SET name ='***', email = '***', phone = '***', active_account=0 WHERE userID = ?";
        const delete_data = await db.query(delete_sql, [id]);
        // console.log(delete_data);

        if(!delete_data.changedRows) return res.status(400).json({
            error:"delete not necessary"
        })
        return res.status(200).json({
            content:{
                deleted: id
            }
        });

    } catch (err) {
        console.log("err @ DELETE /user/:id  : ", err);
        return res.status(500).json({
            error:"internal server error"
        })
    }
})
module.exports = router;
