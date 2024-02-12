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

async function find(q=""){
    return new Promise(async function(resolve, reject){
        
        const con = await pool.getConnection();
        try {
            const sql = "SELECT * FROM Houses";
            const data = con.query(sql);

            
            pool.releaseConnection(con)
            return resolve(data[0]);

        } catch (err) {
            pool.releaseConnection(con)
            return reject(err)
        }
    });
    
}

async function insert(table, object){
    return new Promise(async function(resolve, reject){
        const con = await pool.getConnection();

        try {
            const sql = "INSERT INTO ? ("

        } catch (err) {
            pool.releaseConnection(con);
            return reject(err)
        }
    })
}


class QueryBuilder{
    constructor(){
        this.type ="",
        this.table = "",
        this.values = "",
        this.where="",
        
    }
}

module.exports = {init, find};