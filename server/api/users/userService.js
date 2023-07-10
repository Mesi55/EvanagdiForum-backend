import pool from '../../../server/config/database/db.js';
export const register = (data, callback) => { 
    pool.query(`INSERT INTO registrations (user_name, user_email, user_password)VALUES(?,?,?)`,
        [
            data.userName, 
            data.email,
            data.password
        ],
        (err, result) => {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        }
    );
};
 
export const profile = (data, callback) => {
    pool.query(`INSERT INTO profiles (user_id, first_name,last_name)VALUES(?,?,?)`,
        [
            data.userId,
            data.firstName,
            data.lastName
        ],
        (err, result) => {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        }
    );
};

export const userId = (id, callback) => {

    pool.query(` SELECT registrations.user_id, user_name, user_email, first_name, last_name FROM registrations LEFT JOIN profiles ON registrations.user_id = profiles.user_id WHERE registrations.user_id = ?`, [id], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};

export const getUserByemailId = (email, callback) => { // Add 'callback' parameter
    pool.query(`SELECT * FROM registrations WHERE user_email = ?`, [email], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};

export const allUsers = (callback) => { // Add 'callback' parameter
    pool.query(`SELECT user_id, user_name, user_email FROM registrations`, [], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};
