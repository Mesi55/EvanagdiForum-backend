
import pool from "../../config/database/db.js"
import JWT from "jsonwebtoken";
let OTP_confirming = (req, res) => {
  const { OTP, EncrypedEmail } = req.body;
  let emailDecoded = JWT.verify(EncrypedEmail, process.env.JWT_SECRET);
  let emailChecker = "SELECT user_email FROM registrations";
  let otpChecker = `SELECT user_OTP FROM registrations WHERE user_email = '${emailDecoded}'`;
console.log(`otpChecker`, otpChecker);
  pool.query(emailChecker, (err, result, fields) => {
    if (err) {
      // console.log(err);
    } else {
      if (result) {
        let EmailChecker = result.find((emails) => {
          return emails.user_email === emailDecoded;
        });
        if (EmailChecker === undefined) {
          return res.send({
            message: "This Email Is Not The Email Which OTP Is Sent To",
            redirect: "/",
            confirmation: "false",
            redirectMessage: "Click Here To Signup",
          });
        } else {
          pool.query(otpChecker, (err, otp_result, fields) => {
            if (err) {
              console.log(err);
            } else {
              if (otp_result[0].user_OTP === OTP) {
                return res.send({
                  message: "Both OTP are equal",
                  redirect: "/newPassword",
                  confirmation: "true",
                });
              } else {
                return res.send({
                  message: "The Code You Enter Is Wrong. Please Try Again",
                  redirect: "/login",
                  confirmation: "false",
                  redirectMessage: "Click Here For LogIn Page",
                });
              }
            }
          });
        }
      }
    }
  });
};

export default OTP_confirming;
