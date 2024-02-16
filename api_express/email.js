// module.exports = {send}

const nodemailer = require("nodemailer");


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

module.exports = {send}