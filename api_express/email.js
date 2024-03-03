// module.exports = {send}
const nodemailer = require("nodemailer");
//make sure that env variables are present in .env file, and that require("dotenv").config() is ran at startup.
const transporter = nodemailer.createTransport({

    service:"gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PW
    }
});


/**
 * Sends an regular text email, using the provided address and subject and text. 
 * @param {string} address Address which the mail will be sent to
 * @param {string} subject Subject header of the email
 * @param {string} text The actual text.
 * @returns {Promise<err|info>} Promise containing information for a successfully sent email, or an error for a incorrectly sent email
 */
async function send(address, subject, text){
    return new Promise(async function(resolve, reject){
        
        const headers = {
            from: process.env.EMAIL_USER,
            to: address,
            subject,
            text
        };
    
        transporter.sendMail(headers, (err,info)=>{
            if(err){
                console.log("Err @ email.sendMail() : ", err);
                return reject(err);
            } 
            if(info){
                // console.log("info: @ email.sendMail() : ", info)
                return resolve(info);
            }
        })


    })
}
/**
 * Sends an html-email, as requested by the content object, to the provided address
 * @param {string} address Recipient address
 * @param {Object} content Content object to be displayed in an email
 * @param {String} content.Header Header of the email, will be displayed email subject and HTTP body.
 * @param {String} content.Body Body of the email should be put in the email text field and in HTTP body.
 * @param {String} [content.Footer] Optional footer that will only be visible in HTTP mail.
 * @returns {Promise<err|info>} Promise containing either a successful email or an error, if something went wrong.
 */
async function sendHtmlMail(address, content){
    return new Promise(function(resolve,reject){

        //Kinda hardcoded html content for sending a message. 
        const html = 
        `<body><header><h1>${content.Header}</h1></header><main>${content.Body}</main>`
            + (content.Footer? `<footer><i>${content.Footer}</i></footer>` : "" )+ 
        "</body>";
        
        const headers = {
            from: process.env.EMAIL_USER,
            to: address,
            subject: content.Header,
            text: content.Body,
            html
        };
        
        transporter.sendMail(headers, (err,info)=>{
            if(err) {
                console.log("Err @ email.sendHtmlMail  : ", err);
                return reject(err);
            }
            if(info) {
                // console.log("info @ email.sendHtmlMail()  : ", info)
                return resolve(info);
            }
        })

    })
}
/* //testing the email client. 
(async ()=>{
    let email = process.env.EMAIL_TEST_RECIPIENT;

    let content = {
        Header: "This is a html heading",
        Body: "This is my content (should be in body tag)",
        Footer: "This is an optional footer"
    };

    let data = await sendHttpMail(email,content);

    console.log(data);


})(); */
module.exports = {send, sendHtmlMail}