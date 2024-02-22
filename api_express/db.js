const mysql = require("mysql2/promise");

/**
 * MySQL connectionPool ininitalized with {@link init()}
 * @type {mysql.Pool}
 */
let pool;

/**
 * init function that creates the connectionPool with pre-determined options, 
 * and tries using it, which throws an exception if the connection cannot be retreived.
 * @returns {Promise<true,false>} True, if the connectionPool is established and works; otherwise false.
 */
async function init(){
    return new Promise(async function(resolve,reject){
        try {
            pool = mysql.createPool({
                host:'localhost',
                user:'root',
                password: process.env.MYSQL_PASS || "",
                database:'maintenance',
                waitForConnections:'true',
                connectionLimit:10,
                maxIdle:10,
                idleTimeout:60000,
                queueLimit: 0,
                enableKeepAlive:true,
                keepAliveInitialDelay:0,
            });
            const testpool = await pool.getConnection();
            pool.releaseConnection(testpool);

            resolve(true);
        } catch (err) {
            console.log("err @ db.init() : ", err);

            reject(false);
        }
    })
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
module.exports = {init,query};