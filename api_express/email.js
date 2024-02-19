// module.exports = {send}
const nodemailer = require("nodemailer");
require("dotenv").config();
//make sure that env variables are present in .env file, and that require("dotenv").config() is ran at startup.
const transporter = nodemailer.createTransport({

    service:"gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PW
    }
});




async function send(address){
    return new Promise(async function(resolve, reject){
        
        const headers = {
            from: process.env.EMAIL_USER,
            to: address,
            subject: "Test email",
            text: "This is a test email, testing functionality of the email functionality."
        };
    
        transporter.sendMail(headers, (err,info)=>{
            console.log("Err: ", err);
            console.log("info: ", info)
            if(err) return reject(err);
            if(info) return resolve(info);
        })


    })
}
/**
 * @param {string} email Recipient address
 * @param {Object} content Content object to be displayed in an email
 * @param {String} content.Header Header of the email, will be displayed email subject and HTTP body.
 * @param {String} content.Body Body of the email should be put in the email text field and in HTTP body.
 * @param {String} [content.Footer] Optional footer that will only be visible in HTTP mail.
 * @returns {Promise<err|info>} Promise containing either a successful email or an error, if something went wrong.
 */
async function sendHttpMail(email, content){
    return new Promise(function(resolve,reject){
        const html = 
        `<body><header><h1>${content.Header}</h1></header><main><p>${content.Body}</p></main>`
            + (content.Footer? `<footer><i>${content.Footer}</i></footer>` : "" )+ 
        "</body>";
        
        const headers = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: content.Header,
            text: content.Body,
            html
        };
        
        transporter.sendMail(headers, (err,info)=>{
            console.log("Err: ", err);
            console.log("info: ", info)
            if(err) return reject(err);
            if(info) return resolve(info);
        })

    })
}
//testing the email client. 
(async ()=>{
    let email = process.env.EMAIL_TEST_RECIPIENT;

    let content = {
        Header: "This is a html heading",
        Body: "This is my content (should be in body tag)",
        Footer: "This is an optional footer"
    };

    let data = await sendHttpMail(email,content);

    console.log(data);


})();
module.exports = {send}