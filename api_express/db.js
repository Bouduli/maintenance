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

async function insertHouse(house){
    return new Promise(async function(resolve, reject){
        const con = await pool.getConnection();
    

        try {
            const sql = `INSERT INTO houses (userID, address) VALUES (?,?)`;

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
            
            //getting old data: 
            const select_sql = "SELECT * FROM Houses where houseID = ?";
            const select_data = (await con.query(select_sql,[id]))[0];
            if(!select_data.length) return reject({
                error: "No house found with the provided id",
                id
            });
            console.log(old);


            return resolve(select_data);


        } catch (err) {
            // console.log("error @ dbUpdateHouse: ", err);
            pool.releaseConnection(con);
            return reject(err);
        }
        
    })
}








module.exports = {init, select, insertHouse, deleteHouse, updateHouse};