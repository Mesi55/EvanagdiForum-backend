import pool from "../../config/database/db.js";  
import bcrypt from "bcrypt";                  
import JWT from "jsonwebtoken";
import  nodemailer from 'nodemailer'
let correctPassword = (req, res) => {
    const { user_email_for_Password } = req.body;
    console.log(req.body);
  
    let emailChecker = "SELECT user_email FROM registrations ";
    let forOTP = `UPDATE registrations SET user_OTP = (?)  WHERE user_email='${user_email_for_Password}'`;
  
 pool.query(emailChecker, (err, result, fields) => {
      if (err) {
        console.log(err);
      } else {
        if (result) {
          let emailFinder = result.find(
            (email) => email.user_email === user_email_for_Password
          );
          if (emailFinder == undefined) {
            res.send({
              message: "Email doesn't Exist",
              redirect: "/",
              confirmation: false,
              redirectMessage: "Click Here To Signup",
            });
          } else {
            function sendEmail() {
              let mailSender = nodemailer.createTransport({
                service: "gmail",
                port: 465,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD,
                },
              });
              function generateOTP() {
                let digits = "0123456789";
                let OTP = "";
                for (let i = 0; i < 4; i++) {
                  OTP += digits[Math.floor(Math.random() * 10)];
                }
                pool.query(forOTP, [OTP], (err, result, fields) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("OTP sent to DB");
                  }
                });
                return OTP;
              }
              let OTP = generateOTP();
              let details = {
                from: process.env.EMAIL,
                to: user_email_for_Password,
                subject: "Your Code for Changing Password",
                text: `Please Dont share this number, Your four digit number for Password Change is : ${OTP}`,
              };
              mailSender.sendMail(details, (err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("email sent");
                  console.log(OTP);
                }
              });
            }
            sendEmail();
  
            let emailEncrypted = JWT.sign(
              user_email_for_Password,
              process.env.JWT_SECRET
            );
  
            res.send({
              forThanking: `Please Check Your Email for OTP!`,
              Status: true,
              Encrypt: emailEncrypted,
              // email:user_email_for_Password,
              forHomePageReturn: `Click Here To Go Back To Home Page`,
            });
          }
        }
      }
    });
  };
  
  export default correctPassword;
  