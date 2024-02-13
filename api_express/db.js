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

/* async function insert(table, object){
    return new Promise(async function(resolve, reject){
        const con = await pool.getConnection();

        object = {
            userID: 1,
            adress: "Vattugatan 8"
        }

        try {
            const sql = `INSERT INTO ${table} ${Object.keys(object).map(k=>k+",")} VALUES(${Object.keys(object).map(k=>"?")})`
            console.log(sql);
        } catch (err) {
            // pool.releaseConnection(con);
            return reject(err)
        }
    })
} */
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
            // pool.releaseConnection(con);
            return reject(err)
        }
    });

};









module.exports = {init, select, insertHouse};