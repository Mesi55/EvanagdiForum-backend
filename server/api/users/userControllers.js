import {register,userId,profile,allUsers,getUserByemailId} from "../users/userService.js";
import pool from "../../../server/config/database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv"
dotenv.config();

export const createUser = (req, res) => {
  const { userName, firstName, lastName, email, password } = req.body;
  if (!userName || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All information is not provided" });
  }
  if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password)) {
    return res
      .status(400)
      .json({
        message:
          "Password should contain at least 8 characters including uppercase, lowercase, and numeric characters",
          showAlert: true,
      });
  }
  pool.query(
    `SELECT * FROM registrations WHERE user_email = ?`,
    [email],
    (err, results) => {
      console.log(req.body);
      console.log(results);
      if (err) {
        console.log(err);
        return res.status(err).json({ message: "Database connection error" });
      }
      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "An account with this email already exists" ,showAlert: true });
      } else {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = {
          userName,
          firstName,
          lastName,
          email,
          password: hashedPassword,
        };
        register(user, (err, results) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ message: "Connection error for user" });
          }
          const userId = results.insertId; // Fetch the inserted 'user_id' value
          if (!userId) {
            return res
              .status(500)
              .json({ message: "Failed to get user ID after registration" });
          }
          const userProfile = { userId, userName, firstName, lastName, email };
          profile(userProfile, (err, results) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ message: "Failed to create user profile" });
            }
            console.log("form data is", userProfile);
            return res
              .status(200)
              .json({ message: "User registered successfully" });
          });
        });
      }
    }
  );
};

export const getUsers = (req, res) => {
  allUsers((err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database connection error" });
    }
    return res.status(200).json({ data: results });
  });
};

export const getUserbyId = (req, res) => {
  const id = req.params.id;
  console.log("id==", id, "user==", req.id);
  userId(req.id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "connection err try again" });
    }
    if (!results) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ data: results });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      message: "not all information provided please fill all",
    });

  getUserByemailId(email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "database error" });
    }

    if (!results) {
      return res
        .status(404)
        .json({ message: "no account found with this information" });
    }

    const isMatch = bcrypt.compareSync(password, results.user_password);

    if (!isMatch) {
      return res.status(404).json({ message: "Password or email is incorrect. Please try again" });
    }

    const token = jwt.sign({ id: results.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    return res.json({
      token,
      user: {
        id: results.user_id,
        display_name: results.user_name,
      },
      expires: tokenExpiration.toISOString(), // Send the token expiration time to the fron
    });
  });
};



//** forgotpassowrd uisng nodemailer */
export const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user with the given email exists
    pool.query(
      `SELECT * FROM registrations WHERE user_email = ?`,
      [email],
      async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        const user = results[0];

        // Generate a random password reset token and expiration date
        const token = crypto.randomBytes(20).toString("hex");
        const expires = Date.now() + 3600000;

        // Update the user's password reset token and expiration date
        pool.query(
          `UPDATE registrations SET user_password_reset_token = ?, user_password_reset_expires = ? WHERE user_id = ?`,
          [token, expires, user.user_id],
          async (err, results) => {
            if (err) throw err;
            // Generate a JWT token containing the user's ID
            const jwtToken = jwt.sign(
              { userId: user.user_id },
              process.env.JWT_SECRET,
              { expiresIn: "15m" }
            );

            // Send password reset email to the user
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
              },
            });

            const resetUrl = `http://${req.headers.host}/user/reset/${jwtToken}`;
            const mailOptions = {
              from: "example@gmail.com",
              to: user.user_email,
              subject: "Password reset request",
              text: `Hi ${user.user_name},
                You are receiving this email because you have requested a password reset for your account.
                Please click on the following link
                ${resetUrl}
                
                This link will expire in 15 mintues.
                If you did not request this, no action required`,
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                res.status(500).send({
                  message: "Error sending email",
                });
              } else {
                console.log("Email sent: " + info.response);
                res.status(200).send({
                  message: "Email sent",
                });
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Server error",
    });
  }
};
// //** reste passowrd  */
// Route for password reset form submission
export const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Verify the token and get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Check if the token is still valid
    pool.query(
      `SELECT * FROM registrations WHERE user_id = ? AND user_password_reset_token = ? AND user_password_reset_expires > ?`,
      [userId, token, Date.now()],
      async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
          return res.status(400).send({
            message: 'Invalid or expired token',
          });
        }

        // Update the user's password
        const user = results[0];
        // Implement your password update logic here
        // For example, you can use bcrypt to hash the new password and update it in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        pool.query(
          `UPDATE registrations SET user_password = ? WHERE user_id = ?`,
          [hashedPassword, userId],
          async (err, results) => {
            if (err) throw err;

            // Clear the password reset token and expiration date
            pool.query(
              `UPDATE registrations SET user_password_reset_token = NULL, user_password_reset_expires = NULL WHERE user_id = ?`,
              [userId],
              async (err, results) => {
                if (err) throw err;

                res.status(200).send({
                  message: 'Password reset successful',
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: 'Server error',
    });
  }
};
