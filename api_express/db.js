const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    database:'maintenance',
    waitForConnections:'true',
    connectionLimit:10,
    maxIdle:10,
    idleTimeout:60000,
    queueLimit: 0,
    enableKeepAlive:true,
    keepAliveInitialDelay:0,
});


async function init(){

    const con = pool.getConnection();

    pool.releaseConnection(con);

}

async function select(table, where=""){
    return new Promise(async function(resolve, reject){
        
        const con = await pool.getConnection();
        try {
            const sql = `SELECT * FROM ${table} ${where};`
            console.log("sql @ select: ", sql);
            const data = await con.query(sql);

            console.log("data @select: ", data);


            pool.releaseConnection(con)
            return resolve(data[0]);

        } catch (err) {
            pool.releaseConnection(con)
            return reject(err)
        }
    });
    
}

//#region house
async function insertHouse(house){
    return new Promise(async function(resolve, reject){
        const con = await pool.getConnection();
    

        try {
            const sql = inserter("houses", house);

            const data = await con.query(sql, [house.userID, house.address]);
            console.log(data[0]);
            pool.releaseConnection(con);

            return resolve(data[0].insertedId);

        } catch (err) {

            pool.releaseConnection(con);
            return reject(err)
        }
    });

};

async function deleteHouse(id){

   return new Promise(async function(resolve, reject){   
        const con = await pool.getConnection();

        try {
            const sql = "DELETE FROM Houses WHERE houseID = ?"
            const data = await con.query(sql, [id]);
            // console.log("data @deleteHouse : ", data);

            pool.releaseConnection(con);

            return resolve(data[0]);
        } catch (err) {
            
            pool.releaseConnection(con);

            return reject(err);
        }
   })
}


async function updateHouse(id, house){
    return new Promise(async function (resolve, reject){
        
        const con = await pool.getConnection();

        try {
            console.log("new: ", house);
            //getting old data: 
            const select_sql = "SELECT * FROM Houses where houseID = ?";
            const select_data = (await con.query(select_sql,[id]))[0];
            if(!select_data.length) return reject({
                error: "No house found with the provided id",
                id
            });
            old = select_data[0];
            console.log("old: ",old);
            
            const u= {
                houseID : old.houseID,
                userID : house.userID || old.userID,
                address : house.address || old.address,
                name: house.name || old.name,
                description: house.description || old.description,
            };


            console.log("updated:", u);
            const sql = "UPDATE houses SET userID = ?, address = ?, name = ?, description = ? WHERE houseID = ?";
            const data = await con.query(sql, [u.userID, u.address, u.name, u.description, u.houseID]);

            console.log(data);

            return resolve(data[0]);


        } catch (err) {
            // console.log("error @ dbUpdateHouse: ", err);
            pool.releaseConnection(con);
            return reject(err);
        }
        
    })
}
//#endregion

//#region tasks
async function insertTask(task){
    return new Promise(async function(resolve, reject){
        const con = await pool.getConnection();

        try {
            
            const sql = "INSERT INTO Tasks (houseID, description) VALUES( ?,?)";

            const data = await con.query(sql, [task.houseID, task.description]);
            console.log("data @ insertTask: ", data);

            return resolve(data[0]);



        } catch (err) {
            console.log("err @ insertTask", err);
            pool.releaseConnection(con);
            return reject(err)
        }

    })
}


//#endregion


function inserter(table, obj){
    return `INSERT INTO ${table} (${Object.keys(obj).join(' , ')}) VALUES (${Object.keys(obj).map(e=>'?').join(',')})`
}

function deleter(table, where){
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    return sql;
}
function updater(table, obj, where){
    const select_sql = `SELECT * FROM ${table} WHERE ${where} `
}
async function QueryBuilder(method, table, obj){

    let sql;
    switch (method.toLowerCase()){
        case 'insert':
            sql = inserter(table, obj)
            break;
        case 'delete':

            sql = deleter(table, where);
            break;
        
        case 'update': sql=updater(table,obj)

    }
}

/**
 * Fires a query to the MySQL database using a pre-written sql request with optional properties.
 * @param {*} sql The query to send, preferably a prepared statement, with a '?'
 * @param {*} props Optional properties to be provided when using prepared statements. 
 * @returns Data when the operation is successful, otherwhise an error.
 * 
 * @example
 * const h = { userId, address, description }
 * const data = await db.query("INSERT INTO Houses (userID, address, description) VALUES (?,?,?)", [h.userID, h.address, h.description])
 */
async function query(sql, props=false){
    return new Promise(async function(resolve, reject){   
        const con = await pool.getConnection();    
        try {
            
            const data = props? await con.query(sql, props) : await con.query(sql);

            pool.releaseConnection(con);

            return resolve(data[0]);
            
        } catch (err) {


            pool.releaseConnection(con);

            return reject(err);
            
        } 
        
        
    })
}
module.exports = {init,query, select, house:{ insert: insertHouse, delete: deleteHouse, update: updateHouse}, insertHouse, deleteHouse, updateHouse};